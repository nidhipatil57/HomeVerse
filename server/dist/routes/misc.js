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
// 📢 Announcements
// ==========================================
router.get("/announcements", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.announcement.findMany({
            orderBy: { createdAt: "desc" }
        });
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch announcements" });
    }
});
router.post("/announcements", auth_js_1.authenticateToken, async (req, res) => {
    const { title, content, priority, tags } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
    }
    try {
        const id = `ANN-${Math.floor(100 + Math.random() * 900)}`;
        const newItem = await db_js_1.default.announcement.create({
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
        (0, index_js_1.broadcastUpdate)("announcement:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create announcement" });
    }
});
// ==========================================
// ✈️ Leave Requests
// ==========================================
router.get("/leaveRequests", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { role, id } = req.user;
        let list;
        if (role === "warden") {
            list = await db_js_1.default.leaveRequest.findMany({ orderBy: { createdAt: "desc" } });
        }
        else {
            list = await db_js_1.default.leaveRequest.findMany({ where: { studentId: id }, orderBy: { createdAt: "desc" } });
        }
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch leaves" });
    }
});
router.post("/leaveRequests", auth_js_1.authenticateToken, async (req, res) => {
    const { studentName, room, parentContact, reason, fromDate, toDate } = req.body;
    if (!reason || !fromDate || !toDate) {
        return res.status(400).json({ error: "Reason, fromDate, and toDate are required" });
    }
    try {
        const id = `LEAVE-${Math.floor(100 + Math.random() * 900)}`;
        const newItem = await db_js_1.default.leaveRequest.create({
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
        (0, index_js_1.broadcastUpdate)("leave:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to submit leave" });
    }
});
router.put("/leaveRequests/:id/status", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updated = await db_js_1.default.leaveRequest.update({
            where: { id },
            data: { status }
        });
        (0, index_js_1.broadcastUpdate)("leave:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update leave status" });
    }
});
// ==========================================
// 🧺 Laundry Slots
// ==========================================
router.get("/laundry", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.laundrySlot.findMany();
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch laundry slots" });
    }
});
router.post("/laundry", auth_js_1.authenticateToken, async (req, res) => {
    const { machineId, machineName, date, timeSlot } = req.body;
    if (!machineId || !machineName || !date || !timeSlot) {
        return res.status(400).json({ error: "Machine details, date, and timeSlot are required" });
    }
    try {
        const id = `LND-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        const newItem = await db_js_1.default.laundrySlot.create({
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
        (0, index_js_1.broadcastUpdate)("laundry:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to book slot" });
    }
});
router.delete("/laundry/:id", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db_js_1.default.laundrySlot.delete({ where: { id } });
        (0, index_js_1.broadcastUpdate)("laundry:delete", { id });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to cancel slot" });
    }
});
// ==========================================
// 📦 Parcels Ledger
// ==========================================
router.get("/parcels", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { role, portal, unit } = req.user;
        let list;
        if (role === "secretary" || role === "security" || role === "warden") {
            list = await db_js_1.default.parcel.findMany({ where: { portal } });
        }
        else {
            list = await db_js_1.default.parcel.findMany({ where: { portal, unit } });
        }
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch parcels" });
    }
});
router.post("/parcels", auth_js_1.authenticateToken, async (req, res) => {
    const { recipientName, recipientId, unit, carrier, courier, trackingNumber } = req.body;
    if (!recipientName || !unit) {
        return res.status(400).json({ error: "Recipient name and unit are required" });
    }
    try {
        const id = `PRC-${Math.floor(100 + Math.random() * 900)}`;
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const newItem = await db_js_1.default.parcel.create({
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
        (0, index_js_1.broadcastUpdate)("parcel:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to log parcel" });
    }
});
router.put("/parcels/:id/release", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { otp } = req.body;
    try {
        const parcel = await db_js_1.default.parcel.findUnique({ where: { id } });
        if (!parcel)
            return res.status(404).json({ error: "Parcel not found" });
        // Validate OTP unless secretary overrides
        if (parcel.otp !== otp && req.user.role !== "secretary" && req.user.role !== "warden") {
            return res.status(400).json({ error: "Invalid OTP" });
        }
        const updated = await db_js_1.default.parcel.update({
            where: { id },
            data: {
                status: "released",
                dateReleased: new Date().toISOString().split("T")[0],
                timeReleased: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        });
        (0, index_js_1.broadcastUpdate)("parcel:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to release parcel" });
    }
});
// ==========================================
// 🛌 Room Change Requests
// ==========================================
router.get("/roomchange", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { role, id } = req.user;
        let list;
        if (role === "warden") {
            list = await db_js_1.default.roomChangeRequest.findMany();
        }
        else {
            list = await db_js_1.default.roomChangeRequest.findMany({ where: { studentId: id } });
        }
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch room change requests" });
    }
});
router.post("/roomchange", auth_js_1.authenticateToken, async (req, res) => {
    const { preferredRoom, reason } = req.body;
    if (!preferredRoom || !reason) {
        return res.status(400).json({ error: "Preferred room and reason are required" });
    }
    try {
        const id = `RCR-${Math.floor(100 + Math.random() * 900)}`;
        const newItem = await db_js_1.default.roomChangeRequest.create({
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
        (0, index_js_1.broadcastUpdate)("roomchange:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to submit room change" });
    }
});
router.put("/roomchange/:id/status", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updated = await db_js_1.default.roomChangeRequest.update({
            where: { id },
            data: { status }
        });
        (0, index_js_1.broadcastUpdate)("roomchange:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update room change" });
    }
});
// ==========================================
// 🧾 Maintenance Bills
// ==========================================
router.get("/maintenance", auth_js_1.optionalAuth, async (req, res) => {
    try {
        const role = req.user?.role || "secretary";
        const unit = req.user?.unit;
        let list;
        if (role === "secretary" || !unit) {
            list = await db_js_1.default.maintenanceBill.findMany();
        }
        else {
            list = await db_js_1.default.maintenanceBill.findMany({ where: { unit } });
        }
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch maintenance bills" });
    }
});
router.post("/maintenance/generate", auth_js_1.optionalAuth, async (req, res) => {
    const { residentId, residentName, unit, month, amount, dueDate, breakdown, lateFee, description, applicableTo, selectedBuilding } = req.body;
    try {
        // If no residentId is provided, perform bulk generation for all approved residents
        if (!residentId) {
            const filter = { role: "resident" };
            if (applicableTo === "Selected Building" && selectedBuilding) {
                filter.building = selectedBuilding;
            }
            let residents = await db_js_1.default.user.findMany({
                where: filter
            });
            if (residents.length === 0) {
                residents = await db_js_1.default.user.findMany({
                    where: { role: "resident" }
                });
            }
            const generatedBills = [];
            const billMonth = month || "October 2026";
            const billAmount = parseFloat(amount) || 3500;
            const billDueDate = dueDate || "15 November 2026";
            const billLateFee = lateFee ? parseFloat(lateFee) : null;
            const billDesc = description || "Monthly Maintenance Charges";
            for (const r of residents) {
                const id = `BILL-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
                // 1. Create MaintenanceBill
                const bill = await db_js_1.default.maintenanceBill.create({
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
                await db_js_1.default.residentPayment.create({
                    data: {
                        id: paymentId,
                        residentId: r.id,
                        residentName: r.name,
                        unit: r.unit || "",
                        building: r.building || "",
                        societyId: req.user?.communityCode || "SUN123",
                        paymentType: "Maintenance",
                        amount: billAmount,
                        status: "pending",
                        dueDate: billDueDate,
                        referenceId: id,
                        description: billDesc,
                        lateFee: billLateFee
                    }
                });
                // 3. Send in-app notification safely
                try {
                    await sendInAppNotification(r.id, "Maintenance Bill Generated 🧾", `📢 ${billMonth} maintenance bill has been generated. Due date: ${billDueDate}`, "warning");
                }
                catch (ne) { }
                generatedBills.push(bill);
                (0, index_js_1.broadcastUpdate)("maintenance:update", bill);
            }
            return res.status(201).json({ success: true, count: generatedBills.length });
        }
        // Otherwise, generate a single maintenance bill
        const id = `BILL-${Math.floor(100 + Math.random() * 900)}`;
        const billLateFee = lateFee ? parseFloat(lateFee) : null;
        const billDesc = description || "Monthly Maintenance Charges";
        const bill = await db_js_1.default.maintenanceBill.create({
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
        await db_js_1.default.residentPayment.create({
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
        (0, index_js_1.broadcastUpdate)("maintenance:update", bill);
        res.status(201).json(bill);
    }
    catch (error) {
        console.error("Failed to generate maintenance bills:", error);
        res.status(500).json({ error: "Failed to generate bills" });
    }
});
router.put("/maintenance/:id/pay", auth_js_1.optionalAuth, async (req, res) => {
    const { id } = req.params;
    const { paymentMethod, transactionId, amount, unit, residentName, month, dueDate } = req.body || {};
    try {
        const paidOn = new Date().toLocaleDateString('en-CA');
        const resolvedTxn = transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        const resolvedMethod = paymentMethod || "Card";
        const existingBill = await db_js_1.default.maintenanceBill.findUnique({ where: { id } });
        const updated = existingBill
            ? await db_js_1.default.maintenanceBill.update({
                where: { id },
                data: { status: "paid", paidOn }
            })
            : await db_js_1.default.maintenanceBill.create({
                data: {
                    id,
                    unit: unit || req.user?.unit || "101",
                    residentName: residentName || req.user?.name || "Resident",
                    residentId: req.user?.id || "resident",
                    month: month || "October 2026",
                    amount: Number(amount || 4500),
                    dueDate: dueDate || "2026-10-15",
                    status: "paid",
                    paidOn,
                    description: `${month || "October 2026"} Society Maintenance`
                }
            });
        // Sync with corresponding ResidentPayment if exists, or create ledger record
        const synced = await db_js_1.default.residentPayment.updateMany({
            where: {
                OR: [{ id }, { referenceId: id, paymentType: "Maintenance" }]
            },
            data: {
                status: "Paid",
                paidDate: new Date().toISOString(),
                transactionId: resolvedTxn,
                paymentMethod: resolvedMethod
            }
        });
        if (synced.count === 0) {
            const createdPayment = await db_js_1.default.residentPayment.upsert({
                where: { id: `PAY-${id}` },
                update: {
                    status: "Paid",
                    paidDate: new Date().toISOString(),
                    transactionId: resolvedTxn,
                    paymentMethod: resolvedMethod
                },
                create: {
                    id: `PAY-${id}`,
                    residentId: updated.residentId || req.user?.id || "user-resident-1",
                    residentName: updated.residentName,
                    unit: updated.unit,
                    building: req.user?.building || "",
                    societyId: req.user?.communityCode || "SUN123",
                    paymentType: "Maintenance",
                    description: `${updated.month} Maintenance Bill`,
                    amount: updated.amount,
                    status: "Paid",
                    dueDate: updated.dueDate,
                    paidDate: new Date().toISOString(),
                    transactionId: resolvedTxn,
                    paymentMethod: resolvedMethod,
                    receiptPath: `/receipts/${id}.pdf`,
                    referenceId: id
                }
            });
            (0, index_js_1.broadcastUpdate)("payment:update", createdPayment);
        }
        try {
            if (updated.residentId) {
                await sendInAppNotification(updated.residentId, "Maintenance Paid ✅", `Your ${updated.month} maintenance payment of ₹${updated.amount.toLocaleString()} succeeded (${resolvedMethod}, Ref: ${resolvedTxn}).`, "success");
            }
            const secretaryUsers = await db_js_1.default.user.findMany({ where: { role: "secretary", portal: "society" } });
            for (const sec of secretaryUsers) {
                await sendInAppNotification(sec.id, "Maintenance Payment Received ✅", `${updated.residentName} (Flat ${updated.unit}) paid ${updated.month} maintenance via ${resolvedMethod} (${resolvedTxn}).`, "success");
            }
        }
        catch (notifErr) {
            console.warn("Notification error during maintenance pay:", notifErr);
        }
        (0, index_js_1.broadcastUpdate)("maintenance:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error("Maintenance pay error:", error);
        res.status(500).json({ error: "Failed to pay bill" });
    }
});
// ==========================================
// 💳 Resident Payments & Society Collections
// ==========================================
function normalizeWingTag(value) {
    if (!value)
        return "";
    const cleaned = value.trim().toLowerCase();
    const wingMatch = cleaned.match(/\bwing\s*([a-z0-9-]+)\b|\b([a-z0-9-]+)\s*wing\b/i);
    if (wingMatch) {
        return (wingMatch[1] || wingMatch[2] || "").toLowerCase();
    }
    return cleaned;
}
function matchesCollectionAudience(visibility, applicableBuildings, applicableFlats, building, unit) {
    const effectiveVisibility = (visibility || "Everyone").trim();
    if (effectiveVisibility.toLowerCase() === "everyone" || effectiveVisibility === "All Residents") {
        return true;
    }
    if (applicableBuildings && applicableBuildings.length > 0 && building) {
        const userWing = normalizeWingTag(building);
        const matchesBuilding = applicableBuildings.some(b => {
            const target = normalizeWingTag(b);
            return b.trim().toLowerCase() === building.trim().toLowerCase() || (userWing && target && userWing === target);
        });
        if (matchesBuilding)
            return true;
    }
    if (applicableFlats && applicableFlats.length > 0 && unit) {
        const userUnit = unit.trim().toLowerCase();
        const matchesFlat = applicableFlats.some(f => f.trim().toLowerCase() === userUnit);
        if (matchesFlat)
            return true;
    }
    return false;
}
async function sendInAppNotification(userId, title, message, type) {
    try {
        const id = `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const newNotif = await db_js_1.default.notification.create({
            data: {
                id,
                userId,
                title,
                message,
                type: type || "info",
                read: false
            }
        });
        (0, index_js_1.broadcastUpdate)("notification:update", newNotif);
    }
    catch (e) {
        console.error("Failed to send in-app notification:", e);
    }
}
// 1. GET /payments - Fetch all payment transaction records
router.get("/payments", auth_js_1.optionalAuth, async (req, res) => {
    try {
        const role = req.user?.role || "secretary";
        const userId = req.user?.id;
        let list;
        if (role === "secretary" || !userId) {
            list = await db_js_1.default.residentPayment.findMany({
                orderBy: { createdAt: "desc" }
            });
        }
        else {
            list = await db_js_1.default.residentPayment.findMany({
                where: { residentId: userId },
                orderBy: { createdAt: "desc" }
            });
        }
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch payments" });
    }
});
// Clear all payment records and bills (for fresh restart)
router.post("/payments/clear-all", auth_js_1.optionalAuth, async (req, res) => {
    try {
        await db_js_1.default.residentPayment.deleteMany();
        await db_js_1.default.maintenanceBill.deleteMany();
        await db_js_1.default.societyCollection.deleteMany();
        (0, index_js_1.broadcastUpdate)("payment:clear", {});
        (0, index_js_1.broadcastUpdate)("maintenance:clear", {});
        res.json({ success: true, message: "All payment records and bills cleared." });
    }
    catch (error) {
        console.warn("Failed to clear payments in DB:", error);
        res.json({ success: true, offline: true });
    }
});
// 2. GET /payments/collections - Fetch all society collections
router.get("/payments/collections", auth_js_1.optionalAuth, async (req, res) => {
    try {
        const role = req.user?.role || "secretary";
        const unit = req.user?.unit;
        const building = req.user?.building;
        let list;
        if (role === "secretary" || (!unit && !building)) {
            list = await db_js_1.default.societyCollection.findMany({
                orderBy: { createdAt: "desc" }
            });
        }
        else {
            const allCollections = await db_js_1.default.societyCollection.findMany({
                where: { status: "active" },
                orderBy: { createdAt: "desc" }
            });
            list = allCollections.filter(c => matchesCollectionAudience(c.visibility, c.applicableBuildings, c.applicableFlats, building, unit));
        }
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch collections" });
    }
});
// 3. POST /payments/collections - Create new special collection
router.post("/payments/collections", auth_js_1.optionalAuth, async (req, res) => {
    const { title, description, amount, type, dueDate, applicableBuildings, applicableFlats, visibility } = req.body;
    if (!title || !amount || !type || !dueDate) {
        return res.status(400).json({ error: "Title, amount, type, and dueDate are required" });
    }
    try {
        const effectiveVisibility = (visibility || "Everyone").trim();
        const id = `COLL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const parsedAmount = parseFloat(amount);
        const collection = await db_js_1.default.societyCollection.create({
            data: {
                id,
                title,
                description: description || "",
                amount: parsedAmount,
                type,
                dueDate,
                applicableBuildings: Array.isArray(applicableBuildings) ? applicableBuildings : [],
                applicableFlats: Array.isArray(applicableFlats) ? applicableFlats : [],
                visibility: effectiveVisibility,
                communityCode: req.user?.communityCode || "SUN123"
            }
        });
        // Generate pending payments for all active society residents matching audience
        const residents = await db_js_1.default.user.findMany({
            where: {
                role: "resident",
                portal: "society",
                status: { notIn: ["rejected", "deactivated"] },
                ...(req.user?.communityCode ? { communityCode: req.user.communityCode } : {})
            }
        });
        const applicableResidents = residents.filter(r => matchesCollectionAudience(effectiveVisibility, applicableBuildings, applicableFlats, r.building, r.unit));
        const createdPayments = [];
        for (let idx = 0; idx < applicableResidents.length; idx++) {
            const r = applicableResidents[idx];
            const paymentId = `PAY-COLL-${Date.now()}-${idx}-${Math.floor(100 + Math.random() * 900)}`;
            const createdPayment = await db_js_1.default.residentPayment.create({
                data: {
                    id: paymentId,
                    residentId: r.id,
                    residentName: r.name,
                    unit: r.unit || "",
                    building: r.building || "",
                    societyId: req.user?.communityCode || "SUN123",
                    paymentType: title,
                    description: description || `${type} Collection`,
                    amount: parsedAmount,
                    status: "pending",
                    dueDate,
                    referenceId: id
                }
            });
            createdPayments.push(createdPayment);
            (0, index_js_1.broadcastUpdate)("payment:update", createdPayment);
            try {
                await sendInAppNotification(r.id, "New Special Collection Announced 📣", `${title} (₹${parsedAmount.toLocaleString()}) announced by Secretary. Due by ${dueDate}.`, "info");
            }
            catch (e) { }
        }
        (0, index_js_1.broadcastUpdate)("collection:update", collection);
        res.status(201).json({ ...collection, payments: createdPayments });
    }
    catch (error) {
        console.error("Failed to create collection:", error);
        res.status(500).json({ error: "Failed to create collection" });
    }
});
// 4. PUT /payments/collections/:id - Edit special collection
router.put("/payments/collections/:id", auth_js_1.optionalAuth, async (req, res) => {
    const { id } = req.params;
    const { title, description, amount, dueDate } = req.body;
    try {
        const updated = await db_js_1.default.societyCollection.update({
            where: { id },
            data: {
                title,
                description,
                amount: amount ? parseFloat(amount) : undefined,
                dueDate
            }
        });
        // Update pending payments for this collection
        await db_js_1.default.residentPayment.updateMany({
            where: { referenceId: id, status: "pending" },
            data: {
                paymentType: title || undefined,
                amount: amount ? parseFloat(amount) : undefined,
                dueDate: dueDate || undefined
            }
        });
        (0, index_js_1.broadcastUpdate)("collection:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update collection" });
    }
});
// 5. DELETE /payments/collections/:id - Cancel special collection
router.delete("/payments/collections/:id", auth_js_1.optionalAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const cancelled = await db_js_1.default.societyCollection.update({
            where: { id },
            data: { status: "cancelled" }
        });
        // Delete or cancel pending payments for this collection
        await db_js_1.default.residentPayment.updateMany({
            where: { referenceId: id, status: "pending" },
            data: { status: "cancelled" }
        });
        (0, index_js_1.broadcastUpdate)("collection:update", cancelled);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to cancel collection" });
    }
});
// 6. PUT /payments/:id/pay - Process payment
router.put("/payments/:id/pay", auth_js_1.optionalAuth, async (req, res) => {
    const { id } = req.params;
    const { paymentMethod, transactionId, amount, paymentType, dueDate, unit, building, description, referenceId, residentId, residentName } = req.body || {};
    try {
        const txnId = transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        const nowStr = new Date().toISOString();
        const resolvedMethod = paymentMethod || "Card";
        const existingPayment = await db_js_1.default.residentPayment.findUnique({
            where: { id }
        });
        let updatedPayment;
        if (existingPayment) {
            updatedPayment = await db_js_1.default.residentPayment.update({
                where: { id },
                data: {
                    status: "Paid",
                    paidDate: nowStr,
                    transactionId: txnId,
                    paymentMethod: resolvedMethod,
                    receiptPath: `/receipts/${id}.pdf`
                }
            });
        }
        else {
            // Upsert directly into Neon DB so seeded October maintenance bills and any pending items are created as Paid!
            const resolvedResidentId = residentId || req.user?.id || "user-resident-1";
            const resolvedResidentName = residentName || req.user?.name || "Resident";
            const resolvedUnit = unit || req.user?.unit || "202";
            const resolvedBuilding = building || req.user?.building || "A Wing";
            const resolvedAmount = parseFloat(amount || "4500");
            updatedPayment = await db_js_1.default.residentPayment.upsert({
                where: { id },
                update: {
                    status: "Paid",
                    paidDate: nowStr,
                    transactionId: txnId,
                    paymentMethod: resolvedMethod,
                    receiptPath: `/receipts/${id}.pdf`
                },
                create: {
                    id,
                    residentId: resolvedResidentId,
                    residentName: resolvedResidentName,
                    unit: resolvedUnit,
                    building: resolvedBuilding,
                    societyId: req.user?.communityCode || "SUN123",
                    paymentType: paymentType || "Maintenance",
                    description: description || "Monthly Society Maintenance",
                    amount: resolvedAmount,
                    status: "Paid",
                    dueDate: dueDate || nowStr.slice(0, 10),
                    paidDate: nowStr,
                    transactionId: txnId,
                    paymentMethod: resolvedMethod,
                    receiptPath: `/receipts/${id}.pdf`,
                    referenceId: referenceId || id
                }
            });
        }
        // If it is linked to a MaintenanceBill, mark it paid too safely
        if (updatedPayment.paymentType === "Maintenance" && updatedPayment.referenceId) {
            await db_js_1.default.maintenanceBill.updateMany({
                where: { id: updatedPayment.referenceId },
                data: {
                    status: "paid",
                    paidOn: nowStr.slice(0, 10)
                }
            });
        }
        // Send notifications safely
        try {
            await sendInAppNotification(updatedPayment.residentId, "Payment Successful ✅", `${updatedPayment.paymentType} payment (₹${updatedPayment.amount.toLocaleString()}) successful via ${resolvedMethod}. Receipt Ref: ${txnId}.`, "success");
            const secretaryUsers = await db_js_1.default.user.findMany({ where: { role: "secretary", portal: "society" } });
            for (const sec of secretaryUsers) {
                await sendInAppNotification(sec.id, "Resident Payment Received ✅", `✅ ${updatedPayment.residentName} (${updatedPayment.building || ""} Flat ${updatedPayment.unit}) paid ₹${updatedPayment.amount.toLocaleString()} for ${updatedPayment.paymentType} [${txnId}].`, "success");
            }
        }
        catch (notifErr) {
            console.warn("Notification error during payment pay:", notifErr);
        }
        // Check if collection target reached safely
        try {
            if (updatedPayment.referenceId && updatedPayment.paymentType !== "Maintenance") {
                const collection = await db_js_1.default.societyCollection.findUnique({
                    where: { id: updatedPayment.referenceId }
                });
                if (collection) {
                    const allPayments = await db_js_1.default.residentPayment.findMany({
                        where: { referenceId: collection.id }
                    });
                    const totalCollected = allPayments
                        .filter(p => p.status === "Paid")
                        .reduce((sum, p) => sum + p.amount, 0);
                    const expectedAmount = collection.amount * allPayments.length;
                    if (totalCollected >= expectedAmount && expectedAmount > 0) {
                        const secretaryUsers = await db_js_1.default.user.findMany({ where: { role: "secretary", portal: "society" } });
                        for (const sec of secretaryUsers) {
                            await sendInAppNotification(sec.id, "Collection Target Reached 🎉", `${collection.title} collection target reached!`, "success");
                        }
                    }
                }
            }
        }
        catch (collErr) {
            console.warn("Collection target check error:", collErr);
        }
        (0, index_js_1.broadcastUpdate)("payment:update", updatedPayment);
        res.json(updatedPayment);
    }
    catch (error) {
        console.error("Payment error:", error);
        res.status(500).json({ error: "Failed to process payment" });
    }
});
// 7. POST /payments/:id/remind - Send payment reminder
router.post("/payments/:id/remind", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const payment = await db_js_1.default.residentPayment.findUnique({
            where: { id }
        });
        if (!payment)
            return res.status(404).json({ error: "Payment request not found" });
        // Send reminder notification
        // Example: "Ganesh Festival contribution closes tomorrow." or "Maintenance payment due in 3 days."
        let msg = `${payment.paymentType} payment due in 3 days.`;
        if (payment.paymentType !== "Maintenance") {
            msg = `${payment.paymentType} contribution closes tomorrow.`;
        }
        await sendInAppNotification(payment.residentId, "Payment Reminder", msg, "warning");
        const secretaryUsers = await db_js_1.default.user.findMany({ where: { role: "secretary" } });
        for (const sec of secretaryUsers) {
            await sendInAppNotification(sec.id, "Reminder Sent", "Payment overdue reminder sent.", "info");
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send reminder" });
    }
});
// ==========================================
// 🛌 Rent Records
// ==========================================
router.get("/rent", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { role, name } = req.user;
        let list;
        if (role === "warden" || role === "secretary") {
            list = await db_js_1.default.rentRecord.findMany();
        }
        else {
            list = await db_js_1.default.rentRecord.findMany({ where: { tenantName: name } });
        }
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch rent bills" });
    }
});
router.post("/rent/generate", auth_js_1.authenticateToken, async (req, res) => {
    const { unit, building, tenantName, tenantId, amount, dueDate } = req.body;
    if (!unit || !building || !tenantName || !amount || !dueDate) {
        return res.status(400).json({ error: "All rent details (unit, building, tenantName, amount, dueDate) are required" });
    }
    try {
        const id = `RNT-${Math.floor(100 + Math.random() * 900)}`;
        const newItem = await db_js_1.default.rentRecord.create({
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
        (0, index_js_1.broadcastUpdate)("rent:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate rent record" });
    }
});
router.put("/rent/:id/pay", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await db_js_1.default.rentRecord.update({
            where: { id },
            data: {
                status: "paid",
                paidOn: new Date().toISOString().split("T")[0]
            }
        });
        (0, index_js_1.broadcastUpdate)("rent:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to pay rent bill" });
    }
});
// ==========================================
// 📅 Community Events
// ==========================================
// ==========================================
// 📅 Community Events
// ==========================================
router.get("/events", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const isSecretary = req.user.role === "secretary";
        const whereClause = { communityCode: req.user.communityCode || "SUN123" };
        if (!isSecretary) {
            whereClause.status = { not: "Draft" };
        }
        const list = await db_js_1.default.communityEvent.findMany({
            where: whereClause,
            include: {
                rsvps: true,
                registrations: true,
                volunteers: true,
                attendance: true,
                feedbacks: true,
                gallery: true,
                polls: {
                    include: { votes: true }
                },
                expenses: true
            }
        });
        res.json(list);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch community events" });
    }
});
router.post("/events", auth_js_1.authenticateToken, async (req, res) => {
    const { title, description, date, time, location, organizer, priority, category, bannerImage, endTime, contactPerson, contactNumber, maxParticipants, registrationDeadline, entryFee, registrationRequired, volunteerRequired, visibility, rules, thingsToBring, budget, status, eligibility, registrationFee, additionalInstructions } = req.body;
    if (!title || !description || !date || !time || !location || !organizer) {
        return res.status(400).json({ error: "All core event details (title, description, date, time, location, organizer) are required" });
    }
    try {
        const id = `EV-${Math.floor(100 + Math.random() * 900)}`;
        const eventStatus = status || "Published";
        const eventRules = additionalInstructions || rules || null;
        const newItem = await db_js_1.default.communityEvent.create({
            data: {
                id,
                title,
                description,
                date,
                time,
                location,
                organizer,
                priority: priority || "normal",
                communityCode: req.user.communityCode || "SUN123",
                category: category || "Cultural",
                bannerImage: bannerImage || null,
                endTime: endTime || null,
                contactPerson: contactPerson || null,
                contactNumber: contactNumber || null,
                maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
                registrationDeadline: registrationDeadline || null,
                entryFee: entryFee ? parseFloat(entryFee) : null,
                registrationRequired: registrationRequired === true || registrationRequired === "true" || registrationRequired === "Yes" || true,
                volunteerRequired: volunteerRequired === true || volunteerRequired === "true" || volunteerRequired === "Yes",
                visibility: eligibility || visibility || "All Residents",
                rules: eventRules,
                thingsToBring: thingsToBring || null,
                budget: budget ? parseFloat(budget) : 0.0,
                status: eventStatus
            },
            include: {
                rsvps: true,
                registrations: true,
                volunteers: true,
                attendance: true,
                feedbacks: true,
                gallery: true,
                polls: {
                    include: { votes: true }
                },
                expenses: true
            }
        });
        // Notify all residents ONLY if published
        if (eventStatus === "Published" || eventStatus === "Active") {
            const residents = await db_js_1.default.user.findMany({
                where: { communityCode: req.user.communityCode || "SUN123", role: "resident" }
            });
            for (const resi of residents) {
                await sendInAppNotification(resi.id, "New event published.", `🎪 "${title}" has been scheduled at ${location} on ${date} (${time}).`, "info");
            }
        }
        (0, index_js_1.broadcastUpdate)("event:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create event" });
    }
});
router.put("/events/:id", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, date, time, location, organizer, priority, category, bannerImage, endTime, contactPerson, contactNumber, maxParticipants, registrationDeadline, entryFee, registrationRequired, volunteerRequired, visibility, rules, thingsToBring, budget, status, eligibility, registrationFee, additionalInstructions } = req.body;
    try {
        const existing = await db_js_1.default.communityEvent.findUnique({
            where: { id },
            include: { registrations: true }
        });
        if (!existing) {
            return res.status(404).json({ error: "Event not found" });
        }
        const isCancelled = status === "Cancelled" && existing.status !== "Cancelled";
        const wasPublished = (existing.status === "Draft") && (status === "Published" || status === "Active");
        const wasRescheduled = (date && date !== existing.date) || (time && time !== existing.time) || (location && location !== existing.location);
        const updated = await db_js_1.default.communityEvent.update({
            where: { id },
            data: {
                title: title !== undefined ? title : existing.title,
                description: description !== undefined ? description : existing.description,
                date: date !== undefined ? date : existing.date,
                time: time !== undefined ? time : existing.time,
                location: location !== undefined ? location : existing.location,
                organizer: organizer !== undefined ? organizer : existing.organizer,
                priority: priority !== undefined ? priority : existing.priority,
                category: category !== undefined ? category : existing.category,
                bannerImage: bannerImage !== undefined ? bannerImage : existing.bannerImage,
                endTime: endTime !== undefined ? endTime : existing.endTime,
                contactPerson: contactPerson !== undefined ? contactPerson : existing.contactPerson,
                contactNumber: contactNumber !== undefined ? contactNumber : existing.contactNumber,
                maxParticipants: maxParticipants !== undefined ? (maxParticipants ? parseInt(maxParticipants) : null) : existing.maxParticipants,
                registrationDeadline: registrationDeadline !== undefined ? registrationDeadline : existing.registrationDeadline,
                entryFee: entryFee !== undefined ? (entryFee ? parseFloat(entryFee) : null) : existing.entryFee,
                registrationRequired: registrationRequired !== undefined ? (registrationRequired === true || registrationRequired === "true" || registrationRequired === "Yes") : existing.registrationRequired,
                volunteerRequired: volunteerRequired !== undefined ? (volunteerRequired === true || volunteerRequired === "true" || volunteerRequired === "Yes") : existing.volunteerRequired,
                visibility: eligibility !== undefined ? eligibility : (visibility !== undefined ? visibility : existing.visibility),
                rules: additionalInstructions !== undefined ? additionalInstructions : (rules !== undefined ? rules : existing.rules),
                thingsToBring: thingsToBring !== undefined ? thingsToBring : existing.thingsToBring,
                budget: budget !== undefined ? (budget ? parseFloat(budget) : 0.0) : existing.budget,
                status: status !== undefined ? status : existing.status
            },
            include: {
                rsvps: true,
                registrations: true,
                volunteers: true,
                attendance: true,
                feedbacks: true,
                gallery: true,
                polls: {
                    include: { votes: true }
                },
                expenses: true
            }
        });
        if (isCancelled) {
            // Notify all registered participants
            for (const reg of existing.registrations) {
                await sendInAppNotification(reg.userId, "Event cancelled.", `⚠️ The event "${updated.title}" has been cancelled by the Secretary.`, "warning");
            }
        }
        else if (wasRescheduled) {
            for (const reg of existing.registrations) {
                await sendInAppNotification(reg.userId, "Event Rescheduled", `📅 "${updated.title}" has been rescheduled to ${updated.date} at ${updated.time} (${updated.location}).`, "warning");
            }
        }
        if (wasPublished) {
            const residents = await db_js_1.default.user.findMany({
                where: { communityCode: req.user.communityCode || "SUN123", role: "resident" }
            });
            for (const resi of residents) {
                await sendInAppNotification(resi.id, "New event published.", `🎪 "${updated.title}" is now published and open for registrations!`, "info");
            }
        }
        (0, index_js_1.broadcastUpdate)("event:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update event" });
    }
});
router.post("/events/:id/register", auth_js_1.optionalAuth, async (req, res) => {
    const { id } = req.params;
    const { userId, userName, flatNumber, guestCount, guestNames, rsvpStatus, contactNumber, paymentStatus, paidAmount, paymentMethod, transactionId } = req.body;
    try {
        const event = await db_js_1.default.communityEvent.findUnique({
            where: { id },
            include: { registrations: true }
        });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        // Check deadline
        if (event.registrationDeadline) {
            const deadlineDate = new Date(event.registrationDeadline);
            if (!isNaN(deadlineDate.getTime()) && deadlineDate < new Date()) {
                return res.status(400).json({ error: "Registration failed. Registration deadline has passed." });
            }
        }
        if (event.status === "Cancelled") {
            return res.status(400).json({ error: "Cannot register for a cancelled event." });
        }
        // Check capacity limit
        const totalRegistered = event.registrations.reduce((acc, curr) => acc + 1 + curr.guestCount, 0);
        const parsedGuestCount = guestCount ? parseInt(guestCount) : 0;
        const incomingCount = 1 + parsedGuestCount;
        if (event.maxParticipants && totalRegistered + incomingCount > event.maxParticipants) {
            return res.status(400).json({ error: "Registration failed. Maximum capacity reached." });
        }
        const isPaidEvent = (event.entryFee || 0) > 0;
        const expectedFee = isPaidEvent ? (event.entryFee || 0) * incomingCount : 0;
        if (isPaidEvent) {
            if (paymentStatus !== "Paid" || Number(paidAmount || 0) < (event.entryFee || 0)) {
                return res.status(400).json({ error: "Payment via Payment Gateway is required before confirming registration." });
            }
        }
        const resolvedUserId = req.user?.id || userId || "user-resident-1";
        const resolvedUserName = req.user?.name || userName || "Resident";
        const resolvedFlat = req.user?.unit || flatNumber || "A-202";
        const resolvedPhone = contactNumber || req.user?.phone || null;
        const resolvedPayStatus = isPaidEvent ? "Paid" : "Free";
        const resolvedPaidAmount = isPaidEvent ? Number(paidAmount || expectedFee) : 0;
        const resolvedPayMethod = isPaidEvent ? (paymentMethod || "UPI") : null;
        const resolvedTxnId = isPaidEvent ? (transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`) : null;
        // Upsert registration
        const existingReg = await db_js_1.default.eventRegistration.findFirst({
            where: { eventId: id, userId: resolvedUserId }
        });
        if (existingReg) {
            await db_js_1.default.eventRegistration.update({
                where: { id: existingReg.id },
                data: {
                    guestCount: parsedGuestCount,
                    guestNames: guestNames || null,
                    rsvpStatus: rsvpStatus || "Going",
                    contactNumber: resolvedPhone,
                    paymentStatus: resolvedPayStatus,
                    paidAmount: resolvedPaidAmount,
                    paymentMethod: resolvedPayMethod,
                    transactionId: resolvedTxnId
                }
            });
        }
        else {
            await db_js_1.default.eventRegistration.create({
                data: {
                    eventId: id,
                    userId: resolvedUserId,
                    userName: resolvedUserName,
                    flatNumber: resolvedFlat,
                    contactNumber: resolvedPhone,
                    guestCount: parsedGuestCount,
                    guestNames: guestNames || null,
                    rsvpStatus: rsvpStatus || "Going",
                    paymentStatus: resolvedPayStatus,
                    paidAmount: resolvedPaidAmount,
                    paymentMethod: resolvedPayMethod,
                    transactionId: resolvedTxnId
                }
            });
        }
        // Record paid event fee in ResidentPayment ledger for Secretary tracking & Payment History
        if (isPaidEvent && resolvedTxnId) {
            const nowIso = new Date().toISOString();
            const eventPaymentId = `PAY-EVT-${id}-${resolvedUserId}`.slice(0, 64);
            const eventPayment = await db_js_1.default.residentPayment.upsert({
                where: { id: eventPaymentId },
                update: {
                    amount: resolvedPaidAmount,
                    status: "Paid",
                    paidDate: nowIso,
                    transactionId: resolvedTxnId,
                    paymentMethod: resolvedPayMethod || "UPI",
                    description: `Event Pass (${incomingCount} pass${incomingCount > 1 ? "es" : ""})`
                },
                create: {
                    id: eventPaymentId,
                    residentId: resolvedUserId,
                    residentName: resolvedUserName,
                    unit: resolvedFlat,
                    building: req.user?.building || "",
                    societyId: req.user?.communityCode || "SUN123",
                    paymentType: `Event: ${event.title}`,
                    description: `Event Pass (${incomingCount} pass${incomingCount > 1 ? "es" : ""})`,
                    amount: resolvedPaidAmount,
                    status: "Paid",
                    dueDate: event.date || nowIso.slice(0, 10),
                    paidDate: nowIso,
                    transactionId: resolvedTxnId,
                    paymentMethod: resolvedPayMethod || "UPI",
                    receiptPath: `/receipts/${eventPaymentId}.pdf`,
                    referenceId: id
                }
            });
            (0, index_js_1.broadcastUpdate)("payment:update", eventPayment);
        }
        // Sync RSVP table too for backwards compatibility
        const existingRsvp = await db_js_1.default.eventRsvp.findFirst({
            where: { eventId: id, userId: resolvedUserId }
        });
        if (existingRsvp) {
            await db_js_1.default.eventRsvp.update({
                where: { id: existingRsvp.id },
                data: { status: rsvpStatus || "Going" }
            });
        }
        else {
            await db_js_1.default.eventRsvp.create({
                data: {
                    eventId: id,
                    userId: resolvedUserId,
                    userName: resolvedUserName,
                    status: rsvpStatus || "Going"
                }
            });
        }
        // Send notifications safely
        try {
            await sendInAppNotification(resolvedUserId, "Registration Confirmed", isPaidEvent
                ? `🎟️ Your paid registration (₹${resolvedPaidAmount.toLocaleString()} via ${resolvedPayMethod}, Txn: ${resolvedTxnId}) for "${event.title}" is confirmed! Venue: ${event.location} on ${event.date}.`
                : `🎟️ Your registration for "${event.title}" is confirmed! Venue: ${event.location} on ${event.date}.`, "success");
            const secretaries = await db_js_1.default.user.findMany({
                where: { communityCode: req.user?.communityCode || "SUN123", role: "secretary" }
            });
            for (const sec of secretaries) {
                await sendInAppNotification(sec.id, "New Event Registration", isPaidEvent
                    ? `👤 ${resolvedUserName} (${resolvedFlat}) paid ₹${resolvedPaidAmount.toLocaleString()} [${resolvedTxnId}] and registered for "${event.title}".`
                    : `👤 ${resolvedUserName} (${resolvedFlat}) registered for "${event.title}".`, "info");
                if (event.maxParticipants && totalRegistered + incomingCount >= event.maxParticipants) {
                    await sendInAppNotification(sec.id, "Participant Capacity Reached", `🚨 Maximum capacity (${event.maxParticipants}) reached for "${event.title}".`, "alert");
                }
            }
        }
        catch (notifErr) {
            console.warn("Notification error during event registration:", notifErr);
        }
        const updated = await db_js_1.default.communityEvent.findUnique({
            where: { id },
            include: {
                rsvps: true,
                registrations: true,
                volunteers: true,
                attendance: true,
                feedbacks: true,
                gallery: true,
                polls: {
                    include: { votes: true }
                },
                expenses: true
            }
        });
        (0, index_js_1.broadcastUpdate)("event:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to register for event" });
    }
});
router.delete("/events/:id/register", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const event = await db_js_1.default.communityEvent.findUnique({
            where: { id }
        });
        if (!event)
            return res.status(404).json({ error: "Event not found" });
        const existingReg = await db_js_1.default.eventRegistration.findFirst({
            where: { eventId: id, userId: req.user.id }
        });
        if (existingReg) {
            await db_js_1.default.eventRegistration.delete({
                where: { id: existingReg.id }
            });
        }
        await db_js_1.default.eventRsvp.deleteMany({
            where: { eventId: id, userId: req.user.id }
        });
        // Notify Resident
        await sendInAppNotification(req.user.id, "Registration Cancelled", `Your registration for "${event.title}" has been cancelled.`, "info");
        // Notify Secretary
        const secretaries = await db_js_1.default.user.findMany({
            where: { communityCode: req.user.communityCode || "SUN123", role: "secretary" }
        });
        for (const sec of secretaries) {
            await sendInAppNotification(sec.id, "Registration Cancellation", `❌ ${req.user.name || "Resident"} (${req.user.unit || "Flat"}) cancelled registration for "${event.title}".`, "info");
        }
        const updated = await db_js_1.default.communityEvent.findUnique({
            where: { id },
            include: {
                rsvps: true,
                registrations: true,
                volunteers: true,
                attendance: true,
                feedbacks: true,
                gallery: true,
                polls: {
                    include: { votes: true }
                },
                expenses: true
            }
        });
        (0, index_js_1.broadcastUpdate)("event:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to cancel registration" });
    }
});
router.post("/events/:id/volunteer", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { role, contactNumber } = req.body;
    if (!role) {
        return res.status(400).json({ error: "Volunteer role is required" });
    }
    try {
        const event = await db_js_1.default.communityEvent.findUnique({ where: { id } });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        const existingVol = await db_js_1.default.eventVolunteer.findFirst({
            where: { eventId: id, userId: req.user.id }
        });
        if (existingVol) {
            await db_js_1.default.eventVolunteer.update({
                where: { id: existingVol.id },
                data: { role, contactNumber: contactNumber || req.user.phone }
            });
        }
        else {
            await db_js_1.default.eventVolunteer.create({
                data: {
                    eventId: id,
                    userId: req.user.id,
                    volunteerName: req.user.name || "Resident",
                    flatNumber: req.user.unit || "A-402",
                    contactNumber: contactNumber || req.user.phone,
                    role
                }
            });
        }
        const updated = await db_js_1.default.communityEvent.findUnique({
            where: { id },
            include: {
                rsvps: true,
                registrations: true,
                volunteers: true,
                attendance: true,
                feedbacks: true,
                gallery: true,
                polls: {
                    include: { votes: true }
                },
                expenses: true
            }
        });
        (0, index_js_1.broadcastUpdate)("event:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to register as volunteer" });
    }
});
router.post("/events/:id/attendance", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId, isAttending } = req.body;
    try {
        const event = await db_js_1.default.communityEvent.findUnique({ where: { id } });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        const resident = await db_js_1.default.user.findUnique({ where: { id: userId } });
        if (!resident) {
            return res.status(404).json({ error: "Resident not found" });
        }
        const existingAtt = await db_js_1.default.eventAttendance.findFirst({
            where: { eventId: id, userId }
        });
        if (isAttending === false) {
            if (existingAtt) {
                await db_js_1.default.eventAttendance.delete({ where: { id: existingAtt.id } });
            }
        }
        else {
            if (!existingAtt) {
                await db_js_1.default.eventAttendance.create({
                    data: {
                        eventId: id,
                        userId,
                        userName: resident.name,
                        flatNumber: resident.unit || "N/A",
                        markedBy: req.user.name || "Secretary"
                    }
                });
            }
        }
        const updated = await db_js_1.default.communityEvent.findUnique({
            where: { id },
            include: {
                rsvps: true,
                registrations: true,
                volunteers: true,
                attendance: true,
                feedbacks: true,
                gallery: true,
                polls: {
                    include: { votes: true }
                },
                expenses: true
            }
        });
        (0, index_js_1.broadcastUpdate)("event:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update attendance" });
    }
});
router.post("/events/:id/feedback", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { rating, comment, suggestions, wouldAttendSimilar } = req.body;
    if (!rating) {
        return res.status(400).json({ error: "Rating is required" });
    }
    try {
        const event = await db_js_1.default.communityEvent.findUnique({ where: { id } });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        const existingFeedback = await db_js_1.default.eventFeedback.findFirst({
            where: { eventId: id, userId: req.user.id }
        });
        if (existingFeedback) {
            await db_js_1.default.eventFeedback.update({
                where: { id: existingFeedback.id },
                data: {
                    rating: parseInt(rating),
                    comment: comment || null,
                    suggestions: suggestions || null,
                    wouldAttendSimilar: wouldAttendSimilar === true || wouldAttendSimilar === "true" || wouldAttendSimilar === "Yes"
                }
            });
        }
        else {
            await db_js_1.default.eventFeedback.create({
                data: {
                    eventId: id,
                    userId: req.user.id,
                    userName: req.user.name || "Resident",
                    rating: parseInt(rating),
                    comment: comment || null,
                    suggestions: suggestions || null,
                    wouldAttendSimilar: wouldAttendSimilar === true || wouldAttendSimilar === "true" || wouldAttendSimilar === "Yes"
                }
            });
        }
        const updated = await db_js_1.default.communityEvent.findUnique({
            where: { id },
            include: {
                rsvps: true,
                registrations: true,
                volunteers: true,
                attendance: true,
                feedbacks: true,
                gallery: true,
                polls: {
                    include: { votes: true }
                },
                expenses: true
            }
        });
        (0, index_js_1.broadcastUpdate)("event:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit feedback" });
    }
});
router.post("/events/:id/gallery", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { imageUrl } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ error: "Image URL or data is required" });
    }
    try {
        const event = await db_js_1.default.communityEvent.findUnique({ where: { id } });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        await db_js_1.default.eventGalleryPhoto.create({
            data: {
                eventId: id,
                imageUrl
            }
        });
        // Notify all registered participants that gallery is uploaded
        const registrants = await db_js_1.default.eventRegistration.findMany({
            where: { eventId: id }
        });
        for (const reg of registrants) {
            await sendInAppNotification(reg.userId, "Gallery uploaded.", `📸 Photos from the event "${event.title}" have been uploaded! Take a look.`, "info");
        }
        const updated = await db_js_1.default.communityEvent.findUnique({
            where: { id },
            include: {
                rsvps: true,
                registrations: true,
                volunteers: true,
                attendance: true,
                feedbacks: true,
                gallery: true,
                polls: {
                    include: { votes: true }
                },
                expenses: true
            }
        });
        (0, index_js_1.broadcastUpdate)("event:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to upload photo to gallery" });
    }
});
router.post("/events/:id/polls", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { question, options } = req.body;
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ error: "Question and at least 2 options are required" });
    }
    try {
        const event = await db_js_1.default.communityEvent.findUnique({ where: { id } });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        await db_js_1.default.eventPoll.create({
            data: {
                eventId: id,
                question,
                options,
                status: "Open"
            }
        });
        const updated = await db_js_1.default.communityEvent.findUnique({
            where: { id },
            include: {
                rsvps: true,
                registrations: true,
                volunteers: true,
                attendance: true,
                feedbacks: true,
                gallery: true,
                polls: {
                    include: { votes: true }
                },
                expenses: true
            }
        });
        (0, index_js_1.broadcastUpdate)("event:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create poll" });
    }
});
router.post("/events/polls/:pollId/vote", auth_js_1.authenticateToken, async (req, res) => {
    const { pollId } = req.params;
    const { option } = req.body;
    if (!option) {
        return res.status(400).json({ error: "Option selection is required" });
    }
    try {
        const poll = await db_js_1.default.eventPoll.findUnique({ where: { id: pollId } });
        if (!poll) {
            return res.status(404).json({ error: "Poll not found" });
        }
        if (poll.status === "Closed") {
            return res.status(400).json({ error: "Voting is closed for this poll." });
        }
        const existingVote = await db_js_1.default.eventPollVote.findFirst({
            where: { pollId, userId: req.user.id }
        });
        if (existingVote) {
            await db_js_1.default.eventPollVote.update({
                where: { id: existingVote.id },
                data: { option }
            });
        }
        else {
            await db_js_1.default.eventPollVote.create({
                data: {
                    pollId,
                    userId: req.user.id,
                    userName: req.user.name || "Resident",
                    option
                }
            });
        }
        const event = await db_js_1.default.communityEvent.findUnique({
            where: { id: poll.eventId },
            include: {
                rsvps: true,
                registrations: true,
                volunteers: true,
                attendance: true,
                feedbacks: true,
                gallery: true,
                polls: {
                    include: { votes: true }
                },
                expenses: true
            }
        });
        (0, index_js_1.broadcastUpdate)("event:update", event);
        res.json(event);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit vote" });
    }
});
router.post("/events/:id/expenses", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { category, amount, description, date } = req.body;
    if (!category || !amount || !date) {
        return res.status(400).json({ error: "Category, amount, and date are required" });
    }
    try {
        const event = await db_js_1.default.communityEvent.findUnique({ where: { id } });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        await db_js_1.default.eventExpense.create({
            data: {
                eventId: id,
                category,
                amount: parseFloat(amount),
                description: description || null,
                date
            }
        });
        const updated = await db_js_1.default.communityEvent.findUnique({
            where: { id },
            include: {
                rsvps: true,
                registrations: true,
                volunteers: true,
                attendance: true,
                feedbacks: true,
                gallery: true,
                polls: {
                    include: { votes: true }
                },
                expenses: true
            }
        });
        (0, index_js_1.broadcastUpdate)("event:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to log expense" });
    }
});
// ==========================================
// 🔔 Notifications
// ==========================================
router.get("/notifications", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" }
        });
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});
router.post("/notifications", auth_js_1.authenticateToken, async (req, res) => {
    const { userId, title, message, type } = req.body;
    if (!userId || !title || !message) {
        return res.status(400).json({ error: "userId, title, and message are required" });
    }
    try {
        const id = `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        const newItem = await db_js_1.default.notification.create({
            data: {
                id,
                userId,
                title,
                message,
                type: type || "info"
            }
        });
        (0, index_js_1.broadcastUpdate)("notification:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create notification" });
    }
});
router.put("/notifications/read", auth_js_1.authenticateToken, async (req, res) => {
    try {
        await db_js_1.default.notification.updateMany({
            where: { userId: req.user.id },
            data: { read: true }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to clear notifications" });
    }
});
router.put("/notifications/:id/read", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await db_js_1.default.notification.update({
            where: { id },
            data: { read: true }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to mark notification read" });
    }
});
// ==========================================
// 🤝 Roommate Preferences
// ==========================================
router.get("/roommates", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.roommatePreference.findMany();
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch preferences" });
    }
});
router.post("/roommates", auth_js_1.authenticateToken, async (req, res) => {
    const { sleepingHabits, studyHours, cleanliness, smoking, foodPreference, interests, roomPreference } = req.body;
    if (sleepingHabits === undefined ||
        studyHours === undefined ||
        cleanliness === undefined ||
        smoking === undefined ||
        foodPreference === undefined ||
        roomPreference === undefined) {
        return res.status(400).json({ error: "Missing required roommate preference fields (sleepingHabits, studyHours, cleanliness, smoking, foodPreference, roomPreference)" });
    }
    try {
        const record = await db_js_1.default.roommatePreference.upsert({
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to save roommate preferences" });
    }
});
// ==========================================
// 🚨 Emergency Alerts
// ==========================================
router.get("/emergencies", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.emergencyAlert.findMany({
            orderBy: { createdAt: "desc" }
        });
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch emergencies" });
    }
});
router.post("/emergencies", auth_js_1.authenticateToken, async (req, res) => {
    const { type, emergencyType, unit } = req.body;
    try {
        const id = `EMG-${Math.floor(100 + Math.random() * 900)}`;
        const newItem = await db_js_1.default.emergencyAlert.create({
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
        (0, index_js_1.broadcastUpdate)("emergency:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to trigger alert" });
    }
});
router.put("/emergencies/:id/resolve", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await db_js_1.default.emergencyAlert.update({
            where: { id },
            data: {
                status: "resolved",
                resolvedAt: new Date(),
                resolvedBy: req.user.name
            }
        });
        (0, index_js_1.broadcastUpdate)("emergency:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to resolve alert" });
    }
});
// ==========================================
// 🎟️ Gate Passes
// ==========================================
router.get("/gatepasses", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { role, unit } = req.user;
        let list;
        if (role === "secretary" || role === "security") {
            list = await db_js_1.default.gatePass.findMany();
        }
        else {
            list = await db_js_1.default.gatePass.findMany({ where: { unit } });
        }
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch gate passes" });
    }
});
router.post("/gatepasses", auth_js_1.authenticateToken, async (req, res) => {
    const { visitorName, purpose, validOn, qrCodeData } = req.body;
    if (!visitorName || !purpose || !validOn) {
        return res.status(400).json({ error: "Visitor name, purpose, and date (validOn) are required" });
    }
    try {
        const id = `PASS-${Math.floor(100 + Math.random() * 900)}`;
        const newItem = await db_js_1.default.gatePass.create({
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
        (0, index_js_1.broadcastUpdate)("gatepass:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate gate pass" });
    }
});
// ==========================================
// 🚗 Vehicle Logs
// ==========================================
router.get("/vehiclelogs", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.vehicleLog.findMany({
            orderBy: { entryTime: "desc" }
        });
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch vehicle logs" });
    }
});
router.post("/vehiclelogs/entry", auth_js_1.authenticateToken, async (req, res) => {
    const { vehicleNumber, ownerName, ownerUnit, type, gate } = req.body;
    if (!vehicleNumber || !ownerName || !type) {
        return res.status(400).json({ error: "Vehicle number, owner name, and type are required" });
    }
    try {
        const id = `VEH-${Math.floor(100 + Math.random() * 900)}`;
        const newItem = await db_js_1.default.vehicleLog.create({
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
        (0, index_js_1.broadcastUpdate)("vehiclelog:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to log entry" });
    }
});
router.put("/vehiclelogs/:id/exit", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await db_js_1.default.vehicleLog.update({
            where: { id },
            data: { exitTime: new Date() }
        });
        (0, index_js_1.broadcastUpdate)("vehiclelog:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to log exit" });
    }
});
// ==========================================
// ⚠️ Incident Reports
// ==========================================
router.get("/incidents", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.incidentReport.findMany({
            orderBy: { createdAt: "desc" }
        });
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch incidents" });
    }
});
router.post("/incidents", auth_js_1.authenticateToken, async (req, res) => {
    const { title, time, location, description, type } = req.body;
    if (!title || !time || !location || !description || !type) {
        return res.status(400).json({ error: "All incident report details (title, time, location, description, type) are required" });
    }
    try {
        const id = `INC-${Math.floor(100 + Math.random() * 900)}`;
        const newItem = await db_js_1.default.incidentReport.create({
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
        (0, index_js_1.broadcastUpdate)("incident:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to log incident" });
    }
});
router.put("/incidents/:id/resolve", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await db_js_1.default.incidentReport.update({
            where: { id },
            data: { status: "resolved" }
        });
        (0, index_js_1.broadcastUpdate)("incident:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to resolve incident" });
    }
});
// ==========================================
// 🛠️ Marketplace Items
// ==========================================
router.get("/marketplace", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.marketplaceItem.findMany({
            where: { portal: req.user.portal },
            orderBy: { createdAt: "desc" }
        });
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch marketplace" });
    }
});
router.post("/marketplace", auth_js_1.authenticateToken, async (req, res) => {
    const { title, description, price, category, images } = req.body;
    if (!title || !description || !price || !category) {
        return res.status(400).json({ error: "Title, description, price, and category are required" });
    }
    try {
        const id = `MKT-${Math.floor(100 + Math.random() * 900)}`;
        const newItem = await db_js_1.default.marketplaceItem.create({
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
        (0, index_js_1.broadcastUpdate)("marketplace:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to post marketplace item" });
    }
});
router.put("/marketplace/:id/status", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updated = await db_js_1.default.marketplaceItem.update({
            where: { id },
            data: { status }
        });
        (0, index_js_1.broadcastUpdate)("marketplace:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update marketplace status" });
    }
});
function isPossibleMatch(lost, found) {
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
    const getWords = (str) => (str || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
    const lostNameWords = getWords(lost.itemName);
    const foundDescWords = getWords(found.description);
    const nameOverlap = lostNameWords.filter(w => foundDescWords.includes(w));
    if (nameOverlap.length > 0)
        score += 30;
    if (lost.colour && found.description.toLowerCase().includes(lost.colour.toLowerCase())) {
        score += 30;
    }
    if (found.colour && lost.description.toLowerCase().includes(found.colour.toLowerCase())) {
        score += 30;
    }
    const lostLocWords = getWords(lost.lastSeenLocation);
    const foundLocWords = getWords(found.foundLocation);
    const locOverlap = lostLocWords.filter(w => foundLocWords.includes(w));
    if (locOverlap.length > 0)
        score += 20;
    const lostDescWords = getWords(lost.description);
    const descOverlap = lostDescWords.filter(w => foundDescWords.includes(w));
    if (descOverlap.length > 1)
        score += 20;
    if (lost.brand && found.description.toLowerCase().includes(lost.brand.toLowerCase())) {
        score += 20;
    }
    if (found.brand && lost.description.toLowerCase().includes(found.brand.toLowerCase())) {
        score += 20;
    }
    return score >= 40;
}
async function triggerSmartMatching(itemOrReport) {
    try {
        if (itemOrReport.type === "lost") {
            const lostReport = await db_js_1.default.lostReport.findUnique({
                where: { id: itemOrReport.id }
            });
            if (!lostReport)
                return;
            const availableFound = await db_js_1.default.foundItem.findMany({
                where: {
                    communityCode: lostReport.communityCode,
                    portal: lostReport.portal,
                    status: { in: ["Available for Claim", "Possible Match Found"] }
                }
            });
            let matchCreated = false;
            for (const foundItem of availableFound) {
                if (isPossibleMatch(lostReport, foundItem)) {
                    const existing = await db_js_1.default.itemMatch.findFirst({
                        where: { lostReportId: lostReport.id, foundItemId: foundItem.id }
                    });
                    if (!existing) {
                        const mId = `MT-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
                        await db_js_1.default.itemMatch.create({
                            data: {
                                id: mId,
                                lostReportId: lostReport.id,
                                foundItemId: foundItem.id,
                                status: "Suggested"
                            }
                        });
                        matchCreated = true;
                        if (foundItem.status === "Available for Claim") {
                            const updatedFound = await db_js_1.default.foundItem.update({
                                where: { id: foundItem.id },
                                data: { status: "Possible Match Found" }
                            });
                            (0, index_js_1.broadcastUpdate)("lostfound:update", updatedFound);
                        }
                        const securityRole = lostReport.portal === "society" ? "security" : "warden";
                        const secUsers = await db_js_1.default.user.findMany({
                            where: { portal: lostReport.portal, role: securityRole }
                        });
                        for (const sec of secUsers) {
                            await sendInAppNotification(sec.id, "Possible Match Suggested", `Smart Matching found a possible match for lost item: ${lostReport.itemName} and found item ID ${foundItem.id}`, "info");
                        }
                    }
                }
            }
            if (matchCreated) {
                const updatedLost = await db_js_1.default.lostReport.update({
                    where: { id: lostReport.id },
                    data: { status: "Possible Match Found" }
                });
                const lrUser = await db_js_1.default.user.findUnique({ where: { id: lostReport.residentId } });
                (0, index_js_1.broadcastUpdate)("lostreport:update", {
                    ...updatedLost,
                    residentName: lrUser?.name || "Resident",
                    flatNumber: lrUser?.unit || "N/A"
                });
            }
        }
        else {
            const foundItem = await db_js_1.default.foundItem.findUnique({
                where: { id: itemOrReport.id }
            });
            if (!foundItem || foundItem.status !== "Available for Claim")
                return;
            const searchingLost = await db_js_1.default.lostReport.findMany({
                where: {
                    communityCode: foundItem.communityCode,
                    portal: foundItem.portal,
                    status: { in: ["Searching", "Possible Match Found"] }
                }
            });
            let matchCreated = false;
            for (const lostReport of searchingLost) {
                if (isPossibleMatch(lostReport, foundItem)) {
                    const existing = await db_js_1.default.itemMatch.findFirst({
                        where: { lostReportId: lostReport.id, foundItemId: foundItem.id }
                    });
                    if (!existing) {
                        const mId = `MT-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
                        await db_js_1.default.itemMatch.create({
                            data: {
                                id: mId,
                                lostReportId: lostReport.id,
                                foundItemId: foundItem.id,
                                status: "Suggested"
                            }
                        });
                        matchCreated = true;
                        if (lostReport.status === "Searching") {
                            const updatedLost = await db_js_1.default.lostReport.update({
                                where: { id: lostReport.id },
                                data: { status: "Possible Match Found" }
                            });
                            const lrUser = await db_js_1.default.user.findUnique({ where: { id: lostReport.residentId } });
                            (0, index_js_1.broadcastUpdate)("lostreport:update", {
                                ...updatedLost,
                                residentName: lrUser?.name || "Resident",
                                flatNumber: lrUser?.unit || "N/A"
                            });
                        }
                        const securityRole = foundItem.portal === "society" ? "security" : "warden";
                        const secUsers = await db_js_1.default.user.findMany({
                            where: { portal: foundItem.portal, role: securityRole }
                        });
                        for (const sec of secUsers) {
                            await sendInAppNotification(sec.id, "Possible Match Suggested", `Smart Matching found a possible match for lost item: ${lostReport.itemName} and found item ID ${foundItem.id}`, "info");
                        }
                    }
                }
            }
            if (matchCreated) {
                const updatedFound = await db_js_1.default.foundItem.update({
                    where: { id: foundItem.id },
                    data: { status: "Possible Match Found" }
                });
                (0, index_js_1.broadcastUpdate)("lostfound:update", updatedFound);
            }
        }
    }
    catch (error) {
        console.error("Error in triggerSmartMatching:", error);
    }
}
// ==========================================
// 🧸 Lost & Found Items
// ==========================================
router.get("/lostfound", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { role, portal, id: userId } = req.user;
        const list = await db_js_1.default.foundItem.findMany({
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
                const parts = item.description.split(" - ");
                const sanitizedDesc = parts[0] + (parts.length > 1 ? " - details hidden by Security" : "");
                return {
                    ...item,
                    reporterId: "hidden",
                    reporterName: "Community Member",
                    brand: "Hidden",
                    colour: "Hidden",
                    additionalNotes: "Hidden",
                    description: sanitizedDesc
                };
            }
            return item;
        });
        res.json(sanitizedList);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch lost/found items" });
    }
});
router.post("/lostfound", auth_js_1.authenticateToken, async (req, res) => {
    const { category, brand, colour, description, images, foundLocation, dateFound, timeFound, additionalNotes } = req.body;
    if (!category || !description || !foundLocation || !dateFound || !timeFound) {
        return res.status(400).json({ error: "Required fields are missing" });
    }
    try {
        const { id: userId, name: userName, portal } = req.user;
        const dbUser = await db_js_1.default.user.findUnique({ where: { id: userId } });
        const communityCode = dbUser?.communityCode || (portal === "society" ? "SUN123" : "VESIT26");
        const resolvedName = userName || dbUser?.name || "Resident";
        const id = `LF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        const newItem = await db_js_1.default.foundItem.create({
            data: {
                id,
                reporterId: userId,
                reporterName: resolvedName,
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
                verification_status: "PENDING",
                publication_status: "UNPUBLISHED",
                portal
            },
            include: {
                claims: true
            }
        });
        const securityRole = portal === "society" ? "security" : "warden";
        const securityUsers = await db_js_1.default.user.findMany({
            where: { portal, role: securityRole }
        });
        for (const sec of securityUsers) {
            await sendInAppNotification(sec.id, "New Found Item Submitted", `A new item (${category}) has been reported by a resident and is awaiting verification.`, "info");
        }
        await sendInAppNotification(userId, "Report Submitted Successfully", "Your Lost & Found report has been received and is pending security verification.", "success");
        (0, index_js_1.broadcastUpdate)("lostfound:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to report found item" });
    }
});
router.put("/lostfound/:id/verify", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const item = await db_js_1.default.foundItem.findUnique({ where: { id } });
        if (!item) {
            return res.status(404).json({ error: "Found item not found" });
        }
        const updated = await db_js_1.default.foundItem.update({
            where: { id },
            data: {
                status: "Available",
                verification_status: "VERIFIED",
                publication_status: "PUBLISHED"
            },
            include: { claims: true }
        });
        await sendInAppNotification(item.reporterId, "Found Item Verified", `Security has verified your submitted item: ${item.category}. It is now available for claims.`, "success");
        const securityRole = item.portal === "society" ? "security" : "warden";
        await sendInAppNotification(req.user.id, "Item Verified", `You verified found item ID ${id}. Status set to Available for Claim.`, "success");
        (0, index_js_1.broadcastUpdate)("lostfound:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to verify item" });
    }
});
router.put("/lostfound/:id/reject", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { rejectReason } = req.body;
    try {
        const item = await db_js_1.default.foundItem.findUnique({ where: { id } });
        if (!item) {
            return res.status(404).json({ error: "Found item not found" });
        }
        const updated = await db_js_1.default.foundItem.update({
            where: { id },
            data: {
                status: "Rejected",
                verification_status: "REJECTED",
                publication_status: "UNPUBLISHED",
                rejectReason: rejectReason || "Rejected by Security"
            },
            include: { claims: true }
        });
        await sendInAppNotification(item.reporterId, "Found Item Report Rejected", `Security has rejected your submitted item report: ${item.category}. Reason: ${rejectReason || "N/A"}`, "error");
        (0, index_js_1.broadcastUpdate)("lostfound:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to reject item" });
    }
});
router.post("/lostfound/:id/claim", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { claimReason, itemDetails, proofImage, contactNumber, evidence } = req.body;
    if (!claimReason) {
        return res.status(400).json({ error: "Claim reason is required" });
    }
    try {
        const { id: userId, name: userName, portal } = req.user;
        const item = await db_js_1.default.foundItem.findUnique({ where: { id } });
        if (!item) {
            return res.status(404).json({ error: "Found item not found" });
        }
        const claimId = `CLM-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        await db_js_1.default.claim.create({
            data: {
                id: claimId,
                itemId: id,
                residentId: userId,
                residentName: userName,
                claimReason,
                itemDetails: itemDetails || "",
                proofImage: proofImage || "",
                contactNumber: contactNumber || "",
                status: "Claim Pending Verification",
                evidence: evidence ? JSON.stringify(evidence) : null
            }
        });
        const updatedItem = await db_js_1.default.foundItem.update({
            where: { id },
            data: { status: "Claim Pending Verification" },
            include: { claims: true }
        });
        const securityRole = portal === "society" ? "security" : "warden";
        const securityUsers = await db_js_1.default.user.findMany({
            where: { portal, role: securityRole }
        });
        for (const sec of securityUsers) {
            await sendInAppNotification(sec.id, "New Claim Request Received", `A resident has submitted a claim for item: ${item.category}.`, "info");
        }
        await sendInAppNotification(userId, "Claim Request Submitted", "Your claim request has been submitted and is pending verification.", "success");
        (0, index_js_1.broadcastUpdate)("lostfound:update", updatedItem);
        res.status(201).json(updatedItem);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit claim request" });
    }
});
router.get("/lostfound/claims", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { id: userId } = req.user;
        const claims = await db_js_1.default.claim.findMany({
            where: { residentId: userId },
            include: {
                item: true
            },
            orderBy: { createdAt: "desc" }
        });
        res.json(claims);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch claims" });
    }
});
router.put("/lostfound/claims/:claimId/request-evidence", auth_js_1.authenticateToken, async (req, res) => {
    const { claimId } = req.params;
    const { message } = req.body;
    try {
        const claim = await db_js_1.default.claim.findUnique({ where: { id: claimId } });
        if (!claim) {
            return res.status(404).json({ error: "Claim not found" });
        }
        const updatedClaim = await db_js_1.default.claim.update({
            where: { id: claimId },
            data: {
                status: "More Evidence Required",
                moreEvidenceRequest: message || "Please provide more details."
            }
        });
        await db_js_1.default.foundItem.update({
            where: { id: claim.itemId },
            data: { status: "Claim Pending Verification" }
        });
        await sendInAppNotification(claim.residentId, "Claim Update: More Evidence Required", `Security needs more evidence for your claim on item ID ${claim.itemId}. Msg: ${message || ""}`, "info");
        // Broadcast the updated item so lists refresh
        const updatedItem = await db_js_1.default.foundItem.findUnique({
            where: { id: claim.itemId },
            include: { claims: true }
        });
        if (updatedItem) {
            (0, index_js_1.broadcastUpdate)("lostfound:update", updatedItem);
        }
        res.json(updatedClaim);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to request more evidence" });
    }
});
router.put("/lostfound/claims/:claimId/provide-evidence", auth_js_1.authenticateToken, async (req, res) => {
    const { claimId } = req.params;
    const { additionalText, additionalImage } = req.body;
    try {
        const claim = await db_js_1.default.claim.findUnique({ where: { id: claimId } });
        if (!claim) {
            return res.status(404).json({ error: "Claim not found" });
        }
        let currentEvidence = {};
        try {
            if (claim.evidence) {
                currentEvidence = JSON.parse(claim.evidence);
            }
        }
        catch (e) { }
        const updatedEvidence = {
            ...currentEvidence,
            additionalEvidence: additionalText || "",
            additionalProofImage: additionalImage || claim.proofImage
        };
        const updatedClaim = await db_js_1.default.claim.update({
            where: { id: claimId },
            data: {
                status: "Claim Pending Verification",
                evidence: JSON.stringify(updatedEvidence),
                proofImage: additionalImage || claim.proofImage
            }
        });
        // Broadcast the updated item so lists refresh
        const updatedItem = await db_js_1.default.foundItem.findUnique({
            where: { id: claim.itemId },
            include: { claims: true }
        });
        if (updatedItem) {
            (0, index_js_1.broadcastUpdate)("lostfound:update", updatedItem);
        }
        res.json(updatedClaim);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to submit additional evidence" });
    }
});
router.put("/lostfound/claims/:claimId/approve", auth_js_1.authenticateToken, async (req, res) => {
    const { claimId } = req.params;
    try {
        const claim = await db_js_1.default.claim.findUnique({ where: { id: claimId } });
        if (!claim) {
            return res.status(404).json({ error: "Claim not found" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await db_js_1.default.claim.update({
            where: { id: claimId },
            data: {
                status: "Ready for Pickup",
                approvalDate: new Date(),
                collectionOtp: otp
            }
        });
        const updatedItem = await db_js_1.default.foundItem.update({
            where: { id: claim.itemId },
            data: { status: "Ready for Pickup" },
            include: { claims: true }
        });
        await sendInAppNotification(claim.residentId, "Claim Request Approved", `Your claim has been approved. Please collect your item from the Security Desk. Your Collection OTP is ${otp}.`, "success");
        const otherClaims = await db_js_1.default.claim.findMany({
            where: {
                itemId: claim.itemId,
                id: { not: claimId },
                status: "Claim Pending Verification"
            }
        });
        for (const other of otherClaims) {
            await db_js_1.default.claim.update({
                where: { id: other.id },
                data: { status: "Rejected" }
            });
            await sendInAppNotification(other.residentId, "Claim Request Rejected", `Your claim request for item ${updatedItem.category} was rejected because it was claimed by another resident.`, "error");
        }
        await sendInAppNotification(req.user.id, "Claim Approved", `You approved claim CLM-${claimId}. Status set to Ready for Pickup.`, "success");
        (0, index_js_1.broadcastUpdate)("lostfound:update", updatedItem);
        res.json(updatedItem);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to approve claim" });
    }
});
router.put("/lostfound/claims/:claimId/reject", auth_js_1.authenticateToken, async (req, res) => {
    const { claimId } = req.params;
    const { rejectReason } = req.body;
    try {
        const claim = await db_js_1.default.claim.findUnique({ where: { id: claimId } });
        if (!claim) {
            return res.status(404).json({ error: "Claim not found" });
        }
        await db_js_1.default.claim.update({
            where: { id: claimId },
            data: {
                status: "Rejected",
                rejectReason: rejectReason || "Rejected by Security"
            }
        });
        const pendingClaims = await db_js_1.default.claim.findMany({
            where: {
                itemId: claim.itemId,
                status: "Claim Pending Verification"
            }
        });
        let nextStatus = "Available for Claim";
        if (pendingClaims.length > 0) {
            nextStatus = "Claim Pending Verification";
        }
        const updatedItem = await db_js_1.default.foundItem.update({
            where: { id: claim.itemId },
            data: { status: nextStatus },
            include: { claims: true }
        });
        await sendInAppNotification(claim.residentId, "Claim Request Rejected", `Your claim request has been rejected. Reason: ${rejectReason || "N/A"}`, "error");
        (0, index_js_1.broadcastUpdate)("lostfound:update", updatedItem);
        res.json(updatedItem);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to reject claim" });
    }
});
router.put("/lostfound/claims/:claimId/pickup", auth_js_1.authenticateToken, async (req, res) => {
    const { claimId } = req.params;
    const { collectedBy, verifiedBySecurity, otp } = req.body;
    try {
        const claim = await db_js_1.default.claim.findUnique({ where: { id: claimId } });
        if (!claim) {
            return res.status(404).json({ error: "Claim not found" });
        }
        if (claim.collectionOtp && claim.collectionOtp !== otp) {
            return res.status(400).json({ error: "Invalid Collection OTP" });
        }
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        await db_js_1.default.claim.update({
            where: { id: claimId },
            data: {
                status: "Returned",
                collectionDate: new Date(),
                collectionTime: timeString,
                collectedBy: collectedBy || claim.residentName,
                verifiedBySecurity: verifiedBySecurity || req.user.name || "Security"
            }
        });
        const updatedItem = await db_js_1.default.foundItem.update({
            where: { id: claim.itemId },
            data: { status: "Returned" },
            include: { claims: true }
        });
        await sendInAppNotification(claim.residentId, "Item Handed Over", "Your item has been marked as returned. Thank you!", "success");
        await sendInAppNotification(req.user.id, "Item Marked as Returned", `Handover resolved for claim CLM-${claimId}.`, "success");
        (0, index_js_1.broadcastUpdate)("lostfound:update", updatedItem);
        res.json(updatedItem);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to log handover" });
    }
});
// ==========================================
// 🎒 Lost Reports & Smart Matching
// ==========================================
router.get("/lostfound/lost", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { role, portal, id: userId } = req.user;
        const dbUser = await db_js_1.default.user.findUnique({ where: { id: userId } });
        const communityCode = dbUser?.communityCode || (portal === "society" ? "SUN123" : "VESIT26");
        const list = await db_js_1.default.lostReport.findMany({
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
        const filtered = list
            .filter(r => r.residentId === userId)
            .map(report => ({
            ...report,
            residentName: report.resident.name,
            flatNumber: report.resident.unit || "N/A",
            resident: undefined
        }));
        res.json(filtered);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch lost reports" });
    }
});
router.post("/lostfound/lost", auth_js_1.authenticateToken, async (req, res) => {
    const { itemName, category, brand, colour, description, distinguishingFeatures, dateLost, timeLost, lastSeenLocation, images, additionalNotes } = req.body;
    if (!itemName || !category || !description || !dateLost || !lastSeenLocation) {
        return res.status(400).json({ error: "Required fields are missing" });
    }
    try {
        const { id: userId, portal } = req.user;
        const dbUser = await db_js_1.default.user.findUnique({ where: { id: userId } });
        const communityCode = dbUser?.communityCode || (portal === "society" ? "SUN123" : "VESIT26");
        const id = `LR-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        const newReport = await db_js_1.default.lostReport.create({
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
                status: "Private Alert",
                verification_status: "VERIFIED",
                publication_status: "UNPUBLISHED",
                portal,
                communityCode
            }
        });
        const securityRole = portal === "society" ? "security" : "warden";
        const secUsers = await db_js_1.default.user.findMany({
            where: { portal, role: securityRole }
        });
        for (const sec of secUsers) {
            await sendInAppNotification(sec.id, "New Private Lost Alert", `A resident has submitted a private lost alert: ${itemName} (${category}).`, "info");
        }
        (0, index_js_1.broadcastUpdate)("lostreport:update", {
            ...newReport,
            residentName: dbUser?.name || "Resident",
            flatNumber: dbUser?.unit || "N/A"
        });
        res.status(201).json(newReport);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit lost report" });
    }
});
router.put("/lostfound/lost/:id/verify", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const report = await db_js_1.default.lostReport.findUnique({ where: { id } });
        if (!report) {
            return res.status(404).json({ error: "Lost report not found" });
        }
        const updated = await db_js_1.default.lostReport.update({
            where: { id },
            data: {
                status: "Searching",
                verification_status: "VERIFIED",
                publication_status: "PUBLISHED"
            }
        });
        await sendInAppNotification(report.residentId, "Lost Report Verified", `Security has verified and published your lost item report: ${report.itemName}.`, "success");
        const lrUser = await db_js_1.default.user.findUnique({ where: { id: report.residentId } });
        (0, index_js_1.broadcastUpdate)("lostreport:update", {
            ...updated,
            residentName: lrUser?.name || "Resident",
            flatNumber: lrUser?.unit || "N/A"
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to verify lost report" });
    }
});
router.put("/lostfound/lost/:id/reject", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { rejectReason } = req.body;
    try {
        const report = await db_js_1.default.lostReport.findUnique({ where: { id } });
        if (!report) {
            return res.status(404).json({ error: "Lost report not found" });
        }
        const updated = await db_js_1.default.lostReport.update({
            where: { id },
            data: {
                status: "Rejected",
                verification_status: "REJECTED",
                publication_status: "UNPUBLISHED",
                rejectReason: rejectReason || "Rejected by Security"
            }
        });
        await sendInAppNotification(report.residentId, "Lost Report Rejected", `Security has rejected your lost report for ${report.itemName}. Reason: ${rejectReason || "N/A"}`, "error");
        const lrUser = await db_js_1.default.user.findUnique({ where: { id: report.residentId } });
        (0, index_js_1.broadcastUpdate)("lostreport:update", {
            ...updated,
            residentName: lrUser?.name || "Resident",
            flatNumber: lrUser?.unit || "N/A"
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to reject lost report" });
    }
});
router.put("/lostfound/lost/:id/request-info", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { rejectReason } = req.body;
    try {
        const report = await db_js_1.default.lostReport.findUnique({ where: { id } });
        if (!report) {
            return res.status(404).json({ error: "Lost report not found" });
        }
        const updated = await db_js_1.default.lostReport.update({
            where: { id },
            data: {
                status: "More Info Requested",
                verification_status: "MORE_INFO_REQUESTED",
                rejectReason: rejectReason || "Additional details needed."
            }
        });
        await sendInAppNotification(report.residentId, "Lost Report: More Info Requested", `Security needs more info for report: ${report.itemName}. Msg: ${rejectReason || ""}`, "info");
        const lrUser = await db_js_1.default.user.findUnique({ where: { id: report.residentId } });
        (0, index_js_1.broadcastUpdate)("lostreport:update", {
            ...updated,
            residentName: lrUser?.name || "Resident",
            flatNumber: lrUser?.unit || "N/A"
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to request info for lost report" });
    }
});
router.put("/lostfound/lost/:id", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { itemName, category, brand, colour, description, distinguishingFeatures, dateLost, timeLost, lastSeenLocation, images, additionalNotes } = req.body;
    try {
        const report = await db_js_1.default.lostReport.findUnique({ where: { id } });
        if (!report) {
            return res.status(404).json({ error: "Lost report not found" });
        }
        if (report.residentId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized to edit this report" });
        }
        const updated = await db_js_1.default.lostReport.update({
            where: { id },
            data: {
                itemName: itemName || report.itemName,
                category: category || report.category,
                brand: brand !== undefined ? brand : report.brand,
                colour: colour !== undefined ? colour : report.colour,
                description: description || report.description,
                distinguishingFeatures: distinguishingFeatures !== undefined ? distinguishingFeatures : report.distinguishingFeatures,
                dateLost: dateLost || report.dateLost,
                timeLost: timeLost !== undefined ? timeLost : report.timeLost,
                lastSeenLocation: lastSeenLocation || report.lastSeenLocation,
                images: images !== undefined ? images : report.images,
                additionalNotes: additionalNotes !== undefined ? additionalNotes : report.additionalNotes,
                status: "Pending Verification",
                verification_status: "PENDING",
                publication_status: "UNPUBLISHED"
            }
        });
        const lrUser = await db_js_1.default.user.findUnique({ where: { id: report.residentId } });
        (0, index_js_1.broadcastUpdate)("lostreport:update", {
            ...updated,
            residentName: lrUser?.name || "Resident",
            flatNumber: lrUser?.unit || "N/A"
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to edit lost report" });
    }
});
router.get("/lostfound/matches", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { portal } = req.user;
        const list = await db_js_1.default.itemMatch.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch item matches" });
    }
});
router.post("/lostfound/matches/:matchId/confirm", auth_js_1.authenticateToken, async (req, res) => {
    const { matchId } = req.params;
    const { verifiedBy } = req.body;
    try {
        const match = await db_js_1.default.itemMatch.findUnique({
            where: { id: matchId },
            include: { lostReport: true, foundItem: true }
        });
        if (!match) {
            return res.status(404).json({ error: "Match not found" });
        }
        const updatedMatch = await db_js_1.default.itemMatch.update({
            where: { id: matchId },
            data: {
                status: "Confirmed",
                verifiedBy: verifiedBy || req.user.name || "Security",
                verificationDate: new Date()
            }
        });
        const updatedLost = await db_js_1.default.lostReport.update({
            where: { id: match.lostReportId },
            data: { status: "Matched" }
        });
        const updatedFound = await db_js_1.default.foundItem.update({
            where: { id: match.foundItemId },
            data: { status: "Owner Identified" }
        });
        await sendInAppNotification(match.lostReport.residentId, "Lost Item Matched", `Good news! An item matching your Lost Item Report (${match.lostReport.itemName}) has been identified. Please visit the Security Desk to verify and collect your belongings.`, "success");
        const otherMatches = await db_js_1.default.itemMatch.findMany({
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
            await db_js_1.default.itemMatch.update({
                where: { id: om.id },
                data: { status: "Rejected" }
            });
        }
        const lrUser = await db_js_1.default.user.findUnique({ where: { id: match.lostReport.residentId } });
        (0, index_js_1.broadcastUpdate)("lostreport:update", {
            ...updatedLost,
            residentName: lrUser?.name || "Resident",
            flatNumber: lrUser?.unit || "N/A"
        });
        (0, index_js_1.broadcastUpdate)("lostfound:update", updatedFound);
        (0, index_js_1.broadcastUpdate)("itemmatch:update", {
            ...updatedMatch,
            lostReport: {
                ...match.lostReport,
                residentName: lrUser?.name || "Resident",
                flatNumber: lrUser?.unit || "N/A"
            },
            foundItem: match.foundItem
        });
        res.json({ success: true, match: updatedMatch });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to confirm match" });
    }
});
router.post("/lostfound/matches/:matchId/reject", auth_js_1.authenticateToken, async (req, res) => {
    const { matchId } = req.params;
    try {
        const match = await db_js_1.default.itemMatch.findUnique({
            where: { id: matchId },
            include: { lostReport: true, foundItem: true }
        });
        if (!match) {
            return res.status(404).json({ error: "Match not found" });
        }
        const updatedMatch = await db_js_1.default.itemMatch.update({
            where: { id: matchId },
            data: { status: "Rejected" }
        });
        const remainingLostMatches = await db_js_1.default.itemMatch.count({
            where: { lostReportId: match.lostReportId, status: { in: ["Suggested", "Confirmed"] } }
        });
        if (remainingLostMatches === 0) {
            const updatedLost = await db_js_1.default.lostReport.update({
                where: { id: match.lostReportId },
                data: { status: "Searching" }
            });
            const lrUser = await db_js_1.default.user.findUnique({ where: { id: match.lostReport.residentId } });
            (0, index_js_1.broadcastUpdate)("lostreport:update", {
                ...updatedLost,
                residentName: lrUser?.name || "Resident",
                flatNumber: lrUser?.unit || "N/A"
            });
        }
        const remainingFoundMatches = await db_js_1.default.itemMatch.count({
            where: { foundItemId: match.foundItemId, status: { in: ["Suggested", "Confirmed"] } }
        });
        if (remainingFoundMatches === 0) {
            const updatedFound = await db_js_1.default.foundItem.update({
                where: { id: match.foundItemId },
                data: { status: "Available for Claim" }
            });
            (0, index_js_1.broadcastUpdate)("lostfound:update", updatedFound);
        }
        res.json({ success: true, match: updatedMatch });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to reject match" });
    }
});
router.post("/lostfound/suggest", auth_js_1.authenticateToken, async (req, res) => {
    const { lostReportId, foundItemId, securityNote, additionalPhoto } = req.body;
    if (!lostReportId || !foundItemId) {
        return res.status(400).json({ error: "Required fields lostReportId and foundItemId are missing" });
    }
    try {
        const lostReport = await db_js_1.default.lostReport.findUnique({
            where: { id: lostReportId },
            include: { resident: true }
        });
        const foundItem = await db_js_1.default.foundItem.findUnique({
            where: { id: foundItemId }
        });
        if (!lostReport || !foundItem) {
            return res.status(404).json({ error: "Lost report or found item not found" });
        }
        const mId = `MT-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        const newMatch = await db_js_1.default.itemMatch.create({
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
        const updatedLost = await db_js_1.default.lostReport.update({
            where: { id: lostReportId },
            data: { status: "Belonging Suggested" }
        });
        const updatedFound = await db_js_1.default.foundItem.update({
            where: { id: foundItemId },
            data: { status: "Suggested To Resident" }
        });
        // Notify resident
        await sendInAppNotification(lostReport.residentId, "Belonging Suggested", `A possible belonging has been sent to you by Security. Please review it.`, "info");
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
        (0, index_js_1.broadcastUpdate)("lostreport:update", {
            ...updatedLost,
            residentName: lostReport.resident.name,
            flatNumber: lostReport.resident.unit || "N/A"
        });
        (0, index_js_1.broadcastUpdate)("lostfound:update", updatedFound);
        (0, index_js_1.broadcastUpdate)("itemmatch:update", formatted);
        res.status(201).json(formatted);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to suggest match" });
    }
});
router.post("/lostfound/matches/:matchId/claim", auth_js_1.authenticateToken, async (req, res) => {
    const { matchId } = req.params;
    try {
        const match = await db_js_1.default.itemMatch.findUnique({
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
        const updatedLost = await db_js_1.default.lostReport.update({
            where: { id: match.lostReportId },
            data: { status: "Claim Confirmed" }
        });
        // Update found item status to "Claim Confirmed"
        const updatedFound = await db_js_1.default.foundItem.update({
            where: { id: match.foundItemId },
            data: { status: "Claim Confirmed" }
        });
        const residentName = match.lostReport.resident.name;
        const portal = match.lostReport.portal;
        const securityRole = portal === "society" ? "security" : "warden";
        // Notify all security guards
        const secUsers = await db_js_1.default.user.findMany({
            where: { portal, role: securityRole }
        });
        for (const sec of secUsers) {
            await sendInAppNotification(sec.id, "Proposed Belonging Confirmed", `${residentName} confirmed that the suggested item belongs to her.`, "success");
        }
        (0, index_js_1.broadcastUpdate)("lostreport:update", {
            ...updatedLost,
            residentName,
            flatNumber: match.lostReport.resident.unit || "N/A"
        });
        (0, index_js_1.broadcastUpdate)("lostfound:update", updatedFound);
        res.json({ success: true, lostReport: updatedLost, foundItem: updatedFound });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to claim match" });
    }
});
router.post("/lostfound/matches/:matchId/reject-match", auth_js_1.authenticateToken, async (req, res) => {
    const { matchId } = req.params;
    try {
        const match = await db_js_1.default.itemMatch.findUnique({
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
        const updatedMatch = await db_js_1.default.itemMatch.update({
            where: { id: matchId },
            data: { status: "Rejected" }
        });
        // Update lost report status back to Searching
        const updatedLost = await db_js_1.default.lostReport.update({
            where: { id: match.lostReportId },
            data: { status: "Searching" }
        });
        // Update found item status back to Available
        const updatedFound = await db_js_1.default.foundItem.update({
            where: { id: match.foundItemId },
            data: { status: "Available" }
        });
        const residentName = match.lostReport.resident.name;
        const portal = match.lostReport.portal;
        const securityRole = portal === "society" ? "security" : "warden";
        // Notify all security guards
        const secUsers = await db_js_1.default.user.findMany({
            where: { portal, role: securityRole }
        });
        for (const sec of secUsers) {
            await sendInAppNotification(sec.id, "Proposed Belonging Rejected", `${residentName} rejected the proposed belonging (Match Ref: ${matchId}).`, "error");
        }
        (0, index_js_1.broadcastUpdate)("lostreport:update", {
            ...updatedLost,
            residentName,
            flatNumber: match.lostReport.resident.unit || "N/A"
        });
        (0, index_js_1.broadcastUpdate)("lostfound:update", updatedFound);
        // Broadcast match status update
        (0, index_js_1.broadcastUpdate)("itemmatch:update", {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to reject match suggestion" });
    }
});
router.put("/lostfound/matches/:matchId/handover", auth_js_1.authenticateToken, async (req, res) => {
    const { matchId } = req.params;
    const { collectedBy, verifiedBySecurity } = req.body;
    try {
        const match = await db_js_1.default.itemMatch.findUnique({
            where: { id: matchId },
            include: { lostReport: true, foundItem: true }
        });
        if (!match) {
            return res.status(404).json({ error: "Match not found" });
        }
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updatedMatch = await db_js_1.default.itemMatch.update({
            where: { id: matchId },
            data: {
                status: "Confirmed",
                collectionDate: new Date(),
                collectionTime: timeString,
                collectedBy: collectedBy || match.lostReport.residentId,
                verifiedBy: verifiedBySecurity || req.user.name || "Security"
            }
        });
        const updatedLost = await db_js_1.default.lostReport.update({
            where: { id: match.lostReportId },
            data: { status: "Returned" }
        });
        const updatedFound = await db_js_1.default.foundItem.update({
            where: { id: match.foundItemId },
            data: { status: "Returned" }
        });
        await sendInAppNotification(match.lostReport.residentId, "Item Returned Successfully", `Your lost item (${match.lostReport.itemName}) has been successfully handed over to you.`, "success");
        const lrUser = await db_js_1.default.user.findUnique({ where: { id: match.lostReport.residentId } });
        (0, index_js_1.broadcastUpdate)("lostreport:update", {
            ...updatedLost,
            residentName: lrUser?.name || "Resident",
            flatNumber: lrUser?.unit || "N/A"
        });
        (0, index_js_1.broadcastUpdate)("lostfound:update", updatedFound);
        (0, index_js_1.broadcastUpdate)("itemmatch:update", {
            ...updatedMatch,
            lostReport: {
                ...match.lostReport,
                residentName: lrUser?.name || "Resident",
                flatNumber: lrUser?.unit || "N/A"
            },
            foundItem: updatedFound
        });
        res.json({ success: true, match: updatedMatch });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to handover item" });
    }
});
// ==========================================
// 🏢 Flats Directory
// ==========================================
router.get("/flats", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.flatInfo.findMany();
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch flats list" });
    }
});
router.put("/flats/:id/resident", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { residentId, residentName } = req.body;
    try {
        const updated = await db_js_1.default.flatInfo.update({
            where: { id },
            data: {
                status: residentId ? "occupied" : "vacant",
                residentId,
                residentName
            }
        });
        (0, index_js_1.broadcastUpdate)("flat:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update flat resident" });
    }
});
// ==========================================
// 💰 Society Expenses
// ==========================================
router.get("/expenses", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.societyExpense.findMany();
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});
router.post("/expenses", auth_js_1.authenticateToken, async (req, res) => {
    const { category, vendor, amount, date, notes } = req.body;
    if (!category || !vendor || !amount || !date) {
        return res.status(400).json({ error: "Category, vendor, amount, and date are required" });
    }
    try {
        const id = `EXP-${Math.floor(100 + Math.random() * 900)}`;
        const newItem = await db_js_1.default.societyExpense.create({
            data: {
                id,
                category,
                vendor,
                amount: parseFloat(amount),
                date,
                notes
            }
        });
        (0, index_js_1.broadcastUpdate)("expense:update", newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to add expense" });
    }
});
// ==========================================
// 👥 Users Directory
// ==========================================
router.get("/users", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.user.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users list" });
    }
});
router.put("/users/services", auth_js_1.authenticateToken, async (req, res) => {
    const { specializations, availability } = req.body;
    try {
        const updated = await db_js_1.default.user.update({
            where: { id: req.user.id },
            data: {
                specializations: specializations || [],
                availability: availability || "Available"
            }
        });
        const copy = { ...updated };
        // @ts-ignore
        delete copy.password;
        (0, index_js_1.broadcastUpdate)("user:update", copy);
        res.json(copy);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update service profile" });
    }
});
router.put("/users/:id/status", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status, unit, building } = req.body;
    try {
        const dataToUpdate = {};
        if (status !== undefined)
            dataToUpdate.status = status;
        if (unit !== undefined)
            dataToUpdate.unit = unit;
        if (building !== undefined)
            dataToUpdate.building = building;
        const updated = await db_js_1.default.user.update({
            where: { id },
            data: dataToUpdate
        });
        const copy = { ...updated };
        // @ts-ignore
        delete copy.password;
        (0, index_js_1.broadcastUpdate)("user:update", copy);
        res.json(copy);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update user status" });
    }
});
router.post("/flats", auth_js_1.authenticateToken, async (req, res) => {
    const { building, wing, floor, flatNumber } = req.body;
    if (!building || !wing || !floor || !flatNumber) {
        return res.status(400).json({ error: "Building, wing, floor, and flat number are required" });
    }
    try {
        const id = `FL-${wing}${flatNumber}`;
        const newFlat = await db_js_1.default.flatInfo.create({
            data: {
                id,
                building,
                wing,
                floor: parseInt(floor),
                flatNumber,
                status: "vacant"
            }
        });
        (0, index_js_1.broadcastUpdate)("flat:update", newFlat);
        res.status(201).json(newFlat);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create flat" });
    }
});
// Facility Bookings
router.get("/facility-bookings", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const list = await db_js_1.default.facilityBooking.findMany();
        const mapped = list.map(b => ({
            id: b.id,
            facility: b.facilityName,
            userId: b.residentId,
            userName: b.residentName,
            unit: "A-204", // default fallback flat
            date: b.date,
            slot: b.timeSlot,
            status: b.status
        }));
        res.json(mapped);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch facility bookings" });
    }
});
router.post("/facility-bookings", auth_js_1.authenticateToken, async (req, res) => {
    const { facility, date, slot } = req.body;
    if (!facility || !date || !slot) {
        return res.status(400).json({ error: "Facility, date, and slot are required" });
    }
    try {
        const id = `FBK-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
        const newBooking = await db_js_1.default.facilityBooking.create({
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
            status: "booked"
        };
        (0, index_js_1.broadcastUpdate)("booking:update", mappedBooking);
        res.status(201).json(mappedBooking);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to book facility" });
    }
});
router.delete("/facility-bookings/:id", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db_js_1.default.facilityBooking.delete({ where: { id } });
        (0, index_js_1.broadcastUpdate)("booking:delete", { id });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to cancel booking" });
    }
});
router.delete("/marketplace/:id", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db_js_1.default.marketplaceItem.delete({ where: { id } });
        (0, index_js_1.broadcastUpdate)("marketplace:delete", { id });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete marketplace item" });
    }
});
exports.default = router;
