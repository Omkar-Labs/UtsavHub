import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in .env");
}

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_U18o8nZHTmw8E9",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "zzvEzYDz7k62QFu4rEm5B5TX",
});
