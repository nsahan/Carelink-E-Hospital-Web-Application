import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = "uploads/prescriptions";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG and PDF files are allowed."
        )
      );
    }
  },
}).single("prescription");

// Handle file upload with error handling
router.post("/upload", protect, (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Multer error occurred
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      // Other error occurred
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    // No file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a prescription file",
      });
    }

    // Mock processing - in reality, this would be OCR/ML processing
    const dummyMedicines = [
      {
        _id: "1",
        name: "Amoxicillin",
        price: 150,
        stock: 50,
        description: "500mg capsules",
      },
      {
        _id: "2",
        name: "Paracetamol",
        price: 50,
        stock: 100,
        description: "500mg tablets",
      },
    ];

    // Success response
    res.status(200).json({
      success: true,
      message: "Prescription processed successfully",
      medicines: dummyMedicines,
      prescriptionPath: req.file.path,
    });
  });
});

export default router;
