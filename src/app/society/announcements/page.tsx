"use client";
import { motion } from "motion/react";
import { Megaphone, Plus, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { announcements } from "@/data/mock-dashboard";

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Announcements 📢</h1>
          <p className="text-muted-foreground mt-1">Stay updated with community news</p>
        </div>
        <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25"><Plus className="w-4 h-4 mr-2" /> New Announcement</Button>
      </motion.div>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
        {announcements.map((ann) => (
          <motion.div key={ann.id} variants={fadeInUp}>
            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)]">{ann.title}</h3>
                  <Badge className={ann.priority === "urgent" ? "bg-red-500/10 text-red-600 border-red-500/20" : ann.priority === "important" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"} variant="outline">{ann.priority}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{ann.content}</p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-7 h-7"><AvatarFallback className="text-[10px] gradient-primary text-white">{ann.author.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                  <span className="text-sm font-medium">{ann.author}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(ann.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-1 ml-auto">{ann.tags.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
