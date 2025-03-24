// backend/controllers/cartController.js
import userModel from "../models/userModel.js";

// Add a product to the user's cart (using the new cart field)
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, size } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Check if the product already exists in the cart for the given size
    const existingItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );
    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].quantity += 1;
    } else {
      user.cart.push({ product: productId, size, quantity: 1 });
    }
    await user.save();
    res.json({ success: true, message: "Product added to cart", cart: user.cart });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Update a product's quantity in the cart
export const updateCart = async (req, res) => {
  try {
    const { userId, productId, size, quantity } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );
    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove the item if quantity is zero or less
        user.cart.splice(itemIndex, 1);
      } else {
        user.cart[itemIndex].quantity = quantity;
      }
      await user.save();
      res.json({ success: true, message: "Cart updated successfully", cart: user.cart });
    } else {
      res.json({ success: false, message: "Item not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get the user's cart (using the new cart field)
export const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId).populate("cart.product");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      message: "Cart data fetched successfully",
      cart: user.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
