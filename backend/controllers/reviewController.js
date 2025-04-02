// controllers/reviewController.js
import Review from "../models/reviewModel.js";
import Order from "../models/orderModel.js";

export const createReview = async (req, res) => {
  try {
    const { product, rating, comment, userId } = req.body;

    // Check if the user has already reviewed this product
    const existingReview = await Review.findOne({ product, user: userId });
    if (existingReview) {
      return res.status(200).json({
        status: 400,
        message: "You have already reviewed this product.",
      });
    }

    // Check if the user has an order that includes this product and is delivered
    const deliveredOrder = await Order.findOne({
      userId: userId,
      status: "Delivered",
      items: { $elemMatch: { id: product } },
    });

    if (!deliveredOrder) {
      return res.status(200).json({
        status: 400,
        message: "You can only review products that you have purchased and have been delivered.",
      });
    }

    // Create the review (it will be pending approval by default)
    const review = new Review({
      product,
      user: userId,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json({ message: "Review submitted successfully and awaits approval" });
  } catch (error) {
    console.error("Error in createReview:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get reviews for a specific product (only approved reviews)
export const getReviewsByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ product: productId, approved: true })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// controllers/reviewController.js

// List pending reviews for admin review
export const getPendingReviews = async (req, res) => {
  try {
    const pendingReviews = await Review.find({approved:false})
      .populate("user", "name email")
      .populate("product", "name");
    // log("Pending reviews:", pendingReviews);
      // console.log(pendingReviews);
    res.json(pendingReviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Approve a review
export const approveReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const review = await Review.findByIdAndUpdate(reviewId, { approved: true }, { new: true });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review approved successfully", review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject (or delete) a review
export const rejectReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review rejected and removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
