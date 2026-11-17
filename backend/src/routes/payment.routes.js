import { Router } from "express";
import {
  createOrderController,
  verifyPaymentController,
  getAdminRevenueAnalyticsController,
} from "../controller/payment.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

// Student payment routes
router.post("/create-order", verifyJWT, createOrderController);
router.post("/verify-payment", verifyJWT, verifyPaymentController);

// Admin revenue analytics
router.get("/revenue/:eventId", verifyJWT, authorizeRoles("Admin"), getAdminRevenueAnalyticsController);

export default router;
