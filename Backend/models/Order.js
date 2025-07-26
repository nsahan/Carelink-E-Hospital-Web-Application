import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    customerDetails: {
      fullName: String,
      email: String,
      phone: String,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "cancelled",
        "tracking_required",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    tracking: {
      status: {
        type: String,
        enum: [
          "pending",
          "processing",
          "shipped",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ],
        default: "pending",
      },
      location: String,
      updates: [
        {
          status: String,
          location: String,
          timestamp: { type: Date, default: Date.now },
          message: String,
        },
      ],
      estimatedDelivery: Date,
      lastUpdated: { type: Date, default: Date.now },
    },
    cancellationReason: {
      type: String,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    // Delivery service fields
    deliveryPersonnel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPersonnel",
      default: null
    },
    deliveryStatus: {
      type: String,
      enum: ["assigned", "picked_up", "in_transit", "delivered"],
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
    },
    deliveryStatusUpdatedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
