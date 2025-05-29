import MedicalTerm from "../models/MedicalTerm.js";
import asyncHandler from "express-async-handler";

// @desc    Get all medical terms
// @route   GET /api/medical-terms
// @access  Public
export const getAllTerms = asyncHandler(async (req, res) => {
  const terms = await MedicalTerm.find().sort({ term: 1 });
  res.json(terms);
});

// @desc    Get single medical term
// @route   GET /api/medical-terms/:id
// @access  Public
export const getTerm = asyncHandler(async (req, res) => {
  const term = await MedicalTerm.findById(req.params.id);
  if (!term) {
    res.status(404);
    throw new Error("Medical term not found");
  }
  res.json(term);
});

// @desc    Create medical term
// @route   POST /api/medical-terms
// @access  Private/Admin
export const createTerm = asyncHandler(async (req, res) => {
  const { term, definition, category, relatedTerms } = req.body;

  const termExists = await MedicalTerm.findOne({ term: term.trim() });
  if (termExists) {
    res.status(400);
    throw new Error("Medical term already exists");
  }

  const newTerm = await MedicalTerm.create({
    term: term.trim(),
    definition,
    category: category.trim(),
    relatedTerms: relatedTerms.filter((t) => t.trim()),
  });

  res.status(201).json(newTerm);
});

// @desc    Update medical term
// @route   PUT /api/medical-terms/:id
// @access  Private/Admin
export const updateTerm = asyncHandler(async (req, res) => {
  const { term, definition, category, relatedTerms } = req.body;

  const existingTerm = await MedicalTerm.findById(req.params.id);
  if (!existingTerm) {
    res.status(404);
    throw new Error("Medical term not found");
  }

  const duplicateTerm = await MedicalTerm.findOne({
    term: term.trim(),
    _id: { $ne: req.params.id },
  });
  if (duplicateTerm) {
    res.status(400);
    throw new Error("This term name is already taken");
  }

  existingTerm.term = term.trim();
  existingTerm.definition = definition;
  existingTerm.category = category.trim();
  existingTerm.relatedTerms = relatedTerms.filter((t) => t.trim());

  const updatedTerm = await existingTerm.save();
  res.json(updatedTerm);
});

// @desc    Delete medical term
// @route   DELETE /api/medical-terms/:id
// @access  Private/Admin
export const deleteTerm = asyncHandler(async (req, res) => {
  const term = await MedicalTerm.findById(req.params.id);
  if (!term) {
    res.status(404);
    throw new Error("Medical term not found");
  }

  await term.deleteOne();
  res.json({ message: "Medical term removed" });
});
