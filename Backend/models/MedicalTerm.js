import mongoose from "mongoose";

const medicalTermSchema = new mongoose.Schema(
  {
    term: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    definition: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    relatedTerms: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("MedicalTerm", medicalTermSchema);
