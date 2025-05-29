import About from "../models/about.js";
import AboutContent from "../models/aboutContent.js";

export const getAboutContent = async (req, res) => {
  try {
    let content = await About.findOne();

    if (!content) {
      content = await About.create({
        heroTitle: "Revolutionizing Healthcare with CARELINK",
        heroSubtitle: "Your all-in-one healthcare companion",
        visionTitle: "Our Vision",
        visionDescription:
          "At Carelink, we envision a world where quality healthcare is accessible to everyone.",
        stats: [
          { label: "Patients Served", value: "500K+", subtitle: "" },
          { label: "Medical Professionals", value: "3,000+", subtitle: "" },
          { label: "Patient Satisfaction", value: "98%", subtitle: "" },
          { label: "Around-the-clock Care", value: "24/7", subtitle: "" },
        ],
        services: [
          {
            title: "Emergency Services",
            description:
              "24/7 emergency consultations with rapid response teams.",
            icon: "AlertCircle",
          },
          {
            title: "AI Health Assistant",
            description: "AI-powered symptom assessment and health monitoring.",
            icon: "Brain",
          },
          {
            title: "E-Pharmacy",
            description: "Order prescriptions with fast delivery.",
            icon: "Pill",
          },
        ],
        values: [
          {
            title: "Patient-Centered",
            description: "We put patients first in everything we do.",
            icon: "Users",
          },
          {
            title: "Privacy & Security",
            description: "Highest standards of data protection.",
            icon: "Shield",
          },
          {
            title: "Excellence",
            description: "Striving for excellence in every service.",
            icon: "Star",
          },
        ],
      });
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Error fetching about content:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching about content",
      error: error.message,
    });
  }
};

export const updateAboutContent = async (req, res) => {
  try {
    const {
      heroTitle,
      heroSubtitle,
      visionTitle,
      visionDescription,
      stats,
      services,
      values,
    } = req.body;

    if (!heroTitle || !heroSubtitle || !visionTitle || !visionDescription) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const content = await About.findOneAndUpdate(
      {},
      {
        heroTitle,
        heroSubtitle,
        visionTitle,
        visionDescription,
        stats: Array.isArray(stats) ? stats : [],
        services: Array.isArray(services) ? services : [],
        values: Array.isArray(values) ? values : [],
        lastUpdated: Date.now(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: content,
      message: "About content updated successfully",
    });
  } catch (error) {
    console.error("About content update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating about content",
      error: error.message,
    });
  }
};

export const getContent = async (req, res) => {
  try {
    let content = await AboutContent.findOne();

    if (!content) {
      // Create default content
      content = await AboutContent.create({
        heroTitle: "Revolutionizing Healthcare with CARELINK",
        heroSubtitle: "Your all-in-one healthcare companion",
        visionTitle: "Our Vision",
        visionDescription:
          "At Carelink, we envision a world where quality healthcare is accessible to everyone.",
        stats: [
          {
            label: "Patients Served",
            value: "500K+",
            subtitle: "Happy Patients",
          },
          {
            label: "Medical Professionals",
            value: "3,000+",
            subtitle: "Expert Doctors",
          },
          {
            label: "Patient Satisfaction",
            value: "98%",
            subtitle: "Success Rate",
          },
          {
            label: "Around-the-clock Care",
            value: "24/7",
            subtitle: "Always Available",
          },
        ],
        services: [
          {
            title: "Emergency Services",
            description:
              "24/7 emergency consultations with rapid response teams.",
            icon: "AlertCircle",
          },
        ],
        values: [
          {
            title: "Patient-Centered",
            description: "We put patients first in everything we do.",
            icon: "Users",
          },
        ],
      });
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Error fetching about content:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching content",
      error: error.message,
    });
  }
};

export const updateContent = async (req, res) => {
  try {
    const content = await AboutContent.findOneAndUpdate(
      {},
      { ...req.body, lastUpdated: Date.now() },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Error updating about content:", error);
    res.status(500).json({
      success: false,
      message: "Error updating content",
      error: error.message,
    });
  }
};
