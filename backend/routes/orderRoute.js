import express from 'express';
import { placeOrder, placeOrderStripe, allOrders, userOrders, updateStatus, verifyStripeSession, addCustomOrder } from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

//Admin feature
orderRouter.post('/list',adminAuth, allOrders);
orderRouter.post('/status',adminAuth, updateStatus);

//Payment feature
orderRouter.post('/place',authUser, placeOrder);
orderRouter.post('/stripe',authUser, placeOrderStripe);
orderRouter.get('/verify', verifyStripeSession);

//User feature
orderRouter.post('/userorders', authUser, userOrders);

orderRouter.post('/custom-order', authUser, addCustomOrder);

export default orderRouter;
