import { Router } from "express";
import prisma from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { broadcastUpdate } from "../socket/index.js";

const router = Router();

// GET visitors
router.get("/", authenticateToken, async (req: any, res) => {
  try {
    const { role, portal, unit } = req.user;
    let visitors;

    if (portal === "hostel") {
      if (role === "warden") {
        visitors = await prisma.visitor.findMany({ where: { portal: "hostel" } });
      } else {
        visitors = await prisma.visitor.findMany({ where: { portal: "hostel", visitingUnit: unit } });
      }
    } else {
      if (role === "secretary" || role === "security") {
        visitors = await prisma.visitor.findMany({ where: { portal: "society" } });
      } else {
        visitors = await prisma.visitor.findMany({ where: { portal: "society", visitingUnit: unit } });
      }
    }
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
});

// POST visitor request
router.post("/", authenticateToken, async (req: any, res) => {
  const { name, phone, purpose, visitingUnit, visitingResident, expectedAt, date, vehicleNumber } = req.body;

  if (!name || !phone || !purpose) {
    return res.status(400).json({ error: "Visitor name, phone, and purpose are required" });
  }

  try {
    const visitorId = `VIS-${Math.floor(100 + Math.random() * 900)}`;
    const newVisitor = await prisma.visitor.create({
      data: {
        id: visitorId,
        name,
        phone,
        purpose,
        visitingUnit: visitingUnit || req.user.unit || "A-204",
        visitingResident: visitingResident || req.user.name || "Sara Shah",
        visitingResidentId: req.user.id,
        status: "expected",
        expectedAt: expectedAt || new Date().toISOString(),
        date: date || new Date().toISOString().split("T")[0],
        portal: req.user.portal,
        vehicleNumber
      }
    });

    broadcastUpdate("visitor:update", newVisitor);
    res.status(201).json(newVisitor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log visitor" });
  }
});

// PUT visitor status
router.put("/:id/status", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status, checkInTime, checkOutTime, approvedBy } = req.body;

  try {
    const updated = await prisma.visitor.update({
      where: { id },
      data: {
        status,
        checkInTime,
        checkOutTime,
        approvedBy: approvedBy || req.user.name
      }
    });

    broadcastUpdate("visitor:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update visitor status" });
  }
});

// Helpers endpoints
router.get("/helpers", authenticateToken, async (req: any, res) => {
  try {
    const { id: userId, role, name, unit } = req.user;
    const { available } = req.query;

    if (available === "true") {
      // Return all registered approved workers
      const workers = await prisma.user.findMany({
        where: { role: "worker", status: "approved" }
      });
      return res.json(workers);
    }

    if (role === "worker") {
      // Find all assignments for this worker
      const assignments = await prisma.residentWorkerAssignment.findMany({
        where: { workerId: userId },
        include: { resident: true, worker: true }
      });

      if (assignments.length === 0) {
        // Return empty or worker profile as a fallback
        const workerProfile = await prisma.user.findUnique({ where: { id: userId } });
        if (!workerProfile) return res.json([]);
        return res.json([{
          id: workerProfile.id,
          name: workerProfile.name,
          phone: workerProfile.phone,
          category: workerProfile.workerCategory || "Maid",
          expectedArrival: "08:30 AM",
          expectedExit: "11:30 AM",
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          assignedFlats: [],
          assignedResidents: [],
          residentIds: [],
          portal: "society"
        }]);
      }

      // Format as helper profile containing all assigned flats/residents
      const first = assignments[0];
      const helper = {
        id: userId,
        name: first.worker.name,
        phone: first.worker.phone,
        category: first.worker.workerCategory || "Maid",
        expectedArrival: first.arrivalTime,
        expectedExit: first.exitTime,
        workingDays: first.workingDays,
        assignedFlats: assignments.map(a => a.resident.unit || "A-204"),
        assignedResidents: assignments.map(a => a.resident.name),
        residentIds: assignments.map(a => a.resident.id),
        portal: "society"
      };

      return res.json([helper]);
    }

    if (role === "resident") {
      const assignments = await prisma.residentWorkerAssignment.findMany({
        where: { residentId: userId },
        include: { worker: true, resident: true }
      });

      const formatted = assignments.map(a => ({
        id: a.worker.id,
        name: a.worker.name,
        phone: a.worker.phone,
        category: a.services.join(" + ") || a.worker.workerCategory || "Maid",
        expectedArrival: a.arrivalTime,
        expectedExit: a.exitTime,
        workingDays: a.workingDays,
        assignedFlats: [a.resident.unit || "A-204"],
        assignedResidents: [a.resident.name],
        residentIds: [a.resident.id],
        joinedAt: a.createdAt.toISOString(),
        portal: "society"
      }));

      return res.json(formatted);
    }

    // For secretary/security/others, return all helper assignments
    const allAssignments = await prisma.residentWorkerAssignment.findMany({
      include: { worker: true, resident: true }
    });

    const formattedAll = allAssignments.map(a => ({
      id: a.worker.id,
      name: a.worker.name,
      phone: a.worker.phone,
      category: a.services.join(" + ") || a.worker.workerCategory || "Maid",
      expectedArrival: a.arrivalTime,
      expectedExit: a.exitTime,
      workingDays: a.workingDays,
      assignedFlats: [a.resident.unit || "A-204"],
      assignedResidents: [a.resident.name],
      residentIds: [a.resident.id],
      joinedAt: a.createdAt.toISOString(),
      portal: "society"
    }));

    res.json(formattedAll);
  } catch (error) {
    console.error("Error fetching helpers:", error);
    res.status(500).json({ error: "Failed to fetch helpers" });
  }
});

router.post("/helpers", authenticateToken, async (req: any, res) => {
  const { workerId, expectedArrivalTime, expectedExitTime, workingDays, services, category, name, phone } = req.body;

  try {
    const residentId = req.user.id;
    const residentRecord = await prisma.user.findUnique({ where: { id: residentId } });
    if (!residentRecord) return res.status(404).json({ error: "Resident not found" });

    // Handle registered worker assignment
    const targetWorkerId = workerId || `user-worker-8`; // Fallback to Sunita Patil
    const workerRecord = await prisma.user.findUnique({ where: { id: targetWorkerId } });
    if (!workerRecord) return res.status(404).json({ error: "Worker not found" });

    // Check if assignment already exists
    const existing = await prisma.residentWorkerAssignment.findFirst({
      where: { residentId, workerId: targetWorkerId }
    });

    let assignment;
    if (existing) {
      assignment = await prisma.residentWorkerAssignment.update({
        where: { id: existing.id },
        data: {
          workingDays: workingDays || existing.workingDays,
          arrivalTime: expectedArrivalTime || existing.arrivalTime,
          exitTime: expectedExitTime || existing.exitTime,
          services: services || existing.services
        }
      });
    } else {
      assignment = await prisma.residentWorkerAssignment.create({
        data: {
          residentId,
          workerId: targetWorkerId,
          workingDays: workingDays || ["Monday", "Wednesday", "Friday"],
          arrivalTime: expectedArrivalTime || "08:30 AM",
          exitTime: expectedExitTime || "11:30 AM",
          services: services || [category || workerRecord.workerCategory || "Maid"]
        }
      });
    }

    const formattedHelper = {
      id: workerRecord.id,
      name: workerRecord.name,
      phone: workerRecord.phone,
      category: services?.join(" + ") || category || workerRecord.workerCategory || "Maid",
      expectedArrival: expectedArrivalTime || "08:30 AM",
      expectedExit: expectedExitTime || "11:30 AM",
      workingDays: workingDays || ["Monday", "Wednesday", "Friday"],
      assignedFlats: [residentRecord.unit || "A-204"],
      assignedResidents: [residentRecord.name],
      residentIds: [residentRecord.id],
      joinedAt: assignment.createdAt.toISOString(),
      portal: "society"
    };

    broadcastUpdate("helper:update", formattedHelper);
    res.status(201).json(formattedHelper);
  } catch (error) {
    console.error("Failed to assign helper:", error);
    res.status(500).json({ error: "Failed to assign helper" });
  }
});

router.delete("/helpers/:id", authenticateToken, async (req: any, res) => {
  const { id: workerId } = req.params;
  const residentId = req.user.id;

  try {
    await prisma.residentWorkerAssignment.deleteMany({
      where: { residentId, workerId }
    });

    broadcastUpdate("helper:delete", { id: workerId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove helper assignment" });
  }
});

// Helper Attendance (Check-in/Check-out)
async function sendInAppNotification(userId: string, title: string, message: string, type: string) {
  try {
    const id = `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    const newNotif = await prisma.notification.create({
      data: {
        id,
        userId,
        title,
        message,
        type: type || "info",
        read: false
      }
    });
    broadcastUpdate("notification:update", newNotif);
  } catch (e) {
    console.error("Failed to send in-app notification:", e);
  }
}

router.post("/helpers/checkin", authenticateToken, async (req: any, res) => {
  const { helperId, helperName, category, gate, assignedFlats } = req.body;

  if (!helperId || !helperName || !category) {
    return res.status(400).json({ error: "Helper ID, helper name, and category are required" });
  }

  try {
    const attendanceId = `ATT-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    const dateStr = new Date().toISOString().split("T")[0];

    const checkIn = await prisma.helperAttendance.create({
      data: {
        id: attendanceId,
        helperId,
        helperName,
        category,
        checkInTime: new Date(),
        date: dateStr,
        assignedFlats: assignedFlats || [],
        entryGate: gate || "Main Gate",
        status: "checked-in"
      }
    });

    const mapped = {
      ...checkIn,
      workerId: checkIn.helperId,
      workerName: checkIn.helperName,
      workerCategory: checkIn.category
    };

    broadcastUpdate("attendance:update", mapped);

    // Send notifications
    const assignments = await prisma.residentWorkerAssignment.findMany({
      where: { workerId: helperId }
    });
    for (const a of assignments) {
      await sendInAppNotification(a.residentId, "Helper Entered Society", `✅ ${helperName} has entered the society.`, "success");
    }

    await sendInAppNotification(helperId, "Society Check-In Successful", "✅ Society check-in successful.", "success");

    const securityUsers = await prisma.user.findMany({ where: { role: "security" } });
    for (const sec of securityUsers) {
      await sendInAppNotification(sec.id, "Worker Entered", `Worker ${helperName} entered society.`, "info");
    }

    const secretaryUsers = await prisma.user.findMany({ where: { role: "secretary" } });
    for (const sec of secretaryUsers) {
      await sendInAppNotification(sec.id, "Daily Attendance Updated", "Daily attendance updated.", "info");
    }

    res.status(201).json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Failed helper checkin" });
  }
});

router.post("/helpers/checkout", authenticateToken, async (req: any, res) => {
  const { attendanceId, gate } = req.body;

  if (!attendanceId) {
    return res.status(400).json({ error: "Attendance ID is required" });
  }

  try {
    const record = await prisma.helperAttendance.findUnique({
      where: { id: attendanceId }
    });

    if (!record) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    const now = new Date();
    const checkInTime = record.checkInTime ? new Date(record.checkInTime) : now;
    const duration = Math.max(1, Math.round((now.getTime() - checkInTime.getTime()) / (60 * 1000)));

    const checkOut = await prisma.helperAttendance.update({
      where: { id: attendanceId },
      data: {
        checkOutTime: now,
        exitGate: gate || "Main Gate",
        status: "checked-out",
        duration
      }
    });

    const mapped = {
      ...checkOut,
      workerId: checkOut.helperId,
      workerName: checkOut.helperName,
      workerCategory: checkOut.category
    };

    broadcastUpdate("attendance:update", mapped);

    // Send notifications
    const assignments = await prisma.residentWorkerAssignment.findMany({
      where: { workerId: record.helperId }
    });
    for (const a of assignments) {
      await sendInAppNotification(a.residentId, "Helper Exited Society", `🚪 ${record.helperName} has exited the society.`, "info");
    }

    await sendInAppNotification(record.helperId, "Society Check-Out Successful", "🚪 Society check-out successful.", "success");

    const securityUsers = await prisma.user.findMany({ where: { role: "security" } });
    for (const sec of securityUsers) {
      await sendInAppNotification(sec.id, "Worker Exited", `Worker ${record.helperName} exited society.`, "info");
    }

    const secretaryUsers = await prisma.user.findMany({ where: { role: "secretary" } });
    for (const sec of secretaryUsers) {
      await sendInAppNotification(sec.id, "Worker Attendance Completed", "Worker attendance completed.", "info");
    }

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Failed helper checkout" });
  }
});

// Flat Check-In / Check-Out
router.post("/helpers/flat-checkin", authenticateToken, async (req: any, res) => {
  const { helperId, flatNumber, residentId, residentName, servicePerformed } = req.body;

  if (!helperId || !flatNumber || !residentId || !residentName) {
    return res.status(400).json({ error: "Helper ID, flat number, resident ID, and resident name are required" });
  }

  try {
    const worker = await prisma.user.findUnique({
      where: { id: helperId }
    });

    const flatAtt = await prisma.flatAttendance.create({
      data: {
        helperId,
        helperName: worker?.name || "Helper",
        date: new Date().toISOString().split("T")[0],
        residentId,
        residentName,
        flatNumber,
        checkInTime: new Date(),
        servicePerformed: servicePerformed || "Service",
        status: "working"
      }
    });

    broadcastUpdate("flat-attendance:update", flatAtt);

    // Send notifications
    await sendInAppNotification(residentId, "Helper Arrived at Flat", `🏠 ${worker?.name || "Helper"} has arrived at your flat.`, "success");
    await sendInAppNotification(helperId, "Flat Check-In Successful", "🏠 Flat check-in successful.", "success");

    res.status(201).json(flatAtt);
  } catch (error) {
    res.status(500).json({ error: "Failed flat checkin" });
  }
});

router.post("/helpers/flat-checkout", authenticateToken, async (req: any, res) => {
  const { flatAttendanceId } = req.body;

  if (!flatAttendanceId) {
    return res.status(400).json({ error: "Flat attendance ID is required" });
  }

  try {
    const record = await prisma.flatAttendance.findUnique({
      where: { id: flatAttendanceId }
    });

    if (!record) {
      return res.status(404).json({ error: "Flat attendance record not found" });
    }

    const now = new Date();
    const checkInTime = new Date(record.checkInTime);
    const duration = Math.max(1, Math.round((now.getTime() - checkInTime.getTime()) / (60 * 1000)));

    const updated = await prisma.flatAttendance.update({
      where: { id: flatAttendanceId },
      data: {
        checkOutTime: now,
        duration,
        status: "completed"
      }
    });

    broadcastUpdate("flat-attendance:update", updated);

    // Send notifications
    await sendInAppNotification(record.residentId, "Work Completed", `✔ ${record.helperName} has completed today's work.`, "success");
    await sendInAppNotification(record.helperId, "Flat Work Completed", "✔ Flat work completed.", "success");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed flat checkout" });
  }
});

router.post("/helpers/flat-complete", authenticateToken, async (req: any, res) => {
  const { helperId, flatNumber, residentId, residentName, servicePerformed, notes, photoUrl } = req.body;

  if (!helperId || !flatNumber || !residentId || !residentName) {
    return res.status(400).json({ error: "Helper ID, flat number, resident ID, and resident name are required" });
  }

  try {
    const dateStr = new Date().toISOString().split("T")[0];
    const helperProfile = await prisma.user.findUnique({ where: { id: helperId } });
    const helperName = helperProfile?.name || "Helper";

    const todayLog = await prisma.helperAttendance.findFirst({
      where: { helperId, date: dateStr }
    });
    const checkInTime = todayLog?.checkInTime ? new Date(todayLog.checkInTime) : new Date();
    const duration = Math.max(1, Math.round((new Date().getTime() - checkInTime.getTime()) / (60 * 1000)));

    const flatAtt = await prisma.flatAttendance.create({
      data: {
        helperId,
        helperName,
        date: dateStr,
        residentId,
        residentName,
        flatNumber,
        checkInTime,
        checkOutTime: new Date(),
        duration,
        servicePerformed: servicePerformed || "Service",
        status: "completed",
        notes: notes || null,
        photoUrl: photoUrl || null
      }
    });

    broadcastUpdate("flat-attendance:update", flatAtt);

    // Send notifications
    await sendInAppNotification(residentId, "Work Completed", `✔ ${helperName} completed today's work.`, "success");
    await sendInAppNotification(helperId, "Flat Work Completed", "✔ Flat work completed.", "success");

    const secretaryUsers = await prisma.user.findMany({ where: { role: "secretary" } });
    for (const sec of secretaryUsers) {
      await sendInAppNotification(sec.id, "Worker Assignment Completed", `Worker ${helperName} completed work in Flat ${flatNumber}.`, "info");
    }

    res.status(201).json(flatAtt);
  } catch (error) {
    console.error("Flat complete error:", error);
    res.status(500).json({ error: "Failed to record work completion" });
  }
});

router.get("/helpers/flat-attendance", authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.flatAttendance.findMany({
      orderBy: { checkInTime: "asc" }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch flat attendance" });
  }
});

router.get("/attendance", authenticateToken, async (req: any, res) => {
  try {
    const { role, unit, id: userId } = req.user;
    let attendance;

    if (role === "secretary" || role === "security") {
      attendance = await prisma.helperAttendance.findMany();
    } else if (role === "worker") {
      attendance = await prisma.helperAttendance.findMany({
        where: { helperId: userId }
      });
    } else {
      attendance = await prisma.helperAttendance.findMany({
        where: { assignedFlats: { has: unit || "" } }
      });
    }

    const normalized = attendance.map((att: any) => ({
      ...att,
      workerId: att.helperId,
      workerName: att.helperName,
      workerCategory: att.category
    }));

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch helper attendance" });
  }
});

// Favorites
router.get("/favorites", authenticateToken, async (req: any, res) => {
  try {
    const { role, unit } = req.user;
    let favorites;

    if (role === "secretary") {
      favorites = await prisma.favoriteVisitor.findMany();
    } else {
      favorites = await prisma.favoriteVisitor.findMany({ where: { visitingUnit: unit } });
    }
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

router.post("/favorites", authenticateToken, async (req: any, res) => {
  const { name, phone, category } = req.body;

  if (!name || !phone || !category) {
    return res.status(400).json({ error: "Name, phone, and category are required" });
  }

  try {
    const id = `FAV-${Math.floor(100 + Math.random() * 900)}`;
    const newFav = await prisma.favoriteVisitor.create({
      data: {
        id,
        name,
        phone,
        category,
        residentId: req.user.id,
        visitingUnit: req.user.unit || "A-301"
      }
    });

    broadcastUpdate("favorite:update", newFav);
    res.status(201).json(newFav);
  } catch (error) {
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

router.delete("/favorites/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.favoriteVisitor.delete({ where: { id: id as string } });
    broadcastUpdate("favorite:delete", { id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

export default router;
