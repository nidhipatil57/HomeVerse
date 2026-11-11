import { Router } from "express";
import prisma from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { broadcastUpdate } from "../socket/index.js";

const router = Router();

const complaintInclude = {
  chat: { orderBy: { timestamp: "asc" as const } },
  timeline: { orderBy: { timestamp: "asc" as const } },
  subscribers: true
};

const NON_MANAGER_STATUSES = [
  "submitted",
  "under-review",
  "Under Secretary Review",
  "under secretary review",
  "Rejected",
  "rejected"
];

interface PendingNotif {
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

async function createComplaintNotifications(tx: any, items: PendingNotif[]) {
  const uniqueMap = new Map<string, PendingNotif>();
  for (const item of items) {
    if (item.userId && !uniqueMap.has(`${item.userId}:${item.title}`)) {
      uniqueMap.set(`${item.userId}:${item.title}`, item);
    }
  }
  const deduped = Array.from(uniqueMap.values());
  if (deduped.length === 0) return [];

  const targetIds = Array.from(new Set(deduped.map((i) => i.userId)));
  const existingUsers = await tx.user.findMany({
    where: { id: { in: targetIds } },
    select: { id: true }
  });
  const validUserIds = new Set(existingUsers.map((u: { id: string }) => u.id));

  const created = [];
  let idx = 0;
  for (const item of deduped) {
    if (!validUserIds.has(item.userId)) continue;
    const notif = await tx.notification.create({
      data: {
        id: `NTF-${Math.floor(100 + Math.random() * 900)}-${Date.now()}-${idx++}`,
        userId: item.userId,
        title: item.title,
        message: item.message,
        type: item.type
      }
    });
    created.push(notif);
  }
  return created;
}

// GET all complaints (role-scoped)
router.get("/", authenticateToken, async (req: any, res) => {
  try {
    const role = String(req.user.role || "").toLowerCase();
    const portal = String(req.user.portal || "society").toLowerCase();
    const id = req.user.id;
    let complaints;

    if (portal === "hostel") {
      if (role === "warden" || role === "admin") {
        complaints = await prisma.complaint.findMany({
          where: { portal: "hostel" },
          include: complaintInclude,
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
          include: complaintInclude,
          orderBy: { createdAt: "desc" }
        });
      }
    } else {
      // society
      if (role === "manager") {
        // Manager sees ONLY complaints forwarded by Secretary or already in operational/reopened/resolved workflow
        complaints = await prisma.complaint.findMany({
          where: {
            portal: "society",
            status: { notIn: NON_MANAGER_STATUSES }
          },
          include: complaintInclude,
          orderBy: { createdAt: "desc" }
        });
      } else if (role === "worker") {
        complaints = await prisma.complaint.findMany({
          where: { portal: "society", assignedToId: id },
          include: complaintInclude,
          orderBy: { createdAt: "desc" }
        });
      } else {
        // secretary / resident / security / admin sees society complaints
        complaints = await prisma.complaint.findMany({
          where: { portal: "society" },
          include: complaintInclude,
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

  if (!title?.trim() || !description?.trim() || !category?.trim()) {
    return res.status(400).json({ error: "Title, description, and category are required" });
  }

  try {
    const submitter = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, unit: true, building: true, portal: true, communityCode: true }
    });

    if (!submitter) {
      return res.status(401).json({ error: "Authenticated user account not found in database. Please re-login." });
    }

    const portal = submitter.portal || req.user.portal || "society";
    const resolvedName = submitter.name || req.user.name || "Resident";
    const resolvedUnit = (unit && String(unit).trim()) || submitter.unit || "N/A";
    const resolvedBuilding = (building && String(building).trim()) || (wing && String(wing).trim()) || submitter.building || "A Wing";

    // AI Diagnostics logic
    const categoryLower = String(category).toLowerCase();
    let predictedPriority = priority || "medium";
    if (
      !priority &&
      (categoryLower.includes("water") ||
        categoryLower.includes("leak") ||
        categoryLower.includes("lift") ||
        categoryLower.includes("fire") ||
        categoryLower.includes("security"))
    ) {
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

    const cleanTitle = String(title).trim();
    const cleanDescription = String(description).trim();
    const cleanCategory = String(category).trim();

    // Check duplicates
    const activeComplaints = await prisma.complaint.findMany({
      where: {
        portal,
        status: { notIn: ["closed", "resolved", "Rejected", "rejected"] },
        category: cleanCategory,
        building: resolvedBuilding
      }
    });

    let duplicateMatch = null;
    const descLower = cleanDescription.toLowerCase();
    for (const c of activeComplaints) {
      const matchWordCount = descLower.split(" ").filter((w: string) => w.length > 2 && c.description.toLowerCase().includes(w)).length;
      if (matchWordCount > 3) {
        duplicateMatch = c;
        break;
      }
    }

    const complaintId = `COMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await prisma.$transaction(async (tx) => {
      const createdComplaint = await tx.complaint.create({
        data: {
          id: complaintId,
          title: cleanTitle,
          description: cleanDescription,
          category: cleanCategory,
          priority: predictedPriority,
          raisedBy: submitter.id,
          raisedByName: resolvedName,
          unit: resolvedUnit,
          building: resolvedBuilding,
          status: "submitted",
          portal,
          emergency: Boolean(emergency),
          images: Array.isArray(images) ? images : [],
          videos: Array.isArray(videos) ? videos : [],
          isDuplicate: Boolean(duplicateMatch),
          possibleDuplicateOf: duplicateMatch ? duplicateMatch.id : null,
          duplicateGroup: [],
          timeline: {
            create: [
              {
                status: "submitted",
                note: `Complaint registered by ${resolvedName} (Flat ${resolvedUnit}, ${resolvedBuilding}) and queued for Secretary review.`,
                by: resolvedName
              }
            ]
          }
        },
        include: complaintInclude
      });

      if (duplicateMatch) {
        const parent = await tx.complaint.findUnique({ where: { id: duplicateMatch.id } });
        if (parent) {
          const currentGroup = parent.duplicateGroup || [];
          if (!currentGroup.includes(complaintId)) {
            await tx.complaint.update({
              where: { id: duplicateMatch.id },
              data: { duplicateGroup: [...currentGroup, complaintId] }
            });
          }
        }
      }

      // Notify Society Secretary / Hostel Warden dynamically (no hardcoded IDs)
      const reviewerRoles = portal === "hostel" ? ["warden", "admin"] : ["secretary", "admin"];
      let reviewers = await tx.user.findMany({
        where: {
          portal,
          role: { in: reviewerRoles },
          status: { notIn: ["rejected", "deactivated"] },
          ...(submitter.communityCode ? { communityCode: submitter.communityCode } : {})
        },
        select: { id: true }
      });

      if (reviewers.length === 0 && submitter.communityCode) {
        reviewers = await tx.user.findMany({
          where: {
            portal,
            role: { in: reviewerRoles },
            status: { notIn: ["rejected", "deactivated"] }
          },
          select: { id: true }
        });
      }

      const notifInputs: PendingNotif[] = [
        {
          userId: submitter.id,
          title: "Complaint Registered",
          message: `Your complaint "${cleanTitle}" (${complaintId}) has been submitted and is Under Review.`,
          type: "success"
        },
        ...reviewers.map((sec) => ({
          userId: sec.id,
          title: `New Complaint: ${cleanTitle}`,
          message: `${resolvedName} (Flat ${resolvedUnit}, ${resolvedBuilding}) submitted a ${cleanCategory} complaint (${complaintId}).`,
          type: "info" as const
        }))
      ];

      const notifications = await createComplaintNotifications(tx, notifInputs);
      return { createdComplaint, notifications };
    });

    const finalComplaint = {
      ...result.createdComplaint,
      aiAnalysis: {
        predictedPriority,
        suggestedCategory: cleanCategory,
        estimatedCompletion,
        requiredMaterials,
        expectedCost,
        possibleDuplicateOf: duplicateMatch ? duplicateMatch.id : undefined,
        isDuplicate: Boolean(duplicateMatch)
      }
    };

    broadcastUpdate("complaint:update", finalComplaint);
    result.notifications.forEach((n) => broadcastUpdate("notification:update", n));
    res.status(201).json(finalComplaint);
  } catch (error: any) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ error: error?.message || "Failed to create complaint" });
  }
});

// PUT update complaint status & optional fields (like priority or resident reopen)
router.put("/:id/status", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status, note, by, priority } = req.body;

  try {
    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const nextStatus = status !== undefined ? String(status) : existing.status;
      const dataToUpdate: any = {};
      if (status !== undefined) dataToUpdate.status = nextStatus;
      if (priority !== undefined) dataToUpdate.priority = priority;
      if (nextStatus.toLowerCase() === "completed" || nextStatus.toLowerCase() === "work completed") {
        dataToUpdate.completedAt = new Date();
      }
      if (nextStatus.toLowerCase() === "closed" || nextStatus.toLowerCase() === "resolved") {
        dataToUpdate.resolvedAt = new Date();
      }

      const updated = await tx.complaint.update({
        where: { id },
        data: {
          ...dataToUpdate,
          timeline: {
            create: [
              {
                status: nextStatus || "updated",
                note: note || `Complaint status updated to ${nextStatus}`,
                by: by || req.user.name || "System"
              }
            ]
          }
        },
        include: complaintInclude
      });

      const notifInputs: PendingNotif[] = [];
      if (nextStatus.toLowerCase() === "reopened") {
        const handlers = await tx.user.findMany({
          where: {
            portal: existing.portal,
            role: { in: existing.portal === "hostel" ? ["warden"] : ["manager", "secretary"] },
            status: { notIn: ["rejected", "deactivated"] }
          },
          select: { id: true }
        });
        for (const h of handlers) {
          notifInputs.push({
            userId: h.id,
            title: `Complaint Reopened: ${existing.title}`,
            message: `${req.user.name || existing.raisedByName} reopened complaint ${existing.id}: ${note || "Requested further help."}`,
            type: "warning"
          });
        }
      } else if (existing.raisedBy && req.user.id !== existing.raisedBy) {
        notifInputs.push({
          userId: existing.raisedBy,
          title: `Complaint Update: ${nextStatus}`,
          message: note || `Your complaint "${existing.title}" (${existing.id}) was updated to ${nextStatus}.`,
          type: nextStatus.toLowerCase() === "completed" ? "success" : "info"
        });
      }

      const notifications = await createComplaintNotifications(tx, notifInputs);
      return { updated, notifications };
    });

    broadcastUpdate("complaint:update", result.updated);
    result.notifications.forEach((n) => broadcastUpdate("notification:update", n));
    res.json(result.updated);
  } catch (error: any) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({ error: error?.message || "Failed to update complaint status" });
  }
});

// PUT assign worker to complaint
router.put("/:id/assign", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { assignedTo, assignedToId, note } = req.body;

  try {
    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Complaint not found" });
    }

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
      include: complaintInclude
    });

    broadcastUpdate("complaint:update", updated);
    res.json(updated);
  } catch (error: any) {
    console.error("Error assigning worker to complaint:", error);
    res.status(500).json({ error: error?.message || "Failed to assign worker" });
  }
});

// POST add message to complaint chat
router.post("/:id/chat", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Complaint not found" });
    }

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
      include: complaintInclude
    });

    broadcastUpdate("complaint:update", updatedComplaint);
    res.status(201).json(newMessage);
  } catch (error: any) {
    console.error("Error adding chat message:", error);
    res.status(500).json({ error: error?.message || "Failed to add chat message" });
  }
});

// POST subscribe resident to common board complaint
router.post("/:id/subscribe", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { userId, userName, unit } = req.body;

  try {
    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const subscription = await prisma.complaintSubscriber.create({
      data: {
        complaintId: id,
        userId: userId || req.user.id,
        userName: userName || req.user.name,
        unit: unit || "A-202"
      }
    });

    const updatedComplaint = await prisma.complaint.findUnique({
      where: { id },
      include: complaintInclude
    });

    broadcastUpdate("complaint:update", updatedComplaint);
    res.status(201).json(subscription);
  } catch (error: any) {
    console.error("Error subscribing to complaint:", error);
    res.status(500).json({ error: error?.message || "Failed to subscribe to complaint" });
  }
});

// PUT update ETA
router.put("/:id/eta", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { eta } = req.body;

  try {
    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        expectedArrival: eta,
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
      include: complaintInclude
    });

    broadcastUpdate("complaint:update", updated);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to update ETA" });
  }
});

// PUT rate and close complaint
router.put("/:id/rate", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { rating, review } = req.body;

  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
  }

  try {
    const comp = await prisma.complaint.findUnique({ where: { id } });
    if (!comp) return res.status(404).json({ error: "Complaint not found" });

    const roleLower = String(req.user.role || "").toLowerCase();
    if (comp.raisedBy !== req.user.id && !["secretary", "admin", "manager", "warden"].includes(roleLower)) {
      return res.status(403).json({ error: "Only the resident who raised this complaint can confirm and close it." });
    }

    const cleanReview = review ? String(review).trim() : "";

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.complaint.update({
        where: { id },
        data: {
          status: "closed",
          resolvedAt: new Date(),
          rating: Math.round(numericRating),
          ratingReview: cleanReview || null,
          timeline: {
            create: [
              {
                status: "closed",
                note: `Resident verified completion and closed ticket with ${numericRating}/5 rating. Review: ${cleanReview || "No review left."}`,
                by: req.user.name || comp.raisedByName
              }
            ]
          }
        },
        include: complaintInclude
      });

      // Update worker rating using real saved DB ratings
      if (comp.assignedToId) {
        const ratedComplaints = await tx.complaint.findMany({
          where: {
            assignedToId: comp.assignedToId,
            rating: { not: null }
          },
          select: { rating: true }
        });
        if (ratedComplaints.length > 0) {
          const sum = ratedComplaints.reduce((acc, item) => acc + (item.rating || 0), 0);
          const averageRating = sum / ratedComplaints.length;
          await tx.user.update({
            where: { id: comp.assignedToId },
            data: { rating: Number(averageRating.toFixed(2)) }
          });
        }
      }

      const notifTargets: PendingNotif[] = [];
      if (comp.managerId) {
        notifTargets.push({
          userId: comp.managerId,
          title: `Complaint Closed: ${comp.title}`,
          message: `${req.user.name || comp.raisedByName} confirmed resolution of ${comp.id} (${numericRating}★).`,
          type: "success"
        });
      }
      if (comp.assignedToId) {
        notifTargets.push({
          userId: comp.assignedToId,
          title: `Resident Feedback Received (${numericRating}★)`,
          message: `Complaint "${comp.title}" was closed by the resident. Review: ${cleanReview || "Confirmed satisfactory"}`,
          type: "success"
        });
      }

      const notifications = await createComplaintNotifications(tx, notifTargets);
      return { updated, notifications };
    });

    broadcastUpdate("complaint:update", result.updated);
    result.notifications.forEach((n) => broadcastUpdate("notification:update", n));
    res.json(result.updated);
  } catch (error: any) {
    console.error("Error rating complaint:", error);
    res.status(500).json({ error: error?.message || "Failed to rate complaint" });
  }
});

// POST merge duplicate complaints
router.post("/merge", authenticateToken, async (req: any, res) => {
  const { parentTicketId, duplicateTicketIds } = req.body;

  try {
    const parent = await prisma.complaint.findUnique({ where: { id: parentTicketId } });
    if (!parent) return res.status(404).json({ error: "Parent complaint not found" });

    const currentGroup = parent.duplicateGroup || [];
    const newGroup = Array.from(new Set([...currentGroup, ...(duplicateTicketIds || [])]));

    const updatedParent = await prisma.complaint.update({
      where: { id: parentTicketId },
      data: { duplicateGroup: newGroup },
      include: complaintInclude
    });

    for (const childId of duplicateTicketIds || []) {
      const updatedChild = await prisma.complaint.update({
        where: { id: childId },
        data: {
          status: "closed",
          resolvedAt: new Date(),
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
        include: complaintInclude
      });
      broadcastUpdate("complaint:update", updatedChild);
    }

    broadcastUpdate("complaint:update", updatedParent);
    res.json({ success: true, parent: updatedParent });
  } catch (error: any) {
    console.error("Error merging complaints:", error);
    res.status(500).json({ error: error?.message || "Failed to merge complaints" });
  }
});

// DELETE complaint
router.delete("/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    await prisma.complaint.delete({ where: { id } });
    broadcastUpdate("complaint:delete", { id });
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({ error: error?.message || "Failed to delete complaint" });
  }
});

// PUT secretary review (Forward to Manager OR Reject Complaint)
router.put("/:id/secretary-review", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status, priority, category, department, adminNotes, rejectReason } = req.body;

  try {
    const roleLower = String(req.user.role || "").toLowerCase();
    if (!["secretary", "warden", "admin"].includes(roleLower)) {
      return res.status(403).json({ error: "Access denied. Secretary/Administrative role required." });
    }

    const secretaryUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, portal: true, communityCode: true }
    });
    if (!secretaryUser) {
      return res.status(401).json({ error: "Secretary account not found in database. Please log in again." });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { raisedByUser: { select: { id: true, portal: true, communityCode: true, name: true } } }
    });
    if (!complaint) {
      return res.status(404).json({ error: `Complaint "${id}" not found in database.` });
    }

    // Society / portal authorization check
    if (secretaryUser.portal && complaint.portal && secretaryUser.portal.toLowerCase() !== complaint.portal.toLowerCase()) {
      return res.status(403).json({ error: "Access denied. Complaint belongs to another portal." });
    }
    if (
      secretaryUser.communityCode &&
      complaint.raisedByUser?.communityCode &&
      secretaryUser.communityCode !== complaint.raisedByUser.communityCode
    ) {
      return res.status(403).json({ error: "Access denied. Complaint belongs to another society." });
    }

    const isRejecting =
      String(status || "").toLowerCase() === "rejected" ||
      (rejectReason !== undefined && String(rejectReason).trim().length > 0);

    if (isRejecting && (!rejectReason || !String(rejectReason).trim())) {
      return res.status(400).json({ error: "Rejection reason is mandatory when rejecting a complaint." });
    }

    const currentStatusLower = String(complaint.status || "").toLowerCase();
    const reviewableStatuses = ["submitted", "under-review", "under secretary review", "reopened"];
    if (!reviewableStatuses.includes(currentStatusLower)) {
      return res.status(400).json({
        error: `Complaint cannot be reviewed in its current state ("${complaint.status}"). It has already been forwarded, rejected, or closed.`
      });
    }

    const cleanRejectReason = rejectReason ? String(rejectReason).trim() : "";
    const cleanAdminNotes = adminNotes ? String(adminNotes).trim() : "";
    const actualStatus = isRejecting ? "Rejected" : (status || "Forwarded to Manager");
    const actorName = secretaryUser.name || req.user.name || "Secretary";

    const result = await prisma.$transaction(async (tx) => {
      let managers: Array<{ id: string; name: string }> = [];
      if (!isRejecting) {
        const managerRole = complaint.portal === "hostel" ? "warden" : "manager";
        managers = await tx.user.findMany({
          where: {
            portal: complaint.portal,
            role: managerRole,
            status: { notIn: ["rejected", "deactivated"] },
            ...(secretaryUser.communityCode ? { communityCode: secretaryUser.communityCode } : {})
          },
          select: { id: true, name: true }
        });
        if (managers.length === 0 && secretaryUser.communityCode) {
          managers = await tx.user.findMany({
            where: {
              portal: complaint.portal,
              role: managerRole,
              status: { notIn: ["rejected", "deactivated"] }
            },
            select: { id: true, name: true }
          });
        }
      }

      const detailParts: string[] = [];
      if (priority) detailParts.push(`Priority: ${priority}`);
      if (department) detailParts.push(`Department: ${department}`);
      if (cleanAdminNotes) detailParts.push(`Notes: ${cleanAdminNotes}`);

      const timelineNote = isRejecting
        ? `Rejected by Secretary (${actorName}): ${cleanRejectReason}`
        : `Forwarded to Operations Manager by Secretary (${actorName}).${detailParts.length ? ` ${detailParts.join(". ")}.` : ""}`;

      const now = new Date();
      const updated = await tx.complaint.update({
        where: { id },
        data: {
          status: actualStatus,
          priority: priority || undefined,
          category: category || undefined,
          department: department || undefined,
          adminNotes: isRejecting ? cleanRejectReason : (cleanAdminNotes || complaint.adminNotes),
          ...(isRejecting
            ? {
                rejectedAt: now,
                rejectedBy: secretaryUser.id,
                rejectReason: cleanRejectReason
              }
            : {
                forwardedAt: now,
                forwardedBy: secretaryUser.id,
                forwardedByName: actorName,
                managerId: managers[0]?.id || null
              }),
          timeline: {
            create: [
              {
                status: actualStatus,
                note: timelineNote,
                by: actorName
              }
            ]
          }
        },
        include: complaintInclude
      });

      const notifTargets: PendingNotif[] = [
        {
          userId: complaint.raisedBy,
          title: isRejecting ? `Complaint Rejected: ${complaint.title}` : "Complaint Under Review — Forwarded to Manager",
          message: isRejecting
            ? `Your complaint (${complaint.id}) was rejected by the Secretary. Reason: ${cleanRejectReason}`
            : `Your complaint (${complaint.id}) has been verified by ${actorName} and forwarded to the Society Manager.`,
          type: isRejecting ? "error" : "success"
        }
      ];

      if (!isRejecting) {
        for (const mgr of managers) {
          notifTargets.push({
            userId: mgr.id,
            title: `Complaint Assigned for Operations: ${complaint.title}`,
            message: `${actorName} forwarded complaint ${complaint.id} (Flat ${complaint.unit}, ${complaint.building}, Priority: ${priority || complaint.priority}) for worker dispatch.`,
            type: "info"
          });
        }
      }

      const notifications = await createComplaintNotifications(tx, notifTargets);
      return { updated, notifications };
    });

    broadcastUpdate("complaint:update", result.updated);
    result.notifications.forEach((n) => broadcastUpdate("notification:update", n));

    res.json(result.updated);
  } catch (error: any) {
    console.error("Error updating secretary review:", error);
    res.status(500).json({ error: error?.message || "Failed to review complaint" });
  }
});

// PUT manager action (Assign Worker / Update Status / Mark Work Completed)
router.put("/:id/manager-action", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { status, assignedTo, assignedToId, expectedArrival, operationalNotes } = req.body;

  try {
    const roleLower = String(req.user.role || "").toLowerCase();
    if (!["manager", "warden", "admin"].includes(roleLower)) {
      return res.status(403).json({ error: "Access denied. Operations Manager role required." });
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const currentLower = String(complaint.status || "").toLowerCase();
    if (["submitted", "under-review", "under secretary review", "rejected"].includes(currentLower)) {
      return res.status(400).json({
        error: `Complaint is currently "${complaint.status}" and must be forwarded by the Secretary before Manager action.`
      });
    }
    if (["closed", "resolved"].includes(currentLower)) {
      return res.status(400).json({ error: "Closed complaints cannot be modified by Manager." });
    }

    const nextStatus = status || complaint.status;
    const isMarkingCompleted = ["completed", "work completed"].includes(String(nextStatus).toLowerCase());
    const cleanOpsNotes = operationalNotes ? String(operationalNotes).trim() : "";
    const actorName = req.user.name || "Manager";

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.complaint.update({
        where: { id },
        data: {
          status: nextStatus || undefined,
          managerId: complaint.managerId || req.user.id,
          assignedTo: assignedTo || undefined,
          assignedToId: assignedToId || undefined,
          expectedArrival: expectedArrival || undefined,
          operationalNotes: cleanOpsNotes || undefined,
          completedAt: isMarkingCompleted ? new Date() : undefined,
          timeline: {
            create: [
              {
                status: nextStatus || "Worker Being Coordinated",
                note:
                  cleanOpsNotes ||
                  `Manager (${actorName}) updated status to ${nextStatus}.${assignedTo ? ` Worker: ${assignedTo}.` : ""}${expectedArrival ? ` ETA: ${expectedArrival}.` : ""}`,
                by: actorName
              }
            ]
          }
        },
        include: complaintInclude
      });

      const notifTargets: PendingNotif[] = [
        {
          userId: complaint.raisedBy,
          title: isMarkingCompleted
            ? `Work Completed — Please Confirm & Rate`
            : `Complaint Progress: ${nextStatus}`,
          message: isMarkingCompleted
            ? `Manager marked "${complaint.title}" (${complaint.id}) as Completed. Please verify and confirm resolution.`
            : `Your complaint "${complaint.title}" is now ${nextStatus}.${assignedTo ? ` Assigned technician: ${assignedTo}.` : ""}${expectedArrival ? ` ETA: ${expectedArrival}.` : ""}`,
          type: isMarkingCompleted ? "success" : "info"
        }
      ];

      const effectiveWorkerId = assignedToId || complaint.assignedToId;
      if (effectiveWorkerId && !isMarkingCompleted) {
        notifTargets.push({
          userId: effectiveWorkerId,
          title: `New Work Dispatch: ${complaint.title}`,
          message: `You were assigned to Flat ${complaint.unit} (${complaint.building}). ETA: ${expectedArrival || complaint.expectedArrival || "ASAP"}. ${cleanOpsNotes}`,
          type: "info"
        });
      }

      const notifications = await createComplaintNotifications(tx, notifTargets);
      return { updated, notifications };
    });

    broadcastUpdate("complaint:update", result.updated);
    result.notifications.forEach((n) => broadcastUpdate("notification:update", n));

    res.json(result.updated);
  } catch (error: any) {
    console.error("Error updating manager action:", error);
    res.status(500).json({ error: error?.message || "Failed to update complaint" });
  }
});

export default router;
