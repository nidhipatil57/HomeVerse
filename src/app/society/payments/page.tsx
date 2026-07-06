"use client";

import { useState, useEffect, useMemo } from "react";
import { CreditCard, Search, DollarSign, AlertTriangle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecretaryPaymentsPage() {
  const { user, initialize } = useAuth();
  const {
    maintenanceBills, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      maintenanceBills: state.maintenanceBills || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Compute stats
  const secretaryStats = useMemo(() => {
    const totalBillsCount = maintenanceBills.length;
    const paidBills = maintenanceBills.filter(b => b.status === "paid");
    const pendingBills = maintenanceBills.filter(b => b.status !== "paid");

    const totalCollected = paidBills.reduce((sum, b) => sum + b.amount, 0);
    const totalOutstanding = pendingBills.reduce((sum, b) => sum + b.amount, 0);

    const collectionRate = totalBillsCount > 0 
      ? Math.round((paidBills.length / totalBillsCount) * 100) 
      : 100;

    return {
      totalCollected,
      totalOutstanding,
      collectionRate,
    };
  }, [maintenanceBills]);

  if (!mounted) return null;

  const filteredBills = maintenanceBills.filter(b => 
    b.residentName.toLowerCase().includes(search.toLowerCase()) || 
    b.unit.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Payments Tracker 💰
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor society dues collections, view resident payment references, and audit outstanding dues
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Collections (FY)", value: `₹${secretaryStats.totalCollected.toLocaleString()}`, color: "#22c55e", icon: DollarSign },
          { label: "Outstanding Balance Dues", value: `₹${secretaryStats.totalOutstanding.toLocaleString()}`, color: "#ef4444", icon: AlertTriangle },
          { label: "Collection Success Rate", value: `${secretaryStats.collectionRate}%`, color: "#3b82f6", icon: CheckCircle2 },
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by resident name or flat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-8 text-xs rounded-xl"
        />
      </div>

      {/* List */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-semibold">Ledger Invoices Roster</CardTitle>
          <CardDescription>Consolidated logs of all billing items</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
            {filteredBills.map((b) => (
              <div key={b.id} className="p-4 flex items-center justify-between hover:bg-secondary/15 transition-colors text-xs">
                <div>
                  <h4 className="font-bold">Flat {b.unit} ({b.residentName})</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Cycle: {b.month} • Invoice ID: Inv-{b.id}
                  </p>
                  {b.paidOn && <p className="text-[9px] text-green-500 mt-0.5">Paid On: {b.paidOn}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground">₹{b.amount}</span>
                  <Badge variant={b.status === "paid" ? "default" : "destructive"} className="text-[9px] font-bold capitalize shrink-0">
                    {b.status}
                  </Badge>
                </div>
              </div>
            ))}
            {filteredBills.length === 0 && (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No invoices found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
