import express from "express";
import {
  protect,
  isAdmin,
  protectWithUser,
} from "../middleware/authMiddleware.js";
import userModel from "../models/user.js";
import { generateBusinessReport } from "../controllers/reportController.js";

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

// Report generation route (no auth required)
router.post("/reports/business", generateBusinessReport);

export default router;
