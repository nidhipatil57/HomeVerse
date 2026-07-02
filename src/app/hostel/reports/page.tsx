"use client";

import { motion } from "motion/react";
import { FileText, Download, CheckCircle, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WardenReportsPage() {
  const reportsList = [
    { name: "Monthly Mess Attendance & Wastage Report", size: "2.4 MB", type: "PDF Document", date: "June 2026", format: "PDF" },
    { name: "Hostel Occupancy & Bed Allocation Registry", size: "1.1 MB", type: "Excel Spreadsheet", date: "July 01, 2026", format: "EXCEL" },
    { name: "Laundry Slots Machine Usage Statistics", size: "850 KB", type: "PDF Document", date: "June 2026", format: "PDF" },
    { name: "Student Curfew Check-in Violations Log", size: "320 KB", type: "PDF Document", date: "Weekly - July 2026", format: "PDF" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Reports & Data Exports</h1>
        <p className="text-muted-foreground mt-1">Export database registries, analytical spreadsheets, or PDF summary sheets for hostel committee review.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Available Reports</h3>
          {reportsList.map((r, idx) => (
            <Card key={idx} className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    {r.format === "PDF" ? <FileText className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{r.name}</h4>
                    <p className="text-xs text-muted-foreground">{r.type} • {r.size} • Period: {r.date}</p>
                  </div>
                </div>

                <Button size="sm" variant="outline" className="rounded-lg h-9 text-xs flex items-center gap-1.5 shrink-0">
                  <Download className="w-3.5 h-3.5 text-emerald-500" /> Export
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="md:col-span-4 border-border/50 p-6 space-y-4 h-fit">
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">Batch Exports</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Generate and package all student statistics, visitor records, and mess ratings into a single compressed folder (.zip) for external auditing.
          </p>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 border-0">
            Download ZIP Archive
          </Button>
        </Card>
      </div>
    </div>
  );
}
