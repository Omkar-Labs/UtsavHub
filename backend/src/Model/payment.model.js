import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true, // in INR (e.g. 150)
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["Created", "Captured", "Failed"],
      default: "Created",
      index: true,
    },
    receipt: {
      type: String,
      required: true,
    },
    payoutBank: {
      accountHolderName: String,
      bankName: String,
      accountNumberMasked: String, // e.g. "XXXX-XXXX-1234" (Safe storage)
      ifscCode: String,
      upiId: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model("Payment", paymentSchema);
