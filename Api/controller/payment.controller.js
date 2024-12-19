import Product from '../models/Product.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import Payment from '../models/Payment.js';

dotenv.config();
const stripeSecretKey = process.env.SECRET_KEY;
const stripeInstance = new Stripe(stripeSecretKey);
const getProduct = async (productId) => {
    const product = await Product.findById(productId);
    return product;
};
export const makePayment = async (req, res) => {
    try {
        const { products,vendor,retailer } = req.body;
        console.log("body",req.body);
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'No products provided for payment' });
        }
        const line_items = await Promise.all(
            products.map(async (item) => {
                const product = await getProduct(item.productId);
                
                const subtotal=product.price*(1-product.discount/100);
                const productprice = (subtotal * 0.05)+subtotal;
                return {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: product.name,
                            images: [product.image].filter(Boolean), 
                        },
                        unit_amount: Math.round(productprice * 100),
                    },
                    quantity: item.quantity,
                };
            })
        );

        // Create Stripe Checkout session
        const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: 'http://localhost:5173/home?tab=cart&&payment=success',
            cancel_url: 'http://localhost:5173/home?tab=cart&&payement=failure',
        });

        // Send session ID to the frontend
        res.status(200).json({ id: session.id });
    } catch (error) {
        console.error('Error creating payment session:', error.message);
        res.status(500).json({ error: error.message || 'Failed to create payment session' });
    }
};
export const getpayment = async (req, res, next) => {
    const { vendor_id } = req.params;
    console.log("aagya");
    try {
      // Use .lean() to get a plain JavaScript object instead of a Mongoose document
      const payment = await Payment.find({ Vendor_id: vendor_id }).lean();
      
      if (!payment) {
        console.log("asd",payment);
        return res.status(200).json({ message: 'You have not received any payment yet' });
      } else {
        return res.status(200).json(payment);
      }
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

