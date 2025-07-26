import express from "express";
import * as settingsController from "../controllers/settingsController.js";

const router = express.Router();

router.get("/maintenance", settingsController.getMaintenance);
router.post("/maintenance", settingsController.setMaintenance);

// Add versioned API route for frontend compatibility
router.get("/v1/api/settings/maintenance", settingsController.getMaintenance);
router.post("/v1/api/settings/maintenance", settingsController.setMaintenance);

// Add /api/settings/maintenance for frontend compatibility
router.get("/api/settings/maintenance", settingsController.getMaintenance);
router.post("/api/settings/maintenance", settingsController.setMaintenance);

// Make sure this router is mounted at the root path in your main app file (e.g., app.js):
// Example:
// const settingsRoutes = require('./routes/settingsRoutes');
// app.use(settingsRoutes);
// or
// app.use('/', settingsRoutes);
// DO NOT use a prefix like app.use('/v1/api/settings', settingsRoutes);

export default router;
