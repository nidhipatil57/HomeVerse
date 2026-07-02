"use client";

import { useState } from "react";
import { Megaphone, Plus, Bell, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WardenAnnouncementsPage() {
  const [notices, setNotices] = useState([
    { id: "A-1", title: "Semester Hostel Fee Clearance Due Date", desc: "All student fees must be paid and receipt submitted before July 10, 2026 to avoid late penalty charges.", category: "Fee Notice", priority: "important", date: "Jul 01" },
    { id: "A-2", title: "Block B Elevator Preventive Service Maintenance", desc: "Block B elevator will be shut down for routine cable lubrication between 02:00 PM and 04:00 PM today.", category: "Maintenance", priority: "normal", date: "Today" },
    { id: "A-3", title: "Curfew & Curfew Checking Advisory", desc: "Attendance checks are conducted at exactly 09:30 PM. All students must report to their respective blocks.", category: "Security", priority: "urgent", date: "Yesterday" }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Notice & Broadcast Board</h1>
          <p className="text-muted-foreground mt-1">Broadcast new community updates, push curfew warnings, or post emergency alerts to all students.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 border-0">
          <Plus className="w-4 h-4 mr-2" /> Add Notice
        </Button>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Active Broadcasts</h3>
          {notices.map((n, idx) => (
            <Card key={idx} className="border-border/50">
              <CardContent className="p-5 flex items-start gap-4">
                <Megaphone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">{n.category}</span>
                      <h4 className="text-sm font-bold text-foreground mt-0.5">{n.title}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge className={
                        n.priority === "urgent" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                        n.priority === "important" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                        "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      }>
                        {n.priority}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal">{n.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="md:col-span-4 border-border/50 p-6 space-y-4 h-fit">
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">Broadcast Reach</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Announcements are automatically pushed as a banner notification to all registered student dashboard landing feeds.
          </p>
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs">
            <Bell className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-muted-foreground">340 student devices active for immediate push alerts.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
