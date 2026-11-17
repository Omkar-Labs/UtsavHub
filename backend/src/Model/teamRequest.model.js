import mongoose from "mongoose";

const teamRequestSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      default: "Hey! Let's team up for this campus event.",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Cancelled"],
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent sending multiple pending requests from the same sender to the same receiver for the same event
teamRequestSchema.index({ event: 1, sender: 1, receiver: 1, status: 1 });

export const TeamRequest = mongoose.model("TeamRequest", teamRequestSchema);
