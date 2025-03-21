// routes/reviewRoute.js
import express from 'express';
import { createReview, getReviewsByProduct } from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js';

const reviewRouter = express.Router();

// Route to create a review (protected)
reviewRouter.post('/', authUser, createReview);

// Route to get reviews for a product
reviewRouter.get('/:productId', getReviewsByProduct);

export default reviewRouter;