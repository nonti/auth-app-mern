import express from 'express';
import { register, login, logout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOTP, resetPassword } from '../controllers/authController.js';
import userAuth from '../middlewares/userAuth.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.post('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOTP);
authRouter.post('/reset-password', resetPassword);

export default authRouter;