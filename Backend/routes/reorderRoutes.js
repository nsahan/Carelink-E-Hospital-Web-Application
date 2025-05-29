import express from "express";
import * as reorderController from "../controllers/ReorderController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/initiate", verifyAdmin, reorderController.initiateReorder);
router.get("/requests", verifyAdmin, reorderController.getReorderRequests);
router.patch(
  "/requests/:id",
  verifyAdmin,
  reorderController.updateReorderStatus
);

export default router;
