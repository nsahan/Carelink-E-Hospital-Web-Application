import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processed", "approved", "rejected"],
      default: "pending",
    },
    matchedMedicines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
      },
    ],
    notes: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
