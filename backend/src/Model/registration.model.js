import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  rollNo: {
    type: String,
    required: true,
    trim: true,
  },
  branch: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
});

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ["Solo", "Team"],
      required: true,
    },
    teamName: {
      type: String,
      trim: true,
    },
    teamMembers: {
      type: [teamMemberSchema],
      default: [],
    },
    feeStatus: {
      type: String,
      enum: ["Free", "Pending", "Paid"],
      default: "Free",
      index: true,
    },
    feeAmount: {
      type: Number,
      default: 0,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    checkedIn: {
      type: Boolean,
      default: false,
      index: true,
    },
    checkedInAt: {
      type: String,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: Prevent the same user from registering twice for the same event
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

export const Registration = mongoose.model("Registration", registrationSchema);
