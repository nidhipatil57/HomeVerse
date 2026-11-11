"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Clock, LogIn, LogOut, Check, Plus, Wrench, Shield, CheckCircle2,
  AlertTriangle, Phone, Building, Calendar, ClipboardCheck, Trash2, ArrowRight,
  MapPin, Star, QrCode, Share2, Download, RefreshCw, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import type { Helper, HelperAttendance } from "@/types";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {
  generateVisitorPassBlob,
  downloadPassBlob,
  sharePassImageToApps,
} from "@/lib/visitorPassGenerator";

const helperCategories = [
  "Maid", "Cook", "Driver", "Cleaner", "Nanny", "Elder Care", "Laundry", "Housekeeping"
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DailyCheckInsPage() {
  const { user } = useAuth();
  const {
    helpers, attendance, flatAttendance, gatePasses, registerHelper, deleteHelper, removeHelperFromFlat, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      helpers: state.helpers || [],
      attendance: state.attendance || [],
      flatAttendance: state.flatAttendance || [],
      gatePasses: state.gatePasses || [],
      registerHelper: state.registerHelper,
      deleteHelper: state.deleteHelper,
      removeHelperFromFlat: state.removeHelperFromFlat,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [expandedHelper, setExpandedHelper] = useState<string | null>(null);

  // Digital Pass Card Modal States
  const [activePassData, setActivePassData] = useState<any | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [isSharingPass, setIsSharingPass] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  // Direct helper registration states (Maid or Cook)
  const [registerMode, setRegisterMode] = useState<"direct" | "directory">("direct");
  const [directName, setDirectName] = useState("");
  const [directPhone, setDirectPhone] = useState("");
  const [directCategory, setDirectCategory] = useState<"Maid" | "Cook">("Maid");

  // Selector form states
  const [availableHelpers, setAvailableHelpers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterService, setFilterService] = useState<string>("All");
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Form scheduling states (Step 2)
  const [expectedArrival, setExpectedArrival] = useState("08:30 AM");
  const [expectedExit, setExpectedExit] = useState("11:30 AM");
  const [workingDays, setWorkingDays] = useState<string[]>(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
  const [servicesRequired, setServicesRequired] = useState<string[]>([]);

  useEffect(() => {
    initializeDb();
    setMounted(true);
  }, [initializeDb]);

  // Fetch available maids when dialog opens
  useEffect(() => {
    if (registerOpen) {
      fetch("/api/visitors/helpers?available=true")
        .then(res => res.json())
        .then(data => {
          setAvailableHelpers(data || []);
          setStep(1);
          setSelectedWorker(null);
          setSearchQuery("");
          setFilterService("All");
        })
        .catch(err => console.error(err));
    }
  }, [registerOpen]);

  // Strictly domestic helper filter (Maids, Cooks, Housekeeping)
  const isDomesticHelper = (cat?: string) => {
    const c = (cat || "").toLowerCase();
    return c.includes("maid") || c.includes("cook") || c.includes("housekeep") || c.includes("cleaning");
  };

  // Derive assigned helpers: ONLY registered domestic helpers (maids, cooks) linked to this resident's flat
  const myHelpers = useMemo(() => {
    if (!user) return [];
    const cleanUserUnit = (user.unit || "").replace(/^[A-Za-z\s-]+/, '').trim();
    
    return helpers.filter(h => {
      // Must be a domestic helper (Maid, Cook, etc.), not a personal guest or general visitor
      if (!isDomesticHelper(h.category)) return false;

      if (h.residentIds?.includes(user.id)) return true;
      if (h.assignedResidents?.some(r => r && r.toLowerCase().includes((user.name || "").toLowerCase()))) return true;
      if (h.assignedFlats && h.assignedFlats.some(f => {
        if (!f) return false;
        const cleanFlat = f.replace(/^[A-Za-z\s-]+/, '').trim();
        return cleanFlat === cleanUserUnit || f === user.unit;
      })) return true;
      return false;
    });
  }, [helpers, user]);

  if (!mounted || !user) return null;

  // Open Gate Pass Preview
  const handleOpenPassModal = (helper: Helper) => {
    // Check if there is an existing gate pass in gatePasses
    const linkedPass = (gatePasses || []).find((gp) => {
      if (!gp) return false;
      if (helper?.passId && gp?.id && gp.id === helper.passId) return true;
      if (gp?.name && helper?.name && String(gp.name).toLowerCase() === String(helper.name).toLowerCase()) return true;
      return false;
    });

    const passPayload = linkedPass ? {
      ...linkedPass,
      visitingUnit: linkedPass.unit || user?.unit || "202",
      visitingResident: linkedPass.assignedResident || user?.name || "Resident",
      visitorType: linkedPass.passType || helper.category || "Maid"
    } : {
      id: helper.passId || `GP-${(helper.id || "101").replace("HLP-", "")}`,
      name: helper.name || "Domestic Helper",
      phone: helper.phone || "+91 98000 00000",
      passType: helper.category || "Maid",
      visitorType: helper.category || "Maid",
      unit: user?.unit || "202",
      visitingUnit: user?.unit || "202",
      assignedResident: user?.name || "Resident",
      visitingResident: user?.name || "Resident",
      otp: "389201",
      status: helper.passStatus || "active",
      createdAt: helper.joinedAt || new Date().toISOString()
    };

    setActivePassData(passPayload);
    setShareFeedback(null);
    setShowPassModal(true);
  };

  // Share Gate Pass as Image
  const handleSharePassImage = async () => {
    if (!activePassData) return;
    setIsSharingPass(true);
    setShareFeedback(null);
    try {
      const res = await sharePassImageToApps(activePassData, {
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

  // Download Gate Pass PNG
  const handleDownloadPassImage = async () => {
    if (!activePassData) return;
    setIsSharingPass(true);
    setShareFeedback(null);
    try {
      const blob = await generateVisitorPassBlob(activePassData, {
        societyName: user?.societyName || "HomeVerse Complex",
      });
      const cleanName = (activePassData.name || "Pass").replace(/[^a-zA-Z0-9]/g, "_");
      downloadPassBlob(blob, `HomeVerse_GatePass_${cleanName}.png`);
      setShareFeedback({ type: "success", message: "Pass card PNG downloaded successfully!" });
    } catch (err: any) {
      setShareFeedback({ type: "error", message: "Failed to download image" });
    } finally {
      setIsSharingPass(false);
    }
  };

  // Handle direct registration for Maid or Cook (with automatic gate pass generation)
  const handleRegisterDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directName.trim()) {
      alert("Please enter helper's full name");
      return;
    }

    try {
      const res = await registerHelper({
        name: directName.trim(),
        phone: directPhone.trim() || "+91 98000 00000",
        category: directCategory,
        workingDays,
        expectedArrival,
        expectedExit,
        assignedFlats: [user?.unit || "202"],
        assignedResidents: [user?.name || "Resident"],
        residentIds: [user?.id || ""],
        portal: "society"
      } as any);

      setRegisterOpen(false);
      setDirectName("");
      setDirectPhone("");

      // Open Gate Pass Card preview immediately!
      if (res?.pass) {
        setActivePassData({
          ...res.pass,
          visitingUnit: user?.unit || "202",
          visitingResident: user?.name || "Resident",
          visitorType: directCategory
        });
        setShareFeedback(null);
        setShowPassModal(true);
      }
    } catch (err: any) {
      alert("Error registering helper: " + (err?.message || "Please try again"));
    }
  };

  // Handle assignment submission from directory
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    try {
      const res = await registerHelper({
        workerId: selectedWorker.id,
        expectedArrival,
        expectedExit,
        workingDays,
        services: servicesRequired.length > 0 ? servicesRequired : selectedWorker.specializations,
        category: selectedWorker.workerCategory || "Maid",
        name: selectedWorker.name,
        phone: selectedWorker.phone || "+91 98000 00000",
        assignedFlats: [user?.unit || "202"],
        assignedResidents: [user?.name || "Resident"],
        residentIds: [user?.id || ""],
        portal: "society"
      } as any);

      setRegisterOpen(false);
      setSelectedWorker(null);
      setStep(1);

      // Open Gate Pass Card preview immediately!
      if (res?.pass) {
        setActivePassData({
          ...res.pass,
          visitingUnit: user?.unit || "202",
          visitingResident: user?.name || "Resident",
          visitorType: selectedWorker.workerCategory || "Maid"
        });
        setShareFeedback(null);
        setShowPassModal(true);
      }
    } catch (err: any) {
      alert("Error assigning helper: " + (err?.message || "Please try again"));
    }
  };

  // Remove maid/helper from resident's flat
  const handleRemoveHelper = async (helper: Helper) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${helper.name} (${helper.category}) from Flat ${user?.unit}? Their digital gate pass will also be revoked.`
    );
    if (!confirmed) return;

    try {
      await removeHelperFromFlat(helper.id, user?.unit || "202");
      alert(`${helper.name} has been removed from Flat ${user?.unit}.`);
    } catch (e: any) {
      alert("Failed to remove helper: " + (e?.message || "Please try again"));
    }
  };

  const toggleDay = (day: string) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleService = (srv: string) => {
    setServicesRequired(prev => 
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
    );
  };

  const parseTime = (timeStr: string) => {
    try {
      const [time, modifier] = timeStr.split(" ");
      let [hours, mins] = time.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      return { hours, mins };
    } catch {
      return { hours: 8, mins: 30 };
    }
  };

  // Filter available maids
  const filteredMaids = availableHelpers.filter(m => {
    const matchesSearch = (m.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = filterService === "All" || m.specializations?.some((s: string) => (s || "").toLowerCase().includes(filterService.toLowerCase()));
    return matchesSearch && matchesService;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-primary" /> Daily Check-Ins
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time entry tracker, live gate passes, and logs for your recurring household helpers (maids, cooks, drivers).
          </p>
        </div>

        <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
          <DialogTrigger
            render={
              <Button className="gradient-primary text-white border-0 shadow-md h-10 px-4 text-xs font-semibold rounded-xl">
                <Plus className="w-4 h-4 mr-1.5" /> Add Domestic Helper
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Add Domestic Helper</DialogTitle>
              <DialogDescription>
                Register your flat's maid or cook. A digital gate pass will automatically be issued.
              </DialogDescription>
            </DialogHeader>

            {/* Mode Selector Tabs */}
            <div className="flex bg-muted/60 p-1 rounded-xl border border-border/50">
              <button
                type="button"
                onClick={() => setRegisterMode("direct")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  registerMode === "direct"
                    ? "bg-card text-foreground shadow-xs border border-border/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Register Maid / Cook
              </button>
              <button
                type="button"
                onClick={() => setRegisterMode("directory")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  registerMode === "directory"
                    ? "bg-card text-foreground shadow-xs border border-border/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Select from Society Staff
              </button>
            </div>

            {registerMode === "direct" ? (
              <form onSubmit={handleRegisterDirect} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground block">
                    Helper's Full Name *
                  </label>
                  <Input
                    placeholder="e.g. Sunita Patil, Ramesh Kumar"
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground block">
                    Mobile Number (Optional)
                  </label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={directPhone}
                    onChange={(e) => setDirectPhone(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                {/* Domestic Role: Maid or Cook */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground block">
                    Domestic Category *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "Maid", label: "Maid", desc: "House cleaning & domestic chores" },
                      { key: "Cook", label: "Cook", desc: "Breakfast, lunch, dinner cooking" }
                    ].map((role) => (
                      <button
                        type="button"
                        key={role.key}
                        onClick={() => setDirectCategory(role.key as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          directCategory === role.key
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border/60 hover:bg-secondary/40"
                        }`}
                      >
                        <div className="font-bold text-xs text-foreground">{role.label}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{role.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expected Timings */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Expected Arrival Time</label>
                    <Input
                      placeholder="e.g. 07:00 AM"
                      value={expectedArrival}
                      onChange={(e) => setExpectedArrival(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Expected Exit Time</label>
                    <Input
                      placeholder="e.g. 01:00 PM"
                      value={expectedExit}
                      onChange={(e) => setExpectedExit(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Working Days */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Permitted Working Days</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {daysOfWeek.map((day) => {
                      const active = workingDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                            active
                              ? "bg-primary/10 border-primary/30 text-primary font-bold"
                              : "bg-secondary/10 border-border/40 text-muted-foreground hover:bg-secondary/25"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20"
                  >
                    Register Helper & Generate Gate Pass
                  </Button>
                </div>
              </form>
            ) : step === 1 ? (
              <div className="space-y-4 pt-1">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="h-10 px-3 border border-input rounded-xl text-xs bg-card shrink-0"
                  >
                    <option value="All">All Services</option>
                    <option value="Cooking">Cooking</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Baby Care">Baby Care</option>
                    <option value="Utensils">Utensils</option>
                    <option value="Housekeeping">Housekeeping</option>
                  </select>
                </div>

                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                  {filteredMaids.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      No matching domestic helpers found.
                    </div>
                  ) : (
                    filteredMaids.map((m) => (
                      <div key={m.id} className="p-3 border border-border/80 bg-secondary/10 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-border">
                            <AvatarFallback className="gradient-primary text-white font-bold text-xs">
                              {m.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold text-foreground">{m.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                              <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {m.rating?.toFixed(1) || "5.0"}
                              </span>
                              <span>•</span>
                              <span>{m.experience || "5 years"} Exp</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                              {m.specializations?.join(", ")}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedWorker(m);
                            setServicesRequired(m.specializations || []);
                            setStep(2);
                          }}
                          className="h-8 px-3 rounded-lg text-[10px] font-bold gradient-primary text-white border-0 shadow-sm"
                        >
                          Add Helper
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAssignSubmit} className="space-y-4 pt-1">
                <div className="p-3 border border-border/60 bg-secondary/5 rounded-xl flex items-center gap-3">
                  <Avatar className="w-9 h-9 border">
                    <AvatarFallback className="gradient-primary text-white font-bold text-xs">
                      {selectedWorker?.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-xs">{selectedWorker?.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{selectedWorker?.specializations?.join(", ")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Expected Arrival Time</label>
                    <Input
                      placeholder="e.g. 08:30 AM"
                      value={expectedArrival}
                      onChange={(e) => setExpectedArrival(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Expected Exit Time</label>
                    <Input
                      placeholder="e.g. 11:30 AM"
                      value={expectedExit}
                      onChange={(e) => setExpectedExit(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Working Days</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {daysOfWeek.map(day => {
                      const active = workingDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                            active 
                              ? "bg-primary/10 border-primary/30 text-primary" 
                              : "bg-secondary/10 border-border/40 text-muted-foreground hover:bg-secondary/25"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Required Services</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedWorker?.specializations?.map((srv: string) => {
                      const active = servicesRequired.includes(srv);
                      return (
                        <button
                          type="button"
                          key={srv}
                          onClick={() => toggleService(srv)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                            active 
                              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600" 
                              : "bg-secondary/10 border-border/40 text-muted-foreground hover:bg-secondary/25"
                          }`}
                        >
                          {srv}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-1/3 h-10 rounded-xl text-xs font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-2/3 h-10 bg-primary text-white border-0 rounded-xl font-bold text-xs shadow-md"
                  >
                    Confirm & Assign
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Helpers List Grid */}
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          <Card className="border-border/50 bg-card rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Today&apos;s Domestic Helpers</CardTitle>
              <CardDescription>Scheduled helpers, live gate passes, and entry logs</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {myHelpers.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs space-y-2">
                  <Users className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="font-semibold text-foreground">No household helpers linked to your flat yet.</p>
                  <p className="text-[11px] text-muted-foreground">
                    Click &quot;Add Domestic Helper&quot; above to register your maid or cook.
                  </p>
                </div>
              ) : (
                myHelpers.map((helper) => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  const todayLog = attendance.find(a => (a.workerId === helper.id || (a?.workerName && helper?.name && String(a.workerName).toLowerCase() === String(helper.name).toLowerCase())) && a.date === todayStr);
                  const todayFlatLogs = flatAttendance.filter(fa => fa.helperId === helper.id && fa.date === todayStr);
                  const myFlatLog = todayFlatLogs.find(fa => fa.flatNumber === user?.unit);

                  let statusText = "Not Arrived";
                  let statusColor = "bg-gray-500/10 text-gray-500 border-gray-500/20";
                  if (todayLog) {
                    if (todayLog.checkOutTime) {
                      statusText = "Exited Society";
                      statusColor = "bg-orange-500/10 text-orange-600 border-orange-500/20";
                    } else if (myFlatLog && myFlatLog.status === "completed") {
                      statusText = "Completed Work";
                      statusColor = "bg-green-500/15 text-green-600 border-green-500/20";
                    } else {
                      statusText = "Inside Society";
                      statusColor = "bg-green-500/15 text-green-600 border-green-500/20";
                    }
                  } else {
                    const expTime = parseTime(helper.expectedArrival);
                    const expectedShiftTime = new Date();
                    expectedShiftTime.setHours(expTime.hours, expTime.mins, 0, 0);
                    if (new Date().getTime() > expectedShiftTime.getTime() + 15 * 60 * 1000) {
                      statusText = "Delayed / Missed";
                      statusColor = "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse";
                    }
                  }

                  const helperAttendanceHistory = attendance
                    .filter(a => (a.workerId === helper.id || (a?.workerName && helper?.name && String(a.workerName).toLowerCase() === String(helper.name).toLowerCase())) && a.id !== todayLog?.id)
                    .sort((a, b) => (new Date(b.date || 0).getTime() || 0) - (new Date(a.date || 0).getTime() || 0))
                    .slice(0, 4);

                  // Create timeline milestones for today
                  const milestones = [];
                  if (todayLog) {
                    milestones.push({
                      label: "Entered Society",
                      time: new Date(todayLog.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      detail: `${todayLog.entryGate || "Main Gate"} (Recorded by Security)`
                    });
                  }
                  if (myFlatLog && myFlatLog.status === "completed") {
                    milestones.push({
                      label: "Completed Work",
                      time: new Date(myFlatLog.checkOutTime || myFlatLog.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      detail: myFlatLog.notes ? `Notes: "${myFlatLog.notes}"` : "Completed"
                    });
                  }
                  if (todayLog && todayLog.checkOutTime) {
                    milestones.push({
                      label: "Exited Society",
                      time: new Date(todayLog.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      detail: `${todayLog.exitGate || "Main Gate"} (Recorded by Security)`
                    });
                  }

                  return (
                    <div key={helper.id} className="p-4 border border-border bg-secondary/10 hover:bg-secondary/20 transition-all rounded-2xl text-xs space-y-4 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12 border border-border/80 shadow-xs shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                              {helper.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-foreground text-sm">{helper.name}</h3>
                              <Badge className={`${statusColor} text-[9px] font-bold`} variant="outline">{statusText}</Badge>
                            </div>
                            <p className="text-muted-foreground font-medium text-[11px]">{helper.category} • {helper.phone}</p>
                            
                            {/* Actions right below name: View Gate Pass & Remove */}
                            <div className="pt-1 flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenPassModal(helper)}
                                className="h-7 text-[11px] font-bold px-3 rounded-lg border-primary/40 text-primary hover:bg-primary/10 flex items-center gap-1.5 shadow-xs"
                              >
                                <QrCode className="w-3.5 h-3.5 text-primary" /> View Gate Pass
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveHelper(helper)}
                                className="h-7 text-[11px] font-semibold px-2.5 rounded-lg border-rose-500/30 text-rose-600 hover:bg-rose-500/10 flex items-center gap-1 hover:border-rose-500 transition-all"
                                title="Remove domestic helper from flat"
                              >
                                <Trash2 className="w-3 h-3 text-rose-500" /> Remove
                              </Button>

                              {helper.passId && (
                                <span className="text-[10px] text-muted-foreground font-mono font-medium">
                                  Pass: {helper.passId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right text-xs bg-secondary/20 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                          <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">EXPECTED SHIFT</p>
                          <p className="font-bold text-foreground mt-0.5">{helper.expectedArrival} – {helper.expectedExit}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Flats: {helper.assignedFlats?.join(", ") || user.unit}</p>
                        </div>
                      </div>

                      {/* Today's Status Timeline */}
                      <div className="p-4 rounded-xl bg-card border border-border/60 space-y-3">
                        <h4 className="font-bold text-foreground text-[10px] uppercase tracking-wider text-muted-foreground">Today&apos;s Live Status Tracker</h4>
                        {milestones.length === 0 ? (
                          <p className="text-muted-foreground font-semibold flex items-center gap-1.5 py-1">
                            <Clock className="w-4 h-4 text-gray-400" /> Expected shift has not started yet. Not arrived at society gate.
                          </p>
                        ) : (
                          <div className="relative pl-5 border-l-2 border-primary/20 space-y-4 py-1">
                            {milestones.map((m, mIdx) => (
                              <div key={mIdx} className="relative">
                                <div className="absolute -left-[26px] top-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                                  <Check className="w-2 h-2 text-white" />
                                </div>
                                <div className="flex justify-between items-start text-[11px] font-semibold text-foreground">
                                  <span>{m.label}</span>
                                  <span className="text-muted-foreground">{m.time} ({m.detail})</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-end pt-2 border-t border-border/40">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setExpandedHelper(expandedHelper === helper.id ? null : helper.id)}
                            className="text-primary hover:text-primary hover:bg-primary/5 h-8 rounded-lg text-[10px] font-bold"
                          >
                            {expandedHelper === helper.id ? "Hide Logs" : "View Attendance History"}
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedHelper === helper.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2 border-t border-border/40 overflow-hidden space-y-2.5"
                          >
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Attendance History</span>
                            {helperAttendanceHistory.length === 0 ? (
                              <p className="text-[10px] text-muted-foreground italic">No past attendance logs logged this week.</p>
                            ) : (
                              <div className="grid gap-3">
                                {helperAttendanceHistory.map((hist) => {
                                  const dayFlatLog = flatAttendance.find(fa => fa.helperId === helper.id && fa.date === hist.date && fa.flatNumber === user?.unit && fa.status === "completed");
                                  return (
                                    <div key={hist.id} className="p-3 border border-border/40 rounded-xl bg-card space-y-2 text-[11px] font-semibold">
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4 text-muted-foreground" />
                                          <span className="font-bold text-foreground">{hist.date}</span>
                                          <Badge className={
                                            hist.status === "late" 
                                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px]"
                                              : "bg-green-500/10 text-green-600 border-green-500/20 text-[9px]"
                                          } variant="outline">{hist.status === "late" ? "Late" : "Present"}</Badge>
                                        </div>
                                      </div>

                                      <div className="pl-2.5 border-l border-border/60 space-y-1.5 text-[10px] text-muted-foreground font-medium">
                                        <div className="flex justify-between">
                                          <span>Entered Society</span>
                                          <span>{hist.checkInTime ? `${new Date(hist.checkInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} (${hist.entryGate || "Main Gate"})` : "—"}</span>
                                        </div>
                                        {dayFlatLog && (
                                          <div className="flex justify-between text-green-600">
                                            <span>Completed Work</span>
                                            <span>{dayFlatLog.checkOutTime ? new Date(dayFlatLog.checkOutTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "Completed"}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between">
                                          <span>Exited Society</span>
                                          <span>{hist.checkOutTime ? `${new Date(hist.checkOutTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} (${hist.exitGate || "Main Gate"})` : "Inside"}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar card */}
        <div className="md:col-span-4 space-y-4">
          <Card className="border-border/50 bg-card rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Shield className="w-4.5 h-4.5 text-primary" /> Helper Security Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-muted-foreground font-medium leading-relaxed">
              <p>
                Recurring domestic helpers and gate pass holders check-in at the security gate and assigned resident flats receive live status updates.
              </p>
              <p>
                Residents can click <strong>View Gate Pass</strong> on any helper to view and download their official QR code pass card.
              </p>
              <p>
                Gate check-in timestamps are audited and archived for the society secretary daily reports.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DIGITAL PASS CARD PREVIEW MODAL */}
      {/* ========================================================================= */}
      <Dialog
        open={showPassModal}
        onOpenChange={(open) => {
          setShowPassModal(open);
          if (!open) setShareFeedback(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-primary/20 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)] text-center text-lg font-bold">
              Domestic Helper Gate Pass
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground mt-0.5">
              Official QR gate pass for security verification and entry.
            </DialogDescription>
          </DialogHeader>

          {activePassData && (
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
                    AUTHORIZED
                  </span>
                </div>

                <div className="text-center space-y-3">
                  <div className="bg-card p-3 rounded-2xl inline-block shadow-sm border border-border/40">
                    <QRCodeSVG
                      id="visitor-pass-qr-svg"
                      value={`HOMEVERSE-PASS-${activePassData.id}-${activePassData.otp || "000000"}`}
                      size={120}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-foreground">{activePassData.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {activePassData.passType || activePassData.category || "Domestic Staff"} Pass
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs pt-4 border-t border-dashed border-border/60">
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider block">Assigned Flat</span>
                    <span className="font-bold text-foreground text-base">
                      {activePassData.visitingUnit || activePassData.unit || user?.unit || "202"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider block">Pass Gate OTP</span>
                    <span className="font-bold text-primary text-lg font-mono">
                      {activePassData.otp || "389201"}
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
                  value={`HOMEVERSE-PASS-${activePassData.id}-${activePassData.otp || "000000"}`}
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
                    setShowPassModal(false);
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
