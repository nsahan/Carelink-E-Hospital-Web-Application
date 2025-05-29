import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getContent, updateContent } from "../controllers/aboutController.js";

const router = express.Router();

router.route("/content").get(getContent).put(protect, updateContent);

export default router;
