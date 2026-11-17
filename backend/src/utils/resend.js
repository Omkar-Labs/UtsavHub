import { Resend } from "resend";

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP Verification Email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit numeric OTP
 */
export const sendVerificationEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "UtsavHub <onboarding@resend.dev>",
      to: [email],
      subject: "UtsavHub - Verify Your Account with OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #ff4d2e; text-align: center;">Welcome to UtsavHub!</h2>
          <p>Hello,</p>
          <p>Thank you for registering on <strong>UtsavHub</strong>. Please use the following One-Time Password (OTP) to complete your verification:</p>
          <div style="background-color: #f7f7f7; border: 1px dashed #ff4d2e; text-align: center; padding: 15px; margin: 20px 0; border-radius: 6px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a1815;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">UtsavHub Campus Events & Hackathon Platform</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Email Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Email sending failure:", err.message);
    return { success: false, error: err.message };
  }
};
