const express = require("express");
const app = express();
const prescriptionRoutes = require("./routes/prescriptionRoutes");

// Add this after other middleware
app.use("/uploads", express.static("uploads"));
app.use("/v1/api/prescriptions", prescriptionRoutes);

// Prescription routes
app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));

// Medicine routes
app.use("/api/medicines", require("./routes/medicineRoutes"));

// Order routes
app.use("/api/orders", require("./routes/orderRoutes"));

// Register prescription routes
app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));

app.use("/v1/api/prescriptions", prescriptionRoutes);

module.exports = app;
