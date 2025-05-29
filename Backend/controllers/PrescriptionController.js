import { createWorker } from "tesseract.js";
import Medicine from "../models/Medicine.js";
import fs from "fs";
import path from "path";

// Initialize OCR worker
let worker = null;

const initializeWorker = async () => {
  if (!worker) {
    worker = await createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
  }
  return worker;
};

export const processPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No prescription file uploaded",
      });
    }

    const worker = await initializeWorker();
    const prescriptionPath = req.file.path;

    // Perform OCR
    const {
      data: { text },
    } = await worker.recognize(prescriptionPath);

    // Extract medicine names using regex patterns
    const medicinePatterns = [
      /tab\w*\s+([A-Za-z0-9\s-]+)/gi, // Match "Tab" followed by medicine name
      /cap\w*\s+([A-Za-z0-9\s-]+)/gi, // Match "Cap" followed by medicine name
      /(\d+\s?mg\s+[A-Za-z0-9\s-]+)/gi, // Match dosage with medicine name
      /([A-Za-z]+\s+\d+\s?mg)/gi, // Match medicine name with dosage
    ];

    let identifiedMedicines = [];
    medicinePatterns.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        identifiedMedicines.push(match[1].trim());
      }
    });

    // Remove duplicates
    identifiedMedicines = [...new Set(identifiedMedicines)];

    // Match with database medicines
    const matchedMedicines = await Medicine.find({
      name: {
        $in: identifiedMedicines.map(
          (name) => new RegExp(name.replace(/\s+/g, ".*"), "i")
        ),
      },
    });

    // Cleanup uploaded file
    fs.unlink(prescriptionPath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    res.json({
      success: true,
      data: {
        identifiedMedicines,
        matchedMedicines,
        confidence: 0.85,
        text,
      },
    });
  } catch (error) {
    console.error("Prescription OCR error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing prescription",
      error: error.message,
    });
  }
};
