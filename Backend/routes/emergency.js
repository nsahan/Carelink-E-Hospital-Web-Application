const express = require("express");
const router = express.Router();
const emergencyController = require("../controllers/emergencyController");

// Get all emergencies
router.get("/all", emergencyController.getAllEmergencies);

// Create new emergency
router.post("/detect", emergencyController.createEmergency);

// Update emergency status
router.patch("/:id", emergencyController.updateEmergency);

module.exports = router;
