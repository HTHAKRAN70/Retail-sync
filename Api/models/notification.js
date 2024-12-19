import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  vendorId: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
