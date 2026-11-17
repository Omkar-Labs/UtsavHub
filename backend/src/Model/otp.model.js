import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  // MongoDB TTL index: Document will automatically delete 300 seconds (5 mins) after createdAt
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes
  },
});

export const OTP = mongoose.model("OTP", otpSchema);
