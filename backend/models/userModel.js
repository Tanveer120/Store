// backend/models/userModel.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    size: { type: String, required: true },
    quantity: { type: Number, default: 1 },
  },
  { _id: false } // We don't need a separate _id for each cart item
);

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipcode: { type: String },
  country: { type: String },
  isPhoneVerified: { type: Boolean, default: false },
  useForOrders: { type: Boolean, default: false },
  cartData: { type: Object, default: {} }, // existing field, if still used
  cart: { type: [cartItemSchema], default: [] }, // new cart field for easier retrieval and updates
  isBanned: { type: Boolean, default: false },
  banReason: { type: String, default: "" }
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
