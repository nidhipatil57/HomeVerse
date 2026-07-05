"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  IndianRupee, CreditCard, Clock, CheckCircle2, AlertTriangle, Download, Receipt,
  Plus, Trash2, ArrowUpRight, BarChart3, Users, DollarSign, Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function MaintenancePage() {
  const { user, initialize } = useAuth();
  const {
    maintenanceBills,
    payMaintenanceBill,
    generateBulkMaintenanceBills,
    expenses,
    addExpense,
    users,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      maintenanceBills: state.maintenanceBills || [],
      payMaintenanceBill: state.payMaintenanceBill,
      generateBulkMaintenanceBills: state.generateBulkMaintenanceBills,
      expenses: state.expenses || [],
      addExpense: state.addExpense,
      users: state.users || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Form State for Secretary Billing
  const [billingMonth, setBillingMonth] = useState("July 2026");
  const [chargeMaintenance, setChargeMaintenance] = useState(3000);
  const [chargeWater, setChargeWater] = useState(500);
  const [chargeElectricity, setChargeElectricity] = useState(600);
  const [chargeParking, setChargeParking] = useState(400);
  const [chargeSinking, setChargeSinking] = useState(300);
  const [chargeRepair, setChargeRepair] = useState(200);

  // Form State for Secretary Expense Logger
  const [expCategory, setExpCategory] = useState("Security Salaries");
  const [expVendor, setExpVendor] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [expNotes, setExpNotes] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Compute Secretary stats
  const secretaryStats = useMemo(() => {
    const totalBillsCount = maintenanceBills.length;
    const paidBills = maintenanceBills.filter(b => b.status === "paid");
    const pendingBills = maintenanceBills.filter(b => b.status !== "paid");

    const totalCollected = paidBills.reduce((sum, b) => sum + b.amount, 0);
    const totalOutstanding = pendingBills.reduce((sum, b) => sum + b.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netSavings = totalCollected - totalExpenses;

    const collectionRate = totalBillsCount > 0 
      ? Math.round((paidBills.length / totalBillsCount) * 100) 
      : 100;

    return {
      totalCollected,
      totalOutstanding,
      totalExpenses,
      netSavings,
      collectionRate,
      pendingBillsCount: pendingBills.length,
      paidBillsCount: paidBills.length
    };
  }, [maintenanceBills, expenses]);

  if (!mounted) return null;

  const isSecretary = user?.role === "secretary";

  // --- ACTIONS FOR SECRETARY ---
  const handleGenerateBills = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = Number(chargeMaintenance) + Number(chargeWater) + Number(chargeElectricity) + 
                        Number(chargeParking) + Number(chargeSinking) + Number(chargeRepair);
    
    generateBulkMaintenanceBills({
      month: billingMonth,
      amount: totalAmount,
      breakdown: [
        { label: "Maintenance", amount: Number(chargeMaintenance) },
        { label: "Water", amount: Number(chargeWater) },
        { label: "Electricity Common Area", amount: Number(chargeElectricity) },
        { label: "Parking Space", amount: Number(chargeParking) },
        { label: "Sinking Fund Contribution", amount: Number(chargeSinking) },
        { label: "Repairs & Infrastructure", amount: Number(chargeRepair) }
      ]
    });
    alert(`Maintenance bills generated for all approved residents for ${billingMonth}!`);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expVendor || Number(expAmount) <= 0) return;
    addExpense({
      category: expCategory,
      vendor: expVendor,
      amount: Number(expAmount),
      date: expDate,
      notes: expNotes,
      invoiceUrl: "/invoices/stub.pdf"
    });
    setExpVendor("");
    setExpAmount("");
    setExpNotes("");
    alert("Expense recorded and logged successfully!");
  };

  // --- FOR RESIDENT VIEW ---
  const residentBills = maintenanceBills.filter(b => {
    return b.residentId === user?.id || b.unit === user?.unit;
  });

  const totalPaid = residentBills.filter(b => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);
  const totalPending = residentBills.filter(b => b.status !== "paid").reduce((sum, b) => sum + b.amount, 0);

  const breakdownMock = [
    { label: "Society Maintenance Charges", amount: 2500 },
    { label: "Sinking Fund Allocation", amount: 500 },
    { label: "Assigned Parking Slot (C-23)", amount: 800 },
    { label: "Water Tariff Charges", amount: 400 },
    { label: "Common Facility Electricity", amount: 300 },
  ];

  if (isSecretary) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Society Financial Console 💼</h1>
            <p className="text-muted-foreground mt-1">Generate maintenance cycles, track collection KPIs, and manage vendor expenses</p>
          </div>
          <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25 w-fit">
            <Download className="w-4 h-4 mr-2" /> Export Audit Sheet
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Collections (FY)", value: `₹${secretaryStats.totalCollected.toLocaleString()}`, color: "#22c55e", icon: DollarSign },
            { label: "Outstanding Dues", value: `₹${secretaryStats.totalOutstanding.toLocaleString()}`, color: "#ef4444", icon: AlertTriangle },
            { label: "Total Expenses logged", value: `₹${secretaryStats.totalExpenses.toLocaleString()}`, color: "#f59e0b", icon: ArrowUpRight },
            { label: "Net Reserves Balance", value: `₹${secretaryStats.netSavings.toLocaleString()}`, color: "#8b5cf6", icon: CheckCircle2 },
          ].map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-lg font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Panel */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Generate Bills & Log Expenses */}
          <div className="lg:col-span-5 space-y-6">
            {/* Generate Bills Form */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Generate New Billing Cycle</CardTitle>
                <CardDescription>Dispatch bulk maintenance bills to all approved residents</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateBills} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Billing Month</label>
                      <Input value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} className="h-9 rounded-lg text-xs" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Base Maintenance (₹)</label>
                      <Input type="number" value={chargeMaintenance} onChange={(e) => setChargeMaintenance(Number(e.target.value))} className="h-9 rounded-lg text-xs" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Water Tariff (₹)</label>
                      <Input type="number" value={chargeWater} onChange={(e) => setChargeWater(Number(e.target.value))} className="h-9 rounded-lg text-xs" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Common Electricity (₹)</label>
                      <Input type="number" value={chargeElectricity} onChange={(e) => setChargeElectricity(Number(e.target.value))} className="h-9 rounded-lg text-xs" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Parking Lot Slot (₹)</label>
                      <Input type="number" value={chargeParking} onChange={(e) => setChargeParking(Number(e.target.value))} className="h-9 rounded-lg text-xs" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Sinking Fund Allocation (₹)</label>
                      <Input type="number" value={chargeSinking} onChange={(e) => setChargeSinking(Number(e.target.value))} className="h-9 rounded-lg text-xs" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-2 rounded-xl gradient-primary text-white border-0 h-10 text-xs font-semibold">
                    <Receipt className="w-4 h-4 mr-2" /> Generate & Dispatch Invoices
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Log Society Expense */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Log Society Expense</CardTitle>
                <CardDescription>Record contractor fees, repairs, utility payments, or salaries</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddExpense} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Category</label>
                      <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="w-full h-9 px-2 text-xs rounded-lg border border-input bg-card">
                        <option>Security Salaries</option>
                        <option>Water Tanker Supply</option>
                        <option>Electrical Repairs</option>
                        <option>Lift Maintenance contract</option>
                        <option>Gardening & Landscaping</option>
                        <option>Housekeeping Staff</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Amount (₹)</label>
                      <Input type="number" placeholder="Amount in ₹" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="h-9 rounded-lg text-xs" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Vendor/Paid To</label>
                      <Input placeholder="e.g. Ramesh Plumbing" value={expVendor} onChange={(e) => setExpVendor(e.target.value)} className="h-9 rounded-lg text-xs" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Transaction Date</label>
                      <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="h-9 rounded-lg text-xs" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Notes / Description</label>
                    <Textarea placeholder="Details of expense..." value={expNotes} onChange={(e) => setExpNotes(e.target.value)} className="min-h-[60px] rounded-lg text-xs" />
                  </div>
                  <Button type="submit" className="w-full mt-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white border-0 h-10 text-xs font-semibold">
                    <Plus className="w-4 h-4 mr-2" /> Log Expense Record
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Track collections & Outstanding payments */}
          <div className="lg:col-span-7 space-y-6">
            {/* Collection Progress & Outstanding list */}
            <Card className="border-border/50">
              <CardHeader className="pb-3 border-b border-border/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Outstanding Collections</CardTitle>
                  <CardDescription>Pending dues and reminders panel</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                  Collection Rate: {secretaryStats.collectionRate}%
                </Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Collected: ₹{secretaryStats.totalCollected.toLocaleString()}</span>
                    <span>Remaining: ₹{secretaryStats.totalOutstanding.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${secretaryStats.collectionRate}%` }} />
                  </div>
                </div>

                <div className="space-y-2 mt-4 max-h-[360px] overflow-y-auto pr-1">
                  {maintenanceBills.filter(b => b.status !== "paid").map((bill) => (
                    <div key={bill.id} className="p-3.5 rounded-xl border border-border/50 hover:shadow-sm bg-secondary/10 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">Flat {bill.unit}</span>
                          <span className="text-[10px] text-muted-foreground">· ID: {bill.id}</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5">Billing Cycle: {bill.month} • Due: {bill.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-red-500 text-sm">₹{bill.amount.toLocaleString()}</span>
                        <Button
                          onClick={() => {
                            alert(`Reminder notification dispatched to resident in flat ${bill.unit} for outstanding amount of ₹${bill.amount}`);
                          }}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg shrink-0"
                          title="Send Notification Reminder"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {maintenanceBills.filter(b => b.status !== "paid").length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No outstanding dues registered! Great job.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Expenses Logged */}
            <Card className="border-border/50">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-base font-bold">Recent Expenses Ledger</CardTitle>
                <CardDescription>Verification registry for payouts</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {expenses.map((exp, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-border/50 bg-secondary/5 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] capitalize">{exp.category}</Badge>
                          <span className="font-semibold text-muted-foreground">Paid To: {exp.vendor}</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5">Date: {exp.date} {exp.notes && `• ${exp.notes}`}</p>
                      </div>
                      <span className="font-bold text-foreground">₹{exp.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">No expenses logged this month.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // --- RESIDENT VIEW ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Maintenance Billing</h1>
          <p className="text-muted-foreground mt-1">Review active invoices, check due dates, and settle utility bills securely</p>
        </div>
        <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25 w-fit">
          <Download className="w-4 h-4 mr-2" /> Download Statement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Settled (FY)", value: `₹${totalPaid.toLocaleString()}`, color: "#22c55e", icon: CheckCircle2 },
          { label: "Outstanding Dues", value: `₹${totalPending.toLocaleString()}`, color: "#ef4444", icon: AlertTriangle },
          { label: "Next Due Date", value: "Jul 10, 2026", color: "#f59e0b", icon: Clock },
          { label: "Payment Score Status", value: "98% (Excellent)", color: "#8b5cf6", icon: CreditCard },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        {residentBills.map((bill) => (
          <Card key={bill.id} className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)]">{bill.month}</h3>
                  <p className="text-xs text-muted-foreground">Due: {bill.dueDate} • Bill ID: {bill.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">₹{bill.amount.toLocaleString()}</p>
                  <Badge variant="outline" className={bill.status === "paid"
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                  }>
                    {bill.status === "paid" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                    {bill.status === "paid" ? `Paid on ${bill.paidOn}` : "Payment Pending"}
                  </Badge>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 border-t border-border/50 pt-3">
                {breakdownMock.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {bill.status !== "paid" && (
                <Button onClick={() => payMaintenanceBill(bill.id)} className="w-full mt-4 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25 h-11">
                  <CreditCard className="w-4 h-4 mr-2" /> Settle Bill Online
                </Button>
              )}
              {bill.status === "paid" && (
                <Button variant="outline" size="sm" className="mt-4 rounded-lg text-xs">
                  <Receipt className="w-3 h-3 mr-1" /> Download Receipt
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {residentBills.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm border rounded-2xl">No maintenance invoices registered for Flat {user?.unit}.</div>
        )}
      </div>
    </div>
  );
}
