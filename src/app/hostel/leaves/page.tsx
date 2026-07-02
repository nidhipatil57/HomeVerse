"use client";

import { useState } from "react";
import { FileCheck, Clock, Check, X, Search, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WardenLeavesPage() {
  const [leaves, setLeaves] = useState([
    { id: "L-1", studentName: "Rohan Das", room: "201-A", dates: "July 05 - July 08", duration: "3 Days", reason: "Sister's wedding ceremony in home town.", status: "pending" },
    { id: "L-2", studentName: "Aditya Roy", room: "105-B", dates: "July 06 - July 07", duration: "1 Day", reason: "Medical appointment in city center.", status: "pending" },
    { id: "L-3", studentName: "Sumit Mishra", room: "302-C", dates: "July 10 - July 15", duration: "5 Days", reason: "Going home for family festival.", status: "pending" },
    { id: "L-4", studentName: "Abhinav Singh", room: "204-B", dates: "June 25 - June 28", duration: "3 Days", reason: "Academic project conference travel.", status: "approved" },
    { id: "L-5", studentName: "Varun Sharma", room: "102-A", dates: "June 24 - June 25", duration: "1 Day", reason: "Personal work outstation.", status: "rejected" }
  ]);

  const handleStatusChange = (id: string, status: "approved" | "rejected") => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Leave & Outing Approvals</h1>
          <p className="text-muted-foreground mt-1">Review student outstation notifications and grant gate permissions.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Active Leave Queue</h3>
          {leaves.filter(l => l.status === "pending").map((req) => (
            <Card key={req.id} className="border-border/50 bg-secondary/10">
              <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{req.studentName}</span>
                    <Badge variant="outline" className="text-[10px]">Room: {req.room}</Badge>
                    <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] uppercase">{req.duration}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Dates: {req.dates}
                  </p>
                  <p className="text-xs text-muted-foreground italic leading-normal mt-1 bg-card p-3 rounded-xl border border-border/50">
                    &quot;{req.reason}&quot;
                  </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto shrink-0 self-end md:self-center">
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(req.id, "approved")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg h-9 border-0"
                  >
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(req.id, "rejected")}
                    variant="outline"
                    className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg h-9"
                  >
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {leaves.filter(l => l.status === "pending").length === 0 && (
            <div className="p-10 rounded-3xl border border-dashed border-border/60 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
              <ShieldCheck className="w-8 h-8 text-green-500" />
              No pending leave requests in queue. All caught up!
            </div>
          )}

          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pt-4">History Log</h3>
          {leaves.filter(l => l.status !== "pending").map((req) => (
            <Card key={req.id} className="border-border/50 opacity-70">
              <CardContent className="p-4 flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold">{req.studentName}</span>
                  <p className="text-xs text-muted-foreground">Dates: {req.dates} ({req.duration})</p>
                </div>
                <Badge className={req.status === "approved" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}>
                  {req.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="md:col-span-4 border-border/50 p-6 space-y-4 h-fit">
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">Curfew Rules</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All outings must be approved by the warden before 06:00 PM on the date of departure. Gate security checks student QR passes at the main exit.
          </p>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs">
            <span className="font-bold text-emerald-500 block mb-0.5">Note:</span>
            Curfew timing is 09:30 PM. Late check-ins are flagged in student directory logs.
          </div>
        </Card>
      </div>
    </div>
  );
}
