import express from 'express';
import { 
  placeOrder, 
  placeOrderStripe, 
  allOrders, 
  userOrders, 
  updateStatus, 
  verifyStripeSession, 
  addCustomOrder,
  allCustomOrders,       // Added for listing all custom orders (Admin)
  userCustomOrders,      // Added for listing user-specific custom orders
  updateCustomOrderStatus // Added for updating custom order status (Admin)
} from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

// Admin features
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);
// New custom order routes for admin
orderRouter.post('/customorder/list', adminAuth, allCustomOrders);
orderRouter.post('/customorder/status', adminAuth, updateCustomOrderStatus);

// Payment features
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.get('/verify', verifyStripeSession);

// User features
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.post('/custom-order', authUser, addCustomOrder);
// New route for fetching a user's custom orders
orderRouter.post('/customorder/user', authUser, userCustomOrders);

export default orderRouter;
