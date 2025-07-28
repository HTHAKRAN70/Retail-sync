import mongoose from "mongoose";
const messageSchema =new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    senderType: { type: String, enum: ['retailer', 'vendor'], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false }
});
const Message=mongoose.model('Message',messageSchema);;
export default Message;