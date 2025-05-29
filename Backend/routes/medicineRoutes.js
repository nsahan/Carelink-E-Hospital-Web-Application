import express from "express";
import * as medicineController from "../controllers/MedicineController.js";

const router = express.Router();

// API base path: /v1/api/medicines
router.get("/medicines/all", medicineController.getMedicines);
router.post("/medicines", medicineController.addMedicine);
router.put("/medicines/:id", medicineController.updateMedicine);
router.delete("/medicines/:id", medicineController.deleteMedicine);
router.get("/medicines/restock/:id", medicineController.restockMedicine); // Restock a single medicine
router.post("/medicines/notify-suppliers", medicineController.notifySuppliers); // Notify suppliers for low stock
router.get(
  "/medicines/restock/approve/:medicineId",
  medicineController.approveRestock
); // Approve restock
router.post("/medicines/restock", medicineController.restockMultipleMedicines);
// Supplier restock approval route (public route with token verification)
router.get(
  "/medicines/restock/approve/:id/:token",
  medicineController.approveRestock
);

// Combined notifications route
router.get("/medicines/notifications", async (req, res) => {
  try {
    const medicines = await Medicine.find();

    // Get low stock medicines
    const lowStock = medicines.filter(
      (med) => med.stock <= (med.reorderLevel || 10)
    );

    // Get expiring medicines
    const today = new Date();
    const expiring = medicines.filter((med) => {
      const expiryDate = new Date(med.expiryDate);
      const daysUntilExpiry = Math.ceil(
        (expiryDate - today) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 30;
    });

    // Combine notifications with timestamps
    const notifications = [
      ...lowStock.map((med) => ({
        id: `low-${med._id}`,
        type: "lowStock",
        message: `Low stock alert: ${med.name} (${med.stock} remaining)`,
        severity: med.stock === 0 ? "critical" : "warning",
        timestamp: new Date().toISOString(),
      })),
      ...expiring.map((med) => {
        const daysUntilExpiry = Math.ceil(
          (new Date(med.expiryDate) - today) / (1000 * 60 * 60 * 24)
        );
        return {
          id: `exp-${med._id}`,
          type: "expiring",
          message: `Expiring soon: ${med.name} (${daysUntilExpiry} days left)`,
          severity: daysUntilExpiry <= 7 ? "critical" : "warning",
          timestamp: new Date().toISOString(),
        };
      }),
    ];

    res.json({ notifications, lowStock, expiring });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
});

export default router;
// router.get("/medicines/:id", medicineController.getMedicineById); // Get a single medicine by ID
// router.get("/medicines/search", medicineController.searchMedicines); // Search medicines by name or category
// router.get("/medicines/low-stock", medicineController.getLowStockMedicines); // Get low stock medicines
// router.get("/medicines/expiring", medicineController.getExpiringMedicines); // Get expiring medicines
// router.post("/medicines/reorder", medicineController.reorderMedicines); // Reorder medicines
// router.get("/medicines/reorder-requests", medicineController.getReorderRequests); // Get reorder requests
// router.put("/medicines/reorder/:id", medicineController.updateReorderStatus); // Update reorder request status
// router.delete("/medicines/reorder/:id", medicineController.deleteReorderRequest); // Delete reorder request
//     await reorder.save();
//     res.json(reorder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
