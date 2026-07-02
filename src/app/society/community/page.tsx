"use client";

import { motion } from "motion/react";
import { Heart, Calendar, Trophy, Users, BookOpen, Dumbbell, Handshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const communityFeatures = [
  { title: "Community Events", description: "Festival celebrations, workshops, competitions & more", icon: Calendar, color: "from-purple-500 to-violet-500", count: "3 upcoming" },
  { title: "Sports Booking", description: "Reserve courts, gym, pool & clubhouse", icon: Dumbbell, color: "from-blue-500 to-cyan-500", count: "5 facilities" },
  { title: "Book Borrowing", description: "Lend & borrow books, games, tools", icon: BookOpen, color: "from-emerald-500 to-green-500", count: "42 items" },
  { title: "Skills Directory", description: "Connect with skilled residents in your community", icon: Users, color: "from-amber-500 to-orange-500", count: "86 profiles" },
  { title: "Local Business", description: "Promote & discover businesses in your society", icon: Handshake, color: "from-pink-500 to-rose-500", count: "12 businesses" },
  { title: "Lost & Found", description: "Report & find lost items in the community", icon: Trophy, color: "from-teal-500 to-emerald-500", count: "3 recent" },
];

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Community Hub 💛</h1>
        <p className="text-muted-foreground mt-1">Connect, share, and grow with your community</p>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {communityFeatures.map((feature) => (
          <motion.div key={feature.title} variants={fadeInUp}>
            <Card className="border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                <Badge variant="outline" className="text-xs">{feature.count}</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
