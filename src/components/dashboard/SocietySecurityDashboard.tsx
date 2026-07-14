"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield, Users, CheckCircle2, Clock, AlertTriangle, FileCheck, Package, Eye, Trash, Plus, Search, Bot, ArrowRight, Wrench, Key, Star, XCircle, PlusCircle, LogOut, MapPin, Activity, Car, AlertCircle, Camera, Check, ShieldAlert, Ban, UserCheck, ShieldClose, FileText, ClipboardList
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useSearchParams } from "next/navigation";

export function SocietySecurityDashboard({ security }: { security: any }) {
  const {
    visitors, checkInVisitor, checkOutVisitor, denyVisitorEntry,
    parcels, addParcel, pickupParcelWithOTP,
    lostFoundItems, lostReports, itemMatches, reportLostFoundItem, resolveLostFoundItem,
    verifyFoundItem, rejectFoundItem, approveClaim, rejectClaim, pickupItem,
    confirmMatch, rejectMatch, handoverMatchedItem, fetchLostReports, fetchMatches,
    emergencies, updateEmergencyStatus,
    gatePasses, issueGatePass,
    vehicleLogs, logVehicleEntry, logVehicleExit,
    incidents, addIncidentReport,
    announcements, addAnnouncement,
    users, complaints, updateComplaintStatus,
    helpers, attendance, checkInHelper, checkOutHelper
  } = useCommunityStore(
    useShallow((state) => ({
      visitors: state.visitors,
      checkInVisitor: state.checkInVisitor,
      checkOutVisitor: state.checkOutVisitor,
      denyVisitorEntry: state.denyVisitorEntry,
      parcels: state.parcels,
      addParcel: state.addParcel,
      pickupParcelWithOTP: state.pickupParcelWithOTP,
      lostFoundItems: state.lostFoundItems || [],
      lostReports: state.lostReports || [],
      itemMatches: state.itemMatches || [],
      reportLostFoundItem: state.reportLostFoundItem,
      resolveLostFoundItem: state.resolveLostFoundItem,
      verifyFoundItem: state.verifyFoundItem,
      rejectFoundItem: state.rejectFoundItem,
      approveClaim: state.approveClaim,
      rejectClaim: state.rejectClaim,
      pickupItem: state.pickupItem,
      confirmMatch: state.confirmMatch,
      rejectMatch: state.rejectMatch,
      handoverMatchedItem: state.handoverMatchedItem,
      fetchLostReports: state.fetchLostReports,
      fetchMatches: state.fetchMatches,
      emergencies: state.emergencies || [],
      updateEmergencyStatus: state.updateEmergencyStatus,
      gatePasses: state.gatePasses || [],
      issueGatePass: state.issueGatePass,
      vehicleLogs: state.vehicleLogs || [],
      logVehicleEntry: state.logVehicleEntry,
      logVehicleExit: state.logVehicleExit,
      incidents: state.incidents || [],
      addIncidentReport: state.addIncidentReport,
      announcements: state.announcements || [],
      addAnnouncement: state.addAnnouncement,
      users: state.users,
      complaints: state.complaints,
      updateComplaintStatus: state.updateComplaintStatus,
      helpers: state.helpers || [],
      attendance: state.attendance || [],
      checkInHelper: state.checkInHelper,
      checkOutHelper: state.checkOutHelper
    }))
  );

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>("visitors");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    fetchLostReports();
    fetchMatches();
  }, [fetchLostReports, fetchMatches]);

  // Modals / Input States
  const [denyReason, setDenyReason] = useState("");
  const [activeDenyId, setActiveDenyId] = useState("");
  const [showDenyModal, setShowDenyModal] = useState(false);

  // Parcel creation state
  const [newParcel, setNewParcel] = useState({
    recipientName: "",
    flatNumber: "",
    building: "Tower A",
    courier: "Amazon Logistics",
    description: "",
    location: "Gate 1 Locker Post",
  });
  const [parcelOtp, setParcelOtp] = useState("");
  const [releaseParcelId, setReleaseParcelId] = useState("");
  const [parcelReleaseError, setParcelReleaseError] = useState("");

  // Lost & Found creation state & tabs
  const [newFound, setNewFound] = useState({
    title: "",
    category: "Keys",
    description: "",
    location: "",
    dateFound: "",
    timeFound: "",
    additionalNotes: "",
  });
  const [showHandoverDialog, setShowHandoverDialog] = useState(false);
  const [selectedClaimForHandover, setSelectedClaimForHandover] = useState<any>(null);
  const [collectedBy, setCollectedBy] = useState("");
  const [verifiedBySecurity, setVerifiedBySecurity] = useState(security?.name || "Security");
  const [resolving, setResolving] = useState(false);
  const [lostFoundSubTab, setLostFoundSubTab] = useState("pending");

  // Incident creation state
  const [newIncident, setNewIncident] = useState({
    type: "Visitor Dispute" as any,
    location: "Main Gate",
    description: "",
  });

  // Announcement state
  const [newAnn, setNewAnn] = useState({
    title: "",
    content: "",
    priority: "normal" as any,
  });

  // Gate Pass creation state
  const [newPass, setNewPass] = useState({
    name: "",
    company: "",
    purpose: "Contractor Work",
    validDays: "1",
    assignedResident: "",
    unit: "",
    building: "Tower A"
  });

  // Vehicle entry state
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: "",
    ownerName: "",
    ownerType: "visitor" as any,
    unit: "",
    building: "Tower A"
  });

  // Filter dynamic logs
  const pendingVisitorApprovals = visitors.filter(v => v.portal === "society" && v.status === "expected");
  const checkedInVisitors = visitors.filter(v => v.portal === "society" && v.status === "checked-in");
  const activeDeliveries = visitors.filter(v => v.portal === "society" && v.status === "checked-in" && v.purpose.toLowerCase().includes("delivery"));
  const pendingParcels = parcels.filter(p => p.portal === "society" && p.status === "received");
  const activeEmergencies = emergencies.filter(e => e.status !== "resolved");

  // Lost & Found counters
  const activeLostReportsCount = lostReports.filter(r => r.status === "Searching" || r.status === "Possible Match Found").length;
  const activeFoundItemsCount = lostFoundItems.filter(item => item.portal === "society" && item.status === "Available for Claim").length;
  const possibleMatchesCount = itemMatches.filter(m => m.status === "Suggested").length;
  const itemsReturnedCount = lostFoundItems.filter(item => item.portal === "society" && item.status === "Returned").length + itemMatches.filter(m => m.status === "Confirmed" && m.collectionDate).length;
  const unmatchedReportsCount = lostReports.filter(r => r.status === "Searching").length;


  // Service Plumbers / Electricians (assigned complaints)
  const assignedServiceWorkers = complaints.filter(
    (c) => c.portal === "society" && (c.status === "assigned" || c.status === "in-progress") && c.assignedTo
  );

  const handleOpenDeny = (id: string) => {
    setActiveDenyId(id);
    setDenyReason("");
    setShowDenyModal(true);
  };

  const submitDeny = () => {
    if (!denyReason) return;
    denyVisitorEntry(activeDenyId, denyReason);
    setShowDenyModal(false);
  };

  const handleAddParcelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParcel.recipientName || !newParcel.flatNumber) return;

    // Find recipient user from users list
    const recipient = users.find(
      u => u.name.toLowerCase().includes(newParcel.recipientName.toLowerCase()) || u.unit === newParcel.flatNumber
    );

    const recipientId = recipient ? recipient.id : "user-resident-1";
    const recipientName = recipient ? recipient.name : newParcel.recipientName;
    const otpVal = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit OTP

    addParcel({
      recipientId,
      recipientName,
      unit: newParcel.flatNumber,
      courier: newParcel.courier,
      description: newParcel.description || "Package Package",
      otp: otpVal,
      location: newParcel.location,
      portal: "society",
      image: "/images/package-placeholder.jpg"
    });

    // Reset Form
    setNewParcel({
      recipientName: "",
      flatNumber: "",
      building: "Tower A",
      courier: "Amazon Logistics",
      description: "",
      location: "Gate 1 Locker Post",
    });
  };

  const handleReleaseParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    setParcelReleaseError("");
    if (!releaseParcelId || !parcelOtp) return;

    const success = await pickupParcelWithOTP(releaseParcelId, parcelOtp);
    if (success) {
      setReleaseParcelId("");
      setParcelOtp("");
    } else {
      setParcelReleaseError("Invalid OTP or parcel is already collected.");
    }
  };

  const handleAddFoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFound.title || !newFound.category || !newFound.location) return;

    const today = new Date().toISOString().split("T")[0];
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    await reportLostFoundItem({
      category: newFound.category,
      description: `${newFound.title} - ${newFound.description}`,
      images: ["/images/found-placeholder.jpg"],
      foundLocation: newFound.location,
      dateFound: newFound.dateFound || today,
      timeFound: newFound.timeFound || timeNow,
      additionalNotes: newFound.additionalNotes || "",
      reporterId: security?.id || "sec-guard-1",
      reporterName: security?.name || "Rahul",
      portal: "society",
      communityCode: security?.communityCode || "SUN123"
    });

    setNewFound({ 
      title: "", 
      category: "Keys", 
      description: "", 
      location: "", 
      dateFound: "", 
      timeFound: "", 
      additionalNotes: "" 
    });
    alert("Recovered item cataloged in society bulletin!");
  };

  const handleAddIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.description) return;

    addIncidentReport({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: newIncident.location,
      description: newIncident.description,
      type: newIncident.type,
      status: "logged",
      reporter: security.name
    });

    setNewIncident({ type: "Visitor Dispute", location: "Main Gate", description: "" });
  };

  const handleAddAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.title || !newAnn.content) return;

    addAnnouncement({
      title: newAnn.title,
      content: newAnn.content,
      author: security.name,
      authorRole: "security",
      priority: newAnn.priority,
      tags: ["Security", "Gate Notice"]
    });

    setNewAnn({ title: "", content: "", priority: "normal" });
  };

  const handleAddPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass.name || !newPass.assignedResident) return;

    const days = parseInt(newPass.validDays) || 1;

    issueGatePass({
      name: newPass.name,
      company: newPass.company || "Independent",
      purpose: newPass.purpose,
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 1000 * 60 * 60 * 24 * days).toISOString(),
      assignedResident: newPass.assignedResident,
      unit: newPass.unit,
      building: newPass.building
    });

    setNewPass({
      name: "",
      company: "",
      purpose: "Contractor Work",
      validDays: "1",
      assignedResident: "",
      unit: "",
      building: "Tower A"
    });
  };

  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.vehicleNumber || !newVehicle.ownerName) return;

    logVehicleEntry({
      vehicleNumber: newVehicle.vehicleNumber.toUpperCase(),
      ownerName: newVehicle.ownerName,
      ownerType: newVehicle.ownerType,
      unit: newVehicle.unit || "N/A",
      building: newVehicle.building
    });

    setNewVehicle({
      vehicleNumber: "",
      ownerName: "",
      ownerType: "visitor",
      unit: "",
      building: "Tower A"
    });
  };


  const handleServiceGateAction = (complaintId: string, workerName: string, residentId: string, isEntering: boolean) => {
    if (isEntering) {
      updateComplaintStatus(complaintId, "in-progress", {
        by: workerName,
        note: "Worker verified at gate and entered society."
      });
      // Notify resident
      getCommunityStore().sendNotification(
        residentId,
        "Worker Entered Society 🛠️",
        `Assigned worker ${workerName} has entered the gate and is on the way.`,
        "success"
      );
    } else {
      updateComplaintStatus(complaintId, "resolved", {
        by: workerName,
        note: "Worker exited gate. Service ticket marked resolved."
      });
      // Notify resident
      getCommunityStore().sendNotification(
        residentId,
        "Service Completed & Exited",
        `Assigned worker ${workerName} has checked out at the gate. Service ticket marked resolved.`,
        "success"
      );
    }
  };

  // Helper helper to bypass typescript issues in state triggers
  const getCommunityStore = () => useCommunityStore.getState();

  return (
    <div className="space-y-6 pb-12">
      {/* Dynamic Emergency Monitor Banner */}
      {activeEmergencies.length > 0 && (
        <Card className="border-red-500 bg-red-500/10 shadow-lg animate-pulse overflow-hidden relative border-2">
          <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
          <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-4">
              <ShieldAlert className="w-8 h-8 text-red-600 shrink-0 mt-1" />
              <div>
                <span className="text-[10px] text-red-600 font-extrabold uppercase tracking-wider block">🚨 ACTIVE SECURITY EMERGENCY</span>
                <h2 className="text-lg font-bold text-foreground">
                  {activeEmergencies[0].emergencyType} Alert raised by {activeEmergencies[0].residentName} (Flat {activeEmergencies[0].unit})
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Raised at {new Date(activeEmergencies[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Contact: {activeEmergencies[0].phone}
                </p>
                {activeEmergencies[0].notes && (
                  <div className="text-xs font-medium text-foreground bg-background/80 border border-red-500/20 px-2 py-1 rounded-md mt-2 max-w-lg">
                    Log Notes: &quot;{activeEmergencies[0].notes}&quot;
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0 self-end md:self-center">
              {activeEmergencies[0].status === "pending" && (
                <Button
                  onClick={() => updateEmergencyStatus(activeEmergencies[0].id, "accepted", "Guard rahul acknowledged")}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl border-0 h-10 px-4 text-xs font-semibold"
                >
                  Acknowledge Alert
                </Button>
              )}
              {activeEmergencies[0].status === "accepted" && (
                <Button
                  onClick={() => updateEmergencyStatus(activeEmergencies[0].id, "dispatched", "Quick response team dispatched.")}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl border-0 h-10 px-4 text-xs font-semibold"
                >
                  Dispatch Security Help
                </Button>
              )}
              {activeEmergencies[0].status === "dispatched" && (
                <Button
                  onClick={() => updateEmergencyStatus(activeEmergencies[0].id, "resolved", "Resolved and gate closed.")}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl border-0 h-10 px-4 text-xs font-semibold"
                >
                  Mark Resolved & Safe
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => updateEmergencyStatus(activeEmergencies[0].id, "resolved", "Dismissed/Resolved")}
                className="border-red-500/20 text-red-600 hover:bg-red-500/10 rounded-xl h-10 px-3 text-xs"
              >
                Dismiss Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/30 pb-5">
        <div>
          <span className="text-xs font-semibold text-red-500 uppercase tracking-widest">
            HomeVerse Security Desk • Gate: {security?.gate || "Gate 1"} • Shift: {security?.workingShift || "Morning"}
          </span>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] mt-1 flex items-center gap-2">
            Gate Command Center
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 font-sans font-medium">
              Badge ID: {security?.employeeId || "SEC-9040"}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, Officer <span className="font-semibold text-foreground">{security?.name || "Rahul"}</span>. Live gate logging and access control.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-red-500/15 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Central Guard Desk
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Expected Visitors Today", value: pendingVisitorApprovals.length, icon: Users, color: "text-blue-500 bg-blue-500/10" },
          { label: "Visitors Checked-In", value: checkedInVisitors.length, icon: CheckCircle2, color: "text-green-500 bg-green-500/10" },
          { label: "Pending Gate Parcels", value: pendingParcels.length, icon: Package, color: "text-amber-500 bg-amber-500/10" },
          { label: "Active Deliveries Inside", value: activeDeliveries.length, icon: Car, color: "text-purple-500 bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation is driven by the left sidebar */}

      {/* Dynamic Tab Workspace */}
      <div className="min-h-[500px]">
        {/* VISITORS TAB */}
        {activeTab === "visitors" && (
          <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Left: Expected Visitors Queue */}
            <Card className="lg:col-span-7 border-border/50 flex flex-col h-[550px] overflow-hidden">
              <CardHeader className="border-b border-border/20 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5 text-blue-500" />
                  Pre-Approved Expected Guests
                </CardTitle>
                <CardDescription>Verifying resident pre-approvals, QR codes, and guest OTPs</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {pendingVisitorApprovals.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                    <Check className="w-8 h-8 text-green-500 bg-green-500/10 rounded-full p-1.5" />
                    No expected visitors queued for today.
                  </div>
                ) : (
                  pendingVisitorApprovals.map((v) => (
                    <div key={v.id} className="p-4 rounded-2xl border border-border/50 bg-secondary/15 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{v.name}</h4>
                          <span className="text-[10px] text-muted-foreground font-semibold">Phone: {v.phone}</span>
                        </div>
                        <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-bold">
                          Pre-Approved
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-card border border-border/30">
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Visiting Flat</span>
                          <span className="font-bold text-foreground">{v.visitingUnit} ({v.visitingResident})</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Purpose / Vehicle</span>
                          <span className="font-bold text-foreground truncate block">{v.purpose} {v.vehicleNumber && `(${v.vehicleNumber})`}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1.5">
                        <Button
                          size="sm"
                          onClick={() => checkInVisitor(v.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 border-0 text-xs font-semibold shadow-sm"
                        >
                          Check In Visitor
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDeny(v.id)}
                          className="border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl h-9 text-xs"
                        >
                          Deny Access
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Right: Active Visitors Logs */}
            <Card className="lg:col-span-5 border-border/50 flex flex-col h-[550px] overflow-hidden">
              <CardHeader className="border-b border-border/20 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-green-500" />
                  Currently Inside Society
                </CardTitle>
                <CardDescription>Verify visitor check-outs as guests leave the gate</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {checkedInVisitors.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                    <Users className="w-8 h-8 text-muted-foreground/30" />
                    No checked-in visitors inside the society right now.
                  </div>
                ) : (
                  checkedInVisitors.map((v) => (
                    <div key={v.id} className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate">{v.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Flat: {v.visitingUnit} • In: {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => checkOutVisitor(v.id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-8 px-3 text-[11px] font-semibold border-0 shrink-0"
                      >
                        Check Out
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* PARCELS TAB */}
        {activeTab === "parcels" && (
          <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Left: Log arriving parcel */}
            <Card className="lg:col-span-6 border-border/50">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Package className="w-4.5 h-4.5 text-amber-500" />
                  Log Arriving Package
                </CardTitle>
                <CardDescription>Enter courier details to notify the resident with a pickup OTP</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleAddParcelSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Recipient Name</label>
                      <Input
                        placeholder="e.g. Nidhi"
                        value={newParcel.recipientName}
                        onChange={(e) => setNewParcel(prev => ({ ...prev, recipientName: e.target.value }))}
                        className="rounded-xl h-10"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Flat / Unit Number</label>
                      <Input
                        placeholder="e.g. A-301"
                        value={newParcel.flatNumber}
                        onChange={(e) => setNewParcel(prev => ({ ...prev, flatNumber: e.target.value }))}
                        className="rounded-xl h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Courier Company</label>
                      <select
                        value={newParcel.courier}
                        onChange={(e) => setNewParcel(prev => ({ ...prev, courier: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs"
                      >
                        <option value="Amazon Logistics">Amazon Logistics</option>
                        <option value="Flipkart Delivery">Flipkart Delivery</option>
                        <option value="BlueDart">BlueDart</option>
                        <option value="Delhivery">Delhivery</option>
                        <option value="DHL Express">DHL Express</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Locker Storage Post</label>
                      <Input
                        placeholder="e.g. Gate 1 Guard Post"
                        value={newParcel.location}
                        onChange={(e) => setNewParcel(prev => ({ ...prev, location: e.target.value }))}
                        className="rounded-xl h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">Package Description</label>
                    <Input
                      placeholder="e.g. Brown Cardboard Box"
                      value={newParcel.description}
                      onChange={(e) => setNewParcel(prev => ({ ...prev, description: e.target.value }))}
                      className="rounded-xl h-10"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">Attach Package Photo</label>
                    <div className="p-3 border border-dashed border-border rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/20 cursor-pointer">
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">package_proof_photo.jpg (Default)</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 border-0 shadow-md font-semibold"
                  >
                    Submit & Send OTP to Resident
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Right: Verify OTP / release parcel */}
            <div className="lg:col-span-6 space-y-6">
              <Card className="border-border/50">
                <CardHeader className="pb-3 border-b border-border/20">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-green-500" />
                    Verify Resident OTP & Release
                  </CardTitle>
                  <CardDescription>Release parcel from gate custody by verifying the resident OTP</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <form onSubmit={handleReleaseParcel} className="space-y-4">
                    {parcelReleaseError && (
                      <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold rounded-xl">
                        {parcelReleaseError}
                      </div>
                    )}
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Select Parcel</label>
                      <select
                        value={releaseParcelId}
                        onChange={(e) => { setReleaseParcelId(e.target.value); setParcelReleaseError(""); }}
                        className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs"
                        required
                      >
                        <option value="">-- Choose parcel awaiting pickup --</option>
                        {pendingParcels.map(p => (
                          <option key={p.id} value={p.id}>
                            [{p.id}] {p.recipientName} (Flat {p.unit}) • {p.courier}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Enter Verification OTP</label>
                      <Input
                        type="text"
                        placeholder="e.g. 1092"
                        value={parcelOtp}
                        onChange={(e) => { setParcelOtp(e.target.value); setParcelReleaseError(""); }}
                        className="rounded-xl h-10 tracking-widest text-center font-bold text-lg"
                        maxLength={4}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 border-0 shadow-md font-semibold"
                    >
                      Confirm Release & Handover
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Active Parcels Feed */}
              <Card className="border-border/50 max-h-[220px] overflow-hidden flex flex-col">
                <CardHeader className="pb-2 border-b border-border/20">
                  <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Locker Inventory ({pendingParcels.length} items)</CardTitle>
                </CardHeader>
                <CardContent className="p-3 flex-1 overflow-y-auto space-y-1.5">
                  {pendingParcels.slice(0, 4).map(p => (
                    <div key={p.id} className="text-xs p-2.5 rounded-lg bg-secondary/10 flex justify-between items-center">
                      <span className="font-semibold text-foreground truncate max-w-[150px]">{p.recipientName} (Flat {p.unit})</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-secondary/80 px-2 py-0.5 rounded text-muted-foreground font-mono">OTP: {p.otp}</span>
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px]">{p.courier}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* WORKERS & HELPERS TAB */}
        {activeTab === "workers" && (
          <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Domestic Help Access Check */}
            <Card className="lg:col-span-6 border-border/50 flex flex-col h-[520px] overflow-hidden">
              <CardHeader className="border-b border-border/20 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-500" />
                  Domestic Worker Entry / Attendance
                </CardTitle>
                <CardDescription>Record entry/exit attendance logs for verified flats maids & cooks</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {helpers.map(w => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  const todayLog = attendance.find(a => a.workerId === w.id && a.date === todayStr);
                  const isInside = todayLog && !todayLog.checkOutTime;
                  const isCheckedOut = todayLog && todayLog.checkOutTime;

                  return (
                    <div key={w.id} className="p-4 rounded-xl border border-border/60 bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{w.name}</span>
                          <Badge variant="outline" className="text-[9px] uppercase px-1.5">{w.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Assigned Units: <span className="font-medium text-foreground">{w.assignedFlats?.join(", ") || "None"}</span>
                        </p>
                        {isInside && todayLog?.checkInTime && (
                          <span className="text-[10px] text-green-500 font-semibold block mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Inside since {new Date(todayLog.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({todayLog.entryGate})
                          </span>
                        )}
                        {isCheckedOut && todayLog?.checkOutTime && (
                          <span className="text-[10px] text-amber-500 font-semibold block mt-1 flex items-center gap-1">
                            <LogOut className="w-3 h-3" /> Exited at {new Date(todayLog.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({todayLog.exitGate})
                          </span>
                        )}
                      </div>
                      {!isCheckedOut ? (
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (isInside) {
                              await checkOutHelper(todayLog.id, "Main Gate");
                              alert(`Checked out ${w.name} from Main Gate.`);
                            } else {
                              await checkInHelper(w.id, w.name, w.category, "Main Gate", w.assignedFlats);
                              alert(`Checked in ${w.name} through Main Gate.`);
                            }
                          }}
                          className={`rounded-xl px-3 py-1.5 h-9 font-semibold text-xs border-0 shrink-0 ${
                            isInside ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                        >
                          {isInside ? "Mark Checkout" : "Mark Check-In"}
                        </Button>
                      ) : (
                        <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20 text-[9px] font-bold">Shift Finished</Badge>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Service Plumbers / Electricians (assigned complaints) */}
            <Card className="lg:col-span-6 border-border/50 flex flex-col h-[520px] overflow-hidden">
              <CardHeader className="border-b border-border/20 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-500" />
                  Service Provider Coordination
                </CardTitle>
                <CardDescription>Verify arriving plumbers or electricians for active flat repair tickets</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {assignedServiceWorkers.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                    <Wrench className="w-8 h-8 text-muted-foreground/30" />
                    No active service technicians dispatched for today.
                  </div>
                ) : (
                  assignedServiceWorkers.map(c => {
                    const isInside = c.status === "in-progress";
                    const resident = users.find(u => u.name === c.raisedByName);
                    const residentId = resident ? resident.id : "user-resident-1";

                    return (
                      <div key={c.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-extrabold uppercase text-amber-500">{c.category} Trade Service</h4>
                            <h3 className="font-bold text-sm text-foreground leading-snug mt-0.5">{c.assignedTo}</h3>
                          </div>
                          <Badge className={isInside ? "bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px]" : "bg-blue-500/10 text-blue-500 border-blue-500/20 text-[9px]"}>
                            {isInside ? "Working Inside" : "At Gate Queue"}
                          </Badge>
                        </div>

                        <div className="p-3 bg-secondary/15 rounded-lg text-xs space-y-1">
                          <div><span className="text-muted-foreground">Assigned Flat:</span> <span className="font-bold">{c.unit} ({c.raisedByName})</span></div>
                          <div><span className="text-muted-foreground">Remark:</span> <span className="italic">&quot;{c.title}&quot;</span></div>
                        </div>

                        <div className="flex gap-2">
                          {!isInside ? (
                            <Button
                              size="sm"
                              onClick={() => handleServiceGateAction(c.id, c.assignedTo || "Technician", residentId, true)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-8 text-[11px] font-semibold border-0"
                            >
                              Verify & Record Entry
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleServiceGateAction(c.id, c.assignedTo || "Technician", residentId, false)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-8 text-[11px] font-semibold border-0"
                            >
                              Record Exit & Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* LOST & FOUND HUB TAB */}
        {activeTab === "lostfound" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Active Lost Reports", value: activeLostReportsCount, icon: ClipboardList, color: "text-amber-500 bg-amber-500/10" },
                { label: "Active Found Items", value: activeFoundItemsCount, icon: PlusCircle, color: "text-blue-500 bg-blue-500/10" },
                { label: "Possible Matches", value: possibleMatchesCount, icon: ShieldAlert, color: "text-indigo-500 bg-indigo-500/10" },
                { label: "Items Returned", value: itemsReturnedCount, icon: CheckCircle2, color: "text-green-500 bg-green-500/10" },
                { label: "Unmatched Reports", value: unmatchedReportsCount, icon: Clock, color: "text-purple-500 bg-purple-500/10" },
              ].map((stat, i) => (
                <Card key={i} className="border-border/50 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                      <stat.icon className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
            {/* Left: Log new found property */}
            <Card className="lg:col-span-5 border-border/50 h-fit">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <PlusCircle className="w-4.5 h-4.5 text-blue-500" />
                  Log Recovered Property
                </CardTitle>
                <CardDescription>Catalog items handed over to security desk gate 1</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleAddFoundSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Item Name</label>
                      <Input
                        placeholder="e.g. Set of Keys"
                        value={newFound.title}
                        onChange={(e) => setNewFound(prev => ({ ...prev, title: e.target.value }))}
                        className="rounded-xl h-10 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Category</label>
                      <select
                        value={newFound.category}
                        onChange={(e) => setNewFound(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full h-10 px-3 border border-border rounded-xl bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      >
                        {["Keys", "Wallet", "Mobile Phone", "Earbuds", "Watch", "Jewellery", "Water Bottle", "Books", "ID Card", "Debit/Credit Card", "Documents", "Bag", "Umbrella", "Clothes", "Other"].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">Location Found</label>
                    <Input
                      placeholder="e.g. Lift lobby level B1 Tower A"
                      value={newFound.location}
                      onChange={(e) => setNewFound(prev => ({ ...prev, location: e.target.value }))}
                      className="rounded-xl h-10 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">Date & Time Found</label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="date"
                        value={newFound.dateFound}
                        onChange={(e) => setNewFound(prev => ({ ...prev, dateFound: e.target.value }))}
                        className="rounded-xl h-10 text-xs"
                      />
                      <Input
                        type="time"
                        value={newFound.timeFound}
                        onChange={(e) => setNewFound(prev => ({ ...prev, timeFound: e.target.value }))}
                        className="rounded-xl h-10 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">Description / Notes</label>
                    <Input
                      placeholder="e.g. keychain with red ribbon tag"
                      value={newFound.description}
                      onChange={(e) => setNewFound(prev => ({ ...prev, description: e.target.value }))}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">Upload Photo</label>
                    <div className="p-3 border border-dashed border-border rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/20 cursor-pointer">
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">found_item_photo.jpg (Default)</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-primary text-white rounded-xl h-11 border-0 shadow-md font-semibold text-xs"
                  >
                    Catalog Item
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Right: Active / Claimed items grid with tabs */}
            <Card className="lg:col-span-7 border-border/50 flex flex-col h-[600px] overflow-hidden">
              <CardHeader className="border-b border-border/20 pb-3">
                <div className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <ClipboardList className="w-4.5 h-4.5 text-indigo-500" />
                      Lost & Found Registry Hub
                    </CardTitle>
                    <CardDescription>Physical verification, claim review, and physical handover resolution</CardDescription>
                  </div>
                  <Button 
                    type="button"
                    onClick={() => window.location.href = "/society/security-lost-found"} 
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-0 text-xs font-semibold px-4 h-9 shadow-sm"
                  >
                    Open Dedicated Portal ➜
                  </Button>
                </div>
                
                {/* Sub tabs list */}
                <div className="flex gap-1.5 mt-3 bg-secondary/30 p-1 rounded-lg w-fit">
                  {["pending", "claims", "pickup", "history"].map(tab => {
                    const filteredList = lostFoundItems.filter(item => item.portal === "society");
                    let count = 0;
                    if (tab === "pending") count = filteredList.filter(item => item.status === "Pending Verification").length;
                    else if (tab === "claims") count = filteredList.filter(item => item.status === "Claim Pending Verification").length;
                    else if (tab === "pickup") count = filteredList.filter(item => item.status === "Ready for Pickup").length;
                    else if (tab === "history") count = filteredList.filter(item => item.status === "Returned" || item.status === "Rejected" || item.status === "Available for Claim").length;

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setLostFoundSubTab(tab)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors ${
                          lostFoundSubTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/40"
                        }`}
                      >
                        <span className="capitalize">{tab}</span> ({count})
                      </button>
                    );
                  })}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Pending Verification */}
                {lostFoundSubTab === "pending" && (
                  (() => {
                    const items = lostFoundItems.filter(item => item.portal === "society" && item.status === "Pending Verification");
                    if (items.length === 0) return <div className="text-center py-20 text-muted-foreground text-xs">No pending verification reports.</div>;
                    return items.map(item => (
                      <div key={item.id} className="p-3.5 rounded-xl border border-border bg-card hover:bg-secondary/5 transition-colors text-xs space-y-2 flex justify-between items-center gap-4">
                        <div className="space-y-1">
                          <div className="font-bold text-foreground">{item.category}</div>
                          <div className="text-muted-foreground text-[11px]">{item.description}</div>
                          <div className="text-[10px] text-muted-foreground">Reporter: {item.reporterName} | Location: {item.foundLocation}</div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" onClick={() => verifyFoundItem(item.id)} className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-8 text-[10px] font-semibold border-0">
                            Verify Received
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => rejectFoundItem(item.id)} className="text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-lg h-8 text-[10px] font-semibold">
                            Reject
                          </Button>
                        </div>
                      </div>
                    ));
                  })()
                )}

                {/* Active Claims */}
                {lostFoundSubTab === "claims" && (
                  (() => {
                    const items = lostFoundItems.filter(item => item.portal === "society" && item.status === "Claim Pending Verification");
                    if (items.length === 0) return <div className="text-center py-20 text-muted-foreground text-xs">No active claims awaiting verification.</div>;
                    return items.map(item => {
                      const pendingClaims = item.claims?.filter(c => c.status === "Claim Pending Verification") || [];
                      return (
                        <div key={item.id} className="p-3.5 rounded-xl border border-border bg-card space-y-2.5 text-xs">
                          <div className="border-b pb-2 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-foreground">{item.category}</span>
                              <span className="text-[10px] text-muted-foreground block">{item.description}</span>
                            </div>
                            <span className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">Ref: {item.id}</span>
                          </div>
                          <div className="space-y-2">
                            {pendingClaims.map(claim => (
                              <div key={claim.id} className="p-2.5 rounded-lg border border-border bg-secondary/10 flex justify-between items-center gap-4">
                                <div className="space-y-1">
                                  <div className="font-bold text-foreground">Claimant: {claim.residentName}</div>
                                  <div className="text-muted-foreground text-[10px]">Reason: &quot;{claim.claimReason}&quot;</div>
                                  {claim.contactNumber && <div className="text-[10px] text-primary">Phone: {claim.contactNumber}</div>}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <Button size="sm" onClick={() => approveClaim(claim.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-7 text-[9px] font-bold border-0">
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => rejectClaim(claim.id)} className="text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-lg h-7 text-[9px] font-bold">
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()
                )}

                {/* Ready for Handover */}
                {lostFoundSubTab === "pickup" && (
                  (() => {
                    const items = lostFoundItems.filter(item => item.portal === "society" && item.status === "Ready for Pickup");
                    if (items.length === 0) return <div className="text-center py-20 text-muted-foreground text-xs">No items waiting for collection.</div>;
                    return items.map(item => {
                      const approvedClaim = item.claims?.find(c => c.status === "Ready for Pickup");
                      if (!approvedClaim) return null;
                      return (
                        <div key={item.id} className="p-3.5 rounded-xl border border-border bg-card hover:bg-secondary/5 transition-colors text-xs space-y-2 flex justify-between items-center gap-4">
                          <div className="space-y-1">
                            <div className="font-bold text-foreground">{item.category}</div>
                            <div className="text-muted-foreground text-[11px]">{item.description}</div>
                            <div className="text-[10px] text-indigo-500 font-bold">Claimant: {approvedClaim.residentName} (Ready for Pickup)</div>
                          </div>
                          <div className="shrink-0">
                            <Button size="sm" onClick={() => {
                              setSelectedClaimForHandover({ claim: approvedClaim, item });
                              setCollectedBy(approvedClaim.residentName);
                              setShowHandoverDialog(true);
                            }} className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-8 text-[10px] font-semibold border-0">
                              Mark Returned
                            </Button>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}

                {/* Registry History */}
                {lostFoundSubTab === "history" && (
                  (() => {
                    const items = lostFoundItems.filter(item => item.portal === "society" && (item.status === "Returned" || item.status === "Rejected" || item.status === "Available for Claim"));
                    if (items.length === 0) return <div className="text-center py-20 text-muted-foreground text-xs">History is empty.</div>;
                    return items.map(item => (
                      <div key={item.id} className="p-3 rounded-xl border border-border bg-card hover:bg-secondary/5 transition-colors text-xs flex justify-between items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{item.category}</span>
                            <Badge className={`text-[8px] px-1 h-4 font-bold ${
                              item.status === "Returned" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                              item.status === "Rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                              "bg-secondary text-foreground"
                            }`}>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground text-[10px] mt-0.5">{item.description}</div>
                          <div className="text-[9px] text-muted-foreground mt-0.5">Reporter: {item.reporterName} | Date: {item.dateFound}</div>
                        </div>
                        {item.status === "Returned" && (
                          <div className="text-[9px] text-muted-foreground text-right">
                            <div className="font-bold text-emerald-600">Returned</div>
                            <div>Recipient: {item.claims?.find(c => c.status === "Returned")?.collectedBy}</div>
                          </div>
                        )}
                      </div>
                    ));
                  })()
                )}
              </CardContent>
            </Card>
          </div>
          </div>
        )}

        {/* VEHICLES & LOG TAB */}
        {activeTab === "vehicles" && (
          <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Left: Log new vehicle check-in */}
            <Card className="lg:col-span-5 border-border/50">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Car className="w-5 h-5 text-indigo-500" />
                  Log Vehicle Check-In
                </CardTitle>
                <CardDescription>Log resident cab, delivery truck, or visitor vehicle entry</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleAddVehicleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Vehicle License plate</label>
                      <Input
                        placeholder="e.g. MH-12-PQ-9999"
                        value={newVehicle.vehicleNumber}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                        className="rounded-xl h-10 uppercase font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Driver/Owner Name</label>
                      <Input
                        placeholder="e.g. Ramesh Cab"
                        value={newVehicle.ownerName}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, ownerName: e.target.value }))}
                        className="rounded-xl h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Owner Type</label>
                      <select
                        value={newVehicle.ownerType}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, ownerType: e.target.value as any }))}
                        className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs"
                      >
                        <option value="visitor">Visitor</option>
                        <option value="resident">Resident</option>
                        <option value="delivery">Delivery</option>
                        <option value="worker">Worker</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Visiting Building</label>
                      <Input
                        placeholder="e.g. Tower B"
                        value={newVehicle.building}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, building: e.target.value }))}
                        className="rounded-xl h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">Flat Unit Number</label>
                    <Input
                      placeholder="e.g. B-404"
                      value={newVehicle.unit}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, unit: e.target.value }))}
                      className="rounded-xl h-10"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 border-0 shadow-md font-semibold"
                  >
                    Log Vehicle Entry
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Right: Active vehicles inside */}
            <Card className="lg:col-span-7 border-border/50 flex flex-col h-[520px] overflow-hidden">
              <CardHeader className="border-b border-border/20 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Car className="w-5 h-5 text-indigo-500" />
                  Vehicles Inside Society
                </CardTitle>
                <CardDescription>Log checkout when vehicles leave the premises</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by license plate or owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 rounded-xl"
                  />
                </div>

                {vehicleLogs.filter(log =>
                  log.status === "inside" &&
                  (log.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) || log.ownerName.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                    <Car className="w-8 h-8 text-muted-foreground/30" />
                    No matched vehicles inside society.
                  </div>
                ) : (
                  vehicleLogs.filter(log =>
                    log.status === "inside" &&
                    (log.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) || log.ownerName.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).map(log => (
                    <div key={log.id} className="p-3.5 rounded-xl border border-border bg-card flex justify-between items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold font-mono text-sm tracking-wider text-foreground">{log.vehicleNumber}</span>
                          <Badge variant="outline" className="text-[9px] uppercase px-1.5">{log.ownerType}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Owner: {log.ownerName} • Unit: {log.unit} • In: {new Date(log.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => logVehicleExit(log.id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-8 px-3 text-[11px] font-semibold border-0 shrink-0"
                      >
                        Record Exit
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* SHIFT & INCIDENT TAB */}
        {activeTab === "shift" && (
          <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Left: Log new incident */}
            <Card className="lg:col-span-5 border-border/50">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-red-500" />
                  Log Daily Incident Report
                </CardTitle>
                <CardDescription>File visitor disputes, noise complaints, or parking violations</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleAddIncidentSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Incident Type</label>
                      <select
                        value={newIncident.type}
                        onChange={(e) => setNewIncident(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs"
                      >
                        <option value="Visitor Dispute">Visitor Dispute</option>
                        <option value="Lost Child">Lost Child</option>
                        <option value="Vehicle Damage">Vehicle Damage</option>
                        <option value="Parking Violation">Parking Violation</option>
                        <option value="Noise Complaint">Noise Complaint</option>
                        <option value="Theft Attempt">Theft Attempt</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Location</label>
                      <Input
                        placeholder="e.g. Tower A Lobby"
                        value={newIncident.location}
                        onChange={(e) => setNewIncident(prev => ({ ...prev, location: e.target.value }))}
                        className="rounded-xl h-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">Incident Details</label>
                    <textarea
                      placeholder="Provide full description of the dispute, safety concern, or violation..."
                      value={newIncident.description}
                      onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full h-24 p-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 border-0 shadow-md font-semibold"
                  >
                    File Incident Report
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Right: Security Announcements Form & Shift Notes */}
            <div className="lg:col-span-7 space-y-6">
              {/* Security Announcements Broadcaster */}
              <Card className="border-border/50">
                <CardHeader className="pb-3 border-b border-border/20">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <PlusCircle className="w-4.5 h-4.5 text-blue-500" />
                    Publish Gate Notice / Alert
                  </CardTitle>
                  <CardDescription>Publish security notices or gate closure alerts directly to residents</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <form onSubmit={handleAddAnnSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-[11px] font-bold text-muted-foreground block mb-1">Notice Title</label>
                        <Input
                          placeholder="e.g. Gate 1 Maintenance Closure"
                          value={newAnn.title}
                          onChange={(e) => setNewAnn(prev => ({ ...prev, title: e.target.value }))}
                          className="rounded-xl h-10"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-1">Priority</label>
                        <select
                          value={newAnn.priority}
                          onChange={(e) => setNewAnn(prev => ({ ...prev, priority: e.target.value as any }))}
                          className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs"
                        >
                          <option value="normal">Normal</option>
                          <option value="important">Important</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Notice Details</label>
                      <Input
                        placeholder="e.g. Gate 1 closed tonight 11 PM to 4 AM for concrete curing."
                        value={newAnn.content}
                        onChange={(e) => setNewAnn(prev => ({ ...prev, content: e.target.value }))}
                        className="rounded-xl h-10"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 border-0 font-semibold text-xs"
                    >
                      Publish Notice to Residents
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Shift info */}
              <Card className="border-border/50">
                <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-foreground">Shift Handover & Operations</h4>
                    <p className="text-muted-foreground mt-0.5">Assigned Gates: Gate 1 Main Entrance, Gate 2 Emergency Exit Only.</p>
                    <p className="text-muted-foreground mt-0.5">Next Shift Guard: Satish Kumar (Shift: Afternoon)</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl font-medium border border-border/30">
                    Shift Period: 07:00 AM - 03:00 PM
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* CCTV MONITORING TAB */}
        {activeTab === "cctv" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            {[
              { cam: "CAM-01", name: "Main Entry Gate 1", location: "Gate 1 Main Pathway", status: "Recording" },
              { cam: "CAM-02", name: "Tower A Lobby Entrance", location: "Tower A Lift Corridor", status: "Recording" },
              { cam: "CAM-03", name: "Basement Parking Level B1", location: "Parking Bay Area 12-25", status: "Recording" },
              { cam: "CAM-04", name: "Clubhouse Gym Lobby", location: "Clubhouse Staircase", status: "Recording" },
            ].map((cam, idx) => (
              <Card key={idx} className="border-border/50 overflow-hidden relative group">
                <div className="h-44 bg-neutral-900 border-b border-border relative flex items-center justify-center text-neutral-500">
                  <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] font-bold text-green-500 font-mono flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    LIVE · {cam.cam}
                  </div>
                  <Camera className="w-10 h-10 opacity-30 group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] absolute bottom-2 right-2 text-neutral-400 font-mono">1080p @ 30 FPS</span>
                </div>
                <CardContent className="p-4 text-xs">
                  <span className="font-extrabold block text-foreground">{cam.name}</span>
                  <span className="text-muted-foreground text-[10px] block mt-0.5">{cam.location}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* DENY VISITOR CONFIRMATION MODAL */}
      {showDenyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border shadow-2xl rounded-3xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-2 text-red-500 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              Deny Visitor Entry
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Please provide a valid security reason for denying guest access. This will be reported directly to the resident flat.</p>
            <textarea
              placeholder="e.g. Visitor could not verify relationship with resident, or vehicle was carrying restricted cargo."
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              className="w-full h-24 p-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowDenyModal(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={submitDeny} disabled={!denyReason} className="bg-red-600 hover:bg-red-700 text-white rounded-xl border-0">Confirm Denial</Button>
            </div>
          </motion.div>
        </div>
      )}
      {/* HANDOVER CONFIRMATION MODAL */}
      {showHandoverDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border shadow-2xl rounded-3xl p-6 w-full max-w-md text-xs space-y-4"
          >
            <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-indigo-600 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              Log Handover Verification
            </h3>
            <p className="text-muted-foreground">Verify the resident is physically present at the security desk before submitting handover details.</p>
            {selectedClaimForHandover && (
              <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
                <div className="font-bold text-foreground">Item: {selectedClaimForHandover.item.category}</div>
                <div className="text-muted-foreground">Description: {selectedClaimForHandover.item.description}</div>
                <div className="text-muted-foreground">Claimant: {selectedClaimForHandover.claim.residentName}</div>
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground block mb-1">Handed Over To / Collected By</label>
              <Input
                value={collectedBy}
                onChange={(e) => setCollectedBy(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground block mb-1">Verified By (Security Officer Name)</label>
              <Input
                value={verifiedBySecurity}
                onChange={(e) => setVerifiedBySecurity(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => {
                setShowHandoverDialog(false);
                setSelectedClaimForHandover(null);
              }} className="rounded-xl">Cancel</Button>
              <Button 
                onClick={async () => {
                  if (!collectedBy || !verifiedBySecurity) return;
                  setResolving(true);
                  try {
                    await pickupItem(selectedClaimForHandover.claim.id, collectedBy, verifiedBySecurity);
                    setShowHandoverDialog(false);
                    setSelectedClaimForHandover(null);
                    alert("Handover completed and resolved successfully.");
                  } catch (e) {
                    alert("Failed to resolve handover.");
                  } finally {
                    setResolving(false);
                  }
                }}
                disabled={resolving || !collectedBy || !verifiedBySecurity}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl border-0"
              >
                {resolving ? "Confirming..." : "Confirm Handover"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
