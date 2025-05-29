import express from "express";
import { createEmergency } from "../controllers/emergencyController.js";

const router = express.Router();

router.post("/create", createEmergency);
// Add more routes as needed...

export default router;
