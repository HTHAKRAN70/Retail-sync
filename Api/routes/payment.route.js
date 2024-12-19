import express from 'express';
import {makePayment,getpayment } from '../controller/payment.controller.js'; // Named import
import { verifytoken } from '../Utils/verifyuser.js';
const router = express.Router();

router.post('/makepayment',verifytoken, makePayment);
router.get('/getpayment/:vendor_id',getpayment);

export default router;
