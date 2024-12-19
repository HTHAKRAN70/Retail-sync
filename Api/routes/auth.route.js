import express from 'express';
import {signupretailer,signupvendor,verifyOtp } from '../controller/auth.controller.js'
import {signin ,sendOtp} from '../controller/auth.controller.js'
const router =express.Router();
router.post('/signupretailer',signupretailer);
router.post('/signupvendor',signupvendor);
router.post('/signin',signin);
router.post('/send-otp',sendOtp);
router.post('/verify-otp',verifyOtp);
export default router;