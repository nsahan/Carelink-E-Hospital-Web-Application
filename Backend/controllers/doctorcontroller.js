import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctor.js";
import hospitalPricingModel from "../models/hospitalPricing.js";

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: doctor._id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

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
    const doctors = await doctorModel.find({}, "-password");
    
    // Fetch hospital pricing for consultation fees
    const hospitalPricing = await hospitalPricingModel.find({ isActive: true });
    
    // Create a map of specialty to consultation fee
    const pricingMap = {};
    hospitalPricing.forEach(pricing => {
      pricingMap[pricing.specialty.toLowerCase()] = pricing.consultationFee;
    });
    
    // Update doctors with hospital pricing
    const doctorsWithPricing = doctors.map(doctor => {
      const specialtyLower = doctor.specialty.toLowerCase();
      const consultationFee = pricingMap[specialtyLower] || 0;
      
      return {
        ...doctor.toObject(),
        fees: consultationFee, // Override individual doctor fees with hospital pricing
      };
    });
    
    res.status(200).json(doctorsWithPricing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching doctors" });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

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
    const doctor = await doctorModel.findById(doctorId, "-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Fetch hospital pricing for this doctor's specialty
    const hospitalPricing = await hospitalPricingModel.findOne({ 
      specialty: { $regex: new RegExp(doctor.specialty, 'i') },
      isActive: true 
    });
    
    // Update doctor with hospital pricing
    const doctorWithPricing = {
      ...doctor.toObject(),
      fees: hospitalPricing ? hospitalPricing.consultationFee : 0,
    };

    res.status(200).json(doctorWithPricing);
  } catch (error) {
    console.error("Error fetching doctor by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getRelatedDoctors = async (req, res) => {
  try {
    const { specialty } = req.params;
    const doctors = await doctorModel
      .find({ specialty: new RegExp(specialty, 'i') }, "-password")
      .limit(5);
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching related doctors:", error);
    res.status(500).json({ message: "Error fetching related doctors" });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    // Assuming you have an Appointment model
    const appointments = await AppointmentModel.find({ doctorId });
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id; // From protect middleware
    const doctor = await doctorModel.findById(doctorId, "-password");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

const updateDoctorSchedule = async (req, res) => {
  try {
    console.log(`Received request to update schedule for doctor ID: ${req.params.id}`); // Debug log
    const { id } = req.params;
    const { availability, workingHours, maxAppointmentsPerDay, offDays } = req.body;

    // Validate request body
    if (!availability || !workingHours || !maxAppointmentsPerDay) {
      return res.status(400).json({
        success: false,
        message: 'Missing required schedule fields',
      });
    }

    // Update the doctor's schedule
    const doctor = await doctorModel.findByIdAndUpdate(
      id,
      {
        $set: {
          availability,
          workingHours,
          maxAppointmentsPerDay,
          offDays,
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error('Error updating doctor schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating doctor schedule',
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const doctorId = req.doctor._id; // Get ID from authenticated doctor

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    // Find the doctor
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, doctor.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    await doctorModel.findByIdAndUpdate(doctorId, {
      password: hashedNewPassword,
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message,
    });
  }
};

export {
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
  changePassword,
};