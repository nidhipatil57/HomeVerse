"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecretaryFlatsPage() {
  const { user, initialize } = useAuth();
  const {
    flats, addFlat, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      flats: state.flats || [],
      addFlat: state.addFlat,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  // Add Flat Form
  const [flatNo, setFlatNo] = useState("");
  const [wing, setWing] = useState("A");
  const [building, setBuilding] = useState("A Wing");
  const [floor, setFloor] = useState(1);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const handleAddFlat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNo) return;
    addFlat({
      building,
      wing,
      floor: Number(floor),
      flatNumber: flatNo,
      status: "vacant"
    });
    setFlatNo("");
    alert(`Flat ${wing}-${flatNo} added successfully!`);
  };

  const filteredFlats = flats.filter(f => 
    f.flatNumber.includes(search) || 
    f.building.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Flats Database 🏠
        </h1>
        <p className="text-muted-foreground mt-1">
          Review complex flat registry, monitor vacancy levels, and provision new flats
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Flats List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search flats by number or building..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-8 text-xs rounded-xl"
            />
          </div>

          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">Registered Flats & Vacancies</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
                {filteredFlats.map((f) => (
                  <div key={f.id} className="p-4 flex items-center justify-between hover:bg-secondary/15 transition-colors text-xs">
                    <div>
                      <h4 className="font-bold">Flat {f.wing}-{f.flatNumber}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Tower: {f.building} • Floor: {f.floor}
                      </p>
                      {f.residentName && <p className="text-[9px] text-muted-foreground mt-0.5">Resident: {f.residentName}</p>}
                    </div>
                    <Badge variant={f.status === "occupied" ? "default" : "secondary"} className="text-[9px] font-bold capitalize shrink-0">
                      {f.status}
                    </Badge>
                  </div>
                ))}
                {filteredFlats.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground text-xs">
                    No matching flats found in registry.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Add Flat Form */}
        <Card className="lg:col-span-4 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-primary" /> Add New Apartment Flat
            </CardTitle>
            <CardDescription>Provision a new flat address in society</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFlat} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Flat Number</label>
                <Input placeholder="e.g. 301, 1204" value={flatNo} onChange={(e) => setFlatNo(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Wing Character</label>
                  <Input placeholder="e.g. A, B, C" value={wing} onChange={(e) => setWing(e.target.value)} className="h-9 rounded-lg text-xs" required />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Floor Level</label>
                  <Input type="number" placeholder="e.g. 3" value={floor} onChange={(e) => setFloor(Number(e.target.value))} className="h-9 rounded-lg text-xs" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Building/Tower</label>
                <select value={building} onChange={(e) => setBuilding(e.target.value)} className="w-full h-9 px-3 border rounded-lg text-xs bg-card">
                  <option>A Wing</option>
                  <option>B Wing</option>
                  <option>C Wing</option>
                </select>
              </div>
              <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 text-xs font-semibold shadow-sm">
                Add Flat to Database
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
