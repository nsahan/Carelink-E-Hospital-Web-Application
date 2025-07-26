import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    queueNumber: {
      type: Number,
      required: true,
    },
    estimatedTime: {
      type: String, // Format: "HH:MM"
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    consultationDuration: {
      type: Number, // in minutes, default 30
      default: 30,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique queue number per doctor per date
appointmentSchema.index({ doctorId: 1, date: 1, queueNumber: 1 }, { unique: true });

export default mongoose.model("Appointment", appointmentSchema);
      