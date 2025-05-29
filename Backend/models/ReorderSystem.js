import mongoose from "mongoose";

const reorderSystemSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "cancelled"],
      default: "pending",
    },
    quantity: {
      type: Number,
      required: true,
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvalDate: Date,
    notes: String,
    orderReference: String,
    expectedDelivery: Date,
    supplierDetails: {
      name: String,
      contact: String,
      orderId: String,
    },
    history: [
      {
        status: String,
        date: Date,
        updatedBy: String,
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ReorderSystem", reorderSystemSchema);
