import React, { useState } from "react";
import { paymentsApi } from "../api/payments";
import { useToast } from "../context/ToastContext";
import { Loader2, ShieldCheck, CreditCard, AlertCircle, X } from "lucide-react";

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
          color: "#E11D48",
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
    <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-[#E4E2DD] rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-2xl relative overflow-hidden text-[#18181B]">
        {/* Editorial Header Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E11D48] to-[#F43F5E]"></div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 pt-1 sm:pt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#C2410C]">
                Razorpay Standard Gateway
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] font-mono text-[9px] font-bold border border-[#A7F3D0]">
                Official Verification
              </span>
            </div>
            <h2 className="font-headline text-xl sm:text-2xl font-extrabold text-[#18181B]">Event Entry Fee Payment</h2>
            <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[280px] sm:max-w-none">{eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl sm:rounded-2xl bg-[#FFE4E6] border border-[#FECDD3] text-[#BE123C] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#BE123C]" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Invoice Summary Box */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAF9F6] border border-[#E4E2DD] mb-4 sm:mb-5 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-600">
            <span>Attendee:</span>
            <span className="font-semibold text-zinc-900 truncate max-w-[180px]">{user?.name}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Roll / College:</span>
            <span className="font-mono text-zinc-500 truncate max-w-[180px]">{user?.rollNo} • {user?.college}</span>
          </div>
          {teamName && (
            <div className="flex justify-between text-zinc-600">
              <span>Squad Name:</span>
              <span className="font-bold text-[#C2410C] truncate max-w-[180px]">{teamName}</span>
            </div>
          )}
          <div className="border-t border-[#E4E2DD] pt-2 flex justify-between items-center text-sm">
            <span className="font-bold text-zinc-900">Total Amount:</span>
            <span className="font-headline text-lg sm:text-xl font-extrabold text-[#047857]">
              ₹{eventFee.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Info Pill */}
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] sm:text-[11px] mb-5 sm:mb-6 px-1">
          <ShieldCheck className="w-4 h-4 text-[#047857] shrink-0" />
          <span>Secured via Razorpay SHA-256 HMAC &amp; Instant Ticket Dispatch</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRazorpayCheckout}
          disabled={isProcessing}
          className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
