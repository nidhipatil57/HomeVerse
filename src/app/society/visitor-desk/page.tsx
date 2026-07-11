"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Clock, LogIn, LogOut, Check, UserCheck, ShieldClose, Ban, Plus, Shield, Search,
  AlertTriangle, Truck, Car, Activity, Eye, ClipboardCheck, XCircle, PlusCircle, ArrowRight,
  ShieldAlert, Phone, Building, QrCode, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import type { VisitorStatus, Visitor } from "@/types";

const statusConfig: Record<VisitorStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "Awaiting Approval", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  approved: { label: "Approved Pass", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  "at-gate": { label: "At Main Gate", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: ShieldAlert },
  "checked-in": { label: "Inside Premises", color: "bg-blue-600/10 text-blue-600 border-blue-500/20", icon: LogIn },
  inside: { label: "Inside Premises", color: "bg-blue-600/10 text-blue-600 border-blue-500/20", icon: LogIn },
  "checked-out": { label: "Checked Out", color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: LogOut },
  expired: { label: "Pass Expired", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: XCircle },
  cancelled: { label: "Cancelled", color: "bg-gray-400/10 text-gray-400 border-gray-400/20", icon: XCircle },
  denied: { label: "Entry Denied", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: Ban },
  expected: { label: "Expected", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20", icon: Clock },
};

const deliveryBrands = [
  { name: "Amazon", logo: "📦", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { name: "Flipkart", logo: "🛒", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { name: "Swiggy", logo: "🍕", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  { name: "Zomato", logo: "🍔", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  { name: "Blinkit", logo: "🥬", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  { name: "Zepto", logo: "⚡", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { name: "Courier", logo: "✉️", color: "bg-gray-500/10 text-gray-600 border-gray-500/20" }
];

export default function SecurityVisitorDeskPage() {
  const { user, initialize } = useAuth();
  const {
    visitors, checkInVisitor, checkOutVisitor, denyVisitorEntry,
    submitVisitorRequest, logEmergencyVisitor, complaints, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      visitors: state.visitors || [],
      checkInVisitor: state.checkInVisitor,
      checkOutVisitor: state.checkOutVisitor,
      denyVisitorEntry: state.denyVisitorEntry,
      submitVisitorRequest: state.submitVisitorRequest,
      logEmergencyVisitor: state.logEmergencyVisitor,
      complaints: state.complaints || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Verification states
  const [otpVerifyCode, setOtpVerifyCode] = useState("");
  const [verificationResult, setVerificationResult] = useState<{ success: boolean; msg: string; visitor?: Visitor } | null>(null);

  // Walk-in form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("Personal Visit");
  const [visitorType, setVisitorType] = useState("Guests");
  const [visitingUnit, setVisitingUnit] = useState("");
  const [visitingResident, setVisitingResident] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<'two-wheeler' | 'four-wheeler' | 'none'>("none");
  const [remarks, setRemarks] = useState("");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Delivery partner state
  const [selectedBrand, setSelectedBrand] = useState<string>("Amazon");
  const [deliveryFlat, setDeliveryFlat] = useState("");
  const [deliveryRemarks, setDeliveryRemarks] = useState("");
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // Emergency state
  const [emergencyAgency, setEmergencyAgency] = useState("");
  const [emergencyReason, setEmergencyReason] = useState("");
  const [emergencyVehicle, setEmergencyVehicle] = useState("");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Deny modal state
  const [denyReason, setDenyReason] = useState("");
  const [activeDenyId, setActiveDenyId] = useState("");
  const [denyRemarks, setDenyRemarks] = useState("");
  const [showDenyModal, setShowDenyModal] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  // Filter expected visitors, checked in visitors
  const expectedQueue = visitors.filter(
    (v) => v.portal === "society" && (v.status === "approved" || v.status === "expected" || v.status === "pending" || v.status === "at-gate")
  );
  
  const checkedInQueue = visitors.filter(
    (v) => v.portal === "society" && (v.status === "checked-in" || v.status === "inside")
  );

  const filteredExpected = expectedQueue.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.visitingUnit.includes(searchQuery) ||
    (v.otp && v.otp.includes(searchQuery))
  );

  // Worker Entry Sync: query assigned technicians from complaints
  const activeTechnicians = complaints.filter(
    (c) => c.portal === "society" && (c.status === "assigned" || c.status === "in-progress") && c.assignedTo
  );

  // Registered helpers (domestic help database list)
  const domesticWorkers = [
    { id: "dw-1", name: "Kamla Bai", category: "Maid", schedule: "Mon-Sat, 8:00 AM", assignedUnits: ["A-301", "B-102"], phone: "+91 98000 11001" },
    { id: "dw-2", name: "Shankar Kumar", category: "Cook", schedule: "Mon-Sun, 7:30 AM", assignedUnits: ["A-301", "C-504"], phone: "+91 98000 11002" },
    { id: "dw-3", name: "Pooja Sharma", category: "Deep Cleaner", schedule: "Weekend shifts", assignedUnits: ["B-404"], phone: "+91 98000 11003" },
    { id: "dw-4", name: "Rajesh Guard", category: "Driver", schedule: "Daily Helper", assignedUnits: ["A-102"], phone: "+91 98000 11004" }
  ];

  // OTP/QR code verification logic
  const handleVerifyPass = () => {
    if (!otpVerifyCode) return;
    const matched = visitors.find(
      (v) => v.portal === "society" && (v.otp === otpVerifyCode || v.qrCode === otpVerifyCode || v.id === otpVerifyCode)
    );

    if (matched) {
      if (matched.status === "checked-out") {
        setVerificationResult({ success: false, msg: "Visitor already checked out.", visitor: matched });
      } else if (matched.status === "denied") {
        setVerificationResult({ success: false, msg: "Visitor previously flagged as DENIED entry.", visitor: matched });
      } else {
        setVerificationResult({ success: true, msg: "Pass verified successfully!", visitor: matched });
      }
    } else {
      setVerificationResult({ success: false, msg: "Invalid OTP or QR Gatepass Code." });
    }
  };

  const handleVerifyCheckIn = async (id: string) => {
    await checkInVisitor(id, "Pass Code verified");
    setOtpVerifyCode("");
    setVerificationResult(null);
    alert("Visitor verified and checked in!");
  };

  const handleOpenDeny = (id: string) => {
    setActiveDenyId(id);
    setDenyReason("");
    setDenyRemarks("");
    setShowDenyModal(true);
  };

  const submitDeny = async () => {
    if (!denyReason) return;
    await denyVisitorEntry(activeDenyId, denyReason, denyRemarks);
    setShowDenyModal(false);
    alert("Visitor entry denied.");
  };

  // Register walk-in guest
  const handleRegisterWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !visitingUnit || !visitingResident) return;

    const initialStatus: VisitorStatus = needsApproval ? "pending" : "approved";

    await submitVisitorRequest({
      name,
      phone,
      purpose,
      visitorType,
      visitType: "one-time",
      visitingUnit,
      visitingResident,
      expectedAt: new Date().toISOString(),
      vehicleNumber: vehicleNumber || undefined,
      vehicleType,
      numberOfVisitors: 1,
      specialInstructions: remarks,
      status: initialStatus,
      date: new Date().toISOString().split("T")[0],
      portal: "society"
    });

    if (!needsApproval) {
      // Find and check-in immediately if auto-approved
      setTimeout(async () => {
        const added = useCommunityStore.getState().visitors.find(v => v.name === name && v.phone === phone);
        if (added) await checkInVisitor(added.id, remarks || "Walk-In");
      }, 300);
      alert("Walk-in visitor registered and checked-in.");
    } else {
      alert("Verification request sent to flat owner. Awaiting approval.");
    }

    // Reset Form
    setName("");
    setPhone("");
    setPurpose("Personal Visit");
    setVisitorType("Guests");
    setVisitingUnit("");
    setVisitingResident("");
    setVehicleNumber("");
    setVehicleType("none");
    setRemarks("");
    setNeedsApproval(false);
    setDialogOpen(false);
  };

  // Delivery Partner workflow
  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryFlat) return;

    // Fast log delivery partner as checked-in
    await submitVisitorRequest({
      name: `${selectedBrand} Partner`,
      phone: "N/A",
      purpose: `${selectedBrand} Delivery`,
      visitorType: "Delivery Partner",
      visitType: "one-time",
      visitingUnit: deliveryFlat,
      visitingResident: "Flat Owner",
      expectedAt: new Date().toISOString(),
      status: "checked-in",
      date: new Date().toISOString().split("T")[0],
      portal: "society"
    });

    // Find and check-in immediately
    setTimeout(async () => {
      const added = useCommunityStore.getState().visitors.find(
        v => v.visitingUnit === deliveryFlat && v.name === `${selectedBrand} Partner` && v.status === "approved"
      );
      if (added) await checkInVisitor(added.id, deliveryRemarks || "Delivery check-in");
    }, 300);

    setDeliveryFlat("");
    setDeliveryRemarks("");
    setShowDeliveryModal(false);
    alert(`${selectedBrand} Delivery Partner logged and Resident notified.`);
  };

  // Emergency Entry quick bypass
  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyAgency || !emergencyReason) return;

    await logEmergencyVisitor(emergencyAgency, emergencyReason, emergencyVehicle);

    setEmergencyAgency("");
    setEmergencyReason("");
    setEmergencyVehicle("");
    setShowEmergencyModal(false);
    alert("EMERGENCY VEHICLE ENTRY LOGGED & SIREN BROADCASTED!");
  };

  // Log recurring Helper / Maid entry attendance
  const handleLogHelperAttendance = async (helper: typeof domesticWorkers[0], type: "check-in" | "check-out") => {
    if (type === "check-in") {
      await submitVisitorRequest({
        name: helper.name,
        phone: helper.phone,
        purpose: `Daily Helper Attendance - ${helper.category}`,
        visitorType: helper.category,
        visitType: "recurring",
        visitingUnit: helper.assignedUnits[0],
        visitingResident: "Resident",
        expectedAt: new Date().toISOString(),
        status: "checked-in",
        date: new Date().toISOString().split("T")[0],
        portal: "society"
      });
      // Check in the entry
      setTimeout(async () => {
        const added = useCommunityStore.getState().visitors.find(v => v.name === helper.name && v.status === "approved");
        if (added) await checkInVisitor(added.id, "Domestic Helper checked-in");
      }, 300);
      alert(`Attendance Logged: ${helper.name} entered.`);
    } else {
      // Find helper check-in and exit
      const activeHelper = checkedInQueue.find(v => v.name === helper.name);
      if (activeHelper) {
        await checkOutVisitor(activeHelper.id);
        alert(`Attendance Logged: ${helper.name} exited.`);
      } else {
        alert("Helper not checked in.");
      }
    }
  };

  // Quick check-in for assigned electricians/plumbers
  const handleCheckInTechnician = async (tech: any) => {
    await submitVisitorRequest({
      name: tech.assignedTo.split(" (")[0],
      phone: "N/A",
      purpose: `Technician: ${tech.title}`,
      visitorType: "Technician",
      visitType: "one-time",
      visitingUnit: tech.unit,
      visitingResident: tech.raisedByName,
      expectedAt: new Date().toISOString(),
      status: "checked-in",
      date: new Date().toISOString().split("T")[0],
      portal: "society"
    });
    // Check-in
    setTimeout(async () => {
      const added = useCommunityStore.getState().visitors.find(v => v.visitingUnit === tech.unit && v.visitorType === "Technician" && v.status === "approved");
      if (added) await checkInVisitor(added.id, `Assigned worker for complaint: ${tech.id}`);
    }, 300);
    alert(`Technician ${tech.assignedTo} checked in and assigned to Flat ${tech.unit}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            <Shield className="w-8 h-8 text-red-500" /> Security Gateguard Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Gate guard station for verifying codes, checking walk-ins, and managing visitor parking slots.
          </p>
        </div>

        {/* Floating Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Walk-in Modal Trigger */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-md h-10 px-4 text-xs font-semibold rounded-xl">
                  <Plus className="w-4 h-4 mr-1.5" /> Log Walk-In Visitor
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)]">Register Walk-in Guest</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRegisterWalkIn} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Visitor Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Phone Number</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Target Flat</label>
                    <Input placeholder="e.g. A-301" value={visitingUnit} onChange={(e) => setVisitingUnit(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Resident Name</label>
                    <Input placeholder="e.g. Nidhi" value={visitingResident} onChange={(e) => setVisitingResident(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Purpose</label>
                    <Input placeholder="e.g. Personal Guest" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Category</label>
                    <select value={visitorType} onChange={(e) => setVisitorType(e.target.value)} className="w-full h-10 px-3 border rounded-xl text-xs bg-card">
                      <option>Guests</option>
                      <option>Family</option>
                      <option>Technician</option>
                      <option>Maid</option>
                      <option>Others</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Vehicle Type</label>
                    <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value as any)} className="w-full h-10 px-3 border rounded-xl text-xs bg-card">
                      <option value="none">No Vehicle</option>
                      <option value="two-wheeler">2-Wheeler</option>
                      <option value="four-wheeler">4-Wheeler</option>
                    </select>
                  </div>
                  {vehicleType !== "none" && (
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Vehicle Number</label>
                      <Input placeholder="e.g. MH 12 AB 1234" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} className="h-10 text-xs rounded-xl" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 py-1">
                  <input type="checkbox" id="needApprove" checked={needsApproval} onChange={(e) => setNeedsApproval(e.target.checked)} className="rounded text-primary" />
                  <label htmlFor="needApprove" className="text-xs text-muted-foreground font-semibold">Requires resident's popup approval</label>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Remarks</label>
                  <Input placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-10 bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl font-bold text-xs">
                  Register & Check-In
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Emergency Bypass Trigger */}
          <Dialog open={showEmergencyModal} onOpenChange={setShowEmergencyModal}>
            <DialogTrigger
              render={
                <Button className="bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-md h-10 px-4 text-xs font-semibold rounded-xl">
                  🚨 Log Emergency Entry
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)] text-red-600 flex items-center gap-1.5">🚨 Log Emergency Vehicle Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEmergencySubmit} className="space-y-4 mt-2">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Emergency Agency</label>
                  <select value={emergencyAgency} onChange={(e) => setEmergencyAgency(e.target.value)} className="w-full h-10 px-3 border rounded-xl text-xs bg-card" required>
                    <option value="">Choose Agency</option>
                    <option value="Ambulance">Ambulance 🚑</option>
                    <option value="Police">Police 🚓</option>
                    <option value="Fire Brigade">Fire Brigade 🚒</option>
                    <option value="Doctor">Doctor 🩺</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Emergency Reason / Details</label>
                  <Input placeholder="e.g. Critical Medical Condition flat A-301" value={emergencyReason} onChange={(e) => setEmergencyReason(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Emergency Vehicle Number (Optional)</label>
                  <Input placeholder="e.g. MH 12 EQ 8899" value={emergencyVehicle} onChange={(e) => setEmergencyVehicle(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-10 bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl font-bold text-xs shadow-md">
                  Verify Bypass & Open Boom Barrier
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Verification Hub */}
      <div className="grid lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 border-border/50 bg-card">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2"><QrCode className="w-5 h-5 text-primary" /> Gate Pass Verification</CardTitle>
            <CardDescription>Enter OTP code or scan pass to check-in expected guests</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter 4-digit OTP or Pass ID"
                value={otpVerifyCode}
                onChange={(e) => setOtpVerifyCode(e.target.value)}
                className="h-10 text-xs rounded-xl border-border/60"
              />
              <Button onClick={handleVerifyPass} className="bg-primary text-white border-0 rounded-xl h-10 px-4 text-xs font-semibold">
                Verify
              </Button>
            </div>

            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 border rounded-2xl text-xs space-y-3 ${
                  verificationResult.success
                    ? "bg-green-500/10 border-green-500/20 text-green-700"
                    : "bg-red-500/10 border-red-500/20 text-red-700"
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {verificationResult.success ? <CheckCircle2 className="w-4.5 h-4.5" /> : <XCircle className="w-4.5 h-4.5" />}
                  {verificationResult.msg}
                </div>

                {verificationResult.visitor && (
                  <div className="space-y-1 text-foreground/80 font-medium">
                    <p><span className="text-muted-foreground text-[10px]">Name:</span> {verificationResult.visitor.name}</p>
                    <p><span className="text-muted-foreground text-[10px]">Visiting Flat:</span> {verificationResult.visitor.visitingUnit} ({verificationResult.visitor.visitingResident})</p>
                    <p><span className="text-muted-foreground text-[10px]">Type:</span> {verificationResult.visitor.visitorType}</p>
                    {verificationResult.visitor.vehicleNumber && <p><span className="text-muted-foreground text-[10px]">Vehicle:</span> {verificationResult.visitor.vehicleNumber}</p>}
                  </div>
                )}

                {verificationResult.success && verificationResult.visitor && (
                  <Button
                    onClick={() => handleVerifyCheckIn(verificationResult.visitor!.id)}
                    className="w-full h-8 bg-green-600 hover:bg-green-700 text-white border-0 rounded-lg text-[10px] font-bold"
                  >
                    Confirm Check-In Entry
                  </Button>
                )}
              </motion.div>
            )}

            {/* Quick delivery logger grid */}
            <div className="pt-4 border-t border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Delivery Quick Logger</span>
              <div className="grid grid-cols-4 gap-1.5">
                {deliveryBrands.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => {
                      setSelectedBrand(brand.name);
                      setDeliveryFlat("");
                      setDeliveryRemarks("");
                      setShowDeliveryModal(true);
                    }}
                    className="flex flex-col items-center justify-center p-2 border border-border/50 rounded-xl bg-secondary/10 hover:bg-secondary/35 transition-all text-center gap-1"
                  >
                    <span className="text-lg">{brand.logo}</span>
                    <span className="text-[9px] font-bold text-foreground truncate w-full">{brand.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expected/Pending Queue */}
        <Card className="lg:col-span-8 border-border/50 bg-card flex flex-col h-[400px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3 flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500" /> Pre-Approved Expected Arrivals</CardTitle>
              <CardDescription>Scheduled visitor tickets verified from resident passes</CardDescription>
            </div>
            <Input
              placeholder="Search by Flat, Name, OTP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 h-9 text-xs rounded-xl border-border/60"
            />
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
            {filteredExpected.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-xs">
                No scheduled guests queued at the gate.
              </div>
            ) : (
              filteredExpected.map((v) => (
                <div key={v.id} className="p-4 rounded-2xl border border-border bg-secondary/15 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{v.name}</span>
                      <span className="text-muted-foreground font-semibold">({v.phone})</span>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">{v.visitorType}</Badge>
                      <Badge className={statusConfig[v.status]?.color || ""} variant="outline">{statusConfig[v.status]?.label}</Badge>
                    </div>
                    <p className="text-muted-foreground">Visiting Flat: <span className="font-bold text-foreground">{v.visitingUnit} ({v.visitingResident})</span> • OTP Code: <span className="font-mono font-bold text-primary">{v.otp || "N/A"}</span></p>
                    {v.specialInstructions && <p className="text-[10px] text-muted-foreground">Instructions: "{v.specialInstructions}"</p>}
                  </div>
                  <div className="flex gap-2">
                    {(v.status === "approved" || v.status === "expected") && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => checkInVisitor(v.id, "At-gate pre-approved")}
                          className="bg-green-600 hover:bg-green-700 text-white border-0 h-9 rounded-xl text-xs font-semibold"
                        >
                          Check In
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDeny(v.id)}
                          className="border-red-500/20 text-red-500 hover:bg-red-500/10 h-9 rounded-xl text-xs"
                        >
                          Deny Entry
                        </Button>
                      </>
                    )}
                    {(v.status === "pending" || v.status === "at-gate") && (
                      <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 animate-pulse"><Clock className="w-3.5 h-3.5" /> Awaiting Resident Approval</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active inside list */}
        <Card className="border-border/50 bg-card flex flex-col h-[400px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-500" /> Active Inside Complex ({checkedInQueue.length})</CardTitle>
            <CardDescription>Guests currently inside the society premises. Verify checkout on departure.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto space-y-2.5">
            {checkedInQueue.length === 0 ? (
              <div className="text-center py-20 text-xs text-muted-foreground">
                No active visitors inside society.
              </div>
            ) : (
              checkedInQueue.map((v) => (
                <div key={v.id} className="p-3.5 border border-border/60 rounded-2xl bg-card flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-foreground">{v.name}</span>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold ml-2">{v.visitorType}</Badge>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Flat: {v.visitingUnit} • Entry: {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</p>
                  </div>
                  <Button
                    onClick={() => {
                      checkOutVisitor(v.id);
                      alert("Visitor checked out!");
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white border-0 h-8 rounded-lg px-3 text-[10px] font-bold"
                  >
                    Check Out Log
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Assigned Workers Sync & Domestic help attendance */}
        <Card className="border-border/50 bg-card flex flex-col h-[400px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-base font-bold flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-blue-500" /> Workers & Helper Attendance</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col divide-y divide-border/20 overflow-y-auto">
            {/* Sync Workers Section */}
            <div className="p-4 space-y-2.5 bg-secondary/5">
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Expected Contractors (Assigned Complaints)</span>
              {activeTechnicians.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic">No assigned technicians expected today.</p>
              ) : (
                activeTechnicians.map((tech) => {
                  const isCheckedIn = checkedInQueue.some(v => v.visitingUnit === tech.unit && v.visitorType === "Technician");
                  return (
                    <div key={tech.id} className="p-3 border border-border bg-card rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-foreground">{tech.assignedTo}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Task: {tech.title} • Flat {tech.unit} ({tech.raisedByName})</p>
                      </div>
                      {!isCheckedIn ? (
                        <Button
                          onClick={() => handleCheckInTechnician(tech)}
                          className="bg-primary text-white border-0 h-8 rounded-lg text-[9px] font-bold"
                        >
                          Check In Tech
                        </Button>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px]">Inside Flat</Badge>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Domestic Workers Attendance List */}
            <div className="p-4 space-y-3">
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Domestic helper Roster</span>
              <div className="grid gap-2.5">
                {domesticWorkers.map((helper) => {
                  const activeEntry = checkedInQueue.find(v => v.name === helper.name);
                  return (
                    <div key={helper.id} className="p-3 border border-border/50 bg-card rounded-2xl flex justify-between items-center text-xs">
                      <div className="flex gap-2 items-center">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-secondary font-bold text-[10px]">{helper.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-bold text-foreground">{helper.name}</span>
                          <span className="text-muted-foreground font-semibold ml-2">({helper.category})</span>
                          <p className="text-[9px] text-muted-foreground">Flats: {helper.assignedUnits.join(", ")} • shift: {helper.schedule}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {!activeEntry ? (
                          <Button
                            onClick={() => handleLogHelperAttendance(helper, "check-in")}
                            className="bg-green-600 hover:bg-green-700 text-white border-0 h-8 rounded-lg text-[9px] font-semibold"
                          >
                            Check In
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleLogHelperAttendance(helper, "check-out")}
                            className="bg-amber-600 hover:bg-amber-700 text-white border-0 h-8 rounded-lg text-[9px] font-semibold"
                          >
                            Log Exit
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DELIVERY PARTNER LOG MODAL */}
      <Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Log {selectedBrand} Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDeliverySubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Target Flat / Unit</label>
              <Input placeholder="e.g. A-301" value={deliveryFlat} onChange={(e) => setDeliveryFlat(e.target.value)} className="h-11 rounded-xl text-xs" required />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Special Delivery Remarks</label>
              <Input placeholder="e.g. Courier packet dropoff at door" value={deliveryRemarks} onChange={(e) => setDeliveryRemarks(e.target.value)} className="h-11 rounded-xl text-xs" />
            </div>
            <Button type="submit" className="w-full h-11 gradient-primary text-white border-0 rounded-xl font-bold text-xs mt-2">
              Send Notification & Check-In
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DENY ENTRY MODAL */}
      <Dialog open={showDenyModal} onOpenChange={setShowDenyModal}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Flag and Deny Gate Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Reason for Denial</label>
              <select
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                className="w-full h-10 px-3 border rounded-xl text-xs bg-card"
                required
              >
                <option value="">Select Reason</option>
                <option>Invalid OTP / Mismatched Gate Pass Code</option>
                <option>Resident refused entry confirmation</option>
                <option>Visitor carrying restricted cargo / items</option>
                <option>Suspicious or uncooperative visitor behaviour</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Security Guard Remarks</label>
              <Input
                placeholder="Optional remarks"
                value={denyRemarks}
                onChange={(e) => setDenyRemarks(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowDenyModal(false)} className="rounded-xl text-xs h-9 font-bold">Cancel</Button>
              <Button onClick={submitDeny} className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl text-xs h-9 font-bold">Flag Denied Entry</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
