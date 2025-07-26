import express from "express";
import cors from "cors";
import "dotenv/config";
import connectdb from "./config/mongodb.js";
import connectcloudinary from "./config/cloudinary.js";
import router from "./routes/adminroute.js";
import doctorRouter from "./routes/doctorroute.js";
import userRouter from "./routes/userRoutes.js";
import appointmentRouter from "./routes/appointmentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import emegencyRoutes from "./routes/emergency.routes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import hospitalPricingRoutes from "./routes/hospitalPricingRoutes.js";
import { mkdirSync } from "fs";
import { checkAndSendReminders } from "./utils/emailService.js";
import StockService from "./utils/stockService.js";
import events from "events";
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import cron from "node-cron";
import { sendDailyHealthTips } from "./utils/healthTipsService.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";

// Increase max listeners
events.EventEmitter.defaultMaxListeners = 15;

// App config
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 9000;

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("groupMessage", (message) => {
    io.emit("groupMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io available to routes
app.io = io;

connectdb();
connectcloudinary();

// Middleware
app.use(express.json());
app.use(cors());

// Create uploads directory if it doesn't exist
try {
  mkdirSync("./uploads", { recursive: true });
  console.log("Uploads directory created/verified");
} catch (err) {
  if (err.code !== "EEXIST") {
    console.error("Error creating uploads directory:", err);
    throw err;
  }
}

// Import models
import "./models/user.js";
import "./models/Order.js";
import "./models/Medicine.js";

// API endpoints
app.use("/api/admin", router);
app.use("/api/doctor", doctorRouter);
app.use("/api/users", userRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/v1/api", medicineRoutes);
app.use("/v1/api", orderRoutes);
app.use("/v1/api", prescriptionRoutes);
app.use("/v1/api", supplierRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", reportRoutes);
app.use("/v1/api/emergency", emegencyRoutes);
app.use("/v1/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/v1/api/settings", settingsRoutes);
app.use("/api/hospital-pricing", hospitalPricingRoutes);
app.use("/api/delivery", deliveryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

app.get("/", (req, res) => res.status(200).send("Hello World"));

// Schedule appointment reminders
const scheduleReminders = () => {
  try {
    checkAndSendReminders().catch((err) => {
      console.error("Failed to send reminders:", err);
    });
  } catch (err) {
    console.error("Error in reminder scheduler:", err);
  }
};

// Run every 24 hours
setInterval(scheduleReminders, 24 * 60 * 60 * 1000);
scheduleReminders();

// Set up automatic stock monitoring
const STOCK_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
const monitorStock = async () => {
  try {
    console.log("Running automated stock check...");
    const result = await StockService.checkAndCreateReorderRequests();
    console.log("Stock check results:", result);
  } catch (error) {
    console.error("Error in stock monitoring:", error);
  }
};

// Start monitoring
monitorStock();
setInterval(monitorStock, STOCK_CHECK_INTERVAL);

// Schedule daily health tips email - runs at 8 AM every day
cron.schedule("0 8 * * *", async () => {
  try {
    await sendDailyHealthTips();
    console.log("Daily health tips scheduled task completed");
  } catch (error) {
    console.error("Error in daily health tips schedule:", error);
  }
});

// Start server with socket.io
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
