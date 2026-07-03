"use client";

import { useState, useEffect } from "react";
import { Bed, Plus, Key, ArrowRightLeft, Users, Check, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";

export default function WardenRoomsPage() {
  const { user, initialize } = useAuth();
  const { roomChangeRequests, approveRoomChange, reallocateRoom, initializeDb } = useCommunityStore();
  const [mounted, setMounted] = useState(false);

  // Manual Allocation Form State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState("user-student-1");
  const [newRoom, setNewRoom] = useState("");
  const [newBlock, setNewBlock] = useState("Block A");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const handleManualAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.trim()) return;

    reallocateRoom(targetStudentId, newRoom, newBlock, "2");
    setNewRoom("");
    setDialogOpen(false);
  };

  const pendingRequests = roomChangeRequests.filter(r => r.status === "pending");
  const processedRequests = roomChangeRequests.filter(r => r.status !== "pending");

  // Mock statistics based on dynamic occupancy
  const occupiedBeds = 165;
  const totalBeds = 180;
  const vacantBeds = totalBeds - occupiedBeds;

  const mockRooms = [
    { room: "101", block: "Block A", type: "Double Occupancy", occupancy: 2, capacity: 2, students: ["Amit Verma", "Rahul Sharma"] },
    { room: "102", block: "Block A", type: "Double Occupancy", occupancy: 1, capacity: 2, students: ["Varun Sharma"] },
    { room: "204", block: "Block B", type: "Triple Occupancy", occupancy: 2, capacity: 3, students: ["Aarav Mehta", "Kunal Verma"] },
    { room: "302", block: "Block C", type: "Single Occupancy", occupancy: 1, capacity: 1, students: ["Sumit Mishra"] },
    { room: "305", block: "Block C", type: "Double Occupancy", occupancy: 0, capacity: 2, students: [] }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Room Allocation Command</h1>
          <p className="text-muted-foreground mt-1">Assign bed spaces, track room vacancies, and manage student transfer requests.</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 border-0 shadow-lg shadow-emerald-600/25">
                <Plus className="w-4 h-4 mr-2" /> Reallocate Room Manually
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Reallocate Bed Space</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleManualAllocate} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Student</label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                >
                  <option value="user-student-1">Aarav Mehta (Current: Room 204)</option>
                  <option value="user-student-other">Rohan Das (Current: Room 201)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">New Block</label>
                  <select
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                  >
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">New Room Number</label>
                  <Input placeholder="e.g. 203" value={newRoom} onChange={(e) => setNewRoom(e.target.value)} className="h-11 rounded-xl animate-none text-sm" required />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-0 h-11">
                Execute Reallocation
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-5">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Room Transfer Requests Queue</h3>
          {pendingRequests.map((req) => (
            <Card key={req.id} className="border-border/50 bg-secondary/15">
              <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{req.studentName}</span>
                    <Badge variant="outline" className="text-[10px]">Current Room: {req.currentRoom} ({req.currentBlock})</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requested Transfer to: <span className="font-semibold text-foreground">{req.requestedBlock} Room {req.requestedRoom}</span>
                  </p>
                  <p className="text-xs text-muted-foreground italic leading-normal bg-card p-2 rounded-lg border border-border/40 mt-1">
                    &quot;{req.reason}&quot;
                  </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto shrink-0 self-end md:self-center">
                  <Button
                    size="sm"
                    onClick={() => approveRoomChange(req.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg h-9 border-0 text-xs"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {pendingRequests.length === 0 && (
            <div className="p-10 rounded-2xl border border-dashed border-border/70 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 text-muted-foreground/30 animate-pulse" />
              No pending room change requests.
            </div>
          )}

          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pt-3">Rooms registry matrix</h3>
          {mockRooms.map((r, idx) => (
            <Card key={idx} className="border-border/50">
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">Room {r.room}</span>
                      <Badge variant="outline" className="text-[9px]">{r.block}</Badge>
                      <Badge className={r.occupancy === r.capacity ? "bg-red-500/15 text-red-500 text-[9px]" : "bg-blue-500/15 text-blue-500 text-[9px]"}>
                        {r.occupancy === r.capacity ? "Full" : `${r.capacity - r.occupancy} Bed Left`}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{r.type} • Occupants: {r.students.join(", ") || "None"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="md:col-span-4 border-border/50 p-6 space-y-4 h-fit">
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">Vacancy Analytics</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Overall hostel bed occupancy index. Student allocation changes can be performed immediately with automated notification sent to registrar and mess manager.
          </p>
          <div className="border border-border/50 rounded-xl p-4 bg-secondary/20 text-xs font-mono space-y-2">
            <div className="flex justify-between"><span>Occupied Beds:</span><span>{occupiedBeds}</span></div>
            <div className="flex justify-between"><span>Vacant Beds:</span><span>{vacantBeds}</span></div>
            <div className="flex justify-between"><span>Total Bed Capacity:</span><span>{totalBeds}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
