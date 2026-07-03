"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Megaphone, Plus, Clock, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useAuth } from "@/lib/store/useAuth";
import { useShallow } from "zustand/react/shallow";

export default function AnnouncementsPage() {
  const { announcements, addAnnouncement, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      announcements: state.announcements || [],
      addAnnouncement: state.addAnnouncement,
      initializeDb: state.initializeDb
    }))
  );

  const { user, initialize } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    );
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const tags = tagsInput
      ? tagsInput.split(",").map(t => t.trim()).filter(Boolean)
      : ["Notice"];

    addAnnouncement({
      title,
      content,
      author: user.name,
      authorRole: user.role,
      priority,
      tags
    });

    // Reset Form
    setTitle("");
    setContent("");
    setPriority("normal");
    setTagsInput("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Announcements 📢</h1>
          <p className="text-muted-foreground mt-1">Stay updated with community news and gate notices</p>
        </div>
        {(user.role === "security" || user.role === "worker") && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-500/25 h-10 px-4 text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" /> New Announcement
          </Button>
        )}
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border border-dashed rounded-3xl bg-secondary/5">
            <Megaphone className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
            No active announcements found for this complex.
          </div>
        ) : (
          announcements.map((ann) => (
            <motion.div key={ann.id} variants={fadeInUp}>
              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)]">{ann.title}</h3>
                    <Badge className={ann.priority === "urgent" ? "bg-red-500/10 text-red-600 border-red-500/20" : ann.priority === "important" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"} variant="outline">{ann.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{ann.content}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-[10px] bg-secondary/80 text-foreground font-bold">
                        {ann.author ? ann.author.split(" ").map((n: string) => n[0]).join("") : "UN"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      {ann.author}
                      {ann.authorRole === "security" && (
                        <span className="text-[9px] bg-red-500/10 text-red-600 border border-red-500/20 rounded px-1.5 font-sans">
                          Security Gate
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(ann.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <div className="flex gap-1 ml-auto">
                      {ann.tags.map(t => (
                        <Badge key={t} variant="outline" className="text-[9px] px-2 py-0">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border shadow-2xl rounded-3xl p-6 w-full max-w-lg relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-1 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-red-500" />
                Broadcast Gate Announcement
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                This notice will be published to the resident bulletin boards and notification feeds instantly.
              </p>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Title</label>
                  <Input
                    placeholder="e.g. Lift A Routine Inspection"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl h-11"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Content Details</label>
                  <textarea
                    placeholder="e.g. Please note Lift A in Tower A will be closed on Saturday from 10 AM to 1 PM for cables lubrication..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-28 p-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent Notice</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">Tags (Comma-separated)</label>
                    <Input
                      placeholder="e.g. Maintenance, Lift"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="rounded-xl h-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="rounded-xl">Cancel</Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white rounded-xl border-0 shadow-md font-semibold text-xs">Publish Broadcast</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
