import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  message: String,
  status: {
    type: String,
    enum: ["NEW", "ACTIVE", "CRITICAL", "RESOLVED"],
    default: "NEW",
  },
  contactNumber: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  acknowledged: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Emergency", emergencySchema);
