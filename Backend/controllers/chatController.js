import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    }).populate("participants", "name email image");

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).populate("sender", "name email image");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const newMessage = await Message.create({
      conversationId,
      sender: req.user._id,
      senderModel: req.user.role === "doctor" ? "Doctor" : "User",
      content,
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastMessageTime: new Date(),
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name email image"
    );

    // Emit to socket if available
    if (req.app.io) {
      req.app.io.to(conversationId).emit("message", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
};
