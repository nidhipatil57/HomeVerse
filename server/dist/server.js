"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_js_1 = __importDefault(require("./config/db.js"));
const index_js_1 = require("./socket/index.js");
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const complaints_js_1 = __importDefault(require("./routes/complaints.js"));
const visitors_js_1 = __importDefault(require("./routes/visitors.js"));
const misc_js_1 = __importDefault(require("./routes/misc.js"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 5000;
// Enable CORS
app.use((0, cors_1.default)({
    origin: true, // Allow requests from any origin (e.g. localhost:3000)
    credentials: true
}));
// Parsers
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Initialize WebSocket Socket.IO Server
const io = (0, index_js_1.initSocket)(server);
// Route mappings
app.use("/api/auth", auth_js_1.default);
app.use("/api/complaints", complaints_js_1.default);
app.use("/api/visitors", visitors_js_1.default);
// Miscellaneous sub-features are routed under `/api` directly in miscRouter
app.use("/api", misc_js_1.default);
// Basic health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "homeverse-backend" });
});
// Startup Self-Verification
async function verifyAndSetupDatabase() {
    console.log("🔍 Running Startup Verification...");
    try {
        // 1. Verify database connection
        await db_js_1.default.$connect();
        console.log("🟢 Database connection successful.");
        // 2. Check table record counts to verify tables exist
        const userCount = await db_js_1.default.user.count();
        const complaintCount = await db_js_1.default.complaint.count();
        const visitorCount = await db_js_1.default.visitor.count();
        const attendanceCount = await db_js_1.default.helperAttendance.count();
        console.log("🟢 Required database tables exist.");
        console.log("📊 Database Record Counts:");
        console.log(`   - Users: ${userCount}`);
        console.log(`   - Complaints: ${complaintCount}`);
        console.log(`   - Visitors: ${visitorCount}`);
        console.log(`   - Helper Attendance: ${attendanceCount}`);
    }
    catch (error) {
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
