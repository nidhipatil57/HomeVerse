"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Plus, Search, UserCheck, UserX, Clock, LogIn, LogOut, QrCode,
  Phone, Building2, Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { mockVisitors } from "@/data/mock-visitors";
import type { VisitorStatus } from "@/types";

const statusConfig: Record<VisitorStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  expected: { label: "Expected", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Clock },
  "checked-in": { label: "Checked In", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: LogIn },
  "checked-out": { label: "Checked Out", color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: LogOut },
  denied: { label: "Denied", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: UserX },
};

export default function VisitorsPage() {
  const [search, setSearch] = useState("");

  const filteredVisitors = mockVisitors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.visitingResident.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: mockVisitors.length,
    checkedIn: mockVisitors.filter((v) => v.status === "checked-in").length,
    expected: mockVisitors.filter((v) => v.status === "expected").length,
    checkedOut: mockVisitors.filter((v) => v.status === "checked-out").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">
            Visitor Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Pre-approve, track, and manage visitor access
          </p>
        </div>
        <Dialog>
          <DialogTrigger
            render={
              <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" /> Pre-Approve Visitor
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">
                Pre-Approve Visitor
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Visitor Name</label>
                <Input placeholder="Enter visitor's name" className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                <Input placeholder="+91 XXXXX XXXXX" className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Purpose of Visit</label>
                <Input placeholder="e.g., Personal, Delivery, Service" className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Expected Time</label>
                <Input type="datetime-local" className="rounded-xl" />
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-center">
                <QrCode className="w-16 h-16 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  A QR code will be generated for the visitor after approval
                </p>
              </div>
              <Button className="w-full rounded-xl gradient-primary text-white border-0 h-11">
                Generate Pass & QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Total Today", value: stats.total, color: "#8b5cf6", icon: Shield },
          { label: "Checked In", value: stats.checkedIn, color: "#22c55e", icon: LogIn },
          { label: "Expected", value: stats.expected, color: "#3b82f6", icon: Clock },
          { label: "Checked Out", value: stats.checkedOut, color: "#64748b", icon: LogOut },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeInUp}>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search visitors by name or resident..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>

      {/* Visitor List */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {filteredVisitors.map((visitor) => {
          const config = statusConfig[visitor.status];
          const StatusIcon = config.icon;
          return (
            <motion.div key={visitor.id} variants={fadeInUp}>
              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 shrink-0">
                      <AvatarFallback className="text-sm font-semibold bg-secondary">
                        {visitor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold truncate">{visitor.name}</h3>
                        <Badge className={config.color} variant="outline">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {visitor.visitingUnit} · {visitor.visitingResident}
                        </span>
                        <span>·</span>
                        <span>{visitor.purpose}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {visitor.checkInTime && (
                        <p className="text-xs text-muted-foreground">
                          In: {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                      {visitor.checkOutTime && (
                        <p className="text-xs text-muted-foreground">
                          Out: {new Date(visitor.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                      {visitor.expectedAt && !visitor.checkInTime && (
                        <p className="text-xs text-blue-500">
                          Expected: {new Date(visitor.expectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
