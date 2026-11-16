"use client";

import { useState, useEffect } from "react";
import { DollarSign, Plus, ArrowUpRight, FileText, Download, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SecretaryExpensesPage() {
  const { user, initialize } = useAuth();
  const {
    expenses, maintenanceBills, payments, collections, addExpense, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      expenses: state.expenses || [],
      maintenanceBills: state.maintenanceBills || [],
      payments: state.payments || [],
      collections: state.collections || [],
      addExpense: state.addExpense,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Form State
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

  if (!mounted) return null;

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expVendor || Number(expAmount) <= 0) return;
    try {
      await addExpense({
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
    } catch (error: any) {
      alert(error?.message || "Could not save this expense.");
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const downloadCsv = (filename: string, headers: string[], rows: any[][]) => {
    const csvCell = (value: any) => {
      const text = String(value ?? "").replace(/\r?\n/g, " ");
      return `"${text.replace(/"/g, '""')}"`;
    };
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">Expenses Ledger</h1>
        <p className="text-muted-foreground mt-1">
          Record vendor invoice transactions, log operational payouts, and audit outgoing society expenses
        </p>
      </div>

      <Tabs defaultValue="ledger" className="space-y-5">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="ledger">Expense Ledger</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="space-y-5">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <Card className="lg:col-span-5 border-border/50 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5"><Plus className="w-4 h-4 text-primary" /> Log Society Outflow Expense</CardTitle>
            <CardDescription>Record Operational / Vendor Invoice payouts</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Expense Category</label>
                <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="w-full h-9 px-3 border rounded-lg text-xs bg-card">
                  <option>Security Salaries</option>
                  <option>Water Tankers Roster</option>
                  <option>Catering Operations</option>
                  <option>Gardening / Horticulture</option>
                  <option>Common Area Repairs</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Vendor/Agency Name</label>
                  <Input placeholder="e.g. Apex Security" value={expVendor} onChange={(e) => setExpVendor(e.target.value)} className="h-9 rounded-lg text-xs" required />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Payout Amount (₹)</label>
                  <Input type="number" placeholder="₹ Amount" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="h-9 rounded-lg text-xs" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Payment Date</label>
                <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Transaction Notes</label>
                <Input placeholder="Brief details about the payout..." value={expNotes} onChange={(e) => setExpNotes(e.target.value)} className="h-9 rounded-lg text-xs" />
              </div>
              <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 text-xs font-semibold shadow-sm">
                Log Expense & Debit Reserves
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: List */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/50 relative overflow-hidden bg-secondary/10">
            <CardContent className="p-4 flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] text-muted-foreground block font-bold uppercase">Total Debited Capital</span>
                <span className="text-xl font-bold text-foreground mt-0.5">₹{totalExpenses.toLocaleString()}</span>
              </div>
              <DollarSign className="w-8 h-8 text-primary/45" />
            </CardContent>
          </Card>

          <Card className="border-border/50 flex flex-col h-[400px] overflow-hidden">
            <CardHeader className="border-b border-border/20 pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-1.5"><ArrowUpRight className="w-4.5 h-4.5 text-rose-500" /> Outflow ledger logs ({expenses.length})</CardTitle>
              <CardDescription>Audited operational expense items</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {expenses.map((e) => (
                <div key={e.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/15 flex items-center justify-between text-xs hover:bg-secondary/25 transition-colors">
                  <div>
                    <h4 className="font-bold">{e.category}</h4>
                    <p className="text-[10px] text-muted-foreground">Paid to: {e.vendor} • Reference Ref-{e.id}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Notes: {e.notes || "None"}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-rose-500">-₹{e.amount}</span>
                    <Badge variant="outline" className="border-rose-500/20 text-rose-500 text-[8px]">
                      Debited
                    </Badge>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="text-center py-20 text-muted-foreground text-xs">
                  No outgoing expenses logged.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-5">
          <div>
            <h2 className="text-lg font-bold">Financial Reports</h2>
            <p className="text-sm text-muted-foreground mt-1">Export current society ledger data as CSV files.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-rose-500" /> Outgoing Expenses</CardTitle>
                <CardDescription>{expenses.length} expense records · ₹{totalExpenses.toLocaleString()} total</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => downloadCsv(
                  "society-expenses.csv",
                  ["Date", "Category", "Vendor", "Amount", "Notes"],
                  expenses.map((item) => [item.date, item.category, item.vendor, item.amount, item.notes])
                )}>
                  <Download className="w-4 h-4 mr-2" /> Download expense report
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Receipt className="w-4 h-4 text-primary" /> Maintenance Bills</CardTitle>
                <CardDescription>{maintenanceBills.length} billing records</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => downloadCsv(
                  "maintenance-bills.csv",
                  ["Flat", "Resident", "Month", "Amount", "Due Date", "Status"],
                  maintenanceBills.map((item: any) => [item.unit, item.residentName, item.month, item.amount, item.dueDate, item.status])
                )}>
                  <Download className="w-4 h-4 mr-2" /> Download billing report
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Receipt className="w-4 h-4 text-emerald-600" /> Payment Transactions</CardTitle>
                <CardDescription>{payments.length} payment records</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => downloadCsv(
                  "payment-transactions.csv",
                  ["Date", "Resident", "Flat", "Type", "Amount", "Status", "Method", "Reference"],
                  payments.map((item: any) => [item.paidDate || item.createdAt, item.residentName, item.unit, item.paymentType, item.amount, item.status, item.paymentMethod, item.referenceId])
                )}>
                  <Download className="w-4 h-4 mr-2" /> Download payments report
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /> Collections</CardTitle>
                <CardDescription>{collections.length} collection records</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => downloadCsv(
                  "society-collections.csv",
                  ["Title", "Description", "Amount", "Due Date", "Status"],
                  collections.map((item: any) => [item.title || item.name, item.description, item.amount, item.dueDate, item.status])
                )}>
                  <Download className="w-4 h-4 mr-2" /> Download collections report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
