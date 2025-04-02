// routes/reviewRoute.js
import express from 'express';
import {
  createReview,
  getReviewsByProduct,
  getPendingReviews,
  approveReview,
  rejectReview,
} from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';  // You would create a middleware to check if the user is admin

const reviewRouter = express.Router();

// Public route to get approved reviews for a product
reviewRouter.get('/:productId', getReviewsByProduct);

// Protected route for creating a review
reviewRouter.post('/', authUser, createReview);

// Admin-only routes for moderating reviews
reviewRouter.get('/admin/pending', adminAuth, getPendingReviews);
reviewRouter.patch('/admin/:reviewId/approve', adminAuth, approveReview);
reviewRouter.delete('/admin/:reviewId/reject', adminAuth, rejectReview);

export default reviewRouter;
