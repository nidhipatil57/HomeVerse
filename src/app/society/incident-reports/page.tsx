"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecurityIncidentReportsPage() {
  const { user, initialize } = useAuth();
  const {
    incidents, addIncidentReport, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      incidents: state.incidents || [],
      addIncidentReport: state.addIncidentReport,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Form State
  const [type, setType] = useState<"Visitor Dispute" | "Lost Child" | "Vehicle Damage" | "Parking Violation" | "Noise Complaint" | "Theft Attempt" | "Others">("Visitor Dispute");
  const [location, setLocation] = useState("Main Gate");
  const [description, setDescription] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const handleAddIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    addIncidentReport({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location,
      description,
      type,
      status: "logged",
      reporter: user?.name || "Security Guard"
    });

    setDescription("");
    alert("Security incident logged and forwarded to committee dashboard.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Incident Reports 📋
        </h1>
        <p className="text-muted-foreground mt-1">
          File formal security logs, track complex disturbances, and review shift logs for committee audits
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <Card className="lg:col-span-5 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold">Log New Incident</CardTitle>
            <CardDescription>File details of any security violations or damage</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddIncidentSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Incident Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full h-9 px-3 border rounded-lg text-xs bg-card">
                  <option value="Visitor Dispute">Visitor Dispute</option>
                  <option value="Lost Child">Lost Child</option>
                  <option value="Vehicle Damage">Vehicle Damage</option>
                  <option value="Parking Violation">Parking Violation</option>
                  <option value="Noise Complaint">Noise Complaint</option>
                  <option value="Theft Attempt">Theft Attempt</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Incident Location</label>
                <Input placeholder="e.g. Tower B lobby, parking level 1" value={location} onChange={(e) => setLocation(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Describe Incident Details</label>
                <Input placeholder="Detail timeline, people involved..." value={description} onChange={(e) => setDescription(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 text-xs font-semibold shadow-sm">
                Log and Alert Secretary
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Historical logs list */}
        <Card className="lg:col-span-7 border-border/50 flex flex-col h-[500px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-primary" /> Shift incident and activity logs ({incidents.length})
            </CardTitle>
            <CardDescription>Consolidated logs for committee audits</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {incidents.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No incidents logged in the current shift.
              </div>
            ) : (
              incidents.map((inc) => (
                <div key={inc.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/15 flex flex-col gap-2 text-xs hover:bg-secondary/25 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{inc.type}</h4>
                      <p className="text-[10px] text-muted-foreground">Location: {inc.location} • Filed by: {inc.reporter}</p>
                    </div>
                    <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold">
                      {inc.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground bg-card border px-2 py-1.5 rounded-lg mt-1">{inc.description}</p>
                  <span className="text-[8px] text-muted-foreground self-end">{inc.date} at {inc.time}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
