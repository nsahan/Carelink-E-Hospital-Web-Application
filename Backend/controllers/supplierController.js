import Supplier from "../models/Supplier.js";
import { sendEmail } from "../utils/emailService.js";

// Get all suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ message: "Failed to fetch suppliers" });
  }
};

// Get active suppliers only
export const getActiveSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching active suppliers:", error);
    res.status(500).json({ message: "Failed to fetch active suppliers" });
  }
};

// Get supplier by ID
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json({ message: "Failed to fetch supplier" });
  }
};

// Create new supplier
export const createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Failed to create supplier" });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Failed to update supplier" });
  }
};

// Delete supplier (soft delete - set isActive to false)
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier deactivated successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ message: "Failed to delete supplier" });
  }
};

// Activate supplier (set isActive to true)
export const activateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier activated successfully", supplier });
  } catch (error) {
    console.error("Error activating supplier:", error);
    res.status(500).json({ message: "Failed to activate supplier" });
  }
};

// Permanently delete supplier
export const permanentlyDeleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier permanently deleted" });
  } catch (error) {
    console.error("Error permanently deleting supplier:", error);
    res.status(500).json({ message: "Failed to delete supplier" });
  }
};

// Notify individual supplier
export const notifySupplier = async (req, res) => {
  try {
    const { medicines, notificationType = "low_stock" } = req.body;
    const supplier = await Supplier.findById(req.params.supplierId);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    if (!supplier.isActive) {
      return res
        .status(400)
        .json({ message: "Cannot notify inactive supplier" });
    }

    // Create email content based on notification type
    let emailContent = "";
    let subject = "";

    switch (notificationType) {
      case "low_stock":
        subject = "🚨 Low Stock Alert - Immediate Attention Required";
        emailContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #dc3545;">⚠️ Low Stock Alert</h2>
            <p>Dear ${supplier.contactPerson || supplier.name},</p>
            <p>The following medicines require your attention:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; border: 1px solid #dee2e6;">Medicine Name</th>
                  <th style="padding: 12px; border: 1px solid #dee2e6;">Current Stock</th>
                  <th style="padding: 12px; border: 1px solid #dee2e6;">Required Quantity</th>
                  <th style="padding: 12px; border: 1px solid #dee2e6;">Priority</th>
                </tr>
              </thead>
              <tbody>
                ${medicines
                  .map(
                    (med) => `
                  <tr>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">${
                      med.name
                    }</td>
                    <td style="padding: 12px; border: 1px solid #dee2e6; color: ${
                      med.stock <= 3 ? "#dc3545" : "#ffc107"
                    }">${med.stock}</td>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">${
                      med.reorderQuantity || 50
                    }</td>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">
                      ${
                        med.stock <= 3
                          ? '<span style="color: #dc3545; font-weight: bold;">URGENT</span>'
                          : '<span style="color: #ffc107;">Normal</span>'
                      }
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <p style="margin-top: 20px; color: #666;">
              Please review and update the inventory accordingly.
            </p>
            <p>Best regards,<br>CareLink Hospital Management Team</p>
          </div>
        `;
        break;

      case "expiry":
        subject = "⚠️ Medicine Expiry Alert";
        emailContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #ffc107;">⚠️ Medicine Expiry Alert</h2>
            <p>Dear ${supplier.contactPerson || supplier.name},</p>
            <p>The following medicines are expiring soon:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; border: 1px solid #dee2e6;">Medicine Name</th>
                  <th style="padding: 12px; border: 1px solid #dee2e6;">Expiry Date</th>
                  <th style="padding: 12px; border: 1px solid #dee2e6;">Current Stock</th>
                </tr>
              </thead>
              <tbody>
                ${medicines
                  .map(
                    (med) => `
                  <tr>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">${med.name}</td>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">${med.expiryDate}</td>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">${med.stock}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <p>Best regards,<br>CareLink Hospital Management Team</p>
          </div>
        `;
        break;

      default:
        subject = "📋 Medicine Notification";
        emailContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Medicine Notification</h2>
            <p>Dear ${supplier.contactPerson || supplier.name},</p>
            <p>Please review the following medicine information:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; border: 1px solid #dee2e6;">Medicine Name</th>
                  <th style="padding: 12px; border: 1px solid #dee2e6;">Details</th>
                </tr>
              </thead>
              <tbody>
                ${medicines
                  .map(
                    (med) => `
                  <tr>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">${
                      med.name
                    }</td>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">${
                      med.details || "N/A"
                    }</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <p>Best regards,<br>CareLink Hospital Management Team</p>
          </div>
        `;
    }

    // Send email
    const emailSent = await sendEmail({
      to: supplier.email,
      subject: subject,
      html: emailContent,
    });

    // Update supplier with notification history
    const notificationRecord = {
      timestamp: new Date(),
      type: notificationType,
      medicines: medicines.map((med) => ({
        name: med.name,
        stock: med.stock,
        reorderQuantity: med.reorderQuantity,
        priority: med.stock <= 3 ? "URGENT" : "Normal",
      })),
      status: emailSent ? "sent" : "failed",
      response: emailSent ? "Email sent successfully" : "Failed to send email",
    };

    supplier.notificationHistory.push(notificationRecord);
    supplier.lastContacted = new Date();
    await supplier.save();

    res.json({
      success: true,
      message: emailSent
        ? "Notification sent successfully"
        : "Failed to send notification",
      supplier: supplier,
    });
  } catch (error) {
    console.error("Error notifying supplier:", error);
    res.status(500).json({ message: "Failed to notify supplier" });
  }
};

// Notify all active suppliers
export const notifyAllSuppliers = async (req, res) => {
  try {
    const { medicines, notificationType = "low_stock" } = req.body;
    const activeSuppliers = await Supplier.find({ isActive: true });

    if (activeSuppliers.length === 0) {
      return res.status(400).json({ message: "No active suppliers found" });
    }

    const results = [];

    for (const supplier of activeSuppliers) {
      try {
        // Create email content (same as individual notification)
        let emailContent = "";
        let subject = "";

        switch (notificationType) {
          case "low_stock":
            subject = "🚨 Low Stock Alert - Immediate Attention Required";
            emailContent = `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #dc3545;">⚠️ Low Stock Alert</h2>
                <p>Dear ${supplier.contactPerson || supplier.name},</p>
                <p>The following medicines require your attention:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                  <thead>
                    <tr style="background-color: #f8f9fa;">
                      <th style="padding: 12px; border: 1px solid #dee2e6;">Medicine Name</th>
                      <th style="padding: 12px; border: 1px solid #dee2e6;">Current Stock</th>
                      <th style="padding: 12px; border: 1px solid #dee2e6;">Required Quantity</th>
                      <th style="padding: 12px; border: 1px solid #dee2e6;">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${medicines
                      .map(
                        (med) => `
                      <tr>
                        <td style="padding: 12px; border: 1px solid #dee2e6;">${
                          med.name
                        }</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; color: ${
                          med.stock <= 3 ? "#dc3545" : "#ffc107"
                        }">${med.stock}</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6;">${
                          med.reorderQuantity || 50
                        }</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6;">
                          ${
                            med.stock <= 3
                              ? '<span style="color: #dc3545; font-weight: bold;">URGENT</span>'
                              : '<span style="color: #ffc107;">Normal</span>'
                          }
                        </td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
                <p style="margin-top: 20px; color: #666;">
                  Please review and update the inventory accordingly.
                </p>
                <p>Best regards,<br>CareLink Hospital Management Team</p>
              </div>
            `;
            break;

          default:
            subject = "📋 Medicine Notification";
            emailContent = `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Medicine Notification</h2>
                <p>Dear ${supplier.contactPerson || supplier.name},</p>
                <p>Please review the following medicine information:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                  <thead>
                    <tr style="background-color: #f8f9fa;">
                      <th style="padding: 12px; border: 1px solid #dee2e6;">Medicine Name</th>
                      <th style="padding: 12px; border: 1px solid #dee2e6;">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${medicines
                      .map(
                        (med) => `
                      <tr>
                        <td style="padding: 12px; border: 1px solid #dee2e6;">${
                          med.name
                        }</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6;">${
                          med.details || "N/A"
                        }</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
                <p>Best regards,<br>CareLink Hospital Management Team</p>
              </div>
            `;
        }

        // Send email
        const emailSent = await sendEmail({
          to: supplier.email,
          subject: subject,
          html: emailContent,
        });

        // Update supplier with notification history
        const notificationRecord = {
          timestamp: new Date(),
          type: notificationType,
          medicines: medicines.map((med) => ({
            name: med.name,
            stock: med.stock,
            reorderQuantity: med.reorderQuantity,
            priority: med.stock <= 3 ? "URGENT" : "Normal",
          })),
          status: emailSent ? "sent" : "failed",
          response: emailSent
            ? "Email sent successfully"
            : "Failed to send email",
        };

        supplier.notificationHistory.push(notificationRecord);
        supplier.lastContacted = new Date();
        await supplier.save();

        results.push({
          supplier: supplier.name,
          success: emailSent,
          message: emailSent ? "Notification sent" : "Failed to send",
        });
      } catch (error) {
        console.error(`Error notifying supplier ${supplier.name}:`, error);
        results.push({
          supplier: supplier.name,
          success: false,
          message: "Error occurred",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    res.json({
      success: true,
      message: `Notifications sent to ${successCount}/${totalCount} suppliers`,
      results: results,
    });
  } catch (error) {
    console.error("Error notifying all suppliers:", error);
    res.status(500).json({ message: "Failed to notify suppliers" });
  }
};

// Get supplier notification history
export const getSupplierNotificationHistory = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json(supplier.notificationHistory || []);
  } catch (error) {
    console.error("Error fetching notification history:", error);
    res.status(500).json({ message: "Failed to fetch notification history" });
  }
};
