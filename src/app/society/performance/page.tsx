"use client";

import { motion } from "motion/react";
import { Star, Trophy, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WorkerPerformancePage() {
  const accomplishments = [
    { title: "Fastest Resolver", desc: "Resolved kitchen tap leakage in 12 mins (record speed).", date: "June 28" },
    { title: "5-Star Streak", desc: "Achieved 10 consecutive five-star feedback ratings from Tower A residents.", date: "June 25" },
    { title: "Shift Hero", desc: "Completed 6 complaints in a single shift.", date: "June 20" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">My Performance Score</h1>
        <p className="text-muted-foreground mt-1">Review your ratings, resolution timelines, and achievement awards.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Overall Rating", value: "4.8 ★", desc: "Based on 34 resident ratings", color: "text-amber-500 bg-amber-500/10" },
          { label: "Avg Resolution Time", value: "24 mins", desc: "Target benchmark is 45 mins", color: "text-blue-500 bg-blue-500/10" },
          { label: "Completed Jobs", value: "45", desc: "This month (96% success)", color: "text-green-500 bg-green-500/10" }
        ].map((stat, idx) => (
          <Card key={idx} className="border-border/50">
            <CardContent className="p-5 flex flex-col justify-center h-32">
              <span className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">{stat.value}</span>
              <span className="text-sm font-semibold text-foreground mt-1">{stat.label}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{stat.desc}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <Card className="md:col-span-7 border-border/50">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Badges & Achievements
            </CardTitle>
            <CardDescription>Earned recognitions from resident and administrator feedback.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {accomplishments.map((acc, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border/50 bg-secondary/15 flex items-start gap-3">
                <Trophy className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold text-foreground">{acc.title}</h4>
                    <span className="text-[10px] text-muted-foreground">{acc.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{acc.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-5 border-border/50 p-6 space-y-4">
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">Recent Feedback</h3>
          <div className="space-y-3">
            {[
              { rating: "★★★★★", comment: "Very polite, wore shoe covers, fixed the tap perfectly.", unit: "A-301" },
              { rating: "★★★★★", comment: "Fast and professional. Regulator works great now.", unit: "B-402" }
            ].map((feed, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border/50 bg-secondary/10 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-500 font-bold">{feed.rating}</span>
                  <span className="text-muted-foreground font-mono">Flat {feed.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground italic">&quot;{feed.comment}&quot;</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
