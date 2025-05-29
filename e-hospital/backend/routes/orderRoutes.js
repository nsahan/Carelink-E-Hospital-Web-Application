const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createOrder,
  getUserOrders,
  updateOrderStatus,
  reorderPreviousOrder,
  getReorderHistory,
} = require("../controllers/orderController");

// Protected routes requiring authentication
router.use(auth);

// Get orders for authenticated user
router.get("/user/:userId", getUserOrders);

// Create new order
router.post("/", createOrder);

// Update order status
router.patch("/:orderId/status", updateOrderStatus);

// Reordering routes
router.post("/:orderId/reorder", reorderPreviousOrder);
router.get("/:orderId/reorder-history", getReorderHistory);

// Get order statistics
router.get("/stats", orderController.getOrderStats);

module.exports = router;
