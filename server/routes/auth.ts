import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "homeverse-secret-key-12345";

// Login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, portal: user.portal, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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
  } catch (error: any) {
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
    const existingUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const generatedId = id || `user-${role}-${Math.floor(100 + Math.random() * 900)}`;

    const user = await prisma.user.create({
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

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, portal: user.portal, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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
  } catch (error: any) {
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
router.get("/me", authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userProfile = { ...user };
    // @ts-ignore
    delete userProfile.password;

    res.json({ user: userProfile });
  } catch (error: any) {
    console.error("Fetch current user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Profile
router.put("/profile", authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body
    });
    const userProfile = { ...user };
    // @ts-ignore
    delete userProfile.password;
    res.json({ user: userProfile });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
