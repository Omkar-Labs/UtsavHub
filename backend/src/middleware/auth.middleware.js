import jwt from "jsonwebtoken";
import { User } from "../Model/user.model.js";

/**
 * Middleware to verify JWT Access Token from cookies or Authorization header
 */
export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized request: No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Access Token: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error?.message || "Invalid or expired token" });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 * e.g., authorizeRoles("Admin")
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user?.role}' does not have permission to perform this action`,
      });
    }
    next();
  };
};
