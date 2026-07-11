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
router.post("/helpers/checkin", authenticateToken, async (req: any, res) => {
  const { helperId, helperName, category, gate, assignedFlats } = req.body;

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
        entryGate: gate || "Main Gate"
      }
    });

    broadcastUpdate("attendance:update", checkIn);
    res.status(201).json(checkIn);
  } catch (error) {
    res.status(500).json({ error: "Failed helper checkin" });
  }
});

router.post("/helpers/checkout", authenticateToken, async (req, res) => {
  const { attendanceId, gate } = req.body;

  try {
    const checkOut = await prisma.helperAttendance.update({
      where: { id: attendanceId },
      data: {
        checkOutTime: new Date(),
        exitGate: gate || "Main Gate"
      }
    });

    broadcastUpdate("attendance:update", checkOut);
    res.json(checkOut);
  } catch (error) {
    res.status(500).json({ error: "Failed helper checkout" });
  }
});

router.get("/attendance", authenticateToken, async (req: any, res) => {
  try {
    const { role, unit } = req.user;
    let attendance;

    if (role === "secretary" || role === "security") {
      attendance = await prisma.helperAttendance.findMany();
    } else {
      attendance = await prisma.helperAttendance.findMany({
        where: { assignedFlats: { has: unit } }
      });
    }
    res.json(attendance);
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
