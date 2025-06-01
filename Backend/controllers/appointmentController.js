import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";
import User from "../models/user.js";
import { sendAppointmentConfirmation } from "../utils/emailService.js";

// Create new appointment
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const userId = req.user.id;

    // Get both doctor and user details for the email
    const [doctor, user] = await Promise.all([
      Doctor.findById(doctorId),
      User.findById(userId),
    ]);

    if (!doctor || doctor.available <= 0) {
      return res.status(400).json({
        message: "No appointments available for this doctor",
      });
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if appointment slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ message: "This time slot is already booked" });
    }

    // Check if user already has an appointment on the same day
    const userAppointmentOnSameDay = await Appointment.findOne({
      userId,
      date,
      status: { $ne: "cancelled" },
    });

    if (userAppointmentOnSameDay) {
      return res.status(400).json({
        message: "You already have an appointment scheduled for this day",
      });
    }

    const appointment = new Appointment({
      doctorId,
      userId,
      date,
      time,
      status: "pending",
    });

    const savedAppointment = await appointment.save();
    await Doctor.findByIdAndUpdate(doctorId, { $inc: { available: -1 } });

    // Send confirmation email
    try {
      await sendAppointmentConfirmation(user.email, {
        doctorName: doctor.name,
        date,
        time,
        location: doctor.location || "Main Hospital Branch",
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't return error response here, as appointment was still created successfully
    }

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: savedAppointment,
      availableSlots: doctor.available - 1,
    });
  } catch (error) {
    console.error("Appointment booking error:", error);
    res.status(500).json({ message: "Error booking appointment" });
  }
};

// Get appointments by doctor ID
const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    const appointments = await Appointment.find({ doctorId })
      .populate("userId", "name email phone")
      .sort({ date: -1, time: -1 });

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message,
    });
  }
};

// Get appointments by user ID
const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        data: [],
      });
    }

    const appointments = await Appointment.find({ userId })
      .populate({
        path: "doctorId",
        select: "name specialty image fees", // Select specific fields
        model: "Doctor",
      })
      .sort({ date: -1 });

    // Always return an array
    res.status(200).json({
      success: true,
      data: appointments || [],
    });
  } catch (error) {
    console.error("Error in getUserAppointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message,
      data: [], // Return empty array even on error
    });
  }
};

// Get all appointments (admin only)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("userId", "name email")
      .populate("doctorId", "name specialty")
      .sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("userId")
      .populate("doctorId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Send email confirmation if appointment is confirmed
    if (status === "confirmed") {
      await sendAppointmentConfirmation(appointment.userId.email, {
        doctorName: appointment.doctorId.name,
        date: appointment.date,
        time: appointment.time,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment status",
    });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if the user owns this appointment
    if (appointment.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this appointment" });
    }

    // Increment doctor's available slots
    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      $inc: { available: 1 },
    });

    // Delete the appointment
    await Appointment.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ message: "Error cancelling appointment" });
  }
};

// Get doctor dashboard stats
const getDoctorDashboardStats = async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    // Get today's start and end dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayAppointments,
      totalPatients,
      upcomingAppointments,
      completedAppointments,
    ] = await Promise.all([
      // Today's appointments
      Appointment.find({
        doctorId,
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      }).populate("userId", "name email phone"),

      // Total unique patients
      Appointment.distinct("userId", { doctorId }),

      // Upcoming appointments
      Appointment.find({
        doctorId,
        date: { $gt: today },
        status: "pending",
      }).countDocuments(),

      // Completed appointments
      Appointment.find({
        doctorId,
        status: "confirmed",
      }).countDocuments(),
    ]);

    const stats = {
      todayAppointments: todayAppointments.length,
      totalPatients: totalPatients.length,
      upcomingAppointments,
      completedAppointments,
    };

    res.status(200).json({
      success: true,
      stats,
      appointments: todayAppointments,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

// Export all controllers
export {
  createAppointment,
  getDoctorAppointments,
  getUserAppointments,
  updateAppointmentStatus,
  getAllAppointments,
  cancelAppointment,
  getDoctorDashboardStats,
};
