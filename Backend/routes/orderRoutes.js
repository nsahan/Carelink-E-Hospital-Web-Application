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
router.get("/user-orders", protect, orderController.getUserOrders);
router.put("/status/:orderId", protect, orderController.updateOrderStatus);

// Tracking routes
router.get("/tracking/:orderId", protect, orderController.getOrderTracking);
router.put(
  "/tracking/:orderId",
  protect,
  isAdmin,
  orderController.updateOrderTracking
);

// Order routes
router.get("/user/:userId", orderController.getUserOrders);
router.post("/", orderController.createOrder);
router.get("/all", protect, orderController.getAllOrders);

// Update the delete route path and move it before other routes to avoid conflicts
router.delete("/orders/:id", protect, isAdmin, orderController.deleteOrder);

// Delivery service routes
router.put(
  "/orders/:orderId/assign-delivery",
  protect,
  isAdmin,
  orderController.assignDeliveryPersonnel
);

router.put(
  "/orders/:orderId/assign-to-delivery",
  protect,
  isAdmin,
  orderController.assignOrderToDelivery
);

router.put(
  "/orders/:orderId/delivery-status",
  protect,
  isAdmin,
  orderController.updateDeliveryStatus
);

router.get(
  "/orders/:orderId/delivery-info",
  protect,
  orderController.getDeliveryInfo
);

// Updated medicine report route with correct path
router.get(
  "/medicine-report",
  protect,
  isAdmin,
  orderController.generateMedicineReport
);

// Add order cancellation route (fix path for correct API prefix usage)
// If your main app.js has: app.use('/v1/api', orderRoutes)
// then this route should be just "/orders/cancel/:orderId"
// If your main app.js has: app.use(orderRoutes)
// then this route should be "/v1/api/orders/cancel/:orderId"

// To support both, add both routes:
router.put(
  "/orders/cancel/:orderId",
  protect,
  (req, res, next) => {
    console.log("Order Cancellation Route Hit");
    console.log("Order ID:", req.params.orderId);
    console.log("User:", req.user);
    next();
  },
  orderController.cancelOrder
);

// IMPORTANT: Only ONE of these routes will match depending on your app.js prefix.
// If your app.js has: app.use('/v1/api', orderRoutes)
//   then this route should be just "/orders/cancel/:orderId"
// If your app.js has: app.use(orderRoutes)
//   then this route should be "/v1/api/orders/cancel/:orderId"
// Remove the one that does NOT match your app.js setup.

// --- Most common: ---
router.put(
  "/orders/cancel/:orderId",
  protect,
  (req, res, next) => {
    console.log("Order Cancellation Route Hit");
    console.log("Order ID:", req.params.orderId);
    console.log("User:", req.user);
    next();
  },
  orderController.cancelOrder
);

// --- Remove this if you use app.use('/v1/api', orderRoutes) in app.js ---
// router.put(
//   "/v1/api/orders/cancel/:orderId",
//   protect,
//   (req, res, next) => {
//     console.log("Order Cancellation Route Hit (v1/api)");
//     console.log("Order ID:", req.params.orderId);
//     console.log("User:", req.user);
//     next();
//   },
//   orderController.cancelOrder
// );

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
