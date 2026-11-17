import crypto from "crypto";
import { razorpayInstance } from "../utils/razorpay.js";
import { Payment } from "../Model/payment.model.js";
import { Event } from "../Model/event.model.js";
import { Registration } from "../Model/registration.model.js";

/**
 * 1. Create Razorpay Order
 * Endpoint: POST /api/v1/payments/create-order
 */
export const createOrderController = async (req, res) => {
  try {
    const { eventId, amount } = req.body;

    let orderAmount = amount;

    // If eventId provided, fetch and verify event fee
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }

      if (!event.isPaid) {
        return res.status(400).json({ success: false, message: "This event is free to attend. No payment required." });
      }

      orderAmount = event.registrationFee;
    }

    if (!orderAmount || Number(orderAmount) <= 0) {
      return res.status(400).json({ success: false, message: "A valid positive amount is required" });
    }

    // Convert amount in INR to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(orderAmount) * 100);

    // Validation: Minimum amount in Razorpay is 100 paise (₹1)
    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum payment amount must be at least ₹1 (100 paise)",
      });
    }

    const receipt = `rcpt_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        eventId: eventId || "",
        studentId: req.user?._id?.toString() || "",
        studentEmail: req.user?.email || "",
      },
    };

    // Call Razorpay API to create order
    const order = await razorpayInstance.orders.create(options);

    // Pre-record order in database
    if (eventId && req.user?._id) {
      await Payment.create({
        event: eventId,
        student: req.user._id,
        razorpayOrderId: order.id,
        amount: Number(orderAmount),
        currency: order.currency,
        status: "Created",
        receipt: order.receipt,
      });
    }

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_U18o8nZHTmw8E9",
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Razorpay payment order",
      error: error?.message || error,
    });
  }
};

/**
 * 2. Verify Razorpay Payment Signature
 * Endpoint: POST /api/v1/payments/verify-payment
 */
export const verifyPaymentController = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      teamName,
      teamMembers = [],
    } = req.body;

    // Edge Case: Missing required parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment credentials (order_id, payment_id, or signature required)",
      });
    }

    // Step: Generate HMAC SHA256 signature using SECRET
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "zzvEzYDz7k62QFu4rEm5B5TX")
      .update(body.toString())
      .digest("hex");

    // Secure timing-safe comparison to prevent timing attacks
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(razorpay_signature, "utf-8")
    );

    if (!isSignatureValid) {
      // Signature mismatch: Return 400 and NEVER mark as paid
      return res.status(400).json({
        success: false,
        status: "failed",
        message: "Payment signature verification failed. Untrusted or tampered transaction.",
      });
    }

    // Signature matches! Update payment status in database
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "Captured",
      },
      { new: true }
    );

    let ticket = null;

    // If this payment was for event registration, create or confirm the registration and issue digital ticket
    if (eventId && req.user?._id) {
      const event = await Event.findById(eventId);
      if (event) {
        // Check if student is already registered
        let registration = await Registration.findOne({ event: eventId, student: req.user._id });

        if (!registration) {
          const ticketId = `TKT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
          const qrToken = `UTSV-QR-${crypto.randomBytes(16).toString("hex")}`;

          registration = await Registration.create({
            event: event._id,
            student: req.user._id,
            eventType: event.eventType,
            teamName: event.eventType === "Team" ? teamName : undefined,
            teamMembers: event.eventType === "Team" ? teamMembers : [],
            feeStatus: "Paid",
            feeAmount: event.registrationFee,
            transactionId: razorpay_payment_id,
            ticketId,
            qrToken,
          });

          await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });
        } else {
          registration.feeStatus = "Paid";
          registration.transactionId = razorpay_payment_id;
          await registration.save();
        }

        // Link registration to payment document
        if (payment) {
          payment.registration = registration._id;
          await payment.save();
        }

        ticket = {
          id: registration.ticketId,
          qrToken: registration.qrToken,
          eventId: event._id,
          eventTitle: event.eventName,
          college: event.organizingInstitute,
          attendeeName: req.user.name,
          rollNo: req.user.rollNo,
          branch: req.user.branch,
          teamName: registration.teamName || "Individual Participant",
          feeStatus: "Paid",
          feeAmount: registration.feeAmount,
          checkedIn: registration.checkedIn,
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and recorded successfully!",
      payment: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        status: "Captured",
      },
      ticket,
    });
  } catch (error) {
    console.error("Razorpay Signature Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error verifying payment",
      error: error?.message || error,
    });
  }
};

/**
 * 3. Get Revenue & Fee Records for Event (Admin Dashboard)
 * Returns all captured payments, attendee financial logs, and total revenue.
 */
export const getAdminRevenueAnalyticsController = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const payments = await Payment.find({ event: eventId, status: "Captured" })
      .populate("student", "name email rollNo branch college")
      .sort({ createdAt: -1 });

    const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    return res.status(200).json({
      success: true,
      event: {
        id: event._id,
        name: event.eventName,
        fee: event.registrationFee,
        payoutAccount: event.payoutAccount,
      },
      totalPayments: payments.length,
      totalCollectedINR: totalCollected,
      payments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
