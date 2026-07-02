"use client";

import { motion } from "motion/react";
import { Wrench, CheckCircle, Package, ArrowRight, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WorkerInventoryPage() {
  const suggestedTools = [
    { name: "PPR Pipe 1/2 inch", category: "Plumbing", qty: "1 unit", source: "Main Store Room", status: "Ready" },
    { name: "Sealant Teflon Tape", category: "Plumbing", qty: "2 units", source: "Personal Kit Bag", status: "Acquired" },
    { name: "5-Speed Electrical Fan Regulator", category: "Electrical", qty: "1 unit", source: "Electrical Cabinet B", status: "Ready" },
    { name: "PVC Insulation Tape (Black)", category: "Electrical", qty: "1 unit", source: "Personal Kit Bag", status: "Acquired" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Suggested Inventory</h1>
        <p className="text-muted-foreground mt-1">AI suggestions of tools and spare materials needed for today&apos;s assigned complaints.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <Card className="md:col-span-8 border-border/50">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-500 animate-pulse" />
              AI Suggestions List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {suggestedTools.map((t, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border/50 bg-secondary/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Wrench className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{t.name}</h4>
                      <p className="text-xs text-muted-foreground">{t.qty} • Location: {t.source}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                    <Badge className={t.status === "Acquired" ? "bg-green-500/15 text-green-500" : "bg-blue-500/15 text-blue-500"}>
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 border-border/50 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">Store Handout Slip</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify this handout with the society supervisor or inventory keeper to issue items marked as <span className="font-semibold text-blue-500">Ready</span>.
            </p>
            <div className="border border-border/50 rounded-xl p-4 bg-secondary/20 text-xs font-mono space-y-2">
              <div className="flex justify-between"><span>Slip ID:</span><span className="font-bold">INV-9821</span></div>
              <div className="flex justify-between"><span>Date:</span><span>Jul 03, 2026</span></div>
              <div className="flex justify-between"><span>Status:</span><span className="text-amber-500 font-bold">Awaiting Issue</span></div>
            </div>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 border-0 mt-6">
            Generate QR Handout
          </Button>
        </Card>
      </div>
    </div>
  );
}
