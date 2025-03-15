import { v2 as cloudinary } from 'cloudinary'
import connectCloudinary from '../config/cloudinary.js'
import productModel from '../models/productModel.js'

//Function for add product
const addProduct = async (req, res) => {

    try {
        const { name, description,rate , price, category, subCategory, sizes, bestSeller } = req.body
        
        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item != undefined)

        await connectCloudinary()

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
                return result.secure_url;
            })
        )

        const productData = {
            name,
            description,
            category,
            rate:Number(rate),
            price: Number(price),
            subCategory,
            bestSeller: bestSeller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date:Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save();


        res.json({
            success: true,
            message:"Product added successfully"
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message:error.message
        })
    }

}

//Function for list product
const listProduct = async (req, res) => {

    try {
        const products = await productModel.find({});
        res.json({success:true,products})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

//Function for Removing product
const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({
            success: true,
            message: "Product removed successfully"
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId);
        res.json({success:true,product})
        
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// const updateProduct = async (req, res) => {
//     try {
//       const { productId, name, description, rate, price, category, subCategory, sizes, bestSeller } = req.body;
      
//       if (!productId) {
//         return res.json({ success: false, message: "Product ID required" });
//       }
  
//       const product = await productModel.findById(productId);
//       if (!product) {
//         return res.json({ success: false, message: "Product not found" });
//       }
  
//       // Update text fields
//       if (name) product.name = name;
//       if (description) product.description = description;
//       if (rate) product.rate = Number(rate);
//       if (price) product.price = Number(price);
//       if (category) product.category = category;
//       if (subCategory) product.subCategory = subCategory;
//       if (sizes) product.sizes = JSON.parse(sizes);
//       if (bestSeller !== undefined) product.bestseller = bestSeller === "true";
  
//       // Handle image updates
//       const images = [
//         req.files?.image1?.[0],
//         req.files?.image2?.[0],
//         req.files?.image3?.[0],
//         req.files?.image4?.[0]
//       ].filter(Boolean);
  
//       if (images.length > 0) {
//         await connectCloudinary();
//         const newImages = await Promise.all(images.map(async (item) => {
//           const result = await cloudinary.uploader.upload(item.path);
//           return result.secure_url;
//         }));
//         product.image = newImages;
//       }
        
        
  
//       await product.save();
//       res.json({ success: true, message: "Product updated successfully" });
  
//     } catch (error) {
//       console.error(error);
//       res.json({ success: false, message: error.message });
//     }
//   };


const updateProduct = async (req, res) => {
    try {
        const { productId, name, description, rate, price, category, subCategory, sizes, bestSeller } = req.body;

        if (!productId) {
            return res.json({ success: false, message: "Product ID required" });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        // Update text fields
        if (name) product.name = name;
        if (description) product.description = description;
        if (rate) product.rate = Number(rate);
        if (price) product.price = Number(price);
        if (category) product.category = category;
        if (subCategory) product.subCategory = subCategory;
        if (sizes) product.sizes = JSON.parse(sizes);
        if (bestSeller !== undefined) product.bestSeller = bestSeller === "true";

        // Initialize Cloudinary connection
        await connectCloudinary();

        // Ensure product.image has a length of 4
        if (!product.image) {
            product.image = new Array(4).fill(null);
        }

        // Process each image field
        if (req.files?.image1) {
            const result = await cloudinary.uploader.upload(req.files.image1[0].path);
            product.image[0] = result.secure_url;
        }
        if (req.files?.image2) {
            const result = await cloudinary.uploader.upload(req.files.image2[0].path);
            product.image[1] = result.secure_url;
        }
        if (req.files?.image3) {
            const result = await cloudinary.uploader.upload(req.files.image3[0].path);
            product.image[2] = result.secure_url;
        }
        if (req.files?.image4) {
            const result = await cloudinary.uploader.upload(req.files.image4[0].path);
            product.image[3] = result.secure_url;
        }

        await product.save();
        res.json({ success: true, message: "Product updated successfully" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};


export { addProduct, listProduct, removeProduct, singleProduct, updateProduct }