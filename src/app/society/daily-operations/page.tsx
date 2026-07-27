"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, CheckCircle2, Clock, ShieldCheck, MapPin, ClipboardList, Plus, Trash2,
  AlertOctagon, CheckSquare, Settings, Play, Check, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";

export default function DailyOperationsPage() {
  const { user, initialize } = useAuth();
  const { attendance, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      attendance: state.attendance || [],
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"attendance" | "housekeeping" | "society-tasks">("attendance");

  // Local state for simulated housekeeping checklist
  const [housekeepingChecklist, setHousekeepingChecklist] = useState([
    { id: 1, task: "Elevator Disinfection & Cleaning (Wing A & B)", time: "09:00 AM", status: "Completed", by: "Subhash K. (Housekeeping)" },
    { id: 2, task: "Clubhouse Lounge vacuuming", time: "11:00 AM", status: "Completed", by: "Geeta R. (Housekeeping)" },
    { id: 3, task: "Gym Equipment Wipe down", time: "02:00 PM", status: "Pending", by: "Subhash K. (Housekeeping)" },
    { id: 4, task: "Garden Lawn Mowing & Trimming", time: "04:30 PM", status: "Pending", by: "Ram Lal (Gardener)" },
    { id: 5, task: "Main Entrance Gate Lobby sweeping", time: "07:00 PM", status: "Pending", by: "Geeta R. (Housekeeping)" }
  ]);

  // Local state for internal society maintenance tasks
  const [societyTasks, setSocietyTasks] = useState([
    { id: "1", title: "Water Tank Disinfection & Cleaning", scheduleDate: "July 26, 2026", status: "Pending", priority: "High" },
    { id: "2", title: "Fire Safety Audits & Extinguisher Refills", scheduleDate: "July 29, 2026", status: "Scheduled", priority: "Medium" },
    { id: "3", title: "DG Power Generator monthly load test", scheduleDate: "July 28, 2026", status: "Scheduled", priority: "High" },
    { id: "4", title: "Common Area Pest Control spraying", scheduleDate: "July 27, 2026", status: "In Progress", priority: "High" }
  ]);

  // Task creation states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const handleToggleHousekeeping = (id: number) => {
    setHousekeepingChecklist(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === "Completed" ? "Pending" : "Completed" }
          : item
      )
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDate.trim()) return;

    const newTask = {
      id: Math.random().toString(),
      title: newTaskTitle.trim(),
      scheduleDate: newTaskDate.trim(),
      status: "Pending",
      priority: newTaskPriority
    };

    setSocietyTasks(prev => [newTask, ...prev]);
    setNewTaskTitle("");
    setNewTaskDate("");
    setNewTaskPriority("Medium");
    setShowTaskModal(false);
  };

  const handleUpdateTaskStatus = (id: string, nextStatus: string) => {
    setSocietyTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, status: nextStatus } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setSocietyTasks(prev => prev.filter(task => task.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)]">Daily Operations Console 💼</h1>
          <p className="text-muted-foreground mt-1">
            Monitor daily helper attendance, manage communal housekeeping checklists, and schedule society maintenance tasks.
          </p>
        </div>
        {activeSubTab === "society-tasks" && (
          <Button onClick={() => setShowTaskModal(true)} className="gradient-primary text-white border-0 rounded-xl h-10 font-semibold text-xs flex items-center gap-1">
            <Plus className="w-4 h-4" /> Create Society Task
          </Button>
        )}
      </div>

      {/* Roster tab selector */}
      <div className="flex border-b border-border">
        {[
          { id: "attendance", label: "Helper Attendance", count: attendance.length },
          { id: "housekeeping", label: "Housekeeping Checklist", count: housekeepingChecklist.length },
          { id: "society-tasks", label: "Internal Society Tasks", count: societyTasks.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2.5 font-bold text-xs transition-colors border-b-2 -mb-[2px] flex items-center gap-2 ${
              activeSubTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <Badge variant="secondary" className="text-[9px] py-0 px-1.5 font-bold">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        {activeSubTab === "attendance" && (
          <Card className="border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Daily Checked-In Helpers</CardTitle>
              <CardDescription>Real-time log of maids, cooks, and gardeners active in the building premises today</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20 text-xs">
                {attendance.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground italic">
                    No helpers logged entered in the complex today yet.
                  </div>
                ) : (
                  attendance.map((att) => (
                    <div key={att.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-secondary/5 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">{att.workerName}</span>
                          <Badge variant="outline" className="text-[8px] font-extrabold uppercase bg-secondary/40 text-muted-foreground border-border/30">
                            {att.workerCategory}
                          </Badge>
                          <Badge className={
                            (att.status as string) === "Inside Society" || att.status === "checked-in"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : "bg-gray-500/10 text-gray-500"
                          }>
                            {att.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" /> Units: {att.assignedFlats?.join(", ") || "A Wing"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" /> Check-In: {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                          </span>
                          {att.checkOutTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-primary" /> Check-Out: {new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </p>
                      </div>
                      
                      <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 shrink-0">
                        Gate: <Badge variant="secondary" className="text-[9px] py-0 px-2">{att.entryGate || "Gate 1"}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSubTab === "housekeeping" && (
          <Card className="border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Housekeeping & Common Area Cleaning Checklist</CardTitle>
              <CardDescription>Track daily cleaning roster progress across building corridors and common spaces</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20 text-xs">
                {housekeepingChecklist.map((item) => (
                  <div key={item.id} className="p-4 flex justify-between items-center gap-4 hover:bg-secondary/5 transition-colors">
                    <div className="space-y-1">
                      <h4 className={`font-bold text-foreground text-sm ${item.status === "Completed" ? "line-through text-muted-foreground" : ""}`}>{item.task}</h4>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled: {item.time}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Staff: {item.by}</span>
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleToggleHousekeeping(item.id)}
                      variant={item.status === "Completed" ? "outline" : "default"}
                      className={`h-8 text-[10px] rounded-xl font-bold px-3 ${
                        item.status === "Completed" ? "border-green-500/20 text-green-500 hover:bg-green-500/5 bg-green-500/2.5" : "gradient-primary text-white border-0"
                      }`}
                    >
                      {item.status === "Completed" ? (
                        <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Completed</span>
                      ) : (
                        <span>Mark Done</span>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSubTab === "society-tasks" && (
          <div className="grid md:grid-cols-2 gap-4">
            {societyTasks.length === 0 ? (
              <Card className="col-span-full border-border/50 py-16 text-center text-muted-foreground bg-secondary/5 rounded-2xl">
                No active society-level tasks scheduled. Create one!
              </Card>
            ) : (
              societyTasks.map((task) => (
                <Card key={task.id} className="border-border/50 glass-card rounded-2xl flex flex-col justify-between">
                  <CardHeader className="pb-3 border-b border-border/15">
                    <div className="flex justify-between items-start">
                      <Badge className={
                        task.priority === "High"
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }>
                        {task.priority} Priority
                      </Badge>
                      <Badge variant="outline" className="text-[9px] font-bold py-0.5 px-2.5 rounded-full uppercase border">
                        {task.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold mt-3 text-foreground">{task.title}</CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1 mt-0.5 text-muted-foreground font-semibold">
                      <Clock className="w-3.5 h-3.5 text-primary" /> Target: {task.scheduleDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-3 flex justify-between items-center gap-2">
                    <div className="flex gap-1.5">
                      {task.status === "Pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateTaskStatus(task.id, "In Progress")}
                          className="h-8 text-[10px] bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg"
                        >
                          <Play className="w-3 h-3 mr-1" /> Start
                        </Button>
                      )}
                      {task.status === "In Progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateTaskStatus(task.id, "Completed")}
                          className="h-8 text-[10px] bg-green-600 hover:bg-green-700 text-white border-0 rounded-lg"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Finish
                        </Button>
                      )}
                      {task.status === "Scheduled" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateTaskStatus(task.id, "Pending")}
                          className="h-8 text-[10px] variant-outline border-border rounded-lg text-muted-foreground"
                        >
                          Pend Task
                        </Button>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTask(task.id)}
                      className="h-8 text-[10px] text-red-500 border-red-500/10 hover:bg-red-500/5 rounded-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Create Society Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 mt-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Task Title</label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Water Tank cleaning block A"
                className="rounded-xl h-10"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Target Date</label>
                <Input
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  placeholder="e.g. July 28, 2026"
                  className="rounded-xl h-10"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Severity / Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTaskModal(false)} className="rounded-xl h-10">
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary text-white border-0 rounded-xl h-10 font-bold px-5">
                Save Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
