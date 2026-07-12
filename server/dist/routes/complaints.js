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
// GET all complaints (role-scoped)
router.get("/", auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { role, portal, id } = req.user;
        let complaints;
        if (portal === "hostel") {
            if (role === "warden") {
                complaints = await db_js_1.default.complaint.findMany({
                    where: { portal: "hostel" },
                    include: { chat: true, timeline: true, subscribers: true }
                });
            }
            else {
                // student: own or subscribed
                complaints = await db_js_1.default.complaint.findMany({
                    where: {
                        portal: "hostel",
                        OR: [
                            { raisedBy: id },
                            { subscribers: { some: { userId: id } } }
                        ]
                    },
                    include: { chat: true, timeline: true, subscribers: true }
                });
            }
        }
        else {
            // society
            if (role === "secretary") {
                complaints = await db_js_1.default.complaint.findMany({
                    where: { portal: "society" },
                    include: { chat: true, timeline: true, subscribers: true }
                });
            }
            else if (role === "worker") {
                complaints = await db_js_1.default.complaint.findMany({
                    where: { portal: "society", assignedToId: id },
                    include: { chat: true, timeline: true, subscribers: true }
                });
            }
            else {
                // resident/security sees all society complaints
                complaints = await db_js_1.default.complaint.findMany({
                    where: { portal: "society" },
                    include: { chat: true, timeline: true, subscribers: true }
                });
            }
        }
        res.json(complaints);
    }
    catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ error: "Failed to fetch complaints" });
    }
});
// POST raise new complaint
router.post("/", auth_js_1.authenticateToken, async (req, res) => {
    const { title, description, category, priority, unit, building, wing, emergency, images, videos } = req.body;
    if (!title || !description || !category) {
        return res.status(400).json({ error: "Title, description, and category are required" });
    }
    try {
        const { id: userId, portal } = req.user;
        let resolvedName = req.user.name;
        if (!resolvedName) {
            const userRecord = await db_js_1.default.user.findUnique({ where: { id: userId } });
            resolvedName = userRecord?.name || "Resident";
        }
        // AI Diagnostics logic
        const categoryLower = category.toLowerCase();
        let predictedPriority = priority || "medium";
        if (categoryLower.includes("water") || categoryLower.includes("leak") || categoryLower.includes("lift") || categoryLower.includes("fire") || categoryLower.includes("security")) {
            predictedPriority = "high";
        }
        if (emergency) {
            predictedPriority = "emergency";
        }
        const estimatedCompletion = predictedPriority === "high" || predictedPriority === "emergency" ? "4-12 Hours" : "24-48 Hours";
        let requiredMaterials = [];
        let expectedCost = "₹0";
        if (categoryLower.includes("plumbing")) {
            requiredMaterials = ["Teflon Tape", "PVC Gasket", "Pipe Sealant"];
            expectedCost = "₹150";
        }
        else if (categoryLower.includes("electric")) {
            requiredMaterials = ["Insulation Tape", "5A Fuse Wire", "Tester Switch"];
            expectedCost = "₹50";
        }
        else if (categoryLower.includes("lift")) {
            requiredMaterials = ["Control Relay Board", "Lubricant Spray"];
            expectedCost = "₹1,200";
        }
        // Check duplicates
        const activeComplaints = await db_js_1.default.complaint.findMany({
            where: {
                portal,
                status: { notIn: ["closed", "resolved"] },
                category,
                building
            }
        });
        let duplicateMatch = null;
        const descLower = description.toLowerCase();
        for (const c of activeComplaints) {
            const matchWordCount = descLower.split(" ").filter((w) => c.description.toLowerCase().includes(w)).length;
            if (matchWordCount > 3) {
                duplicateMatch = c;
                break;
            }
        }
        const complaintId = `COMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newComplaint = await db_js_1.default.complaint.create({
            data: {
                id: complaintId,
                title,
                description,
                category,
                priority: predictedPriority,
                raisedBy: userId,
                raisedByName: resolvedName,
                unit: unit || "A-204",
                building: building || "Tower A",
                status: "submitted",
                portal,
                emergency: emergency || false,
                images: images || [],
                videos: videos || [],
                isDuplicate: duplicateMatch ? true : false,
                possibleDuplicateOf: duplicateMatch ? duplicateMatch.id : null,
                duplicateGroup: [],
                timeline: {
                    create: [
                        {
                            status: "submitted",
                            note: "Complaint registered successfully and AI diagnostics compiled.",
                            by: "System"
                        }
                    ]
                }
            },
            include: { chat: true, timeline: true, subscribers: true }
        });
        // If duplicate was found, link to the parent's group
        if (duplicateMatch) {
            const parent = await db_js_1.default.complaint.findUnique({ where: { id: duplicateMatch.id } });
            if (parent) {
                const currentGroup = parent.duplicateGroup || [];
                if (!currentGroup.includes(complaintId)) {
                    await db_js_1.default.complaint.update({
                        where: { id: duplicateMatch.id },
                        data: { duplicateGroup: [...currentGroup, complaintId] }
                    });
                }
            }
        }
        // Add extra calculated properties for the response
        const finalComplaint = {
            ...newComplaint,
            aiAnalysis: {
                predictedPriority,
                suggestedCategory: category,
                estimatedCompletion,
                requiredMaterials,
                expectedCost,
                possibleDuplicateOf: duplicateMatch ? duplicateMatch.id : undefined,
                isDuplicate: duplicateMatch ? true : false
            }
        };
        (0, index_js_1.broadcastUpdate)("complaint:update", finalComplaint);
        res.status(201).json(finalComplaint);
    }
    catch (error) {
        console.error("Error creating complaint:", error);
        res.status(500).json({ error: "Failed to create complaint" });
    }
});
// PUT update complaint status & optional fields (like priority)
router.put("/:id/status", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status, note, by, priority } = req.body;
    try {
        const dataToUpdate = {};
        if (status !== undefined)
            dataToUpdate.status = status;
        if (priority !== undefined)
            dataToUpdate.priority = priority;
        const updated = await db_js_1.default.complaint.update({
            where: { id },
            data: {
                ...dataToUpdate,
                timeline: {
                    create: [
                        {
                            status: status || "updated",
                            note: note || `Complaint updated`,
                            by: by || req.user.name
                        }
                    ]
                }
            },
            include: { chat: true, timeline: true, subscribers: true }
        });
        (0, index_js_1.broadcastUpdate)("complaint:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating complaint status:", error);
        res.status(500).json({ error: "Failed to update complaint status" });
    }
});
// PUT assign worker to complaint
router.put("/:id/assign", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { assignedTo, assignedToId, note } = req.body;
    try {
        const updated = await db_js_1.default.complaint.update({
            where: { id },
            data: {
                assignedTo,
                assignedToId,
                status: "assigned",
                timeline: {
                    create: [
                        {
                            status: "assigned",
                            note: note || `Assigned to worker ${assignedTo}`,
                            by: req.user.name
                        }
                    ]
                }
            },
            include: { chat: true, timeline: true, subscribers: true }
        });
        (0, index_js_1.broadcastUpdate)("complaint:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error("Error assigning worker to complaint:", error);
        res.status(500).json({ error: "Failed to assign worker" });
    }
});
// POST add message to complaint chat
router.post("/:id/chat", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }
    try {
        const newMessage = await db_js_1.default.complaintChatMessage.create({
            data: {
                complaintId: id,
                senderId: req.user.id,
                senderName: req.user.name || "Guest User",
                senderRole: req.user.role || "resident",
                message: message.trim()
            }
        });
        const updatedComplaint = await db_js_1.default.complaint.findUnique({
            where: { id },
            include: { chat: true, timeline: true, subscribers: true }
        });
        (0, index_js_1.broadcastUpdate)("complaint:update", updatedComplaint);
        res.status(201).json(newMessage);
    }
    catch (error) {
        console.error("Error adding chat message:", error);
        res.status(500).json({ error: "Failed to add chat message" });
    }
});
// POST subscribe resident to common board complaint
router.post("/:id/subscribe", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId, userName, unit } = req.body;
    try {
        const subscription = await db_js_1.default.complaintSubscriber.create({
            data: {
                complaintId: id,
                userId: userId || req.user.id,
                userName: userName || req.user.name,
                unit: unit || "A-301"
            }
        });
        const updatedComplaint = await db_js_1.default.complaint.findUnique({
            where: { id },
            include: { chat: true, timeline: true, subscribers: true }
        });
        (0, index_js_1.broadcastUpdate)("complaint:update", updatedComplaint);
        res.status(201).json(subscription);
    }
    catch (error) {
        console.error("Error subscribing to complaint:", error);
        res.status(500).json({ error: "Failed to subscribe to complaint" });
    }
});
// PUT update ETA
router.put("/:id/eta", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { eta } = req.body;
    try {
        const updated = await db_js_1.default.complaint.update({
            where: { id },
            data: {
                timeline: {
                    create: [
                        {
                            status: "in-progress",
                            note: `Estimated completion update: ${eta}`,
                            by: req.user.name
                        }
                    ]
                }
            },
            include: { chat: true, timeline: true, subscribers: true }
        });
        (0, index_js_1.broadcastUpdate)("complaint:update", updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update ETA" });
    }
});
// PUT rate and close complaint
router.put("/:id/rate", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { rating, review } = req.body;
    try {
        const comp = await db_js_1.default.complaint.findUnique({ where: { id } });
        if (!comp)
            return res.status(404).json({ error: "Complaint not found" });
        const updated = await db_js_1.default.complaint.update({
            where: { id },
            data: {
                status: "closed",
                resolvedAt: new Date(),
                timeline: {
                    create: [
                        {
                            status: "closed",
                            note: `Resident closed the ticket and rated it ${rating} stars. Review: ${review || "No review left."}`,
                            by: req.user.name
                        }
                    ]
                }
            },
            include: { chat: true, timeline: true, subscribers: true }
        });
        // Update worker rating if worker is assigned
        if (comp.assignedToId) {
            const allComplaints = await db_js_1.default.complaint.findMany({
                where: { assignedToId: comp.assignedToId }
            });
            const rated = allComplaints.filter(c => c.resolvedAt !== null && c.id !== id);
            const totalRatings = rated.length + 1;
            const sumRatings = rated.reduce((sum, r) => sum + 5, 0) + rating;
            const averageRating = sumRatings / totalRatings;
            await db_js_1.default.user.update({
                where: { id: comp.assignedToId },
                data: { rating: Number(averageRating.toFixed(2)) }
            });
        }
        (0, index_js_1.broadcastUpdate)("complaint:update", updated);
        res.json(updated);
    }
    catch (error) {
        console.error("Error rating complaint:", error);
        res.status(500).json({ error: "Failed to rate complaint" });
    }
});
// POST merge duplicate complaints
router.post("/merge", auth_js_1.authenticateToken, async (req, res) => {
    const { parentTicketId, duplicateTicketIds } = req.body;
    try {
        const parent = await db_js_1.default.complaint.findUnique({ where: { id: parentTicketId } });
        if (!parent)
            return res.status(404).json({ error: "Parent complaint not found" });
        const currentGroup = parent.duplicateGroup || [];
        const newGroup = Array.from(new Set([...currentGroup, ...duplicateTicketIds]));
        const updatedParent = await db_js_1.default.complaint.update({
            where: { id: parentTicketId },
            data: { duplicateGroup: newGroup },
            include: { chat: true, timeline: true, subscribers: true }
        });
        for (const childId of duplicateTicketIds) {
            const updatedChild = await db_js_1.default.complaint.update({
                where: { id: childId },
                data: {
                    status: "closed",
                    timeline: {
                        create: [
                            {
                                status: "closed",
                                note: `Ticket marked as duplicate and merged under parent ticket: ${parentTicketId}`,
                                by: req.user.name
                            }
                        ]
                    }
                },
                include: { chat: true, timeline: true, subscribers: true }
            });
            (0, index_js_1.broadcastUpdate)("complaint:update", updatedChild);
        }
        (0, index_js_1.broadcastUpdate)("complaint:update", updatedParent);
        res.json({ success: true, parent: updatedParent });
    }
    catch (error) {
        console.error("Error merging complaints:", error);
        res.status(500).json({ error: "Failed to merge complaints" });
    }
});
// DELETE complaint
router.delete("/:id", auth_js_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db_js_1.default.complaint.delete({ where: { id } });
        (0, index_js_1.broadcastUpdate)("complaint:delete", { id });
        res.json({ success: true });
    }
    catch (error) {
        console.error("Error deleting complaint:", error);
        res.status(500).json({ error: "Failed to delete complaint" });
    }
});
exports.default = router;
