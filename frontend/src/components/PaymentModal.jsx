import React, { useState } from "react";
import { paymentsApi } from "../api/payments";
import { useToast } from "../context/ToastContext";
import { Loader2, ShieldCheck, CreditCard, AlertCircle } from "lucide-react";

export default function PaymentModal({
  isOpen,
  onClose,
  event,
  user,
  teamName,
  teamMembers = [],
  onPaymentSuccess,
}) {
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !event) return null;

  const eventTitle = event.eventName || event.title;
  const eventFee = Number(event.registrationFee ?? event.fee ?? 0);
  const eventId = event._id || event.id;

  const handleRazorpayCheckout = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsProcessing(true);

    try {
      // Step 1: Call Backend to Create Razorpay Order
      const orderData = await paymentsApi.createOrder({
        eventId,
        amount: eventFee,
      });

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create Razorpay order");
      }

      // Step 2: Ensure Razorpay SDK is loaded
      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // Step 3: Open Razorpay Standard Checkout Modal
      const options = {
        key: orderData.key_id,
        amount: orderData.amount, // in paise
        currency: orderData.currency || "INR",
        name: "UtsavHub",
        description: `Entry Pass for ${eventTitle}`,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=200&q=80",
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            setIsProcessing(true);
            // Step 4: Verify Payment Signature on Backend & Issue Real Ticket
            const verifyData = await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId,
              teamName: teamName || undefined,
              teamMembers: teamMembers.length > 0 ? teamMembers : undefined,
            });

            if (!verifyData.success) {
              setErrorMessage(verifyData.message || "Payment verification failed.");
              setIsProcessing(false);
              return;
            }

            // Success!
            setIsProcessing(false);
            showToast("Payment verified! Digital entry pass generated.", "success", "Payment Captured");
            if (onPaymentSuccess) {
              onPaymentSuccess(event, response.razorpay_payment_id, verifyData.ticket);
            }
            onClose();
          } catch (err) {
            const msg = err.response?.data?.message || err.message || "Error verifying payment signature";
            setErrorMessage(msg);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || "Campus Student",
          email: user?.email || "student@college.edu",
          contact: "9999999999",
        },
        theme: {
          color: "#ff4d2e",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        setErrorMessage(`Payment Failed: ${response.error?.description || "Transaction cancelled"}`);
        setIsProcessing(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Checkout error:", err);
      const msg = err.response?.data?.message || err.message || "Payment initiation error";
      setErrorMessage(msg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1a1815] border-2 border-[#38332d] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Retro Header Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ff4d2e] via-[#f59e0b] to-[#10b981]"></div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#f59e0b]">
                Razorpay Standard Gateway
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] font-mono text-[9px] font-bold border border-[#10b981]/30">
                Official Verification
              </span>
            </div>
            <h2 className="font-headline text-2xl font-extrabold text-[#fcfaf6]">Event Entry Fee Payment</h2>
            <p className="text-xs text-stone-400 mt-0.5">{eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-[#2c2824] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Invoice Summary Box */}
        <div className="p-4 rounded-2xl bg-[#131211] border border-[#2c2824] mb-5 space-y-2 text-xs">
          <div className="flex justify-between text-stone-300">
            <span>Attendee:</span>
            <span className="font-semibold text-white">{user?.name}</span>
          </div>
          <div className="flex justify-between text-stone-300">
            <span>Roll / College:</span>
            <span className="font-mono text-stone-400">{user?.rollNo} • {user?.college}</span>
          </div>
          {teamName && (
            <div className="flex justify-between text-stone-300">
              <span>Squad Name:</span>
              <span className="font-bold text-[#f59e0b]">{teamName}</span>
            </div>
          )}
          <div className="border-t border-[#2c2824] pt-2 flex justify-between items-center text-sm">
            <span className="font-bold text-white">Total Amount:</span>
            <span className="font-headline text-xl font-extrabold text-[#10b981]">
              ₹{eventFee.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Info Pill */}
        <div className="flex items-center gap-2 text-stone-400 text-[11px] mb-6 px-1">
          <ShieldCheck className="w-4 h-4 text-[#10b981]" />
          <span>Secured via Razorpay SHA-256 HMAC &amp; Instant Ticket Dispatch</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRazorpayCheckout}
          disabled={isProcessing}
          className="w-full py-4 rounded-2xl bg-[#ff4d2e] hover:bg-[#e63d1e] text-white font-extrabold text-sm shadow-xl shadow-[#ff4d2e]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Contacting Gateway...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Pay ₹{eventFee}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
