import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

import stateRoutes from "./routes/stateRoutes.js";

dotenv.config();

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/ol-study-helper";
const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGO_URI;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

if (!process.env.MONGODB_URI) {
  console.warn(
    `No MONGODB_URI found; defaulting to ${DEFAULT_MONGO_URI}. ` +
      "Set MONGODB_URI in your environment for remote databases."
  );
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || origin === "null") {
      return callback(null, true);
    }
    if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/state", stateRoutes);

let memoryServer;

async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);
  } catch (error) {
    const shouldFallback =
      !process.env.MONGODB_URI && /ECONNREFUSED/.test(error?.message || "");
    if (shouldFallback) {
      console.warn(
        "Local MongoDB unreachable; starting an in-memory MongoDB instance. " +
          "All data will reset when the server stops."
      );
      memoryServer = await MongoMemoryServer.create();
      await mongoose.connect(memoryServer.getUri(), {
        serverSelectionTimeoutMS: 5000
      });
      console.log("Connected to in-memory MongoDB instance.");
      return;
    }
    throw error;
  }
}

async function start() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
  process.exit(0);
}

["SIGINT", "SIGTERM"].forEach(signal => {
  process.on(signal, () => {
    gracefulShutdown(signal).catch(error => {
      console.error("Error during shutdown", error);
      process.exit(1);
    });
  });
});

start();
