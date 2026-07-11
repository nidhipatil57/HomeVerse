"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = __importDefault(require("../config/db.js"));
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "homeverse-secret-key-12345";
// Login endpoint
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    try {
        const user = await db_js_1.default.user.findUnique({ where: { email: email.trim().toLowerCase() } });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const isValidPassword = bcryptjs_1.default.compareSync(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, portal: user.portal, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        const userProfile = { ...user };
        // @ts-ignore
        delete userProfile.password;
        res.json({ token, user: userProfile });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Register endpoint
router.post("/register", async (req, res) => {
    const { id, email, password, name, phone, role, portal, unit, building, societyName, communityCode, ownerOrTenant } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ error: "Name, email and password are required" });
    }
    try {
        const existingUser = await db_js_1.default.user.findUnique({ where: { email: email.trim().toLowerCase() } });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }
        const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
        const generatedId = id || `user-${role}-${Math.floor(100 + Math.random() * 900)}`;
        const user = await db_js_1.default.user.create({
            data: {
                id: generatedId,
                name,
                email: email.trim().toLowerCase(),
                phone: phone || "",
                role,
                portal,
                unit,
                building,
                societyName,
                communityCode,
                ownerOrTenant,
                password: hashedPassword,
                joinedAt: new Date().toISOString().split("T")[0]
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, portal: user.portal, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        const userProfile = { ...user };
        // @ts-ignore
        delete userProfile.password;
        res.status(201).json({ token, user: userProfile });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Logout endpoint
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully" });
});
// Current User Profile Endpoint
router.get("/me", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const user = await db_js_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const userProfile = { ...user };
        // @ts-ignore
        delete userProfile.password;
        res.json({ user: userProfile });
    }
    catch (error) {
        console.error("Fetch current user error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update Profile
router.put("/profile", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const user = await db_js_1.default.user.update({
            where: { id: req.user.id },
            data: req.body
        });
        const userProfile = { ...user };
        // @ts-ignore
        delete userProfile.password;
        res.json({ user: userProfile });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update profile" });
    }
});
exports.default = router;
