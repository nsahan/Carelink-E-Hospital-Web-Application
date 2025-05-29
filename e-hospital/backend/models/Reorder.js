const mongoose = require("mongoose");

const reorderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    frequency: {
      type: String,
      enum: ["weekly", "monthly", "bimonthly", "custom"],
      required: true,
    },
    nextRefillDate: {
      type: Date,
      required: true,
    },
    isAutoRefill: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
    medicineIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reorder", reorderSchema);
