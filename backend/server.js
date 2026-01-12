import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import { setupSocketHandlers } from "./events/socketHandlers.js";
import {
    checkStreakRescue,
    checkFutureSelfReminder,
    checkAlmostThere,
    checkSilentMiss,
    checkConsistencyOverPerfection
} from "./utils/notificationTriggers.js";

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
import insightsRoutes from "./routes/insights.js";
import analyticsRoutes from "./routes/analytics.js";
import notificationRoutes from "./routes/notifications.js";
import challengeRoutes from "./routes/challenges.js";
import routineRoutes from "./routes/routines.js";

// Middleware
import { apiLimiter, loginLimiter, friendRequestLimiter } from "./middleware/rateLimiter.js";

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
    "https://localhost",                   // Capacitor mobile app
    "capacitor://localhost",               // Capacitor iOS
    "http://localhost",                    // Capacitor Android
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

// ✅ Trust proxy for Render deployment (fixes rate limiter)
app.set('trust proxy', 1);

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
// SOCKET MIDDLEWARE - Attach io to requests
// ============================
app.use((req, res, next) => {
    req.io = io;
    next();
});

// ============================
// ROUTES (with rate limiting)
// ============================
// Apply general API rate limiting to all routes
app.use("/api/", apiLimiter);

// Auth routes with strict login limiting applied inside the router
app.use("/api/auth", authRoutes);

// Other routes
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/routines", routineRoutes);

app.get("/api/app/updates", (req, res) => {
    const platform = (req.query.platform || "android").toString().toLowerCase();

    if (platform !== "android") {
        return res.json({ platform, latest: null });
    }

    const versionName = process.env.ANDROID_LATEST_VERSION_NAME || null;
    const versionCodeRaw = process.env.ANDROID_LATEST_VERSION_CODE || null;
    const minSupportedVersionCodeRaw = process.env.ANDROID_MIN_SUPPORTED_VERSION_CODE || null;
    const apkUrl = process.env.ANDROID_LATEST_APK_URL || null;
    const releaseNotes = process.env.ANDROID_LATEST_RELEASE_NOTES || null;

    const versionCode = versionCodeRaw ? Number.parseInt(versionCodeRaw, 10) : null;
    const minSupportedVersionCode = minSupportedVersionCodeRaw ? Number.parseInt(minSupportedVersionCodeRaw, 10) : null;

    return res.json({
        platform,
        latest: {
            versionName,
            versionCode: Number.isFinite(versionCode) ? versionCode : null,
            minSupportedVersionCode: Number.isFinite(minSupportedVersionCode) ? minSupportedVersionCode : null,
            apkUrl,
            releaseNotes
        }
    });
});

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
// CRON JOBS FOR NOTIFICATIONS
// ============================
// 6 AM - Consistency Over Perfection (broke streak yesterday)
cron.schedule('0 6 * * *', async () => {
    console.log('⏰ Running Consistency Over Perfection check...');
    try {
        const notifications = await checkConsistencyOverPerfection();
        console.log(`✅ Created ${notifications.length} consistency notifications`);
    } catch (error) {
        console.error('❌ Consistency check error:', error);
    }
});

// 2 PM - Almost There Nudge (60-80% completion)
cron.schedule('0 14 * * *', async () => {
    console.log('⏰ Running Almost There Nudge check...');
    try {
        const notifications = await checkAlmostThere();
        console.log(`✅ Created ${notifications.length} almost there notifications`);
    } catch (error) {
        console.error('❌ Almost there check error:', error);
    }
});

// 6 PM - Streak Rescue (< 6 hours left, no progress)
cron.schedule('0 18 * * *', async () => {
    console.log('⏰ Running Streak Rescue check...');
    try {
        const notifications = await checkStreakRescue();
        console.log(`✅ Created ${notifications.length} streak rescue notifications`);
    } catch (error) {
        console.error('❌ Streak rescue check error:', error);
    }
});

// 8 PM - Silent Miss Warning (scheduled goals, zero progress)
cron.schedule('0 20 * * *', async () => {
    console.log('⏰ Running Silent Miss Warning check...');
    try {
        const notifications = await checkSilentMiss();
        console.log(`✅ Created ${notifications.length} silent miss notifications`);
    } catch (error) {
        console.error('❌ Silent miss check error:', error);
    }
});

// Daily at midnight - Future Self Reminder (same goal missed 2 days)
cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running Future Self Reminder check...');
    try {
        const notifications = await checkFutureSelfReminder();
        console.log(`✅ Created ${notifications.length} future self notifications`);
    } catch (error) {
        console.error('❌ Future self check error:', error);
    }
});

console.log('✅ Notification cron jobs scheduled');

// ============================
// SERVER START
// ============================
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Allowed frontends:`, allowedOrigins);
});
