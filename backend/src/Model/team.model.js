import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  role: {
    type: String,
    default: "Member", // "Leader" | "Member" | "Co-Founder"
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const teamSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    teamCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [teamMemberSchema],
      validate: {
        validator: function (val) {
          return val.length > 0;
        },
        message: "A team must have at least one member",
      },
    },
    status: {
      type: String,
      enum: ["Forming", "Ready", "Registered"],
      default: "Forming",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: A team code should be globally unique, and students shouldn't have duplicate teams for the same event
teamSchema.index({ event: 1, "members.student": 1 });

export const Team = mongoose.model("Team", teamSchema);
