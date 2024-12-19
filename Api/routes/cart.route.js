import express from 'express';
import { addtocart ,getcart,deleteFromCart } from '../controller/cart.controller.js'; // Named import
import { verifytoken } from '../Utils/verifyuser.js';
const router = express.Router();

router.post('/add',verifytoken, addtocart);
router.get('/getcart',verifytoken,getcart);
router.delete('/deletefromcart',deleteFromCart);

export default router;
