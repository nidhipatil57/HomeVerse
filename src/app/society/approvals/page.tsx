"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Users, Wrench, Check, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecretaryApprovalsPage() {
  const { user, initialize } = useAuth();
  const {
    users, approveUser, rejectUser, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      approveUser: state.approveUser,
      rejectUser: state.rejectUser,
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

  const residentPending = users.filter(u => u.role === "resident" && u.status === "pending");
  const workerPending = users.filter(u => u.role === "worker" && u.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Approvals Queue 📋
        </h1>
        <p className="text-muted-foreground mt-1">
          Review, approve, or reject new resident registrations and worker gate entry credentials
        </p>
      </div>

      <div className="space-y-6">
        {/* Resident Approvals */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <Users className="w-4.5 h-4.5 text-primary" /> Resident Approval Requests ({residentPending.length})
            </CardTitle>
            <CardDescription className="text-xs">Verify credentials before granting complex access</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {residentPending.map((u) => (
                <div key={u.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-secondary/20 transition-colors">
                  <div className="text-xs">
                    <h4 className="font-bold">{u.name}</h4>
                    <p className="text-muted-foreground mt-0.5">
                      Unit: <strong>{u.building} • Flat {u.unit}</strong> | Email: {u.email} | Mobile: {u.phone}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">Ownership Type: <Badge variant="outline" className="text-[8px] py-0">{u.ownerOrTenant || "Tenant"}</Badge></p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        approveUser(u.id);
                        alert(`Approved resident: ${u.name}`);
                      }}
                      className="h-8 text-xs border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-600 rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        rejectUser(u.id);
                        alert(`Rejected resident: ${u.name}`);
                      }}
                      className="h-8 text-xs border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
              {residentPending.length === 0 && (
                <div className="text-center py-10 text-xs text-muted-foreground">No resident registrations awaiting approval.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Worker Approvals */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <Wrench className="w-4.5 h-4.5 text-primary" /> Worker Registration Approvals ({workerPending.length})
            </CardTitle>
            <CardDescription className="text-xs">Staff and local trade contractors awaiting gate authorization</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {workerPending.map((u) => (
                <div key={u.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-secondary/20 transition-colors">
                  <div className="text-xs">
                    <h4 className="font-bold">{u.name}</h4>
                    <p className="text-muted-foreground mt-0.5">
                      Category: <strong>{u.workerCategory}</strong> | Shift: {u.workingShift || "General"} | ID Badge: {u.employeeId}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Contact: {u.phone} | Registration Date: {u.joinedAt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        approveUser(u.id);
                        alert(`Approved worker: ${u.name}`);
                      }}
                      className="h-8 text-xs border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-600 rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        rejectUser(u.id);
                        alert(`Rejected worker: ${u.name}`);
                      }}
                      className="h-8 text-xs border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
              {workerPending.length === 0 && (
                <div className="text-center py-10 text-xs text-muted-foreground">No worker registrations awaiting approval.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
