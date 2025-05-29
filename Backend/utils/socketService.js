import Medicine from "../models/Medicine.js";
import { sendReorderNotification } from "./emailService.js";

class StockService {
  static async checkAndCreateReorderRequests() {
    try {
      // Get all medicines with low stock
      const lowStockMedicines = await Medicine.find({
        stock: { $lt: 10 },
        returned: false,
      });

      if (lowStockMedicines.length > 0) {
        // Send notification for low stock items
        await sendReorderNotification(
          lowStockMedicines.map((med) => ({
            name: med.name,
            stock: med.stock,
            reorderQuantity: med.reorderQuantity || 50,
            priority: med.stock <= 3 ? "URGENT" : "Standard",
          }))
        );

        // Update reorder status
        await Promise.all(
          lowStockMedicines.map(async (medicine) => {
            medicine.lastReorderRequest = new Date();
            await medicine.save();
          })
        );
      }

      return {
        success: true,
        lowStockCount: lowStockMedicines.length,
        medicines: lowStockMedicines,
      };
    } catch (error) {
      console.error("Stock service error:", error);
      throw error;
    }
  }

  static async getStockStatus() {
    try {
      const [lowStock, expiring] = await Promise.all([
        Medicine.find({ stock: { $lt: 10 }, returned: false }),
        Medicine.find({
          expiryDate: {
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
          returned: false,
        }),
      ]);

      return {
        success: true,
        lowStock,
        expiring,
        totalLow: lowStock.length,
        totalExpiring: expiring.length,
      };
    } catch (error) {
      console.error("Error getting stock status:", error);
      throw error;
    }
  }
}

export default StockService;