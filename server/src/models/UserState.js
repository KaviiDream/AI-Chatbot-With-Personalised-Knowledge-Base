import mongoose from "mongoose";
import { TIMELINE_STEPS } from "../constants/timeline.js";

const SnapshotSchema = new mongoose.Schema(
  {
    subject: { type: String, trim: true, default: "" },
    topic: { type: String, trim: true, default: "" },
    hours: { type: Number, min: 0, max: 200, default: 0 }
  },
  { _id: false }
);

const PlanSchema = new mongoose.Schema(
  {
    subject: { type: String, trim: true },
    topic: { type: String, trim: true },
    hours: { type: Number, min: 0, max: 200 },
    confidence: { type: String, trim: true }
  },
  { _id: false }
);

const TimelineSchema = new mongoose.Schema(
  {
    step: { type: String, trim: true },
    completed: { type: Boolean, default: false }
  },
  { _id: false }
);

const timelineDefaults = TIMELINE_STEPS.map(step => ({ step, completed: false }));

const userStateSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    planner: {
      loggedHours: { type: Number, min: 0, max: 200, default: 0 },
      weeklyGoal: { type: Number, min: 1, max: 200, default: 20 },
      snapshots: { type: [SnapshotSchema], default: [] },
      lastPlan: { type: PlanSchema, default: null }
    },
    tools: {
      timeline: { type: [TimelineSchema], default: () => timelineDefaults }
    }
  },
  { timestamps: true }
);

export const UserState = mongoose.model("UserState", userStateSchema);
