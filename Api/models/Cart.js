import mongoose from "mongoose";
import Product from './Product.js';
import vendor from "./vendor.js";
import retailer from './retailer.js';
const CartSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  items: [
    {
      vendor: { type: mongoose.Schema.Types.ObjectId,ref:'vendor'},
      products: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId,ref:'Product' },
          quantity: { type: Number, required: true, min: 1 }
        },
      ],
    },
  ],
}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);
export default Cart;