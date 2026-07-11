"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.authorizeRoles = authorizeRoles;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "homeverse-secret-key-12345";
function authenticateToken(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }
    try {
        const verified = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
}
function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access forbidden: insufficient permissions" });
        }
        next();
    };
}
