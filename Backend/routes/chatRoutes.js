import express from "express";
import { protect, protectWithUser } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getConversations,
  getMessages,
  sendMessage,
  getGroupMessages,
  sendGroupMessage,
  deleteGroupMessage,
  addReaction,
  getUserProfile,
} from "../controllers/chatController.js";

const router = express.Router();

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      });
    }
    next();
  };
};

router.get("/conversations", protectWithUser, getConversations);
router.get(
  "/messages/:id",
  protectWithUser,
  validateObjectId("id"),
  getMessages
);
router.post("/messages", protectWithUser, sendMessage);
router.get("/group", protectWithUser, getGroupMessages);
router.post("/group", protectWithUser, upload.single("file"), sendGroupMessage);
router.delete(
  "/group/:messageId",
  protectWithUser,
  validateObjectId("messageId"),
  deleteGroupMessage
);
router.post(
  "/group/:messageId/reaction",
  protectWithUser,
  validateObjectId("messageId"),
  addReaction
);
router.get("/users/profile", protectWithUser, getUserProfile);

export default router;