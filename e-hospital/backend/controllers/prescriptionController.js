import Prescription from "../models/Prescription.js";
import Medicine from "../models/Medicine.js";
import asyncHandler from "express-async-handler";
import Tesseract from "tesseract.js";

// @desc    Upload prescription
// @route   POST /api/prescriptions/upload
// @access  Private
export const uploadPrescription = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a file");
  }

  const prescription = await Prescription.create({
    userId: req.user._id,
    image: req.file.path,
    status: "pending",
  });

  // For demo, automatically match some medicines
  const medicines = await Medicine.aggregate([
    { $sample: { size: 3 } }, // Get 3 random medicines
  ]);

  prescription.matchedMedicines = medicines.map((m) => m._id);
  prescription.status = "processed";
  await prescription.save();

  const populatedMedicines = await Medicine.find({
    _id: { $in: medicines.map((m) => m._id) },
  });

  res.status(201).json({
    success: true,
    medicines: populatedMedicines,
  });
});

// @desc    Get user prescriptions
// @route   GET /api/prescriptions
// @access  Private
export const getPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ userId: req.user._id })
    .populate("matchedMedicines")
    .sort("-createdAt");

  res.json(prescriptions);
});

// @desc    Process prescription
// @route   POST /api/prescriptions/:id/process
// @access  Private/Admin
export const processPrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error("Prescription not found");
  }

  prescription.status = req.body.status;
  prescription.matchedMedicines = req.body.medicines;
  prescription.notes = req.body.notes;
  prescription.processedBy = req.user._id;

  await prescription.save();

  res.json(prescription);
});

exports.processPrescriptionOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No prescription file uploaded" });
    }

    // Validate file type
    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!validMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Please upload a valid image or PDF.",
      });
    }

    // Process image using Tesseract OCR with improved options
    const result = await Tesseract.recognize(req.file.buffer, "eng", {
      logger: (m) => console.log(m),
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-",
      tessedit_create_pdf: "0",
      tessedit_pageseg_mode: "1",
    });

    // Enhanced text processing
    const text = result.data.text;
    const words = text.split(/\s+/).map((w) => w.trim());

    // Improved medicine name extraction with common medical terms
    const commonMedicalTerms = [
      "tablet",
      "capsule",
      "mg",
      "ml",
      "syrup",
      "injection",
    ];
    const identifiedMedicines = words.filter((word) => {
      return (
        word.length > 3 &&
        !word.match(/^\d+$/) &&
        !word.match(/^[0-9.]+mg$/) &&
        !commonMedicalTerms.includes(word.toLowerCase())
      );
    });

    res.json({
      message: "Prescription processed successfully",
      identifiedMedicines: Array.from(new Set(identifiedMedicines)), // Remove duplicates
      confidence: result.data.confidence,
      rawText: text, // Include raw text for debugging
    });
  } catch (error) {
    console.error("OCR Processing error:", error);
    res.status(500).json({
      message: "Error processing prescription",
      error: error.message,
    });
  }
};

exports.matchMedicines = async (req, res) => {
  try {
    const { medicines } = req.body;
    if (!medicines || !Array.isArray(medicines)) {
      return res.status(400).json({ message: "Invalid medicine list" });
    }

    // Create regex patterns for fuzzy matching
    const searchPatterns = medicines.map(
      (med) => new RegExp(med.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i")
    );

    // Find matches in database
    const matchedMedicines = await Medicine.find({
      $or: searchPatterns.map((pattern) => ({
        $or: [
          { name: { $regex: pattern } },
          { genericName: { $regex: pattern } },
        ],
      })),
    });

    res.json({
      message: "Medicines matched successfully",
      matchedMedicines,
    });
  } catch (error) {
    console.error("Medicine matching error:", error);
    res.status(500).json({ message: "Error matching medicines" });
  }
};
