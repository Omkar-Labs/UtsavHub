import nodemailer from "nodemailer";

/**
 * Configure Nodemailer Transporter for Gmail SMTP
 * 
 * Note: To send emails using a personal Gmail address via SMTP,
 * you MUST use a 16-character Google App Password (not your normal Gmail password).
 * Generate it at: Google Account -> Security -> 2-Step Verification -> App Passwords
 */
const emailPort = Number(process.env.EMAIL_PORT) || 587;
const isSecure = emailPort === 465;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: emailPort,
  secure: isSecure, // false for port 587 (STARTTLS), true for port 465
  auth: {
    user: process.env.EMAIL_USER || "omkartripathi36@gmail.com",
    pass: process.env.EMAIL_PASS, // 16-digit Google App Password
  },
  tls: {
    rejectUnauthorized: true,
  },
});

/**
 * Send OTP Verification Email
 * @param {string} email - Recipient institutional email address
 * @param {string} otp - 6-digit numeric OTP code
 */
export const sendVerificationEmail = async (email, otp) => {
  try {
    const senderEmail = process.env.EMAIL_USER || "omkartripathi36@gmail.com";

    const mailOptions = {
      from: `"UtsavHub" <${senderEmail}>`,
      to: email,
      subject: "UtsavHub - Verify Your Account with OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #332d27; border-radius: 12px; background-color: #1a1815; color: #fcfaf6;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: rgba(255, 77, 46, 0.15); border: 1px solid rgba(255, 77, 46, 0.3); color: #ff4d2e; font-family: monospace; font-size: 11px; font-weight: bold; text-transform: uppercase;">
              Retro Campus Gate
            </span>
            <h2 style="color: #fcfaf6; margin-top: 10px; font-size: 26px; font-weight: 800;">
              Utsav<span style="color: #ff4d2e;">Hub</span> Verification
            </h2>
          </div>

          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">Hello,</p>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            Thank you for registering on <strong>UtsavHub</strong>. Please use the One-Time Password (OTP) below to authenticate your institutional email and complete account registration:
          </p>

          <div style="background-color: #23201c; border: 2px dashed #ff4d2e; text-align: center; padding: 20px; margin: 25px 0; border-radius: 12px;">
            <span style="font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #f59e0b;">
              ${otp}
            </span>
          </div>

          <p style="color: #a8a29e; font-size: 13px; line-height: 1.5;">
            ⏳ This OTP expires automatically in <strong>5 minutes</strong>. For your account security, never share this code with anyone.
          </p>

          <hr style="border: none; border-top: 1px solid #2c2824; margin: 24px 0;" />
          <p style="color: #78716c; font-size: 11px; text-align: center; margin: 0;">
            UtsavHub Collegiate Event & Squad Platform • ICS 354 Project • IET Lucknow
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, data: info };
  } catch (err) {
    console.error("Nodemailer Email Error:", err.message);
    return { success: false, error: err.message };
  }
};
