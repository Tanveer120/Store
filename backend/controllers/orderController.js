import orderModel from "../models/orderModel.js"

// Placing order using COD
const placeOrder = async (req, res) => {

    try {

        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        res.json({
            success: true,
            message: "Order placed successfully"
        })
        
    } catch (error) {

        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
        
    }
    
}

// Placing order using Stripe
const placeOrderStripe = async (req, res) => {
    
}

// Placing order using Razorpay
const placeOrderRazorpay = async (req, res) => {
    
}

// All orders for Admin panel
const allOrders = async (req, res) => {
    
}

// User order data for frontend
const userOrders = async (req, res) => {
    
}

// Update order status from Admin
const updateStatus = async (req, res) => {
    
}

export { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus }