"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { IndianRupee, CreditCard, AlertTriangle, CheckCircle2, Download, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function MaintenanceBillsPage() {
  const { user, initialize } = useAuth();
  const {
    maintenanceBills,
    payMaintenanceBill,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      maintenanceBills: state.maintenanceBills || [],
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

  const residentBills = maintenanceBills.filter(b => {
    return b.residentId === user?.id || b.unit === user?.unit;
  });

  const pendingBills = residentBills.filter(b => b.status !== "paid");
  const totalPending = pendingBills.reduce((sum, b) => sum + b.amount, 0);

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
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Maintenance Bills 💳
        </h1>
        <p className="text-muted-foreground mt-1">
          View and pay your pending society maintenance invoices and breakdown charges
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Dues Card & Payment list */}
        <div className="lg:col-span-7 space-y-6">
          {/* Total dues */}
          <Card className="border-border/50 relative overflow-hidden bg-secondary/15">
            <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest block">Outstanding Balance</span>
                <h2 className="text-3xl font-bold text-foreground mt-1">₹{totalPending.toLocaleString()}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Due by 10th of every month. Pay before deadline to avoid late fees penalty.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <IndianRupee className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Pending Bills Queue */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-bold">Unpaid Dues</CardTitle>
              <CardDescription>Maintenance bill cycles generated for Flat {user?.unit || "A-301"}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {pendingBills.map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold">{b.month} Bill Cycle</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Due date: {b.dueDate || "July 10, 2026"}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-foreground">₹{b.amount}</span>
                      <Button
                        size="sm"
                        onClick={() => {
                          payMaintenanceBill(b.id);
                          alert(`Payment of ₹${b.amount} received successfully for ${b.month}! Receipt generated.`);
                        }}
                        className="rounded-xl h-8 text-[10px] font-semibold gradient-primary text-white border-0"
                      >
                        <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay Now
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingBills.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-green-500 bg-green-500/10 rounded-full p-1.5" />
                    All paid! No pending maintenance bills.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Breakdown of Current Cycle */}
        <Card className="lg:col-span-5 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold">Current Cycle Breakdown</CardTitle>
            <CardDescription>Detailed division of society tariffs</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {breakdownMock.map((b, i) => (
                <div key={i} className="p-4 flex items-center justify-between text-xs hover:bg-secondary/10 transition-colors">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="font-bold text-foreground">₹{b.amount}</span>
                </div>
              ))}
              <div className="p-4 flex items-center justify-between text-xs font-bold bg-secondary/10 border-t">
                <span>Total Calculated Charges</span>
                <span className="text-primary text-sm">₹{breakdownMock.reduce((sum, b) => sum + b.amount, 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
