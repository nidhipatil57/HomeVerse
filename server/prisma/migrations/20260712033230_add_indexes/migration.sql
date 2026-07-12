-- CreateIndex
CREATE INDEX "Complaint_portal_idx" ON "Complaint"("portal");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

-- CreateIndex
CREATE INDEX "Complaint_raisedBy_idx" ON "Complaint"("raisedBy");

-- CreateIndex
CREATE INDEX "Complaint_assignedToId_idx" ON "Complaint"("assignedToId");

-- CreateIndex
CREATE INDEX "ComplaintChatMessage_complaintId_idx" ON "ComplaintChatMessage"("complaintId");

-- CreateIndex
CREATE INDEX "ComplaintChatMessage_senderId_idx" ON "ComplaintChatMessage"("senderId");

-- CreateIndex
CREATE INDEX "ComplaintSubscriber_complaintId_idx" ON "ComplaintSubscriber"("complaintId");

-- CreateIndex
CREATE INDEX "ComplaintSubscriber_userId_idx" ON "ComplaintSubscriber"("userId");

-- CreateIndex
CREATE INDEX "ComplaintTimeline_complaintId_idx" ON "ComplaintTimeline"("complaintId");

-- CreateIndex
CREATE INDEX "EventRsvp_eventId_idx" ON "EventRsvp"("eventId");

-- CreateIndex
CREATE INDEX "EventRsvp_userId_idx" ON "EventRsvp"("userId");

-- CreateIndex
CREATE INDEX "FacilityBooking_residentId_idx" ON "FacilityBooking"("residentId");

-- CreateIndex
CREATE INDEX "FavoriteVisitor_residentId_idx" ON "FavoriteVisitor"("residentId");

-- CreateIndex
CREATE INDEX "FlatInfo_residentId_idx" ON "FlatInfo"("residentId");

-- CreateIndex
CREATE INDEX "GatePass_residentId_idx" ON "GatePass"("residentId");

-- CreateIndex
CREATE INDEX "HelperAttendance_helperId_idx" ON "HelperAttendance"("helperId");

-- CreateIndex
CREATE INDEX "HelperAttendance_date_idx" ON "HelperAttendance"("date");

-- CreateIndex
CREATE INDEX "LaundrySlot_bookedById_idx" ON "LaundrySlot"("bookedById");

-- CreateIndex
CREATE INDEX "LeaveRequest_studentId_idx" ON "LeaveRequest"("studentId");

-- CreateIndex
CREATE INDEX "LostFoundItem_reporterId_idx" ON "LostFoundItem"("reporterId");

-- CreateIndex
CREATE INDEX "LostFoundItem_portal_idx" ON "LostFoundItem"("portal");

-- CreateIndex
CREATE INDEX "MaintenanceBill_residentId_idx" ON "MaintenanceBill"("residentId");

-- CreateIndex
CREATE INDEX "MaintenanceBill_unit_idx" ON "MaintenanceBill"("unit");

-- CreateIndex
CREATE INDEX "MarketplaceItem_sellerId_idx" ON "MarketplaceItem"("sellerId");

-- CreateIndex
CREATE INDEX "MarketplaceItem_portal_idx" ON "MarketplaceItem"("portal");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Parcel_recipientId_idx" ON "Parcel"("recipientId");

-- CreateIndex
CREATE INDEX "Parcel_unit_idx" ON "Parcel"("unit");

-- CreateIndex
CREATE INDEX "Parcel_portal_idx" ON "Parcel"("portal");

-- CreateIndex
CREATE INDEX "RentRecord_tenantId_idx" ON "RentRecord"("tenantId");

-- CreateIndex
CREATE INDEX "ResidentWorkerAssignment_residentId_idx" ON "ResidentWorkerAssignment"("residentId");

-- CreateIndex
CREATE INDEX "ResidentWorkerAssignment_workerId_idx" ON "ResidentWorkerAssignment"("workerId");

-- CreateIndex
CREATE INDEX "RoomChangeRequest_studentId_idx" ON "RoomChangeRequest"("studentId");

-- CreateIndex
CREATE INDEX "VehicleLog_vehicleNumber_idx" ON "VehicleLog"("vehicleNumber");

-- CreateIndex
CREATE INDEX "Visitor_visitingUnit_idx" ON "Visitor"("visitingUnit");

-- CreateIndex
CREATE INDEX "Visitor_visitingResidentId_idx" ON "Visitor"("visitingResidentId");

-- CreateIndex
CREATE INDEX "Visitor_portal_idx" ON "Visitor"("portal");
