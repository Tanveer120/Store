// backend/controllers/orderController.js
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Placing order using COD
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Validate that amount is provided
    if (!amount) {
      return res.status(400).json({ success: false, message: "Order amount is required." });
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Retrieve the user and update only the items that were ordered from the cartData field
    const user = await userModel.findById(userId);
    if (user) {
      // Clone the existing cartData
      let updatedCart = { ...user.cartData };

      // Loop through each ordered item
      items.forEach((orderedItem) => {
        // orderedItem should have a product id and size and quantity.
        // Use orderedItem._id if available, or orderedItem.id depending on your data shape.
        const prodId = orderedItem._id || orderedItem.id;
        const orderedQty = orderedItem.quantity;
        const size = orderedItem.size;

        if (updatedCart[prodId] && updatedCart[prodId][size]) {
          // Subtract the ordered quantity from the cart's quantity
          updatedCart[prodId][size] -= orderedQty;
          // If the remaining quantity is less than or equal to zero, remove that size entry
          if (updatedCart[prodId][size] <= 0) {
            delete updatedCart[prodId][size];
          }
          // If no sizes remain for the product, remove the product entry entirely
          if (Object.keys(updatedCart[prodId]).length === 0) {
            delete updatedCart[prodId];
          }
        }
      });

      // Update the user's cartData in MongoDB without clearing unselected items
      await userModel.findByIdAndUpdate(userId, { cartData: updatedCart });
    }

    res.json({
      success: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Placing order using Stripe
const placeOrderStripe = async (req, res) => {
  // Implementation for Stripe payment goes here.
};

// Placing order using Razorpay
const placeOrderRazorpay = async (req, res) => {
  // Implementation for Razorpay payment goes here.
};

// All orders for Admin panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User order data for frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({
      success: true,
      message: "Order data fetched successfully",
      orders,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Update order status from Admin
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus };
