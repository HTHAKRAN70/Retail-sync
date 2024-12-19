import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiryTime: { type: Date, required: true },
});

export default mongoose.model("Otp", otpSchema);