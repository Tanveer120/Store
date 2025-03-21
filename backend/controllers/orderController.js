import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"

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

    try{

        const orders = await orderModel.find({})
        res.json({success:true,orders})

    }
    catch (error) {
        
        console.log(error)
        res.json({success:false,message:error.message})

    }
    
}

// User order data for frontend
const userOrders = async (req, res) => {

    try {
        const {userId} = req.body

        const orders = await orderModel.find({ userId });
        res.json({
            success: true,
            message: "Order data fetched successfully",
            orders
        })
    }
    catch(error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
    
}

// Update order status from Admin
const updateStatus = async (req, res) => {

    try {
        const { orderId, status } = req.body;
        
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({
            success: true,
            message: "Order status updated successfully"
        })
    }
    catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
    
}

export { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus }