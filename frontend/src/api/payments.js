import api from "./axios";

export const paymentsApi = {
  // Create Razorpay payment order
  createOrder: async ({ eventId, amount }) => {
    const res = await api.post("/payments/create-order", { eventId, amount });
    return res.data;
  },

  // Verify Razorpay payment signature & issue registration ticket
  verifyPayment: async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    eventId,
    teamName,
    teamMembers,
  }) => {
    const res = await api.post("/payments/verify-payment", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      teamName,
      teamMembers,
    });
    return res.data;
  },

  // Get revenue analytics for an event (Admin only)
  getRevenue: async (eventId) => {
    const res = await api.get(`/payments/revenue/${eventId}`);
    return res.data;
  },
};
