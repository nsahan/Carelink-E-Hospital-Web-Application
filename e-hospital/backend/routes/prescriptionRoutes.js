import express from "express";
import multer from "multer";
import {
  uploadPrescription,
  getPrescriptions,
  processPrescription,
} from "../controllers/prescriptionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/prescriptions");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .jpeg, .png and .pdf formats allowed!"));
    }
  },
});

router.post(
  "/upload",
  protect,
  upload.single("prescription"),
  uploadPrescription
);
router.get("/", protect, getPrescriptions);
router.post("/:id/process", protect, processPrescription);

export default router;
