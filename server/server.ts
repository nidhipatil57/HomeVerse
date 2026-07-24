import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { execSync } from "child_process";
import prisma from "./config/db.js";
import { initSocket } from "./socket/index.js";
import authRouter from "./routes/auth.js";
import complaintsRouter from "./routes/complaints.js";
import visitorsRouter from "./routes/visitors.js";
import communityServicesRouter from "./routes/communityServices.js";
import miscRouter from "./routes/misc.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: true, // Allow requests from any origin (e.g. localhost:3000)
  credentials: true
}));

// Parsers
app.use(express.json());
app.use(cookieParser());

// Initialize WebSocket Socket.IO Server
const io = initSocket(server);

// Route mappings
app.use("/api/auth", authRouter);
app.use("/api/complaints", complaintsRouter);
app.use("/api/visitors", visitorsRouter);
app.use("/api/community-services", communityServicesRouter);
// Miscellaneous sub-features are routed under `/api` directly in miscRouter
app.use("/api", miscRouter);

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "homeverse-backend" });
});

// Startup Self-Verification
async function verifyAndSetupDatabase() {
  console.log("🔍 Running Startup Verification...");
  try {
    // 1. Verify database connection
    await prisma.$connect();
    console.log("🟢 Database connection successful.");

    // 2. Check table record counts to verify tables exist
    const userCount = await prisma.user.count();
    const complaintCount = await prisma.complaint.count();
    const visitorCount = await prisma.visitor.count();
    const attendanceCount = await prisma.helperAttendance.count();

    console.log("🟢 Required database tables exist.");
    console.log("📊 Database Record Counts:");
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Complaints: ${complaintCount}`);
    console.log(`   - Visitors: ${visitorCount}`);
    console.log(`   - Helper Attendance: ${attendanceCount}`);
  } catch (error: any) {
    console.error("❌ Startup Database Verification failed:", error.message);
  }
}

// Start the unified backend server
async function startServer() {
  await verifyAndSetupDatabase();
  server.listen(PORT, () => {
    console.log(`🚀 HomeVerse Backend running on port ${PORT}`);
  });
}

startServer();
