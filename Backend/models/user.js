import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    phone: String,
    address: String,
    role: {
      type: String,
      enum: ["user", "admin", "doctor"],
      default: "user",
    },
  },
  { timestamps: true }
);

// Check if model already exists before compiling
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
