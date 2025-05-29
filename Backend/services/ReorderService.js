import ReorderSystem from "../models/ReorderSystem.js";
import Medicine from "../models/Medicine.js";
import { sendNotification } from "../utils/notificationService.js";

export class ReorderService {
  static async checkStockLevels() {
    try {
      const lowStockMedicines = await Medicine.find({
        $expr: {
          $lte: ["$stock", "$reorderLevel"],
        },
      });

      for (const medicine of lowStockMedicines) {
        await this.initiateReorder(medicine);
      }

      return lowStockMedicines;
    } catch (error) {
      console.error("Error checking stock levels:", error);
      throw error;
    }
  }

  static async initiateReorder(medicine) {
    try {
      // Check for existing pending reorder
      const existingReorder = await ReorderSystem.findOne({
        medicineId: medicine._id,
        status: "pending",
      });

      if (existingReorder) {
        return existingReorder;
      }

      const urgency = this.calculateUrgency(medicine);
      const quantity = this.calculateReorderQuantity(medicine);

      const reorder = new ReorderSystem({
        medicineId: medicine._id,
        quantity,
        urgency,
        orderReference: `RO-${Date.now()}-${medicine._id.toString().slice(-4)}`,
        expectedDelivery: this.calculateExpectedDelivery(urgency),
        history: [
          {
            status: "initiated",
            date: new Date(),
            notes: `Auto-reorder initiated for ${medicine.name}`,
          },
        ],
      });

      await reorder.save();

      // Send notifications
      await this.notifyRelevantParties(reorder, medicine);

      return reorder;
    } catch (error) {
      console.error("Error initiating reorder:", error);
      throw error;
    }
  }

  static calculateUrgency(medicine) {
    const stockRatio = medicine.stock / medicine.reorderLevel;
    if (stockRatio === 0) return "high";
    if (stockRatio <= 0.5) return "medium";
    return "low";
  }

  static calculateReorderQuantity(medicine) {
    return Math.max(
      medicine.reorderQuantity,
      Math.ceil(medicine.reorderLevel * 2 - medicine.stock)
    );
  }

  static calculateExpectedDelivery(urgency) {
    const now = new Date();
    switch (urgency) {
      case "high":
        return new Date(now.setDate(now.getDate() + 2));
      case "medium":
        return new Date(now.setDate(now.getDate() + 5));
      case "low":
        return new Date(now.setDate(now.getDate() + 7));
    }
  }

  static async notifyRelevantParties(reorder, medicine) {
    const notifications = [
      {
        type: "ADMIN_ALERT",
        title: "New Reorder Request",
        message: `Reorder initiated for ${medicine.name}`,
        priority: reorder.urgency === "high" ? "high" : "normal",
      },
      {
        type: "SUPPLIER_NOTIFICATION",
        title: "Stock Replenishment Required",
        message: `Order ${reorder.orderReference} for ${medicine.name}`,
        priority: reorder.urgency,
      },
    ];

    await Promise.all(
      notifications.map((notification) => sendNotification(notification))
    );
  }
}
