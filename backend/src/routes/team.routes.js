import { Router } from "express";
import {
  getCandidatesForEventController,
  sendTeamRequestController,
  respondToTeamRequestController,
  createTeamController,
  joinTeamByCodeController,
  getMyTeamsController,
  getMyTeamRequestsController,
} from "../controller/team.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

// All team routes require an authenticated Student
router.use(verifyJWT, authorizeRoles("Student"));

// Matchmaker pool & candidates
router.get("/matchmaker/candidates/:eventId", getCandidatesForEventController);

// Team requests / invitations
router.post("/request", sendTeamRequestController);
router.post("/request/:requestId/respond", respondToTeamRequestController);
router.get("/requests", getMyTeamRequestsController);

// Manual team creation & joining by code
router.post("/create", createTeamController);
router.post("/join-by-code", joinTeamByCodeController);
router.get("/my-teams", getMyTeamsController);

export default router;
