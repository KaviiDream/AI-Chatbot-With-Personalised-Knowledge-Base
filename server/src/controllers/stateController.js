import { UserState } from "../models/UserState.js";
import { TIMELINE_STEPS } from "../constants/timeline.js";

const MAX_SNAPSHOTS = 5;
const CONFIDENCE_LEVELS = ["Low", "Medium", "High"];

async function ensureState(userId) {
  let state = await UserState.findOne({ userId });
  if (!state) {
    state = await UserState.create({ userId });
  }
  return state;
}

function sanitizeSnapshots(pending) {
  if (!Array.isArray(pending) || !pending.length) {
    return [];
  }
  return pending
    .filter(item => item && typeof item === "object")
    .slice(0, MAX_SNAPSHOTS)
    .map(item => ({
      subject: String(item.subject || "").trim().slice(0, 80),
      topic: String(item.topic || "").trim().slice(0, 120),
      hours: normalizeHours(item.hours)
    }));
}

function sanitizePlan(plan) {
  if (!plan || typeof plan !== "object") {
    return null;
  }
  const subject = String(plan.subject || "").trim().slice(0, 80);
  const topic = String(plan.topic || "").trim().slice(0, 120);
  const hours = normalizeHours(plan.hours);
  const confidence = CONFIDENCE_LEVELS.includes(plan.confidence)
    ? plan.confidence
    : undefined;
  if (!subject || !topic) {
    return null;
  }
  return {
    subject,
    topic,
    hours,
    confidence: confidence || "Medium"
  };
}

function sanitizeTimeline(pending) {
  const safe = Array.isArray(pending) ? pending : [];
  return TIMELINE_STEPS.map(step => {
    const match = safe.find(item => item && item.step === step);
    return {
      step,
      completed: Boolean(match && match.completed)
    };
  });
}

function normalizeHours(value) {
  if (!Number.isFinite(Number(value))) {
    return 0;
  }
  return Math.max(0, Math.min(Number(value), 200));
}

export async function getState(req, res) {
  try {
    const { userId } = req.params;
    const state = await ensureState(userId);
    res.json({
      planner: state.planner,
      tools: state.tools
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch state", error: error.message });
  }
}

export async function updatePlanner(req, res) {
  try {
    const { userId } = req.params;
    const state = await ensureState(userId);
    const { loggedHours, weeklyGoal, snapshots, lastPlan } = req.body || {};

    if (Number.isFinite(Number(loggedHours))) {
      state.planner.loggedHours = Math.max(0, Math.min(Number(loggedHours), 200));
    }

    if (Number.isFinite(Number(weeklyGoal))) {
      state.planner.weeklyGoal = Math.max(1, Math.min(Number(weeklyGoal), 200));
    }

    const cleanSnapshots = sanitizeSnapshots(snapshots);
    if (snapshots && cleanSnapshots) {
      state.planner.snapshots = cleanSnapshots;
    }

    const cleanPlan = sanitizePlan(lastPlan);
    if (lastPlan) {
      state.planner.lastPlan = cleanPlan;
    }

    await state.save();
    res.json({ planner: state.planner });
  } catch (error) {
    res.status(500).json({ message: "Unable to update planner", error: error.message });
  }
}

export async function updateTools(req, res) {
  try {
    const { userId } = req.params;
    const state = await ensureState(userId);
    const { timeline } = req.body || {};
    if (timeline) {
      state.tools.timeline = sanitizeTimeline(timeline);
    }
    await state.save();
    res.json({ tools: state.tools });
  } catch (error) {
    res.status(500).json({ message: "Unable to update tools", error: error.message });
  }
}
