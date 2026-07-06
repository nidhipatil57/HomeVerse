"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, UserCheck, MessageSquare, PhoneCall } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function ResidentDirectoryPage() {
  const { user, initialize } = useAuth();
  const { users, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const approvedResidents = users.filter(
    (u) => u.role === "resident" && u.status === "approved" && u.communityCode === user?.communityCode
  );

  const filteredResidents = approvedResidents.filter((r) => {
    return r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.unit && r.unit.includes(search)) ||
      (r.building && r.building.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Resident Directory 👥
        </h1>
        <p className="text-muted-foreground mt-1">
          Search approved residents and neighbors residing in Sunshine Complex
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, flat number, building wing..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl h-11 text-xs"
        />
      </div>

      {/* Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResidents.map((r, idx) => (
          <motion.div key={idx} variants={fadeInUp}>
            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full justify-between">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                    {r.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{r.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Flat {r.unit} • {r.building}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[9px] capitalize py-0.5 bg-secondary/50">
                    {r.ownerOrTenant || "Resident"}
                  </Badge>
                  <Badge variant="outline" className="text-[9px] py-0.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/25">
                    Verified Active
                  </Badge>
                </div>

                <div className="pt-3 border-t flex gap-2">
                  <a href={`tel:${r.phone}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-lg text-[10px] h-8 flex items-center justify-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-500" /> Call Neighbor
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => alert(`Opening chat with ${r.name}...`)}
                    className="flex-1 rounded-lg text-[10px] h-8 hover:bg-primary/10 hover:text-primary"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1" /> Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filteredResidents.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-20 text-muted-foreground border rounded-2xl bg-secondary/5">
            No residents found matching the search.
          </div>
        )}
      </motion.div>
    </div>
  );
}
