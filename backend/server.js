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

const FRONTEND_URL = process.env.FRONTEND_URL;

// ✅ Express CORS (REST)
app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    })
);

// ✅ Preflight support
app.options("*", cors());

app.use(express.json());

// ✅ Socket.IO CORS
const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Database
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/calendar", calendarRoutes);

// Health
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// WebSocket handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Frontend allowed: ${FRONTEND_URL}`);
});
