import { User } from "../Model/user.model.js";

/**
 * Generates both Access and Refresh Tokens for a given user,
 * saves the refresh token in database, and returns both tokens.
 */
export const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(`Token generation error: ${error.message}`);
  }
};

const isProduction = process.env.NODE_ENV === "production";

/**
 * Standard cookie configuration options
 */
export const cookieOptions = {
  httpOnly: true, // Prevents client-side JS from reading cookie (XSS protection)
  secure: isProduction, // Only sent over HTTPS in production
  sameSite: isProduction ? "none" : "lax", // 'none' is mandatory for cross-site cookies in production
  path: "/",
};
