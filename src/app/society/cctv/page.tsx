"use client";

import { useState, useEffect } from "react";
import { Camera, Activity, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SecurityCctvPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const feeds = [
    { name: "Main Entrance Gate 1 (Inbound)", status: "Active Feed", color: "from-blue-500 to-indigo-500", fps: "30 fps" },
    { name: "Main Entrance Gate 1 (Outbound)", status: "Active Feed", color: "from-purple-500 to-pink-500", fps: "30 fps" },
    { name: "Clubhouse Lobby & Lounge", status: "Active Feed", color: "from-green-500 to-emerald-500", fps: "24 fps" },
    { name: "Tower A Ground Parking", status: "Active Feed", color: "from-amber-500 to-orange-500", fps: "25 fps" },
    { name: "Tower B Ground Parking", status: "Active Feed", color: "from-teal-500 to-cyan-500", fps: "25 fps" },
    { name: "Gate 2 Service Lane Entrance", status: "Active Feed", color: "from-red-500 to-rose-500", fps: "30 fps" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            CCTV Feeds 📹
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor live Gated Complex CCTV feeds and camera health indices in real-time
          </p>
        </div>
        <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          All Feeds Active (6/6)
        </Badge>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeds.map((f, i) => (
          <Card key={i} className="overflow-hidden border-border/50 bg-secondary/5 flex flex-col hover:shadow-lg transition-all duration-300">
            {/* Mock camera view */}
            <div className={`aspect-[16/10] bg-gradient-to-br ${f.color} relative flex items-center justify-center border-b border-border/20 overflow-hidden`}>
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center">
                <Monitor className="w-12 h-12 text-white/20 animate-pulse" />
              </div>

              {/* Live Tag */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 text-white text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                Live
              </div>

              {/* Feed Meta */}
              <div className="absolute bottom-3 right-3 text-[8px] text-white/70 font-mono">
                {f.fps} • H.265
              </div>
            </div>

            <CardHeader className="p-4">
              <CardTitle className="text-xs font-bold leading-tight line-clamp-1">{f.name}</CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-primary" /> Camera ID: CAM-{(302 + i * 11).toString()}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
