const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Get user's conversations
router.get("/conversations", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name email image")
      .populate("lastMessage");
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a conversation
router.get("/messages/:conversationId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    }).populate("sender", "name email image");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post("/messages", auth, async (req, res) => {
  try {
    const message = new Message({
      conversation: req.body.conversationId,
      sender: req.user._id,
      content: req.body.content,
    });
    await message.save();

    // Update last message in conversation
    await Conversation.findByIdAndUpdate(req.body.conversationId, {
      lastMessage: message._id,
    });

    await message.populate("sender", "name email image");
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
