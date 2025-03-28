// backend/controllers/orderController.js
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import Razorpay from "razorpay";

// Initialize Stripe and Razorpay using environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to send order email to admin
const sendOrderEmail = async (orderData) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  const itemsHtml = orderData.items
    .map(
      (item) =>
        `<li>${item.name} (Size: ${item.size}) - Quantity: ${item.quantity} - Price: ${item.price}</li>`
    )
    .join("");

  const mailOptions = {
    from: `"Order Notification" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: "New Order Placed",
    html: `
      <h3>New Order Placed</h3>
      <p><strong>User ID:</strong> ${orderData.userId}</p>
      <p><strong>Order Amount:</strong> ${orderData.amount}</p>
      <p><strong>Delivery Address:</strong></p>
      <p>
        ${orderData.address.firstName} ${orderData.address.lastName}<br/>
        ${orderData.address.street}, ${orderData.address.city}, ${orderData.address.state}, ${orderData.address.country} - ${orderData.address.zipcode}
      </p>
      <p><strong>Items:</strong></p>
      <ul>${itemsHtml}</ul>
      <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Placing order using COD
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
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

    // Update user's cartData
    const user = await userModel.findById(userId);
    if (user) {
      let updatedCart = { ...user.cartData };
      items.forEach((orderedItem) => {
        const prodId = orderedItem._id || orderedItem.id;
        const orderedQty = orderedItem.quantity;
        const size = orderedItem.size;
        if (updatedCart[prodId] && updatedCart[prodId][size]) {
          updatedCart[prodId][size] -= orderedQty;
          if (updatedCart[prodId][size] <= 0) {
            delete updatedCart[prodId][size];
          }
          if (Object.keys(updatedCart[prodId]).length === 0) {
            delete updatedCart[prodId];
          }
        }
      });
      await userModel.findByIdAndUpdate(userId, { cartData: updatedCart });
    }

    // Send admin email
    await sendOrderEmail({ ...orderData, userId });

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

// Placing order using Stripe Checkout Session
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: "Order amount is required." });
    }

    // Save the order with pending payment status
    const orderData = new orderModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    });
    const savedOrder = await orderData.save();

    // Create line items for Stripe Checkout Session
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "inr", // adjust as needed
        product_data: {
          name: item.name,
        },
        unit_amount: (item.price * 100) + (process.env.DELIVERY_FEE * 100), // amount in smallest currency unit
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: process.env.CLIENT_URL + `/order-success?session_id={CHECKOUT_SESSION_ID}&orderId=${savedOrder._id}`,
      cancel_url: process.env.CLIENT_URL + `/order-cancelled`,
      metadata: { userId, orderId: savedOrder._id.toString() },
    });

    res.json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Stripe Checkout Session creation error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe session
const verifyStripeSession = async (req, res) => {
  const { session_id, orderId } = req.query;
  if (!session_id || !orderId) {
    return res.status(400).json({ success: false, message: "Missing session_id or orderId" });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === "paid") {
      // Update the order to mark payment as complete
      await orderModel.findByIdAndUpdate(orderId, { payment: true });

      const order = await orderModel.findById(orderId);
      if (order) {
        // Send order confirmation email after successful payment
        await sendOrderEmail({
          userId: order.userId,
          items: order.items,
          address: order.address,
          amount: order.amount,
          paymentMethod: order.paymentMethod // Should be "Stripe"
        });
      }

      return res.json({ success: true, message: "Payment verified" });
    } else {
      return res.json({ success: false, message: "Payment not complete" });
    }
  } catch (error) {
    console.error("Error verifying stripe session:", error);
    res.status(500).json({ success: false, message: error.message });
  }
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

export { placeOrder, placeOrderStripe, allOrders, userOrders, updateStatus, verifyStripeSession };
