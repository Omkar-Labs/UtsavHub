import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      index: true,
    },
    organizingInstitute: {
      type: String,
      required: [true, "Organizing institute is required"],
      trim: true,
    },
    eventDate: {
      type: String, // Stored as formatted string e.g. "Dec 20, 2026" or ISO Date
      required: [true, "Event date is required"],
    },
    eventTime: {
      type: String,
      required: [true, "Event time is required"],
    },
    venue: {
      type: String,
      default: "Campus Main Auditorium",
      trim: true,
    },
    eventType: {
      type: String,
      enum: ["Solo", "Team"],
      default: "Solo",
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    registrationFee: {
      type: Number,
      default: 0,
      min: [0, "Registration fee cannot be negative"],
    },
    minTeamSize: {
      type: Number,
      default: 1,
      min: [1, "Minimum team size must be at least 1"],
    },
    maxTeamSize: {
      type: Number,
      default: 1,
      min: [1, "Maximum team size must be at least 1"],
    },
    requiresFemaleTeammate: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["Hackathons", "Technical", "Cultural", "Sports", "Workshops", "Other"],
      default: "Hackathons",
    },
    collegeScope: {
      type: String,
      default: "All Colleges (Inter-College)",
    },
    description: {
      type: String,
      trim: true,
    },
    seatLimit: {
      type: Number,
      default: 100,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    bannerImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    },
    payoutAccount: {
      accountHolderName: { type: String, trim: true },
      bankName: { type: String, trim: true },
      accountNumberMasked: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      upiId: { type: String, trim: true },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model("Event", eventSchema);
