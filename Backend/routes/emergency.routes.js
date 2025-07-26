import express from "express";
import {
  createEmergency,
  getAllEmergencies,
  getEmergencyById,
  updateEmergencyStatus,
  acknowledgeEmergency,
  completeEmergency, // NEW
  deleteEmergency,
  getEmergencyStats, // NEW
} from "../controllers/emergencyController.js";

const router = express.Router();

// Create new emergency
router.post("/create", createEmergency);

// Get all emergencies (with optional filtering)
router.get("/all", getAllEmergencies);

// Get emergency statistics
router.get("/stats", getEmergencyStats);

// Get emergency by ID
router.get("/:id", getEmergencyById);

// Update emergency status
router.put("/:id/status", updateEmergencyStatus);

// Acknowledge emergency
router.put("/:id/acknowledge", acknowledgeEmergency);

// Complete emergency - NEW ROUTE
router.put("/:id/complete", completeEmergency);

// Delete emergency
router.delete("/:id", deleteEmergency);

export default router;
