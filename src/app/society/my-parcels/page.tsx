"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Package, Clock, Check, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function MyParcelsPage() {
  const { user, initialize } = useAuth();
  const { parcels, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      parcels: state.parcels || [],
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

  const myParcels = parcels.filter(
    (p) => p.portal === "society" && (p.recipientId === user?.id || p.unit === user?.unit)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          My Parcels 📦
        </h1>
        <p className="text-muted-foreground mt-1">
          Track packages and courier deliveries received at the gatekeeper post and view release OTPs
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Active / Pending Pickup */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-bold text-sm text-foreground">Gated Parcels Waiting for Pickup</h3>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 gap-4">
            {myParcels.filter(p => p.status === "received").map((p) => (
              <motion.div key={p.id} variants={fadeInUp}>
                <Card className="border-amber-500/20 bg-amber-500/5 relative overflow-hidden flex flex-col h-full justify-between">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-600">
                        <Package className="w-5.5 h-5.5 animate-bounce" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Inbound Parcel Received</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{p.courier} • Location: {p.location}</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-card border rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] text-muted-foreground block uppercase font-semibold">Delivery Gate OTP</span>
                        <span className="text-sm font-bold text-amber-600 font-mono tracking-wider">{p.otp}</span>
                      </div>
                      <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/20 text-[9px] font-bold">
                        Awaiting Pickup
                      </Badge>
                    </div>

                    <div className="text-[10px] text-muted-foreground pt-1.5 flex justify-between items-center">
                      <span>Received: {new Date(p.receivedAt).toLocaleString()}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => alert(`Show OTP ${p.otp} to security guards at Gate 1 to release parcel.`)}
                        className="h-7 text-[9px] text-primary hover:bg-primary/10 rounded-lg"
                      >
                        How to Collect?
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {myParcels.filter(p => p.status === "received").length === 0 && (
              <div className="sm:col-span-2 text-center py-20 text-muted-foreground border border-dashed rounded-2xl bg-secondary/5 text-xs flex flex-col items-center justify-center gap-2">
                <Check className="w-8 h-8 text-green-500 bg-green-500/10 rounded-full p-1.5" />
                All caught up! No parcels waiting for pickup at Gate 1.
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Historical Logs */}
        <Card className="lg:col-span-4 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-primary" /> Delivery History
            </CardTitle>
            <CardDescription className="text-xs">Archive logs of picked-up packages</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30 max-h-[400px] overflow-y-auto">
              {myParcels.filter(p => p.status === "picked-up").map((p) => (
                <div key={p.id} className="p-4 flex items-start gap-3 hover:bg-secondary/10 transition-colors">
                  <Package className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-bold text-foreground">Picked up from gate post</h4>
                    <p className="text-[10px] text-muted-foreground">Carrier: {p.courier} • Description: {p.description}</p>
                    <p className="text-[9px] text-muted-foreground pt-1">Collected: {p.pickedUpAt ? new Date(p.pickedUpAt).toLocaleString() : new Date().toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {myParcels.filter(p => p.status === "picked-up").length === 0 && (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No historical logs found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
