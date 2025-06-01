import express from "express";
import * as orderController from "../controllers/OrderController.js";
import * as paymentController from "../controllers/PaymentController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// General routes first
router.get("/orders/all", orderController.getAllOrders);
router.post("/orders/test", orderController.createTestOrder);
router.post("/orders", asyncHandler(orderController.createOrder));
router.get("/orders/stats", orderController.getOrderStats);

// Specific routes with parameters last
router.get("/orders/:userId", orderController.getUserOrders);
router.put(
  "/orders/:orderId/status",
  protect,
  isAdmin,
  orderController.updateOrderStatus
);

// Analytics routes
router.get(
  "/sales-analytics",
  protect,
  isAdmin,
  orderController.getSalesAnalytics
);
router.get("/all", protect, isAdmin, orderController.getAllOrders);

// Add payment routes
router.post(
  "/orders/create-payment-intent",
  protect,
  paymentController.createPaymentIntent
);
router.post(
  "/create-payment-intent",
  protect,
  paymentController.createPaymentIntent
);

// Add new routes for order management
router.get("/my-orders", protect, orderController.getMyOrders);
router.put("/:orderId/received", protect, orderController.updateOrderReceived);
router.get("/user-orders", protect, orderController.getUserOrders);
router.put("/status/:orderId", protect, orderController.updateOrderStatus);

// Order routes
router.get("/user/:userId", orderController.getUserOrders);
router.post("/", orderController.createOrder);
router.get("/all", protect, orderController.getAllOrders);

// Error handler
router.use((error, req, res, next) => {
  console.error("Order Route Error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message,
  });
});

export default router;
