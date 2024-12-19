import mongoose, { Mongoose } from "mongoose";

const Payment = new mongoose.Schema({
  Retailer: { type: String, required: true },
  Vendor_id:{ type: mongoose.Schema.Types.ObjectId,required:true},
  retailer_id:{type: mongoose.Schema.Types.ObjectId,required:true},
  Vendor: { type: String, required: true },
  Order_id:{type:String,required:true,unique: true,},
  Amount: { type: String, required: true },
  Date:{ type:String,required:true},
}, { timestamps: true });

export default mongoose.model("Payment", Payment);