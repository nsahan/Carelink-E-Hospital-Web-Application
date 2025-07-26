import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  generateBusinessReport,
  generateInventoryReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.post(
  "/admin/reports/business",
  protect,
  isAdmin,
  generateBusinessReport
);
router.get(
  "/admin/reports/inventory",
  protect,
  isAdmin,
  generateInventoryReport
);

export default router;
