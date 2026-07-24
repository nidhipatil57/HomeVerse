import { Router } from "express";
import prisma from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { broadcastUpdate } from "../socket/index.js";

const router = Router();

// ==========================================
// 🗂️ Categories
// ==========================================
router.get("/categories", authenticateToken, async (req, res) => {
  try {
    const list = await prisma.serviceCategory.findMany();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch categories: " + error.message });
  }
});

// ==========================================
// 👤 Workers & Profiles
// ==========================================
router.get("/workers", authenticateToken, async (req, res) => {
  try {
    const workers = await prisma.user.findMany({
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
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch workers: " + error.message });
  }
});

// ==========================================
// 📅 Bookings
// ==========================================
router.post("/bookings", authenticateToken, async (req: any, res) => {
  const { workerId, category, bookingDate, bookingTime, address, notes } = req.body;

  if (!workerId || !category || !bookingDate || !bookingTime || !address) {
    return res.status(400).json({ error: "Missing required booking details" });
  }

  try {
    // Fetch worker profile to get visit charge
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { workerId }
    });

    const price = workerProfile?.visitCharge || 100.0;
    const id = `SBK-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;

    const newBooking = await prisma.serviceBooking.create({
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
    await prisma.notification.create({
      data: {
        id: workerNotifId,
        userId: workerId,
        title: "New Booking Request",
        message: `Resident ${req.user.name} requested ${category} service on ${bookingDate} at ${bookingTime}.`,
        type: "booking_request"
      }
    });

    // Broadcast Socket updates
    broadcastUpdate("booking:update", newBooking);
    broadcastUpdate("notification:update", { userId: workerId });

    res.status(201).json(newBooking);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create booking: " + error.message });
  }
});

router.get("/bookings", authenticateToken, async (req: any, res) => {
  try {
    const { id, role } = req.user;
    let bookings;

    if (role === "worker") {
      bookings = await prisma.serviceBooking.findMany({
        where: { workerId: id },
        include: {
          resident: { select: { id: true, name: true, phone: true, unit: true, building: true } },
          worker: { select: { id: true, name: true, phone: true, workerCategory: true } },
          reviews: true
        },
        orderBy: { createdAt: "desc" }
      });
    } else {
      bookings = await prisma.serviceBooking.findMany({
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
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch bookings: " + error.message });
  }
});

router.put("/bookings/:id/status", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status } = req.body; // Accepted, Rejected, Completed, Cancelled

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        resident: true,
        worker: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const updatedBooking = await prisma.serviceBooking.update({
      where: { id },
      data: { status },
      include: {
        resident: { select: { id: true, name: true, phone: true, unit: true, building: true } },
        worker: { select: { id: true, name: true, phone: true, workerCategory: true } }
      }
    });

    // Notify resident or worker
    const targetUserId = req.user.role === "worker" ? booking.residentId : booking.workerId;
    const notificationTitle = `Booking Status: ${status}`;
    const notificationMessage = req.user.role === "worker"
      ? `Worker ${booking.worker.name} has updated your booking status to ${status}.`
      : `Resident ${booking.resident.name} has ${status.toLowerCase()} the booking scheduled for ${booking.bookingDate}.`;

    const notifId = `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    await prisma.notification.create({
      data: {
        id: notifId,
        userId: targetUserId,
        title: notificationTitle,
        message: notificationMessage,
        type: `booking_${status.toLowerCase()}`
      }
    });

    // Also update worker availability status if status is Accepted or Completed/Cancelled
    if (status === "Accepted") {
      await prisma.user.update({
        where: { id: booking.workerId },
        data: { availability: "Busy" }
      });
    } else if (status === "Completed" || status === "Cancelled" || status === "Rejected") {
      await prisma.user.update({
        where: { id: booking.workerId },
        data: { availability: "Available" }
      });
    }

    // Broadcast updates
    broadcastUpdate("booking:update", updatedBooking);
    broadcastUpdate("worker:update", { id: booking.workerId, availability: status === "Accepted" ? "Busy" : "Available" });
    broadcastUpdate("notification:update", { userId: targetUserId });

    res.json(updatedBooking);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update booking status: " + error.message });
  }
});

// ==========================================
// ⭐ Reviews & Ratings
// ==========================================
router.post("/reviews", authenticateToken, async (req: any, res) => {
  const { bookingId, rating, reviewText, photos } = req.body;

  if (!bookingId || !rating) {
    return res.status(400).json({ error: "Booking ID and rating are required" });
  }

  try {
    const booking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const reviewId = `SRV-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    const newReview = await prisma.serviceReview.create({
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
    await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: { rating: parseInt(rating) }
    });

    // Recalculate average worker rating
    const allReviews = await prisma.serviceReview.findMany({
      where: { workerId: booking.workerId }
    });

    const totalStars = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalStars / allReviews.length;

    await prisma.user.update({
      where: { id: booking.workerId },
      data: { rating: avgRating }
    });

    // Notify worker
    const notifId = `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    await prisma.notification.create({
      data: {
        id: notifId,
        userId: booking.workerId,
        title: "New Review Received",
        message: `Resident ${req.user.name} rated your service ${rating} stars.`,
        type: "new_review"
      }
    });

    // Broadcast updates
    broadcastUpdate("review:update", newReview);
    broadcastUpdate("worker:update", { id: booking.workerId, rating: avgRating });
    broadcastUpdate("notification:update", { userId: booking.workerId });

    res.status(201).json(newReview);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to submit review: " + error.message });
  }
});

// ==========================================
// ❤️ Favorites
// ==========================================
router.post("/favorites", authenticateToken, async (req: any, res) => {
  const { workerId } = req.body;

  if (!workerId) {
    return res.status(400).json({ error: "Worker ID is required" });
  }

  try {
    const existingFav = await prisma.favoriteWorker.findUnique({
      where: {
        residentId_workerId: {
          residentId: req.user.id,
          workerId
        }
      }
    });

    if (existingFav) {
      // Remove favorite
      await prisma.favoriteWorker.delete({
        where: { id: existingFav.id }
      });
      broadcastUpdate("favorite:update", { residentId: req.user.id, workerId, isFavorite: false });
      return res.json({ isFavorite: false });
    } else {
      // Add favorite
      const id = `FAV-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
      await prisma.favoriteWorker.create({
        data: {
          id,
          residentId: req.user.id,
          workerId
        }
      });
      broadcastUpdate("favorite:update", { residentId: req.user.id, workerId, isFavorite: true });
      return res.status(201).json({ isFavorite: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Failed to toggle favorite: " + error.message });
  }
});

router.get("/favorites", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.favoriteWorker.findMany({
      where: { residentId: req.user.id },
      select: { workerId: true }
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch favorites: " + error.message });
  }
});

// ==========================================
// ⏰ Worker Availability
// ==========================================
router.put("/availability", authenticateToken, async (req: any, res) => {
  const { workingDays, startTime, endTime, holidays, blockedDate, busyHours, isOnline } = req.body;

  try {
    // If updating online status (Available / Offline)
    if (isOnline !== undefined) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { availability: isOnline ? "Available" : "Offline" }
      });
      broadcastUpdate("worker:update", { id: req.user.id, availability: isOnline ? "Available" : "Offline" });
    }

    const availability = await prisma.workerAvailability.upsert({
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

    broadcastUpdate("availability:update", availability);
    res.json(availability);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update availability: " + error.message });
  }
});

// ==========================================
// 💬 Real-Time Messaging System
// ==========================================
router.get("/messages/:userId", authenticateToken, async (req: any, res) => {
  const { userId } = req.params;

  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: userId },
          { senderId: userId, receiverId: req.user.id }
        ]
      },
      orderBy: { timestamp: "asc" }
    });

    // Mark messages as read if receiver is current user
    await prisma.chatMessage.updateMany({
      where: { senderId: userId, receiverId: req.user.id, isRead: false },
      data: { isRead: true, status: "read" }
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch messages: " + error.message });
  }
});

router.post("/messages", authenticateToken, async (req: any, res) => {
  const { receiverId, message, imageUrl } = req.body;

  if (!receiverId || !message) {
    return res.status(400).json({ error: "Receiver ID and message text are required" });
  }

  try {
    const id = `MSG-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    const chatMsg = await prisma.chatMessage.create({
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
    await prisma.notification.create({
      data: {
        id: notifId,
        userId: receiverId,
        title: `New Message from ${req.user.name}`,
        message: message.substring(0, 60) + (message.length > 60 ? "..." : ""),
        type: "chat_message"
      }
    });

    // Broadcast messages to both rooms
    broadcastUpdate("message:new", chatMsg);
    broadcastUpdate("notification:update", { userId: receiverId });

    res.status(201).json(chatMsg);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to send message: " + error.message });
  }
});

// ==========================================
// 🛠️ Secretary Moderation & Verification
// ==========================================
router.put("/workers/:id/verify", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { isSocietyVerified, isPoliceVerified, approve, remove } = req.body;

  try {
    if (req.user.role !== "secretary") {
      return res.status(403).json({ error: "Only Secretary can verify workers" });
    }

    if (remove) {
      await prisma.user.delete({
        where: { id }
      });
      broadcastUpdate("worker:update", { id, deleted: true });
      return res.json({ success: true, message: "Worker removed successfully" });
    }

    if (approve) {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { status: "approved" }
      });
      broadcastUpdate("worker:update", updatedUser);
      return res.json(updatedUser);
    }

    const updatedProfile = await prisma.workerProfile.upsert({
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

    broadcastUpdate("worker:update", { id, workerProfile: updatedProfile });
    res.json(updatedProfile);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to verify worker: " + error.message });
  }
});

router.get("/stats", authenticateToken, async (req: any, res) => {
  try {
    if (req.user.role !== "secretary") {
      return res.status(403).json({ error: "Access denied" });
    }

    const workerCount = await prisma.user.count({ where: { role: "worker", status: "approved" } });
    const bookingCount = await prisma.serviceBooking.count();
    const completedCount = await prisma.serviceBooking.count({ where: { status: "Completed" } });
    const pendingCount = await prisma.serviceBooking.count({ where: { status: "Pending" } });
    
    const recentReviews = await prisma.serviceReview.findMany({
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
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch stats: " + error.message });
  }
});

export default router;
