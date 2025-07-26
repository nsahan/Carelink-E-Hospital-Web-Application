import About from "../models/about.js";

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
    let content = await About.findOne();

    if (!content) {
      // Create default content
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
          {
            title: "Virtual Consultations",
            description: "Connect with certified specialists from various medical fields through secure video calls.",
            icon: "Globe",
          },
          {
            title: "24/7 Support",
            description: "Our dedicated support team is always available to assist you.",
            icon: "Clock",
          },
          {
            title: "Digital Health Records",
            description: "Securely store and access your medical history, test results, prescriptions, and appointments.",
            icon: "Shield",
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
          {
            title: "Innovation",
            description: "We continuously evolve and improve our services through technological innovation.",
            icon: "Award",
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

export const updateContent = async (req, res) => {
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
    console.error("Error updating about content:", error);
    res.status(500).json({
      success: false,
      message: "Error updating about content",
      error: error.message,
    });
  }
};
