import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOtp, verifyOtp } from "../utils/otpService.js"; // Assume you have a utility for OTP

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
        const { name, email, password, phoneNumber } = req.body;
        
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

        // Send OTP to phone number
        const otpSent = await sendOtp(phoneNumber);
        if (!otpSent) {
            return res.json({
                success: false,
                message: "Failed to send OTP"
            });
        }

        //hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            phoneNumber
        });

        const user = await newUser.save();

        const token = createToken(user._id);

        res.json({
            success: true,
            message: "User registered successfully. Please verify your phone number.",
            token
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Route for verifying OTP
const verifyPhoneNumber = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        const isVerified = await verifyOtp(phoneNumber, otp);

        if (isVerified) {
            await userModel.updateOne({ phoneNumber }, { isPhoneVerified: true });
            return res.json({
                success: true,
                message: "Phone number verified successfully"
            });
        } else {
            return res.json({
                success: false,
                message: "Invalid OTP"
            });
        }
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}
// Route for initiating registration
const initiateRegistration = async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        // Check if user already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({
                success: false,
                message: "User already exists"
            });
        }

        // Validate email format and strong password
        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: "Invalid Email"
            });
        }

        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Password should be strong"
            });
        }

        // Send OTP to phone number
        const otpSent = await sendOtp(phoneNumber);
        if (!otpSent) {
            return res.json({
                success: false,
                message: "Failed to send OTP"
            });
        }

        res.json({
            success: true,
            message: "OTP sent to phone number. Please verify to complete registration."
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}

// Route for verifying OTP and completing registration
const completeRegistration = async (req, res) => {
    try {
        const { name, email, password, phoneNumber, otp } = req.body;
        console.log(name,email,password,phoneNumber,otp)

        // Verify OTP
        const isVerified = await verifyOtp(phoneNumber, otp);
        if (!isVerified) {
            return res.json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user to database
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            isPhoneVerified: true
        });

        const user = await newUser.save();

        const token = createToken(user._id);

        res.json({
            success: true,
            message: "User registered successfully",
            token
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
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

// Route for updating user profile
// Route for updating user profile
const updateUserProfile = async (req, res) => {
    try {
      // Use the userId set by auth middleware in req.body.userId
      const user = await userModel.findById(req.body.userId);
      if (!user) {
        return res.json({
          success: false,
          message: "User not found",
        });
      }
  
      // Update only provided fields (update useForOrders correctly)
      user.firstname = req.body.firstname || user.firstname;
      user.lastname = req.body.lastname || user.lastname;
      user.email = req.body.email || user.email;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      user.street = req.body.street || user.street;
      user.city = req.body.city || user.city;
      user.state = req.body.state || user.state;
      user.zipcode = req.body.zipcode || user.zipcode;
      user.country = req.body.country || user.country;
      // Use nullish coalescing to allow false values
      user.useForOrders = req.body.useForOrders ?? user.useForOrders;
  
      const updatedUser = await user.save();
      res.json({
        success: true,
        message: "User profile updated successfully",
        updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.json({
        success: false,
        message: error.message,
      });
    }
  };
  
  
// Route for getting user profile
// Route for getting user profile
const getUserProfile = async (req, res) => {
    try {
      const user = await userModel.findById(req.body.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  

// export { loginUser, registerUser, adminLogin, verifyPhoneNumber }
export { loginUser, initiateRegistration, completeRegistration, adminLogin, updateUserProfile, getUserProfile }