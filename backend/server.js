import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { setupSocketHandlers } from "./events/socketHandlers.js";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import friendRoutes from "./routes/friends.js";
import goalRoutes from "./routes/goals.js";
import taskRoutes from "./routes/tasks.js";
import commentRoutes from "./routes/comments.js";
import reactionRoutes from "./routes/reactions.js";
import activityRoutes from "./routes/activity.js";
import calendarRoutes from "./routes/calendar.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

/**
 * ============================
 * CORS CONFIG (IMPORTANT)
 * ============================
 * - Allows localhost ANY port (Vite)
 * - Allows deployed Vercel frontend
 * - Blocks unknown origins
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,              // Vercel frontend (prod)
  "http://localhost:5173",               // Vite default
  "http://localhost:5174",               // Vite fallback
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server & tools like curl/postman
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ REST CORS
app.use(cors(corsOptions));

// ✅ Preflight support (VERY IMPORTANT)
app.options("*", cors(corsOptions));

app.use(express.json());

/**
 * ============================
 * SOCKET.IO CORS
 * ============================
 */
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// ============================
// DATABASE
// ============================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ============================
// ROUTES
// ============================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/calendar", calendarRoutes);

// ============================
// HEALTH CHECK
// ============================
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ============================
// SOCKET HANDLERS
// ============================
setupSocketHandlers(io);

// ============================
// SERVER START
// ============================
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Allowed frontends:`, allowedOrigins);
});
