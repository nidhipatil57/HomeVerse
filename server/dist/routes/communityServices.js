"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_js_1 = __importDefault(require("../config/db.js"));
const auth_js_1 = require("../middleware/auth.js");
const index_js_1 = require("../socket/index.js");
const router = (0, express_1.Router)();
// ==========================================
// 🗂️ Categories
// ==========================================
router.get("/categories", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.serviceCategory.findMany();
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch categories: " + error.message });
    }
});
// ==========================================
// 👤 Workers & Profiles
// ==========================================
router.get("/workers", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const workers = await db_js_1.default.user.findMany({
            where: {
                role: "worker",
                status: "approved"
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                portal: true,
                unit: true,
                building: true,
                societyName: true,
                communityCode: true,
                joinedAt: true,
                status: true,
                workerCategory: true,
                availability: true,
                rating: true,
                experience: true,
                specializations: true,
                workerProfile: true,
                workerSkills: true,
                workerAvailability: true,
                workerReviews: {
                    include: {
                        resident: {
                            select: {
                                id: true,
                                name: true,
                                unit: true,
                                building: true
                            }
                        }
                    }
                }
            }
        });
        res.json(workers);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch workers: " + error.message });
    }
});
// ==========================================
// 📅 Bookings
// ==========================================
router.post("/bookings", auth_js_1.authenticateToken, async (req, res) => {
    const { workerId, category, bookingDate, bookingTime, address, notes } = req.body;
    if (!workerId || !category || !bookingDate || !bookingTime || !address) {
        return res.status(400).json({ error: "Missing required booking details" });
    }
    try {
        // Fetch worker profile to get visit charge
        const workerProfile = await db_js_1.default.workerProfile.findUnique({
            where: { workerId }
        });
        const price = workerProfile?.visitCharge || 100.0;
        const id = `SBK-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        const newBooking = await db_js_1.default.serviceBooking.create({
            data: {
                id,
                residentId: req.user.id,
                workerId,
                category,
                bookingDate,
                bookingTime,
                address,
                notes: notes || "",
                price,
                status: "Pending"
            },
            include: {
                resident: {
                    select: { id: true, name: true, phone: true, unit: true, building: true }
                },
                worker: {
                    select: { id: true, name: true, phone: true, workerCategory: true }
                }
            }
        });
        // Create notification for Worker
        const workerNotifId = `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        await db_js_1.default.notification.create({
            data: {
                id: workerNotifId,
                userId: workerId,
                title: "New Booking Request",
                message: `Resident ${req.user.name} requested ${category} service on ${bookingDate} at ${bookingTime}.`,
                type: "booking_request"
            }
        });
        // Broadcast Socket updates
        (0, index_js_1.broadcastUpdate)("booking:update", newBooking);
        (0, index_js_1.broadcastUpdate)("notification:update", { userId: workerId });
        res.status(201).json(newBooking);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create booking: " + error.message });
    }
});
router.get("/bookings", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { id, role } = req.user;
        let bookings;
        if (role === "secretary" || role === "manager" || role === "warden") {
            bookings = await db_js_1.default.serviceBooking.findMany({
                include: {
                    resident: { select: { id: true, name: true, phone: true, unit: true, building: true } },
                    worker: { select: { id: true, name: true, phone: true, workerCategory: true } },
                    reviews: true
                },
                orderBy: { createdAt: "desc" }
            });
        }
        else {
            bookings = await db_js_1.default.serviceBooking.findMany({
                where: { residentId: id },
                include: {
                    resident: { select: { id: true, name: true, phone: true, unit: true, building: true } },
                    worker: { select: { id: true, name: true, phone: true, workerCategory: true } },
                    reviews: true
                },
                orderBy: { createdAt: "desc" }
            });
        }
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch bookings: " + error.message });
    }
});
router.put("/bookings/:id/status", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes, operationalNotes, forwardedToManager } = req.body;
    if (!status) {
        return res.status(400).json({ error: "Status is required" });
    }
    try {
        const booking = await db_js_1.default.serviceBooking.findUnique({
            where: { id },
            include: {
                resident: true,
                worker: true
            }
        });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        const updatedBooking = await db_js_1.default.serviceBooking.update({
            where: { id },
            data: {
                status,
                adminNotes: adminNotes !== undefined ? adminNotes : undefined,
                operationalNotes: operationalNotes !== undefined ? operationalNotes : undefined,
                forwardedToManager: forwardedToManager !== undefined ? forwardedToManager : undefined
            },
            include: {
                resident: { select: { id: true, name: true, phone: true, unit: true, building: true } },
                worker: { select: { id: true, name: true, phone: true, workerCategory: true } }
            }
        });
        // Notify resident
        const notifId = `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        await db_js_1.default.notification.create({
            data: {
                id: notifId,
                userId: booking.residentId,
                title: `Service Request Status: ${status}`,
                message: `Your service request for ${booking.category} has been updated to "${status}". ${adminNotes || operationalNotes || ""}`,
                type: `booking_${status.toLowerCase().replace(/ /g, "_")}`
            }
        });
        // Also update worker availability status in static directory if status is Completed/Cancelled
        if (status === "Completed" || status === "Cancelled" || status === "Rejected by Secretary") {
            await db_js_1.default.user.update({
                where: { id: booking.workerId },
                data: { availability: "Available" }
            });
        }
        else if (status === "Scheduled") {
            await db_js_1.default.user.update({
                where: { id: booking.workerId },
                data: { availability: "Busy" }
            });
        }
        // Broadcast updates
        (0, index_js_1.broadcastUpdate)("booking:update", updatedBooking);
        (0, index_js_1.broadcastUpdate)("worker:update", { id: booking.workerId, availability: status === "Scheduled" ? "Busy" : "Available" });
        (0, index_js_1.broadcastUpdate)("notification:update", { userId: booking.residentId });
        res.json(updatedBooking);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update booking status: " + error.message });
    }
});
// ==========================================
// ⭐ Reviews & Ratings
// ==========================================
router.post("/reviews", auth_js_1.authenticateToken, async (req, res) => {
    const { bookingId, rating, reviewText, photos } = req.body;
    if (!bookingId || !rating) {
        return res.status(400).json({ error: "Booking ID and rating are required" });
    }
    try {
        const booking = await db_js_1.default.serviceBooking.findUnique({
            where: { id: bookingId }
        });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        const reviewId = `SRV-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        const newReview = await db_js_1.default.serviceReview.create({
            data: {
                id: reviewId,
                bookingId,
                residentId: req.user.id,
                workerId: booking.workerId,
                rating: parseInt(rating),
                reviewText: reviewText || "",
                photos: photos || []
            },
            include: {
                resident: { select: { id: true, name: true, unit: true, building: true } }
            }
        });
        // Update booking with rating
        await db_js_1.default.serviceBooking.update({
            where: { id: bookingId },
            data: { rating: parseInt(rating) }
        });
        // Recalculate average worker rating
        const allReviews = await db_js_1.default.serviceReview.findMany({
            where: { workerId: booking.workerId }
        });
        const totalStars = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalStars / allReviews.length;
        await db_js_1.default.user.update({
            where: { id: booking.workerId },
            data: { rating: avgRating }
        });
        // Notify worker
        const notifId = `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        await db_js_1.default.notification.create({
            data: {
                id: notifId,
                userId: booking.workerId,
                title: "New Review Received",
                message: `Resident ${req.user.name} rated your service ${rating} stars.`,
                type: "new_review"
            }
        });
        // Broadcast updates
        (0, index_js_1.broadcastUpdate)("review:update", newReview);
        (0, index_js_1.broadcastUpdate)("worker:update", { id: booking.workerId, rating: avgRating });
        (0, index_js_1.broadcastUpdate)("notification:update", { userId: booking.workerId });
        res.status(201).json(newReview);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to submit review: " + error.message });
    }
});
// ==========================================
// ❤️ Favorites
// ==========================================
router.post("/favorites", auth_js_1.authenticateToken, async (req, res) => {
    const { workerId } = req.body;
    if (!workerId) {
        return res.status(400).json({ error: "Worker ID is required" });
    }
    try {
        const existingFav = await db_js_1.default.favoriteWorker.findUnique({
            where: {
                residentId_workerId: {
                    residentId: req.user.id,
                    workerId
                }
            }
        });
        if (existingFav) {
            // Remove favorite
            await db_js_1.default.favoriteWorker.delete({
                where: { id: existingFav.id }
            });
            (0, index_js_1.broadcastUpdate)("favorite:update", { residentId: req.user.id, workerId, isFavorite: false });
            return res.json({ isFavorite: false });
        }
        else {
            // Add favorite
            const id = `FAV-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
            await db_js_1.default.favoriteWorker.create({
                data: {
                    id,
                    residentId: req.user.id,
                    workerId
                }
            });
            (0, index_js_1.broadcastUpdate)("favorite:update", { residentId: req.user.id, workerId, isFavorite: true });
            return res.status(201).json({ isFavorite: true });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Failed to toggle favorite: " + error.message });
    }
});
router.get("/favorites", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.favoriteWorker.findMany({
            where: { residentId: req.user.id },
            select: { workerId: true }
        });
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch favorites: " + error.message });
    }
});
// ==========================================
// ⏰ Worker Availability
// ==========================================
router.put("/availability", auth_js_1.authenticateToken, async (req, res) => {
    const { workingDays, startTime, endTime, holidays, blockedDate, busyHours, isOnline } = req.body;
    try {
        // If updating online status (Available / Offline)
        if (isOnline !== undefined) {
            await db_js_1.default.user.update({
                where: { id: req.user.id },
                data: { availability: isOnline ? "Available" : "Offline" }
            });
            (0, index_js_1.broadcastUpdate)("worker:update", { id: req.user.id, availability: isOnline ? "Available" : "Offline" });
        }
        const availability = await db_js_1.default.workerAvailability.upsert({
            where: { workerId: req.user.id },
            update: {
                workingDays: workingDays || undefined,
                startTime: startTime || undefined,
                endTime: endTime || undefined,
                holidays: holidays || undefined,
                blockedDate: blockedDate || undefined,
                busyHours: busyHours || undefined
            },
            create: {
                workerId: req.user.id,
                workingDays: workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                startTime: startTime || "09:00",
                endTime: endTime || "18:00",
                holidays: holidays || [],
                blockedDate: blockedDate || [],
                busyHours: busyHours || []
            }
        });
        (0, index_js_1.broadcastUpdate)("availability:update", availability);
        res.json(availability);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update availability: " + error.message });
    }
});
// ==========================================
// 💬 Real-Time Messaging System
// ==========================================
router.get("/messages/:userId", auth_js_1.authenticateToken, async (req, res) => {
    const { userId } = req.params;
    try {
        const messages = await db_js_1.default.chatMessage.findMany({
            where: {
                OR: [
                    { senderId: req.user.id, receiverId: userId },
                    { senderId: userId, receiverId: req.user.id }
                ]
            },
            orderBy: { timestamp: "asc" }
        });
        // Mark messages as read if receiver is current user
        await db_js_1.default.chatMessage.updateMany({
            where: { senderId: userId, receiverId: req.user.id, isRead: false },
            data: { isRead: true, status: "read" }
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch messages: " + error.message });
    }
});
router.post("/messages", auth_js_1.authenticateToken, async (req, res) => {
    const { receiverId, message, imageUrl } = req.body;
    if (!receiverId || !message) {
        return res.status(400).json({ error: "Receiver ID and message text are required" });
    }
    try {
        const id = `MSG-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        const chatMsg = await db_js_1.default.chatMessage.create({
            data: {
                id,
                senderId: req.user.id,
                receiverId,
                message,
                imageUrl: imageUrl || null
            }
        });
        // Create Notification for the receiver
        const notifId = `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        await db_js_1.default.notification.create({
            data: {
                id: notifId,
                userId: receiverId,
                title: `New Message from ${req.user.name}`,
                message: message.substring(0, 60) + (message.length > 60 ? "..." : ""),
                type: "chat_message"
            }
        });
        // Broadcast messages to both rooms
        (0, index_js_1.broadcastUpdate)("message:new", chatMsg);
        (0, index_js_1.broadcastUpdate)("notification:update", { userId: receiverId });
        res.status(201).json(chatMsg);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send message: " + error.message });
    }
});
// ==========================================
// 🛠️ Secretary Moderation & Verification
// ==========================================
router.put("/workers/:id/verify", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { isSocietyVerified, isPoliceVerified, approve, remove } = req.body;
    try {
        if (req.user.role !== "secretary" && req.user.role !== "manager" && req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Only Secretary/Manager can verify workers" });
        }
        if (remove) {
            await db_js_1.default.user.delete({
                where: { id }
            });
            (0, index_js_1.broadcastUpdate)("worker:update", { id, deleted: true });
            return res.json({ success: true, message: "Worker removed successfully" });
        }
        if (approve) {
            const updatedUser = await db_js_1.default.user.update({
                where: { id },
                data: { status: "approved" }
            });
            (0, index_js_1.broadcastUpdate)("worker:update", updatedUser);
            return res.json(updatedUser);
        }
        const updatedProfile = await db_js_1.default.workerProfile.upsert({
            where: { workerId: id },
            update: {
                isSocietyVerified: isSocietyVerified !== undefined ? isSocietyVerified : undefined,
                isPoliceVerified: isPoliceVerified !== undefined ? isPoliceVerified : undefined
            },
            create: {
                workerId: id,
                isSocietyVerified: isSocietyVerified || false,
                isPoliceVerified: isPoliceVerified || false
            }
        });
        (0, index_js_1.broadcastUpdate)("worker:update", { id, workerProfile: updatedProfile });
        res.json(updatedProfile);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to verify worker: " + error.message });
    }
});
router.get("/stats", auth_js_1.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "secretary" && req.user.role !== "manager") {
            return res.status(403).json({ error: "Access denied" });
        }
        const workerCount = await db_js_1.default.user.count({ where: { role: "worker", status: "approved" } });
        const bookingCount = await db_js_1.default.serviceBooking.count();
        const completedCount = await db_js_1.default.serviceBooking.count({ where: { status: "Completed" } });
        const pendingCount = await db_js_1.default.serviceBooking.count({ where: { status: "Pending" } });
        const recentReviews = await db_js_1.default.serviceReview.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                resident: { select: { name: true } },
                worker: { select: { name: true, workerCategory: true } }
            }
        });
        res.json({
            workerCount,
            bookingCount,
            completedCount,
            pendingCount,
            recentReviews
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch stats: " + error.message });
    }
});
// POST /workers - Add a new static worker record
router.post("/workers", auth_js_1.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "manager" && req.user.role !== "secretary") {
            return res.status(403).json({ error: "Access denied. Operational role required." });
        }
        const { name, email, phone, workerCategory, experience, specializations, visitCharge, workingHoursStart, workingHoursEnd, isVerified, isSocietyVerified, isPoliceVerified } = req.body;
        if (!name || !email || !phone || !workerCategory) {
            return res.status(400).json({ error: "Name, email, phone, and category are required." });
        }
        // Generate unique ID
        const workerId = `user-worker-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        // Hash dummy password since static workers don't log in
        const bcrypt = await import("bcryptjs");
        const hashedPassword = bcrypt.default.hashSync("Worker@123", 10);
        const newWorker = await db_js_1.default.user.create({
            data: {
                id: workerId,
                name,
                email: email.trim().toLowerCase(),
                phone,
                password: hashedPassword,
                role: "worker",
                portal: "society",
                status: "approved",
                workerCategory,
                experience: experience || "1 year",
                specializations: specializations || [],
                availability: "Available",
                rating: 5.0,
                joinedAt: new Date().toISOString().split("T")[0],
                workerProfile: {
                    create: {
                        visitCharge: parseFloat(visitCharge || 100),
                        workingHoursStart: workingHoursStart || "09:00",
                        workingHoursEnd: workingHoursEnd || "18:00",
                        isVerified: isVerified !== undefined ? isVerified : true,
                        isSocietyVerified: isSocietyVerified || false,
                        isPoliceVerified: isPoliceVerified || false
                    }
                }
            },
            include: {
                workerProfile: true
            }
        });
        (0, index_js_1.broadcastUpdate)("worker:update", newWorker);
        res.status(201).json(newWorker);
    }
    catch (error) {
        console.error("Error creating static worker:", error);
        res.status(500).json({ error: "Failed to create worker: " + error.message });
    }
});
// PUT /workers/:id - Update worker record
router.put("/workers/:id", auth_js_1.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "manager" && req.user.role !== "secretary") {
            return res.status(403).json({ error: "Access denied. Operational role required." });
        }
        const { id } = req.params;
        const { name, email, phone, workerCategory, experience, specializations, visitCharge, workingHoursStart, workingHoursEnd, isVerified, isSocietyVerified, isPoliceVerified, availability } = req.body;
        const updatedWorker = await db_js_1.default.user.update({
            where: { id },
            data: {
                name: name || undefined,
                email: email ? email.trim().toLowerCase() : undefined,
                phone: phone || undefined,
                workerCategory: workerCategory || undefined,
                experience: experience || undefined,
                specializations: specializations || undefined,
                availability: availability || undefined,
                workerProfile: {
                    update: {
                        visitCharge: visitCharge !== undefined ? parseFloat(visitCharge) : undefined,
                        workingHoursStart: workingHoursStart || undefined,
                        workingHoursEnd: workingHoursEnd || undefined,
                        isVerified: isVerified !== undefined ? isVerified : undefined,
                        isSocietyVerified: isSocietyVerified !== undefined ? isSocietyVerified : undefined,
                        isPoliceVerified: isPoliceVerified !== undefined ? isPoliceVerified : undefined
                    }
                }
            },
            include: {
                workerProfile: true
            }
        });
        (0, index_js_1.broadcastUpdate)("worker:update", updatedWorker);
        res.json(updatedWorker);
    }
    catch (error) {
        console.error("Error updating static worker:", error);
        res.status(500).json({ error: "Failed to update worker: " + error.message });
    }
});
// DELETE /workers/:id - Remove worker
router.delete("/workers/:id", auth_js_1.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "manager" && req.user.role !== "secretary") {
            return res.status(403).json({ error: "Access denied. Operational role required." });
        }
        const { id } = req.params;
        // Delete user (cascade will handle workerProfile)
        await db_js_1.default.user.delete({
            where: { id }
        });
        (0, index_js_1.broadcastUpdate)("worker:delete", { id });
        res.json({ success: true, message: "Worker removed successfully" });
    }
    catch (error) {
        console.error("Error deleting static worker:", error);
        res.status(500).json({ error: "Failed to delete worker: " + error.message });
    }
});
exports.default = router;
