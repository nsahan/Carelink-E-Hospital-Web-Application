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

// Main routes
router.get("/all", verifyToken, getAllDoctors);
router.put("/:id", verifyToken, updateDoctor);
router.delete("/:id", verifyToken, deleteDoctor);
router.get("/:id", getDoctorById);
router.get("/related/:specialty", getRelatedDoctors);
router.get("/appointments/:doctorId", protect, getDoctorAppointments);
router.get("/profile", protect, getDoctorProfile);

export default router;
