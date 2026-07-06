"use client";

import { useState, useEffect } from "react";
import { IndianRupee, Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecretaryMaintenanceBillsMgmtPage() {
  const { user, initialize } = useAuth();
  const {
    generateBulkMaintenanceBills, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      generateBulkMaintenanceBills: state.generateBulkMaintenanceBills,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Form State
  const [billingMonth, setBillingMonth] = useState("July 2026");
  const [chargeMaintenance, setChargeMaintenance] = useState(3000);
  const [chargeWater, setChargeWater] = useState(500);
  const [chargeElectricity, setChargeElectricity] = useState(600);
  const [chargeParking, setChargeParking] = useState(400);
  const [chargeSinking, setChargeSinking] = useState(300);
  const [chargeRepair, setChargeRepair] = useState(200);
  const [chargePenalties, setChargePenalties] = useState(0);
  const [chargeOther, setChargeOther] = useState(0);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Maintenance Bills Management 💼
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate bulk society invoices and dispatch billing cycles to approved residents
        </p>
      </div>

      {/* Form */}
      <Card className="border-border/50 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-primary" /> Generate New Billing Cycle
          </CardTitle>
          <CardDescription>Dispatch bulk maintenance bills to all approved residents</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateBills} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Billing Month Cycle</label>
              <Input value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} className="h-10 rounded-xl text-xs" required />
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Society Maintenance (₹)</label>
                <Input type="number" value={chargeMaintenance} onChange={(e) => setChargeMaintenance(Number(e.target.value))} className="h-9 rounded-lg" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Water Tariff Charges (₹)</label>
                <Input type="number" value={chargeWater} onChange={(e) => setChargeWater(Number(e.target.value))} className="h-9 rounded-lg" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Common Area Electricity (₹)</label>
                <Input type="number" value={chargeElectricity} onChange={(e) => setChargeElectricity(Number(e.target.value))} className="h-9 rounded-lg" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Parking Slot Charges (₹)</label>
                <Input type="number" value={chargeParking} onChange={(e) => setChargeParking(Number(e.target.value))} className="h-9 rounded-lg" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Sinking Fund Allocation (₹)</label>
                <Input type="number" value={chargeSinking} onChange={(e) => setChargeSinking(Number(e.target.value))} className="h-9 rounded-lg" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Repairs & Infrastructure (₹)</label>
                <Input type="number" value={chargeRepair} onChange={(e) => setChargeRepair(Number(e.target.value))} className="h-9 rounded-lg" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Penalties / Late Fees (₹)</label>
                <Input type="number" value={chargePenalties} onChange={(e) => setChargePenalties(Number(e.target.value))} className="h-9 rounded-lg" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Other Levies (₹)</label>
                <Input type="number" value={chargeOther} onChange={(e) => setChargeOther(Number(e.target.value))} className="h-9 rounded-lg" required />
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20 text-[10px] flex items-center gap-1.5">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
              This will generate invoice records for all active residents and update outstanding dues.
            </div>

            <Button type="submit" className="w-full h-10 rounded-xl gradient-primary text-white border-0 font-semibold text-xs shadow-md">
              Generate & Dispatch Bills
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
