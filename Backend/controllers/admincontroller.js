import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctor.js";
import jwt from "jsonwebtoken";
import { sendDoctorRegistrationEmail } from "../utils/emailService.js";
import crypto from "crypto";

const generateTemporaryPassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

const addDoctor = async (req, res) => {
  try {
    // Destructure the body and the uploaded image
    const {
      name,
      email,
      specialty,
      degree,
      experience,
      about,
      address,
      workingHours,
      availability,
      offDays,
      maxAppointmentsPerDay,
    } = req.body;

    const imagefile = req.file;

    // Validate if all required fields are filled
    if (
      !name ||
      !email ||
      !specialty ||
      !degree ||
      !imagefile ||
      !experience ||
      !about ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate numeric fields
    if (isNaN(Number(experience)) || Number(experience) < 0) {
      return res.status(400).json({
        success: false,
        message: "Experience must be a valid positive number",
      });
    }

    // Validate text field lengths
    if (degree.length < 2 || specialty.length < 2 || about.length < 10) {
      return res.status(400).json({
        success: false,
        message:
          "Degree and specialty must be at least 2 characters, about section must be at least 10 characters",
      });
    }

    // Check if doctor with this email already exists
    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Hash the temporary password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    // Upload image to Cloudinary
    let imageUrl = "";
    try {
      const imageUpload = await cloudinary.uploader.upload(imagefile.path, {
        resource_type: "image",
        folder: "doctors", 
        transformation: [
          { width: 400, height: 400, crop: "fill" },
          { quality: "auto" },
        ],
      });
      imageUrl = imageUpload.secure_url;
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }

    // Parse JSON fields if they exist
    let parsedWorkingHours = { start: "09:00", end: "17:00" };
    let parsedAvailability = [
      { day: "Monday", isAvailable: true, timeSlots: [] },
      { day: "Tuesday", isAvailable: true, timeSlots: [] },
      { day: "Wednesday", isAvailable: true, timeSlots: [] },
      { day: "Thursday", isAvailable: true, timeSlots: [] },
      { day: "Friday", isAvailable: true, timeSlots: [] },
      { day: "Saturday", isAvailable: false, timeSlots: [] },
      { day: "Sunday", isAvailable: false, timeSlots: [] },
    ];
    let parsedOffDays = [];

    try {
      if (workingHours) {
        parsedWorkingHours = JSON.parse(workingHours);
      }
      if (availability) {
        parsedAvailability = JSON.parse(availability);
      }
      if (offDays) {
        parsedOffDays = JSON.parse(offDays);
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in schedule data",
      });
    }

    // Create new doctor document
    const doctorData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      image: imageUrl,
      specialty: specialty.trim(),
      degree: degree.trim(),
      experience: Number(experience),
      about: about.trim(),
      fees: 0, // Default value - fees will be managed by hospital
      address: address.trim(),
      workingHours: parsedWorkingHours,
      availability: parsedAvailability,
      offDays: parsedOffDays,
      maxAppointmentsPerDay: maxAppointmentsPerDay
        ? Number(maxAppointmentsPerDay)
        : 20,
      date: new Date(),
      slots_booked: {},
    };

    // Create and save the doctor
    const doctor = new doctorModel(doctorData);
    await doctor.save();

    // Send registration email with temporary password
    try {
      await sendDoctorRegistrationEmail(email, temporaryPassword);
    } catch (emailError) {
      console.error("Failed to send registration email:", emailError);
      // We'll still return a success response since the doctor was created
    }

    // Send success response
    res.status(201).json({
      success: true,
      message: "Doctor added successfully. Registration email sent.",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
      },
    });
  } catch (error) {
    console.error("Add doctor error:", error);

    // Handle specific mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error: " + messages.join(", "),
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while adding doctor",
    });
  }
};

const logAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Validate admin credentials
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Generate JWT Token
      const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      return res.status(200).json({
        success: true,
        message: "Admin logged in successfully",
        token,
        admin: { email, role: "admin" },
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { addDoctor, logAdmin };
