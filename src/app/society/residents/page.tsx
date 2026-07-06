"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, Search, Plus, Trash2, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecretaryResidentsPage() {
  const { user, initialize } = useAuth();
  const {
    users, flats, addRegisteredUser, activateDeactivateUser, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      flats: state.flats || [],
      addRegisteredUser: state.addRegisteredUser,
      activateDeactivateUser: state.activateDeactivateUser,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [residentSearch, setResidentSearch] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [flat, setFlat] = useState("");
  const [building, setBuilding] = useState("A Wing");
  const [type, setType] = useState("Owner");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  const filteredResidents = useMemo(() => {
    return users.filter(u => 
      u.role === "resident" && 
      u.status !== "pending" &&
      (u.name.toLowerCase().includes(residentSearch.toLowerCase()) || 
       (u.unit && u.unit.includes(residentSearch)) ||
       (u.building && u.building.toLowerCase().includes(residentSearch.toLowerCase())))
    );
  }, [users, residentSearch]);

  if (!mounted) return null;

  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !flat) {
      alert("Please fill in all mandatory fields.");
      return;
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone: phone || "+91 99999 00000",
      role: "resident" as const,
      portal: "society" as const,
      unit: flat,
      building,
      ownerOrTenant: type,
      joinedAt: new Date().toISOString().split("T")[0],
      status: "approved" as const
    };
    addRegisteredUser(newUser);

    // Update flat database status
    const matchFlat = flats.find(f => f.flatNumber === flat && f.building === building);
    if (matchFlat) {
      useCommunityStore.setState(state => ({
        flats: state.flats.map(f => f.id === matchFlat.id ? { ...f, status: "occupied", residentId: newUser.id, residentName: name } : f)
      }));
    }

    setName("");
    setPhone("");
    setEmail("");
    setFlat("");
    alert("Resident account created and active immediately!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Residents Management 👥
        </h1>
        <p className="text-muted-foreground mt-1">
          Review approved residents, activate/deactivate resident profiles, and provision new resident credentials
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column - Directory */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search resident name, flat number, building wing..."
              value={residentSearch}
              onChange={(e) => setResidentSearch(e.target.value)}
              className="h-10 pl-8 text-xs rounded-xl"
            />
          </div>

          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b border-border/20">
              <CardTitle className="text-base font-semibold">Residents Directory</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {filteredResidents.map((r) => (
                  <div key={r.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-secondary/20 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold">{r.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Unit: <strong>{r.building} • Flat {r.unit}</strong> | Mobile: {r.phone} | Joined: {r.joinedAt || "July 2026"}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        Status: <Badge variant="outline" className="text-[8px] py-0">{r.ownerOrTenant || "Tenant"}</Badge>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          activateDeactivateUser(r.id, r.status === "approved" ? "deactivated" : "approved");
                          alert(`Account status updated for ${r.name}`);
                        }}
                        className={`h-8 text-[10px] rounded-lg flex items-center gap-1 ${
                          r.status === "approved" 
                            ? "border-amber-500/25 text-amber-500 hover:bg-amber-500/10" 
                            : "border-green-500/25 text-green-500 hover:bg-green-500/10"
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {r.status === "approved" ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredResidents.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground text-xs">
                    No approved residents found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Provision/Add */}
        <Card className="lg:col-span-4 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-primary" /> Provision Resident
            </CardTitle>
            <CardDescription>Directly provision active resident credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddResident} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Resident Full Name</label>
                <Input placeholder="e.g. Ramesh Kumar" value={name} onChange={(e) => setName(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Registered Email ID</label>
                <Input type="email" placeholder="e.g. ramesh@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Mobile Phone</label>
                  <Input placeholder="e.g. +91 99000 11000" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Ownership Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full h-9 px-3 border rounded-lg text-xs bg-card">
                    <option>Owner</option>
                    <option>Tenant</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Building Tower</label>
                  <select value={building} onChange={(e) => setBuilding(e.target.value)} className="w-full h-9 px-3 border rounded-lg text-xs bg-card">
                    <option>A Wing</option>
                    <option>B Wing</option>
                    <option>C Wing</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Flat Number</label>
                  <Input placeholder="e.g. 301" value={flat} onChange={(e) => setFlat(e.target.value)} className="h-9 rounded-lg text-xs" required />
                </div>
              </div>
              <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 text-xs font-semibold shadow-sm">
                Add Resident
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
