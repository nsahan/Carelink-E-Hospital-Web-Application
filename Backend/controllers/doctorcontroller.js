import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctor.js";

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find doctor by email
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: doctor._id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Remove password from doctor object
    const doctorInfo = {
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialty: doctor.specialty,
      image: doctor.image,
    };

    res.status(200).json({
      success: true,
      token,
      doctor: doctorInfo,
    });
  } catch (error) {
    console.error("Doctor login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}, "-password"); // Exclude password field
    res.status(200).json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching doctors" });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove password from updates if it exists
    delete updates.password;

    const doctor = await doctorModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating doctor" });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await doctorModel.findByIdAndDelete(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting doctor" });
  }
};

const getRecentDoctors = async (req, res) => {
  try {
    const recentDoctors = await doctorModel
      .find({}, "-password")
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json(recentDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching recent doctors" });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await doctorModel.findById(doctorId, "-password"); // Also exclude password for security

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateAvailableSlots = async (doctorId, decrease = true) => {
  try {
    const doctor = await doctorModel.findById(doctorId);
    if (doctor && doctor.available > 0) {
      doctor.available = decrease ? doctor.available - 1 : doctor.available + 1;
      await doctor.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating slots:", error);
    return false;
  }
};

export {
  loginDoctor,
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  getRecentDoctors,
  getDoctorById,
  updateAvailableSlots,
};
