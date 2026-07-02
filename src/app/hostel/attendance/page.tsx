"use client";
import { motion } from "motion/react";
import { ClipboardCheck, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const attendanceData = [
  { date: "Jul 1", day: "Tue", present: true },
  { date: "Jul 2", day: "Wed", present: true },
  { date: "Jun 30", day: "Mon", present: true },
  { date: "Jun 29", day: "Sun", present: false, reason: "Leave" },
  { date: "Jun 28", day: "Sat", present: true },
  { date: "Jun 27", day: "Fri", present: true },
  { date: "Jun 26", day: "Thu", present: true },
  { date: "Jun 25", day: "Wed", present: false, reason: "Sick" },
  { date: "Jun 24", day: "Tue", present: true },
  { date: "Jun 23", day: "Mon", present: true },
];

export default function AttendancePage() {
  const presentDays = attendanceData.filter(d => d.present).length;
  const percentage = Math.round((presentDays / attendanceData.length) * 100);
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Attendance 📋</h1>
        <p className="text-muted-foreground mt-1">Track your hostel attendance and leave history</p>
      </motion.div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-border/50"><CardContent className="p-6 text-center">
          <p className="text-4xl font-bold text-green-500 font-[family-name:var(--font-heading)]">{percentage}%</p>
          <p className="text-sm text-muted-foreground mt-1">Attendance Rate</p>
          <Progress value={percentage} className="h-2 mt-3" />
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-6 text-center">
          <p className="text-4xl font-bold text-primary font-[family-name:var(--font-heading)]">{presentDays}</p>
          <p className="text-sm text-muted-foreground mt-1">Days Present</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-6 text-center">
          <p className="text-4xl font-bold text-red-500 font-[family-name:var(--font-heading)]">{attendanceData.length - presentDays}</p>
          <p className="text-sm text-muted-foreground mt-1">Days Absent</p>
        </CardContent></Card>
      </div>
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base font-semibold">Recent Attendance</CardTitle></CardHeader>
        <CardContent>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
            {attendanceData.map((d) => (
              <motion.div key={d.date} variants={fadeInUp} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  {d.present ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                  <div>
                    <p className="text-sm font-medium">{d.date} ({d.day})</p>
                    {"reason" in d && d.reason && <p className="text-xs text-muted-foreground">Reason: {d.reason}</p>}
                  </div>
                </div>
                <Badge variant="outline" className={d.present ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}>{d.present ? "Present" : "Absent"}</Badge>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
