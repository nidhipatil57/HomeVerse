import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getInitialDb } from "./seed-data.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning database tables...");

  // Delete in reverse order of relationships
  await prisma.complaintTimeline.deleteMany();
  await prisma.complaintChatMessage.deleteMany();
  await prisma.complaintSubscriber.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.eventRsvp.deleteMany();
  await prisma.communityEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.roommatePreference.deleteMany();
  await prisma.facilityBooking.deleteMany();
  await prisma.gatePass.deleteMany();
  await prisma.residentWorkerAssignment.deleteMany();
  await prisma.user.deleteMany();
  
  await prisma.leaveRequest.deleteMany();
  await prisma.visitor.deleteMany();
  await prisma.laundrySlot.deleteMany();
  await prisma.parcel.deleteMany();
  await prisma.marketplaceItem.deleteMany();
  await prisma.itemMatch.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.foundItem.deleteMany();
  await prisma.lostReport.deleteMany();
  await prisma.roomChangeRequest.deleteMany();
  await prisma.maintenanceBill.deleteMany();
  await prisma.emergencyAlert.deleteMany();
  await prisma.vehicleLog.deleteMany();
  await prisma.incidentReport.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.flatInfo.deleteMany();
  await prisma.rentRecord.deleteMany();
  await prisma.favoriteVisitor.deleteMany();
  await prisma.helper.deleteMany();
  await prisma.helperAttendance.deleteMany();
  await prisma.flatAttendance.deleteMany();
  await prisma.societyExpense.deleteMany();

  console.log("🌱 Fetching mock database seed records...");
  const db = getInitialDb();

  console.log("👤 Seeding Users...");
  for (const u of db.users) {
    const hashedPassword = bcrypt.hashSync(u.password || "Password@123", 10);
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        portal: u.portal,
        unit: u.unit,
        building: u.building,
        societyName: u.societyName,
        hostelName: u.hostelName,
        collegeName: u.collegeName,
        communityCode: u.communityCode,
        ownerOrTenant: u.ownerOrTenant,
        joinedAt: u.joinedAt,
        status: u.status || "approved",
        password: hashedPassword,
        designation: u.designation,
        committeeId: u.committeeId,
        employeeId: u.employeeId,
        workingShift: u.workingShift,
        gate: u.gate,
        gender: u.gender,
        course: u.course,
        year: u.year,
        branch: u.branch,
        assignedWing: u.assignedWing,
        workerCategory: u.workerCategory,
        availability: u.availability,
        rating: u.rating,
        experience: u.experience,
        specializations: u.specializations || []
      }
    });
  }

  console.log("📋 Seeding Complaints...");
  for (const c of db.complaints) {
    // Make sure raisedBy exists in User
    const raisedByUserExists = await prisma.user.findUnique({ where: { id: c.raisedBy } });
    if (!raisedByUserExists) {
      console.warn(`⚠️ Warning: raisedBy user ${c.raisedBy} not found for complaint ${c.id}. Skipping.`);
      continue;
    }

    // Check if worker exists
    let assignedToIdVal: string | null = null;
    if (c.assignedToId) {
      const workerExists = await prisma.user.findUnique({ where: { id: c.assignedToId } });
      if (workerExists) {
        assignedToIdVal = c.assignedToId;
      }
    }

    await prisma.complaint.create({
      data: {
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        priority: c.priority,
        raisedBy: c.raisedBy,
        raisedByName: c.raisedByName,
        unit: c.unit,
        building: c.building,
        status: c.status,
        portal: c.portal,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt || c.createdAt),
        emergency: c.emergency || false,
        images: c.images || [],
        videos: c.videos || [],
        resolvedAt: c.resolvedAt ? new Date(c.resolvedAt) : null,
        assignedTo: c.assignedTo,
        assignedToId: assignedToIdVal,
        duplicateGroup: c.duplicateGroup || [],
        isDuplicate: c.aiAnalysis?.isDuplicate || false,
        possibleDuplicateOf: c.aiAnalysis?.possibleDuplicateOf,
        timeline: {
          create: (c.timeline || []).map((t: any) => ({
            status: t.status,
            timestamp: new Date(t.timestamp),
            note: t.note,
            by: t.by
          }))
        },
        chat: {
          create: (c.chat || []).map((m: any) => ({
            senderId: m.senderId,
            senderName: m.senderName,
            senderRole: m.senderRole,
            message: m.message,
            timestamp: new Date(m.timestamp || Date.now())
          }))
        }
      }
    });
  }

  console.log("✈️ Seeding Leave Requests...");
  for (const lr of db.leaveRequests) {
    await prisma.leaveRequest.create({
      data: {
        id: lr.id,
        studentId: lr.studentId,
        studentName: lr.studentName,
        room: lr.room,
        parentContact: lr.parentContact,
        reason: lr.reason,
        fromDate: lr.fromDate,
        toDate: lr.toDate,
        status: lr.status,
        createdAt: new Date(lr.createdAt)
      }
    });
  }

  console.log("🚪 Seeding Visitors...");
  for (const v of db.visitors) {
    await prisma.visitor.create({
      data: {
        id: v.id,
        name: v.name,
        phone: v.phone,
        purpose: v.purpose,
        visitingUnit: v.visitingUnit,
        visitingResident: v.visitingResident,
        visitingResidentId: v.visitingResidentId,
        status: v.status,
        expectedAt: v.expectedAt,
        checkInTime: v.checkInTime,
        checkOutTime: v.checkOutTime,
        date: v.date,
        portal: v.portal,
        approvedBy: v.approvedBy,
        vehicleNumber: v.vehicleNumber
      }
    });
  }

  console.log("🧺 Seeding Laundry Slots...");
  for (const ls of db.laundrySlots) {
    await prisma.laundrySlot.create({
      data: {
        id: ls.id,
        machineId: ls.machineId,
        machineName: ls.machineName,
        date: ls.date,
        timeSlot: ls.slot,
        bookedBy: ls.bookedByName || null,
        bookedById: ls.bookedBy || null,
        communityCode: ls.communityCode || "VESIT26"
      }
    });
  }

  console.log("📦 Seeding Parcels...");
  for (const p of db.parcels) {
    const receivedDate = p.receivedAt ? p.receivedAt.split("T")[0] : new Date().toISOString().split("T")[0];
    const receivedTime = p.receivedAt && p.receivedAt.includes("T") ? p.receivedAt.split("T")[1].substring(0, 5) : "12:00";
    const releasedDate = p.pickedUpAt ? p.pickedUpAt.split("T")[0] : null;
    const releasedTime = p.pickedUpAt && p.pickedUpAt.includes("T") ? p.pickedUpAt.split("T")[1].substring(0, 5) : null;

    await prisma.parcel.create({
      data: {
        id: p.id,
        recipientName: p.recipientName,
        recipientId: p.recipientId,
        unit: p.unit,
        carrier: p.courier || "Amazon",
        trackingNumber: p.trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        status: p.status,
        otp: p.otp,
        dateReceived: receivedDate,
        timeReceived: receivedTime,
        dateReleased: releasedDate,
        timeReleased: releasedTime,
        portal: p.portal,
        communityCode: p.communityCode || "SUN123"
      }
    });
  }

  console.log("🛠️ Seeding Marketplace Items...");
  for (const m of db.marketplaceItems) {
    await prisma.marketplaceItem.create({
      data: {
        id: m.id,
        title: m.title,
        description: m.description,
        price: m.price,
        sellerId: m.sellerId,
        sellerName: m.sellerName,
        category: m.category,
        status: m.status,
        portal: m.portal,
        createdAt: new Date(m.createdAt),
        images: m.images || []
      }
    });
  }

  console.log("🧸 Seeding Found Items...");
  for (const item of db.foundItems) {
    await prisma.foundItem.create({
      data: {
        id: item.id,
        reporterId: item.reporterId,
        reporterName: item.reporterName,
        communityCode: item.communityCode,
        category: item.category,
        description: item.description,
        images: item.images,
        foundLocation: item.foundLocation,
        dateFound: item.dateFound,
        timeFound: item.timeFound,
        additionalNotes: item.additionalNotes,
        status: item.status,
        portal: item.portal,
        createdAt: new Date(item.createdAt)
      }
    });
  }

  console.log("🎟️ Seeding Claims...");
  for (const claim of db.claims) {
    await prisma.claim.create({
      data: {
        id: claim.id,
        itemId: claim.itemId,
        residentId: claim.residentId,
        residentName: claim.residentName,
        claimReason: claim.claimReason,
        itemDetails: claim.itemDetails,
        proofImage: claim.proofImage,
        contactNumber: claim.contactNumber,
        status: claim.status,
        approvalDate: claim.approvalDate ? new Date(claim.approvalDate) : null,
        collectionDate: claim.collectionDate ? new Date(claim.collectionDate) : null,
        collectionTime: claim.collectionTime,
        collectedBy: claim.collectedBy,
        verifiedBySecurity: claim.verifiedBySecurity
      }
    });
  }

  console.log("🎒 Seeding Lost Reports...");
  for (const lr of (db.lostReports || [])) {
    await prisma.lostReport.create({
      data: {
        id: lr.id,
        residentId: lr.residentId,
        itemName: lr.itemName,
        category: lr.category,
        brand: lr.brand,
        colour: lr.colour,
        description: lr.description,
        distinguishingFeatures: lr.distinguishingFeatures,
        dateLost: lr.dateLost,
        timeLost: lr.timeLost,
        lastSeenLocation: lr.lastSeenLocation,
        status: lr.status,
        images: lr.images,
        additionalNotes: lr.additionalNotes,
        portal: lr.portal,
        communityCode: lr.communityCode,
        createdAt: lr.createdAt ? new Date(lr.createdAt) : new Date()
      }
    });
  }

  console.log("🔗 Seeding Item Matches...");
  for (const match of (db.itemMatches || [])) {
    await prisma.itemMatch.create({
      data: {
        id: match.id,
        lostReportId: match.lostReportId,
        foundItemId: match.foundItemId,
        status: match.status,
        verifiedBy: match.verifiedBy,
        verificationDate: match.verificationDate ? new Date(match.verificationDate) : null,
        collectionDate: match.collectionDate ? new Date(match.collectionDate) : null,
        collectionTime: match.collectionTime,
        collectedBy: match.collectedBy,
        createdAt: match.createdAt ? new Date(match.createdAt) : new Date()
      }
    });
  }

  console.log("🧾 Seeding Maintenance Bills...");
  for (const b of db.maintenanceBills) {
    await prisma.maintenanceBill.create({
      data: {
        id: b.id,
        residentId: b.residentId,
        residentName: b.residentName,
        unit: b.unit,
        month: b.month,
        amount: b.amount,
        dueDate: b.dueDate,
        status: b.status,
        paidOn: b.paidOn
      }
    });
  }

  console.log("📅 Seeding Community Events...");
  for (const e of db.communityEvents) {
    await prisma.communityEvent.create({
      data: {
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        location: e.location,
        organizer: e.organizer,
        priority: e.priority,
        communityCode: e.communityCode || "SUN123"
      }
    });
  }

  console.log("🔔 Seeding Notifications...");
  for (const n of db.notifications) {
    // Check if user exists
    const userExists = await prisma.user.findUnique({ where: { id: n.userId } });
    if (!userExists) continue;

    await prisma.notification.create({
      data: {
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read || false,
        createdAt: new Date(n.createdAt)
      }
    });
  }

  console.log("🚨 Seeding Emergency Alerts...");
  for (const em of db.emergencies) {
    await prisma.emergencyAlert.create({
      data: {
        id: em.id,
        type: em.emergencyType || "Medical",
        reporterName: em.residentName || "Unknown Reporter",
        reporterId: em.residentId || "unknown-id",
        unit: em.unit,
        status: em.status,
        createdAt: new Date(em.createdAt),
        resolvedAt: em.resolvedAt ? new Date(em.resolvedAt) : null,
        resolvedBy: em.resolvedBy,
        communityCode: em.communityCode || "SUN123"
      }
    });
  }

  console.log("🎟️ Seeding Gate Passes...");
  for (const gp of db.gatePasses) {
    const residentId = gp.residentId || "user-resident-2";
    const resExists = await prisma.user.findUnique({ where: { id: residentId } });
    if (!resExists) continue;

    await prisma.gatePass.create({
      data: {
        id: gp.id,
        visitorName: gp.name || "Ravi Kumar",
        purpose: gp.purpose,
        validOn: gp.validFrom ? gp.validFrom.split("T")[0] : new Date().toISOString().split("T")[0],
        qrCodeData: gp.qrCodeData || `PASS-CODE-${gp.id}`,
        status: gp.status || "active",
        residentId,
        residentName: gp.assignedResident || "Nidhi Kumar",
        unit: gp.unit || "301",
        communityCode: gp.communityCode || "SUN123"
      }
    });
  }

  console.log("🚗 Seeding Vehicle Logs...");
  for (const vl of db.vehicleLogs) {
    await prisma.vehicleLog.create({
      data: {
        id: vl.id,
        vehicleNumber: vl.vehicleNumber,
        ownerName: vl.ownerName,
        ownerUnit: vl.unit || "301",
        type: vl.ownerType || "resident",
        entryTime: new Date(vl.entryTime),
        exitTime: vl.exitTime ? new Date(vl.exitTime) : null,
        gate: vl.gate || "Gate 1",
        loggedBy: vl.loggedBy || "Security",
        communityCode: vl.communityCode || "SUN123"
      }
    });
  }

  console.log("⚠️ Seeding Incident Reports...");
  for (const ir of db.incidents) {
    await prisma.incidentReport.create({
      data: {
        id: ir.id,
        title: ir.title || ir.type || "Incident Report",
        time: ir.time,
        location: ir.location,
        description: ir.description,
        type: ir.type,
        status: ir.status,
        reporter: ir.reporter,
        createdAt: new Date(ir.createdAt)
      }
    });
  }

  console.log("📢 Seeding Announcements...");
  for (const a of db.announcements) {
    await prisma.announcement.create({
      data: {
        id: a.id,
        title: a.title,
        content: a.content,
        author: a.author,
        authorRole: a.authorRole,
        priority: a.priority,
        createdAt: new Date(a.createdAt),
        tags: a.tags || []
      }
    });
  }

  console.log("🏢 Seeding FlatInfo...");
  for (const f of db.flats) {
    await prisma.flatInfo.create({
      data: {
        id: f.id,
        building: f.building,
        wing: f.wing,
        floor: f.floor,
        flatNumber: f.flatNumber,
        status: f.status,
        residentId: f.residentId,
        residentName: f.residentName
      }
    });
  }

  console.log("🔑 Seeding Rent Records...");
  for (const r of db.rentRecords) {
    await prisma.rentRecord.create({
      data: {
        id: r.id,
        unit: r.unit,
        building: r.building,
        tenantName: r.tenantName,
        tenantId: r.tenantId,
        amount: r.amount,
        dueDate: r.dueDate,
        status: r.status,
        paidOn: r.paidOn
      }
    });
  }

  console.log("💰 Seeding Society Expenses...");
  for (const ex of db.expenses) {
    await prisma.societyExpense.create({
      data: {
        id: ex.id,
        category: ex.category,
        vendor: ex.vendor,
        amount: ex.amount,
        date: ex.date,
        notes: ex.notes
      }
    });
  }

  console.log("🤝 Seeding Mock Daily Helpers...");
  console.log("🤝 Seeding Mock Daily Helper Assignments...");
  const mockAssignments = [
    {
      residentId: "user-resident-1",
      workerId: "user-worker-8",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      arrivalTime: "08:30 AM",
      exitTime: "11:30 AM",
      services: ["Cooking", "Cleaning"]
    },
    {
      residentId: "user-resident-6",
      workerId: "user-worker-8",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      arrivalTime: "09:30 AM",
      exitTime: "10:30 AM",
      services: ["Cleaning"]
    },
    {
      residentId: "user-resident-9",
      workerId: "user-worker-8",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      arrivalTime: "10:30 AM",
      exitTime: "11:15 AM",
      services: ["Laundry"]
    }
  ];

  for (const a of mockAssignments) {
    await prisma.residentWorkerAssignment.create({
      data: a
    });
  }

  console.log("🤝 Seeding Mock Helper Attendance...");
  for (const att of db.attendance) {
    await prisma.helperAttendance.create({
      data: {
        id: att.id,
        helperId: att.helperId,
        helperName: att.helperName,
        category: att.category,
        checkInTime: att.checkInTime ? new Date(att.checkInTime) : null,
        checkOutTime: att.checkOutTime ? new Date(att.checkOutTime) : null,
        date: att.date,
        assignedFlats: att.assignedFlats,
        entryGate: att.entryGate,
        exitGate: att.exitGate,
        status: att.checkOutTime ? "checked-out" : "checked-in",
        duration: att.duration || null
      }
    });
  }

  console.log("🏠 Seeding Mock Flat Attendance...");
  for (const flatAtt of db.flatAttendance) {
    await prisma.flatAttendance.create({
      data: {
        id: flatAtt.id,
        helperId: flatAtt.helperId,
        helperName: flatAtt.helperName,
        date: flatAtt.date,
        residentId: flatAtt.residentId,
        residentName: flatAtt.residentName,
        flatNumber: flatAtt.flatNumber,
        checkInTime: new Date(flatAtt.checkInTime),
        checkOutTime: flatAtt.checkOutTime ? new Date(flatAtt.checkOutTime) : null,
        duration: flatAtt.duration || null,
        servicePerformed: flatAtt.servicePerformed,
        status: flatAtt.status
      }
    });
  }

  console.log("✨ Seeding successfully completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
