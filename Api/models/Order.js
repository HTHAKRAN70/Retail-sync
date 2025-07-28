import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

// Create a custom nanoid generator
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10); // 10-character alphanumeric ID

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required:true, // Automatically generate orderId
    },
    shippingInfo: {
        name:{
          type:String,
          required:true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
    
        country: {
          type: String,
          required: true,
        },
        pinCode: {
          type: Number,
          required: true,
        },
        phoneNo: {
          type: Number,
          required: true,
        },
        Landmark:{
          type:String,
          required:true,
        },
      },
    retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'retailer', required: true }, 
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'vendor', required: true }, 
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
    }],
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    orderprices:{
        type:Object,
        required:true,
    },
    phone_no: {
        type: Number,
        required: true, 
    },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
