// Enhanced Emergency Controller with additional functionality
import Emergency from "../models/Emergency.js";

// Create new emergency
export const createEmergency = async (req, res) => {
  try {
    const emergency = new Emergency({
      patientName: req.body.patientName,
      location: req.body.location,
      message: req.body.message,
      status: req.body.status || "CRITICAL",
      contactNumber: req.body.contactNumber,
      timestamp: new Date(),
      acknowledged: false,
      completed: false,
    });

    const savedEmergency = await emergency.save();

    // Emit through socket if available
    if (req.app.io) {
      req.app.io.emit("newEmergency", savedEmergency);
    }

    res.status(201).json({
      success: true,
      data: savedEmergency,
      message: "Emergency created successfully",
    });
  } catch (error) {
    console.error("Error creating emergency:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all emergencies with filtering
export const getAllEmergencies = async (req, res) => {
  try {
    const { status, limit = 100, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const emergencies = await Emergency.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Emergency.countDocuments(query);

    res.status(200).json({
      success: true,
      emergencies: emergencies,
      count: emergencies.length,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching emergencies:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      emergencies: [],
    });
  }
};

// Get emergency by ID
export const getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    res.status(200).json({
      success: true,
      data: emergency,
    });
  } catch (error) {
    console.error("Error fetching emergency:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update emergency status
export const updateEmergencyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["NEW", "ACTIVE", "CRITICAL", "RESOLVED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Valid statuses are: " + validStatuses.join(", "),
      });
    }

    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    // Emit through socket if available
    if (req.app.io) {
      req.app.io.emit("emergencyUpdated", emergency);
    }

    res.status(200).json({
      success: true,
      data: emergency,
      message: "Emergency status updated successfully",
    });
  } catch (error) {
    console.error("Error updating emergency status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Acknowledge emergency
export const acknowledgeEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        acknowledged: true,
        acknowledgedAt: new Date(),
        status: "ACTIVE",
      },
      { new: true, runValidators: true }
    );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    // Emit through socket if available
    if (req.app.io) {
      req.app.io.emit("emergencyAcknowledged", emergency);
    }

    res.status(200).json({
      success: true,
      data: emergency,
      message: "Emergency acknowledged successfully",
    });
  } catch (error) {
    console.error("Error acknowledging emergency:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Complete emergency - NEW FUNCTION
export const completeEmergency = async (req, res) => {
  try {
    const { notes } = req.body; // Optional completion notes

    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        completed: true,
        completedAt: new Date(),
        status: "RESOLVED",
        completionNotes: notes || "",
      },
      { new: true, runValidators: true }
    );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    // Emit through socket if available
    if (req.app.io) {
      req.app.io.emit("emergencyCompleted", emergency);
    }

    res.status(200).json({
      success: true,
      data: emergency,
      message: "Emergency completed successfully",
    });
  } catch (error) {
    console.error("Error completing emergency:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete emergency
export const deleteEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndDelete(req.params.id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    // Emit through socket if available
    if (req.app.io) {
      req.app.io.emit("emergencyDeleted", { id: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: "Emergency deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting emergency:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get emergency statistics - NEW FUNCTION
export const getEmergencyStats = async (req, res) => {
  try {
    const stats = await Emergency.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalEmergencies = await Emergency.countDocuments();
    const todayEmergencies = await Emergency.countDocuments({
      timestamp: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        totalEmergencies,
        todayEmergencies,
      },
    });
  } catch (error) {
    console.error("Error fetching emergency stats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
