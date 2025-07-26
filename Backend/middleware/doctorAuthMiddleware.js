import jwt from "jsonwebtoken";
import doctorModel from "../models/doctor.js";

export const verifyDoctorToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the token belongs to a doctor
    if (decoded.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Doctor privileges required.",
      });
    }

    // Find the doctor by ID from the token
    const doctor = await doctorModel.findById(decoded.id).select("-password");
    
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Doctor not found. Invalid authentication token.",
      });
    }

    req.doctor = doctor;
    req.user = decoded; // Keep the original decoded token for backward compatibility
    next();
  } catch (error) {
    console.error("Doctor auth middleware error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}; 