import { ReorderService } from "../services/ReorderService.js";
import ReorderSystem from "../models/ReorderSystem.js";

export const initiateReorder = async (req, res) => {
  try {
    const { medicineId, quantity, notes } = req.body;
    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    const reorder = await ReorderService.initiateReorder(medicine);
    res.status(201).json(reorder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReorderRequests = async (req, res) => {
  try {
    const { status, urgency } = req.query;
    const query = {};

    if (status) query.status = status;
    if (urgency) query.urgency = urgency;

    const reorders = await ReorderSystem.find(query)
      .populate("medicineId")
      .sort("-createdAt");

    res.json(reorders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReorderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const reorder = await ReorderSystem.findById(req.params.id);

    if (!reorder) {
      return res.status(404).json({ message: "Reorder request not found" });
    }

    reorder.status = status;
    reorder.history.push({
      status,
      date: new Date(),
      updatedBy: req.user.name,
      notes,
    });

    if (status === "completed") {
      await Medicine.findByIdAndUpdate(reorder.medicineId, {
        $inc: { stock: reorder.quantity },
      });
    }

    await reorder.save();
    res.json(reorder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
