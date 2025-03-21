import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    zipcode: { type: String, required: false },
    country: { type: String, required: false },
    isPhoneVerified: { type: Boolean, default: false },
    useForOrders: { type: Boolean, default: false },
    cartData: { type: Object, default: {} }
},{minimize: false});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;