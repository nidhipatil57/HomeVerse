"use client";

import { useState, useEffect } from "react";
import { Shield, Clock, Check, X, Calendar, Search, LogIn, LogOut, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function HostelVisitorsPage() {
  const { user, initialize } = useAuth();
  const { visitors, submitVisitorRequest, checkInVisitor, checkOutVisitor, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      visitors: state.visitors,
      submitVisitorRequest: state.submitVisitorRequest,
      checkInVisitor: state.checkInVisitor,
      checkOutVisitor: state.checkOutVisitor,
      initializeDb: state.initializeDb,
    }))
  );
  const [mounted, setMounted] = useState(false);

  // Form State for Student
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("Parent Dropoff");
  const [expectedAt, setExpectedAt] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWarden = user?.role === "warden";

  // Filter visitors
  const filteredVisitors = visitors.filter((v) => {
    if (v.portal !== "hostel") return false;
    if (!isWarden) {
      // Student: only see guests visiting them
      return v.visitingResident === user?.name || v.visitingUnit === user?.unit;
    }
    return true;
  });

  const handleRequestVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !phone.trim() || !expectedAt) return;

    submitVisitorRequest({
      name: guestName,
      phone,
      purpose,
      visitingUnit: user?.unit || "204",
      visitingResident: user?.name || "Aarav Mehta",
      expectedAt: new Date(expectedAt).toISOString(),
      date: expectedAt.split("T")[0],
      portal: "hostel"
    });

    setGuestName("");
    setPhone("");
    setExpectedAt("");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Visitor & Security Logs</h1>
          <p className="text-muted-foreground mt-1 flex-wrap">
            {isWarden ? "Oversight log: Monitor guest entries, parents drop-offs, and verification logs" : "Request security gate approval for parents or guest check-in"}
          </p>
        </div>

        {!isWarden && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4 mr-2" /> Register Guest / Parent
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)]">Pre-Register Guest</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRequestVisitor} className="space-y-4 mt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Guest Full Name</label>
                  <Input placeholder="e.g. Sanjay Mehta" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="rounded-xl h-11" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Mobile Number</label>
                  <Input placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl h-11" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Purpose / Relationship</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                  >
                    <option value="Parent Dropoff">Parent Dropoff</option>
                    <option value="Local Guardian">Local Guardian</option>
                    <option value="Personal Guest">Personal Guest</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Arrival Date & Time</label>
                  <Input type="datetime-local" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} className="rounded-xl h-11" required />
                </div>
                <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11">
                  Send Gate Access Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Today&apos;s Visitor Roster</h3>
          {filteredVisitors.map((v) => (
            <Card key={v.id} className="border-border/50">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{v.name}</span>
                      <Badge variant="outline" className="text-[9px]">{v.purpose}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Visiting: {v.visitingResident} (Room {v.visitingUnit}) • Phone: {v.phone}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                      Expected: {new Date(v.expectedAt || "").toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {v.status === "expected" && (
                    <Button
                      size="sm"
                      onClick={() => checkInVisitor(v.id)}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-8 px-2 border-0 text-xs flex items-center gap-0.5"
                    >
                      <LogIn className="w-3 h-3" /> Check In
                    </Button>
                  )}
                  {v.status === "checked-in" && (
                    <Button
                      size="sm"
                      onClick={() => checkOutVisitor(v.id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg h-8 px-2 border-0 text-xs flex items-center gap-0.5"
                    >
                      <LogOut className="w-3 h-3" /> Check Out
                    </Button>
                  )}

                  <Badge className={
                    v.status === "checked-in" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                    v.status === "checked-out" ? "bg-gray-500/10 text-gray-500 border border-gray-500/20" :
                    "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  }>
                    {v.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredVisitors.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm border rounded-2xl">No visitor logs found.</div>
          )}
        </div>

        <Card className="md:col-span-4 border-border/50 p-6 space-y-4 h-fit">
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">Gate Regulations</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All guests must produce an OTP generated by the student or obtain direct phone approval from the warden before entering the hostel blocks.
          </p>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs">
            <span className="font-bold text-emerald-500 block mb-0.5">Visitor Hours:</span>
            Daily 09:00 AM to 06:30 PM. No overnight guest stays permitted without committee waiver.
          </div>
        </Card>
      </div>
    </div>
  );
}
