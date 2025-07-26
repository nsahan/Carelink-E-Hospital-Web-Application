import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Enhanced validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Check existing user
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle image upload
    let imageUrl = req.file ? undefined : process.env.DEFAULT_USER_IMAGE;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "users",
        width: 150,
        crop: "scale",
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Create user
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Enhanced validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const user = await userModel
      .findByIdAndUpdate(userId, { $set: updateData }, { new: true })
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

const updateUserImage = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "users",
      width: 150,
      crop: "scale",
    });

    fs.unlinkSync(req.file.path);

    const user = await userModel
      .findByIdAndUpdate(
        userId,
        { $set: { image: result.secure_url } },
        { new: true }
      )
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: {
        image: result.secure_url,
      },
    });
  } catch (error) {
    console.error("Image update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile image",
      error: error.message,
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { name, email, picture } = req.body;

    let user = await userModel.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await userModel.create({
        name,
        email,
        image: picture,
        password: Math.random().toString(36).slice(-8), // Random password for Google users
        isGoogleUser: true,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      success: true,
      message: "Google authentication successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
      error: error.message,
    });
  }
};

const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await appointmentModel
      .find({ userId })
      .populate("doctorId", "name image specialty")
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    // Validate that req.user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. User not found."
      });
    }

    // Fetch full user profile to ensure all details are present
    const fullUserProfile = await userModel.findById(req.user._id).select("-password");

    // Additional validation
    if (!fullUserProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found"
      });
    }

    // Construct comprehensive user profile
    const userProfile = {
      _id: fullUserProfile._id,
      name: fullUserProfile.name || '',
      email: fullUserProfile.email || '',
      image: fullUserProfile.image || '',
      role: fullUserProfile.role || 'user',
      phone: fullUserProfile.phone || '',
      address: fullUserProfile.address || '',
      blood_group: fullUserProfile.blood_group || 'Not Selected',
      height: fullUserProfile.height || 0,
      weight: fullUserProfile.weight || 0
    };

    // Extensive logging for debugging
    console.log("Full user profile retrieved:", {
      userId: userProfile._id,
      name: userProfile.name,
      email: userProfile.email,
      hasImage: !!userProfile.image,
      role: userProfile.role
    });

    // Validate required fields
    const requiredFields = ['_id', 'name', 'email'];
    const missingFields = requiredFields.filter(field => !userProfile[field]);

    if (missingFields.length > 0) {
      console.error("Missing required user fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Incomplete user profile. Missing fields: ${missingFields.join(', ')}`
      });
    }

    res.status(200).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving user profile",
      error: error.message
    });
  }
};

export {
  registerUser,
  loginUser,
  updateUser,
  updateUserImage,
  googleAuth,
  getUserAppointments,
  getAllUsers, // Add this export
  getUserProfile,
};
