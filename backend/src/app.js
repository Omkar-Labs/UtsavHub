import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import teamRoutes from "./routes/team.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { createOrderController, verifyPaymentController } from "./controller/payment.controller.js";
import { verifyJWT } from "./middleware/auth.middleware.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "UtsavHub Backend is running" });
});

// Route Declarations
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/payments", paymentRoutes);

// Direct Aliases for Standard Checkout Spec: POST /api/create-order & POST /api/verify-payment
app.post("/api/create-order", verifyJWT, createOrderController);
app.post("/api/verify-payment", verifyJWT, verifyPaymentController);

export { app };
