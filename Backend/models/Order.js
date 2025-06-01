import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Changed from true to false
    },
    guestInfo: {
      name: String,
      email: String,
      phone: String,
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
    status: {
      type: String,
      enum: ["pending", "shipped", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "cod",
    },
    deliveryDate: {
      type: Date,
      default: function () {
        const date = new Date();
        date.setDate(date.getDate() + 5); // Set delivery date to 5 days from order
        return date;
      },
    },
    receivedDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
