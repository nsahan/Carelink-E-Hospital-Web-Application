import { createWorker } from "tesseract.js";
import Medicine from "../models/Medicine.js";
import fs from "fs";
import path from "path";

// Utility function to safely delete files
const safeUnlink = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    } catch (err) {
      console.error(`Error deleting ${filePath}:`, err);
    }
  }
};

// Simple OCR service that creates fresh workers for each request
class OCRService {
  static async processImage(imagePath) {
    let worker = null;

    try {
      console.log("Creating new Tesseract worker...");
      // Create a worker with English language directly
      worker = await createWorker("eng");

      console.log("Initializing worker...");
      await worker.initialize("eng");

      console.log("Setting parameters...");
      await worker.setParameters({
        tessedit_char_whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,()[]- /\\",
        preserve_interword_spaces: "1",
        tessedit_pageseg_mode: "6",
      });

      console.log("Starting OCR recognition...");
      const {
        data: { text },
      } = await worker.recognize(imagePath);

      console.log("OCR completed successfully");
      return text;
    } catch (error) {
      console.error("OCR processing error:", error);
      throw new Error(`OCR failed: ${error.message}`);
    } finally {
      if (worker) {
        try {
          console.log("Terminating worker...");
          await worker.terminate();
          console.log("Worker terminated successfully");
        } catch (terminateError) {
          console.error("Error terminating worker:", terminateError);
        }
      }
    }
  }
}

// Enhanced medicine name extraction with better patterns
const extractMedicineNames = (text) => {
  console.log("Extracting medicine names from text...");

  const medicinePatterns = [
    // Common tablet/capsule patterns
    /(?:tab|tablet|cap|capsule)\s*\.?\s*([a-z][a-z0-9\s\-\.]{2,25})/gi,
    // Medicine name followed by dosage
    /([a-z][a-z\s\-]{2,20})\s+\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml)/gi,
    // Dosage followed by medicine name
    /\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml)\s+([a-z][a-z\s\-]{2,20})/gi,
    // Generic medicine names (standalone)
    /(?:^|\n|\.|\s)([A-Z][a-z]{2,15}(?:\s+[A-Z]?[a-z]{2,15}){0,2})(?=\s|$|\n|\.)/g,
    // Brand names (often capitalized)
    /(?:^|\n|\s)([A-Z][A-Z\s]{2,20})(?=\s|$|\n)/g,
  ];

  let identifiedMedicines = [];
  const lines = text.split("\n");

  // Process each line
  lines.forEach((line) => {
    const cleanLine = line.trim();
    if (cleanLine.length < 3) return;

    medicinePatterns.forEach((pattern) => {
      const matches = cleanLine.matchAll(pattern);
      for (const match of matches) {
        let medicineName = match[1].trim();

        // Clean up the medicine name
        medicineName = medicineName
          .replace(/^\d+\s*(?:mg|mcg|g|ml)\s*/i, "") // Remove leading dosage
          .replace(/\s*\d+\s*(?:mg|mcg|g|ml)\s*$/i, "") // Remove trailing dosage
          .replace(/\s+/g, " ") // Normalize spaces
          .replace(/[^\w\s\-]/g, "") // Remove special chars except hyphens
          .trim();

        // Validation
        if (isValidMedicineName(medicineName)) {
          identifiedMedicines.push(medicineName);
        }
      }
    });
  });

  // Remove duplicates and sort
  const uniqueMedicines = [...new Set(identifiedMedicines)]
    .sort((a, b) => b.length - a.length)
    .slice(0, 20); // Limit to top 20 to avoid overwhelming results

  console.log(`Extracted ${uniqueMedicines.length} potential medicine names`);
  return uniqueMedicines;
};

const isValidMedicineName = (name) => {
  if (!name || name.length < 3 || name.length > 30) return false;

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(name)) return false;

  // Exclude common non-medicine words
  const excludeWords = [
    "take",
    "twice",
    "daily",
    "morning",
    "evening",
    "after",
    "before",
    "food",
    "meal",
    "water",
    "days",
    "weeks",
    "months",
    "times",
    "hour",
    "patient",
    "doctor",
    "hospital",
    "clinic",
    "prescription",
    "dose",
    "instruction",
    "medication",
    "tablet",
    "capsule",
    "syrup",
    "injection",
  ];

  const lowerName = name.toLowerCase();
  if (excludeWords.some((word) => lowerName.includes(word))) return false;

  // Exclude if it's mostly numbers
  if (/^\d+$/.test(name.replace(/\s/g, ""))) return false;

  return true;
};

export const processPrescription = async (req, res) => {
  let prescriptionPath = null;
  let originalPath = null;

  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No prescription file uploaded",
      });
    }

    console.log(
      `Processing prescription: ${req.file.originalname} (${req.file.size} bytes)`
    );

    prescriptionPath = req.file.path;
    originalPath = req.file.path;

    // Handle PDF files (if pdf2pic is available)
    if (req.file.mimetype === "application/pdf") {
      try {
        const { fromPath } = await import("pdf2pic");
        console.log("Converting PDF to image...");

        const convert = fromPath(prescriptionPath, {
          density: 300,
          saveFilename: "prescription",
          savePath: path.dirname(prescriptionPath),
          format: "png",
          width: 2000,
          height: 2000,
        });

        const results = await convert(1, false); // Convert first page only
        if (results.length > 0) {
          prescriptionPath = results[0].path;
          console.log("PDF converted successfully");
        }
      } catch (pdfError) {
        console.error("PDF processing failed:", pdfError);
        return res.status(400).json({
          success: false,
          message:
            "Failed to process PDF file. Please try uploading an image instead.",
          error: pdfError.message,
        });
      }
    }

    // Verify file exists
    if (!fs.existsSync(prescriptionPath)) {
      throw new Error("Prescription file not found");
    }

    // Process with OCR
    console.log("Starting OCR processing...");
    const extractedText = await OCRService.processImage(prescriptionPath);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No text could be extracted from the image. Please ensure the image is clear and contains readable text.",
      });
    }

    console.log(`OCR extracted ${extractedText.length} characters`);
    
    // Extract medicine names
    const identifiedMedicines = extractMedicineNames(extractedText);

    if (identifiedMedicines.length === 0) {
      return res.json({
        success: true,
        data: {
          identifiedMedicines: [],
          matchedMedicines: [],
          unmatchedMedicines: [],
          confidence: 0.1,
          extractedText: extractedText.substring(0, 300),
          message: "No medicine names could be identified in the prescription",
        },
      });
    }

    console.log("Searching database for matches...");

    // Search database with multiple strategies
    const searchQueries = identifiedMedicines.map((name) => ({
      $or: [
        { name: new RegExp(name.replace(/\s+/g, ".*"), "i") },
        { name: new RegExp(`^${name}`, "i") },
        { name: new RegExp(name.split(" ")[0], "i") },
        { description: new RegExp(name, "i") },
      ],
    }));

    let matchedMedicines = [];
    if (searchQueries.length > 0) {
      try {
        matchedMedicines = await Medicine.find({
          $or: searchQueries,
        })
          .select("name price stock description category dosage image")
          .limit(15)
          .lean();

        console.log(
          `Found ${matchedMedicines.length} matching medicines in database`
        );
      } catch (dbError) {
        console.error("Database search error:", dbError);
        // Continue without database matches
      }
    }

    // Calculate results
    const unmatchedMedicines = identifiedMedicines.filter(
      (name) =>
        !matchedMedicines.some(
          (med) =>
            med.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(med.name.toLowerCase())
        )
    );

    const confidence =
      identifiedMedicines.length > 0
        ? Math.min(
            0.95,
            0.4 + (matchedMedicines.length / identifiedMedicines.length) * 0.5
          )
        : 0.1;

    // Cleanup files
    setTimeout(() => {
      safeUnlink(prescriptionPath);
      safeUnlink(originalPath);
    }, 1000);

    // Send response
    res.json({
      success: true,
      data: {
        identifiedMedicines,
        matchedMedicines,
        unmatchedMedicines,
        confidence: Math.round(confidence * 100) / 100,
        extractedText: extractedText.substring(0, 500),
        processingStats: {
          totalIdentified: identifiedMedicines.length,
          totalMatched: matchedMedicines.length,
          totalUnmatched: unmatchedMedicines.length,
          textLength: extractedText.length,
        },
      },
      message: `Successfully processed prescription. Found ${matchedMedicines.length} matching medicines from ${identifiedMedicines.length} identified items.`,
    });
  } catch (error) {
    console.error("Prescription processing error:", error);

    // Cleanup files on error
    setTimeout(() => {
      safeUnlink(prescriptionPath);
      safeUnlink(originalPath);
    }, 1000);

    res.status(500).json({
      success: false,
      message: "Error processing prescription",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
      details:
        process.env.NODE_ENV === "development"
          ? {
              type: error.name,
              stack: error.stack?.substring(0, 500),
            }
          : undefined,
    });
  }
};
