import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import userModel from "../models/user.js";

const router = express.Router();

// Get all users (patients)
router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const users = await userModel
      .find({ isAdmin: { $ne: true } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

export default router;
