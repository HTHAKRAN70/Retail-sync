import mongoose from "mongoose";
import vendor from "./vendor.js";
import retailer from './retailer.js';
const chatSchema = new mongoose.Schema({
  participants: {
    retailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'retailer', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendor', required: true }
  },
  lastMessage: {
    sender: String, 
    text: String,
    timestamp: Date
  }
}, { timestamps: true });
const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
