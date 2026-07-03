"use client";

import { useState, useEffect } from "react";
import { Bed, Plus, ArrowRightLeft, Users, Check, X, AlertCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { MOCK_HOSTELS } from "@/data/mock-communities";

export default function WardenRoomsPage() {
  const { user, initialize } = useAuth();
  const { users, roomChangeRequests, approveRoomChange, reallocateRoom, vacateRoom, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      users: state.users,
      roomChangeRequests: state.roomChangeRequests,
      approveRoomChange: state.approveRoomChange,
      reallocateRoom: state.reallocateRoom,
      vacateRoom: state.vacateRoom,
      initializeDb: state.initializeDb,
    }))
  );
  const [mounted, setMounted] = useState(false);

  // Filters state
  const [selectedGender, setSelectedGender] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Allocation dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState("");
  const [selectedWing, setSelectedWing] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  // Retrieve college metadata based on warden's verified college code
  const collegeCode = user?.communityCode || "VESIT26";
  const collegeMeta = MOCK_HOSTELS.find((h) => h.code === collegeCode) || MOCK_HOSTELS[0];
  const activeHostel = user?.hostelName || (user?.gender === "Female" ? "Girls Hostel" : "Boys Hostel");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  useEffect(() => {
    if (user && collegeMeta) {
      setSelectedWing(user.assignedWing || collegeMeta.wings[0]);
    }
  }, [user, collegeMeta]);

  if (!mounted || !user) return null;

  // Filter students belonging to this college
  const hostelStudents = users.filter(
    (u) => u.role === "student" && u.communityCode === collegeCode
  );

  // Apply filters
  const filteredStudents = hostelStudents.filter((s) => {
    const matchesGender = selectedGender === "All" || s.gender === selectedGender;
    const matchesYear = selectedYear === "All" || s.year === selectedYear;
    
    const isAssigned = !!s.unit;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Assigned" && isAssigned) ||
      (selectedStatus === "Unassigned" && !isAssigned);

    return matchesGender && matchesYear && matchesStatus;
  });

  // Calculate real-time room assignments
  // We can build a map: roomNumber -> list of student names
  const roomOccupancyMap: Record<string, typeof hostelStudents> = {};
  
  // Initialize all valid rooms for the warden's assigned wing
  const wingRooms: string[] = [];
  const assignedWingVal = user.assignedWing || collegeMeta.wings[0];

  for (let f = 1; f <= collegeMeta.floors; f++) {
    for (let r = 1; r <= collegeMeta.roomsPerFloor; r++) {
      const roomNum = `${f}${r < 10 ? `0${r}` : r}`;
      wingRooms.push(roomNum);
      roomOccupancyMap[roomNum] = [];
    }
  }

  // Populate occupants
  hostelStudents.forEach((student) => {
    if (student.unit && student.building === assignedWingVal) {
      if (!roomOccupancyMap[student.unit]) {
        roomOccupancyMap[student.unit] = [];
      }
      roomOccupancyMap[student.unit].push(student);
    }
  });

  // Statistics calculation
  const totalBeds = wingRooms.length * collegeMeta.capacityPerRoom;
  let occupiedBeds = 0;
  wingRooms.forEach((r) => {
    occupiedBeds += Math.min(collegeMeta.capacityPerRoom, roomOccupancyMap[r]?.length || 0);
  });
  const vacantBeds = totalBeds - occupiedBeds;

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentId || !selectedRoom) return;

    const occupants = roomOccupancyMap[selectedRoom] || [];
    if (occupants.length >= collegeMeta.capacityPerRoom) {
      alert(`Room ${selectedRoom} is already full.`);
      return;
    }

    const floorNum = Math.floor(parseInt(selectedRoom, 10) / 100).toString();
    reallocateRoom(targetStudentId, selectedRoom, assignedWingVal, floorNum);
    
    setTargetStudentId("");
    setAssignDialogOpen(false);
  };

  const handleTransfer = (studentId: string, room: string) => {
    const occupants = roomOccupancyMap[room] || [];
    if (occupants.length >= collegeMeta.capacityPerRoom) {
      alert(`Room ${room} is full.`);
      return;
    }
    const floorNum = Math.floor(parseInt(room, 10) / 100).toString();
    reallocateRoom(studentId, room, assignedWingVal, floorNum);
  };

  const unassignedStudents = hostelStudents.filter((s) => !s.unit);

  const pendingRequests = roomChangeRequests.filter(r => r.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Room Allocation Center</h1>
          <p className="text-muted-foreground mt-1">
            Manage bed spaces for <span className="font-semibold text-foreground">{collegeMeta.name}</span> ({activeHostel} • {assignedWingVal})
          </p>
        </div>

        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" /> Allocate Room Manually
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Allocate Student Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignSubmit} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Unassigned Student</label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                  required
                >
                  <option value="">Select a student...</option>
                  {unassignedStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.branch} • {s.year})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Hostel Wing</label>
                  <Input value={assignedWingVal} disabled className="h-11 rounded-xl bg-muted" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Available Room</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                    required
                  >
                    <option value="">Select room...</option>
                    {wingRooms
                      .filter((r) => (roomOccupancyMap[r]?.length || 0) < collegeMeta.capacityPerRoom)
                      .map((r) => (
                        <option key={r} value={r}>
                          Room {r} ({roomOccupancyMap[r]?.length || 0}/{collegeMeta.capacityPerRoom} beds)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11">
                Allocate Bed Space
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Columns - Students & Rooms */}
        <div className="md:col-span-8 space-y-6">
          {/* Room change requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Room Transfer Requests Queue</h3>
              {pendingRequests.map((req) => (
                <Card key={req.id} className="border-border/50 bg-secondary/15">
                  <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{req.studentName}</span>
                        <Badge variant="outline" className="text-[10px]">Current: {req.currentRoom} ({req.currentBlock})</Badge>
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
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg h-9 border-0 text-xs font-semibold"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Approve Transfer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Registry filters */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold font-[family-name:var(--font-heading)]">Student Directory & Room Controls</CardTitle>
              <CardDescription>Filter students to allocate, transfer, or vacate room spaces.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase">Gender</label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-input bg-card text-xs"
                  >
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-input bg-card text-xs"
                  >
                    <option value="All">All Years</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase">Room Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-input bg-card text-xs"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Assigned">Room Assigned</option>
                    <option value="Unassigned">No Room</option>
                  </select>
                </div>
              </div>

              {/* Student Cards List */}
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="p-4 rounded-xl border border-border/50 hover:bg-secondary/10 flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{student.name}</span>
                        <Badge variant="outline" className="text-[9px] capitalize">{student.gender}</Badge>
                        <Badge variant="secondary" className="text-[9px]">{student.branch} • {student.year}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {student.email} • {student.phone}
                      </p>
                      <p className="text-xs font-semibold text-primary">
                        {student.unit ? `🛌 Room: ${student.building} - ${student.unit}` : "⚠️ Room Unallocated"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Allocate or transfer controls */}
                      {student.unit ? (
                        <>
                          {/* Transfer control: quick select */}
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleTransfer(student.id, e.target.value);
                                e.target.value = "";
                              }
                            }}
                            className="h-9 px-2 rounded-lg border border-border/70 bg-card text-[11px] font-medium"
                          >
                            <option value="">Transfer Room...</option>
                            {wingRooms
                              .filter((r) => r !== student.unit && (roomOccupancyMap[r]?.length || 0) < collegeMeta.capacityPerRoom)
                              .map((r) => (
                                <option key={r} value={r}>
                                  To Room {r} ({roomOccupancyMap[r]?.length || 0}/{collegeMeta.capacityPerRoom} beds)
                                </option>
                              ))}
                          </select>

                          {/* Vacate button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(`Vacate student ${student.name} from Room ${student.unit}?`)) {
                                vacateRoom(student.id);
                              }
                            }}
                            className="w-9 h-9 text-destructive hover:bg-destructive/10 rounded-xl"
                            title="Vacate Bed Space"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const floorNum = Math.floor(parseInt(e.target.value, 10) / 100).toString();
                              reallocateRoom(student.id, e.target.value, assignedWingVal, floorNum);
                              e.target.value = "";
                            }
                          }}
                          className="h-9 px-2 rounded-lg border border-border/70 bg-card text-[11px] font-medium text-emerald-600 font-semibold"
                        >
                          <option value="">Quick Allocate...</option>
                          {wingRooms
                            .filter((r) => (roomOccupancyMap[r]?.length || 0) < collegeMeta.capacityPerRoom)
                            .map((r) => (
                              <option key={r} value={r}>
                                Room {r} ({roomOccupancyMap[r]?.length || 0}/{collegeMeta.capacityPerRoom} beds)
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-xs">
                    No students match the chosen filter configuration.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Room Matrix & Analytics */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold font-[family-name:var(--font-heading)]">Vacancy Analytics</CardTitle>
              <CardDescription>Live bed census indicators.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-border/50 rounded-xl p-4 bg-secondary/20 text-xs font-mono space-y-2">
                <div className="flex justify-between"><span>Occupied Beds:</span><span className="font-semibold text-foreground">{occupiedBeds}</span></div>
                <div className="flex justify-between"><span>Vacant Beds:</span><span className="font-semibold text-emerald-600">{vacantBeds}</span></div>
                <div className="flex justify-between"><span>Total Wing Beds:</span><span className="font-semibold text-foreground">{totalBeds}</span></div>
                <div className="flex justify-between"><span>Room Capacity:</span><span className="font-semibold text-foreground">{collegeMeta.capacityPerRoom} students/room</span></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold font-[family-name:var(--font-heading)]">Room Capacity Grid</CardTitle>
              <CardDescription>Visual matrix of {assignedWingVal} beds</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[350px] overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-2">
                {wingRooms.map((room) => {
                  const occupants = roomOccupancyMap[room] || [];
                  const fillPercent = (occupants.length / collegeMeta.capacityPerRoom) * 100;
                  
                  let bgColor = "border-border hover:bg-secondary/40";
                  if (occupants.length >= collegeMeta.capacityPerRoom) bgColor = "border-red-500/30 bg-red-500/5";
                  else if (occupants.length > 0) bgColor = "border-amber-500/30 bg-amber-500/5";

                  return (
                    <div
                      key={room}
                      className={`p-2.5 rounded-xl border text-center transition-all ${bgColor}`}
                      title={`Occupants: ${occupants.map(o => o.name).join(", ") || "None"}`}
                    >
                      <span className="text-xs font-bold block">R {room}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {occupants.length}/{collegeMeta.capacityPerRoom} beds
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
