import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctor.js"; // Ensure this path is correct
import jwt from "jsonwebtoken";

const addDoctor = async (req, res) => {
  try {
    // Destructure the body and the uploaded image
    const {
      name,
      email,
      password,
      specialty,
      degree,
      experience,
      about,
      available,
      fees,
      address,
    } = req.body;
    const imagefile = req.file;

    // Validate if all fields are filled
    if (
      !name ||
      !email ||
      !password ||
      !specialty ||
      !degree ||
      !imagefile ||
      !experience ||
      !about ||
      !available ||
      !fees ||
      !address
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password length should be at least 6 characters" });
    }

    // Validate experience, fees, and available slots to ensure they are numbers
    if (isNaN(experience) || isNaN(fees) || isNaN(available)) {
      return res.status(400).json({
        message: "Experience, fees, and available slots must be valid numbers",
      });
    }

    // Validate degree, specialty, and about
    if (degree.length < 3 || specialty.length < 3 || about.length < 10) {
      return res.status(400).json({
        message: "Invalid length for degree, specialty, or about section",
      });
    }

    // Hash the password before saving it to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload the image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imagefile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    // Create a new doctor in the database
    const doctor = new doctorModel({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
      specialty,
      degree,
      experience,
      about,
      available,
      fees,
      address, // Directly use address if it's already a valid string
      date: Date.now(),
    });

    // Save the doctor to the database
    await doctor.save();

    // Send success response
    res.status(201).json({ message: "Doctor added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API for login, register, and other functionalities will be added here

const logAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Validate if email and password match admin credentials
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Generate JWT Token
      const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.status(200).json({
        message: "Admin logged in successfully",
        token,
        admin: { email, role: "admin" },
      });
    }

    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { addDoctor, logAdmin };

export default addDoctor;
