"use client";

import { useState, useEffect } from "react";
import { ClipboardCheck, Search, Check, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function WardenAttendanceMgmtPage() {
  const { user, initialize } = useAuth();
  const { users, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const students = users.filter(u => u.role === "student" && u.portal === "hostel");

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.room && s.room.includes(search))
  );

  const handleToggle = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSave = () => {
    alert("Attendance roster saved successfully for today!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Attendance Management 📋
          </h1>
          <p className="text-muted-foreground mt-1">
            Log student roll calls, check in daily dorm directories, and view absent logs
          </p>
        </div>
        <Button onClick={handleSave} className="rounded-xl gradient-primary text-white border-0 shadow-md w-fit">
          Save Daily Sheet
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search student name, room number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-8 text-xs rounded-xl"
        />
      </div>

      {/* List */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-semibold">Student Roster Attendance Sheet</CardTitle>
          <CardDescription>Click to mark student Present / Absent</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {filteredStudents.map((s) => {
              const isPresent = attendance[s.id] ?? true; // Default to present
              return (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-secondary/15 transition-colors text-xs">
                  <div>
                    <h4 className="font-bold">{s.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Room: {s.room || "102"} • Block: {s.block || "A Block"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={isPresent ? "default" : "destructive"} className="text-[9px] font-bold shrink-0">
                      {isPresent ? "Present" : "Absent"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggle(s.id)}
                      className={`h-8 text-[10px] rounded-lg flex items-center gap-1 ${
                        isPresent 
                          ? "border-red-500/25 text-red-500 hover:bg-red-500/10" 
                          : "border-green-500/25 text-green-500 hover:bg-green-500/10"
                      }`}
                    >
                      {isPresent ? "Mark Absent" : "Mark Present"}
                    </Button>
                  </div>
                </div>
              );
            })}
            {filteredStudents.length === 0 && (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No students found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
