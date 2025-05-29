import express from "express";
import {
  loginDoctor,
  getAllDoctors,
  deleteDoctor,
  updateDoctor,
  getRecentDoctors,
  getDoctorById, // Import this new controller
} from "../controllers/doctorcontroller.js";

const router = express.Router();

router.post("/login", loginDoctor);
router.get("/all", getAllDoctors);
router.delete("/:id", deleteDoctor);
router.put("/:id", updateDoctor);
router.get("/related/:specialty", getRecentDoctors);
router.get("/:id", getDoctorById); // Add this new route for fetching a single doctor

export default router;
