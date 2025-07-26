import express from "express";
import * as deliveryController from "../controllers/deliveryController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { protectDelivery, requireOnline } from "../middleware/deliveryAuthMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", deliveryController.loginDeliveryPersonnel);

// Admin routes (admin authentication required)
router.post("/register", protect, isAdmin, deliveryController.registerDeliveryPersonnel);
router.get("/all", protect, isAdmin, deliveryController.getAllDeliveryPersonnel);
router.get("/debug/orders", protect, isAdmin, deliveryController.getAllOrdersForDebug);
router.get("/debug/personnel", protect, isAdmin, deliveryController.getDeliveryPersonnelInfo);
router.put("/:personnelId/status", protect, isAdmin, deliveryController.updateDeliveryPersonnelStatus);

// Delivery personnel routes (delivery authentication required)
router.get("/dashboard", protectDelivery, deliveryController.getDeliveryDashboard);
router.put("/change-password", protectDelivery, deliveryController.changeDeliveryPassword);
router.put("/online", protectDelivery, deliveryController.goOnline);
router.put("/offline", protectDelivery, deliveryController.goOffline);
router.put("/location", protectDelivery, deliveryController.updateLocation);
router.put("/orders/:orderId/delivered", protectDelivery, requireOnline, deliveryController.markOrderAsDelivered);
router.put("/orders/:orderId/assign-to-self", protectDelivery, requireOnline, deliveryController.assignOrderToSelf);
router.post("/logout", protectDelivery, deliveryController.logoutDeliveryPersonnel);

export default router; 