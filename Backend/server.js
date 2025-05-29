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
import { mkdirSync } from "fs";
import { checkAndSendReminders } from "./utils/emailService.js";
import StockService from "./utils/stockService.js";
import events from "events";

// Increase max listeners
events.EventEmitter.defaultMaxListeners = 15;

//app config
const app = express();
const port = process.env.PORT || 9000;
connectdb();
connectcloudinary();
//db config

//middlewareb
app.use(express.json());
app.use(cors()); //cors is used to allow the request from the frontend to the backend

// Create uploads directory if it doesn't exist
try {
  mkdirSync("./uploads");
} catch (err) {
  if (err.code !== "EEXIST") throw err;
}

//api endpoints
app.use("/api/admin", router);
app.use("/api/doctor", doctorRouter);
app.use("/api/users", userRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/admin", adminRoutes);
app.use("/v1/api/", medicineRoutes);
app.use("/v1/api", medicineRoutes);
app.use("/v1/api", orderRoutes);
app.use("/v1/api", prescriptionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

app.get("/", (req, res) => res.status(200).send("Hello World"));

// Schedule appointment reminders to run every day at midnight
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

// Also run once when server starts
scheduleReminders();

// Set up automatic stock monitoring (runs every hour)
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

// Start monitoring after server initialization
app.listen(port, () => {
  console.log(`Listening on localhost:${port}`);
  // Initial check
  monitorStock();
  // Schedule recurring checks
  setInterval(monitorStock, STOCK_CHECK_INTERVAL);
});
