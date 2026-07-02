"use client";
import { motion } from "motion/react";
import { MessageSquareWarning, Plus, Search, Clock, CheckCircle2, AlertTriangle, Zap, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const complaints = [
  { id: "HC-001", title: "WiFi not working in Room 204", category: "WiFi", status: "in-progress", priority: "high", time: "2 hours ago" },
  { id: "HC-002", title: "Water heater broken in bathroom", category: "Water", status: "assigned", priority: "medium", time: "5 hours ago" },
  { id: "HC-003", title: "Chair broken in study room", category: "Furniture", status: "submitted", priority: "low", time: "1 day ago" },
  { id: "HC-004", title: "AC not cooling in Room 305", category: "Electrical", status: "resolved", priority: "medium", time: "2 days ago" },
  { id: "HC-005", title: "Mess food quality issue", category: "Mess", status: "closed", priority: "medium", time: "3 days ago" },
];

const statusColors: Record<string, string> = {
  submitted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  assigned: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "in-progress": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  resolved: "bg-green-500/10 text-green-600 border-green-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function HostelComplaintsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Complaints</h1>
          <p className="text-muted-foreground mt-1">Track and manage hostel complaints</p>
        </div>
        <Dialog>
          <DialogTrigger
            render={
              <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" /> New Complaint
              </Button>
            }
          />
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle className="font-[family-name:var(--font-heading)]">Raise New Complaint</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Title" className="rounded-xl" />
              <Textarea placeholder="Describe the issue..." className="rounded-xl min-h-[100px]" />
              <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Bot className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground">AI will auto-assign priority based on severity and impact.</p>
              </div>
              <Button className="w-full rounded-xl gradient-primary text-white border-0 h-11">Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search complaints..." className="pl-9 rounded-xl" />
      </div>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
        {complaints.map((c) => (
          <motion.div key={c.id} variants={fadeInUp}>
            <Card className={`border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${c.priority === "high" ? "border-l-2 border-l-orange-500" : ""}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-mono">{c.id}</span>
                    <Badge variant="outline" className={statusColors[c.status]}>{c.status}</Badge>
                    <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                  </div>
                  <h3 className="text-sm font-semibold">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{c.time}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
