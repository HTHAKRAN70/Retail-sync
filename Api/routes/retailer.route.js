import express from 'express';
import  { verifytoken } from '../Utils/verifyuser.js';
// import { getvendor,deletevendor,signout } from '../controller/vendor.controller.js';
import {getretailer,deleteretailer,signout} from '../controller/retalier.controller.js';
const router =express.Router();
router.get('/getretailer',verifytoken,getretailer);
router.delete('/delete/:retailerId',verifytoken,deleteretailer);
router.post('/signout',signout);
export default router;