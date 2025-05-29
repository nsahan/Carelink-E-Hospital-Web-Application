import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      required: true,
      default: "Revolutionizing Healthcare with CARELINK",
    },
    heroSubtitle: {
      type: String,
      required: true,
      default: "Your all-in-one healthcare companion",
    },
    visionTitle: {
      type: String,
      required: true,
      default: "Our Vision",
    },
    visionDescription: {
      type: String,
      required: true,
      default: "At Carelink, we envision a world where quality healthcare is accessible to everyone.",
    },
    stats: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        subtitle: { type: String },
      },
    ],
    services: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true },
      },
    ],
    values: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("About", aboutSchema);