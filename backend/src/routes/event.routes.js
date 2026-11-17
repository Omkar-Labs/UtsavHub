import { Router } from "express";
import {
  createEventController,
  getAllEventsController,
  getEventByIdController,
  registerForEventController,
  verifyTicketQrController,
  getEventAttendeesController,
  getMyTicketsController,
} from "../controller/event.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes (anyone can browse events)
router.get("/", getAllEventsController);

// Student Protected routes - Static routes must come BEFORE parameterized /:id routes
router.get("/user/my-tickets", verifyJWT, authorizeRoles("Student"), getMyTicketsController);
router.post("/:eventId/register", verifyJWT, authorizeRoles("Student"), registerForEventController);

// Admin Protected routes
router.post("/", verifyJWT, authorizeRoles("Admin"), createEventController);
router.post("/gate/verify-ticket", verifyJWT, authorizeRoles("Admin"), verifyTicketQrController);
router.get("/:eventId/attendees", verifyJWT, authorizeRoles("Admin"), getEventAttendeesController);

// Parameterized public route (kept at the bottom to avoid shadow routing)
router.get("/:id", getEventByIdController);

export default router;
