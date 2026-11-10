"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Clock, Download, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function PaymentHistoryPage() {
  const { user, initialize } = useAuth();
  const {
    payments,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      payments: state.payments || [],
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

  const paidTransactions = payments
    .filter(p => {
      if (p.status?.toLowerCase() !== "paid") return false;
      if (p.residentId === user?.id) return true;
      if (user?.unit) {
        const cleanUserUnit = user.unit.replace(/^[A-Za-z\s-]+/, '').trim();
        const cleanPUnit = (p.unit || '').replace(/^[A-Za-z\s-]+/, '').trim();
        if (cleanPUnit && cleanPUnit === cleanUserUnit) return true;
        if (p.unit === user.unit) return true;
      }
      return false;
    })
    .sort((a, b) => new Date(b.paidDate || 0).getTime() - new Date(a.paidDate || 0).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Payment History 🧾
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and audit past paid invoices, receipts, and society contributions
        </p>
      </div>

      {/* Paid Invoices List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-1.5">
            <Clock className="w-4.5 h-4.5 text-primary" /> Paid Invoices Archive
          </CardTitle>
          <CardDescription>Receipts and paid cycles log</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {paidTransactions.map((p) => (
              <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-secondary/10 transition-colors">
                <div className="flex items-start gap-3">
                  <Receipt className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <h4 className="font-bold text-foreground">
                      {p.paymentType === "Maintenance"
                        ? (p.description?.split("(")[0]?.trim() || "Monthly Maintenance Payment")
                        : p.paymentType}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Paid On: {p.paidDate || "Recent"} • Reference: {p.transactionId || p.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 self-stretch sm:self-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">₹{p.amount.toLocaleString()}</span>
                    <Badge className="bg-green-500/15 text-green-600 border border-green-500/20 text-[9px] font-bold">
                      Settled
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alert(`Downloading payment receipt for ${p.paymentType} (Reference: ${p.transactionId || p.id})...`)}
                    className="h-8 text-[10px] rounded-lg flex items-center justify-center gap-1 border-primary/20 text-primary hover:bg-primary/5"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Receipt
                  </Button>
                </div>
              </div>
            ))}
            {paidTransactions.length === 0 && (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No past payment records found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
