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
      items: { $elemMatch: { id: product } },  // Changed _id to id
    });

    if (!deliveredOrder) {
      return res.status(200).json({
        status: 400,
        message: "You can only review products that you have purchased and have been delivered.",
      });
    }

    // Create the review now that we've verified the order status
    const review = new Review({
      product,
      user: userId,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error("Error in createReview:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get reviews for a specific product
export const getReviewsByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ product: productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews); // Make sure this is an array.
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
