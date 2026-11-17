import { Router } from "express";
import {
  sendOtpController,
  registerController,
  loginController,
  refreshAccessTokenController,
  logoutController,
  getCurrentUserController,
} from "../controller/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/send-otp", sendOtpController);
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh-token", refreshAccessTokenController);

// Protected routes (require valid JWT)
router.post("/logout", verifyJWT, logoutController);
router.get("/me", verifyJWT, getCurrentUserController);

export default router;
