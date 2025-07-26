import express from "express";
import {
  loginDoctor,
  getAllDoctors,
  deleteDoctor,
  updateDoctor,
  getRecentDoctors,
  getDoctorById, // Import this new controller
  updateDoctorSchedule,
  changePassword,
} from "../controllers/doctorcontroller.js";
import { verifyDoctorToken } from "../middleware/doctorAuthMiddleware.js";

const router = express.Router();

router.post("/login", loginDoctor);
router.get("/all", getAllDoctors);
router.delete("/:id", deleteDoctor);
router.put("/:id", updateDoctor);
router.get("/related/:specialty", getRecentDoctors);
router.get("/:id", getDoctorById); // Add this new route for fetching a single doctor
// Add this route for updating doctor schedule
router.put("/:id/schedule", updateDoctorSchedule);
// Add password change route with doctor authentication
router.put("/:id/change-password", verifyDoctorToken, changePassword);

export default router;
