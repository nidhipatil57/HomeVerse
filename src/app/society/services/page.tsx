"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, CheckCircle, Wrench, Briefcase, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";

export default function WorkerServicesPage() {
  const { user, initialize } = useAuth();
  const { complaints, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      complaints: state.complaints || [],
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

  const myResolvedTasks = complaints.filter(
    (c) => c.portal === "society" && c.assignedTo === user?.name && c.status === "resolved"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          My Services 💼
        </h1>
        <p className="text-muted-foreground mt-1">
          Review your registered service categories, user ratings, and completed service logs
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Registered Services */}
        <div className="md:col-span-6 space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Active Service Profile
              </CardTitle>
              <CardDescription>Registered category info in society directory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Primary Trade Category</span>
                <Badge className="bg-primary/10 text-primary border-primary/20">{user?.workerCategory || "Electrician"}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Work Shift hours</span>
                <span className="font-semibold text-foreground">{user?.workingShift || "Morning (09:00 AM - 05:00 PM)"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Officer badge ID</span>
                <span className="font-semibold text-foreground font-mono">{user?.employeeId || "WRK-405"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Average Customer Rating</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  4.8 ★ (14 reviews)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Feedback Logs */}
        <Card className="md:col-span-6 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" /> Completed Jobs Archive ({myResolvedTasks.length})
            </CardTitle>
            <CardDescription>Verified completion receipts</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30 max-h-[350px] overflow-y-auto">
              {myResolvedTasks.map((t) => (
                <div key={t.id} className="p-4 space-y-1 hover:bg-secondary/10 transition-colors">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Flat {t.unit} • {t.category} repair</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 text-[8px]">Resolved</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{t.description}</p>
                  <p className="text-[9px] text-muted-foreground pt-1">Completed: {new Date().toLocaleDateString()}</p>
                </div>
              ))}
              {myResolvedTasks.length === 0 && (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No completed service jobs recorded.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
