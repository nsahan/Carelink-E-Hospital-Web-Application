import express from "express";
import {
  createAppointment,
  getDoctorAppointments,
  getUserAppointments,
  updateAppointmentStatus,
  getAllAppointments,
  cancelAppointment,
  getDoctorDashboardStats,
  getQueueInfo,
} from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Doctor routes
router.get("/doctor/:doctorId", protect, getDoctorAppointments);
router.get("/doctor/:doctorId/dashboard", protect, getDoctorDashboardStats);
router.put("/:id/status", protect, updateAppointmentStatus);

// User routes
router.post("/", protect, createAppointment);
router.get("/user/:userId", protect, getUserAppointments);
router.delete("/:id", protect, cancelAppointment);

// Admin routes
router.get("/all", protect, getAllAppointments);
router.get("/queue/:doctorId/:date", protect, getQueueInfo); // New queue route

export default router;
