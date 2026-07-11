import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initSocket } from "./socket/index.js";
import authRouter from "./routes/auth.js";
import complaintsRouter from "./routes/complaints.js";
import visitorsRouter from "./routes/visitors.js";
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
// Miscellaneous sub-features are routed under `/api` directly in miscRouter
app.use("/api", miscRouter);

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "homeverse-backend" });
});

// Start the unified backend server
server.listen(PORT, () => {
  console.log(`🚀 HomeVerse Backend running on port ${PORT}`);
});
