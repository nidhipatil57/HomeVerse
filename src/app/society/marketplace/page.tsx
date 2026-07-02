"use client";
import { motion } from "motion/react";
import { Store, Star, Search, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const services = [
  { name: "Ramesh Plumbing", category: "Plumber", rating: 4.8, reviews: 124, verified: true, initials: "RP", color: "from-blue-500 to-cyan-500" },
  { name: "Sharma Electricals", category: "Electrician", rating: 4.6, reviews: 89, verified: true, initials: "SE", color: "from-amber-500 to-yellow-500" },
  { name: "Meera's Cleaning", category: "Housekeeping", rating: 4.9, reviews: 203, verified: true, initials: "MC", color: "from-pink-500 to-rose-500" },
  { name: "Kumar Tutors", category: "Tutor", rating: 4.7, reviews: 56, verified: true, initials: "KT", color: "from-green-500 to-emerald-500" },
  { name: "Safe Drive", category: "Driver", rating: 4.5, reviews: 78, verified: true, initials: "SD", color: "from-purple-500 to-violet-500" },
  { name: "Fresh Kitchen", category: "Cook", rating: 4.8, reviews: 145, verified: true, initials: "FK", color: "from-orange-500 to-red-500" },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Service Marketplace 🏪</h1>
        <p className="text-muted-foreground mt-1">Verified service providers rated by your community</p>
      </motion.div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search plumbers, electricians, tutors..." className="pl-9 rounded-xl" />
      </div>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <motion.div key={s.name} variants={fadeInUp}>
            <Card className="border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className={`text-sm font-bold text-white bg-gradient-to-br ${s.color}`}>{s.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold">{s.name}</h3>
                      {s.verified && <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">✓ Verified</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{s.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(s.rating) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{s.rating}</span>
                  <span className="text-xs text-muted-foreground">({s.reviews} reviews)</span>
                </div>
                <Button className="w-full rounded-xl" variant="outline" size="sm">Book Now</Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
