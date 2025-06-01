import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import mongoose from 'mongoose';

// Get all conversations for a user
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'name')
    .lean();

  res.json({
    success: true,
    data: conversations,
  });
});

// Get messages for a conversation
export const getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid conversation ID');
  }

  const conversation = await Conversation.findById(id);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  if (!conversation.participants.includes(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to access this conversation');
  }

  const messages = await Message.find({ conversationId: id })
    .populate('sender', 'name')
    .lean();

  res.json({
    success: true,
    data: messages,
  });
});

// Send a new message
export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content, sender } = req.body;

  if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(sender)) {
    res.status(400);
    throw new Error('Invalid conversation or sender ID');
  }

  if (sender !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to send as this user');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  if (!conversation.participants.includes(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to send in this conversation');
  }

  const message = await Message.create({
    conversationId,
    sender,
    content,
  });

  // Update last message in conversation
  conversation.lastMessage = {
    content,
    sender,
    createdAt: message.createdAt,
  };
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name')
    .lean();

  // Emit message via socket
  req.app.io.to(conversationId).emit('message', populatedMessage);

  res.json({
    success: true,
    data: populatedMessage,
  });
});