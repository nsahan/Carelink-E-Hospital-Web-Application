import Medicine from "../models/Medicine.js";
import { sendEmail, sendSupplierNotification } from "../utils/emailService.js";
import jwt from "jsonwebtoken";

// Fetch all medicines
export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });

    // Process medicines data to include stock status
    const processedMedicines = medicines.map((medicine) => {
      const stockStatus = {
        isLowStock: medicine.stock <= medicine.reorderLevel,
        isOutOfStock: medicine.stock === 0,
        daysToExpiry: Math.ceil(
          (new Date(medicine.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        ),
      };

      return {
        ...medicine.toObject(),
        stockStatus,
      };
    });

    res.status(200).json(processedMedicines);
  } catch (error) {
    console.error("Error fetching medicines:", error);
    res.status(500).json({ message: "Error fetching medicines" });
  }
};

// Add a new medicine
export const addMedicine = async (req, res) => {
  // Support adding a new category by dummy medicine (for category dropdown)
  // If name starts with __dummy__, don't require all fields
  if (req.body.name && req.body.name.startsWith("__dummy__")) {
    try {
      const medicine = new Medicine({
        name: req.body.name,
        description: req.body.description || "Dummy for category creation",
        genericName: req.body.genericName || "",
        expiryDate:
          req.body.expiryDate ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        price: req.body.price || 1,
        category: req.body.category,
        stock: req.body.stock || 1,
        reorderLevel: req.body.reorderLevel || 10,
        reorderQuantity: req.body.reorderQuantity || 50,
        autoReorder: false,
      });
      await medicine.save();
      // Don't return the dummy medicine in response
      return res
        .status(201)
        .json({ success: true, message: "Dummy category created" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  const medicine = new Medicine({
    name: req.body.name,
    description: req.body.description,
    genericName: req.body.genericName,
    expiryDate: req.body.expiryDate,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock,
    reorderLevel: req.body.reorderLevel || 10,
    reorderQuantity: req.body.reorderQuantity || 50,
    autoReorder: req.body.autoReorder || false,
  });

  try {
    const newMedicine = await medicine.save();
    res.status(201).json(newMedicine);
  } catch (error) {
    console.error("Error adding medicine:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update a medicine
export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    res.status(200).json(medicine);
  } catch (error) {
    console.error("Error updating medicine:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a medicine
export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    res.status(200).json({ message: "Medicine deleted successfully" });
  } catch (error) {
    console.error("Error deleting medicine:", error);
    res.status(500).json({ message: error.message });
  }
};

// Notify suppliers for low stock
export const notifySuppliers = async (req, res) => {
  try {
    const { medicines } = req.body;
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "Invalid medicines data" });
    }

    // Send email notification only
    const emailSent = await sendSupplierNotification(medicines);
    if (!emailSent) {
      throw new Error("Failed to send supplier notification");
    }

    // Update notification status in database
    await Promise.all(
      medicines.map(async (med) => {
        await Medicine.findByIdAndUpdate(med.id, {
          lastNotificationSent: new Date(),
          notificationStatus: "sent",
        });
      })
    );

    res.json({
      success: true,
      message: "Suppliers have been notified successfully",
    });
  } catch (error) {
    console.error("Error in notifySuppliers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to notify suppliers",
      error: error.message,
    });
  }
};

// Get all unique medicine categories
export const getMedicineCategories = async (req, res) => {
  try {
    const categories = await Medicine.distinct("category");
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching medicine categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
};
