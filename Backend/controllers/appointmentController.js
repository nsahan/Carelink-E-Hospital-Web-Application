import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";
import User from "../models/user.js";
import { sendAppointmentConfirmation } from "../utils/emailService.js";
import mongoose from "mongoose";

// Helper function to calculate estimated time based on queue number
const calculateEstimatedTime = (queueNumber, doctorStartTime, consultationDuration = 30) => {
  const [hours, minutes] = doctorStartTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + (queueNumber - 1) * consultationDuration;
  const estimatedHours = Math.floor(totalMinutes / 60);
  const estimatedMinutes = totalMinutes % 60;
  return `${estimatedHours.toString().padStart(2, '0')}:${estimatedMinutes.toString().padStart(2, '0')}`;
};

// Create new appointment with queue system
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date } = req.body;
    const userId = req.user.id;

    const [doctor, user] = await Promise.all([
      Doctor.findById(doctorId),
      User.findById(userId),
    ]);

    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    // Get the next queue number for this doctor on this date
    const lastAppointment = await Appointment.findOne({
      doctorId,
      date,
      status: { $ne: "cancelled" },
    }).sort({ queueNumber: -1 });

    const queueNumber = lastAppointment ? lastAppointment.queueNumber + 1 : 1;

    // Calculate estimated time based on queue number
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const dayAvailability = doctor.availability?.find(day => day.day === dayOfWeek);
    
    if (!dayAvailability || !dayAvailability.isAvailable || !dayAvailability.timeSlots?.length) {
      return res.status(400).json({ message: "Doctor is not available on this date" });
    }

    // Use the first time slot's start time as the base time
    const baseStartTime = dayAvailability.timeSlots[0].startTime;
    const consultationDuration = 30; // 30 minutes per consultation
    const estimatedTime = calculateEstimatedTime(queueNumber, baseStartTime, consultationDuration);

    // Check if estimated time exceeds the last time slot
    const lastTimeSlot = dayAvailability.timeSlots[dayAvailability.timeSlots.length - 1];
    const [estimatedHours, estimatedMinutes] = estimatedTime.split(':').map(Number);
    const [lastEndHours, lastEndMinutes] = lastTimeSlot.endTime.split(':').map(Number);
    
    const estimatedTotalMinutes = estimatedHours * 60 + estimatedMinutes;
    const lastEndTotalMinutes = lastEndHours * 60 + lastEndMinutes;
    
    if (estimatedTotalMinutes >= lastEndTotalMinutes) {
      return res.status(400).json({ 
        message: "No more appointments available for this date. Please try another date." 
      });
    }

    const appointment = new Appointment({
      doctorId,
      userId,
      date,
      queueNumber,
      estimatedTime,
      status: "pending",
      consultationDuration,
    });

    const savedAppointment = await appointment.save();

    try {
      await sendAppointmentConfirmation(user.email, {
        doctorName: doctor.name,
        date,
        queueNumber,
        estimatedTime,
        location: doctor.address || "Main Hospital Branch",
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: savedAppointment,
      queueNumber,
      estimatedTime,
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
      .sort({ date: -1, queueNumber: 1 });

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

    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
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

    // Send appropriate email based on status
    try {
      if (status === "confirmed") {
        await sendAppointmentConfirmation(appointment.userId.email, {
          doctorName: appointment.doctorId.name,
          date: appointment.date,
          queueNumber: appointment.queueNumber,
          estimatedTime: appointment.estimatedTime,
          location: appointment.doctorId.location || "Main Hospital Branch",
        });
      } else if (status === "cancelled") {
        await sendAppointmentConfirmation(appointment.userId.email, {
          doctorName: appointment.doctorId.name,
          date: appointment.date,
          queueNumber: appointment.queueNumber,
          estimatedTime: appointment.estimatedTime,
          status: "cancelled",
          message:
            "Your appointment has been cancelled by the doctor. Please reschedule if needed.",
        });
      } else if (status === "completed") {
        await sendAppointmentConfirmation(appointment.userId.email, {
          doctorName: appointment.doctorId.name,
          date: appointment.date,
          queueNumber: appointment.queueNumber,
          estimatedTime: appointment.estimatedTime,
          status: "completed",
          message:
            "Thank you for visiting. Please rate your experience and book follow-up if needed.",
        });
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't return error as appointment status was still updated
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

    // Update appointment status to cancelled instead of deleting
    appointment.status = "cancelled";
    await appointment.save();

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

// Get queue information for a specific date
const getQueueInfo = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // Validate doctorId
    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Doctor ID",
      });
    }

    // Validate date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Get day availability
    const dayName = parsedDate.toLocaleDateString("en-US", { weekday: "long" });
    const dayAvailability = doctor.availability?.find(day => day.day === dayName);

    if (!dayAvailability || !dayAvailability.isAvailable) {
      return res.status(200).json({
        success: true,
        availableSlots: 0,
        totalBooked: 0,
        nextQueueNumber: 1,
        isAvailable: false,
      });
    }

    // Calculate total available slots for the day
    let totalAvailableSlots = 0;
    dayAvailability.timeSlots.forEach(slot => {
      if (slot.startTime && slot.endTime && slot.maxPatients) {
        totalAvailableSlots += slot.maxPatients;
      }
    });

    // Get booked appointments for the date
    const bookedAppointments = await Appointment.find({
      doctorId,
      date: parsedDate,
      status: { $ne: "cancelled" },
    }).sort({ queueNumber: 1 });

    const totalBooked = bookedAppointments.length;
    const nextQueueNumber = totalBooked + 1;
    const availableSlots = Math.max(0, totalAvailableSlots - totalBooked);

    res.status(200).json({
      success: true,
      availableSlots,
      totalBooked,
      nextQueueNumber,
      isAvailable: availableSlots > 0,
      bookedAppointments: bookedAppointments.map(apt => ({
        queueNumber: apt.queueNumber,
        status: apt.status,
      })),
    });
  } catch (error) {
    console.error("Error fetching queue info:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching queue information",
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
  getQueueInfo,
};

