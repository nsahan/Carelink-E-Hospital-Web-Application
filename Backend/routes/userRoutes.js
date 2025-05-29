import express from "express";
import {
  registerUser,
  loginUser,
  updateUser,
  updateUserImage,
  googleAuth,
  getAllUsers,
} from "../controllers/usercontroller.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", upload.single("image"), registerUser);
router.post("/login", loginUser);
router.put("/update", protect, updateUser);
router.post("/update-image", protect, upload.single("image"), updateUserImage);
router.post("/google", googleAuth);
router.get("/all", protect, isAdmin, getAllUsers);

// Admin routes
router.get("/admin/users", protect, isAdmin, getAllUsers);

export default router;
