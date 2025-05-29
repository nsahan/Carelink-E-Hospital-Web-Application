const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
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
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
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
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  paymentMethod: {
    type: String,
    enum: ["creditCard", "paypal"],
    default: "creditCard",
  },
  status: {
    type: String,
    enum: ["pending", "completed", "canceled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isReorder: {
    type: Boolean,
    default: false,
  },
  originalOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null,
  },
  reorderCount: {
    type: Number,
    default: 0,
  },
  reorderHistory: [
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
      date: Date,
    },
  ],
});

// Add method to check if medicine is available for reorder
orderSchema.methods.checkReorderAvailability = async function () {
  const unavailableMedicines = [];
  for (const item of this.items) {
    const medicine = await mongoose.model("Medicine").findById(item.medicineId);
    if (!medicine || medicine.stock === 0) {
      unavailableMedicines.push(item.medicineId);
    }
  }
  return unavailableMedicines;
};

module.exports = mongoose.model("Order", orderSchema);
