import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    genericName: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true },
    reorderLevel: { type: Number, default: 10 },
    reorderQuantity: { type: Number, default: 50 },
    autoReorder: { type: Boolean, default: false },
    lastRestocked: { type: Date },
    lastReorderRequest: { type: Date },
    lastNotificationSent: { type: Date },
    notificationStatus: {
      type: String,
      enum: ["pending", "sent", "restocked"],
      default: "pending",
    },
    supplierPrice: {
      type: Number,
      default: function () {
        // Automatically set supplier price 50 rupees less than selling price
        return this.price ? this.price - 50 : 0;
      },
    },
    restockHistory: [
      {
        date: { type: Date },
        quantity: { type: Number },
        totalAmount: { type: Number },
        billNo: { type: String },
        status: { type: String, enum: ["pending", "completed", "cancelled"] },
      },
    ],
  },
  { timestamps: true }
);

const Medicine =
  mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema);

export default Medicine;
