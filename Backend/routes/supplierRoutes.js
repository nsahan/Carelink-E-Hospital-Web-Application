import express from "express";
import {
  getAllSuppliers,
  getActiveSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  permanentlyDeleteSupplier,
  notifySupplier,
  notifyAllSuppliers,
  getSupplierNotificationHistory,
  activateSupplier
} from "../controllers/supplierController.js";

const router = express.Router();

// Supplier CRUD routes
router.get("/suppliers", getAllSuppliers);
router.get("/suppliers/active", getActiveSuppliers);
router.get("/suppliers/:id", getSupplierById);
router.post("/suppliers", createSupplier);
router.put("/suppliers/:id", updateSupplier);
router.delete("/suppliers/:id", deleteSupplier);
router.put("/suppliers/:id/activate", activateSupplier);
router.delete("/suppliers/:id/permanent", permanentlyDeleteSupplier);

// Notification routes
router.post("/suppliers/:supplierId/notify", notifySupplier);
router.post("/suppliers/notify-all", notifyAllSuppliers);
router.get("/suppliers/:supplierId/notifications", getSupplierNotificationHistory);

export default router; 