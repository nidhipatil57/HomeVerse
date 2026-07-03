"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { IndianRupee, CreditCard, Clock, CheckCircle2, AlertTriangle, Download, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function MaintenancePage() {
  const { user, initialize } = useAuth();
  const { maintenanceBills, payMaintenanceBill, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      maintenanceBills: state.maintenanceBills,
      payMaintenanceBill: state.payMaintenanceBill,
      initializeDb: state.initializeDb,
    }))
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWorker = user?.role === "worker";

  // Filter bills for the resident
  const filteredBills = maintenanceBills.filter(b => {
    if (isWorker) return false;
    return b.residentId === user?.id || b.unit === user?.unit;
  });

  const totalPaid = filteredBills.filter(b => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);
  const totalPending = filteredBills.filter(b => b.status !== "paid").reduce((sum, b) => sum + b.amount, 0);

  const breakdownMock = [
    { label: "Society Maintenance Charges", amount: 2500 },
    { label: "Sinking Fund Allocation", amount: 500 },
    { label: "Assigned Parking Slot (C-23)", amount: 800 },
    { label: "Water Tariff Charges", amount: 400 },
    { label: "Common Facility Electricity", amount: 300 },
  ];

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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
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
        {filteredBills.map((bill) => (
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
        {filteredBills.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm border rounded-2xl">No maintenance invoices registered for Flat {user?.unit}.</div>
        )}
      </div>
    </div>
  );
}
