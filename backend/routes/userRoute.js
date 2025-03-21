import express from "express";
import { initiateRegistration, completeRegistration, loginUser, adminLogin } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register/initiate", initiateRegistration);
userRouter.post("/register/complete", completeRegistration);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);

export default userRouter;