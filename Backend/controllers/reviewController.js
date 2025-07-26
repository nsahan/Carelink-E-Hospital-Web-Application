import Review from "../models/Review.js";
import Doctor from "../models/doctor.js";

export const addReview = async (req, res) => {
  try {
    const { doctorId, rating, review } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if user has already reviewed this doctor
    const existingReview = await Review.findOne({
      doctor: doctorId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this doctor",
      });
    }

    const newReview = await Review.create({
      doctor: doctorId,
      user: req.user._id,
      rating,
      review,
    });

    const populatedReview = await Review.findById(newReview._id)
      .populate("user", "name email image")
      .populate("doctor", "name");

    res.status(201).json({
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating review",
    });
  }
};

export const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await Review.find({ doctor: doctorId })
      .populate("user", "name image")
      .populate("doctor", "name")
      .sort("-createdAt");

    // Calculate average rating
    const avgRating =
      reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;

    res.json({
      success: true,
      data: {
        reviews,
        totalReviews: reviews.length,
        averageRating: avgRating || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
