-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "portal" TEXT NOT NULL,
    "unit" TEXT,
    "building" TEXT,
    "societyName" TEXT,
    "hostelName" TEXT,
    "collegeName" TEXT,
    "communityCode" TEXT,
    "ownerOrTenant" TEXT,
    "joinedAt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "password" TEXT NOT NULL,
    "designation" TEXT,
    "committeeId" TEXT,
    "employeeId" TEXT,
    "workingShift" TEXT,
    "gate" TEXT,
    "gender" TEXT,
    "course" TEXT,
    "year" TEXT,
    "branch" TEXT,
    "assignedWing" TEXT,
    "workerCategory" TEXT,
    "availability" TEXT,
    "rating" DOUBLE PRECISION,
    "experience" TEXT,
    "specializations" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "raisedBy" TEXT NOT NULL,
    "raisedByName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "portal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emergency" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[],
    "videos" TEXT[],
    "resolvedAt" TIMESTAMP(3),
    "assignedTo" TEXT,
    "assignedToId" TEXT,
    "duplicateGroup" TEXT[],
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "possibleDuplicateOf" TEXT,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintSubscriber" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "ComplaintSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintChatMessage" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintTimeline" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT NOT NULL,
    "by" TEXT,

    CONSTRAINT "ComplaintTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "parentContact" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "fromDate" TEXT NOT NULL,
    "toDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "visitingUnit" TEXT NOT NULL,
    "visitingResident" TEXT NOT NULL,
    "visitingResidentId" TEXT,
    "status" TEXT NOT NULL,
    "expectedAt" TEXT,
    "checkInTime" TEXT,
    "checkOutTime" TEXT,
    "date" TEXT NOT NULL,
    "portal" TEXT NOT NULL,
    "approvedBy" TEXT,
    "vehicleNumber" TEXT,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaundrySlot" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "bookedBy" TEXT NOT NULL,
    "bookedById" TEXT NOT NULL,
    "communityCode" TEXT NOT NULL,

    CONSTRAINT "LaundrySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parcel" (
    "id" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientId" TEXT,
    "unit" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "status" TEXT NOT NULL,
    "otp" TEXT,
    "dateReceived" TEXT NOT NULL,
    "timeReceived" TEXT NOT NULL,
    "dateReleased" TEXT,
    "timeReleased" TEXT,
    "portal" TEXT NOT NULL,
    "communityCode" TEXT NOT NULL,

    CONSTRAINT "Parcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityBooking" (
    "id" TEXT NOT NULL,
    "facilityName" TEXT NOT NULL,
    "residentName" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "communityCode" TEXT NOT NULL,

    CONSTRAINT "FacilityBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "portal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "images" TEXT[],

    CONSTRAINT "MarketplaceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostFoundItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "claimantId" TEXT,
    "claimantName" TEXT,
    "portal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LostFoundItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomChangeRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "currentRoom" TEXT NOT NULL,
    "preferredRoom" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "communityCode" TEXT NOT NULL,

    CONSTRAINT "RoomChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceBill" (
    "id" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "residentName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paidOn" TEXT,

    CONSTRAINT "MaintenanceBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "communityCode" TEXT NOT NULL,

    CONSTRAINT "CommunityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRsvp" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "EventRsvp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoommatePreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "sleepingHabits" TEXT NOT NULL,
    "studyHours" TEXT NOT NULL,
    "cleanliness" TEXT NOT NULL,
    "smoking" BOOLEAN NOT NULL,
    "foodPreference" TEXT NOT NULL,
    "interests" TEXT[],
    "roomPreference" TEXT NOT NULL,
    "communityCode" TEXT NOT NULL,

    CONSTRAINT "RoommatePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyAlert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "communityCode" TEXT NOT NULL,

    CONSTRAINT "EmergencyAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GatePass" (
    "id" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "validOn" TEXT NOT NULL,
    "qrCodeData" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "residentName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "communityCode" TEXT NOT NULL,

    CONSTRAINT "GatePass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleLog" (
    "id" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerUnit" TEXT,
    "type" TEXT NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitTime" TIMESTAMP(3),
    "gate" TEXT NOT NULL,
    "loggedBy" TEXT NOT NULL,
    "communityCode" TEXT NOT NULL,

    CONSTRAINT "VehicleLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[],

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlatInfo" (
    "id" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "wing" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "flatNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "residentId" TEXT,
    "residentName" TEXT,

    CONSTRAINT "FlatInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentRecord" (
    "id" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "tenantId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paidOn" TEXT,

    CONSTRAINT "RentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteVisitor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "visitingUnit" TEXT NOT NULL,

    CONSTRAINT "FavoriteVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Helper" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "expectedArrivalTime" TEXT NOT NULL,
    "expectedExitTime" TEXT NOT NULL,
    "workingDays" TEXT[],
    "assignedFlats" TEXT[],
    "createdBy" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Helper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelperAttendance" (
    "id" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "helperName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "date" TEXT NOT NULL,
    "assignedFlats" TEXT[],

    CONSTRAINT "HelperAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocietyExpense" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "SocietyExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RoommatePreference_userId_key" ON "RoommatePreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Helper_code_key" ON "Helper"("code");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_raisedBy_fkey" FOREIGN KEY ("raisedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintSubscriber" ADD CONSTRAINT "ComplaintSubscriber_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintSubscriber" ADD CONSTRAINT "ComplaintSubscriber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintChatMessage" ADD CONSTRAINT "ComplaintChatMessage_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintChatMessage" ADD CONSTRAINT "ComplaintChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintTimeline" ADD CONSTRAINT "ComplaintTimeline_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityBooking" ADD CONSTRAINT "FacilityBooking_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CommunityEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommatePreference" ADD CONSTRAINT "RoommatePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatePass" ADD CONSTRAINT "GatePass_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
