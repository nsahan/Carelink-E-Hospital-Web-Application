import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Stats and analytics routes
router.get("/stats/orders", protect, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        total: 0,
        pending: 0,
        completed: 0,
        totalRevenue: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/stats/medicines", protect, async (req, res) => {
  try {
    const stats = await Medicine.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          lowStock: {
            $sum: {
              $cond: [{ $lte: ["$stock", "$reorderLevel"] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/notifications", protect, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
