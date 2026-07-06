"use client";

import { useState, useEffect, useMemo } from "react";
import { Wrench, Search, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecretaryWorkersPage() {
  const { user, initialize } = useAuth();
  const {
    users, activateDeactivateUser, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      activateDeactivateUser: state.activateDeactivateUser,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [workerSearch, setWorkerSearch] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  const filteredWorkers = useMemo(() => {
    return users.filter(u => 
      u.role === "worker" && 
      u.status !== "pending" &&
      (u.name.toLowerCase().includes(workerSearch.toLowerCase()) || 
       (u.workerCategory && u.workerCategory.toLowerCase().includes(workerSearch.toLowerCase())))
    );
  }, [users, workerSearch]);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Workers & Staff Directory 🛠
        </h1>
        <p className="text-muted-foreground mt-1">
          Review, activate/deactivate, and manage registered daily workers, cooks, plumbing, and electrical staff
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search worker by name, category..."
          value={workerSearch}
          onChange={(e) => setWorkerSearch(e.target.value)}
          className="h-10 pl-8 text-xs rounded-xl"
        />
      </div>

      {/* Workers List */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b border-border/20">
          <CardTitle className="text-base font-semibold">Gated Complex Workers roster</CardTitle>
          <CardDescription>Roster status and contact logs</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {filteredWorkers.map((w) => (
              <div key={w.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-secondary/20 transition-colors text-xs">
                <div>
                  <h4 className="font-bold">{w.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Category: <strong>{w.workerCategory}</strong> | Shift: {w.workingShift || "General"} | ID Badge: {w.employeeId}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Contact: {w.phone} | Active since: {w.joinedAt || "July 2026"}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      activateDeactivateUser(w.id, w.status === "approved" ? "deactivated" : "approved");
                      alert(`Account status updated for ${w.name}`);
                    }}
                    className={`h-8 text-[10px] rounded-lg flex items-center gap-1 ${
                      w.status === "approved" 
                        ? "border-amber-500/25 text-amber-500 hover:bg-amber-500/10" 
                        : "border-green-500/25 text-green-500 hover:bg-green-500/10"
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    {w.status === "approved" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
            {filteredWorkers.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-xs">
                No active workers rostered in directory.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
