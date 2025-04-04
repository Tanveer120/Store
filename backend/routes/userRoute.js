import express from "express";
import { initiateRegistration, completeRegistration, loginUser, adminLogin, updateUserProfile, getUserProfile, listUsers, banUser, unbanUser } from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register/initiate", initiateRegistration);
userRouter.post("/register/complete", completeRegistration);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.get("/profile/getUpdateProfile", authUser, getUserProfile);
userRouter.put("/profile/updateProfile", authUser, updateUserProfile);
userRouter.get('/list', listUsers);
userRouter.post('/ban', banUser);
userRouter.post('/unban', unbanUser);

export default userRouter;