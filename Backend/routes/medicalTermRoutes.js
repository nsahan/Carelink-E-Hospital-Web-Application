import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  getAllTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
} from "../controllers/medicalTermController.js";

const router = express.Router();

// Public routes
router.get("/", getAllTerms);
router.get("/:id", getTerm);

// Protected admin routes
router.post("/", protect, isAdmin, createTerm);
router.put("/:id", protect, isAdmin, updateTerm);
router.delete("/:id", protect, isAdmin, deleteTerm);

export default router;
