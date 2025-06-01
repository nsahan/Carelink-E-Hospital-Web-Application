import express from "express";
import * as orderController from "../controllers/OrderController.js";
import * as paymentController from "../controllers/PaymentController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// General routes
router.post("/", protect, orderController.createOrder);
router.get("/all", protect, isAdmin, orderController.getAllOrders);
router.get("/stats", protect, isAdmin, orderController.getOrderStats);
router.get(
  "/sales-analytics",
  protect,
  isAdmin,
  orderController.getSalesAnalytics
);
router.get("/billing-stats", protect, isAdmin, orderController.getBillingStats);
router.post("/test", orderController.createTestOrder);

// User-specific routes
router.get("/user/:userId", protect, orderController.getUserOrders);
router.get("/my-orders", protect, orderController.getMyOrders);

// Order-specific routes
router.put(
  "/:orderId/status",
  protect,
  isAdmin,
  orderController.updateOrderStatus
);
router.put("/:orderId/received", protect, orderController.updateOrderReceived);
router.delete("/:orderId", protect, isAdmin, orderController.deleteOrder);

// Payment routes
router.post(
  "/create-payment-intent",
  protect,
  paymentController.createPaymentIntent
);

export default router;
