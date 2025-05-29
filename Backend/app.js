import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import emergencyRoutes from "./routes/emergency.routes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import medicalTermRoutes from "./routes/medicalTermRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();
const app = express();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create uploads directory if it doesn't exist
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/pharmacy", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes); // Changed from /v1/api/doctor to /api/doctor
app.use("/v1/api/medicines", medicineRoutes);
app.use("/v1/api/orders", orderRoutes);
app.use("/v1/api/emergency", emergencyRoutes);
app.use("/v1/api/prescriptions", prescriptionRoutes);
app.use("/api/medical-terms", medicalTermRoutes);
app.use("/v1/api/orders", paymentRoutes);
app.use("/api/about", aboutRoutes); // Add this line before other routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Socket.io setup
import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
  },
});

// Make io accessible in routes
app.io = io;

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
