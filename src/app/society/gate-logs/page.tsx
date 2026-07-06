"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Clock, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecurityGateLogsPage() {
  const { user, initialize } = useAuth();
  const {
    gatePasses, issueGatePass, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      gatePasses: state.gatePasses || [],
      issueGatePass: state.issueGatePass,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  // Gate Pass state
  const [passName, setPassName] = useState("");
  const [company, setCompany] = useState("");
  const [purpose, setPurpose] = useState("Contractor Work");
  const [validDays, setValidDays] = useState("1");
  const [assignedResident, setAssignedResident] = useState("");
  const [unit, setUnit] = useState("");
  const [building, setBuilding] = useState("Tower A");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const handleAddPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passName || !assignedResident) return;

    const days = parseInt(validDays) || 1;

    issueGatePass({
      name: passName,
      company: company || "Independent",
      purpose,
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 1000 * 60 * 60 * 24 * days).toISOString(),
      assignedResident,
      unit,
      building
    });

    setPassName("");
    setCompany("");
    setAssignedResident("");
    setUnit("");
    alert("Gate Pass generated successfully!");
  };

  const filteredPasses = gatePasses.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.assignedResident.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Gate Pass Logs 🔑
        </h1>
        <p className="text-muted-foreground mt-1">
          Issue temporary contractor gate passes, verify active badges, and view access validation records
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <Card className="lg:col-span-5 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-primary" /> Issue Contractor Gate Pass
            </CardTitle>
            <CardDescription>Generate credentials for long-term daily workers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPassSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Contractor Full Name</label>
                <Input placeholder="e.g. Raju Carpenter" value={passName} onChange={(e) => setPassName(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Agency / Company</label>
                  <Input placeholder="e.g. UrbanCompany" value={company} onChange={(e) => setCompany(e.target.value)} className="h-9 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Purpose / Trade</label>
                  <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full h-9 px-3.5 border rounded-lg text-xs bg-card">
                    <option>Contractor Work</option>
                    <option>Internet Repair</option>
                    <option>Interior Renovation</option>
                    <option>Deep Cleaning Agency</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Host Resident</label>
                  <Input placeholder="Resident name" value={assignedResident} onChange={(e) => setAssignedResident(e.target.value)} className="h-9 rounded-lg text-xs" required />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Flat No</label>
                  <Input placeholder="A-301" value={unit} onChange={(e) => setUnit(e.target.value)} className="h-9 rounded-lg text-xs" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Validity (Days)</label>
                <select value={validDays} onChange={(e) => setValidDays(e.target.value)} className="w-full h-9 px-3.5 border rounded-lg text-xs bg-card">
                  <option value="1">1 Day (Single Visit)</option>
                  <option value="3">3 Days</option>
                  <option value="7">7 Days (Weekly)</option>
                  <option value="30">30 Days (Monthly)</option>
                </select>
              </div>
              <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 text-xs font-semibold shadow-sm">
                Generate Badge ID
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Active Passes list */}
        <Card className="lg:col-span-7 border-border/50 flex flex-col h-[520px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Clock className="w-4.5 h-4.5 text-primary" /> Active Gated Contractor Passes
                </CardTitle>
                <CardDescription className="text-xs">Verify contractor credentials & limits</CardDescription>
              </div>
              <div className="relative w-full sm:w-44 shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Search name..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 pl-8 text-[10px] rounded-lg" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredPasses.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No active contractor passes logged.
              </div>
            ) : (
              filteredPasses.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/15 flex items-center justify-between text-xs hover:bg-secondary/25 transition-colors">
                  <div>
                    <h4 className="font-bold">{p.name}</h4>
                    <p className="text-[10px] text-muted-foreground">Trade: {p.purpose} • Agency: {p.company}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Visits Flat: {p.unit} ({p.assignedResident})</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold font-mono shrink-0">
                    Badge ID: {p.id.slice(0, 8).toUpperCase()}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
