"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, Users, IndianRupee, MessageSquareWarning, Wrench, Shield,
  Calendar, Megaphone, Bot, Sparkles, Plus, Search, Trash2, CheckCircle2,
  XCircle, AlertTriangle, Send, Check, Download, FileText, Eye, Power,
  ArrowRight, UserCheck, CreditCard, BarChart3, Waves, Zap, ShieldAlert,
  ClipboardList, Share2, DollarSign, Activity, Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { SocietyResidentDashboard } from "./SocietyResidentDashboard";
import dynamic from "next/dynamic";

const SocietyExpenseChart = dynamic(() => import("@/components/charts/SocietyExpenseChart"), { ssr: false });
const SocietyUtilityChart = dynamic(() => import("@/components/charts/SocietyUtilityChart"), { ssr: false });

export function SocietySecretaryDashboard({ secretary }: { secretary: any }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "resident">("dashboard");
  const [adminSubTab, setAdminSubTab] = useState<"approvals" | "residents" | "finance" | "operations" | "governance">("approvals");

  // Load state and actions from Central Store
  const {
    users,
    complaints,
    visitors,
    parcels,
    maintenanceBills,
    communityEvents,
    announcements,
    emergencies,
    gatePasses,
    vehicleLogs,
    incidents,
    marketplaceItems,
    expenses,
    flats,
    rentRecords,

    approveUser,
    rejectUser,
    activateDeactivateUser,
    addFlat,
    addExpense,
    addRentRecord,
    payRentRecord,
    payMaintenanceBill,
    generateBulkMaintenanceBills,
    deleteMarketplaceItem,
    assignComplaintWorker,
    updateComplaintStatus,
    updateEmergencyStatus,
    addAnnouncement,
    createEvent
  } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      complaints: state.complaints || [],
      visitors: state.visitors || [],
      parcels: state.parcels || [],
      maintenanceBills: state.maintenanceBills || [],
      communityEvents: state.communityEvents || [],
      announcements: state.announcements || [],
      emergencies: state.emergencies || [],
      gatePasses: state.gatePasses || [],
      vehicleLogs: state.vehicleLogs || [],
      incidents: state.incidents || [],
      marketplaceItems: state.marketplaceItems || [],
      expenses: state.expenses || [],
      flats: state.flats || [],
      rentRecords: state.rentRecords || [],

      approveUser: state.approveUser,
      rejectUser: state.rejectUser,
      activateDeactivateUser: state.activateDeactivateUser,
      addFlat: state.addFlat,
      addExpense: state.addExpense,
      addRentRecord: state.addRentRecord,
      payRentRecord: state.payRentRecord,
      payMaintenanceBill: state.payMaintenanceBill,
      generateBulkMaintenanceBills: state.generateBulkMaintenanceBills,
      deleteMarketplaceItem: state.deleteMarketplaceItem,
      assignComplaintWorker: state.assignComplaintWorker,
      updateComplaintStatus: state.updateComplaintStatus,
      updateEmergencyStatus: state.updateEmergencyStatus,
      addAnnouncement: state.addAnnouncement,
      createEvent: state.createEvent
    }))
  );

  // --- Search & Filter States ---
  const [residentSearch, setResidentSearch] = useState("");
  const [workerSearch, setWorkerSearch] = useState("");
  const [complaintFilter, setComplaintFilter] = useState("all");

  // --- Form Input States ---
  // 1. New Resident Modal/Form State
  const [newResidentName, setNewResidentName] = useState("");
  const [newResidentPhone, setNewResidentPhone] = useState("");
  const [newResidentEmail, setNewResidentEmail] = useState("");
  const [newResidentFlat, setNewResidentFlat] = useState("");
  const [newResidentBuilding, setNewResidentBuilding] = useState("A Wing");
  const [newResidentType, setNewResidentType] = useState("Owner");

  // 2. New Flat State
  const [newFlatNo, setNewFlatNo] = useState("");
  const [newFlatWing, setNewFlatWing] = useState("A");
  const [newFlatBuilding, setNewFlatBuilding] = useState("A Wing");
  const [newFlatFloor, setNewFlatFloor] = useState(1);

  // 3. Maintenance Billing State
  const [billingMonth, setBillingMonth] = useState("July 2026");
  const [chargeMaintenance, setChargeMaintenance] = useState(3000);
  const [chargeWater, setChargeWater] = useState(500);
  const [chargeElectricity, setChargeElectricity] = useState(600);
  const [chargeParking, setChargeParking] = useState(400);
  const [chargeSinking, setChargeSinking] = useState(300);
  const [chargeRepair, setChargeRepair] = useState(200);
  const [chargePenalties, setChargePenalties] = useState(0);
  const [chargeOther, setChargeOther] = useState(0);

  // 4. Rent Collection State
  const [rentTenant, setRentTenant] = useState("");
  const [rentFlat, setRentFlat] = useState("");
  const [rentBuilding, setRentBuilding] = useState("A Wing");
  const [rentAmount, setRentAmount] = useState(15000);
  const [rentDueDate, setRentDueDate] = useState("2026-07-10");

  // 5. Expense Logger State
  const [expCategory, setExpCategory] = useState("Security Salaries");
  const [expVendor, setExpVendor] = useState("");
  const [expAmount, setExpAmount] = useState(0);
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [expNotes, setExpNotes] = useState("");

  // 6. Notices Board State
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticePriority, setNoticePriority] = useState<"normal" | "important" | "urgent">("normal");
  const [noticeTag, setNoticeTag] = useState("General");

  // 7. Event Planner State
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState<"festival" | "meeting" | "workshop" | "sports">("meeting");

  // --- Real-time Stats Computations ---
  const stats = useMemo(() => {
    const totalResidents = users.filter(u => u.role === "resident" && u.status === "approved").length;
    const pendingResidentsCount = users.filter(u => u.role === "resident" && u.status === "pending").length;
    const pendingWorkersCount = users.filter(u => u.role === "worker" && u.status === "pending").length;

    const occupiedFlats = flats.filter(f => f.status === "occupied").length;
    const vacantFlats = flats.filter(f => f.status === "vacant").length;

    const pendingPaymentsCount = maintenanceBills.filter(b => b.status === "pending" || b.status === "overdue").length;
    const monthlyCollection = maintenanceBills.filter(b => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);
    const outstandingDues = maintenanceBills.filter(b => b.status === "pending" || b.status === "overdue").reduce((sum, b) => sum + b.amount, 0);
    const collectionPercentage = maintenanceBills.length > 0 
      ? Math.round((monthlyCollection / (monthlyCollection + outstandingDues)) * 100) 
      : 100;

    const monthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingComplaints = complaints.filter(c => c.status !== "resolved" && c.status !== "closed").length;
    const activeWorkers = users.filter(u => u.role === "worker" && u.status === "approved").length;
    const visitorsToday = visitors.filter(v => v.date === new Date().toISOString().split("T")[0]).length;
    const emergencyRequests = emergencies.filter(e => e.status === "pending").length;
    const securityAlerts = emergencies.length;
    const upcomingEvents = communityEvents.length;

    return {
      totalResidents,
      pendingResidentsCount,
      pendingWorkersCount,
      occupiedFlats,
      vacantFlats,
      pendingPaymentsCount,
      monthlyCollection,
      outstandingDues,
      collectionPercentage,
      monthlyExpenses,
      pendingComplaints,
      activeWorkers,
      visitorsToday,
      emergencyRequests,
      securityAlerts,
      upcomingEvents
    };
  }, [users, flats, maintenanceBills, expenses, complaints, visitors, emergencies, communityEvents]);

  // --- Filtering Residents & Workers ---
  const filteredResidents = useMemo(() => {
    return users.filter(u => 
      u.role === "resident" && 
      u.status !== "pending" &&
      (u.name.toLowerCase().includes(residentSearch.toLowerCase()) || 
       (u.unit && u.unit.includes(residentSearch)) ||
       (u.building && u.building.toLowerCase().includes(residentSearch.toLowerCase())))
    );
  }, [users, residentSearch]);

  const filteredWorkers = useMemo(() => {
    return users.filter(u => 
      u.role === "worker" && 
      u.status !== "pending" &&
      (u.name.toLowerCase().includes(workerSearch.toLowerCase()) || 
       (u.workerCategory && u.workerCategory.toLowerCase().includes(workerSearch.toLowerCase())))
    );
  }, [users, workerSearch]);

  const filteredComplaints = useMemo(() => {
    if (complaintFilter === "all") return complaints;
    return complaints.filter(c => c.status === complaintFilter);
  }, [complaints, complaintFilter]);

  // --- Actions Dispatch Handlers ---
  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResidentName || !newResidentEmail || !newResidentFlat) {
      alert("Please fill in all mandatory fields.");
      return;
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name: newResidentName,
      email: newResidentEmail,
      phone: newResidentPhone || "+91 99999 00000",
      role: "resident" as const,
      portal: "society" as const,
      unit: newResidentFlat,
      building: newResidentBuilding,
      ownerOrTenant: newResidentType,
      joinedAt: new Date().toISOString().split("T")[0],
      status: "approved" as const
    };
    useCommunityStore.getState().addRegisteredUser(newUser);

    // Update flat database status
    const matchFlat = flats.find(f => f.flatNumber === newResidentFlat && f.building === newResidentBuilding);
    if (matchFlat) {
      // Direct mutation since updateFlatStatus isn't fully structured
      useCommunityStore.setState(state => ({
        flats: state.flats.map(f => f.id === matchFlat.id ? { ...f, status: "occupied", residentId: `user-${Date.now()}`, residentName: newResidentName } : f)
      }));
    }

    setNewResidentName("");
    setNewResidentPhone("");
    setNewResidentEmail("");
    setNewResidentFlat("");
    alert("Resident account created and active immediately!");
  };

  const handleAddFlat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlatNo) return;
    addFlat({
      building: newFlatBuilding,
      wing: newFlatWing,
      floor: newFlatFloor,
      flatNumber: newFlatNo,
      status: "vacant"
    });
    setNewFlatNo("");
    alert(`Flat ${newFlatWing}-${newFlatNo} added successfully!`);
  };

  const handleGenerateBills = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = Number(chargeMaintenance) + Number(chargeWater) + Number(chargeElectricity) + 
                        Number(chargeParking) + Number(chargeSinking) + Number(chargeRepair) + 
                        Number(chargePenalties) + Number(chargeOther);
    
    generateBulkMaintenanceBills({
      month: billingMonth,
      amount: totalAmount,
      breakdown: [
        { label: "Maintenance", amount: Number(chargeMaintenance) },
        { label: "Water", amount: Number(chargeWater) },
        { label: "Electricity Common Area", amount: Number(chargeElectricity) },
        { label: "Parking Space", amount: Number(chargeParking) },
        { label: "Sinking Fund Contribution", amount: Number(chargeSinking) },
        { label: "Repairs & Infrastructure", amount: Number(chargeRepair) },
        { label: "Late Fees / Penalties", amount: Number(chargePenalties) },
        { label: "Other Levies", amount: Number(chargeOther) }
      ]
    });
    alert(`Maintenance bills generated for all approved residents for ${billingMonth}!`);
  };

  const handleAddRent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentTenant || !rentFlat) return;
    addRentRecord({
      unit: rentFlat,
      building: rentBuilding,
      tenantName: rentTenant,
      amount: rentAmount,
      dueDate: rentDueDate,
      status: "pending"
    });
    setRentTenant("");
    setRentFlat("");
    alert(`Rent record created for Flat ${rentFlat}!`);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expVendor || expAmount <= 0) return;
    addExpense({
      category: expCategory,
      vendor: expVendor,
      amount: Number(expAmount),
      date: expDate,
      notes: expNotes,
      invoiceUrl: "/invoices/stub.pdf"
    });
    setExpVendor("");
    setExpAmount(0);
    setExpNotes("");
    alert("Expense recorded and logged successfully!");
  };

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;
    addAnnouncement({
      title: noticeTitle,
      content: noticeContent,
      author: secretary.name,
      authorRole: "secretary",
      priority: noticePriority,
      tags: [noticeTag, "Notice"]
    });
    setNoticeTitle("");
    setNoticeContent("");
    alert("Society notice broadcasted to all residents!");
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate) return;
    createEvent({
      title: eventTitle,
      description: eventDesc,
      date: eventDate,
      time: eventTime || "18:00",
      location: eventLocation || "Clubhouse",
      organizer: secretary.name,
      priority: "normal"
    });
    setEventTitle("");
    setEventDesc("");
    setEventDate("");
    alert("Society Event scheduled! Notifications dispatched.");
  };

  // --- Document Mock Exporters ---
  const handleExport = (format: "pdf" | "excel" | "csv", filename: string) => {
    alert(`Generating financial reports...\nYour file "${filename}.${format}" is ready for download!`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="text-2xl lg:text-3xl font-extrabold font-[family-name:var(--font-heading)]">
              {secretary.designation || "Secretary"} Command Center
            </h1>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            Society Operator: <strong>{secretary.name}</strong> • Complex: <strong>{secretary.societyName || "Sunshine Complex"}</strong> • Committee ID: <strong>{secretary.committeeId || "SEC-COM-1"}</strong>
          </p>
        </div>

        {/* Dashboard Switcher Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-secondary/50 border border-border/50 rounded-xl w-fit">
          <Button
            size="sm"
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            onClick={() => setActiveTab("dashboard")}
            className="rounded-lg h-9 text-xs px-4"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            Command Center
          </Button>
          <Button
            size="sm"
            variant={activeTab === "resident" ? "default" : "ghost"}
            onClick={() => setActiveTab("resident")}
            className="rounded-lg h-9 text-xs px-4"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Resident View
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "resident" ? (
          <motion.div
            key="resident-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <SocietyResidentDashboard resident={secretary} />
          </motion.div>
        ) : (
          <motion.div
            key="admin-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {[
                { label: "Residents Active", value: stats.totalResidents, desc: `${stats.pendingResidentsCount} pending`, icon: Users, color: "text-blue-500 bg-blue-500/10" },
                { label: "Occupancy Rate", value: `${stats.occupiedFlats}/${stats.occupiedFlats + stats.vacantFlats} Flats`, desc: `${stats.vacantFlats} vacant`, icon: Building2, color: "text-emerald-500 bg-emerald-500/10" },
                { label: "Complaints Pending", value: stats.pendingComplaints, desc: "Awaiting worker", icon: MessageSquareWarning, color: "text-amber-500 bg-amber-500/10" },
                { label: "Monthly Collection", value: `₹${stats.monthlyCollection}`, desc: `${stats.collectionPercentage}% collected`, icon: IndianRupee, color: "text-green-500 bg-green-500/10" },
                { label: "Expenses Logged", value: `₹${stats.monthlyExpenses}`, desc: "This month", icon: DollarSign, color: "text-rose-500 bg-rose-500/10" },
                { label: "Safety SOS Alerts", value: stats.securityAlerts, desc: `${stats.emergencyRequests} unresolved`, icon: ShieldAlert, color: "text-red-500 bg-red-500/10" }
              ].map((card, idx) => (
                <Card key={idx} className="border-border/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex flex-col justify-between h-full min-h-[110px]">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{card.label}</span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                        <card.icon className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold mt-2">{card.value}</div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{card.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sub-tabs Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-border/50 pb-3">
              {[
                { id: "approvals", label: `Approvals Queue (${stats.pendingResidentsCount + stats.pendingWorkersCount})`, icon: ClipboardList },
                { id: "residents", label: "Residents & Flats", icon: Users },
                { id: "finance", label: "Finances & Bills", icon: IndianRupee },
                { id: "operations", label: "Operations & Workers", icon: Wrench },
                { id: "governance", label: "Governance & AI", icon: Megaphone }
              ].map((t) => (
                <Button
                  key={t.id}
                  variant={adminSubTab === t.id ? "default" : "outline"}
                  onClick={() => setAdminSubTab(t.id as any)}
                  className="rounded-xl h-9 text-xs px-3 shadow-sm"
                >
                  <t.icon className="w-3.5 h-3.5 mr-1.5" />
                  {t.label}
                </Button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="grid gap-6">
              {/* TAB 1: APPROVALS */}
              {adminSubTab === "approvals" && (
                <div className="space-y-6">
                  {/* Resident Approvals */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                        <Users className="w-4.5 h-4.5 text-primary" /> Resident Approval Requests
                      </CardTitle>
                      <CardDescription className="text-xs">Verify credentials before granting complex access</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/50">
                        {users.filter(u => u.role === "resident" && u.status === "pending").map((u) => (
                          <div key={u.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-secondary/20">
                            <div>
                              <h4 className="text-sm font-semibold">{u.name}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Unit: <strong>{u.building} • Flat {u.unit}</strong> | Email: {u.email} | Mobile: {u.phone}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1">Ownership Type: <Badge variant="outline" className="text-[8px] py-0">{u.ownerOrTenant || "Tenant"}</Badge></p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveUser(u.id)}
                                className="h-8 text-xs border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-600 rounded-lg"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectUser(u.id)}
                                className="h-8 text-xs border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => alert(`Requested document upload for resident: ${u.name}`)}
                                className="h-8 text-xs text-muted-foreground hover:bg-secondary rounded-lg"
                              >
                                Request Info
                              </Button>
                            </div>
                          </div>
                        ))}
                        {users.filter(u => u.role === "resident" && u.status === "pending").length === 0 && (
                          <div className="text-center py-10 text-xs text-muted-foreground">No resident registrations awaiting approval.</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Worker Approvals */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                        <Wrench className="w-4.5 h-4.5 text-primary" /> Worker Registration Approvals
                      </CardTitle>
                      <CardDescription className="text-xs">Staff and local trade contractors awaiting gate authorization</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/50">
                        {users.filter(u => u.role === "worker" && u.status === "pending").map((u) => (
                          <div key={u.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-secondary/20">
                            <div>
                              <h4 className="text-sm font-semibold">{u.name}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Category: <strong>{u.workerCategory}</strong> | Shift: {u.workingShift || "General"} | ID Badge: {u.employeeId}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Contact: {u.phone} | Registration Date: {u.joinedAt}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveUser(u.id)}
                                className="h-8 text-xs border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-600 rounded-lg"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectUser(u.id)}
                                className="h-8 text-xs border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                        {users.filter(u => u.role === "worker" && u.status === "pending").length === 0 && (
                          <div className="text-center py-10 text-xs text-muted-foreground">No worker registrations awaiting approval.</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 2: RESIDENTS & FLATS */}
              {adminSubTab === "residents" && (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left Column - Directory */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3 flex flex-col sm:flex-row justify-between gap-3">
                        <div>
                          <CardTitle className="text-base font-semibold">Residents Directory</CardTitle>
                          <CardDescription className="text-xs">Search, activate/deactivate resident profiles</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search name, flat or wing..."
                            value={residentSearch}
                            onChange={(e) => setResidentSearch(e.target.value)}
                            className="pl-9 h-9 text-xs rounded-xl"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-border/50 bg-secondary/30">
                                <th className="p-3 font-semibold text-muted-foreground">Name</th>
                                <th className="p-3 font-semibold text-muted-foreground">Flat / Building</th>
                                <th className="p-3 font-semibold text-muted-foreground">Ownership</th>
                                <th className="p-3 font-semibold text-muted-foreground">Contact</th>
                                <th className="p-3 font-semibold text-muted-foreground">Status</th>
                                <th className="p-3 font-semibold text-muted-foreground text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {filteredResidents.map((u) => (
                                <tr key={u.id} className="hover:bg-secondary/10">
                                  <td className="p-3 font-medium flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="text-[9px] bg-primary/20 text-primary">{u.name[0]}</AvatarFallback>
                                    </Avatar>
                                    {u.name}
                                  </td>
                                  <td className="p-3">Unit {u.unit} • {u.building}</td>
                                  <td className="p-3">
                                    <Badge variant="outline" className="text-[10px] font-medium py-0">{u.ownerOrTenant || "Owner"}</Badge>
                                  </td>
                                  <td className="p-3 text-muted-foreground">{u.phone}</td>
                                  <td className="p-3">
                                    {u.status === "approved" ? (
                                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10 border-0 text-[10px]">Active</Badge>
                                    ) : (
                                      <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/10 border-0 text-[10px]">Deactive</Badge>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => {
                                          const nextStatus = u.status === "approved" ? "deactivated" : "approved";
                                          activateDeactivateUser(u.id, nextStatus as any);
                                        }}
                                        className="w-7 h-7 rounded-md"
                                        title={u.status === "approved" ? "Deactivate" : "Activate"}
                                      >
                                        <Power className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => {
                                          const newType = u.ownerOrTenant === "Owner" ? "Tenant" : "Owner";
                                          useCommunityStore.setState(state => ({
                                            users: state.users.map(item => item.id === u.id ? { ...item, ownerOrTenant: newType } : item)
                                          }));
                                          alert("Ownership transferred successfully!");
                                        }}
                                        className="w-7 h-7 rounded-md"
                                        title="Transfer Type"
                                      >
                                        <Share2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredResidents.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="text-center py-10 text-muted-foreground">No residents found matching filter.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Occupied Flats View */}
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Society Flat Directory & Occupancy</CardTitle>
                        <CardDescription className="text-xs">Wings and Floors structural records</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
                          {flats.map((fl) => (
                            <div
                              key={fl.id}
                              className={`p-3.5 rounded-xl border flex flex-col justify-between min-h-[90px] ${
                                fl.status === "occupied" 
                                  ? "bg-green-500/5 border-green-500/20" 
                                  : "bg-secondary/20 border-border/50"
                              }`}
                            >
                              <div>
                                <span className="text-[10px] text-muted-foreground block">{fl.building}</span>
                                <span className="font-bold text-sm">Flat {fl.flatNumber} (Floor {fl.floor})</span>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <Badge className={`text-[9px] py-0 border-0 ${
                                  fl.status === "occupied" ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                                }`}>
                                  {fl.status === "occupied" ? "Occupied" : "Vacant"}
                                </Badge>
                                {fl.status === "occupied" && (
                                  <span className="text-[9px] font-semibold text-foreground truncate max-w-[80px]" title={fl.residentName}>
                                    👤 {fl.residentName?.split(" ")[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Forms */}
                  <div className="space-y-6">
                    {/* Onboard Resident */}
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Onboard Resident</CardTitle>
                        <CardDescription className="text-xs">Register and activate a flat owner or tenant manually</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddResident} className="space-y-3.5 text-xs">
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Full Name</label>
                            <Input
                              placeholder="e.g. Ramesh Patel"
                              value={newResidentName}
                              onChange={(e) => setNewResidentName(e.target.value)}
                              className="h-9 rounded-xl text-xs"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Flat No</label>
                              <Input
                                placeholder="e.g. 102"
                                value={newResidentFlat}
                                onChange={(e) => setNewResidentFlat(e.target.value)}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Building / Wing</label>
                              <select
                                value={newResidentBuilding}
                                onChange={(e) => setNewResidentBuilding(e.target.value)}
                                className="w-full h-9 px-2 rounded-xl border border-input bg-card text-xs"
                              >
                                <option value="A Wing">A Wing</option>
                                <option value="B Wing">B Wing</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Email (Auto Username)</label>
                            <Input
                              placeholder="e.g. ramesh@sunshinecomplex.com"
                              value={newResidentEmail}
                              onChange={(e) => setNewResidentEmail(e.target.value)}
                              className="h-9 rounded-xl text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Mobile Phone</label>
                            <Input
                              placeholder="+91 XXXXX XXXXX"
                              value={newResidentPhone}
                              onChange={(e) => setNewResidentPhone(e.target.value)}
                              className="h-9 rounded-xl text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Occupancy Type</label>
                            <select
                              value={newResidentType}
                              onChange={(e) => setNewResidentType(e.target.value)}
                              className="w-full h-9 px-2 rounded-xl border border-input bg-card text-xs"
                            >
                              <option value="Owner">Owner</option>
                              <option value="Tenant">Tenant</option>
                            </select>
                          </div>
                          <Button type="submit" className="w-full h-9 rounded-xl text-xs gradient-primary mt-2 text-white border-0">
                            Add Resident
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Add Flat Structure */}
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Construct Flat Registry</CardTitle>
                        <CardDescription className="text-xs">Add new flats dynamically to the society grid</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddFlat} className="space-y-3.5 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Building</label>
                              <select
                                value={newFlatBuilding}
                                onChange={(e) => setNewFlatBuilding(e.target.value)}
                                className="w-full h-9 px-2 rounded-xl border border-input bg-card text-xs"
                              >
                                <option value="A Wing">A Wing</option>
                                <option value="B Wing">B Wing</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Wing Code</label>
                              <Input
                                placeholder="e.g. A"
                                value={newFlatWing}
                                onChange={(e) => setNewFlatWing(e.target.value)}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Floor Number</label>
                              <Input
                                type="number"
                                placeholder="e.g. 1"
                                value={newFlatFloor}
                                onChange={(e) => setNewFlatFloor(Number(e.target.value))}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Flat Unit Code</label>
                              <Input
                                placeholder="e.g. 103"
                                value={newFlatNo}
                                onChange={(e) => setNewFlatNo(e.target.value)}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                          </div>
                          <Button type="submit" className="w-full h-9 rounded-xl text-xs gradient-primary mt-2 text-white border-0">
                            Build Registry Flat
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 3: FINANCE & BILLS */}
              {adminSubTab === "finance" && (
                <div className="space-y-6">
                  {/* Financial Metrics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-border/50 bg-secondary/10">
                      <CardContent className="p-4">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Outstanding Dues</span>
                        <div className="text-xl font-bold text-red-500 mt-1">₹{stats.outstandingDues}</div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{stats.pendingPaymentsCount} Pending Invoices</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/50 bg-secondary/10">
                      <CardContent className="p-4">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Collections</span>
                        <div className="text-xl font-bold text-green-500 mt-1">₹{stats.monthlyCollection}</div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">For active month</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/50 bg-secondary/10">
                      <CardContent className="p-4">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Billing Revenue</span>
                        <div className="text-xl font-bold text-foreground mt-1">₹{stats.monthlyCollection + stats.outstandingDues}</div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Total active accounts</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/50 bg-secondary/10">
                      <CardContent className="p-4">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Collection Efficiency</span>
                        <div className="text-xl font-bold text-primary mt-1">{stats.collectionPercentage}%</div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Target: 95% minimum</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Bulk Maintenance Billing Generator */}
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Generate Maintenance Billing</CardTitle>
                        <CardDescription className="text-xs">Distribute monthly charges to all approved resident units instantly</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleGenerateBills} className="space-y-3 text-xs">
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Billing Period / Month</label>
                            <Input
                              placeholder="e.g. July 2026"
                              value={billingMonth}
                              onChange={(e) => setBillingMonth(e.target.value)}
                              className="h-9 rounded-xl text-xs font-semibold"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Maintenance (₹)</label>
                              <Input
                                type="number"
                                value={chargeMaintenance}
                                onChange={(e) => setChargeMaintenance(Number(e.target.value))}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Water Charge (₹)</label>
                              <Input
                                type="number"
                                value={chargeWater}
                                onChange={(e) => setChargeWater(Number(e.target.value))}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Common Elect. (₹)</label>
                              <Input
                                type="number"
                                value={chargeElectricity}
                                onChange={(e) => setChargeElectricity(Number(e.target.value))}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Parking Spaces (₹)</label>
                              <Input
                                type="number"
                                value={chargeParking}
                                onChange={(e) => setChargeParking(Number(e.target.value))}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Sinking Fund (₹)</label>
                              <Input
                                type="number"
                                value={chargeSinking}
                                onChange={(e) => setChargeSinking(Number(e.target.value))}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Repairs Levy (₹)</label>
                              <Input
                                type="number"
                                value={chargeRepair}
                                onChange={(e) => setChargeRepair(Number(e.target.value))}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Penalties (₹)</label>
                              <Input
                                type="number"
                                value={chargePenalties}
                                onChange={(e) => setChargePenalties(Number(e.target.value))}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Other (₹)</label>
                              <Input
                                type="number"
                                value={chargeOther}
                                onChange={(e) => setChargeOther(Number(e.target.value))}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                          </div>
                          <Button type="submit" className="w-full h-9 rounded-xl text-xs gradient-primary mt-2 text-white border-0">
                            Publish Bulk Invoices
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Maintenance Bills Ledger */}
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-3 flex flex-col sm:flex-row justify-between gap-3">
                          <div>
                            <CardTitle className="text-base font-semibold">Maintenance Invoices Ledger</CardTitle>
                            <CardDescription className="text-xs">Download details, mark payments, and send push warnings</CardDescription>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => handleExport("pdf", "maintenance_report")} className="h-8 text-xs rounded-lg">
                              <Download className="w-3.5 h-3.5 mr-1" /> PDF
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleExport("csv", "maintenance_report")} className="h-8 text-xs rounded-lg">
                              <FileText className="w-3.5 h-3.5 mr-1" /> CSV
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-border/50 bg-secondary/30">
                                  <th className="p-3 font-semibold text-muted-foreground">Resident</th>
                                  <th className="p-3 font-semibold text-muted-foreground">Month</th>
                                  <th className="p-3 font-semibold text-muted-foreground">Amount</th>
                                  <th className="p-3 font-semibold text-muted-foreground">Due Date</th>
                                  <th className="p-3 font-semibold text-muted-foreground">Status</th>
                                  <th className="p-3 font-semibold text-muted-foreground text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/50">
                                {maintenanceBills.map((b) => (
                                  <tr key={b.id} className="hover:bg-secondary/10">
                                    <td className="p-3 font-medium">Flat {b.unit} • {b.residentName}</td>
                                    <td className="p-3">{b.month}</td>
                                    <td className="p-3 font-bold">₹{b.amount}</td>
                                    <td className="p-3">{b.dueDate}</td>
                                    <td className="p-3">
                                      <Badge className={`text-[10px] py-0 border-0 ${
                                        b.status === "paid" 
                                          ? "bg-green-500/10 text-green-500" 
                                          : b.status === "overdue" 
                                            ? "bg-red-500/10 text-red-500 animate-pulse" 
                                            : "bg-amber-500/10 text-amber-500"
                                      }`}>
                                        {b.status.toUpperCase()}
                                      </Badge>
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex justify-end gap-1">
                                        {b.status !== "paid" && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => payMaintenanceBill(b.id)}
                                            className="h-7 text-[10px] border-green-500/30 text-green-500 hover:bg-green-500/10 rounded-md"
                                          >
                                            Mark Paid
                                          </Button>
                                        )}
                                        {b.status !== "paid" && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => alert(`Outstanding bill notice pushed to resident: ${b.residentName}`)}
                                            className="h-7 text-[10px] text-amber-500 hover:bg-amber-500/5 rounded-md"
                                          >
                                            Remind
                                          </Button>
                                        )}
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          onClick={() => alert(`Downloading Invoice: INV-${b.id}.pdf`)}
                                          className="w-7 h-7 rounded-md"
                                          title="Download Invoice"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Rent Collection & Expense Management Row */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Rent Collection */}
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base font-semibold">Rent Collections Logs</CardTitle>
                            <CardDescription className="text-xs">Record tenant rent payments and dates tracking</CardDescription>
                          </div>
                          <Badge variant="outline">Rent Portal</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Record Rent Form */}
                        <form onSubmit={handleAddRent} className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 items-end text-xs p-3.5 rounded-xl border border-dashed border-border/70 bg-secondary/10">
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Tenant Name</label>
                            <Input placeholder="Tenant Name" value={rentTenant} onChange={(e) => setRentTenant(e.target.value)} className="h-8 rounded-lg text-xs" />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Flat / Unit</label>
                            <Input placeholder="Flat Number" value={rentFlat} onChange={(e) => setRentFlat(e.target.value)} className="h-8 rounded-lg text-xs" />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Amount (₹)</label>
                            <Input type="number" value={rentAmount} onChange={(e) => setRentAmount(Number(e.target.value))} className="h-8 rounded-lg text-xs" />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Due Date</label>
                            <Input type="date" value={rentDueDate} onChange={(e) => setRentDueDate(e.target.value)} className="h-8 rounded-lg text-xs" />
                          </div>
                          <Button type="submit" className="h-8 rounded-lg text-xs gradient-primary text-white border-0 col-span-2">
                            Log Payment Record
                          </Button>
                        </form>

                        {/* Rent Records List */}
                        <div className="divide-y divide-border/50 text-xs">
                          {rentRecords.map((r) => (
                            <div key={r.id} className="py-2.5 flex justify-between items-center gap-3">
                              <div>
                                <span className="font-semibold">Flat {r.unit} • {r.tenantName}</span>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Due: {r.dueDate} {r.paidOn && `• Paid on: ${r.paidOn}`}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">₹{r.amount}</span>
                                {r.status === "paid" ? (
                                  <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10 border-0 text-[10px]">PAID</Badge>
                                ) : (
                                  <Button size="sm" onClick={() => payRentRecord(r.id)} className="h-7 text-[10px] rounded-md gradient-primary text-white border-0">
                                    Record Pay
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Expense Logger */}
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base font-semibold">Society Expenditures Logger</CardTitle>
                            <CardDescription className="text-xs">Record payments to staff, contractors & utilities</CardDescription>
                          </div>
                          <Badge variant="outline" className="border-rose-500/30 text-rose-500 bg-rose-500/5">Debits</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <form onSubmit={handleAddExpense} className="grid grid-cols-2 gap-2.5 text-xs">
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Category</label>
                            <select
                              value={expCategory}
                              onChange={(e) => setExpCategory(e.target.value)}
                              className="w-full h-9 px-2 rounded-xl border border-input bg-card text-xs"
                            >
                              <option value="Security Salaries">Security Salaries</option>
                              <option value="Lift Servicing">Lift Servicing</option>
                              <option value="Gardening">Gardening</option>
                              <option value="Housekeeping Staff">Housekeeping Staff</option>
                              <option value="Common Electricity">Common Electricity</option>
                              <option value="Water Tank Cleaning">Water Tank Cleaning</option>
                              <option value="Repair / Masonry">Repairs / Masonry</option>
                              <option value="Festivals / Events">Festivals / Events</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Vendor Name</label>
                            <Input placeholder="e.g. Otis Elevators" value={expVendor} onChange={(e) => setExpVendor(e.target.value)} className="h-9 rounded-xl text-xs" />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Amount Paid (₹)</label>
                            <Input type="number" placeholder="₹" value={expAmount || ""} onChange={(e) => setExpAmount(Number(e.target.value))} className="h-9 rounded-xl text-xs" />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Payment Date</label>
                            <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="h-9 rounded-xl text-xs" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="font-semibold text-muted-foreground">Description / Notes</label>
                            <Input placeholder="Add notes (optional)" value={expNotes} onChange={(e) => setExpNotes(e.target.value)} className="h-9 rounded-xl text-xs" />
                          </div>
                          <Button type="submit" className="col-span-2 h-9 rounded-xl text-xs gradient-primary text-white border-0 mt-1">
                            Log Debit Transaction
                          </Button>
                        </form>

                        {/* Recent Debits */}
                        <div className="divide-y divide-border/50 text-xs">
                          {expenses.map((e) => (
                            <div key={e.id} className="py-2.5 flex justify-between items-center gap-3">
                              <div>
                                <span className="font-semibold">{e.category} ({e.vendor})</span>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Date: {e.date} • {e.notes}</p>
                              </div>
                              <span className="font-bold text-rose-500 shrink-0">₹{e.amount}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 4: OPERATIONS & WORKERS */}
              {adminSubTab === "operations" && (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Workers and Dispatch Panel */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3 flex flex-col sm:flex-row justify-between gap-3">
                        <div>
                          <CardTitle className="text-base font-semibold">Society Maintenance Workers & Staff</CardTitle>
                          <CardDescription className="text-xs">Assign jobs, check task progress and worker ratings</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Filter by category or name..."
                            value={workerSearch}
                            onChange={(e) => setWorkerSearch(e.target.value)}
                            className="pl-9 h-9 text-xs rounded-xl"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                          {filteredWorkers.map((w) => {
                            const pendingJobs = complaints.filter(c => c.assignedToId === w.id && c.status !== "resolved" && c.status !== "closed");
                            return (
                              <div key={w.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-secondary/20 text-xs">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold">{w.name}</h4>
                                    <Badge className="bg-primary/20 text-primary border-0 py-0.5 text-[9px]">{w.workerCategory}</Badge>
                                  </div>
                                  <p className="text-muted-foreground mt-0.5">Mobile: {w.phone} | Shift: {w.workingShift || "Morning"}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1">Pending Assignments: <strong className="text-foreground">{pendingJobs.length} Jobs</strong></p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-amber-500/10 text-amber-500 border-0 text-[11px] font-bold">⭐ 4.8 / 5</Badge>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const activeComplaints = complaints.filter(c => c.status === "submitted" || c.status === "assigned");
                                      if (activeComplaints.length === 0) {
                                        alert("No complaints awaiting worker assignment.");
                                        return;
                                      }
                                      const selectCompId = activeComplaints[0].id;
                                      assignComplaintWorker(selectCompId, w.name, w.id, "2 Hours");
                                      alert(`Dispatched ${w.name} to Complaint ${selectCompId}`);
                                    }}
                                    className="h-8 rounded-lg text-xs gradient-primary text-white border-0"
                                  >
                                    Assign Job
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Complaint Management Panel */}
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3 flex flex-col sm:flex-row justify-between gap-3">
                        <div>
                          <CardTitle className="text-base font-semibold">Complaints Overseer</CardTitle>
                          <CardDescription className="text-xs">Reassign workers, change priorities and close tasks</CardDescription>
                        </div>
                        <select
                          value={complaintFilter}
                          onChange={(e) => setComplaintFilter(e.target.value)}
                          className="h-9 px-2 rounded-xl border border-input bg-card text-xs font-semibold"
                        >
                          <option value="all">All Complaints</option>
                          <option value="submitted">Submitted</option>
                          <option value="assigned">Assigned</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                          {filteredComplaints.map((c) => (
                            <div key={c.id} className="p-4 space-y-2 hover:bg-secondary/20 text-xs">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <h4 className="font-semibold text-sm">{c.title}</h4>
                                  <p className="text-muted-foreground mt-0.5">Raised by {c.raisedByName} (Flat {c.unit}) • Category: {c.category}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Badge className="bg-primary/10 text-primary border-0 py-0.5 text-[9px]">{c.id}</Badge>
                                  <Badge className={`border-0 py-0.5 text-[9px] ${
                                    c.priority === "critical" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                                  }`}>{c.priority.toUpperCase()}</Badge>
                                  <Badge className="bg-secondary text-muted-foreground border-0 py-0.5 text-[9px]">{c.status}</Badge>
                                </div>
                              </div>
                              <p className="text-muted-foreground">{c.description}</p>
                              {c.assignedTo && <p className="text-[10px]">Worker Assigned: <strong className="text-foreground">{c.assignedTo}</strong></p>}
                              
                              <div className="flex items-center gap-2 pt-1.5 border-t border-border/20 mt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const worker = users.find(u => u.role === "worker" && u.status === "approved");
                                    if (worker) {
                                      assignComplaintWorker(c.id, worker.name, worker.id, "4 Hours");
                                      alert(`Dispatched Ramesh to Complaint ${c.id}`);
                                    }
                                  }}
                                  className="h-7 text-[10px] rounded-md"
                                >
                                  Dispatch Ramesh
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    updateComplaintStatus(c.id, "resolved", { by: "Secretary", note: "Resolved after joint inspection." });
                                    alert("Complaint status updated to resolved!");
                                  }}
                                  className="h-7 text-[10px] border-green-500/30 text-green-500 hover:bg-green-500/10 rounded-md"
                                >
                                  Resolve Job
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    useCommunityStore.setState(state => ({
                                      complaints: state.complaints.map(item => item.id === c.id ? { ...item, priority: "critical" as const } : item)
                                    }));
                                    alert("Escalated to critical priority!");
                                  }}
                                  className="h-7 text-[10px] text-red-500 hover:bg-red-500/5 rounded-md"
                                >
                                  Escalate SOS
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Security Oversight Logs */}
                  <div className="space-y-6">
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Security Gate Logs</CardTitle>
                        <CardDescription className="text-xs">Real-time gate vehicle entries, exits & incidents</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-border/50 text-xs max-h-[400px] overflow-y-auto">
                          {vehicleLogs.map((vl) => (
                            <div key={vl.id} className="p-3 hover:bg-secondary/15 flex justify-between items-center gap-3">
                              <div>
                                <span className="font-semibold">{vl.vehicleNumber} ({vl.ownerName})</span>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Unit: {vl.unit} | Entry: {new Date(vl.entryTime).toLocaleTimeString()}</p>
                              </div>
                              <Badge className={`text-[9px] py-0 border-0 ${
                                vl.status === "inside" ? "bg-amber-500/15 text-amber-500 animate-pulse" : "bg-muted text-muted-foreground"
                              }`}>
                                {vl.status.toUpperCase()}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Security Messages Coord */}
                    <Card className="border-border/50 shadow-sm bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-primary flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" /> Security Intercom
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-[11px] text-muted-foreground">Broadcast critical instructions directly to Gate 1 security guard post.</p>
                        <div className="relative">
                          <Input placeholder="Message to guard..." className="h-8 rounded-lg text-xs bg-background pr-10" />
                          <Button size="icon" className="w-7 h-7 rounded-md absolute right-1.5 top-1/2 -translate-y-1/2 gradient-primary border-0 text-white">
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Utility Monitoring */}
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Utility Monitoring</CardTitle>
                        <CardDescription className="text-xs">Building water & electricity levels</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1 text-amber-500"><Zap className="w-4 h-4" /> Common Electricity</span>
                            <span className="font-bold">4,890 kWh</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1.5">
                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "65%" }}></div>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Normal grid levels. Peak usage Wing A.</p>
                        </div>
                        <div className="space-y-2 text-xs border-t border-border/30 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1 text-sky-500"><Waves className="w-4 h-4" /> Tank Water Supply</span>
                            <span className="font-bold">12,500 KL</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1.5">
                            <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: "85%" }}></div>
                          </div>
                          <p className="text-[10px] text-muted-foreground text-green-500 font-semibold">85% full. Cleaning complete.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 5: GOVERNANCE & AI */}
              {adminSubTab === "governance" && (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left Column - Forms & Actions */}
                  <div className="space-y-6">
                    {/* Notice Board Publisher */}
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Notice Board Publisher</CardTitle>
                        <CardDescription className="text-xs">Broadcast announcements immediately to all residents</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handlePublishNotice} className="space-y-3.5 text-xs">
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Notice Title</label>
                            <Input placeholder="e.g. Lift Wing A Servicing" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} className="h-9 rounded-xl text-xs font-semibold" />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Content / Body</label>
                            <Input placeholder="Details here..." value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} className="h-9 rounded-xl text-xs" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Priority</label>
                              <select
                                value={noticePriority}
                                onChange={(e) => setNoticePriority(e.target.value as any)}
                                className="w-full h-9 px-2 rounded-xl border border-input bg-card text-xs"
                              >
                                <option value="normal">Normal</option>
                                <option value="important">Important</option>
                                <option value="urgent">Urgent / SOS</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Category Tag</label>
                              <select
                                value={noticeTag}
                                onChange={(e) => setNoticeTag(e.target.value)}
                                className="w-full h-9 px-2 rounded-xl border border-input bg-card text-xs"
                              >
                                <option value="General">General</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Water Supply">Water Supply</option>
                                <option value="Electricity">Electricity</option>
                              </select>
                            </div>
                          </div>
                          <Button type="submit" className="w-full h-9 rounded-xl text-xs gradient-primary mt-2 text-white border-0">
                            Broadcast Notice
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Schedule Event */}
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Schedule Community Event</CardTitle>
                        <CardDescription className="text-xs">Plan festivals, AGMs, or sports days</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Event Title</label>
                            <Input placeholder="e.g. Annual General Body Meeting" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="h-9 rounded-xl text-xs font-semibold" />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Description</label>
                            <Input placeholder="Short agenda details..." value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} className="h-9 rounded-xl text-xs" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Date</label>
                              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="h-9 rounded-xl text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Time</label>
                              <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="h-9 rounded-xl text-xs" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Location</label>
                              <Input placeholder="e.g. Club House" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className="h-9 rounded-xl text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-muted-foreground">Event Type</label>
                              <select
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value as any)}
                                className="w-full h-9 px-2 rounded-xl border border-input bg-card text-xs"
                              >
                                <option value="meeting">Meeting (AGM)</option>
                                <option value="festival">Festival Celebration</option>
                                <option value="workshop">Seminar / Workshop</option>
                                <option value="sports">Sports / Social</option>
                              </select>
                            </div>
                          </div>
                          <Button type="submit" className="w-full h-9 rounded-xl text-xs gradient-primary mt-2 text-white border-0">
                            Distribute Event Invites
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Middle Column - Marketplace & Directory Moderation */}
                  <div className="space-y-6">
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Marketplace Moderation</CardTitle>
                        <CardDescription className="text-xs">Moderate postings and advertisements</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                          {marketplaceItems.map((item) => (
                            <div key={item.id} className="p-3.5 flex justify-between items-start gap-4 hover:bg-secondary/20 text-xs">
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold truncate block">{item.title}</span>
                                <p className="text-muted-foreground text-[10px] line-clamp-1">{item.description}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Seller: {item.sellerName} | Price: <strong className="text-foreground">{item.price}</strong></p>
                              </div>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  deleteMarketplaceItem(item.id);
                                  alert(`Removed listing item: ${item.title}`);
                                }}
                                className="w-7 h-7 rounded-md border-red-500/30 text-red-500 hover:bg-red-500/5 shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - AI Insights & Forecasts */}
                  <div className="space-y-6">
                    <Card className="border-border/50 shadow-sm overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/15 relative">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                          <Bot className="w-4.5 h-4.5 text-primary animate-bounce" /> AI Society Insights
                        </CardTitle>
                        <CardDescription className="text-xs">Predictive intelligence and recommendations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3.5 text-xs">
                        <div className="p-3 bg-background/80 border border-border/50 rounded-xl space-y-1 hover:-translate-y-0.5 transition-transform duration-300">
                          <span className="font-semibold text-primary block flex items-center gap-1">💡 Plumbing Hot-spot Warnings</span>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Wing A accounts for 75% of complaints. Recommended checkup on common pipe valves.
                          </p>
                        </div>
                        <div className="p-3 bg-background/80 border border-border/50 rounded-xl space-y-1 hover:-translate-y-0.5 transition-transform duration-300">
                          <span className="font-semibold text-amber-500 block flex items-center gap-1">⚡ Common Area Savings</span>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Electricity usage has spiked 18% in the clubhouse corridor. Auto timer suggestion recommended.
                          </p>
                        </div>
                        <div className="p-3 bg-background/80 border border-border/50 rounded-xl space-y-1 hover:-translate-y-0.5 transition-transform duration-300">
                          <span className="font-semibold text-green-500 block flex items-center gap-1">📈 Collection Efficiency</span>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Current rate is 93%. Auto reminder rules could increase collections by 4% inside due-dates.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
