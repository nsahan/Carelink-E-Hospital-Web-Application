import mongoose from "mongoose";

const aboutContentSchema = new mongoose.Schema({
  heroTitle: String,
  heroSubtitle: String,
  visionTitle: String,
  visionDescription: String,
  stats: [
    {
      label: String,
      value: String,
      subtitle: String,
    },
  ],
  services: [
    {
      title: String,
      description: String,
      icon: String,
    },
  ],
  values: [
    {
      title: String,
      description: String,
      icon: String,
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("AboutContent", aboutContentSchema);
