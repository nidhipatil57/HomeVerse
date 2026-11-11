"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Search, Clock, LogIn, LogOut, QrCode, Phone, Building2, Shield, UserX, Check,
  UserCheck, Ban, Camera, Calendar, Users, Download, Share2, ShieldAlert,
  AlertCircle, CheckCircle2, XCircle, ArrowRight, RefreshCw, Eye, Sparkles,
  Package, Truck, User, KeyRound, CalendarDays, Trash2, X, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import type { VisitorStatus, Visitor, GatePass } from "@/types";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {
  generateVisitorPassBlob,
  downloadPassBlob,
  sharePassImageToApps,
} from "@/lib/visitorPassGenerator";

const deliveryPartners = [
  { name: "Amazon", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { name: "Flipkart", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { name: "Blinkit", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  { name: "Zepto", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { name: "Swiggy", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  { name: "Zomato", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  { name: "Other", color: "bg-gray-500/10 text-gray-600 border-gray-500/20" }
];

const rolePresets = ["Personal Guest", "Family Member", "Relative", "Friend", "Visitor"];

export default function VisitorsPage() {
  const { user, initialize } = useAuth();
  const {
    visitors,
    gatePasses,
    submitVisitorRequest,
    cancelVisitorRequest,
    approveVisitorRequest,
    denyVisitorEntry,
    issueGatePass,
    revokeGatePass,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      visitors: state.visitors || [],
      gatePasses: state.gatePasses || [],
      submitVisitorRequest: state.submitVisitorRequest,
      cancelVisitorRequest: state.cancelVisitorRequest,
      approveVisitorRequest: state.approveVisitorRequest,
      denyVisitorEntry: state.denyVisitorEntry,
      issueGatePass: state.issueGatePass,
      revokeGatePass: state.revokeGatePass,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"check-in" | "gate-pass">("check-in");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================
  // Section A: Visitor Pre-Approval Modal State
  // ==========================================
  const [showPreApproveModal, setShowPreApproveModal] = useState(false);
  const [entryMode, setEntryMode] = useState<"guest" | "delivery">("guest");
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [expectedDate, setExpectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expectedTime, setExpectedTime] = useState("12:00 PM");
  const [purpose, setPurpose] = useState("Personal Visit");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [deliveryCompany, setDeliveryCompany] = useState("Amazon");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [submittingVisitor, setSubmittingVisitor] = useState(false);

  // ==========================================
  // Section B: Simplified Clean Gate Pass Modal State
  // ==========================================
  const [showGatePassModal, setShowGatePassModal] = useState(false);
  const [passPersonName, setPassPersonName] = useState("");
  const [passRole, setPassRole] = useState("Personal Guest");
  const [passPersonPhone, setPassPersonPhone] = useState("");
  const [submittingPass, setSubmittingPass] = useState(false);

  // ==========================================
  // Shared QR Digital Pass Card Preview Modal
  // ==========================================
  const [activeCardData, setActiveCardData] = useState<any | null>(null);
  const [showPassCardModal, setShowPassCardModal] = useState(false);
  const [isSharingPass, setIsSharingPass] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Pre-approve Visitor / Delivery handler
  const handleCreateVisitorApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (entryMode === "guest" && !visitorName.trim()) {
      alert("Please provide the visitor's name");
      return;
    }

    setSubmittingVisitor(true);
    const resolvedName = entryMode === "delivery" ? (visitorName.trim() || `${deliveryCompany} Delivery Partner`) : visitorName.trim();
    const resolvedExpectedAt = `${expectedDate} ${expectedTime}`;
    const resolvedUnit = user?.unit || "202";
    const resolvedResident = user?.name || "Resident";

    try {
      const created = await submitVisitorRequest({
        name: resolvedName,
        phone: visitorPhone || "+91 98000 00000",
        purpose: entryMode === "delivery" ? `Delivery from ${deliveryCompany}` : purpose,
        visitorType: entryMode === "delivery" ? "Delivery Partner" : "Guests",
        visitType: "one-time",
        visitingUnit: resolvedUnit,
        visitingResident: resolvedResident,
        expectedAt: resolvedExpectedAt,
        vehicleNumber: vehicleNumber || undefined,
        vehicleType: vehicleNumber ? "two-wheeler" : "none",
        numberOfVisitors: 1,
        specialInstructions: entryMode === "delivery" ? (deliveryNotes || `Delivery company: ${deliveryCompany}`) : "",
        status: "approved",
        date: expectedDate,
        portal: "society",
        isDelivery: entryMode === "delivery",
        deliveryCompany: entryMode === "delivery" ? deliveryCompany : undefined,
      });

      setShowPreApproveModal(false);
      // Reset form
      setVisitorName("");
      setVisitorPhone("");
      setVehicleNumber("");
      setDeliveryNotes("");

      // Open the digital pass card modal immediately
      const passPayload = {
        id: (created as any)?.id || `VIS-${Math.floor(1000 + Math.random() * 9000)}`,
        name: resolvedName,
        visitingUnit: resolvedUnit,
        visitingResident: resolvedResident,
        visitorType: entryMode === "delivery" ? `${deliveryCompany} Delivery` : "Guest",
        expectedAt: resolvedExpectedAt,
        otp: (created as any)?.otp || String(Math.floor(100000 + Math.random() * 900000)),
        isDelivery: entryMode === "delivery",
        deliveryCompany: entryMode === "delivery" ? deliveryCompany : undefined,
        date: expectedDate
      };
      setActiveCardData(passPayload);
      setShowPassCardModal(true);
    } catch (err: any) {
      alert("Error generating pass: " + (err?.message || "Please try again"));
    } finally {
      setSubmittingVisitor(false);
    }
  };

  // Issue Gate Pass handler - Simplified & Clean
  const handleCreateGatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passPersonName.trim()) {
      alert("Please enter person's name");
      return;
    }

    setSubmittingPass(true);
    const resolvedRole = passRole.trim() || "Personal Guest";
    const resolvedUnit = user?.unit || "202";
    const resolvedResident = user?.name || "Resident";
    const resolvedPhone = passPersonPhone.trim() || "+91 98000 00000";

    try {
      const createdPass = await issueGatePass({
        name: passPersonName.trim(),
        phone: resolvedPhone,
        passType: resolvedRole,
        purpose: `${resolvedRole} Gate Pass`,
        validFrom: new Date().toISOString().split("T")[0],
        validTo: "Open",
        permittedDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        allowedTimings: "All Day",
        assignedResident: resolvedResident,
        unit: resolvedUnit,
        building: user?.building || "A Wing"
      });

      setShowGatePassModal(false);
      // Reset fields
      setPassPersonName("");
      setPassRole("Personal Guest");
      setPassPersonPhone("");

      // Open digital pass card modal with safe fallback object
      const passData = (createdPass as any) || {
        id: `GP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: passPersonName.trim(),
        phone: resolvedPhone,
        passType: resolvedRole,
        purpose: `${resolvedRole} Gate Pass`,
        unit: resolvedUnit,
        visitingUnit: resolvedUnit,
        assignedResident: resolvedResident,
        visitingResident: resolvedResident,
        otp: String(Math.floor(100000 + Math.random() * 900000)),
        status: "active",
        createdAt: new Date().toISOString()
      };

      setActiveCardData({
        ...passData,
        visitingUnit: passData.unit || resolvedUnit,
        visitingResident: passData.assignedResident || resolvedResident,
        visitorType: resolvedRole
      });
      setShowPassCardModal(true);
    } catch (err: any) {
      alert("Error issuing Gate Pass: " + (err?.message || "Please try again"));
    } finally {
      setSubmittingPass(false);
    }
  };

  // Digital Pass Card: Share
  const handleSharePassImage = async () => {
    if (!activeCardData) return;
    setIsSharingPass(true);
    setShareFeedback(null);
    try {
      const res = await sharePassImageToApps(activeCardData, {
        societyName: user?.societyName || "HomeVerse Complex",
      });
      if (res.method === "native-share" && res.success) {
        setShareFeedback({ type: "success", message: "Pass card image shared successfully!" });
      } else if (res.error) {
        setShareFeedback({ type: "info", message: res.error });
      }
    } catch (err: any) {
      setShareFeedback({ type: "error", message: err?.message || "Could not share image" });
    } finally {
      setIsSharingPass(false);
    }
  };

  // Digital Pass Card: Download PNG
  const handleDownloadPassImage = async () => {
    if (!activeCardData) return;
    setIsSharingPass(true);
    setShareFeedback(null);
    try {
      const blob = await generateVisitorPassBlob(activeCardData, {
        societyName: user?.societyName || "HomeVerse Complex",
      });
      const cleanName = (activeCardData.name || "Pass").replace(/[^a-zA-Z0-9]/g, "_");
      downloadPassBlob(blob, `HomeVerse_GatePass_${cleanName}.png`);
      setShareFeedback({ type: "success", message: "Pass card PNG downloaded successfully!" });
    } catch (err: any) {
      setShareFeedback({ type: "error", message: "Failed to download image" });
    } finally {
      setIsSharingPass(false);
    }
  };

  // Revoke Gate Pass
  const handleRevokePass = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke the Gate Pass for ${name}?`)) {
      return;
    }
    await revokeGatePass(id);
    alert(`Gate Pass for ${name} has been revoked.`);
  };

  // Approve Walk-in
  const handleApproveWalkIn = async (visitor: Visitor) => {
    await approveVisitorRequest(visitor.id);
    alert(`Walk-in visitor ${visitor.name} approved. Security will allow entry.`);
  };

  // Deny Walk-in
  const handleDenyWalkIn = async (visitor: Visitor) => {
    const reason = prompt("Enter denial reason (optional):", "Resident unavailable") || "Resident denied entry";
    await denyVisitorEntry(visitor.id, reason, "Direct resident denial");
    alert(`Entry denied for ${visitor.name}.`);
  };

  // Active / Filtered lists
  const isSecurityOrSec = user?.role === "secretary" || user?.role === "security";

  // Filter visitors for resident flat or all if secretary/security
  const filteredVisitors = useMemo(() => {
    return visitors
      .filter((v) => {
        if (!isSecurityOrSec && user?.unit) {
          return v.visitingUnit === user.unit;
        }
        return true;
      })
      .filter((v) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          (v.name || "").toLowerCase().includes(q) ||
          (v.visitingUnit || "").toLowerCase().includes(q) ||
          (v.otp && v.otp.includes(q)) ||
          (v.deliveryCompany && v.deliveryCompany.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.expectedAt || b.date || 0).getTime() - new Date(a.expectedAt || a.date || 0).getTime());
  }, [visitors, user, isSecurityOrSec, searchQuery]);

  // Walk-in requests waiting for resident approval
  const pendingWalkIns = useMemo(() => {
    return filteredVisitors.filter((v) => v.status === "pending" || v.status === "at-gate");
  }, [filteredVisitors]);

  // Pre-approved & Expected visitors (upcoming or inside)
  const approvedVisitors = useMemo(() => {
    return filteredVisitors.filter((v) => v.status === "approved" || v.status === "expected" || v.status === "checked-in" || v.status === "inside");
  }, [filteredVisitors]);

  // Gate Passes filtered
  const filteredGatePasses = useMemo(() => {
    return gatePasses
      .filter((gp) => {
        if (!isSecurityOrSec && user?.unit) {
          return gp.unit === user.unit;
        }
        return true;
      })
      .filter((gp) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          (gp.name || "").toLowerCase().includes(q) ||
          (gp.phone && gp.phone.includes(q)) ||
          (gp.unit || "").toLowerCase().includes(q) ||
          (gp.otp && gp.otp.includes(q)) ||
          (gp.passType && gp.passType.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [gatePasses, user, isSecurityOrSec, searchQuery]);

  const activeGatePassesList = useMemo(() => {
    return filteredGatePasses.filter((p) => p.status === "active");
  }, [filteredGatePasses]);

  const inactiveGatePassesList = useMemo(() => {
    return filteredGatePasses.filter((p) => p.status === "revoked" || p.status === "expired");
  }, [filteredGatePasses]);

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-heading)] flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-primary" /> Visitor & Gate Passes
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Issue simple Gate Passes and pre-approve deliveries and visitors.
          </p>
        </div>

        {/* 2 Primary Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowPreApproveModal(true)}
            className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-5 rounded-xl text-sm shadow-md shadow-primary/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Pre-Approve Delivery / Guest
          </Button>

          <Button
            onClick={() => setShowGatePassModal(true)}
            variant="outline"
            className="border-primary/40 hover:bg-primary/5 text-primary font-bold h-11 px-4 rounded-xl text-xs flex items-center gap-1.5"
          >
            <KeyRound className="w-4 h-4" /> Issue Gate Pass
          </Button>
        </div>
      </div>

      {/* 2 Main Sections Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex bg-muted/70 p-1.5 rounded-2xl border border-border/60 self-start">
          <button
            onClick={() => setActiveTab("check-in")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "check-in"
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck className="w-4 h-4 text-primary" />
            Visitor & Deliveries
            <Badge variant="secondary" className="ml-1 text-xs px-2 py-0.5 h-5 font-semibold">
              {approvedVisitors.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("gate-pass")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "gate-pass"
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <QrCode className="w-4 h-4 text-primary" />
            Gate Passes
            <Badge variant="secondary" className="ml-1 text-xs px-2 py-0.5 h-5 font-semibold">
              {activeGatePassesList.length}
            </Badge>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by name, role, OTP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 text-xs rounded-xl bg-card border-border/60"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: GATE PASS (Primary simplified section) */}
      {/* ========================================================================= */}
      {activeTab === "gate-pass" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Active Gate Passes</h2>
              <p className="text-xs text-muted-foreground">
                Digital passes for regular visitors, helpers, and family members.
              </p>
            </div>
          </div>

          {activeGatePassesList.length === 0 ? (
            <Card className="border-dashed border-border/80 bg-card/50">
              <CardContent className="p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <KeyRound className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">No active Gate Passes</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Create a quick pass with person's name and who they are.
                  </p>
                </div>
                <Button
                  onClick={() => setShowGatePassModal(true)}
                  className="bg-primary text-white text-xs font-bold rounded-xl h-10 px-5"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Issue Gate Pass
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeGatePassesList.map((pass) => (
                <Card
                  key={pass.id}
                  className="border-border/60 bg-card hover:border-primary/40 transition-all rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <Avatar className="w-12 h-12 rounded-2xl border-2 border-primary/20 shadow-sm">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {pass.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-extrabold text-base text-foreground line-clamp-1">{pass.name}</h3>
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] font-bold mt-0.5">
                            {pass.passType || "Gate Pass"}
                          </Badge>
                        </div>
                      </div>

                      <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                        Active
                      </Badge>
                    </div>

                    {/* Clean Details */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-secondary/20 p-3.5 rounded-xl border border-border/50">
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider block">Flat</span>
                        <span className="font-bold text-foreground text-sm">{pass.unit}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider block">Pass Gate OTP</span>
                        <span className="font-mono font-bold text-primary text-base">{pass.otp || "389201"}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <Button
                        onClick={() => {
                          setActiveCardData({
                            ...pass,
                            visitingUnit: pass.unit,
                            visitingResident: pass.assignedResident,
                            visitorType: pass.passType,
                          });
                          setShowPassCardModal(true);
                        }}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-10 text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" /> View Digital Card
                      </Button>

                      <Button
                        onClick={() => handleRevokePass(pass.id, pass.name)}
                        variant="outline"
                        className="h-10 px-3.5 border-destructive/30 hover:bg-destructive/10 text-destructive text-xs font-semibold rounded-xl"
                        title="Revoke Gate Pass"
                      >
                        <Ban className="w-4 h-4 mr-1" /> Revoke
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Revoked Passes */}
          {inactiveGatePassesList.length > 0 && (
            <Card className="border-border/50 bg-card rounded-2xl shadow-sm mt-6">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-bold">Revoked Passes</CardTitle>
                <CardDescription className="text-xs">
                  Passes that were revoked and are invalid for security entry.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/40">
                {inactiveGatePassesList.map((pass) => (
                  <div key={pass.id} className="p-4 flex items-center justify-between text-xs hover:bg-secondary/10">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{pass.name}</span>
                        <Badge variant="outline" className="text-[10px] px-2 py-0">
                          {pass.passType}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-mono">Flat {pass.unit}</span>
                      </div>
                    </div>

                    <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] font-bold">
                      Revoked
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: VISITOR CHECK-IN & DELIVERIES */}
      {/* ========================================================================= */}
      {activeTab === "check-in" && (
        <div className="space-y-6">
          {/* Walk-in Approvals Banner */}
          {pendingWalkIns.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
              <CardHeader className="pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-600 animate-pulse" />
                  <div>
                    <CardTitle className="text-sm font-bold text-amber-950 dark:text-amber-200">
                      Walk-in Guests Waiting at Main Gate ({pendingWalkIns.length})
                    </CardTitle>
                    <CardDescription className="text-xs text-amber-800/80 dark:text-amber-300/80">
                      Security has logged unexpected visitors requesting entry to your flat.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {pendingWalkIns.map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-card border border-amber-500/20 rounded-xl"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-foreground">{v.name}</span>
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
                          At Gate
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">Flat {v.visitingUnit}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Phone: <span className="font-medium text-foreground">{v.phone}</span> • Purpose: {v.purpose || "Personal Visit"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleApproveWalkIn(v)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 px-3 rounded-lg text-xs"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Approve Entry
                      </Button>
                      <Button
                        onClick={() => handleDenyWalkIn(v)}
                        size="sm"
                        variant="destructive"
                        className="font-bold h-8 px-3 rounded-lg text-xs"
                      >
                        <Ban className="w-3.5 h-3.5 mr-1" /> Deny
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Approved & Expected Visitors */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Upcoming & Checked-In Visitors</h2>

            {approvedVisitors.length === 0 ? (
              <Card className="border-dashed border-border/80 bg-card/50">
                <CardContent className="p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">No pre-approved deliveries or visitors</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Pre-approve Amazon, Swiggy, or personal guests for seamless gate entry.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowPreApproveModal(true)}
                    size="sm"
                    className="bg-primary text-white text-xs font-bold rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Pre-Approve Delivery
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedVisitors.map((v) => {
                  const isCheckedIn = v.status === "checked-in" || v.status === "inside";
                  return (
                    <Card
                      key={v.id}
                      className="border-border/60 bg-card hover:border-primary/30 transition-all rounded-2xl shadow-sm overflow-hidden"
                    >
                      <CardContent className="p-4 space-y-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            {v.isDelivery ? (
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                                <Package className="w-5 h-5" />
                              </div>
                            ) : (
                              <Avatar className="w-10 h-10 rounded-xl border border-border/60">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                  {v.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <h3 className="font-extrabold text-sm text-foreground line-clamp-1">{v.name}</h3>
                              <span className="text-[11px] text-muted-foreground block">
                                {v.isDelivery ? `${v.deliveryCompany || "Delivery"} Partner` : "Guest"} • Flat {v.visitingUnit}
                              </span>
                            </div>
                          </div>

                          {isCheckedIn ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                              Inside
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[10px] font-bold">
                              Approved
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-secondary/20 p-2.5 rounded-xl border border-border/40">
                          <div>
                            <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Date</span>
                            <span className="font-semibold text-foreground">
                              {v.expectedAt ? new Date(v.expectedAt).toLocaleDateString() : v.date || "Today"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Gate OTP</span>
                            <span className="font-mono font-bold text-primary text-xs">{v.otp || "N/A"}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                          <Button
                            onClick={() => {
                              setActiveCardData(v);
                              setShowPassCardModal(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs font-semibold rounded-xl border-border/70 hover:bg-secondary flex items-center justify-center gap-1.5"
                          >
                            <QrCode className="w-3.5 h-3.5 text-primary" /> View Card
                          </Button>

                          {!isCheckedIn && (
                            <Button
                              onClick={() => {
                                if (confirm("Cancel this pre-approved pass?")) {
                                  cancelVisitorRequest(v.id);
                                }
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive rounded-xl"
                              title="Cancel pass"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SIMPLE & CLEAN GATE PASS MODAL (NO VALIDITY, UNCONGESTED) */}
      {/* ========================================================================= */}
      <Dialog open={showGatePassModal} onOpenChange={setShowGatePassModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-7 bg-card border-border/60 shadow-xl">
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="font-[family-name:var(--font-heading)] text-xl font-bold flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-primary" /> Issue Gate Pass
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter person's name and who they are to generate their digital gate pass card.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGatePass} className="space-y-5 mt-3">
            {/* 1. Person Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">
                Person's Full Name *
              </label>
              <Input
                placeholder="e.g. Raj"
                value={passPersonName}
                onChange={(e) => setPassPersonName(e.target.value)}
                className="h-11 text-sm rounded-xl px-3.5 bg-background border-border/70 focus:border-primary"
                required
                autoFocus
              />
            </div>

            {/* 2. Text box to enter who is it */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Who is it? (Role or Relationship) *
                </label>
              </div>
              <Input
                placeholder="e.g. Personal Guest, Family Member, Relative, Friend..."
                value={passRole}
                onChange={(e) => setPassRole(e.target.value)}
                className="h-11 text-sm rounded-xl px-3.5 bg-background border-border/70 focus:border-primary"
                required
              />

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {rolePresets.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setPassRole(r)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      passRole === r
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-secondary/40 hover:bg-secondary/70 border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Phone (Optional) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">
                Mobile Number <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                placeholder="+91 98765 43210"
                value={passPersonPhone}
                onChange={(e) => setPassPersonPhone(e.target.value)}
                className="h-11 text-sm rounded-xl px-3.5 bg-background border-border/70 focus:border-primary"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGatePassModal(false)}
                className="flex-1 h-11 text-xs font-bold rounded-xl border-border/70"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingPass}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-11 text-xs rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
              >
                {submittingPass ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Generate Gate Pass Card
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: PRE-APPROVE VISITOR / DELIVERY */}
      {/* ========================================================================= */}
      <Dialog open={showPreApproveModal} onOpenChange={setShowPreApproveModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border/60 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)] text-lg font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Pre-Approve Delivery / Guest
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Pre-approved entries grant instant verification at Security with QR and OTP.
            </DialogDescription>
          </DialogHeader>

          {/* Mode switch */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/40 rounded-xl mt-3 border border-border/50">
            <button
              type="button"
              onClick={() => setEntryMode("delivery")}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                entryMode === "delivery"
                  ? "bg-card text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-3.5 h-3.5 text-amber-500" /> Delivery Partner
            </button>
            <button
              type="button"
              onClick={() => setEntryMode("guest")}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                entryMode === "guest"
                  ? "bg-card text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-3.5 h-3.5 text-primary" /> Guest
            </button>
          </div>

          <form onSubmit={handleCreateVisitorApproval} className="space-y-4 mt-4">
            {entryMode === "delivery" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Delivery Partner</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {deliveryPartners.map((brand) => (
                    <button
                      key={brand.name}
                      type="button"
                      onClick={() => setDeliveryCompany(brand.name)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        deliveryCompany === brand.name
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-secondary/20 hover:bg-secondary/40 border-border/60 text-foreground"
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {entryMode === "delivery" ? "Delivery Partner / Driver Name (Optional)" : "Guest Name *"}
              </label>
              <Input
                placeholder={entryMode === "delivery" ? `${deliveryCompany} Partner` : "e.g. Rohan"}
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required={entryMode === "guest"}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Date</label>
                <Input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Expected Time</label>
                <Input
                  placeholder="12:00 PM"
                  value={expectedTime}
                  onChange={(e) => setExpectedTime(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreApproveModal(false)}
                className="flex-1 h-10 text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingVisitor}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-10 text-xs rounded-xl shadow-md shadow-primary/20"
              >
                {submittingVisitor ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                Generate Pass
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: DIGITAL PASS CARD PREVIEW (Clean, un-congested, no validity) */}
      {/* ========================================================================= */}
      <Dialog
        open={showPassCardModal}
        onOpenChange={(open) => {
          setShowPassCardModal(open);
          if (!open) setShareFeedback(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-primary/20 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)] text-center text-lg font-bold">
              Visitor Gate Pass
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground mt-0.5">
              Verifiable QR card. Share or download for entry.
            </DialogDescription>
          </DialogHeader>

          {activeCardData && (
            <div className="space-y-4 mt-2">
              {/* Card visual preview */}
              <div className="p-6 bg-gradient-to-b from-secondary/60 via-secondary/30 to-secondary/10 border border-border/70 rounded-2xl relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-28 h-28 bg-primary/10 rounded-full -mr-10 -mt-10 pointer-events-none" />

                {/* Society Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50 text-[11px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-foreground font-bold">
                    <Shield className="w-3.5 h-3.5 text-primary" /> {user?.societyName || "HomeVerse Society"}
                  </span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wide">
                    PRE-APPROVED
                  </span>
                </div>

                <div className="text-center space-y-3">
                  <div className="bg-card p-3 rounded-2xl inline-block shadow-sm border border-border/40">
                    <QRCodeSVG
                      id="visitor-pass-qr-svg"
                      value={`HOMEVERSE-PASS-${activeCardData.id}-${activeCardData.otp || "000000"}`}
                      size={120}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-foreground">{activeCardData.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {activeCardData.passType
                        ? `${activeCardData.passType} Pass`
                        : activeCardData.isDelivery
                        ? `${activeCardData.deliveryCompany || "Delivery"} Partner`
                        : `${activeCardData.visitorType || "Visitor"} Pass`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs pt-4 border-t border-dashed border-border/60">
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider block">Visiting Flat</span>
                    <span className="font-bold text-foreground text-base">
                      {activeCardData.visitingUnit || activeCardData.unit || user?.unit || "202"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider block">Pass Gate Code OTP</span>
                    <span className="font-bold text-primary text-lg font-mono">
                      {activeCardData.otp || "389201"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 text-center text-[10px] text-muted-foreground border-t border-border/40">
                  Show this QR code or share OTP at security gate for entry
                </div>
              </div>

              {/* Hidden QRCodeCanvas for direct pixel capture into exported image */}
              <div style={{ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0, pointerEvents: "none" }}>
                <QRCodeCanvas
                  id="visitor-pass-qr-canvas"
                  value={`HOMEVERSE-PASS-${activeCardData.id}-${activeCardData.otp || "000000"}`}
                  size={280}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* Share feedback */}
              {shareFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2.5 transition-all ${
                    shareFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                      : "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span className="leading-relaxed">{shareFeedback.message}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleSharePassImage}
                  disabled={isSharingPass}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                >
                  {isSharingPass ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  Share Card Image
                </Button>

                <Button
                  onClick={handleDownloadPassImage}
                  disabled={isSharingPass}
                  variant="outline"
                  className="h-11 px-4 rounded-xl border-border/60 hover:bg-secondary text-xs font-semibold flex items-center justify-center gap-1.5"
                  title="Download card image as PNG"
                >
                  <Download className="w-4 h-4 text-muted-foreground" />
                  Download PNG
                </Button>

                <Button
                  onClick={() => {
                    setShowPassCardModal(false);
                    setShareFeedback(null);
                  }}
                  variant="outline"
                  className="h-11 px-4 rounded-xl border-border/60 text-xs font-bold"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
