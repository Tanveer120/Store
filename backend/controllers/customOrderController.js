import { v2 as cloudinary } from 'cloudinary';
import connectCloudinary from '../config/cloudinary.js';
import customOrderModel from '../models/customOrderModel.js';

const addCustomOrder = async (req, res) => {
  try {
    const {
      userId,
      tshirtColor,
      model,
      decal, // decal is expected to include position, rotation, scale, and possibly textColor
        price,
        address,
        status,
        paymentMethod,
      payment
    } = req.body;
    
    // If the decal image is being sent as a file, upload it to Cloudinary:
    let imageUrl = decal.imageUrl;
    if (req.files && req.files.decalImage && req.files.decalImage[0]) {
      await connectCloudinary();
      const result = await cloudinary.uploader.upload(req.files.decalImage[0].path, {
        resource_type: "image"
      });
      imageUrl = result.secure_url;
    }

    // Create the order document
    const orderData = {
      userId,
      tshirtColor,
      model, // { id, name, url }
      decal: {
        ...decal,
        imageUrl, // update with the Cloudinary URL if uploaded
      },
        price: Number(price),
        address,
        status,
        paymentMethod,
      payment,
      date: Date.now()
    };

    const customOrder = new customOrderModel(orderData);
    await customOrder.save();

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export { addCustomOrder };
