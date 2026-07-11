import { Router } from "express";
import prisma from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { broadcastUpdate } from "../socket/index.js";

const router = Router();

// ==========================================
// 📢 Announcements
// ==========================================
router.get("/announcements", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.post("/announcements", authenticateToken, async (req: any, res) => {
  const { title, content, priority, tags } = req.body;
  try {
    const id = `ANN-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.announcement.create({
      data: {
        id,
        title,
        content,
        author: req.user.name || "Admin",
        authorRole: req.user.role,
        priority: priority || "normal",
        tags: tags || []
      }
    });
    broadcastUpdate("announcement:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// ==========================================
// ✈️ Leave Requests
// ==========================================
router.get("/leaveRequests", authenticateToken, async (req: any, res) => {
  try {
    const { role, id } = req.user;
    let list;
    if (role === "warden") {
      list = await prisma.leaveRequest.findMany({ orderBy: { createdAt: "desc" } });
    } else {
      list = await prisma.leaveRequest.findMany({ where: { studentId: id }, orderBy: { createdAt: "desc" } });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaves" });
  }
});

router.post("/leaveRequests", authenticateToken, async (req: any, res) => {
  const { studentName, room, parentContact, reason, fromDate, toDate } = req.body;
  try {
    const id = `LEAVE-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.leaveRequest.create({
      data: {
        id,
        studentId: req.user.id,
        studentName: studentName || req.user.name || "Student",
        room: room || req.user.unit || "Room 101",
        parentContact: parentContact || "",
        reason,
        fromDate,
        toDate,
        status: "pending"
      }
    });
    broadcastUpdate("leave:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit leave" });
  }
});

router.put("/leaveRequests/:id/status", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status }
    });
    broadcastUpdate("leave:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update leave status" });
  }
});

// ==========================================
// 🧺 Laundry Slots
// ==========================================
router.get("/laundry", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.laundrySlot.findMany();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch laundry slots" });
  }
});

router.post("/laundry", authenticateToken, async (req: any, res) => {
  const { machineId, machineName, date, timeSlot } = req.body;
  try {
    const id = `LND-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    const newItem = await prisma.laundrySlot.create({
      data: {
        id,
        machineId,
        machineName,
        date,
        timeSlot,
        bookedBy: req.user.name || "Student",
        bookedById: req.user.id,
        communityCode: req.user.communityCode || "VESIT26"
      }
    });
    broadcastUpdate("laundry:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to book slot" });
  }
});

router.delete("/laundry/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    await prisma.laundrySlot.delete({ where: { id } });
    broadcastUpdate("laundry:delete", { id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel slot" });
  }
});

// ==========================================
// 📦 Parcels Ledger
// ==========================================
router.get("/parcels", authenticateToken, async (req: any, res) => {
  try {
    const { role, portal, unit } = req.user;
    let list;
    if (role === "secretary" || role === "security" || role === "warden") {
      list = await prisma.parcel.findMany({ where: { portal } });
    } else {
      list = await prisma.parcel.findMany({ where: { portal, unit } });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parcels" });
  }
});

router.post("/parcels", authenticateToken, async (req: any, res) => {
  const { recipientName, recipientId, unit, carrier, courier, trackingNumber } = req.body;
  try {
    const id = `PRC-${Math.floor(100 + Math.random() * 900)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const newItem = await prisma.parcel.create({
      data: {
        id,
        recipientName,
        recipientId,
        unit,
        carrier: carrier || courier || "Amazon",
        trackingNumber,
        status: "received",
        otp,
        dateReceived: new Date().toISOString().split("T")[0],
        timeReceived: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        portal: req.user.portal,
        communityCode: req.user.communityCode || "SUN123"
      }
    });
    broadcastUpdate("parcel:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to log parcel" });
  }
});

router.put("/parcels/:id/release", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { otp } = req.body;
  try {
    const parcel = await prisma.parcel.findUnique({ where: { id } });
    if (!parcel) return res.status(404).json({ error: "Parcel not found" });

    // Validate OTP unless secretary overrides
    if (parcel.otp !== otp && req.user.role !== "secretary" && req.user.role !== "warden") {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const updated = await prisma.parcel.update({
      where: { id },
      data: {
        status: "released",
        dateReleased: new Date().toISOString().split("T")[0],
        timeReleased: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });
    broadcastUpdate("parcel:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to release parcel" });
  }
});

// ==========================================
// 🛌 Room Change Requests
// ==========================================
router.get("/roomchange", authenticateToken, async (req: any, res) => {
  try {
    const { role, id } = req.user;
    let list;
    if (role === "warden") {
      list = await prisma.roomChangeRequest.findMany();
    } else {
      list = await prisma.roomChangeRequest.findMany({ where: { studentId: id } });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch room change requests" });
  }
});

router.post("/roomchange", authenticateToken, async (req: any, res) => {
  const { preferredRoom, reason } = req.body;
  try {
    const id = `RCR-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.roomChangeRequest.create({
      data: {
        id,
        studentId: req.user.id,
        studentName: req.user.name || "Student",
        currentRoom: req.user.unit || "Room 101",
        preferredRoom,
        reason,
        status: "pending",
        communityCode: req.user.communityCode || "VESIT26"
      }
    });
    broadcastUpdate("roomchange:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit room change" });
  }
});

router.put("/roomchange/:id/status", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await prisma.roomChangeRequest.update({
      where: { id },
      data: { status }
    });
    broadcastUpdate("roomchange:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update room change" });
  }
});

// ==========================================
// 🧾 Maintenance Bills
// ==========================================
router.get("/maintenance", authenticateToken, async (req: any, res) => {
  try {
    const { role, unit } = req.user;
    let list;
    if (role === "secretary") {
      list = await prisma.maintenanceBill.findMany();
    } else {
      list = await prisma.maintenanceBill.findMany({ where: { unit } });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch maintenance bills" });
  }
});

router.post("/maintenance/generate", authenticateToken, async (req: any, res) => {
  const { residentId, residentName, unit, month, amount, dueDate } = req.body;
  try {
    const id = `BILL-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.maintenanceBill.create({
      data: {
        id,
        residentId,
        residentName,
        unit,
        month,
        amount: parseFloat(amount),
        dueDate,
        status: "pending"
      }
    });
    broadcastUpdate("maintenance:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate bill" });
  }
});

router.put("/maintenance/:id/pay", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.maintenanceBill.update({
      where: { id },
      data: {
        status: "paid",
        paidOn: new Date().toISOString().split("T")[0]
      }
    });
    broadcastUpdate("maintenance:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to pay bill" });
  }
});

// ==========================================
// 🛌 Rent Records
// ==========================================
router.get("/rent", authenticateToken, async (req: any, res) => {
  try {
    const { role, name } = req.user;
    let list;
    if (role === "warden" || role === "secretary") {
      list = await prisma.rentRecord.findMany();
    } else {
      list = await prisma.rentRecord.findMany({ where: { tenantName: name } });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rent bills" });
  }
});

router.post("/rent/generate", authenticateToken, async (req: any, res) => {
  const { unit, building, tenantName, tenantId, amount, dueDate } = req.body;
  try {
    const id = `RNT-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.rentRecord.create({
      data: {
        id,
        unit,
        building,
        tenantName,
        tenantId,
        amount: parseFloat(amount),
        dueDate,
        status: "pending"
      }
    });
    broadcastUpdate("rent:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate rent record" });
  }
});

router.put("/rent/:id/pay", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.rentRecord.update({
      where: { id },
      data: {
        status: "paid",
        paidOn: new Date().toISOString().split("T")[0]
      }
    });
    broadcastUpdate("rent:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to pay rent bill" });
  }
});

// ==========================================
// 📅 Community Events
// ==========================================
router.get("/events", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.communityEvent.findMany({
      include: { rsvps: true }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch community events" });
  }
});

router.post("/events", authenticateToken, async (req: any, res) => {
  const { title, description, date, time, location, organizer, priority } = req.body;
  try {
    const id = `EV-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.communityEvent.create({
      data: {
        id,
        title,
        description,
        date,
        time,
        location,
        organizer,
        priority: priority || "normal",
        communityCode: req.user.communityCode || "SUN123"
      },
      include: { rsvps: true }
    });
    broadcastUpdate("event:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  }
});

router.post("/events/:id/rsvp", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const existing = await prisma.eventRsvp.findFirst({
      where: { eventId: id, userId: req.user.id }
    });

    if (existing) {
      if (existing.status === status) {
        await prisma.eventRsvp.delete({ where: { id: existing.id } });
      } else {
        await prisma.eventRsvp.update({
          where: { id: existing.id },
          data: { status }
        });
      }
    } else {
      await prisma.eventRsvp.create({
        data: {
          eventId: id,
          userId: req.user.id,
          userName: req.user.name || "Resident",
          status
        }
      });
    }

    const updated = await prisma.communityEvent.findUnique({
      where: { id },
      include: { rsvps: true }
    });

    broadcastUpdate("event:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update RSVP" });
  }
});

// ==========================================
// 🔔 Notifications
// ==========================================
router.get("/notifications", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.post("/notifications", authenticateToken, async (req: any, res) => {
  const { userId, title, message, type } = req.body;
  try {
    const id = `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    const newItem = await prisma.notification.create({
      data: {
        id,
        userId,
        title,
        message,
        type: type || "info"
      }
    });
    broadcastUpdate("notification:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to create notification" });
  }
});

router.put("/notifications/read", authenticateToken, async (req: any, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

router.put("/notifications/:id/read", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notification read" });
  }
});

// ==========================================
// 🤝 Roommate Preferences
// ==========================================
router.get("/roommates", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.roommatePreference.findMany();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

router.post("/roommates", authenticateToken, async (req: any, res) => {
  const { sleepingHabits, studyHours, cleanliness, smoking, foodPreference, interests, roomPreference } = req.body;
  try {
    const record = await prisma.roommatePreference.upsert({
      where: { userId: req.user.id },
      update: {
        sleepingHabits,
        studyHours,
        cleanliness,
        smoking,
        foodPreference,
        interests: interests || [],
        roomPreference
      },
      create: {
        userId: req.user.id,
        userName: req.user.name || "Student",
        sleepingHabits,
        studyHours,
        cleanliness,
        smoking,
        foodPreference,
        interests: interests || [],
        roomPreference,
        communityCode: req.user.communityCode || "VESIT26"
      }
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: "Failed to save roommate preferences" });
  }
});

// ==========================================
// 🚨 Emergency Alerts
// ==========================================
router.get("/emergencies", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.emergencyAlert.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emergencies" });
  }
});

router.post("/emergencies", authenticateToken, async (req: any, res) => {
  const { type, emergencyType, unit } = req.body;
  try {
    const id = `EMG-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.emergencyAlert.create({
      data: {
        id,
        type: type || emergencyType || "Medical",
        reporterName: req.user.name || "User",
        reporterId: req.user.id,
        unit: unit || req.user.unit || "Common Area",
        status: "active",
        communityCode: req.user.communityCode || "SUN123"
      }
    });
    broadcastUpdate("emergency:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to trigger alert" });
  }
});

router.put("/emergencies/:id/resolve", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.emergencyAlert.update({
      where: { id },
      data: {
        status: "resolved",
        resolvedAt: new Date(),
        resolvedBy: req.user.name
      }
    });
    broadcastUpdate("emergency:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve alert" });
  }
});

// ==========================================
// 🎟️ Gate Passes
// ==========================================
router.get("/gatepasses", authenticateToken, async (req: any, res) => {
  try {
    const { role, unit } = req.user;
    let list;
    if (role === "secretary" || role === "security") {
      list = await prisma.gatePass.findMany();
    } else {
      list = await prisma.gatePass.findMany({ where: { unit } });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch gate passes" });
  }
});

router.post("/gatepasses", authenticateToken, async (req: any, res) => {
  const { visitorName, purpose, validOn, qrCodeData } = req.body;
  try {
    const id = `PASS-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.gatePass.create({
      data: {
        id,
        visitorName,
        purpose,
        validOn,
        qrCodeData: qrCodeData || `PASS-CODE-${id}`,
        status: "active",
        residentId: req.user.id,
        residentName: req.user.name || "Resident",
        unit: req.user.unit || "A-301",
        communityCode: req.user.communityCode || "SUN123"
      }
    });
    broadcastUpdate("gatepass:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate gate pass" });
  }
});

// ==========================================
// 🚗 Vehicle Logs
// ==========================================
router.get("/vehiclelogs", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.vehicleLog.findMany({
      orderBy: { entryTime: "desc" }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vehicle logs" });
  }
});

router.post("/vehiclelogs/entry", authenticateToken, async (req: any, res) => {
  const { vehicleNumber, ownerName, ownerUnit, type, gate } = req.body;
  try {
    const id = `VEH-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.vehicleLog.create({
      data: {
        id,
        vehicleNumber,
        ownerName,
        ownerUnit,
        type,
        gate: gate || "Gate 1",
        loggedBy: req.user.name || "Security",
        communityCode: req.user.communityCode || "SUN123"
      }
    });
    broadcastUpdate("vehiclelog:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to log entry" });
  }
});

router.put("/vehiclelogs/:id/exit", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.vehicleLog.update({
      where: { id },
      data: { exitTime: new Date() }
    });
    broadcastUpdate("vehiclelog:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to log exit" });
  }
});

// ==========================================
// ⚠️ Incident Reports
// ==========================================
router.get("/incidents", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.incidentReport.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

router.post("/incidents", authenticateToken, async (req: any, res) => {
  const { title, time, location, description, type } = req.body;
  try {
    const id = `INC-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.incidentReport.create({
      data: {
        id,
        title,
        time,
        location,
        description,
        type,
        status: "logged",
        reporter: req.user.name || "Staff"
      }
    });
    broadcastUpdate("incident:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to log incident" });
  }
});

router.put("/incidents/:id/resolve", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.incidentReport.update({
      where: { id },
      data: { status: "resolved" }
    });
    broadcastUpdate("incident:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve incident" });
  }
});

// ==========================================
// 🛠️ Marketplace Items
// ==========================================
router.get("/marketplace", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.marketplaceItem.findMany({
      where: { portal: req.user.portal },
      orderBy: { createdAt: "desc" }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch marketplace" });
  }
});

router.post("/marketplace", authenticateToken, async (req: any, res) => {
  const { title, description, price, category, images } = req.body;
  try {
    const id = `MKT-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.marketplaceItem.create({
      data: {
        id,
        title,
        description,
        price,
        sellerId: req.user.id,
        sellerName: req.user.name || "User",
        category,
        status: "available",
        portal: req.user.portal,
        images: images || []
      }
    });
    broadcastUpdate("marketplace:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to post marketplace item" });
  }
});

router.put("/marketplace/:id/status", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await prisma.marketplaceItem.update({
      where: { id },
      data: { status }
    });
    broadcastUpdate("marketplace:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update marketplace status" });
  }
});

// ==========================================
// 🧸 Lost & Found Items
// ==========================================
router.get("/lostfound", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.lostFoundItem.findMany({
      where: { portal: req.user.portal },
      orderBy: { createdAt: "desc" }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lost/found items" });
  }
});

router.post("/lostfound", authenticateToken, async (req: any, res) => {
  const { title, description } = req.body;
  try {
    const id = `LF-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.lostFoundItem.create({
      data: {
        id,
        title,
        description,
        status: "reported",
        reporterId: req.user.id,
        reporterName: req.user.name || "User",
        portal: req.user.portal
      }
    });
    broadcastUpdate("lostfound:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to report lost/found item" });
  }
});

router.put("/lostfound/:id/claim", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { claimantId, claimantName } = req.body;
  try {
    const updated = await prisma.lostFoundItem.update({
      where: { id },
      data: {
        status: "claimed",
        claimantId: claimantId || req.user.id,
        claimantName: claimantName || req.user.name || "Claimant"
      }
    });
    broadcastUpdate("lostfound:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to claim item" });
  }
});

// ==========================================
// 🏢 Flats Directory
// ==========================================
router.get("/flats", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.flatInfo.findMany();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch flats list" });
  }
});

router.put("/flats/:id/resident", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { residentId, residentName } = req.body;
  try {
    const updated = await prisma.flatInfo.update({
      where: { id },
      data: {
        status: residentId ? "occupied" : "vacant",
        residentId,
        residentName
      }
    });
    broadcastUpdate("flat:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update flat resident" });
  }
});

// ==========================================
// 💰 Society Expenses
// ==========================================
router.get("/expenses", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.societyExpense.findMany();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

router.post("/expenses", authenticateToken, async (req: any, res) => {
  const { category, vendor, amount, date, notes } = req.body;
  try {
    const id = `EXP-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = await prisma.societyExpense.create({
      data: {
        id,
        category,
        vendor,
        amount: parseFloat(amount),
        date,
        notes
      }
    });
    broadcastUpdate("expense:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to add expense" });
  }
});

// ==========================================
// 👥 Users Directory
// ==========================================
router.get("/users", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.user.findMany({
      where: { portal: req.user.portal }
    });
    // Strip passwords before sending
    const stripped = list.map(u => {
      const copy = { ...u };
      // @ts-ignore
      delete copy.password;
      return copy;
    });
    res.json(stripped);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users list" });
  }
});

router.put("/users/services", authenticateToken, async (req: any, res) => {
  const { specializations, availability } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        specializations: specializations || [],
        availability: availability || "Available"
      }
    });
    const copy = { ...updated };
    // @ts-ignore
    delete copy.password;
    broadcastUpdate("user:update", copy);
    res.json(copy);
  } catch (error) {
    res.status(500).json({ error: "Failed to update service profile" });
  }
});

router.put("/users/:id/status", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status, unit, building } = req.body;
  try {
    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (unit !== undefined) dataToUpdate.unit = unit;
    if (building !== undefined) dataToUpdate.building = building;

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate
    });
    const copy = { ...updated };
    // @ts-ignore
    delete copy.password;
    broadcastUpdate("user:update", copy);
    res.json(copy);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user status" });
  }
});

router.post("/flats", authenticateToken, async (req: any, res) => {
  const { building, wing, floor, flatNumber } = req.body;
  try {
    const id = `FL-${wing}${flatNumber}`;
    const newFlat = await prisma.flatInfo.create({
      data: {
        id,
        building,
        wing,
        floor: parseInt(floor),
        flatNumber,
        status: "vacant"
      }
    });
    broadcastUpdate("flat:update", newFlat);
    res.status(201).json(newFlat);
  } catch (error) {
    res.status(500).json({ error: "Failed to create flat" });
  }
});

// Facility Bookings
router.get("/facility-bookings", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.facilityBooking.findMany();
    const mapped = list.map(b => ({
      id: b.id,
      facility: b.facilityName,
      userId: b.residentId,
      userName: b.residentName,
      unit: "A-204", // default fallback flat
      date: b.date,
      slot: b.timeSlot,
      status: b.status as any
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch facility bookings" });
  }
});

router.post("/facility-bookings", authenticateToken, async (req: any, res) => {
  const { facility, date, slot } = req.body;
  try {
    const id = `FBK-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    const newBooking = await prisma.facilityBooking.create({
      data: {
        id,
        facilityName: facility,
        residentName: req.user.name || "Resident",
        residentId: req.user.id,
        date,
        timeSlot: slot,
        purpose: "General booking",
        status: "booked",
        communityCode: req.user.communityCode || "SUN123"
      }
    });

    const mappedBooking = {
      id: newBooking.id,
      facility: newBooking.facilityName,
      userId: newBooking.residentId,
      userName: newBooking.residentName,
      unit: req.user.unit || "A-204",
      date: newBooking.date,
      slot: newBooking.timeSlot,
      status: "booked" as const
    };

    broadcastUpdate("booking:update", mappedBooking);
    res.status(201).json(mappedBooking);
  } catch (error) {
    res.status(500).json({ error: "Failed to book facility" });
  }
});

router.delete("/facility-bookings/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    await prisma.facilityBooking.delete({ where: { id } });
    broadcastUpdate("booking:delete", { id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

router.delete("/marketplace/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    await prisma.marketplaceItem.delete({ where: { id } });
    broadcastUpdate("marketplace:delete", { id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete marketplace item" });
  }
});

export default router;
