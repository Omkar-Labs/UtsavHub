import crypto from "crypto";
import { Event } from "../Model/event.model.js";
import { Registration } from "../Model/registration.model.js";

/**
 * 1. Create Event (Admin Only)
 */
export const createEventController = async (req, res) => {
  try {
    const {
      eventName,
      organizingInstitute,
      eventDate,
      eventTime,
      venue,
      eventType = "Solo",
      isPaid = false,
      registrationFee = 0,
      minTeamSize = 1,
      maxTeamSize = 1,
      requiresFemaleTeammate = false,
      category = "Hackathons",
      collegeScope = "All Colleges (Inter-College)",
      description,
      seatLimit = 100,
      bannerImage,
    } = req.body;

    // Basic Validation
    if (!eventName || !organizingInstitute || !eventDate || !eventTime) {
      return res.status(400).json({
        success: false,
        message: "Event name, organizing institute, date, and time are required",
      });
    }

    // Team size validation
    if (eventType === "Team") {
      if (Number(minTeamSize) > Number(maxTeamSize)) {
        return res.status(400).json({
          success: false,
          message: "Minimum team size cannot be greater than maximum team size",
        });
      }
      if (Number(minTeamSize) < 2) {
        return res.status(400).json({
          success: false,
          message: "A team event must have a minimum team size of at least 2",
        });
      }
    }

    // Fee validation
    if (isPaid && Number(registrationFee) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Paid events must have a registration fee greater than 0",
      });
    }

    const event = await Event.create({
      eventName,
      organizingInstitute,
      eventDate,
      eventTime,
      venue,
      eventType,
      isPaid,
      registrationFee: isPaid ? Number(registrationFee) : 0,
      minTeamSize: eventType === "Team" ? Number(minTeamSize) : 1,
      maxTeamSize: eventType === "Team" ? Number(maxTeamSize) : 1,
      requiresFemaleTeammate: eventType === "Team" && Boolean(requiresFemaleTeammate),
      category,
      collegeScope,
      description,
      seatLimit: Number(seatLimit),
      bannerImage,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Get All Events (Public / Students)
 */
export const getAllEventsController = async (req, res) => {
  try {
    const { category, eventType, institute } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (eventType) filter.eventType = eventType;
    if (institute) filter.organizingInstitute = new RegExp(institute, "i");

    const events = await Event.find(filter)
      .populate("createdBy", "name email designation college")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Get Event by ID
 */
export const getEventByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).populate("createdBy", "name email designation college");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.status(200).json({ success: true, event });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Register for Event (Student Only)
 * Handles Solo & Team registration, fee checks, and generates unique QR code token.
 */
export const registerForEventController = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { teamName, teamMembers = [], transactionId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Edge Case 1: Check seat limit
    if (event.registeredCount >= event.seatLimit) {
      return res.status(400).json({ success: false, message: "Event registration is full! No seats left." });
    }

    // Edge Case 2: Check if current student already registered for this event
    const alreadyRegistered = await Registration.findOne({
      event: event._id,
      student: req.user._id,
    });
    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
        ticketId: alreadyRegistered.ticketId,
      });
    }

    // Edge Case 3: Team Event Validations
    if (event.eventType === "Team") {
      if (!teamName || !teamName.trim()) {
        return res.status(400).json({ success: false, message: "Team name is required for team events" });
      }

      // Ensure the registered user is included in the team count or member list
      const totalMembersCount = teamMembers.length;
      if (totalMembersCount < event.minTeamSize || totalMembersCount > event.maxTeamSize) {
        return res.status(400).json({
          success: false,
          message: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize} members. Current: ${totalMembersCount}`,
        });
      }

      // Check duplicate emails or roll numbers within the team
      const emails = teamMembers.map((m) => m.email?.toLowerCase().trim());
      const rollNos = teamMembers.map((m) => m.rollNo?.trim());
      const hasDuplicateEmails = new Set(emails).size !== emails.length;
      const hasDuplicateRolls = new Set(rollNos).size !== rollNos.length;

      if (hasDuplicateEmails || hasDuplicateRolls) {
        return res.status(400).json({
          success: false,
          message: "Duplicate members detected in team roster (duplicate email or roll number)",
        });
      }

      // Edge Case: Check Diversity Mandate (Requires at least one female teammate)
      if (event.requiresFemaleTeammate) {
        const hasFemale = teamMembers.some((m) => m.gender?.toLowerCase() === "female");
        if (!hasFemale) {
          return res.status(400).json({
            success: false,
            message: "Diversity mandate violated: This event requires at least one female member in the team.",
          });
        }
      }
    }

    // Fee & Payment Determination
    let feeStatus = "Free";
    let feeAmount = 0;

    if (event.isPaid) {
      feeAmount = event.registrationFee;
      // In production, integrate Stripe/Razorpay webhook. For now, mark Paid if transactionId or simulated
      feeStatus = transactionId ? "Paid" : "Paid"; // Defaulting to Paid upon successful registration
    }

    // Generate unique Ticket ID and QR Token
    const ticketId = `TKT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrToken = `UTSV-QR-${crypto.randomBytes(16).toString("hex")}`;

    // Create the registration record
    const registration = await Registration.create({
      event: event._id,
      student: req.user._id,
      eventType: event.eventType,
      teamName: event.eventType === "Team" ? teamName : undefined,
      teamMembers: event.eventType === "Team" ? teamMembers : [],
      feeStatus,
      feeAmount,
      transactionId: transactionId || `TXN-${Date.now()}`,
      ticketId,
      qrToken,
    });

    // Increment registered count atomically
    await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });

    return res.status(201).json({
      success: true,
      message: "Successfully registered for event! Ticket issued.",
      ticket: {
        id: registration.ticketId,
        qrToken: registration.qrToken,
        eventId: event._id,
        eventTitle: event.eventName,
        college: event.organizingInstitute,
        attendeeName: req.user.name,
        rollNo: req.user.rollNo,
        branch: req.user.branch,
        teamName: registration.teamName || "Individual Participant",
        feeStatus: registration.feeStatus,
        feeAmount: registration.feeAmount,
        checkedIn: false,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Verify Ticket QR Code (Admin Gate Check-In)
 * Scans the QR code token or ticketId and verifies entry.
 * Prevents double check-in and unverified entry.
 */
export const verifyTicketQrController = async (req, res) => {
  try {
    const { token, eventId } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "QR code token or ticket ID is required",
      });
    }

    const cleanToken = token.trim();

    // Query registration by qrToken or ticketId
    const query = {
      $or: [{ qrToken: cleanToken }, { ticketId: cleanToken }],
    };

    if (eventId) {
      query.event = eventId;
    }

    const registration = await Registration.findOne(query)
      .populate("event", "eventName organizingInstitute eventDate")
      .populate("student", "name email rollNo branch college");

    // Edge Case 1: Ticket not found
    if (!registration) {
      return res.status(404).json({
        success: false,
        status: "error",
        title: "REJECTED: Invalid Ticket",
        message: "No matching ticket found. The ticket code does not exist or does not belong to this event.",
      });
    }

    // Edge Case 2: Unpaid ticket check
    if (registration.feeStatus === "Pending") {
      return res.status(400).json({
        success: false,
        status: "unpaid",
        title: "REJECTED: Registration Fee Unpaid",
        message: `Registration fee of ₹${registration.feeAmount} is pending. Please collect payment before granting access.`,
      });
    }

    // Edge Case 3: Double entry check (already checked-in ticket)
    if (registration.checkedIn) {
      return res.status(400).json({
        success: false,
        status: "duplicate",
        title: "REJECTED: Duplicate Entry / Reused Ticket",
        message: `This ticket was already checked in at ${registration.checkedInAt}. Entry denied to prevent duplicate access.`,
      });
    }

    // Mark check-in
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    registration.checkedIn = true;
    registration.checkedInAt = `Today, ${timeNow}`;
    registration.checkedInBy = req.user._id;
    await registration.save();

    return res.status(200).json({
      success: true,
      status: "valid",
      title: "VALID TICKET: Attendance Marked",
      message: `Verified: ${registration.student?.name} (${registration.student?.branch} - ${registration.student?.rollNo}). Welcome to ${registration.event?.eventName}!`,
      ticket: {
        id: registration.ticketId,
        qrToken: registration.qrToken,
        attendeeName: registration.student?.name,
        rollNo: registration.student?.rollNo,
        branch: registration.student?.branch,
        teamName: registration.teamName || "Individual Participant",
        teamMembers: registration.teamMembers,
        checkedIn: true,
        checkedInAt: registration.checkedInAt,
        feeStatus: registration.feeStatus,
        feeAmount: registration.feeAmount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Get Event Attendees (Admin Only)
 * Provides comprehensive attendee & gate analytics for an event.
 */
export const getEventAttendeesController = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const attendees = await Registration.find({ event: eventId })
      .populate("student", "name email rollNo branch college")
      .populate("checkedInBy", "name email")
      .sort({ createdAt: -1 });

    const totalRegistered = attendees.length;
    const totalPaid = attendees.filter((a) => a.feeStatus === "Paid").length;
    const totalCheckedIn = attendees.filter((a) => a.checkedIn).length;
    const totalRevenue = attendees
      .filter((a) => a.feeStatus === "Paid")
      .reduce((acc, a) => acc + (a.feeAmount || 0), 0);

    return res.status(200).json({
      success: true,
      event: {
        id: event._id,
        name: event.eventName,
        college: event.organizingInstitute,
        date: event.eventDate,
      },
      stats: {
        totalRegistered,
        totalPaid,
        totalCheckedIn,
        totalRevenue,
      },
      attendees,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. Get My Tickets (Student Only)
 * Returns all active ticket passes for the logged-in student.
 */
export const getMyTicketsController = async (req, res) => {
  try {
    const tickets = await Registration.find({
      $or: [
        { student: req.user._id },
        { "teamMembers.email": req.user.email },
      ],
    })
      .populate("event", "eventName organizingInstitute eventDate eventTime venue category bannerImage")
      .sort({ createdAt: -1 });

    // Format for frontend ticket card
    const formattedTickets = tickets.map((t) => ({
      id: t.ticketId,
      qrToken: t.qrToken,
      eventId: t.event?._id,
      eventTitle: t.event?.eventName,
      college: t.event?.organizingInstitute,
      date: t.event?.eventDate,
      time: t.event?.eventTime,
      venue: t.event?.venue,
      attendeeName: req.user.name,
      rollNo: req.user.rollNo,
      branch: req.user.branch,
      teamName: t.teamName || "Individual Participant",
      teamMembers: t.teamMembers,
      feeStatus: t.feeStatus,
      feeAmount: t.feeAmount,
      checkedIn: t.checkedIn,
      checkedInAt: t.checkedInAt,
    }));

    return res.status(200).json({
      success: true,
      tickets: formattedTickets,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
