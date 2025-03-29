import express from "express";
const router = express.Router();

// Add your route handlers here
router.get("/", (req, res) => {
  res.send("Doctor routes working");
});

export default router;
