import express from "express";
import {
  loginDoctor,
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  getRecentDoctors,
  getDoctorById,
  getRelatedDoctors,
  getDoctorAppointments,
  getDoctorProfile,
  updateDoctorSchedule,
} from "../controllers/doctorcontroller.js";
import {
  verifyToken,
  verifyAdmin,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Doctor routes working" });
});

// Doctor authentication routes
router.post("/login", loginDoctor);

// Main routes - IMPORTANT: More specific routes must come before less specific ones
router.get("/all", verifyToken, getAllDoctors);
router.get("/profile", protect, getDoctorProfile);
router.get("/recent", getRecentDoctors); // Added this route if needed
router.get("/related/:specialty", getRelatedDoctors);
router.get("/appointments/:doctorId", protect, getDoctorAppointments);

// Schedule route MUST come before the general /:id route
router.put("/:id/schedule", verifyToken, updateDoctorSchedule);

// General doctor routes (these should come after specific routes)
router.get("/:id", getDoctorById);
router.put("/:id", verifyToken, updateDoctor);
router.delete("/:id", verifyToken, deleteDoctor);

export default router;