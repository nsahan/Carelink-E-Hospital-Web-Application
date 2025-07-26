import express from 'express';
import {
  getAllPricing,
  getPricingBySpecialty,
  createPricing,
  updatePricing,
  deletePricing,
  getDoctorConsultationFee,
} from '../controllers/hospitalPricingController.js';
import authAdmin from '../middlewares/authadmin.js';

const router = express.Router();

// Admin routes (protected)
router.get('/admin/all', authAdmin, getAllPricing);
router.get('/admin/:id', authAdmin, getPricingBySpecialty);
router.post('/admin', authAdmin, createPricing);
router.put('/admin/:id', authAdmin, updatePricing);
router.delete('/admin/:id', authAdmin, deletePricing);

// Public route for getting consultation fee
router.get('/consultation-fee/:specialty', getDoctorConsultationFee);

export default router; 