"use client";

import { useState, useEffect } from "react";
import { Download, FileText, Share2, ClipboardList, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SecretaryFinancialReportsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleExport = (format: "pdf" | "excel" | "csv", filename: string) => {
    alert(`Generating financial reports...\nYour file "${filename}.${format}" is ready for download!`);
  };

  const reports = [
    { name: "Annual Society Audit Sheet (FY 2025-26)", docType: "Audit Sheet", date: "Apr 2026", size: "2.4 MB" },
    { name: "Q1 Maintenance Collection Summary", docType: "Ledger Sheet", date: "Jun 2026", size: "1.1 MB" },
    { name: "Vendor Inflow & Outflow Invoices Summary", docType: "Tax Sheet", date: "Jul 2026", size: "900 KB" },
    { name: "Sinking Capital Roster Reserves", docType: "Asset Sheet", date: "May 2026", size: "1.7 MB" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Financial Reports Console 📊
        </h1>
        <p className="text-muted-foreground mt-1">
          Export annual audit logs, download capital expense summaries, and generate tax audit balance sheets
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Export Action Console */}
        <Card className="lg:col-span-5 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <ClipboardList className="w-5 h-5 text-primary" /> Run Custom Exporters
            </CardTitle>
            <CardDescription>Compile real-time logs for audits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl border bg-secondary/10 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold block">Annual Ledger Audit Sheet</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Format: PDF Document</span>
              </div>
              <Button size="sm" onClick={() => handleExport("pdf", "annual_ledger")} className="rounded-lg h-8 text-[10px] font-semibold gradient-primary text-white border-0">
                <Download className="w-3.5 h-3.5 mr-1" /> Export PDF
              </Button>
            </div>
            <div className="p-3.5 rounded-xl border bg-secondary/10 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold block">Maintenance Collections (XLS)</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Format: Microsoft Excel</span>
              </div>
              <Button size="sm" onClick={() => handleExport("excel", "collections_xls")} className="rounded-lg h-8 text-[10px] font-semibold gradient-primary text-white border-0">
                <Download className="w-3.5 h-3.5 mr-1" /> Export Excel
              </Button>
            </div>
            <div className="p-3.5 rounded-xl border bg-secondary/10 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold block">Vendor Expenses CSV</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Format: Comma Separated Logs</span>
              </div>
              <Button size="sm" onClick={() => handleExport("csv", "vendor_expenses_csv")} className="rounded-lg h-8 text-[10px] font-semibold gradient-primary text-white border-0">
                <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Archived Documents */}
        <Card className="lg:col-span-7 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <FileText className="w-5 h-5 text-primary" /> Archived Financial Statements
            </CardTitle>
            <CardDescription>Statements approved by Committee Board</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {reports.map((rep, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-secondary/15 transition-colors text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div>
                      <h4 className="font-bold">{rep.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Type: {rep.docType} • Created: {rep.date} • Size: {rep.size}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => alert(`Opening Statement: ${rep.name}...`)}
                    className="h-8 text-[10px] text-primary hover:bg-primary/10 rounded-lg flex items-center gap-1 shrink-0"
                  >
                    <Share2 className="w-3.5 h-3.5" /> View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
