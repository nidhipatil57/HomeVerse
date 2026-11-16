"use client";

import { useMemo, useEffect } from "react";
import { Shield, Power } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useAuth } from "@/lib/store/useAuth";

export function SocietySecurityStaffSection() {
  const { user } = useAuth();
  const users = useCommunityStore((state) => state.users || []);
  const activateDeactivateUser = useCommunityStore((state) => state.activateDeactivateUser);
  const initializeDb = useCommunityStore((state) => state.initializeDb);

  useEffect(() => {
    initializeDb();
  }, [initializeDb]);

  const guards = useMemo(
    () => users.filter((staff) => staff.role === "security" && staff.portal === "society"),
    [users]
  );

  const updateStatus = async (guard: (typeof guards)[number]) => {
    const nextStatus = guard.status === "deactivated" ? "approved" : "deactivated";
    try {
      await activateDeactivateUser(guard.id, nextStatus);
    } catch {
      alert(`Could not update ${guard.name}'s account status.`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Security Staff</h2>
        <p className="text-sm text-muted-foreground mt-1">Review society security staff and manage account access.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Security Staff Registry
          </CardTitle>
          <CardDescription>Staff records from the society directory</CardDescription>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/30">
          {guards.map((guard) => (
            <div key={guard.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-sm">{guard.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Badge: {guard.employeeId || "Not assigned"} · Gate: {guard.gate || "Not assigned"} · Shift: {guard.workingShift || "Not assigned"}
                </p>
                <p className="text-xs text-muted-foreground">{guard.email} · {guard.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={guard.status === "deactivated" ? "secondary" : "default"} className="capitalize">
                  {guard.status || "approved"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(guard)}
                  title={guard.status === "deactivated" ? "Activate staff account" : "Deactivate staff account"}
                >
                  <Power className="w-3.5 h-3.5 mr-1.5" />
                  {guard.status === "deactivated" ? "Activate" : "Deactivate"}
                </Button>
              </div>
            </div>
          ))}
          {guards.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">No security staff records found.</div>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Signed in as {user?.name || "Secretary"}</p>
    </div>
  );
}
