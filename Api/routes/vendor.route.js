import express from 'express';
import  { verifytoken } from '../Utils/verifyuser.js';
import { getvendor,deletevendor,signout,getvendorproducts } from '../controller/vendor.controller.js';

const router =express.Router();
router.get('/getvendors',verifytoken,getvendor);
router.get('/getvendorsproducts',getvendorproducts);
router.delete('/delete/:vendorId',verifytoken,deletevendor);
router.post('/signout',signout);
export default router;
