import { User } from "../Model/user.model.js";
import { OTP } from "../Model/otp.model.js";
import { sendVerificationEmail } from "../utils/nodemailer.js";
import { generateAccessAndRefreshTokens, cookieOptions } from "../utils/token.js";
import jwt from "jsonwebtoken";

/**
 * 1. Send OTP Controller
 * Generates a 6-digit OTP, stores it in DB (with TTL expiry), and sends it via Resend.
 */
export const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if user is already registered and verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Upsert or save OTP (overwrites previous OTP for the same email)
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send email using Resend
    const emailResult = await sendVerificationEmail(email, otp);
    if (!emailResult.success) {
      return res.status(500).json({ success: false, message: "Failed to send OTP email", error: emailResult.error });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your institutional email",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Register Controller (Student & Admin)
 * Verifies OTP, creates the user, hashes password via Mongoose pre-save hook,
 * issues JWT tokens, and sets cookies.
 */
export const registerController = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "Student",
      otp,
      // Student details
      rollNo,
      college,
      branch,
      gender,
      skills,
      // Admin details
      collegeDomain,
      designation,
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ success: false, message: "Name, email, password, and OTP are required" });
    }

    // Verify OTP from database
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already registered with this email" });
    }

    // Prepare user document payload
    const userData = {
      name,
      email,
      password,
      role,
      college: college || (role === "Admin" ? req.body.adminCollege : undefined),
      isVerified: true,
    };

    if (role === "Student") {
      userData.rollNo = rollNo;
      userData.branch = branch;
      userData.gender = gender;
      userData.skills = Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()) : []);
    } else if (role === "Admin") {
      if (!collegeDomain) {
        return res.status(400).json({ success: false, message: "College domain is required for Admin registration" });
      }

      // Enforce limit: maximum 2 Admins allowed per college domain
      const normalizedDomain = collegeDomain.toLowerCase().trim();
      const existingAdminCount = await User.countDocuments({
        role: "Admin",
        collegeDomain: normalizedDomain,
      });

      if (existingAdminCount >= 2) {
        return res.status(400).json({
          success: false,
          message: `Registration quota exceeded: Maximum 2 Admins are allowed per college domain (@${normalizedDomain}).`,
        });
      }

      userData.collegeDomain = normalizedDomain;
      userData.designation = designation;
    }

    // Create user (pre-save hook hashes password)
    const user = await User.create(userData);

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate JWT access & refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Set secure cookies
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Strip sensitive fields from response
    const sanitizedUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json({
      success: true,
      message: `${role} registered and verified successfully`,
      user: sanitizedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Login Controller (Student & Admin)
 * Authenticates user with email and password, checks role, and sets session cookies.
 */
export const loginController = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Check role if specified
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Account found but registered as '${user.role}', not '${role}'`,
      });
    }

    // Compare bcrypt password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Generate Access & Refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Set cookies
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const sanitizedUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: sanitizedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Refresh Access Token Controller
 * Uses stored Refresh Token to issue a new Access Token without logging out user.
 */
export const refreshAccessTokenController = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token missing" });
    }

    // Verify refresh token signature
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    // Generate new pair
    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message || "Invalid refresh token" });
  }
};

/**
 * 5. Logout Controller
 * Clears Refresh Token in DB and removes cookies.
 */
export const logoutController = async (req, res) => {
  try {
    // If authenticated via verifyJWT middleware, req.user will be available
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    }

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Get Current User Controller
 * Returns the currently logged in user from req.user (populated by verifyJWT).
 */
export const getCurrentUserController = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};
