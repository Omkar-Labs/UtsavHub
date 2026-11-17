import { Team } from "../Model/team.model.js";
import { TeamRequest } from "../Model/teamRequest.model.js";
import { Event } from "../Model/event.model.js";
import { User } from "../Model/user.model.js";
import { Registration } from "../Model/registration.model.js";

/**
 * Helper: Generate unique Team Code
 */
const generateUniqueTeamCode = async (prefix = "SQ") => {
  let isUnique = false;
  let code = "";
  while (!isUnique) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    code = `${prefix.substring(0, 2).toUpperCase()}${randomDigits}`;
    const existing = await Team.findOne({ teamCode: code });
    if (!existing) isUnique = true;
  }
  return code;
};

/**
 * 1. Matchmaker Candidate Suggestions (Solo Pool)
 * Returns students who are NOT in any team or registered for this event.
 */
export const getCandidatesForEventController = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { gender, branch } = req.query;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.eventType !== "Team") {
      return res.status(400).json({ success: false, message: "This event is a Solo event, team formation is not required." });
    }

    // 1. Collect student IDs already in a team for this event
    const existingTeams = await Team.find({ event: eventId });
    const membersInTeams = existingTeams.flatMap((t) => t.members.map((m) => m.student.toString()));

    // 2. Collect student IDs already registered for this event
    const existingRegistrations = await Registration.find({ event: eventId });
    const registeredStudents = existingRegistrations.map((r) => r.student.toString());

    // 3. Exclude IDs (team members, registered students, and self)
    const excludedIds = Array.from(new Set([...membersInTeams, ...registeredStudents, req.user._id.toString()]));

    // 4. Query available candidates
    const query = {
      role: "Student",
      _id: { $nin: excludedIds },
    };

    if (gender && gender !== "All") query.gender = gender;
    if (branch && branch !== "All") query.branch = branch;

    const candidates = await User.find(query)
      .select("name email rollNo college branch gender skills")
      .limit(20);

    return res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Send Team Join Request
 * Invites a fellow student to team up for an event, displaying the event info to them.
 */
export const sendTeamRequestController = async (req, res) => {
  try {
    const { eventId, receiverId, teamId, message } = req.body;

    if (!eventId || !receiverId) {
      return res.status(400).json({ success: false, message: "Event ID and Receiver ID are required" });
    }

    // Edge Case 1: Cannot invite oneself
    if (receiverId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot send a team request to yourself" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver || receiver.role !== "Student") {
      return res.status(404).json({ success: false, message: "Recipient student not found" });
    }

    // Edge Case 2: Check if receiver is already in a team for this event
    const receiverTeam = await Team.findOne({ event: eventId, "members.student": receiverId });
    if (receiverTeam) {
      return res.status(400).json({ success: false, message: `${receiver.name} is already part of a team for this event.` });
    }

    // Edge Case 3: If teamId supplied, check if team is full
    let team = null;
    if (teamId) {
      team = await Team.findById(teamId);
      if (team && team.members.length >= event.maxTeamSize) {
        return res.status(400).json({ success: false, message: "Your team is already full!" });
      }
    }

    // Edge Case 4: Prevent duplicate pending request
    const existingRequest = await TeamRequest.findOne({
      event: eventId,
      sender: req.user._id,
      receiver: receiverId,
      status: "Pending",
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: "A pending invite has already been sent to this student" });
    }

    const request = await TeamRequest.create({
      event: eventId,
      team: team?._id,
      sender: req.user._id,
      receiver: receiverId,
      message: message || `Hey ${receiver.name}! Let's team up for ${event.eventName}.`,
    });

    const populatedRequest = await TeamRequest.findById(request._id)
      .populate("event", "eventName organizingInstitute eventDate eventTime category")
      .populate("sender", "name email rollNo branch gender")
      .populate("receiver", "name email rollNo branch gender");

    return res.status(201).json({
      success: true,
      message: `Squad invite successfully sent to ${receiver.name}!`,
      request: populatedRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Respond to Team Request (Accept / Decline)
 * If accepted, adds receiver to sender's team or auto-creates a new 2-person squad!
 */
export const respondToTeamRequestController = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // "Accept" | "Decline"

    if (!["Accept", "Decline"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be 'Accept' or 'Decline'" });
    }

    const request = await TeamRequest.findById(requestId)
      .populate("event")
      .populate("sender", "name email rollNo branch gender");

    if (!request) {
      return res.status(404).json({ success: false, message: "Team request not found" });
    }

    // Edge Case: Only the recipient can accept/decline
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not authorized to respond to this request" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ success: false, message: `Request has already been ${request.status.toLowerCase()}` });
    }

    if (action === "Decline") {
      request.status = "Declined";
      await request.save();
      return res.status(200).json({ success: true, message: "Team request declined" });
    }

    // ACTION: ACCEPT
    const event = request.event;

    // Edge Case: Ensure receiver is not in another team for this event
    const existingReceiverTeam = await Team.findOne({ event: event._id, "members.student": req.user._id });
    if (existingReceiverTeam) {
      return res.status(400).json({ success: false, message: "You are already part of another team for this event." });
    }

    let team;

    if (request.team) {
      // 1. Team already exists -> Add receiver to it
      team = await Team.findById(request.team);
      if (!team) {
        return res.status(404).json({ success: false, message: "Associated team was disbanded or not found" });
      }

      if (team.members.length >= event.maxTeamSize) {
        return res.status(400).json({ success: false, message: "Team has reached maximum capacity" });
      }

      team.members.push({
        student: req.user._id,
        name: req.user.name,
        email: req.user.email,
        rollNo: req.user.rollNo,
        branch: req.user.branch,
        gender: req.user.gender,
        role: "Squad Member",
      });

      if (team.members.length >= event.minTeamSize) {
        team.status = "Ready";
      }

      await team.save();
    } else {
      // 2. Team does not exist -> Automatically create a new squad with sender & receiver!
      const teamCode = await generateUniqueTeamCode("SQ");
      const teamName = `${request.sender.name.split(" ")[0]} & ${req.user.name.split(" ")[0]}'s Squad`;

      const members = [
        {
          student: request.sender._id,
          name: request.sender.name,
          email: request.sender.email,
          rollNo: request.sender.rollNo,
          branch: request.sender.branch,
          gender: request.sender.gender,
          role: "Co-Founder",
        },
        {
          student: req.user._id,
          name: req.user.name,
          email: req.user.email,
          rollNo: req.user.rollNo,
          branch: req.user.branch,
          gender: req.user.gender,
          role: "Co-Founder / Captain",
        },
      ];

      team = await Team.create({
        event: event._id,
        teamName,
        teamCode,
        leader: req.user._id,
        members,
        status: members.length >= event.minTeamSize ? "Ready" : "Forming",
      });
    }

    request.status = "Accepted";
    await request.save();

    return res.status(200).json({
      success: true,
      message: `🎉 Squad invite accepted! Team formed with code: ${team.teamCode}`,
      team,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Create Team Manually with Join Code
 */
export const createTeamController = async (req, res) => {
  try {
    const { eventId, teamName } = req.body;

    if (!eventId || !teamName || !teamName.trim()) {
      return res.status(400).json({ success: false, message: "Event ID and Team Name are required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.eventType !== "Team") {
      return res.status(400).json({ success: false, message: "Cannot create a team for a solo event" });
    }

    // Check if user is already in a team for this event
    const alreadyInTeam = await Team.findOne({ event: eventId, "members.student": req.user._id });
    if (alreadyInTeam) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of a team for this event",
        teamCode: alreadyInTeam.teamCode,
      });
    }

    // Generate prefix code from team name
    const prefix = teamName.replace(/[^a-zA-Z]/g, "").substring(0, 2).toUpperCase() || "SQ";
    const teamCode = await generateUniqueTeamCode(prefix);

    const team = await Team.create({
      event: eventId,
      teamName: teamName.trim(),
      teamCode,
      leader: req.user._id,
      members: [
        {
          student: req.user._id,
          name: req.user.name,
          email: req.user.email,
          rollNo: req.user.rollNo,
          branch: req.user.branch,
          gender: req.user.gender,
          role: "Team Leader",
        },
      ],
      status: 1 >= event.minTeamSize ? "Ready" : "Forming",
    });

    return res.status(201).json({
      success: true,
      message: `Team "${team.teamName}" created with code: ${team.teamCode}`,
      team,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Join Team by Code
 * Enters teamCode shared by team leader to join the squad.
 */
export const joinTeamByCodeController = async (req, res) => {
  try {
    const { teamCode } = req.body;

    if (!teamCode || !teamCode.trim()) {
      return res.status(400).json({ success: false, message: "Team code is required" });
    }

    const code = teamCode.trim().toUpperCase();
    const team = await Team.findOne({ teamCode: code }).populate("event");

    if (!team) {
      return res.status(404).json({ success: false, message: `No team found with code "${code}"` });
    }

    const event = team.event;

    // Check if user already in this team
    const isMember = team.members.some((m) => m.student.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: "You are already in this team!" });
    }

    // Check if user is in another team for the same event
    const otherTeam = await Team.findOne({ event: event._id, "members.student": req.user._id });
    if (otherTeam) {
      return res.status(400).json({
        success: false,
        message: `You are already part of team "${otherTeam.teamName}" for this event.`,
      });
    }

    // Check capacity
    if (team.members.length >= event.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: `Team is full! Maximum allowed members is ${event.maxTeamSize}.`,
      });
    }

    // Add member
    team.members.push({
      student: req.user._id,
      name: req.user.name,
      email: req.user.email,
      rollNo: req.user.rollNo,
      branch: req.user.branch,
      gender: req.user.gender,
      role: "Squad Member",
    });

    if (team.members.length >= event.minTeamSize) {
      team.status = "Ready";
    }

    await team.save();

    return res.status(200).json({
      success: true,
      message: `🎉 Successfully joined team "${team.teamName}"!`,
      team,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Get My Teams
 */
export const getMyTeamsController = async (req, res) => {
  try {
    const teams = await Team.find({ "members.student": req.user._id })
      .populate("event", "eventName organizingInstitute eventDate eventTime category minTeamSize maxTeamSize isPaid registrationFee")
      .populate("leader", "name email rollNo")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: teams.length, teams });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. Get My Team Requests (Incoming & Outgoing)
 */
export const getMyTeamRequestsController = async (req, res) => {
  try {
    const incoming = await TeamRequest.find({ receiver: req.user._id, status: "Pending" })
      .populate("event", "eventName organizingInstitute eventDate eventTime category isPaid registrationFee")
      .populate("sender", "name email rollNo branch gender skills")
      .sort({ createdAt: -1 });

    const outgoing = await TeamRequest.find({ sender: req.user._id })
      .populate("event", "eventName organizingInstitute eventDate eventTime category")
      .populate("receiver", "name email rollNo branch gender")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      incoming,
      outgoing,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
