import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET)
}

// Route for Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if(!user){
            return res.json({
                success: false,
                message: "User not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id);
            res.json({
                success: true,
                message: "User logged in successfully",
                token
            })
        }else{
            return res.json({
                success: false,
                message: "Incorrect password"
            })
        }

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Route for Register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        
        //Checking user already exist or not
        const exists = await userModel.findOne({ email });
        if (exists){
            return res.json({
                success: false,
                message: "User already exist"
            })
        }

        //Validating Email format and strong password
        if(!validator.isEmail(email)){
            return res.json({
                success: false,
                message: "Invalid Email"
            })
        }

        if(password.length < 8){
            return res.json({
                success: false,
                message: "Password should be strong"
            })
        }

        //hashing password

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save();

        const token = createToken(user._id);

        res.json({
            success: true,
            message: "User registered successfully",
            token
        })



    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Route for Admin
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({
                success: true,
                message: "Admin logged in successfully",
                token
            })
        }
        else{
            res.json({
                success: false,
                message: "Invalid credentials"
            })
        }
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

export { loginUser, registerUser, adminLogin }