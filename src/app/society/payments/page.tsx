"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  CreditCard, Search, DollarSign, AlertTriangle, ArrowUpRight, CheckCircle2, 
  IndianRupee, Download, Receipt, Plus, Users, Calendar, Trash2, Edit2, 
  Send, BarChart3, TrendingUp, Info, HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  LineChart, Line, CartesianGrid, Cell, PieChart, Pie 
} from "recharts";

export default function PaymentsPage() {
  const { user, initialize } = useAuth();
  const {
    payments, collections, createCollection, editCollection, cancelCollection,
    payPayment, sendPaymentReminder, users, initializeDb, generateBulkMaintenanceBills
  } = useCommunityStore(
    useShallow((state) => ({
      payments: state.payments || [],
      collections: state.collections || [],
      createCollection: state.createCollection,
      editCollection: state.editCollection,
      cancelCollection: state.cancelCollection,
      payPayment: state.payPayment,
      sendPaymentReminder: state.sendPaymentReminder,
      users: state.users || [],
      initializeDb: state.initializeDb,
      generateBulkMaintenanceBills: state.generateBulkMaintenanceBills
    }))
  );

  const [mounted, setMounted] = useState(false);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<"ledger" | "collections" | "analytics">("ledger");

  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Custom date range for statement
  const [statementPeriod, setStatementPeriod] = useState("6months");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Payment Modal
  const [selectedPayRequest, setSelectedPayRequest] = useState<any>(null);
  const [paymentProvider, setPaymentProvider] = useState("UPI");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Secretary Form States
  const [collTitle, setCollTitle] = useState("");
  const [collDesc, setCollDesc] = useState("");
  const [collAmount, setCollAmount] = useState("");
  const [collType, setCollType] = useState("Mandatory");
  const [collDueDate, setCollDueDate] = useState("");
  const [collVisibility, setCollVisibility] = useState("Everyone");
  const [collBuildings, setCollBuildings] = useState<string[]>([]);
  const [collFlats, setCollFlats] = useState("");
  const [editingColl, setEditingColl] = useState<any>(null);

  // Bulk maintenance generator
  const [billingMonth, setBillingMonth] = useState("August 2026");
  const [chargeMaintenance, setChargeMaintenance] = useState(3000);
  const [chargeWater, setChargeWater] = useState(500);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Filters and computes
  const myPayments = useMemo(() => {
    if (!user) return [];
    if (user.role === "secretary") {
      return payments;
    }
    return payments.filter(p => p.residentId === user.id);
  }, [payments, user]);

  const activeCollections = useMemo(() => {
    return collections.filter(c => c.status === "active");
  }, [collections]);

  const pendingPaymentsCount = useMemo(() => {
    return myPayments.filter(p => p.status === "pending").length;
  }, [myPayments]);

  const totalOutstanding = useMemo(() => {
    return myPayments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [myPayments]);

  const totalPaidThisYear = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return myPayments
      .filter(p => p.status === "Paid" && p.paidDate && new Date(p.paidDate).getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.amount, 0);
  }, [myPayments]);

  const lastPayment = useMemo(() => {
    const paid = myPayments.filter(p => p.status === "Paid" && p.paidDate);
    if (paid.length === 0) return null;
    return paid.sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())[0];
  }, [myPayments]);

  // Section 1 - Maintenance
  const currentMaintenanceBill = useMemo(() => {
    return myPayments.find(p => p.paymentType === "Maintenance" && p.status === "pending");
  }, [myPayments]);

  // Section 2 - Special Contributions
  const specialContributions = useMemo(() => {
    return myPayments.filter(p => p.paymentType !== "Maintenance" && p.status === "pending");
  }, [myPayments]);

  // Payment History filtered list
  const paymentsHistory = useMemo(() => {
    return myPayments.filter(p => {
      const matchSearch = p.paymentType.toLowerCase().includes(search.toLowerCase()) || 
                          (p.id && p.id.toLowerCase().includes(search.toLowerCase())) ||
                          (p.transactionId && p.transactionId.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter.toLowerCase();
      const matchType = typeFilter === "all" || 
                        (typeFilter === "maintenance" && p.paymentType === "Maintenance") ||
                        (typeFilter === "special" && p.paymentType !== "Maintenance");
      return matchSearch && matchStatus && matchType;
    });
  }, [myPayments, search, statusFilter, typeFilter]);

  // Secretary Stats
  const secretaryStats = useMemo(() => {
    const totalBills = payments.length;
    const paid = payments.filter(p => p.status === "Paid");
    const pending = payments.filter(p => p.status !== "Paid");
    
    const collected = paid.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = pending.reduce((sum, p) => sum + p.amount, 0);
    const collectionRate = totalBills > 0 ? Math.round((paid.length / totalBills) * 100) : 100;

    return {
      collected,
      outstanding,
      collectionRate,
      paidCount: paid.length,
      pendingCount: pending.length
    };
  }, [payments]);

  // Receipt download
  const handleDownloadReceipt = (payment: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${payment.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .receipt-card { border: 1px solid #e2e8f0; padding: 40px; border-radius: 20px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            .society-header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 20px; }
            .society-name { font-size: 24px; font-weight: bold; color: #3b82f6; text-transform: uppercase; }
            .receipt-title { font-size: 16px; font-weight: 600; margin-top: 10px; color: #64748b; }
            .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 16px; margin: 30px 0; font-size: 14px; }
            .label { color: #64748b; font-weight: 500; }
            .value { font-weight: 700; color: #0f172a; text-align: right; }
            .amount-section { background: #f8fafc; padding: 20px; border-radius: 16px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0; }
            .amount-val { font-size: 28px; font-weight: 800; color: #10b981; }
            .seal-signature { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 25px; }
            .seal { width: 100px; height: 100px; border-radius: 50%; border: 3px double #ef4444; color: #ef4444; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 10px; transform: rotate(-15deg); text-transform: uppercase; text-align: center; line-height: 1.3; }
            .signature { text-align: center; font-size: 12px; color: #64748b; }
            .signature-line { width: 150px; border-bottom: 1px solid #94a3b8; margin-bottom: 8px; }
            .footer-note { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 30px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="receipt-card">
            <div class="society-header">
              <div class="society-name">Sunshine Complex Co-Op Society</div>
              <div class="receipt-title">PAYMENT ACKNOWLEDGEMENT & RECEIPT</div>
            </div>
            <div class="details-grid">
              <span class="label">Transaction ID:</span>
              <span class="value">${payment.transactionId || "N/A"}</span>
              <span class="label">Payment ID:</span>
              <span class="value">${payment.id}</span>
              <span class="label">Flat Number:</span>
              <span class="value">Flat ${payment.unit}</span>
              <span class="label">Resident Name:</span>
              <span class="value">${payment.residentName}</span>
              <span class="label">Payment Date:</span>
              <span class="value">${payment.paidDate || "N/A"}</span>
              <span class="label">Payment Type:</span>
              <span class="value">${payment.paymentType}</span>
              <span class="label">Payment Method:</span>
              <span class="value">${payment.paymentMethod || "Card"}</span>
              <span class="label">Status:</span>
              <span class="value" style="color: #10b981;">SUCCESSFUL / PAID</span>
            </div>
            <div class="amount-section">
              <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Amount Paid</div>
              <div class="amount-val">₹${payment.amount.toLocaleString()}</div>
            </div>
            <div class="seal-signature">
              <div class="seal">
                SOCIETY SEAL<br/>SUNSHINE
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                Secretary Authorized Signature
              </div>
            </div>
            <div class="footer-note">
              This is a digital certificate generated on behalf of HomeVerse and does not require physical signatures.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Statement download
  const handleDownloadStatement = () => {
    let filtered = [...payments].filter(p => p.status === "Paid");
    
    if (user?.role !== "secretary") {
      filtered = filtered.filter(p => p.residentId === user?.id);
    }

    const now = new Date();
    
    if (statementPeriod === "current") {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      filtered = filtered.filter(p => {
        if (!p.paidDate) return false;
        const d = new Date(p.paidDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    } else if (statementPeriod === "6months") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      filtered = filtered.filter(p => {
        if (!p.paidDate) return false;
        const d = new Date(p.paidDate);
        return d >= sixMonthsAgo;
      });
    } else if (statementPeriod === "year") {
      const currentYear = now.getFullYear();
      filtered = filtered.filter(p => {
        if (!p.paidDate) return false;
        const d = new Date(p.paidDate);
        return d.getFullYear() === currentYear;
      });
    } else if (statementPeriod === "custom" && customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      filtered = filtered.filter(p => {
        if (!p.paidDate) return false;
        const d = new Date(p.paidDate);
        return d >= start && d <= end;
      });
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = filtered.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.paymentType}</td>
        <td>₹${p.amount.toLocaleString()}</td>
        <td>${p.paidDate || "N/A"}</td>
        <td>${p.paymentMethod || "Card"}</td>
        <td>${p.transactionId || "N/A"}</td>
      </tr>
    `).join("");

    const totalCollected = filtered.reduce((sum, p) => sum + p.amount, 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Statement - ${statementPeriod}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: bold; color: #0f172a; }
            .meta { font-size: 12px; color: #64748b; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { background: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-weight: 700; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .summary { margin-top: 30px; text-align: right; font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <div class="title">ACCOUNT STATEMENT - PAYMENTS HISTORY</div>
            <div class="meta">Flat ${user?.unit || "A-301"} | Resident: ${user?.name || "Resident"}</div>
            <div class="meta">Statement Period: ${statementPeriod.toUpperCase()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Payment Type</th>
                <th>Amount</th>
                <th>Date Paid</th>
                <th>Method</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="6" style="text-align: center;">No transactions found.</td></tr>'}
            </tbody>
          </table>
          <div class="summary">
            Total Payments Made: ₹${totalCollected.toLocaleString()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePayNow = async () => {
    if (!selectedPayRequest) return;
    setIsProcessingPayment(true);
    try {
      await payPayment(selectedPayRequest.id, paymentProvider);
      setIsProcessingPayment(false);
      setSelectedPayRequest(null);
      alert("Payment processed successfully!");
    } catch (e) {
      setIsProcessingPayment(false);
      alert("Payment failed. Please try again.");
    }
  };

  const handlePublishCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const flatsArray = collFlats.split(",").map(f => f.trim()).filter(Boolean);
    const details = {
      title: collTitle,
      description: collDesc,
      amount: parseFloat(collAmount),
      type: collType,
      dueDate: collDueDate,
      applicableBuildings: collBuildings,
      applicableFlats: flatsArray,
      visibility: collVisibility
    };

    if (editingColl) {
      await editCollection(editingColl.id, details);
      alert("Collection request edited successfully!");
      setEditingColl(null);
    } else {
      await createCollection(details);
      alert("New society collection published!");
    }

    setCollTitle("");
    setCollDesc("");
    setCollAmount("");
    setCollDueDate("");
    setCollVisibility("Everyone");
    setCollBuildings([]);
    setCollFlats("");
  };

  const handleGenerateBulkBills = (e: React.FormEvent) => {
    e.preventDefault();
    generateBulkMaintenanceBills({
      month: billingMonth,
      amount: Number(chargeMaintenance) + Number(chargeWater),
      breakdown: [
        { label: "Maintenance", amount: Number(chargeMaintenance) },
        { label: "Water Charges", amount: Number(chargeWater) }
      ]
    });
    alert(`Bulk maintenance bills generated for approved residents for ${billingMonth}!`);
  };

  if (!mounted || !user) return null;

  // Render Secretary Portal View
  if (user.role === "secretary") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Payments & Collections Tracker 💰
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Monitor complex outstanding maintenance logs, create special collection programs, and run bulk invoice dispatching.
          </p>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Collected This Fiscal Year", value: `₹${secretaryStats.collected.toLocaleString()}`, color: "text-emerald-500 bg-emerald-500/10", icon: CheckCircle2 },
            { label: "Outstanding Dues Balance", value: `₹${secretaryStats.outstanding.toLocaleString()}`, color: "text-rose-500 bg-rose-500/10", icon: AlertTriangle },
            { label: "Payment Completion Success", value: `${secretaryStats.collectionRate}%`, color: "text-blue-500 bg-blue-500/10", icon: CreditCard }
          ].map((s, idx) => (
            <Card key={idx} className="border-border/50 bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border/40 gap-4 text-xs font-semibold">
          {[
            { id: "ledger", label: "Maintenance Ledger" },
            { id: "collections", label: "Special Collections" },
            { id: "analytics", label: "Analytics & Trends" }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-2.5 px-1 border-b-2 transition-all ${
                activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Maintenance Ledger */}
        {activeTab === "ledger" && (
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              {/* Invoices List */}
              <Card className="border-border/50">
                <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">Ledger Invoice Records</CardTitle>
                    <CardDescription>Roster of all maintenance bill states</CardDescription>
                  </div>
                  <div className="relative w-48">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search flat..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="h-8 pl-7 text-[10px] rounded-lg"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/30 max-h-[480px] overflow-y-auto">
                    {paymentsHistory
                      .filter(p => p.paymentType === "Maintenance")
                      .map((p) => (
                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-secondary/15 transition-colors text-xs">
                          <div>
                            <h4 className="font-bold">Flat {p.unit} ({p.residentName})</h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Due date: {p.dueDate}</p>
                            {p.status === "Paid" && p.paidDate && (
                              <p className="text-[9px] text-green-500 mt-0.5">Paid On: {p.paidDate} ({p.paymentMethod || "Card"})</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">₹{p.amount}</span>
                            <Badge variant={p.status === "Paid" ? "default" : "destructive"} className="text-[9px] font-bold">
                              {p.status}
                            </Badge>
                            {p.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  sendPaymentReminder(p.id);
                                  alert("Reminder notification dispatched to resident.");
                                }}
                                className="h-7 text-[9px] px-2 rounded-lg"
                              >
                                <Send className="w-3 h-3 mr-1" /> Remind
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    {paymentsHistory.filter(p => p.paymentType === "Maintenance").length === 0 && (
                      <div className="text-center py-20 text-muted-foreground text-xs">
                        No maintenance ledgers found.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-4">
              {/* Bulk generator */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Bulk Invoicing Generator</CardTitle>
                  <CardDescription>Dispatch billing cycles to all approved flats</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerateBulkBills} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Billing Month Cycle</label>
                      <Input value={billingMonth} onChange={e => setBillingMonth(e.target.value)} className="h-9 rounded-lg" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Maintenance Charge (₹)</label>
                        <Input type="number" value={chargeMaintenance} onChange={e => setChargeMaintenance(Number(e.target.value))} className="h-9 rounded-lg" required />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Water Tariff Charge (₹)</label>
                        <Input type="number" value={chargeWater} onChange={e => setChargeWater(Number(e.target.value))} className="h-9 rounded-lg" required />
                      </div>
                    </div>
                    <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20 text-[10px] flex items-center gap-1.5">
                      <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                      This triggers bill generation for all active complex flats.
                    </div>
                    <Button type="submit" className="w-full h-9 rounded-xl gradient-primary text-white border-0 font-semibold shadow-md">
                      Dispatch Bulk Invoices
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Statement period */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Export Ledger Reports</CardTitle>
                  <CardDescription>Download consolidated financial logs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Report Period</label>
                    <select
                      value={statementPeriod}
                      onChange={e => setStatementPeriod(e.target.value)}
                      className="w-full h-9 rounded-lg border border-border bg-card px-2 text-xs"
                    >
                      <option value="current">Current Month</option>
                      <option value="6months">Last 6 Months</option>
                      <option value="year">This Year</option>
                      <option value="custom">Custom Date Range</option>
                    </select>
                  </div>

                  {statementPeriod === "custom" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] block mb-1 text-muted-foreground font-semibold">Start Date</label>
                        <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="h-9" />
                      </div>
                      <div>
                        <label className="text-[10px] block mb-1 text-muted-foreground font-semibold">End Date</label>
                        <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="h-9" />
                      </div>
                    </div>
                  )}

                  <Button onClick={handleDownloadStatement} className="w-full h-9 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold">
                    <Download className="w-3.5 h-3.5 mr-1" /> Export Statement
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Special Collections */}
        {activeTab === "collections" && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Column: Create Special Collection */}
            <div className="lg:col-span-5">
              <Card className="border-border/50 h-fit">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-primary" /> 
                    {editingColl ? "Edit Special Collection" : "Publish Special Collection"}
                  </CardTitle>
                  <CardDescription>Setup fund collection for festivals or building repairs</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePublishCollection} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[10px] font-semibold block mb-1 text-muted-foreground">Collection Program Title</label>
                      <Input
                        placeholder="e.g. Ganesh Festival Contribution"
                        value={collTitle}
                        onChange={e => setCollTitle(e.target.value)}
                        className="h-9"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold block mb-1 text-muted-foreground">Short Description</label>
                      <Textarea
                        placeholder="Purpose and fund utilization details..."
                        value={collDesc}
                        onChange={e => setCollDesc(e.target.value)}
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold block mb-1 text-muted-foreground">Amount (₹)</label>
                        <Input
                          type="number"
                          value={collAmount}
                          onChange={e => setCollAmount(e.target.value)}
                          className="h-9"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold block mb-1 text-muted-foreground">Due Date</label>
                        <Input
                          placeholder="e.g. 25 August"
                          value={collDueDate}
                          onChange={e => setCollDueDate(e.target.value)}
                          className="h-9"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold block mb-1 text-muted-foreground">Contribution Type</label>
                        <select
                          value={collType}
                          onChange={e => setCollType(e.target.value)}
                          className="w-full h-9 rounded-lg border border-border bg-card px-2"
                        >
                          <option value="Mandatory">Mandatory</option>
                          <option value="Voluntary">Voluntary</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold block mb-1 text-muted-foreground">Target Visibility</label>
                        <select
                          value={collVisibility}
                          onChange={e => setCollVisibility(e.target.value)}
                          className="w-full h-9 rounded-lg border border-border bg-card px-2"
                        >
                          <option value="Everyone">Everyone</option>
                          <option value="Specific Buildings">Specific Buildings</option>
                        </select>
                      </div>
                    </div>

                    {collVisibility === "Specific Buildings" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold block text-muted-foreground">Target Buildings</label>
                        <div className="flex gap-4">
                          {["Wing A", "Wing B", "Wing C"].map(b => (
                            <label key={b} className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={collBuildings.includes(b)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setCollBuildings([...collBuildings, b]);
                                  } else {
                                    setCollBuildings(collBuildings.filter(x => x !== b));
                                  }
                                }}
                              />
                              {b}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-[10px] text-muted-foreground flex gap-1.5">
                      <Info className="w-4 h-4 shrink-0 text-primary" />
                      Publishing generates payment requests on resident portals instantly.
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 h-9 rounded-xl gradient-primary text-white border-0 font-semibold shadow-md">
                        {editingColl ? "Save Changes" : "Publish Program"}
                      </Button>
                      {editingColl && (
                        <Button variant="outline" onClick={() => setEditingColl(null)} className="h-9 rounded-xl">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Active Collections Progress */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Active Programs & Progress</CardTitle>
                  <CardDescription>Track special fund metrics and participant response</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/30">
                    {activeCollections.map((c) => {
                      const collPayments = payments.filter(p => p.referenceId === c.id);
                      const paid = collPayments.filter(p => p.status === "Paid");
                      const pending = collPayments.filter(p => p.status === "pending");

                      const collectedAmount = paid.reduce((sum, p) => sum + p.amount, 0);
                      const expectedAmount = c.amount * collPayments.length;
                      const progressPct = expectedAmount > 0 ? Math.round((collectedAmount / expectedAmount) * 100) : 0;

                      return (
                        <div key={c.id} className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-foreground">{c.title}</h4>
                                <Badge variant={c.type === "Mandatory" ? "destructive" : "secondary"} className="text-[9px] py-0.5">
                                  {c.type}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{c.description || "No description provided."}</p>
                              <p className="text-[9px] text-muted-foreground mt-1">Due: {c.dueDate}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingColl(c);
                                  setCollTitle(c.title);
                                  setCollDesc(c.description);
                                  setCollAmount(c.amount.toString());
                                  setCollDueDate(c.dueDate);
                                  setCollType(c.type);
                                  setCollVisibility(c.visibility);
                                  setCollBuildings(c.applicableBuildings);
                                }}
                                className="h-7 w-7 p-0 rounded-lg"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async () => {
                                  if (confirm("Are you sure you want to cancel this collection? This cancels all pending requests.")) {
                                    await cancelCollection(c.id);
                                    alert("Collection program cancelled.");
                                  }
                                }}
                                className="h-7 w-7 p-0 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </Button>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-4 gap-2 bg-secondary/10 p-2.5 rounded-xl text-center text-[10px]">
                            <div>
                              <span className="text-muted-foreground block text-[9px]">Expected</span>
                              <span className="font-bold text-foreground">₹{expectedAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[9px]">Collected</span>
                              <span className="font-bold text-green-500">₹{collectedAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[9px]">Pending</span>
                              <span className="font-bold text-rose-500">₹{(expectedAmount - collectedAmount).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[9px]">Participants</span>
                              <span className="font-bold text-foreground">{paid.length} Paid / {pending.length} Pend</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
                              <span>Collection Target Progress</span>
                              <span>{progressPct}% Completed</span>
                            </div>
                            <div className="w-full h-1.5 bg-border/40 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {activeCollections.length === 0 && (
                      <div className="text-center py-20 text-muted-foreground text-xs">
                        No active society collection programs.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Analytics */}
        {activeTab === "analytics" && (
          <div className="grid lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-primary" /> Monthly Maintenance Collection Trend
                </CardTitle>
                <CardDescription>Consolidated collections status track</CardDescription>
              </CardHeader>
              <CardContent className="h-80 pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "April", Collected: 140000, Pending: 10000 },
                    { name: "May", Collected: 148000, Pending: 5000 },
                    { name: "June", Collected: 152000, Pending: 2000 },
                    { name: "July", Collected: 135000, Pending: 25000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: 8, color: "#fff" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Collected" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pending" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold">Ledger Dues Division</CardTitle>
                <CardDescription>Ratio of outstanding dues vs cleared</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex flex-col justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Paid", value: secretaryStats.paidCount, color: "#22c55e" },
                        { name: "Pending Dues", value: secretaryStats.pendingCount, color: "#ef4444" }
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 text-[10px] font-semibold mt-2">
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-emerald-500"></div>Paid Invoices ({secretaryStats.paidCount})</div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-rose-500"></div>Unpaid Dues ({secretaryStats.pendingCount})</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Render Resident Portal View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Payments & Dues 💳
        </h1>
        <p className="text-muted-foreground mt-1 text-xs">
          View outstanding balance maintenance cycles, track festival collections, and download PDF receipts.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Outstanding", value: `₹${totalOutstanding.toLocaleString()}`, desc: `${pendingPaymentsCount} Pending`, color: "text-rose-500 bg-rose-500/10", icon: AlertTriangle },
          { label: "Total Paid (CY)", value: `₹${totalPaidThisYear.toLocaleString()}`, desc: "This Year", color: "text-emerald-500 bg-emerald-500/10", icon: CheckCircle2 },
          { label: "Last Payment Date", value: lastPayment ? lastPayment.paidDate || "N/A" : "N/A", desc: lastPayment ? `₹${lastPayment.amount.toLocaleString()}` : "No payments", color: "text-blue-500 bg-blue-500/10", icon: Calendar },
          { label: "Pending Requests", value: specialContributions.length, desc: "Special Collections", color: "text-amber-500 bg-amber-500/10", icon: Info }
        ].map((c, idx) => (
          <Card key={idx} className="border-border/50 bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}>
                <c.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold font-[family-name:var(--font-heading)]">{c.value}</p>
                <p className="text-[9px] text-muted-foreground">{c.label} • <strong className="text-foreground">{c.desc}</strong></p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Maintenance & Society Contributions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Maintenance Invoices */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Monthly Maintenance Charges</CardTitle>
              <CardDescription>Current flat maintenance billing period</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {currentMaintenanceBill ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Monthly Maintenance Bill</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Due date: {currentMaintenanceBill.dueDate}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-[9px] border-amber-500/20 text-amber-500 bg-amber-500/5 font-bold uppercase">
                        Pending payment
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-lg font-bold text-foreground">₹{currentMaintenanceBill.amount.toLocaleString()}</span>
                    <Button 
                      onClick={() => setSelectedPayRequest(currentMaintenanceBill)}
                      className="rounded-xl h-8 text-[10px] font-semibold gradient-primary text-white border-0"
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay Now
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-xs flex flex-col items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-8 h-8 text-green-500 bg-green-500/10 rounded-full p-1.5" />
                  All paid! No pending monthly maintenance bills.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Special Collections & Contributions */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Society Special Collections & Contributions</CardTitle>
              <CardDescription>Festival allocations and development collections published by committee</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {specialContributions.map((sc) => {
                  const collectionObj = collections.find(c => c.id === sc.referenceId);
                  const isMandatory = collectionObj?.type === "Mandatory";

                  return (
                    <div key={sc.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">{sc.paymentType}</h4>
                          <Badge variant={isMandatory ? "destructive" : "secondary"} className="text-[9px] py-0.5">
                            {isMandatory ? "Mandatory Contribution" : "Suggested Contribution"}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Due: {sc.dueDate}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-sm font-bold text-foreground">₹{sc.amount.toLocaleString()}</span>
                        <Button 
                          onClick={() => setSelectedPayRequest(sc)}
                          className="rounded-xl h-8 text-[10px] font-semibold gradient-primary text-white border-0"
                        >
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {specialContributions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-xs flex flex-col items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-8 h-8 text-green-500 bg-green-500/10 rounded-full p-1.5" />
                    No active special society collections pending.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dynamic Breakdown / Statements download */}
        <div className="lg:col-span-5 space-y-6">
          {/* Maintenance breakdown */}
          {currentMaintenanceBill && (
            <Card className="border-border/50 bg-card h-fit">
              <CardHeader>
                <CardTitle className="text-base font-bold">Billing Cycle Breakdown</CardTitle>
                <CardDescription>Detailed division of society tariffs</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30 text-xs">
                  {[
                    { label: "Society Maintenance Charges", amount: 2500 },
                    { label: "Sinking Fund Allocation", amount: 500 },
                    { label: "Assigned Parking Slot", amount: 400 },
                    { label: "Water Tariff Charges", amount: 100 }
                  ].map((b, i) => (
                    <div key={i} className="p-3.5 flex items-center justify-between text-muted-foreground">
                      <span>{b.label}</span>
                      <span className="font-semibold text-foreground">₹{b.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="p-4 flex items-center justify-between font-bold bg-secondary/15 border-t">
                    <span>Total Calculated Dues</span>
                    <span className="text-primary text-sm">₹{currentMaintenanceBill.amount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statement Export */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold">Download Account Statement</CardTitle>
              <CardDescription>Generate a PDF payment statement for archives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Select Period Range</label>
                <select
                  value={statementPeriod}
                  onChange={e => setStatementPeriod(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-card px-2 text-xs"
                >
                  <option value="current">Current Month</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              {statementPeriod === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] block mb-1 text-muted-foreground font-semibold">Start Date</label>
                    <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="h-9" />
                  </div>
                  <div>
                    <label className="text-[10px] block mb-1 text-muted-foreground font-semibold">End Date</label>
                    <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="h-9" />
                  </div>
                </div>
              )}

              <Button onClick={handleDownloadStatement} className="w-full h-9 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold">
                <Download className="w-3.5 h-3.5 mr-1" /> Export Payments PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment History */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold">Ledger Transactions History</CardTitle>
            <CardDescription>Verify references and download receipts for prior payments</CardDescription>
          </div>
          
          <div className="flex gap-2 flex-wrap text-xs">
            <div className="relative w-44">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 pl-8 text-[10px] rounded-lg"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-border bg-card px-2 text-[10px]"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Only</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="h-8 rounded-lg border border-border bg-card px-2 text-[10px]"
            >
              <option value="all">All Types</option>
              <option value="maintenance">Maintenance</option>
              <option value="special">Special Collections</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30 max-h-[400px] overflow-y-auto">
            {paymentsHistory.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-secondary/10 transition-colors text-xs">
                <div>
                  <h4 className="font-bold">{p.paymentType}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    ID: {p.id} • Due: {p.dueDate}
                  </p>
                  {p.status === "Paid" && p.paidDate && (
                    <p className="text-[9px] text-emerald-500 mt-0.5">
                      Paid on: {p.paidDate} (${p.paymentMethod || "Card"}) • Txn ID: {p.transactionId}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground">₹{p.amount.toLocaleString()}</span>
                  <Badge variant={p.status === "Paid" ? "default" : "destructive"} className="text-[9px] font-bold">
                    {p.status}
                  </Badge>
                  {p.status === "Paid" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReceipt(p)}
                      className="h-7 text-[9px] px-2 rounded-lg"
                    >
                      <Receipt className="w-3 h-3 mr-1" /> Receipt
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {paymentsHistory.length === 0 && (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No ledger transactions matching filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Simulated Payment Gateway Dialog */}
      <Dialog open={selectedPayRequest !== null} onOpenChange={(open) => !open && setSelectedPayRequest(null)}>
        <DialogContent className="max-w-md bg-card border-border/50 text-xs">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" /> Security Payment Gateway
            </DialogTitle>
          </DialogHeader>

          {selectedPayRequest && (
            <div className="space-y-4 mt-2">
              <div className="p-3 bg-secondary/15 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paying For:</span>
                  <span className="font-bold">{selectedPayRequest.paymentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flat Reference:</span>
                  <span className="font-bold">Flat ${selectedPayRequest.unit}</span>
                </div>
                <div className="flex justify-between border-t border-border/30 pt-1.5 font-bold">
                  <span>Grand Total Dues:</span>
                  <span className="text-primary">₹{selectedPayRequest.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-muted-foreground block">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {["UPI (GPay / PhonePe)", "Stripe Payments", "Credit/Debit Card", "NetBanking"].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentProvider(method)}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                        paymentProvider === method 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-border hover:bg-secondary/10"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                disabled={isProcessingPayment}
                onClick={handlePayNow}
                className="w-full h-10 rounded-xl gradient-primary text-white border-0 font-semibold text-xs shadow-md mt-2"
              >
                {isProcessingPayment ? "Securing Tunnel..." : `Confirm Payment (₹${selectedPayRequest.amount.toLocaleString()})`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
