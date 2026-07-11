"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Search, Clock, LogIn, LogOut, QrCode, Phone, Building2, Shield, UserX, Check,
  UserCheck, Ban, Camera, Car, Calendar, BarChart3, Users, FileText, Download, Share2,
  Star, Trash2, ShieldAlert, AlertTriangle, AlertCircle, Heart, CheckCircle2, ChevronRight,
  XCircle, ArrowRight, UserPlus, FileCheck, RefreshCw, Eye, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import type { VisitorStatus, Visitor, Helper, HelperAttendance } from "@/types";
import { QRCodeSVG } from "qrcode.react";

// Recharts for Secretary Analytics
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";

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

const visitorTypeOptions = [
  "Family", "Friends", "Guests", "Delivery Partner", "Maid", "Cook", "Driver",
  "Electrician", "Plumber", "Carpenter", "Tutor", "Domestic Help", "Technician",
  "Event Guest", "Temporary Worker", "Others"
];

export default function VisitorsPage() {
  const { user, initialize } = useAuth();
  const {
    visitors,
    favorites,
    incidents,
    submitVisitorRequest,
    checkInVisitor,
    checkOutVisitor,
    denyVisitorEntry,
    cancelVisitorRequest,
    approveVisitorRequest,
    addFavoriteVisitor,
    removeFavoriteVisitor,
    helpers,
    attendance,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      visitors: state.visitors || [],
      favorites: state.favorites || [],
      incidents: state.incidents || [],
      submitVisitorRequest: state.submitVisitorRequest,
      checkInVisitor: state.checkInVisitor,
      checkOutVisitor: state.checkOutVisitor,
      denyVisitorEntry: state.denyVisitorEntry,
      cancelVisitorRequest: state.cancelVisitorRequest,
      approveVisitorRequest: state.approveVisitorRequest,
      addFavoriteVisitor: state.addFavoriteVisitor,
      removeFavoriteVisitor: state.removeFavoriteVisitor,
      helpers: state.helpers || [],
      attendance: state.attendance || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "invite" | "favorites" | "calendar" | "history">("dashboard");

  // Invite Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [visitorType, setVisitorType] = useState("Guests");
  const [visitType, setVisitType] = useState<'one-time' | 'recurring'>("one-time");
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>("daily");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [purpose, setPurpose] = useState("");
  const [expectedAt, setExpectedAt] = useState("");
  const [expectedExit, setExpectedExit] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<'two-wheeler' | 'four-wheeler' | 'none'>("none");
  const [numberOfVisitors, setNumberOfVisitors] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Share Pass States
  const [generatedPass, setGeneratedPass] = useState<Visitor | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  // Search filter
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Selected Visitor for Timeline
  const [timelineVisitor, setTimelineVisitor] = useState<Visitor | null>(null);
  const [secTab, setSecTab] = useState<"visitors" | "helpers">("visitors");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  const isResident = user?.role === "resident";
  const isSecretary = user?.role === "secretary";
  const isSecurity = user?.role === "security";

  // Secretary Worker Attendance Calculations
  const workerStats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Default list of helpers (mirroring allHelpers in helpers-entry)
    const defaultHelpers: Helper[] = [
      {
        id: "user-worker-8",
        name: "Sunita Patil",
        category: "Cooking + Cleaning",
        phone: "+91 87654 32118",
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        expectedArrival: "08:30 AM",
        expectedExit: "11:30 AM",
        assignedFlats: ["A-204", "A-302", "C-201"],
        assignedResidents: ["Sara Shah", "Rahul Mehta", "Priya Desai"],
        residentIds: ["user-resident-1", "user-resident-6", "user-resident-9"],
        joinedAt: new Date().toISOString(),
        portal: "society"
      },
      {
        id: "dw-1",
        name: "Kamla Bai",
        category: "Maid",
        phone: "+91 91000 20001",
        workingDays: ["Monday", "Wednesday", "Friday"],
        expectedArrival: "09:00 AM",
        expectedExit: "12:00 PM",
        assignedFlats: ["A-301", "B-102"],
        assignedResidents: ["Nidhi Rao", "Karan Johar"],
        residentIds: ["user-resident-3", "user-resident-2"],
        joinedAt: new Date().toISOString(),
        portal: "society"
      },
      {
        id: "dw-2",
        name: "Shankar Kumar",
        category: "Cook",
        phone: "+91 91000 20002",
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        expectedArrival: "07:30 AM",
        expectedExit: "10:30 AM",
        assignedFlats: ["A-301", "C-504"],
        assignedResidents: ["Nidhi Rao", "Vikram Sen"],
        residentIds: ["user-resident-3", "user-resident-10"],
        joinedAt: new Date().toISOString(),
        portal: "society"
      }
    ];

    const allH = [...helpers];
    defaultHelpers.forEach(dh => {
      if (!allH.some(h => h.id === dh.id)) allH.push(dh);
    });

    const todayAttendance = attendance.filter(a => a.date === todayStr);

    let present = 0;
    let lateCount = 0;
    let totalMinutes = 0;
    let arrivalTimesCount = 0;

    const lateList: any[] = [];
    const pendingList: any[] = [];
    const allReport: any[] = [];

    allH.forEach(h => {
      const att = todayAttendance.find(a => a.workerId === h.id);
      
      const [time, modifier] = h.expectedArrival.split(" ");
      let [expHours, expMins] = time.split(":").map(Number);
      if (modifier === "PM" && expHours < 12) expHours += 12;
      if (modifier === "AM" && expHours === 12) expHours = 0;
      
      const expectedShiftTime = new Date();
      expectedShiftTime.setHours(expHours, expMins, 0, 0);
      const now = new Date();

      if (att) {
        present++;
        
        const checkIn = new Date(att.checkInTime);
        totalMinutes += checkIn.getHours() * 60 + checkIn.getMinutes();
        arrivalTimesCount++;

        const isLate = att.status === "late";
        if (isLate) {
          lateCount++;
          const diffMs = checkIn.getTime() - expectedShiftTime.getTime();
          const minsLate = Math.max(0, Math.round(diffMs / (60 * 1000)));
          lateList.push({
            helper: h,
            checkInTime: checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            minsLate
          });
        }

        allReport.push({
          helper: h,
          status: att.checkOutTime ? "Checked Out" : "Checked In",
          time: new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          gate: att.entryGate,
          log: att
        });
      } else {
        const isMissed = now.getTime() > expectedShiftTime.getTime() + 15 * 60 * 1000;
        if (isMissed) {
          pendingList.push(h);
        }
        allReport.push({
          helper: h,
          status: isMissed ? "Delayed" : "Not Arrived",
          time: null,
          gate: null
        });
      }
    });

    const avgTimeStr = arrivalTimesCount > 0 
      ? (() => {
          const avgMinsTotal = Math.round(totalMinutes / arrivalTimesCount);
          const hrs = Math.floor(avgMinsTotal / 60);
          const mins = avgMinsTotal % 60;
          const period = hrs >= 12 ? "PM" : "AM";
          const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
          return `${displayHrs}:${mins.toString().padStart(2, '0')} ${period}`;
        })()
      : "--";

    return {
      presentCount: present,
      absentCount: allH.length - present,
      lateCount,
      avgArrivalTime: avgTimeStr,
      lateList,
      pendingList,
      allReport
    };
  }, [helpers, attendance]);

  // Filter visitors dynamically based on role
  const myVisitors = visitors.filter((v) => {
    if (v.portal !== "society") return false;
    if (isResident && v.visitingUnit !== user?.unit) return false;
    return true;
  });

  const filteredHistory = myVisitors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.includes(search) ||
      (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = selectedStatus === "all" || v.status === selectedStatus;
    const matchesType = selectedType === "all" || v.visitorType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Real-time listener for incoming visitor awaiting approval (at-gate or pending)
  const pendingApprovals = myVisitors.filter(
    (v) => v.status === "pending" || v.status === "at-gate"
  );

  // Active Inside complex
  const insideVisitors = myVisitors.filter(
    (v) => v.status === "checked-in" || v.status === "inside"
  );

  // Expected/Upcoming Visitors
  const upcomingVisitors = myVisitors.filter(
    (v) => v.status === "approved" || v.status === "expected"
  );

  // Checked Out / Left Complex
  const departedVisitors = myVisitors.filter(
    (v) => v.status === "checked-out"
  );

  // Favorite list filter
  const myFavorites = favorites.filter(f => f.visitingUnit === user?.unit);

  // Smart Duplicate Detection: check if name or phone has visited flat >= 3 times
  const duplicateSuggestion = useMemo(() => {
    if (!phone || phone.length < 10) return null;
    const matches = visitors.filter(
      (v) => v.visitingUnit === user?.unit && (v.phone === phone || (name && v.name.toLowerCase() === name.toLowerCase()))
    );
    if (matches.length >= 3 && visitType === "one-time") {
      return {
        count: matches.length,
        name: matches[0].name
      };
    }
    return null;
  }, [phone, name, visitors, user?.unit, visitType]);

  // Handle Pass creation
  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !expectedAt) return;

    const newPassData = {
      name,
      phone,
      purpose: purpose || "Personal Visit",
      visitingUnit: user?.unit || "A-301",
      visitingResident: user?.name || "Resident",
      visitingResidentId: user?.id,
      expectedAt: new Date(expectedAt).toISOString(),
      expectedExit: expectedExit ? new Date(expectedExit).toISOString() : undefined,
      vehicleNumber: vehicleNumber || undefined,
      vehicleType,
      numberOfVisitors,
      specialInstructions,
      visitorType,
      visitType,
      recurringSchedule: visitType === "recurring" ? {
        frequency,
        days: selectedDays,
        time: expectedAt.split("T")[1]
      } : undefined,
      date: expectedAt.split("T")[0],
      portal: "society" as const
    };

    await submitVisitorRequest(newPassData);

    // Get the newly added visitor to show pass card
    setTimeout(() => {
      const added = useCommunityStore.getState().visitors
        .filter(v => v.visitingUnit === user?.unit)
        .sort((a, b) => new Date(b.expectedAt || "").getTime() - new Date(a.expectedAt || "").getTime())[0];
      if (added) {
        setGeneratedPass(added);
        setShowPassModal(true);
      }
    }, 500);

    // Reset Form
    setName("");
    setPhone("");
    setPurpose("");
    setExpectedAt("");
    setExpectedExit("");
    setVehicleNumber("");
    setVehicleType("none");
    setNumberOfVisitors(1);
    setSpecialInstructions("");
    setSelectedDays([]);
    setActiveTab("dashboard");
  };

  // Add to Favorites
  const toggleFavorite = async (visitor: Visitor) => {
    const isFav = myFavorites.some(f => f.phone === visitor.phone);
    if (isFav) {
      const fav = myFavorites.find(f => f.phone === visitor.phone);
      if (fav) await removeFavoriteVisitor(fav.id);
    } else {
      await addFavoriteVisitor({
        name: visitor.name,
        phone: visitor.phone,
        purpose: visitor.purpose,
        visitingUnit: visitor.visitingUnit,
        visitingResident: visitor.visitingResident,
        visitingResidentId: visitor.visitingResidentId,
        visitorType: visitor.visitorType,
        visitType: visitor.visitType,
        vehicleNumber: visitor.vehicleNumber,
        vehicleType: visitor.vehicleType,
        numberOfVisitors: visitor.numberOfVisitors,
        specialInstructions: visitor.specialInstructions,
        portal: "society"
      });
    }
  };

  // Quick Invite from Favorites
  const handleQuickInvite = async (fav: any) => {
    const today = new Date();
    const expectedTime = new Date(today.getTime() + 1000 * 60 * 30); // 30 mins from now
    const newPassData = {
      name: fav.name,
      phone: fav.phone,
      purpose: fav.purpose || "Frequent Visit",
      visitingUnit: fav.visitingUnit,
      visitingResident: fav.visitingResident,
      visitingResidentId: fav.visitingResidentId,
      expectedAt: expectedTime.toISOString(),
      vehicleNumber: fav.vehicleNumber,
      vehicleType: fav.vehicleType || "none",
      numberOfVisitors: fav.numberOfVisitors || 1,
      specialInstructions: fav.specialInstructions,
      visitorType: fav.visitorType || "Guests",
      visitType: fav.visitType || "one-time",
      date: today.toISOString().split("T")[0],
      portal: "society" as const
    };

    await submitVisitorRequest(newPassData);

    setTimeout(() => {
      const added = useCommunityStore.getState().visitors
        .filter(v => v.visitingUnit === user?.unit)
        .sort((a, b) => new Date(b.expectedAt || "").getTime() - new Date(a.expectedAt || "").getTime())[0];
      if (added) {
        setGeneratedPass(added);
        setShowPassModal(true);
      }
    }, 500);
  };

  // Days of week for recurring options
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // ==========================================
  // SECRETARY PORTAL ANALYTICS & LOGS
  // ==========================================
  const allSocietyVisitors = visitors.filter(v => v.portal === "society");

  const analyticsData = useMemo(() => {
    // 1. Category breakdown
    const categories: Record<string, number> = {};
    // 2. Weekly trend
    const dailyCount: Record<string, number> = {};
    // 3. Peak hours
    const hourlyDistribution = Array(24).fill(0);
    // 4. Most visited flats
    const flatVisits: Record<string, number> = {};

    allSocietyVisitors.forEach(v => {
      const cat = v.visitorType || "Others";
      categories[cat] = (categories[cat] || 0) + 1;

      const dateStr = v.date || new Date().toISOString().split("T")[0];
      dailyCount[dateStr] = (dailyCount[dateStr] || 0) + 1;

      if (v.checkInTime) {
        const hour = new Date(v.checkInTime).getHours();
        hourlyDistribution[hour] += 1;
      } else if (v.expectedAt) {
        const hour = new Date(v.expectedAt).getHours();
        hourlyDistribution[hour] += 1;
      }

      const flat = v.visitingUnit || "Unknown";
      flatVisits[flat] = (flatVisits[flat] || 0) + 1;
    });

    const categoryChartData = Object.keys(categories).map(k => ({
      name: k,
      value: categories[k]
    })).slice(0, 6);

    const trendChartData = Object.keys(dailyCount).sort().map(k => ({
      date: k,
      visits: dailyCount[k]
    })).slice(-7);

    const hourlyChartData = hourlyDistribution.map((cnt, hr) => ({
      hour: `${hr}:00`,
      visits: cnt
    })).filter((d, idx) => idx >= 8 && idx <= 22); // Focus on daytime

    const flatChartData = Object.keys(flatVisits).map(k => ({
      flat: `Flat ${k}`,
      visits: flatVisits[k]
    })).sort((a, b) => b.visits - a.visits).slice(0, 5);

    return {
      categoryChartData,
      trendChartData,
      hourlyChartData,
      flatChartData,
      total: allSocietyVisitors.length,
      activeInside: allSocietyVisitors.filter(v => v.status === "checked-in" || v.status === "inside").length,
      deniedCount: allSocietyVisitors.filter(v => v.status === "denied").length,
    };
  }, [allSocietyVisitors]);

  // Color constants for charts
  const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  // Mock Export to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Phone,Type,Flat,Purpose,Status,Entry Time,Exit Time\n";

    allSocietyVisitors.forEach(v => {
      csvContent += `${v.id},"${v.name}","${v.phone}","${v.visitorType}","${v.visitingUnit}","${v.purpose}","${v.status}","${v.checkInTime || ""}",${v.checkOutTime || ""}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HomeVerse_Visitor_Logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* 1. Real-Time Resident Approval Modal Overlay */}
      {isResident && pendingApprovals.length > 0 && (
        <AnimatePresence>
          {pendingApprovals.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-card border border-primary/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-r from-primary/10 to-indigo-600/10 border-b border-border/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5.5 h-5.5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Gate Entry Request 🔔</h4>
                  <p className="text-[10px] text-muted-foreground">Visitor waiting at main gate</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex gap-3 items-center">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="gradient-primary text-white font-bold text-sm">
                      {v.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs">
                    <p className="font-bold text-foreground">{v.name}</p>
                    <p className="text-muted-foreground">{v.phone} • <span className="font-semibold text-primary">{v.visitorType}</span></p>
                  </div>
                </div>
                {v.purpose && (
                  <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/20 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Purpose:</span> {v.purpose}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => approveVisitorRequest(v.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0 h-9 rounded-xl text-xs font-semibold"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Approve Entry
                  </Button>
                  <Button
                    onClick={() => denyVisitorEntry(v.id, "Resident Refused Entry", "Declined in in-app popup")}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 h-9 rounded-xl text-xs font-semibold"
                  >
                    <UserX className="w-3.5 h-3.5 mr-1" /> Reject Entry
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* 2. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" /> Society Visitor Management
          </h1>
          <p className="text-muted-foreground mt-1">
            {isResident
              ? "Schedule passes, approve gate arrivals in real-time, and manage recurring visitors for your flat."
              : "Audit visitor analytics, investigate gate denials, and manage security incidents logs."}
          </p>
        </div>

        {isResident && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setGeneratedPass(null);
                setActiveTab("invite");
              }}
              className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25 h-10 px-4 text-xs font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Invite Visitor
            </Button>
          </div>
        )}

        {isSecretary && (
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="rounded-xl border-border/60 hover:bg-secondary h-10 text-xs font-semibold"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export Visitor Registry
          </Button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. SECRETARY AUDIT DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {isSecretary && (
        <div className="space-y-6">
          {/* Sub-Tabs for Secretary: Visitors vs Workers Attendance */}
          <div className="flex gap-1 bg-secondary/40 p-1.5 rounded-2xl max-w-sm w-full">
            <button
              onClick={() => setSecTab("visitors")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                secTab === "visitors" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Visitor Registry
            </button>
            <button
              onClick={() => setSecTab("helpers")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                secTab === "helpers" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Worker Attendance
            </button>
          </div>

          {secTab === "visitors" ? (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Today's Total Visitors", value: analyticsData.total, icon: Users, color: "#6366f1" },
                  { label: "Currently Inside Complex", value: analyticsData.activeInside, icon: LogIn, color: "#10b981" },
                  { label: "Access Denied Warnings", value: analyticsData.deniedCount, icon: Ban, color: "#ef4444" },
                  { label: "Reported Security Incidents", value: incidents.length, icon: ShieldAlert, color: "#f59e0b" },
                ].map((s) => (
                  <Card key={s.label} className="border-border/50 bg-card">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                        <s.icon className="w-5 h-5" style={{ color: s.color }} />
                      </div>
                      <div>
                        <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Visual Charts Section */}
              <div className="grid lg:grid-cols-12 gap-6">
                <Card className="lg:col-span-8 border-border/50 bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-primary" /> Hourly Gate Traffic (Daytime Density)</CardTitle>
                    <CardDescription>Frequency Distribution of visitor arrivals throughout peak visiting hours</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.hourlyChartData}>
                        <defs>
                          <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="hour" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                        <Area type="monotone" dataKey="visits" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-4 border-border/50 bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold">Category Distribution</CardTitle>
                    <CardDescription>Top visitor categories entering society</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 flex flex-col justify-between p-4">
                    {analyticsData.categoryChartData.length === 0 ? (
                      <div className="text-center text-xs text-muted-foreground py-16">No categorization logs available</div>
                    ) : (
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height="80%">
                          <PieChart>
                            <Pie
                              data={analyticsData.categoryChartData}
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {analyticsData.categoryChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-3 gap-1 mt-2 text-[8px] text-muted-foreground max-h-16 overflow-y-auto">
                          {analyticsData.categoryChartData.map((entry, idx) => (
                            <div key={entry.name} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                              <span className="truncate font-semibold text-foreground">{entry.name}: {entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Most Frequent flats */}
                <Card className="border-border/50 bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Building2 className="w-4 h-4 text-emerald-500" /> Top Target Flats (Most Active)</CardTitle>
                    <CardDescription>Units receiving the highest volume of entries today</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.flatChartData} layout="vertical">
                        <XAxis type="number" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis dataKey="flat" type="category" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={60} />
                        <RechartsTooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                        <Bar dataKey="visits" fill="#10b981" radius={[0, 8, 8, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Incidents registry */}
                <Card className="border-border/50 bg-card flex flex-col h-[322px] overflow-hidden">
                  <CardHeader className="pb-2 border-b border-border/20">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-red-500"><ShieldAlert className="w-4.5 h-4.5" /> Recent Gate Incidents</CardTitle>
                    <CardDescription>Flagged access disputes or restricted item warnings</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 flex-1 overflow-y-auto space-y-2.5">
                    {incidents.filter(i => i.type === "Visitor Dispute").length === 0 ? (
                      <div className="text-center py-20 text-xs text-muted-foreground">
                        No active gate disputes or incidents logged.
                      </div>
                    ) : (
                      incidents.filter(i => i.type === "Visitor Dispute").map((inc) => (
                        <div key={inc.id} className="p-3 border border-border/50 rounded-xl bg-secondary/5 text-xs space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-foreground">{inc.reporter}</span>
                            <span className="text-[10px] text-muted-foreground">{inc.date} {inc.time}</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{inc.description}</p>
                          <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-600 border-red-500/20">{inc.status}</Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Complete Visitor Registry Table */}
              <Card className="border-border/50 bg-card">
                <CardHeader className="pb-3 border-b border-border/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-base font-bold">Society Visitor Ledger</CardTitle>
                    <CardDescription>Audited real-time timeline of gate arrivals</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="absolute ml-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by flat, name, vehicle..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-full sm:w-64 h-9 text-xs rounded-xl border-border/60"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-border/20">
                      <thead className="bg-secondary/20 text-muted-foreground font-semibold">
                        <tr>
                          <th className="p-4">Visitor</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Visiting Flat</th>
                          <th className="p-4">Expected/Arrival Time</th>
                          <th className="p-4">Vehicle</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        {filteredHistory.map((v) => {
                          const cfg = statusConfig[v.status] || statusConfig.expected;
                          const Icon = cfg.icon;
                          return (
                            <tr key={v.id} className="hover:bg-secondary/5 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-foreground">{v.name}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{v.phone}</div>
                              </td>
                              <td className="p-4 font-medium text-foreground">{v.visitorType}</td>
                              <td className="p-4">
                                <div className="font-bold">{v.visitingUnit}</div>
                                <div className="text-[10px] text-muted-foreground">{v.visitingResident}</div>
                              </td>
                              <td className="p-4">
                                <div>{new Date(v.expectedAt || v.checkInTime || "").toLocaleDateString()}</div>
                                <div className="text-[10px] text-muted-foreground">
                                  {new Date(v.expectedAt || v.checkInTime || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td className="p-4 font-mono text-[10px] uppercase">{v.vehicleNumber || "None"}</td>
                              <td className="p-4">
                                <Badge className={cfg.color} variant="outline">
                                  <Icon className="w-3.5 h-3.5 mr-1" /> {cfg.label}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredHistory.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-10 text-muted-foreground text-xs">
                              No visitor entries match filter criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Worker Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Workers Checked In", value: workerStats.presentCount, icon: LogIn, color: "#10b981" },
                  { label: "Absent / Not Arrived", value: workerStats.absentCount, icon: UserX, color: "#6b7280" },
                  { label: "Late Arrivals Today", value: workerStats.lateCount, icon: AlertTriangle, color: "#f59e0b" },
                  { label: "Average Arrival Time", value: workerStats.avgArrivalTime, icon: Clock, color: "#6366f1" },
                ].map((s) => (
                  <Card key={s.label} className="border-border/50 bg-card">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                        <s.icon className="w-5 h-5" style={{ color: s.color }} />
                      </div>
                      <div>
                        <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Roster & Audits Splitted Layout */}
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Roster Table (8 cols) */}
                <Card className="lg:col-span-8 border-border/50 bg-card flex flex-col h-[550px] overflow-hidden">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base font-bold">Daily Helper Registry Ledger</CardTitle>
                    <CardDescription>Daily attendance logs and shift schedule status for all recurring helpers</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-y-auto">
                    <table className="w-full text-left text-xs divide-y divide-border/20">
                      <thead className="bg-secondary/20 text-muted-foreground font-semibold">
                        <tr>
                          <th className="p-4">Helper Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Assigned Flats</th>
                          <th className="p-4">Expected Shift</th>
                          <th className="p-4">Gate Pass Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-medium">
                        {workerStats.allReport.map((item, i) => (
                          <tr key={i} className="hover:bg-secondary/5 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-foreground">{item.helper.name}</div>
                              <div className="text-[10px] text-muted-foreground">{item.helper.phone}</div>
                            </td>
                            <td className="p-4">{item.helper.category}</td>
                            <td className="p-4 font-semibold text-primary">{item.helper.assignedFlats.join(", ")}</td>
                            <td className="p-4 font-mono text-[10px]">{item.helper.expectedArrival} – {item.helper.expectedExit}</td>
                            <td className="p-4">
                              <Badge className={
                                item.status === "Checked In" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                item.status === "Checked Out" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                item.status === "Delayed" ? "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse" :
                                "bg-gray-500/10 text-gray-600 border-gray-500/20"
                              } variant="outline">
                                {item.status} {item.time && `at ${item.time}`}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {/* Audit Lists (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Late list */}
                  <Card className="border-border/50 bg-card flex flex-col h-[260px] overflow-hidden">
                    <CardHeader className="pb-2 border-b">
                      <CardTitle className="text-xs font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /> Late Helpers Today ({workerStats.lateList.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 flex-1 overflow-y-auto space-y-2">
                      {workerStats.lateList.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground italic text-center py-10">No late arrivals reported today.</p>
                      ) : (
                        workerStats.lateList.map((item, idx) => (
                          <div key={idx} className="p-2 border border-border/60 bg-secondary/5 rounded-xl text-[11px] font-semibold flex justify-between items-center">
                            <div>
                              <p className="text-foreground">{item.helper.name} ({item.helper.category})</p>
                              <p className="text-[9px] text-muted-foreground">Flats: {item.helper.assignedFlats.join(", ")}</p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] font-bold">Late {item.minsLate}m</Badge>
                              <p className="text-[9px] text-muted-foreground mt-0.5">In: {item.checkInTime}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Pending arrivals */}
                  <Card className="border-border/50 bg-card flex flex-col h-[265px] overflow-hidden">
                    <CardHeader className="pb-2 border-b">
                      <CardTitle className="text-xs font-bold flex items-center gap-1.5"><Clock className="w-4 h-4 text-red-500" /> Pending Worker Arrival ({workerStats.pendingList.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 flex-1 overflow-y-auto space-y-2">
                      {workerStats.pendingList.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground italic text-center py-10">No expected helpers are currently delayed.</p>
                      ) : (
                        workerStats.pendingList.map((h, idx) => (
                          <div key={idx} className="p-2 border border-border/60 bg-secondary/5 rounded-xl text-[11px] font-semibold flex justify-between items-center">
                            <div>
                              <p className="text-foreground">{h.name} ({h.category})</p>
                              <p className="text-[9px] text-muted-foreground">Flats: {h.assignedFlats.join(", ")}</p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[9px] font-bold">Missed Shift</Badge>
                              <p className="text-[9px] text-muted-foreground mt-0.5 font-semibold">Expected: {h.expectedArrival}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RESIDENT PORTAL VIEW */}
      {/* ========================================================================= */}
      {isResident && (
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="flex gap-1 bg-secondary/40 p-1.5 rounded-2xl max-w-lg w-full">
            {(["dashboard", "invite", "favorites", "calendar", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Quick counters grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Today's Active Passes", value: upcomingVisitors.length, icon: Calendar, color: "#3b82f6" },
                  { label: "Guests Inside flat", value: insideVisitors.length, icon: LogIn, color: "#22c55e" },
                  { label: "Favorites List Size", value: myFavorites.length, icon: Heart, color: "#ec4899" },
                  { label: "Completed Visits", value: departedVisitors.length, icon: CheckCircle2, color: "#8b5cf6" },
                ].map((s) => (
                  <Card key={s.label} className="border-border/50 bg-card">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                        <s.icon className="w-5 h-5" style={{ color: s.color }} />
                      </div>
                      <div>
                        <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Layout Content */}
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Left: Expected Visitors Passes */}
                <Card className="lg:col-span-7 border-border/50 bg-card flex flex-col max-h-[500px] overflow-hidden">
                  <CardHeader className="border-b border-border/20 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Clock className="w-4.5 h-4.5 text-blue-500" /> Active Pre-Approved Passes
                    </CardTitle>
                    <CardDescription>Passes generated for today or upcoming days</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 overflow-y-auto flex-1 space-y-3">
                    {upcomingVisitors.length === 0 ? (
                      <div className="text-center py-20 text-muted-foreground text-xs">
                        No active upcoming invites scheduled.
                      </div>
                    ) : (
                      upcomingVisitors.map((v) => (
                        <div key={v.id} className="p-4 border border-border/60 bg-secondary/10 rounded-2xl flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{v.name}</span>
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">
                                {v.visitorType}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground">Mobile: {v.phone} • Purpose: {v.purpose}</p>
                            <p className="text-[9px] text-muted-foreground font-semibold">
                              Expected: {new Date(v.expectedAt || "").toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setGeneratedPass(v);
                                setShowPassModal(true);
                              }}
                              className="h-8 rounded-lg border-border/50 text-[10px] font-bold"
                            >
                              <QrCode className="w-3.5 h-3.5 mr-1" /> View Pass
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelVisitorRequest(v.id)}
                              className="h-8 rounded-lg text-red-500 hover:bg-red-500/10 text-[10px] font-bold"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Right: Live visitor Timeline */}
                <Card className="lg:col-span-5 border-border/50 bg-card flex flex-col max-h-[500px]">
                  <CardHeader className="border-b border-border/20 pb-3 flex flex-row justify-between items-center">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Activity className="w-4.5 h-4.5 text-indigo-500" /> Visitor Tracking
                      </CardTitle>
                      <CardDescription>Live tracking logs of your guests</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
                    {insideVisitors.length === 0 && departedVisitors.length === 0 ? (
                      <div className="text-center py-20 text-xs text-muted-foreground">
                        No active visitor journeys to track.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <select
                          className="w-full h-9 border rounded-lg text-xs bg-card px-2"
                          onChange={(e) => {
                            const found = visitors.find(v => v.id === e.target.value);
                            if (found) setTimelineVisitor(found);
                          }}
                          defaultValue={timelineVisitor?.id || ""}
                        >
                          <option value="">Select visitor to track...</option>
                          {[...insideVisitors, ...departedVisitors].map(v => (
                            <option key={v.id} value={v.id}>{v.name} ({v.status})</option>
                          ))}
                        </select>

                        {timelineVisitor && (
                          <div className="space-y-4 mt-2">
                            <div className="p-3 border border-border/40 rounded-xl bg-secondary/5 flex justify-between items-center">
                              <span className="font-bold text-xs text-foreground">{timelineVisitor.name}</span>
                              <Badge className={statusConfig[timelineVisitor.status]?.color || ""} variant="outline">
                                {statusConfig[timelineVisitor.status]?.label}
                              </Badge>
                            </div>
                            <div className="relative border-l border-border/80 pl-4 space-y-4 ml-2">
                              {timelineVisitor.timeline?.map((evt, idx) => (
                                <div key={idx} className="relative">
                                  <div className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                                  <div className="text-xs">
                                    <div className="font-semibold text-foreground capitalize">{evt.status.replace("-", " ")}</div>
                                    {evt.note && <div className="text-muted-foreground text-[10px] mt-0.5">{evt.note}</div>}
                                    <div className="text-[9px] text-muted-foreground/75 mt-0.5">
                                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {evt.by || "Gate Guard"}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Tab 2: Invite Form */}
          {activeTab === "invite" && (
            <Card className="border-border/50 bg-card max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-heading)]">Create Visitor Pre-Approved Pass</CardTitle>
                <CardDescription>Generate a gatepass with OTP and QR for expected family, delivery partner, or workers</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateInvite} className="space-y-4">
                  {/* Basic fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Visitor Name</label>
                      <Input
                        placeholder="Guest full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10 text-xs rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Mobile Number</label>
                      <Input
                        placeholder="Visitor 10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-10 text-xs rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Duplicate suggestion warning */}
                  {duplicateSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 border border-amber-500/20 bg-amber-500/10 rounded-xl flex items-center gap-2.5 text-xs text-amber-700"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <div className="flex-1">
                        Smart Tip: <span className="font-bold">{duplicateSuggestion.name}</span> has visited your flat {duplicateSuggestion.count} times. Create a recurring pass instead?
                      </div>
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => setVisitType("recurring")}
                        className="h-7 bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-2.5 text-[10px] border-0"
                      >
                        Change to Recurring
                      </Button>
                    </motion.div>
                  )}

                  {/* Category and Frequency */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Visitor Category</label>
                      <select
                        value={visitorType}
                        onChange={(e) => setVisitorType(e.target.value)}
                        className="w-full h-10 px-3 border rounded-xl text-xs bg-card"
                      >
                        {visitorTypeOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Invite Option</label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => setVisitType("one-time")}
                          className={`flex-1 h-10 rounded-xl text-xs font-bold border-0 ${
                            visitType === "one-time"
                              ? "bg-primary text-white"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                          }`}
                        >
                          One-Time Visit
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setVisitType("recurring")}
                          className={`flex-1 h-10 rounded-xl text-xs font-bold border-0 ${
                            visitType === "recurring"
                              ? "bg-primary text-white"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                          }`}
                        >
                          Recurring Visit
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Recurring Schedule parameters */}
                  {visitType === "recurring" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-1">Frequency</label>
                          <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as any)}
                            className="w-full h-9 border rounded-lg text-xs bg-card px-2"
                          >
                            <option value="daily">Daily Helper (Cook/Maid)</option>
                            <option value="weekly">Weekly Service (Tutor/Cleaner)</option>
                            <option value="monthly">Monthly Service (Tech)</option>
                          </select>
                        </div>
                        {frequency === "weekly" && (
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block mb-1">Select Active Days</label>
                            <div className="flex flex-wrap gap-1">
                              {daysOfWeek.map((day) => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => handleDayToggle(day)}
                                  className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
                                    selectedDays.includes(day)
                                      ? "bg-primary text-white"
                                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {day.slice(0, 3)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Date and Time slots */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Expected Arrival Time</label>
                      <Input
                        type="datetime-local"
                        value={expectedAt}
                        onChange={(e) => setExpectedAt(e.target.value)}
                        className="h-10 text-xs rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Expected Departure Time (Optional)</label>
                      <Input
                        type="datetime-local"
                        value={expectedExit}
                        onChange={(e) => setExpectedExit(e.target.value)}
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Vehicle details */}
                  <div className="p-4 rounded-xl border border-border bg-secondary/10 space-y-3">
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Vehicle Management</span>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground block mb-1">Vehicle Type</label>
                        <select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value as any)}
                          className="w-full h-9 border rounded-lg text-xs bg-card px-2"
                        >
                          <option value="none">No Vehicle</option>
                          <option value="two-wheeler">Two-Wheeler (Bike/Scooter)</option>
                          <option value="four-wheeler">Four-Wheeler (Car/Cab)</option>
                        </select>
                      </div>
                      {vehicleType !== "none" && (
                        <>
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground block mb-1">Vehicle Number</label>
                            <Input
                              placeholder="e.g. MH 12 AB 1234"
                              value={vehicleNumber}
                              onChange={(e) => setVehicleNumber(e.target.value)}
                              className="h-9 text-xs rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground block mb-1">Number of Guests</label>
                            <Input
                              type="number"
                              min={1}
                              value={numberOfVisitors}
                              onChange={(e) => setNumberOfVisitors(Number(e.target.value))}
                              className="h-9 text-xs rounded-lg"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Special instructions */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Special Instructions for Gate Guard</label>
                    <Input
                      placeholder="e.g. 'Call before coming', 'Drop parcel at locker box'"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 gradient-primary text-white border-0 rounded-xl font-bold text-xs mt-4"
                  >
                    Create Pre-Approval & Generate QR Pass
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tab 3: Favorites */}
          {activeTab === "favorites" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold flex items-center gap-1.5"><Heart className="w-5 h-5 text-pink-500 fill-pink-500" /> Frequent Visitors Shortcut</h3>
              <p className="text-xs text-muted-foreground">Pre-approve your daily helper, parents, or regular tutor in one single click.</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myFavorites.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-muted-foreground text-xs border border-dashed rounded-2xl">
                    No favorites added yet. Mark favorite flags on visitor history cards.
                  </div>
                ) : (
                  myFavorites.map((fav) => (
                    <Card key={fav.id} className="border-border/50 bg-card hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2.5 items-center">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="bg-pink-100 text-pink-600 font-bold text-xs">
                                {fav.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs">
                              <h4 className="font-bold text-foreground">{fav.name}</h4>
                              <p className="text-muted-foreground">{fav.visitorType}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={() => removeFavoriteVisitor(fav.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {fav.vehicleNumber && `Vehicle: ${fav.vehicleNumber}`}
                          {fav.specialInstructions && <p className="truncate mt-0.5">Instructions: "{fav.specialInstructions}"</p>}
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleQuickInvite(fav)}
                          className="w-full h-8 bg-pink-600 hover:bg-pink-700 text-white border-0 rounded-lg text-[10px] font-bold"
                        >
                          1-Click Invite Pass
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Calendar */}
          {activeTab === "calendar" && (
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-heading)] flex items-center gap-1.5"><Calendar className="w-5 h-5 text-primary" /> Upcoming Visitors Calendar</CardTitle>
                <CardDescription>Scheduled visitor passes for the coming days</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {upcomingVisitors.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground text-xs">
                      No upcoming guests scheduled on calendar.
                    </div>
                  ) : (
                    Object.entries(
                      upcomingVisitors.reduce((groups: Record<string, Visitor[]>, v) => {
                        const dateStr = v.date || "Upcoming";
                        if (!groups[dateStr]) groups[dateStr] = [];
                        groups[dateStr].push(v);
                        return groups;
                      }, {})
                    ).sort().map(([dateStr, items]) => (
                      <div key={dateStr} className="space-y-2">
                        <span className="text-xs font-bold text-foreground border-b pb-1 block border-border/30">
                          {new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                        <div className="grid gap-2 pl-2">
                          {items.map(item => (
                            <div key={item.id} className="p-3 border border-border/40 rounded-xl bg-secondary/5 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-foreground">{item.name}</span>
                                <span className="text-muted-foreground ml-2">({item.visitorType})</span>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Expected: {new Date(item.expectedAt || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <Badge className="bg-primary/10 text-primary border-primary/20">{item.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 5: History */}
          {activeTab === "history" && (
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3 border-b flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-bold">Visitor Archives</CardTitle>
                  <CardDescription>Search and review your flat's previous guest entries</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Input
                    placeholder="Search by name, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-48 h-9 text-xs rounded-xl border-border/60"
                  />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-9 border border-border/60 rounded-xl text-[10px] bg-card px-2 font-semibold"
                  >
                    <option value="all">All Status</option>
                    <option value="checked-in">Checked-In</option>
                    <option value="checked-out">Checked-Out</option>
                    <option value="denied">Denied</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/20">
                  {filteredHistory.map((v) => {
                    const isFav = myFavorites.some(f => f.phone === v.phone);
                    const cfg = statusConfig[v.status] || statusConfig.expected;
                    const Icon = cfg.icon;
                    return (
                      <div key={v.id} className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-secondary/5 transition-colors">
                        <div className="flex gap-3 items-center">
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarFallback className="bg-secondary text-muted-foreground font-bold">
                              {v.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground text-sm">{v.name}</span>
                              <Badge className={cfg.color} variant="outline">
                                <Icon className="w-3.5 h-3.5 mr-1" /> {cfg.label}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-[10px]">{v.visitorType} • Phone: {v.phone} • Purpose: {v.purpose}</p>
                            <p className="text-[9px] text-muted-foreground font-semibold">Date: {new Date(v.expectedAt || v.checkInTime || "").toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFavorite(v)}
                            className="h-8 w-8 p-0 hover:bg-pink-500/10 rounded-full"
                          >
                            <Star className={`w-4 h-4 ${isFav ? "text-pink-500 fill-pink-500" : "text-muted-foreground"}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTimelineVisitor(v);
                              setActiveTab("dashboard");
                            }}
                            className="h-8 rounded-lg text-[10px] font-bold border-border/50"
                          >
                            Track Journey
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredHistory.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground text-xs">
                      No records match the filter query.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 5. PASS DETAILS MODAL PREVIEW (With actual QR SVGs) */}
      <Dialog open={showPassModal} onOpenChange={setShowPassModal}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)] text-center text-lg font-bold">Visitor Gate Pass 🎟️</DialogTitle>
          </DialogHeader>
          {generatedPass && (
            <div className="space-y-4 mt-3">
              <div className="p-5 bg-gradient-to-b from-secondary/50 to-secondary/10 border border-border/60 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-8 -mt-8 pointer-events-none" />
                <div className="text-center space-y-3">
                  <div className="bg-card p-3 rounded-2xl inline-block shadow-sm">
                    <QRCodeSVG
                      value={`HOMEVERSE-PASS-${generatedPass.id}-${generatedPass.otp}`}
                      size={110}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground">{generatedPass.name}</h3>
                    <p className="text-xs text-muted-foreground">{generatedPass.visitorType} Pass</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs pt-4 border-t border-dashed border-border/60">
                  <div>
                    <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Visiting Flat</span>
                    <span className="font-bold text-foreground">{generatedPass.visitingUnit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Pass Gate Code OTP</span>
                    <span className="font-bold text-primary text-sm font-mono">{generatedPass.otp}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Scheduled Date</span>
                    <span className="font-bold text-foreground">{new Date(generatedPass.expectedAt || "").toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Validity</span>
                    <span className="font-bold text-foreground">One-Day Use</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`Hi! Here is your Gate Pass for HomeVerse Society:\nVisitor: ${generatedPass.name}\nFlat: ${generatedPass.visitingUnit}\nOTP: ${generatedPass.otp}\nPass ID: ${generatedPass.id}`);
                    alert("Pass details copied to clipboard!");
                  }}
                  className="flex-1 bg-primary text-white border-0 h-10 rounded-xl text-xs font-bold shadow-md shadow-primary/20"
                >
                  <Share2 className="w-4 h-4 mr-1.5" /> Share Pass Details
                </Button>
                <Button
                  onClick={() => setShowPassModal(false)}
                  variant="outline"
                  className="h-10 rounded-xl border-border/60 text-xs font-bold"
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
