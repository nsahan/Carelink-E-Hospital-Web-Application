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

// Restock a single medicine
export const restockMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    medicine.stock += 50;
    medicine.lastRestocked = new Date();
    medicine.lastReorderRequest = null;

    await medicine.save();

    const confirmationTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #28a745;">✅ Restock Successful!</h2>
        <p>The following medicine has been restocked:</p>
        <ul>
          <li>Medicine: ${medicine.name}</li>
          <li>Added Stock: 50 units</li>
          <li>New Total Stock: ${medicine.stock} units</li>
          <li>Restock Date: ${new Date().toLocaleDateString()}</li>
        </ul>
      </div>
    `;

    await sendEmail({
      to: "jayarathnasahan257@gmail.com",
      subject: `Restock Confirmation: ${medicine.name}`,
      html: confirmationTemplate,
    });

    res.json({
      success: true,
      message: "Medicine restocked successfully",
      data: medicine,
    });
  } catch (error) {
    console.error("Restock error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restock medicine",
      error: error.message,
    });
  }
};

// Notify suppliers for low stock
export const notifySuppliers = async (req, res) => {
  try {
    const { medicines } = req.body;
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "Invalid medicines data" });
    }

    const emailSent = await sendSupplierNotification(medicines);
    if (!emailSent) {
      throw new Error("Failed to send supplier notification");
    }

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

// Approve restock for a medicine
export const approveRestock = async (req, res) => {
  try {
    const { id, token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.medicineId !== id) {
      return res.status(400).send("Invalid or expired approval link");
    }

    const medicine = await Medicine.findById(id);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    // Update stock
    const reorderQuantity = medicine.reorderQuantity || 50;
    medicine.stock += reorderQuantity;
    medicine.lastRestocked = new Date();
    medicine.lastReorderRequest = null;
    medicine.notificationStatus = "restocked";

    // Add to restock history
    medicine.restockHistory.push({
      date: new Date(),
      quantity: reorderQuantity,
      totalAmount: reorderQuantity * medicine.supplierPrice,
      billNo: `PO-${Date.now()}`,
      status: "completed",
    });

    await medicine.save();

    // Send a success page
    const html = `
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h1 style="color: #4CAF50;">✅ Restock Approved Successfully</h1>
        <p>Stock has been updated for ${medicine.name}</p>
        <p>Added quantity: ${reorderQuantity} units</p>
        <p>New stock level: ${medicine.stock} units</p>
        <p>Bill No: ${
          medicine.restockHistory[medicine.restockHistory.length - 1].billNo
        }</p>
        <p style="margin-top: 30px; color: #666;">You can close this window now.</p>
      </div>
    `;
    // Send confirmation email
    res.send(html);
  } catch (error) {
    console.error("Error approving restock:", error);
    res.status(500).json({
      success: false,
      message: "Error processing restock approval",
      error: error.message,
    });
  }
};

// Restock multiple medicines (new endpoint)
export const restockMultipleMedicines = async (req, res) => {
  try {
    const { medicines } = req.body;

    // Validate input
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicines data",
      });
    }

    // Process each medicine
    const updatedMedicines = await Promise.all(
      medicines.map(async (med) => {
        const medicine = await Medicine.findById(med.id);

        if (!medicine) {
          throw new Error(`Medicine with ID ${med.id} not found`);
        }

        // Update stock
        medicine.stock += med.reorderQuantity || 50;
        medicine.lastRestocked = new Date();
        medicine.lastReorderRequest = null;
        medicine.notificationStatus = "restocked";

        await medicine.save();

        // Send confirmation email
        const confirmationTemplate = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #28a745;">✅ Restock Successful!</h2>
            <p>The following medicine has been restocked:</p>
            <ul>
              <li>Medicine: ${medicine.name}</li>
              <li>Added Stock: ${med.reorderQuantity || 50} units</li>
              <li>New Total Stock: ${medicine.stock} units</li>
              <li>Restock Date: ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>
        `;

        await sendEmail({
          to: "jayarathnasahan257@gmail.com",
          subject: `Restock Confirmation: ${medicine.name}`,
          html: confirmationTemplate,
        });

        return medicine;
      })
    );

    res.status(200).json({
      success: true,
      message: "Medicines restocked successfully",
      data: updatedMedicines,
    });
  } catch (error) {
    console.error("Error restocking multiple medicines:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restock medicines",
      error: error.message,
    });
  }
};

// Restock medicines and handle bills
export const restockMedicines = async (req, res) => {
  try {
    const { medicines } = req.body;

    if (!medicines || !Array.isArray(medicines)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data - medicines array is required",
      });
    }

    const updates = await Promise.all(
      medicines.map(async (med) => {
        const medicine = await Medicine.findById(med.id);
        if (!medicine) {
          throw new Error(`Medicine with ID ${med.id} not found`);
        }

        // Update stock and restock date
        medicine.stock += med.reorderQuantity || 50;
        medicine.lastRestocked = new Date();
        medicine.lastReorderRequest = new Date();

        // Update restock history
        if (!medicine.restockHistory) {
          medicine.restockHistory = [];
        }

        medicine.restockHistory.push({
          date: new Date(),
          quantity: med.reorderQuantity || 50,
          totalAmount: (med.reorderQuantity || 50) * medicine.supplierPrice,
          billNo: `PO-${Date.now()}`,
          status: "completed",
        });

        await medicine.save();

        return {
          name: medicine.name,
          previousStock: medicine.stock - (med.reorderQuantity || 50),
          newStock: medicine.stock,
          reorderQuantity: med.reorderQuantity || 50,
        };
      })
    );

    res.json({
      success: true,
      message: "Medicines restocked successfully",
      data: updates,
    });
  } catch (error) {
    console.error("Error in restockMedicines:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restock medicines",
      error: error.message,
    });
  }
};
