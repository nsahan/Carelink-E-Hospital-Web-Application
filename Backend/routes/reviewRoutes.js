import express from "express";
import { protectWithUser } from "../middleware/authMiddleware.js";
import {
  addReview,
  getDoctorReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", protectWithUser, addReview);
router.get("/doctor/:doctorId", getDoctorReviews);

export default router;
