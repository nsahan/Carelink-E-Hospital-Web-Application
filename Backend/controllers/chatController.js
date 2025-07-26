import asyncHandler from "express-async-handler";
import GroupChat from "../models/groupChat.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { v2 as cloudinary } from "cloudinary";
import { createReadStream } from "fs";
import { Readable } from "stream";
import mongoose from "mongoose";
import fs from "fs";
import userModel from "../models/user.js";

const uploadToCloudinary = async (file) => {
  try {
    if (!file) throw new Error("No file provided");

    console.log("File info:", {
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      hasData: !!file.buffer,
    });

    if (!file.path && !file.buffer) {
      throw new Error("Invalid file: No file path or buffer found");
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "chat_media",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      if (file.path) {
        createReadStream(file.path).pipe(uploadStream);
      } else if (file.buffer) {
        uploadStream.end(file.buffer);
      } else {
        reject(new Error("No valid file data found"));
      }
    });

    console.log("Upload successful:", {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
    });

    return result;
  } catch (error) {
    console.error("Upload to Cloudinary failed:", error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

const validateFile = (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size should be less than 5MB");
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/mp4",
    "audio/webm",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(
      "Invalid file type. Only images (JPEG, PNG, GIF, WebP) and audio files (MP3, WAV, OGG, MP4, WebM) are allowed"
    );
  }

  return true;
};

const validateMessage = (message) => {
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new Error("Message content cannot be empty");
  }

  if (message.length > 1000) {
    throw new Error("Message is too long. Maximum length is 1000 characters");
  }

  return true;
};

const validateObjectId = (id, fieldName = "ID") => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  return true;
};

export const getGroupMessages = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 50 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    console.log("Fetching group messages for user:", userId);

    const [messages, total] = await Promise.all([
      GroupChat.find({ isDeleted: { $ne: true } })
        .populate("sender", "name email image")
        .populate("readBy", "name")
        .populate({
          path: "replyTo",
          populate: { path: "sender", select: "name email image" },
          match: { isDeleted: { $ne: true } },
        })
        .populate("reactions.user", "name email image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      GroupChat.countDocuments({ isDeleted: { $ne: true } }),
    ]);

    const unreadMessageIds = messages
      .filter(
        (m) =>
          !m.readBy.some(
            (reader) => reader._id.toString() === userId.toString()
          )
      )
      .map((m) => m._id);

    if (unreadMessageIds.length > 0) {
      await GroupChat.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $addToSet: { readBy: userId } }
      );
    }

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        page: pageNum,
        limit: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching group messages",
    });
  }
});

export const sendGroupMessage = asyncHandler(async (req, res) => {
  try {
    const sender = req.user;
    if (!sender || !sender._id) {
      console.error("sendGroupMessage: req.user missing or invalid", req.user);
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let messageData = {
      sender: sender._id,
      senderRole: sender.role || "user",
      readBy: [sender._id],
      reactions: [],
    };

    console.log("Sending group message:", {
      senderId: sender._id,
      hasFile: !!req.file,
      hasMessage: !!req.body.message,
      body: req.body,
      file: req.file,
    });

    const hasFile = req.file;
    const hasMessage = req.body.message && req.body.message.trim();

    if (!hasFile && !hasMessage) {
      return res.status(400).json({
        success: false,
        message: "No message content or file provided",
      });
    }

    if (hasFile) {
      try {
        validateFile(req.file);
        const result = await uploadToCloudinary(req.file);

        messageData = {
          ...messageData,
          messageType: req.file.mimetype.startsWith("image/")
            ? "image"
            : "voice",
          mediaUrl: result.secure_url,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          message: req.file.mimetype.startsWith("image/")
            ? `Image: ${req.file.originalname}`
            : "Voice message",
        };

        if (req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error("Error deleting temporary file:", unlinkError);
          }
        }
      } catch (error) {
        console.error("File upload error:", error);
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error("Error deleting temporary file:", unlinkError);
          }
        }
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    } else if (hasMessage) {
      try {
        validateMessage(req.body.message);
        messageData = {
          ...messageData,
          messageType: "text",
          message: req.body.message.trim(),
        };
      } catch (error) {
        console.error("Message validation error:", error);
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    if (req.body.replyTo) {
      try {
        validateObjectId(req.body.replyTo, "Reply message ID");
        const replyMessage = await GroupChat.findById(req.body.replyTo);
        if (replyMessage && !replyMessage.isDeleted) {
          messageData.replyTo = replyMessage._id;
        }
      } catch (error) {
        console.error("Reply validation error:", error);
      }
    }

    const message = new GroupChat(messageData);
    await message.save();

    await message.populate([
      { path: "sender", select: "name image role" },
      { path: "replyTo", populate: { path: "sender", select: "name image" } },
    ]);

    if (req.app && req.app.io) {
      req.app.io.emit("groupMessage", message);
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error sending group message:", error, error?.stack);
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError);
      }
    }
    res.status(500).json({
      success: false,
      message: error.message || "Error sending message",
    });
  }
});

export const deleteGroupMessage = asyncHandler(async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    validateObjectId(messageId, "Message ID");

    const message = await GroupChat.findById(messageId).populate(
      "sender",
      "_id"
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Message is already deleted",
      });
    }

    const senderId = message.sender._id || message.sender;
    if (senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    const twoDays = 2 * 24 * 60 * 60 * 1000;
    const messageAge = Date.now() - new Date(message.createdAt).getTime();

    if (messageAge > twoDays) {
      return res.status(403).json({
        success: false,
        message: "Messages can only be deleted within 2 days of sending",
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    if (message.mediaUrl) {
      try {
        const urlParts = message.mediaUrl.split("/");
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split(".")[0];
        await cloudinary.uploader.destroy(`chat_media/${publicId}`);
      } catch (error) {
        console.error("Error deleting media:", error);
      }
    }

    if (req.app && req.app.io) {
      req.app.io.emit("messageDeleted", {
        messageId,
        conversationId: "group",
        deletedAt: message.deletedAt,
      });
    }

    return res.json({
      success: true,
      message: "Message deleted successfully",
      data: {
        messageId,
        isDeleted: true,
        deletedAt: message.deletedAt,
      },
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting message",
    });
  }
});

export const addReaction = asyncHandler(async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    validateObjectId(messageId, "Message ID");

    if (!emoji || typeof emoji !== "string" || emoji.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Emoji is required",
      });
    }

    const message = await GroupChat.findById(messageId);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (!message.reactions) {
      message.reactions = [];
    }

    message.reactions = message.reactions.filter(
      (reaction) => reaction.user.toString() !== userId.toString()
    );

    message.reactions.push({
      user: userId,
      emoji: emoji.trim(),
    });

    await message.save();

    const updatedMessage = await GroupChat.findById(messageId)
      .populate("sender", "name email image")
      .populate("reactions.user", "name email image");

    if (req.app && req.app.io) {
      req.app.io.emit("messageReaction", {
        messageId,
        reactions: updatedMessage.reactions,
      });
    }

    res.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error adding reaction",
    });
  }
});

export const getConversations = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "name image")
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching conversations",
    });
  }
});

export const getMessages = asyncHandler(async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user._id;

    validateObjectId(conversationId, "Conversation ID");

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or you are not a participant",
      });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "name image")
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching messages",
    });
  }
});

export const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;

    if (conversationId) {
      validateObjectId(conversationId, "Conversation ID");
    }

    validateMessage(content);

    const messageData = {
      conversationId,
      sender: senderId,
      content: content.trim(),
    };

    const newMessage = await Message.create(messageData);

    if (conversationId) {
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          content: content.trim(),
          sender: senderId,
          createdAt: new Date(),
        },
        updatedAt: Date.now(),
      });
    }

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name image"
    );

    if (req.app && req.app.io && conversationId) {
      req.app.io.to(conversationId).emit("message", populatedMessage);
    }

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error sending message",
    });
  }
});

export const getUserProfile = (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  console.log("Raw req.user in getUserProfile:", req.user);

  // Defensive checks with more detailed logging
  if (!req.user._id) {
    console.error("User _id is missing:", req.user);
    return res.status(500).json({
      success: false,
      message: "User profile is missing critical information (_id)",
    });
  }

  if (!req.user.name) {
    console.error("User name is missing:", req.user);
    return res.status(500).json({
      success: false,
      message: "User profile is missing critical information (name)",
    });
  }

  // Safely return user profile with default values
  const safeUser = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email || '',
    image: req.user.image || '',
    role: req.user.role || 'user',
    phone: req.user.phone || '',
    address: req.user.address || '',
  };

  res.json({ 
    success: true, 
    data: safeUser 
  });
};
