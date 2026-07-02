"use client";
import { motion } from "motion/react";
import { Package, Clock, CheckCircle2, Key, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const parcels = [
  { id: "PKG-001", courier: "Amazon", description: "Electronics Package", status: "received" as const, time: "Today, 2:30 PM", otp: "4821" },
  { id: "PKG-002", courier: "Flipkart", description: "Books Package", status: "picked-up" as const, time: "Yesterday, 11:00 AM" },
  { id: "PKG-003", courier: "Meesho", description: "Clothing Package", status: "received" as const, time: "Today, 4:15 PM", otp: "7392" },
  { id: "PKG-004", courier: "Myntra", description: "Fashion Package", status: "picked-up" as const, time: "Jun 29, 3:00 PM" },
];

export default function ParcelsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Parcels 📦</h1>
        <p className="text-muted-foreground mt-1">Track your package deliveries and pickups</p>
      </motion.div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/50"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-orange-500 font-[family-name:var(--font-heading)]">{parcels.filter(p => p.status === "received").length}</p>
          <p className="text-xs text-muted-foreground mt-1">Awaiting Pickup</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-green-500 font-[family-name:var(--font-heading)]">{parcels.filter(p => p.status === "picked-up").length}</p>
          <p className="text-xs text-muted-foreground mt-1">Picked Up</p>
        </CardContent></Card>
      </div>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
        {parcels.map((p) => (
          <motion.div key={p.id} variants={fadeInUp}>
            <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status === "received" ? "bg-orange-500/10" : "bg-green-500/10"}`}>
                    <Package className={`w-5 h-5 ${p.status === "received" ? "text-orange-500" : "text-green-500"}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{p.courier} · {p.description}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{p.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.otp && <Badge className="bg-primary/10 text-primary border-primary/20 font-mono"><Key className="w-3 h-3 mr-1" />OTP: {p.otp}</Badge>}
                  <Badge variant="outline" className={p.status === "received" ? "bg-orange-500/10 text-orange-600" : "bg-green-500/10 text-green-600"}>
                    {p.status === "received" ? "Awaiting" : "Collected"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
