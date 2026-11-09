import { Router } from "express";
import prisma from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { broadcastUpdate } from "../socket/index.js";

const router = Router();

// GET all complaints (role-scoped)
router.get("/", authenticateToken, async (req: any, res) => {
  try {
    const { role, portal, id } = req.user;
    let complaints;

    if (portal === "hostel") {
      if (role === "warden") {
        complaints = await prisma.complaint.findMany({
          where: { portal: "hostel" },
          include: { chat: true, timeline: true, subscribers: true },
          orderBy: { createdAt: "desc" }
        });
      } else {
        // student: own or subscribed
        complaints = await prisma.complaint.findMany({
          where: {
            portal: "hostel",
            OR: [
              { raisedBy: id },
              { subscribers: { some: { userId: id } } }
            ]
          },
          include: { chat: true, timeline: true, subscribers: true },
          orderBy: { createdAt: "desc" }
        });
      }
    } else {
      // society
      if (role === "secretary" || role === "manager") {
        complaints = await prisma.complaint.findMany({
          where: { portal: "society" },
          include: { chat: true, timeline: true, subscribers: true },
          orderBy: { createdAt: "desc" }
        });
      } else if (role === "worker") {
        complaints = await prisma.complaint.findMany({
          where: { portal: "society", assignedToId: id },
          include: { chat: true, timeline: true, subscribers: true },
          orderBy: { createdAt: "desc" }
        });
      } else {
        // resident/security sees all society complaints
        complaints = await prisma.complaint.findMany({
          where: { portal: "society" },
          include: { chat: true, timeline: true, subscribers: true },
          orderBy: { createdAt: "desc" }
        });
      }
    }
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// POST raise new complaint
router.post("/", authenticateToken, async (req: any, res) => {
  const { title, description, category, priority, unit, building, wing, emergency, images, videos } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ error: "Title, description, and category are required" });
  }

  try {
    const { id: userId, portal } = req.user;
    let resolvedName = req.user.name;
    if (!resolvedName) {
      const userRecord = await prisma.user.findUnique({ where: { id: userId } });
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
    let requiredMaterials: string[] = [];
    let expectedCost = "₹0";

    if (categoryLower.includes("plumbing")) {
      requiredMaterials = ["Teflon Tape", "PVC Gasket", "Pipe Sealant"];
      expectedCost = "₹150";
    } else if (categoryLower.includes("electric")) {
      requiredMaterials = ["Insulation Tape", "5A Fuse Wire", "Tester Switch"];
      expectedCost = "₹50";
    } else if (categoryLower.includes("lift")) {
      requiredMaterials = ["Control Relay Board", "Lubricant Spray"];
      expectedCost = "₹1,200";
    }

    // Check duplicates
    const activeComplaints = await prisma.complaint.findMany({
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
      const matchWordCount = descLower.split(" ").filter((w: string) => c.description.toLowerCase().includes(w)).length;
      if (matchWordCount > 3) {
        duplicateMatch = c;
        break;
      }
    }

    const complaintId = `COMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newComplaint = await prisma.complaint.create({
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
      const parent = await prisma.complaint.findUnique({ where: { id: duplicateMatch.id } });
      if (parent) {
        const currentGroup = parent.duplicateGroup || [];
        if (!currentGroup.includes(complaintId)) {
          await prisma.complaint.update({
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

    broadcastUpdate("complaint:update", finalComplaint);
    res.status(201).json(finalComplaint);
  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ error: "Failed to create complaint" });
  }
});

// PUT update complaint status & optional fields (like priority)
router.put("/:id/status", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status, note, by, priority } = req.body;

  try {
    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (priority !== undefined) dataToUpdate.priority = priority;

    const updated = await prisma.complaint.update({
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

    broadcastUpdate("complaint:update", updated);
    res.json(updated);
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({ error: "Failed to update complaint status" });
  }
});

// PUT assign worker to complaint
router.put("/:id/assign", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { assignedTo, assignedToId, note } = req.body;

  try {
    const updated = await prisma.complaint.update({
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

    broadcastUpdate("complaint:update", updated);
    res.json(updated);
  } catch (error) {
    console.error("Error assigning worker to complaint:", error);
    res.status(500).json({ error: "Failed to assign worker" });
  }
});

// POST add message to complaint chat
router.post("/:id/chat", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const newMessage = await prisma.complaintChatMessage.create({
      data: {
        complaintId: id,
        senderId: req.user.id,
        senderName: req.user.name || "Guest User",
        senderRole: req.user.role || "resident",
        message: message.trim()
      }
    });

    const updatedComplaint = await prisma.complaint.findUnique({
      where: { id },
      include: { chat: true, timeline: true, subscribers: true }
    });

    broadcastUpdate("complaint:update", updatedComplaint);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error adding chat message:", error);
    res.status(500).json({ error: "Failed to add chat message" });
  }
});

// POST subscribe resident to common board complaint
router.post("/:id/subscribe", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { userId, userName, unit } = req.body;

  try {
    const subscription = await prisma.complaintSubscriber.create({
      data: {
        complaintId: id,
        userId: userId || req.user.id,
        userName: userName || req.user.name,
        unit: unit || "A-301"
      }
    });

    const updatedComplaint = await prisma.complaint.findUnique({
      where: { id },
      include: { chat: true, timeline: true, subscribers: true }
    });

    broadcastUpdate("complaint:update", updatedComplaint);
    res.status(201).json(subscription);
  } catch (error) {
    console.error("Error subscribing to complaint:", error);
    res.status(500).json({ error: "Failed to subscribe to complaint" });
  }
});

// PUT update ETA
router.put("/:id/eta", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { eta } = req.body;

  try {
    const updated = await prisma.complaint.update({
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

    broadcastUpdate("complaint:update", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update ETA" });
  }
});

// PUT rate and close complaint
router.put("/:id/rate", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { rating, review } = req.body;

  try {
    const comp = await prisma.complaint.findUnique({ where: { id } });
    if (!comp) return res.status(404).json({ error: "Complaint not found" });

    const updated = await prisma.complaint.update({
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
      const allComplaints = await prisma.complaint.findMany({
        where: { assignedToId: comp.assignedToId }
      });
      const rated = allComplaints.filter(c => c.resolvedAt !== null && c.id !== id);
      const totalRatings = rated.length + 1;
      const sumRatings = rated.reduce((sum, r) => sum + 5, 0) + rating;
      const averageRating = sumRatings / totalRatings;

      await prisma.user.update({
        where: { id: comp.assignedToId },
        data: { rating: Number(averageRating.toFixed(2)) }
      });
    }

    broadcastUpdate("complaint:update", updated);
    res.json(updated);
  } catch (error) {
    console.error("Error rating complaint:", error);
    res.status(500).json({ error: "Failed to rate complaint" });
  }
});

// POST merge duplicate complaints
router.post("/merge", authenticateToken, async (req: any, res) => {
  const { parentTicketId, duplicateTicketIds } = req.body;

  try {
    const parent = await prisma.complaint.findUnique({ where: { id: parentTicketId } });
    if (!parent) return res.status(404).json({ error: "Parent complaint not found" });

    const currentGroup = parent.duplicateGroup || [];
    const newGroup = Array.from(new Set([...currentGroup, ...duplicateTicketIds]));

    const updatedParent = await prisma.complaint.update({
      where: { id: parentTicketId },
      data: { duplicateGroup: newGroup },
      include: { chat: true, timeline: true, subscribers: true }
    });

    for (const childId of duplicateTicketIds) {
      const updatedChild = await prisma.complaint.update({
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
      broadcastUpdate("complaint:update", updatedChild);
    }

    broadcastUpdate("complaint:update", updatedParent);
    res.json({ success: true, parent: updatedParent });
  } catch (error) {
    console.error("Error merging complaints:", error);
    res.status(500).json({ error: "Failed to merge complaints" });
  }
});

// DELETE complaint
router.delete("/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    await prisma.complaint.delete({ where: { id } });
    broadcastUpdate("complaint:delete", { id });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({ error: "Failed to delete complaint" });
  }
});

// PUT secretary review
router.put("/:id/secretary-review", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status, priority, category, department, adminNotes, rejectReason } = req.body;

  try {
    if (req.user.role !== "secretary" && req.user.role !== "warden") {
      return res.status(403).json({ error: "Access denied. Administrative role required." });
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const actualStatus = status || (rejectReason ? "Rejected" : "Verified");

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status: actualStatus,
        priority: priority || undefined,
        category: category || undefined,
        department: department || undefined,
        adminNotes: adminNotes || rejectReason || undefined,
        timeline: {
          create: [
            {
              status: actualStatus,
              note: rejectReason ? `Rejected by Secretary: ${rejectReason}` : `Verified & approved by Secretary. Priority: ${priority}. Assigned Department: ${department}.`,
              by: req.user.name || "Secretary"
            }
          ]
        }
      },
      include: { chat: true, timeline: true, subscribers: true }
    });

    // Create Notification for the resident who raised it
    const notifId = `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    await prisma.notification.create({
      data: {
        id: notifId,
        userId: complaint.raisedBy,
        title: `Complaint Update: ${actualStatus}`,
        message: rejectReason ? `Your complaint was rejected: ${rejectReason}` : `Your complaint has been verified and forwarded to the operations manager.`,
        type: rejectReason ? "error" : "success"
      }
    });

    broadcastUpdate("complaint:update", updated);
    broadcastUpdate("notification:update", { userId: complaint.raisedBy });

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating secretary review:", error);
    res.status(500).json({ error: "Failed to update complaint: " + error.message });
  }
});

// PUT manager action
router.put("/:id/manager-action", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status, assignedTo, assignedToId, expectedArrival, operationalNotes } = req.body;

  try {
    if (req.user.role !== "manager" && req.user.role !== "warden") {
      return res.status(403).json({ error: "Access denied. Operational role required." });
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status: status || undefined,
        assignedTo: assignedTo || undefined,
        assignedToId: assignedToId || undefined,
        expectedArrival: expectedArrival || undefined,
        operationalNotes: operationalNotes || undefined,
        resolvedAt: status === "Completed" ? new Date() : undefined,
        timeline: {
          create: [
            {
              status: status || "Worker Being Coordinated",
              note: operationalNotes || `Manager updated progress. Worker: ${assignedTo || "Coordinated"}. Expected Arrival: ${expectedArrival || "N/A"}.`,
              by: req.user.name || "Manager"
            }
          ]
        }
      },
      include: { chat: true, timeline: true, subscribers: true }
    });

    // Create Notification for the resident
    const notifId = `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`;
    await prisma.notification.create({
      data: {
        id: notifId,
        userId: complaint.raisedBy,
        title: `Complaint Progress: ${status}`,
        message: `Manager updated your complaint status to ${status}. Details: ${operationalNotes || "N/A"}`,
        type: status === "Completed" ? "success" : "info"
      }
    });

    broadcastUpdate("complaint:update", updated);
    broadcastUpdate("notification:update", { userId: complaint.raisedBy });

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating manager action:", error);
    res.status(500).json({ error: "Failed to update complaint: " + error.message });
  }
});

export default router;
