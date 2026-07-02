"use client";
import { motion } from "motion/react";
import { Users, Calendar, Gamepad2, BookOpen, Trophy, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const features = [
  { title: "Events & Fests", description: "Cultural nights, sports events, competitions & celebrations", icon: Calendar, color: "from-purple-500 to-violet-500", count: "5 upcoming" },
  { title: "Study Groups", description: "Join or create study groups for exams and projects", icon: BookOpen, color: "from-blue-500 to-cyan-500", count: "12 active" },
  { title: "Gaming Zone", description: "Book gaming room slots, chess, carrom, TT tournaments", icon: Gamepad2, color: "from-green-500 to-emerald-500", count: "3 slots open" },
  { title: "Lost & Found", description: "Report and claim lost items within the hostel", icon: Trophy, color: "from-amber-500 to-orange-500", count: "4 items" },
  { title: "Music Room", description: "Reserve the music room for practice and jamming sessions", icon: Music, color: "from-pink-500 to-rose-500", count: "2 slots open" },
  { title: "Roommate Finder", description: "AI-powered roommate matching based on habits and interests", icon: Users, color: "from-teal-500 to-emerald-500", count: "15 profiles" },
];

export default function HostelCommunityPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Community 🎉</h1>
        <p className="text-muted-foreground mt-1">Connect with fellow hostellers and enjoy campus life</p>
      </motion.div>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <motion.div key={f.title} variants={fadeInUp}>
            <Card className="border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{f.description}</p>
                <Badge variant="outline" className="text-xs">{f.count}</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
