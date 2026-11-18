/**
 * Brevo (formerly Sendinblue) HTTP REST API Email Dispatcher
 *
 * Why Brevo HTTP REST API over Port 443?
 * 1. Port 443 (HTTPS) is standard web traffic and is NEVER blocked by cloud platforms (Render, Vercel, AWS).
 * 2. Works without a custom domain: You can verify your personal Gmail in Brevo and send to any recipient.
 * 3. 300 free emails per day with fast, reliable delivery.
 */

export const sendVerificationEmail = async (email, otp) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error("BREVO_API_KEY is not configured in environment variables");
    }

    const senderEmail = process.env.EMAIL_USER || "omkartripathi36@gmail.com";

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "UtsavHub",
          email: senderEmail,
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "UtsavHub - Verify Your Account with OTP",
        htmlContent: `
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
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Brevo API error: ${response.statusText}`);
    }

    return { success: true, data };
  } catch (err) {
    console.error("Brevo Email Error:", err.message);
    return { success: false, error: err.message };
  }
};
