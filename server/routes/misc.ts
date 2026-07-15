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
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
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
  if (!reason || !fromDate || !toDate) {
    return res.status(400).json({ error: "Reason, fromDate, and toDate are required" });
  }
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
  if (!machineId || !machineName || !date || !timeSlot) {
    return res.status(400).json({ error: "Machine details, date, and timeSlot are required" });
  }
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
  if (!recipientName || !unit) {
    return res.status(400).json({ error: "Recipient name and unit are required" });
  }
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
  if (!preferredRoom || !reason) {
    return res.status(400).json({ error: "Preferred room and reason are required" });
  }
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
  const { residentId, residentName, unit, month, amount, dueDate, breakdown, lateFee, description, applicableTo, selectedBuilding } = req.body;

  try {
    // If no residentId is provided, perform bulk generation for all approved residents
    if (!residentId) {
      const filter: any = { role: "resident", status: "approved" };
      if (applicableTo === "Selected Building" && selectedBuilding) {
        filter.building = selectedBuilding;
      }

      const residents = await prisma.user.findMany({
        where: filter
      });

      const generatedBills = [];
      const billMonth = month || "July 2026";
      const billAmount = parseFloat(amount) || 3500;
      const billDueDate = dueDate || "15 August";
      const billLateFee = lateFee ? parseFloat(lateFee) : null;
      const billDesc = description || "Monthly Maintenance Charges";

      for (const r of residents) {
        const id = `BILL-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        
        // 1. Create MaintenanceBill
        const bill = await prisma.maintenanceBill.create({
          data: {
            id,
            residentId: r.id,
            residentName: r.name,
            unit: r.unit || "",
            month: billMonth,
            amount: billAmount,
            dueDate: billDueDate,
            status: "pending",
            description: billDesc,
            lateFee: billLateFee
          }
        });

        // 2. Also create a ResidentPayment record to track this transaction
        const paymentId = `PAY-BILL-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        await prisma.residentPayment.create({
          data: {
            id: paymentId,
            residentId: r.id,
            residentName: r.name,
            unit: r.unit || "",
            building: r.building || "",
            societyId: req.user.communityCode || "SUN123",
            paymentType: "Maintenance",
            amount: billAmount,
            status: "pending",
            dueDate: billDueDate,
            referenceId: id,
            description: billDesc,
            lateFee: billLateFee
          }
        });

        // 3. Send in-app notification: Maintenance bill generated.
        await sendInAppNotification(r.id, "Maintenance Bill Generated 🧾", `📢 ${billMonth} maintenance bill has been generated. Due date: ${billDueDate}`, "warning");

        generatedBills.push(bill);
        broadcastUpdate("maintenance:update", bill);
      }

      return res.status(201).json({ success: true, count: generatedBills.length });
    }

    // Otherwise, generate a single maintenance bill
    const id = `BILL-${Math.floor(100 + Math.random() * 900)}`;
    const billLateFee = lateFee ? parseFloat(lateFee) : null;
    const billDesc = description || "Monthly Maintenance Charges";

    const bill = await prisma.maintenanceBill.create({
      data: {
        id,
        residentId,
        residentName,
        unit,
        month,
        amount: parseFloat(amount),
        dueDate,
        status: "pending",
        description: billDesc,
        lateFee: billLateFee
      }
    });

    // Also create a ResidentPayment record for this single bill
    const paymentId = `PAY-BILL-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    await prisma.residentPayment.create({
      data: {
        id: paymentId,
        residentId,
        residentName,
        unit,
        building: req.user.building || "",
        societyId: req.user.communityCode || "SUN123",
        paymentType: "Maintenance",
        amount: parseFloat(amount),
        status: "pending",
        dueDate,
        referenceId: id,
        description: billDesc,
        lateFee: billLateFee
      }
    });

    // Send notification
    await sendInAppNotification(residentId, "Maintenance Bill Generated 🧾", `📢 ${month} maintenance bill has been generated. Due date: ${dueDate}`, "warning");

    broadcastUpdate("maintenance:update", bill);
    res.status(201).json(bill);
  } catch (error) {
    console.error("Failed to generate maintenance bills:", error);
    res.status(500).json({ error: "Failed to generate bills" });
  }
});

router.put("/maintenance/:id/pay", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.maintenanceBill.update({
      where: { id },
      data: {
        status: "paid",
        paidOn: new Date().toLocaleDateString('en-CA')
      }
    });

    // Sync with corresponding ResidentPayment if exists
    await prisma.residentPayment.updateMany({
      where: { referenceId: id, paymentType: "Maintenance" },
      data: {
        status: "Paid",
        paidDate: new Date().toLocaleDateString('en-CA'),
        transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentMethod: "Card"
      }
    });

    broadcastUpdate("maintenance:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to pay bill" });
  }
});

// ==========================================
// 💳 Resident Payments & Society Collections
// ==========================================

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

// 1. GET /payments - Fetch all payment transaction records
router.get("/payments", authenticateToken, async (req: any, res) => {
  try {
    const { role, id: userId, unit } = req.user;
    let list;
    if (role === "secretary") {
      list = await prisma.residentPayment.findMany({
        orderBy: { createdAt: "desc" }
      });
    } else {
      list = await prisma.residentPayment.findMany({
        where: { residentId: userId },
        orderBy: { createdAt: "desc" }
      });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// 2. GET /payments/collections - Fetch all society collections
router.get("/payments/collections", authenticateToken, async (req: any, res) => {
  try {
    const { role, unit, building } = req.user;
    let list;
    if (role === "secretary") {
      list = await prisma.societyCollection.findMany({
        orderBy: { createdAt: "desc" }
      });
    } else {
      const allCollections = await prisma.societyCollection.findMany({
        where: { status: "active" },
        orderBy: { createdAt: "desc" }
      });
      list = allCollections.filter(c => {
        if (c.visibility === "Everyone") return true;
        if (c.applicableBuildings.length > 0 && building && c.applicableBuildings.includes(building)) {
          return true;
        }
        if (c.applicableFlats.length > 0 && unit && c.applicableFlats.includes(unit)) {
          return true;
        }
        return false;
      });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

// 3. POST /payments/collections - Create new special collection
router.post("/payments/collections", authenticateToken, async (req: any, res) => {
  const { title, description, amount, type, dueDate, applicableBuildings, applicableFlats, visibility } = req.body;
  if (!title || !amount || !type || !dueDate) {
    return res.status(400).json({ error: "Title, amount, type, and dueDate are required" });
  }
  try {
    const id = `COLL-${Math.floor(100 + Math.random() * 900)}`;
    const collection = await prisma.societyCollection.create({
      data: {
        id,
        title,
        description: description || "",
        amount: parseFloat(amount),
        type,
        dueDate,
        applicableBuildings: applicableBuildings || [],
        applicableFlats: applicableFlats || [],
        visibility: visibility || "Everyone",
        communityCode: req.user.communityCode || "SUN123"
      }
    });

    // Generate pending payments for applicable residents
    const residents = await prisma.user.findMany({
      where: { role: "resident", status: "approved" }
    });

    const applicableResidents = residents.filter(r => {
      if (visibility === "Everyone") return true;
      if (applicableBuildings && applicableBuildings.length > 0 && r.building && applicableBuildings.includes(r.building)) {
        return true;
      }
      if (applicableFlats && applicableFlats.length > 0 && r.unit && applicableFlats.includes(r.unit)) {
        return true;
      }
      return false;
    });

    for (const r of applicableResidents) {
      const paymentId = `PAY-COLL-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
      await prisma.residentPayment.create({
        data: {
          id: paymentId,
          residentId: r.id,
          residentName: r.name,
          unit: r.unit || "",
          building: r.building || "",
          societyId: req.user.communityCode || "SUN123",
          paymentType: title,
          amount: parseFloat(amount),
          status: "pending",
          dueDate,
          referenceId: id
        }
      });

      // Send in-app notification: Ganesh Festival contribution announced.
      await sendInAppNotification(r.id, "New Collection Announced", `${title} announced.`, "info");
    }

    broadcastUpdate("collection:update", collection);
    res.status(201).json(collection);
  } catch (error) {
    console.error("Failed to create collection:", error);
    res.status(500).json({ error: "Failed to create collection" });
  }
});

// 4. PUT /payments/collections/:id - Edit special collection
router.put("/payments/collections/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { title, description, amount, dueDate } = req.body;
  try {
    const updated = await prisma.societyCollection.update({
      where: { id },
      data: {
        title,
        description,
        amount: amount ? parseFloat(amount) : undefined,
        dueDate
      }
    });

    // Update pending payments for this collection
    await prisma.residentPayment.updateMany({
      where: { referenceId: id, status: "pending" },
      data: {
        paymentType: title || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        dueDate: dueDate || undefined
      }
    });

    broadcastUpdate("collection:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update collection" });
  }
});

// 5. DELETE /payments/collections/:id - Cancel special collection
router.delete("/payments/collections/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const cancelled = await prisma.societyCollection.update({
      where: { id },
      data: { status: "cancelled" }
    });

    // Delete or cancel pending payments for this collection
    await prisma.residentPayment.updateMany({
      where: { referenceId: id, status: "pending" },
      data: { status: "cancelled" }
    });

    broadcastUpdate("collection:update", cancelled);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel collection" });
  }
});

// 6. PUT /payments/:id/pay - Process payment
router.put("/payments/:id/pay", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body;
  try {
    const payment = await prisma.residentPayment.findUnique({
      where: { id }
    });
    if (!payment) return res.status(404).json({ error: "Payment request not found" });

    const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowStr = new Date().toLocaleDateString('en-CA');

    const updatedPayment = await prisma.residentPayment.update({
      where: { id },
      data: {
        status: "Paid",
        paidDate: nowStr,
        transactionId: txnId,
        paymentMethod: paymentMethod || "Card",
        receiptPath: `/receipts/${id}.pdf`
      }
    });

    // If it is linked to a MaintenanceBill, mark it paid too
    if (payment.paymentType === "Maintenance" && payment.referenceId) {
      await prisma.maintenanceBill.update({
        where: { id: payment.referenceId },
        data: {
          status: "paid",
          paidOn: nowStr
        }
      });
    }

    // Send notifications
    await sendInAppNotification(payment.residentId, "Payment Successful ✅", `${payment.paymentType} payment successful. Receipt generated. Thank you.`, "success");
    await sendInAppNotification(payment.residentId, "Receipt Ready 📄", "📄 Receipt is ready to download.", "success");

    const secretaryUsers = await prisma.user.findMany({ where: { role: "secretary" } });
    for (const sec of secretaryUsers) {
      await sendInAppNotification(sec.id, "Resident Payment Received ✅", `✅ ${payment.residentName} (${payment.building || ""} Flat ${payment.unit}) paid ${payment.paymentType}.`, "success");
      await sendInAppNotification(sec.id, "Collection Progress Updated 📊", `📊 Collection progress updated for ${payment.paymentType}.`, "info");
    }

    // Check if collection target reached
    if (payment.referenceId && payment.paymentType !== "Maintenance") {
      const collection = await prisma.societyCollection.findUnique({
        where: { id: payment.referenceId }
      });
      if (collection) {
        const allPayments = await prisma.residentPayment.findMany({
          where: { referenceId: collection.id }
        });
        const totalCollected = allPayments
          .filter(p => p.status === "Paid")
          .reduce((sum, p) => sum + p.amount, 0);

        const expectedAmount = collection.amount * allPayments.length;
        if (totalCollected >= expectedAmount && expectedAmount > 0) {
          for (const sec of secretaryUsers) {
            await sendInAppNotification(sec.id, "Target Reached", "Collection target reached.", "success");
          }
        }
      }
    }

    broadcastUpdate("payment:update", updatedPayment);
    res.json(updatedPayment);
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

// 7. POST /payments/:id/remind - Send payment reminder
router.post("/payments/:id/remind", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const payment = await prisma.residentPayment.findUnique({
      where: { id }
    });
    if (!payment) return res.status(404).json({ error: "Payment request not found" });

    // Send reminder notification
    // Example: "Ganesh Festival contribution closes tomorrow." or "Maintenance payment due in 3 days."
    let msg = `${payment.paymentType} payment due in 3 days.`;
    if (payment.paymentType !== "Maintenance") {
      msg = `${payment.paymentType} contribution closes tomorrow.`;
    }

    await sendInAppNotification(payment.residentId, "Payment Reminder", msg, "warning");

    const secretaryUsers = await prisma.user.findMany({ where: { role: "secretary" } });
    for (const sec of secretaryUsers) {
      await sendInAppNotification(sec.id, "Reminder Sent", "Payment overdue reminder sent.", "info");
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to send reminder" });
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
  if (!unit || !building || !tenantName || !amount || !dueDate) {
    return res.status(400).json({ error: "All rent details (unit, building, tenantName, amount, dueDate) are required" });
  }
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
  if (!title || !description || !date || !time || !location || !organizer) {
    return res.status(400).json({ error: "All event details (title, description, date, time, location, organizer) are required" });
  }
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
  if (!userId || !title || !message) {
    return res.status(400).json({ error: "userId, title, and message are required" });
  }
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
  if (
    sleepingHabits === undefined ||
    studyHours === undefined ||
    cleanliness === undefined ||
    smoking === undefined ||
    foodPreference === undefined ||
    roomPreference === undefined
  ) {
    return res.status(400).json({ error: "Missing required roommate preference fields (sleepingHabits, studyHours, cleanliness, smoking, foodPreference, roomPreference)" });
  }
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
  if (!visitorName || !purpose || !validOn) {
    return res.status(400).json({ error: "Visitor name, purpose, and date (validOn) are required" });
  }
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
  if (!vehicleNumber || !ownerName || !type) {
    return res.status(400).json({ error: "Vehicle number, owner name, and type are required" });
  }
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
  if (!title || !time || !location || !description || !type) {
    return res.status(400).json({ error: "All incident report details (title, time, location, description, type) are required" });
  }
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
  if (!title || !description || !price || !category) {
    return res.status(400).json({ error: "Title, description, price, and category are required" });
  }
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

function isPossibleMatch(lost: any, found: any) {
  if (lost.category.toLowerCase() !== found.category.toLowerCase()) {
    return false;
  }

  const lostDate = new Date(lost.dateLost);
  const foundDate = new Date(found.dateFound);
  const diffTime = Math.abs(foundDate.getTime() - lostDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 10) {
    return false;
  }

  let score = 0;
  const getWords = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  
  const lostNameWords = getWords(lost.itemName);
  const foundDescWords = getWords(found.description);
  
  const nameOverlap = lostNameWords.filter(w => foundDescWords.includes(w));
  if (nameOverlap.length > 0) score += 30;

  if (lost.colour && found.description.toLowerCase().includes(lost.colour.toLowerCase())) {
    score += 30;
  }
  if (found.colour && lost.description.toLowerCase().includes(found.colour.toLowerCase())) {
    score += 30;
  }

  const lostLocWords = getWords(lost.lastSeenLocation);
  const foundLocWords = getWords(found.foundLocation);
  const locOverlap = lostLocWords.filter(w => foundLocWords.includes(w));
  if (locOverlap.length > 0) score += 20;

  const lostDescWords = getWords(lost.description);
  const descOverlap = lostDescWords.filter(w => foundDescWords.includes(w));
  if (descOverlap.length > 1) score += 20;

  if (lost.brand && found.description.toLowerCase().includes(lost.brand.toLowerCase())) {
    score += 20;
  }
  if (found.brand && lost.description.toLowerCase().includes(found.brand.toLowerCase())) {
    score += 20;
  }

  return score >= 40;
}

async function triggerSmartMatching(itemOrReport: { type: "lost" | "found", id: string }) {
  try {
    if (itemOrReport.type === "lost") {
      const lostReport = await prisma.lostReport.findUnique({
        where: { id: itemOrReport.id }
      });
      if (!lostReport) return;

      const availableFound = await prisma.foundItem.findMany({
        where: {
          communityCode: lostReport.communityCode,
          portal: lostReport.portal,
          status: { in: ["Available for Claim", "Possible Match Found"] }
        }
      });

      let matchCreated = false;
      for (const foundItem of availableFound) {
        if (isPossibleMatch(lostReport, foundItem)) {
          const existing = await prisma.itemMatch.findFirst({
            where: { lostReportId: lostReport.id, foundItemId: foundItem.id }
          });
          if (!existing) {
            const mId = `MT-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
            await prisma.itemMatch.create({
              data: {
                id: mId,
                lostReportId: lostReport.id,
                foundItemId: foundItem.id,
                status: "Suggested"
              }
            });
            matchCreated = true;

            if (foundItem.status === "Available for Claim") {
              const updatedFound = await prisma.foundItem.update({
                where: { id: foundItem.id },
                data: { status: "Possible Match Found" }
              });
              broadcastUpdate("lostfound:update", updatedFound);
            }

            const securityRole = lostReport.portal === "society" ? "security" : "warden";
            const secUsers = await prisma.user.findMany({
              where: { portal: lostReport.portal, role: securityRole }
            });
            for (const sec of secUsers) {
              await sendInAppNotification(
                sec.id,
                "Possible Match Suggested",
                `Smart Matching found a possible match for lost item: ${lostReport.itemName} and found item ID ${foundItem.id}`,
                "info"
              );
            }
          }
        }
      }

      if (matchCreated) {
        const updatedLost = await prisma.lostReport.update({
          where: { id: lostReport.id },
          data: { status: "Possible Match Found" }
        });
        const lrUser = await prisma.user.findUnique({ where: { id: lostReport.residentId } });
        broadcastUpdate("lostreport:update", {
          ...updatedLost,
          residentName: lrUser?.name || "Resident",
          flatNumber: lrUser?.unit || "N/A"
        });
      }
    } else {
      const foundItem = await prisma.foundItem.findUnique({
        where: { id: itemOrReport.id }
      });
      if (!foundItem || foundItem.status !== "Available for Claim") return;

      const searchingLost = await prisma.lostReport.findMany({
        where: {
          communityCode: foundItem.communityCode,
          portal: foundItem.portal,
          status: { in: ["Searching", "Possible Match Found"] }
        }
      });

      let matchCreated = false;
      for (const lostReport of searchingLost) {
        if (isPossibleMatch(lostReport, foundItem)) {
          const existing = await prisma.itemMatch.findFirst({
            where: { lostReportId: lostReport.id, foundItemId: foundItem.id }
          });
          if (!existing) {
            const mId = `MT-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
            await prisma.itemMatch.create({
              data: {
                id: mId,
                lostReportId: lostReport.id,
                foundItemId: foundItem.id,
                status: "Suggested"
              }
            });
            matchCreated = true;

            if (lostReport.status === "Searching") {
              const updatedLost = await prisma.lostReport.update({
                where: { id: lostReport.id },
                data: { status: "Possible Match Found" }
              });
              const lrUser = await prisma.user.findUnique({ where: { id: lostReport.residentId } });
              broadcastUpdate("lostreport:update", {
                ...updatedLost,
                residentName: lrUser?.name || "Resident",
                flatNumber: lrUser?.unit || "N/A"
              });
            }

            const securityRole = foundItem.portal === "society" ? "security" : "warden";
            const secUsers = await prisma.user.findMany({
              where: { portal: foundItem.portal, role: securityRole }
            });
            for (const sec of secUsers) {
              await sendInAppNotification(
                sec.id,
                "Possible Match Suggested",
                `Smart Matching found a possible match for lost item: ${lostReport.itemName} and found item ID ${foundItem.id}`,
                "info"
              );
            }
          }
        }
      }

      if (matchCreated) {
        const updatedFound = await prisma.foundItem.update({
          where: { id: foundItem.id },
          data: { status: "Possible Match Found" }
        });
        broadcastUpdate("lostfound:update", updatedFound);
      }
    }
  } catch (error) {
    console.error("Error in triggerSmartMatching:", error);
  }
}

// ==========================================
// 🧸 Lost & Found Items
// ==========================================
router.get("/lostfound", authenticateToken, async (req: any, res) => {
  try {
    const { role, portal, id: userId } = req.user;
    const list = await prisma.foundItem.findMany({
      where: { portal },
      include: {
        claims: true
      },
      orderBy: { createdAt: "desc" }
    });

    if (role === "security" || role === "secretary" || role === "warden") {
      return res.json(list);
    }

    const sanitizedList = list
      .filter(item => {
        if (item.status === "Pending Verification" || item.status === "Rejected") {
          return item.reporterId === userId;
        }
        return true;
      })
      .map(item => {
        if (item.reporterId !== userId) {
          return {
            ...item,
            reporterId: "hidden",
            reporterName: "Community Member"
          };
        }
        return item;
      });

    res.json(sanitizedList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lost/found items" });
  }
});

router.post("/lostfound", authenticateToken, async (req: any, res) => {
  const { category, brand, colour, description, images, foundLocation, dateFound, timeFound, additionalNotes } = req.body;
  if (!category || !description || !foundLocation || !dateFound || !timeFound) {
    return res.status(400).json({ error: "Required fields are missing" });
  }
  try {
    const { id: userId, name: userName, portal } = req.user;
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    const communityCode = dbUser?.communityCode || (portal === "society" ? "SUN123" : "VESIT26");

    const id = `LF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    const newItem = await prisma.foundItem.create({
      data: {
        id,
        reporterId: userId,
        reporterName: userName,
        communityCode,
        category,
        brand: brand || "",
        colour: colour || "",
        description,
        images: images || [],
        foundLocation,
        dateFound,
        timeFound,
        additionalNotes: additionalNotes || "",
        status: "Pending Verification",
        portal
      },
      include: {
        claims: true
      }
    });

    const securityRole = portal === "society" ? "security" : "warden";
    const securityUsers = await prisma.user.findMany({
      where: { portal, role: securityRole }
    });

    for (const sec of securityUsers) {
      await sendInAppNotification(
        sec.id,
        "New Found Item Submitted",
        `A new item (${category}) has been reported by a resident and is awaiting verification.`,
        "info"
      );
    }

    await sendInAppNotification(
      userId,
      "Report Submitted Successfully",
      "Your Lost & Found report has been received and is pending security verification.",
      "success"
    );

    broadcastUpdate("lostfound:update", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to report found item" });
  }
});

router.put("/lostfound/:id/verify", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.foundItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: "Found item not found" });
    }

    const updated = await prisma.foundItem.update({
      where: { id },
      data: { status: "Available" },
      include: { claims: true }
    });

    await sendInAppNotification(
      item.reporterId,
      "Found Item Verified",
      `Security has verified your submitted item: ${item.category}. It is now available for claims.`,
      "success"
    );

    const securityRole = item.portal === "society" ? "security" : "warden";
    await sendInAppNotification(
      req.user.id,
      "Item Verified",
      `You verified found item ID ${id}. Status set to Available for Claim.`,
      "success"
    );

    broadcastUpdate("lostfound:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to verify item" });
  }
});

router.put("/lostfound/:id/reject", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.foundItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: "Found item not found" });
    }

    const updated = await prisma.foundItem.update({
      where: { id },
      data: { status: "Rejected" },
      include: { claims: true }
    });

    await sendInAppNotification(
      item.reporterId,
      "Found Item Report Rejected",
      `Security has rejected your submitted item report: ${item.category}.`,
      "error"
    );

    broadcastUpdate("lostfound:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to reject item" });
  }
});

router.post("/lostfound/:id/claim", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { claimReason, itemDetails, proofImage, contactNumber } = req.body;
  if (!claimReason) {
    return res.status(400).json({ error: "Claim reason is required" });
  }

  try {
    const { id: userId, name: userName, portal } = req.user;
    const item = await prisma.foundItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: "Found item not found" });
    }

    const claimId = `CLM-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    await prisma.claim.create({
      data: {
        id: claimId,
        itemId: id,
        residentId: userId,
        residentName: userName,
        claimReason,
        itemDetails: itemDetails || "",
        proofImage: proofImage || "",
        contactNumber: contactNumber || "",
        status: "Claim Pending Verification"
      }
    });

    const updatedItem = await prisma.foundItem.update({
      where: { id },
      data: { status: "Claim Pending Verification" },
      include: { claims: true }
    });

    const securityRole = portal === "society" ? "security" : "warden";
    const securityUsers = await prisma.user.findMany({
      where: { portal, role: securityRole }
    });

    for (const sec of securityUsers) {
      await sendInAppNotification(
        sec.id,
        "New Claim Request Received",
        `A resident has submitted a claim for item: ${item.category}.`,
        "info"
      );
    }

    await sendInAppNotification(
      userId,
      "Claim Request Submitted",
      "Your claim request has been submitted and is pending verification.",
      "success"
    );

    broadcastUpdate("lostfound:update", updatedItem);
    res.status(201).json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit claim request" });
  }
});

router.put("/lostfound/claims/:claimId/approve", authenticateToken, async (req: any, res) => {
  const { claimId } = req.params;
  try {
    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    await prisma.claim.update({
      where: { id: claimId },
      data: {
        status: "Ready for Pickup",
        approvalDate: new Date()
      }
    });

    const updatedItem = await prisma.foundItem.update({
      where: { id: claim.itemId },
      data: { status: "Ready for Pickup" },
      include: { claims: true }
    });

    await sendInAppNotification(
      claim.residentId,
      "Claim Request Approved",
      "Your claim has been approved. Please collect your item from the Security Desk.",
      "success"
    );

    const otherClaims = await prisma.claim.findMany({
      where: {
        itemId: claim.itemId,
        id: { not: claimId },
        status: "Claim Pending Verification"
      }
    });

    for (const other of otherClaims) {
      await prisma.claim.update({
        where: { id: other.id },
        data: { status: "Rejected" }
      });
      await sendInAppNotification(
        other.residentId,
        "Claim Request Rejected",
        `Your claim request for item ${updatedItem.category} was rejected because it was claimed by another resident.`,
        "error"
      );
    }

    await sendInAppNotification(
      req.user.id,
      "Claim Approved",
      `You approved claim CLM-${claimId}. Status set to Ready for Pickup.`,
      "success"
    );

    broadcastUpdate("lostfound:update", updatedItem);
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to approve claim" });
  }
});

router.put("/lostfound/claims/:claimId/reject", authenticateToken, async (req: any, res) => {
  const { claimId } = req.params;
  try {
    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    await prisma.claim.update({
      where: { id: claimId },
      data: { status: "Rejected" }
    });

    const pendingClaims = await prisma.claim.findMany({
      where: {
        itemId: claim.itemId,
        status: "Claim Pending Verification"
      }
    });

    let nextStatus = "Available for Claim";
    if (pendingClaims.length > 0) {
      nextStatus = "Claim Pending Verification";
    }

    const updatedItem = await prisma.foundItem.update({
      where: { id: claim.itemId },
      data: { status: nextStatus },
      include: { claims: true }
    });

    await sendInAppNotification(
      claim.residentId,
      "Claim Request Rejected",
      "Your claim request has been rejected after verification.",
      "error"
    );

    broadcastUpdate("lostfound:update", updatedItem);
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reject claim" });
  }
});

router.put("/lostfound/claims/:claimId/pickup", authenticateToken, async (req: any, res) => {
  const { claimId } = req.params;
  const { collectedBy, verifiedBySecurity } = req.body;
  try {
    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    await prisma.claim.update({
      where: { id: claimId },
      data: {
        status: "Returned",
        collectionDate: new Date(),
        collectionTime: timeString,
        collectedBy: collectedBy || claim.residentName,
        verifiedBySecurity: verifiedBySecurity || req.user.name || "Security"
      }
    });

    const updatedItem = await prisma.foundItem.update({
      where: { id: claim.itemId },
      data: { status: "Returned" },
      include: { claims: true }
    });

    await sendInAppNotification(
      claim.residentId,
      "Item Handed Over",
      "Your item has been marked as returned. Thank you!",
      "success"
    );

    await sendInAppNotification(
      req.user.id,
      "Item Marked as Returned",
      `Handover resolved for claim CLM-${claimId}.`,
      "success"
    );

    broadcastUpdate("lostfound:update", updatedItem);
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log handover" });
  }
});

// ==========================================
// 🎒 Lost Reports & Smart Matching
// ==========================================
router.get("/lostfound/lost", authenticateToken, async (req: any, res) => {
  try {
    const { role, portal, id: userId } = req.user;
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    const communityCode = dbUser?.communityCode || (portal === "society" ? "SUN123" : "VESIT26");

    const list = await prisma.lostReport.findMany({
      where: { portal, communityCode },
      include: {
        resident: true,
        matches: {
          include: {
            foundItem: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (role === "security" || role === "secretary" || role === "warden") {
      const formatted = list.map(report => ({
        ...report,
        residentName: report.resident.name,
        flatNumber: report.resident.unit || "N/A",
        resident: undefined
      }));
      return res.json(formatted);
    }

    const filtered = list.filter(r => r.residentId === userId).map(report => ({
      ...report,
      residentName: report.resident.name,
      flatNumber: report.resident.unit || "N/A",
      resident: undefined
    }));

    res.json(filtered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lost reports" });
  }
});

router.post("/lostfound/lost", authenticateToken, async (req: any, res) => {
  const { itemName, category, brand, colour, description, distinguishingFeatures, dateLost, timeLost, lastSeenLocation, images, additionalNotes } = req.body;
  if (!itemName || !category || !description || !dateLost || !lastSeenLocation) {
    return res.status(400).json({ error: "Required fields are missing" });
  }
  try {
    const { id: userId, portal } = req.user;
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    const communityCode = dbUser?.communityCode || (portal === "society" ? "SUN123" : "VESIT26");

    const id = `LR-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    const newReport = await prisma.lostReport.create({
      data: {
        id,
        residentId: userId,
        itemName,
        category,
        brand: brand || "",
        colour: colour || "",
        description,
        distinguishingFeatures: distinguishingFeatures || "",
        dateLost,
        timeLost: timeLost || "",
        lastSeenLocation,
        images: images || [],
        additionalNotes: additionalNotes || "",
        status: "Searching",
        portal,
        communityCode
      }
    });

    const securityRole = portal === "society" ? "security" : "warden";
    const secUsers = await prisma.user.findMany({
      where: { portal, role: securityRole }
    });
    for (const sec of secUsers) {
      await sendInAppNotification(
        sec.id,
        "New Lost Item Reported",
        `A resident has reported a lost item: ${itemName} (${category}).`,
        "info"
      );
    }

    broadcastUpdate("lostreport:update", {
      ...newReport,
      residentName: dbUser?.name || "Resident",
      flatNumber: dbUser?.unit || "N/A"
    });

    res.status(201).json(newReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit lost report" });
  }
});

router.get("/lostfound/matches", authenticateToken, async (req: any, res) => {
  try {
    const { portal } = req.user;
    const list = await prisma.itemMatch.findMany({
      where: {
        lostReport: { portal }
      },
      include: {
        lostReport: {
          include: { resident: true }
        },
        foundItem: {
          include: { reporter: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formatted = list.map(match => ({
      ...match,
      lostReport: {
        ...match.lostReport,
        residentName: match.lostReport.resident.name,
        flatNumber: match.lostReport.resident.unit || "N/A",
        resident: undefined
      },
      foundItem: {
        ...match.foundItem,
        reporterName: match.foundItem.reporter.name,
        reporter: undefined
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch item matches" });
  }
});

router.post("/lostfound/matches/:matchId/confirm", authenticateToken, async (req: any, res) => {
  const { matchId } = req.params;
  const { verifiedBy } = req.body;
  try {
    const match = await prisma.itemMatch.findUnique({
      where: { id: matchId },
      include: { lostReport: true, foundItem: true }
    });
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const updatedMatch = await prisma.itemMatch.update({
      where: { id: matchId },
      data: {
        status: "Confirmed",
        verifiedBy: verifiedBy || req.user.name || "Security",
        verificationDate: new Date()
      }
    });

    const updatedLost = await prisma.lostReport.update({
      where: { id: match.lostReportId },
      data: { status: "Matched" }
    });

    const updatedFound = await prisma.foundItem.update({
      where: { id: match.foundItemId },
      data: { status: "Owner Identified" }
    });

    await sendInAppNotification(
      match.lostReport.residentId,
      "Lost Item Matched",
      `Good news! An item matching your Lost Item Report (${match.lostReport.itemName}) has been identified. Please visit the Security Desk to verify and collect your belongings.`,
      "success"
    );

    const otherMatches = await prisma.itemMatch.findMany({
      where: {
        id: { not: matchId },
        OR: [
          { lostReportId: match.lostReportId },
          { foundItemId: match.foundItemId }
        ],
        status: "Suggested"
      }
    });

    for (const om of otherMatches) {
      await prisma.itemMatch.update({
        where: { id: om.id },
        data: { status: "Rejected" }
      });
    }

    const lrUser = await prisma.user.findUnique({ where: { id: match.lostReport.residentId } });
    broadcastUpdate("lostreport:update", {
      ...updatedLost,
      residentName: lrUser?.name || "Resident",
      flatNumber: lrUser?.unit || "N/A"
    });
    broadcastUpdate("lostfound:update", updatedFound);
    broadcastUpdate("itemmatch:update", {
      ...updatedMatch,
      lostReport: {
        ...match.lostReport,
        residentName: lrUser?.name || "Resident",
        flatNumber: lrUser?.unit || "N/A"
      },
      foundItem: match.foundItem
    });

    res.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to confirm match" });
  }
});

router.post("/lostfound/matches/:matchId/reject", authenticateToken, async (req: any, res) => {
  const { matchId } = req.params;
  try {
    const match = await prisma.itemMatch.findUnique({
      where: { id: matchId },
      include: { lostReport: true, foundItem: true }
    });
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const updatedMatch = await prisma.itemMatch.update({
      where: { id: matchId },
      data: { status: "Rejected" }
    });

    const remainingLostMatches = await prisma.itemMatch.count({
      where: { lostReportId: match.lostReportId, status: { in: ["Suggested", "Confirmed"] } }
    });
    if (remainingLostMatches === 0) {
      const updatedLost = await prisma.lostReport.update({
        where: { id: match.lostReportId },
        data: { status: "Searching" }
      });
      const lrUser = await prisma.user.findUnique({ where: { id: match.lostReport.residentId } });
      broadcastUpdate("lostreport:update", {
        ...updatedLost,
        residentName: lrUser?.name || "Resident",
        flatNumber: lrUser?.unit || "N/A"
      });
    }

    const remainingFoundMatches = await prisma.itemMatch.count({
      where: { foundItemId: match.foundItemId, status: { in: ["Suggested", "Confirmed"] } }
    });
    if (remainingFoundMatches === 0) {
      const updatedFound = await prisma.foundItem.update({
        where: { id: match.foundItemId },
        data: { status: "Available for Claim" }
      });
      broadcastUpdate("lostfound:update", updatedFound);
    }

    res.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reject match" });
  }
});

router.post("/lostfound/suggest", authenticateToken, async (req: any, res) => {
  const { lostReportId, foundItemId, securityNote, additionalPhoto } = req.body;
  if (!lostReportId || !foundItemId) {
    return res.status(400).json({ error: "Required fields lostReportId and foundItemId are missing" });
  }
  try {
    const lostReport = await prisma.lostReport.findUnique({
      where: { id: lostReportId },
      include: { resident: true }
    });
    const foundItem = await prisma.foundItem.findUnique({
      where: { id: foundItemId }
    });

    if (!lostReport || !foundItem) {
      return res.status(404).json({ error: "Lost report or found item not found" });
    }

    const mId = `MT-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    const newMatch = await prisma.itemMatch.create({
      data: {
        id: mId,
        lostReportId,
        foundItemId,
        status: "Suggested",
        securityNote: securityNote || "",
        additionalPhoto: additionalPhoto || "",
        verifiedBy: req.user.name || "Security",
        verificationDate: new Date()
      },
      include: {
        lostReport: {
          include: { resident: true }
        },
        foundItem: {
          include: { reporter: true }
        }
      }
    });

    const updatedLost = await prisma.lostReport.update({
      where: { id: lostReportId },
      data: { status: "Belonging Suggested" }
    });

    const updatedFound = await prisma.foundItem.update({
      where: { id: foundItemId },
      data: { status: "Suggested To Resident" }
    });

    // Notify resident
    await sendInAppNotification(
      lostReport.residentId,
      "Belonging Suggested",
      `A possible belonging has been sent to you by Security. Please review it.`,
      "info"
    );

    const formatted = {
      ...newMatch,
      lostReport: {
        ...newMatch.lostReport,
        residentName: newMatch.lostReport.resident.name,
        flatNumber: newMatch.lostReport.resident.unit || "N/A",
        resident: undefined
      },
      foundItem: {
        ...newMatch.foundItem,
        reporterName: newMatch.foundItem.reporter.name,
        reporter: undefined
      }
    };

    broadcastUpdate("lostreport:update", {
      ...updatedLost,
      residentName: lostReport.resident.name,
      flatNumber: lostReport.resident.unit || "N/A"
    });
    broadcastUpdate("lostfound:update", updatedFound);
    broadcastUpdate("itemmatch:update", formatted);

    res.status(201).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to suggest match" });
  }
});

router.post("/lostfound/matches/:matchId/claim", authenticateToken, async (req: any, res) => {
  const { matchId } = req.params;
  try {
    const match = await prisma.itemMatch.findUnique({
      where: { id: matchId },
      include: {
        lostReport: {
          include: { resident: true }
        },
        foundItem: true
      }
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Update lost report status to "Claim Confirmed"
    const updatedLost = await prisma.lostReport.update({
      where: { id: match.lostReportId },
      data: { status: "Claim Confirmed" }
    });

    // Update found item status to "Claim Confirmed"
    const updatedFound = await prisma.foundItem.update({
      where: { id: match.foundItemId },
      data: { status: "Claim Confirmed" }
    });

    const residentName = match.lostReport.resident.name;
    const portal = match.lostReport.portal;
    const securityRole = portal === "society" ? "security" : "warden";

    // Notify all security guards
    const secUsers = await prisma.user.findMany({
      where: { portal, role: securityRole }
    });
    for (const sec of secUsers) {
      await sendInAppNotification(
        sec.id,
        "Proposed Belonging Confirmed",
        `${residentName} confirmed that the suggested item belongs to her.`,
        "success"
      );
    }

    broadcastUpdate("lostreport:update", {
      ...updatedLost,
      residentName,
      flatNumber: match.lostReport.resident.unit || "N/A"
    });
    broadcastUpdate("lostfound:update", updatedFound);

    res.json({ success: true, lostReport: updatedLost, foundItem: updatedFound });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to claim match" });
  }
});

router.post("/lostfound/matches/:matchId/reject-match", authenticateToken, async (req: any, res) => {
  const { matchId } = req.params;
  try {
    const match = await prisma.itemMatch.findUnique({
      where: { id: matchId },
      include: {
        lostReport: {
          include: { resident: true }
        },
        foundItem: true
      }
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Update match status to Rejected
    const updatedMatch = await prisma.itemMatch.update({
      where: { id: matchId },
      data: { status: "Rejected" }
    });

    // Update lost report status back to Searching
    const updatedLost = await prisma.lostReport.update({
      where: { id: match.lostReportId },
      data: { status: "Searching" }
    });

    // Update found item status back to Available
    const updatedFound = await prisma.foundItem.update({
      where: { id: match.foundItemId },
      data: { status: "Available" }
    });

    const residentName = match.lostReport.resident.name;
    const portal = match.lostReport.portal;
    const securityRole = portal === "society" ? "security" : "warden";

    // Notify all security guards
    const secUsers = await prisma.user.findMany({
      where: { portal, role: securityRole }
    });
    for (const sec of secUsers) {
      await sendInAppNotification(
        sec.id,
        "Proposed Belonging Rejected",
        `${residentName} rejected the proposed belonging (Match Ref: ${matchId}).`,
        "error"
      );
    }

    broadcastUpdate("lostreport:update", {
      ...updatedLost,
      residentName,
      flatNumber: match.lostReport.resident.unit || "N/A"
    });
    broadcastUpdate("lostfound:update", updatedFound);
    
    // Broadcast match status update
    broadcastUpdate("itemmatch:update", {
      ...updatedMatch,
      lostReport: {
        ...match.lostReport,
        residentName,
        flatNumber: match.lostReport.resident.unit || "N/A",
        resident: undefined
      },
      foundItem: updatedFound
    });

    res.json({ success: true, match: updatedMatch, lostReport: updatedLost, foundItem: updatedFound });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reject match suggestion" });
  }
});

router.put("/lostfound/matches/:matchId/handover", authenticateToken, async (req: any, res) => {
  const { matchId } = req.params;
  const { collectedBy, verifiedBySecurity } = req.body;
  try {
    const match = await prisma.itemMatch.findUnique({
      where: { id: matchId },
      include: { lostReport: true, foundItem: true }
    });
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedMatch = await prisma.itemMatch.update({
      where: { id: matchId },
      data: {
        status: "Confirmed",
        collectionDate: new Date(),
        collectionTime: timeString,
        collectedBy: collectedBy || match.lostReport.residentId,
        verifiedBy: verifiedBySecurity || req.user.name || "Security"
      }
    });

    const updatedLost = await prisma.lostReport.update({
      where: { id: match.lostReportId },
      data: { status: "Returned" }
    });

    const updatedFound = await prisma.foundItem.update({
      where: { id: match.foundItemId },
      data: { status: "Returned" }
    });

    await sendInAppNotification(
      match.lostReport.residentId,
      "Item Returned Successfully",
      `Your lost item (${match.lostReport.itemName}) has been successfully handed over to you.`,
      "success"
    );

    const lrUser = await prisma.user.findUnique({ where: { id: match.lostReport.residentId } });
    broadcastUpdate("lostreport:update", {
      ...updatedLost,
      residentName: lrUser?.name || "Resident",
      flatNumber: lrUser?.unit || "N/A"
    });
    broadcastUpdate("lostfound:update", updatedFound);
    broadcastUpdate("itemmatch:update", {
      ...updatedMatch,
      lostReport: {
        ...match.lostReport,
        residentName: lrUser?.name || "Resident",
        flatNumber: lrUser?.unit || "N/A"
      },
      foundItem: updatedFound
    });

    res.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to handover item" });
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
  if (!category || !vendor || !amount || !date) {
    return res.status(400).json({ error: "Category, vendor, amount, and date are required" });
  }
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
  if (!building || !wing || !floor || !flatNumber) {
    return res.status(400).json({ error: "Building, wing, floor, and flat number are required" });
  }
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
  if (!facility || !date || !slot) {
    return res.status(400).json({ error: "Facility, date, and slot are required" });
  }
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
