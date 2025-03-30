import mongoose from "mongoose";

const customOrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  tshirtColor: { type: String, required: true },
  model: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true }
  },
  decal: {
    imageUrl: { type: String },
    position: {
      x: { type: Number},
      y: { type: Number},
      z: { type: Number}
    },
    rotation: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    scale: {
      x: { type: Number},
      y: { type: Number},
      z: { type: Number}
    },
    // For text decals, capture the text color
    textColor: { type: String, default: "#000000" },
    // Optional text field if the decal is a text decal
    textContent: { type: String, default: "" },
    // Optional separate text position (if different from the decal position)
    textPosition: {
      x: { type: Number },
      y: { type: Number },
      z: { type: Number }
    }
  },
  price: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, required: true, default: "Order Placed" },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  date: { type: Number, required: true }
});

const customOrderModel =
  mongoose.models.CustomOrder ||
  mongoose.model("CustomOrder", customOrderSchema);

export default customOrderModel;
