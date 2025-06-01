import express from "express";
import * as medicineController from "../controllers/MedicineController.js";

const router = express.Router();

// API base path: /v1/api/medicines
router.get("/medicines/all", medicineController.getMedicines);
router.post("/medicines", medicineController.addMedicine);
router.put("/medicines/:id", medicineController.updateMedicine);
router.delete("/medicines/:id", medicineController.deleteMedicine);
router.post("/medicines/notify-suppliers", medicineController.notifySuppliers); // Only keep notification route

export default router;
