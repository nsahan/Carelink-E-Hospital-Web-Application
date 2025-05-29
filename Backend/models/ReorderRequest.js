import mongoose from "mongoose";

const reorderRequestSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "cancelled"],
      default: "pending",
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    approvalDate: Date,
    completionDate: Date,
    supplierEmail: String,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.ReorderRequest ||
  mongoose.model("ReorderRequest", reorderRequestSchema);
