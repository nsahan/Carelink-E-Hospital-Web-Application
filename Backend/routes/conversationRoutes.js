import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getConversations, getMessages, sendMessage } from '../controllers/conversationController.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/messages/:id', protect, getMessages);
router.post('/messages', protect, sendMessage);

export default router;