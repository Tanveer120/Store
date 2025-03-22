import mongoose from "mongoose";

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
  cartData: { type: Object, default: {} },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String, default: "" }
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
