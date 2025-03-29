import express from "express";
import { addDoctor, logAdmin } from "../controllers/admincontroller.js";
import multer from "multer";
import authAdmin from "../middlewares/authadmin.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Admin routes
router.post("/login", logAdmin);
router.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);

export default router;
