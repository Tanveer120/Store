// models/reviewModel.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Matches your productModel.js model name
      required: [true, "Review must be associated with a product"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Matches your userModel.js model name
      required: [true, "Review must be associated with a user"],
    },
    rating: {
      type: Number,
      required: [true, "Please add a rating between 1 and 5"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      required: [true, "Please add a review comment"],
    },
    approved: {
      type: Boolean,
      default: false,  // New reviews are not approved by default
    },
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
