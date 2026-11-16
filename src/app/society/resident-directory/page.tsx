"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, UserCheck, MessageSquare, PhoneCall, Send, Trash2, X, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

interface ChatItem {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp?: string;
  createdAt?: string;
}

export default function ResidentDirectoryPage() {
  const { user, initialize } = useAuth();
  const { users, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  // Messaging Dialog State
  const [activeChatResident, setActiveChatResident] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  useEffect(() => {
    if (activeChatResident && user) {
      loadChat(activeChatResident.id);
    }
  }, [activeChatResident, user]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const loadChat = async (neighborId: string) => {
    try {
      const res = await fetch(`/api/messages/${neighborId}`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
        return;
      }
    } catch (e) {}

    // Fallback to local storage if API is offline
    try {
      const key = `homeverse_chat_${[user?.id, neighborId].sort().join("_")}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setChatMessages(JSON.parse(saved));
      } else {
        setChatMessages([]);
      }
    } catch (e) {
      setChatMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatResident || !user) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    const newMsgObj: ChatItem = {
      id: `MSG-${Date.now()}`,
      senderId: user.id,
      receiverId: activeChatResident.id,
      message: messageText,
      timestamp: new Date().toISOString()
    };

    // Optimistically update
    const updatedMessages = [...chatMessages, newMsgObj];
    setChatMessages(updatedMessages);

    // Save to local storage for instant persistence
    const key = `homeverse_chat_${[user.id, activeChatResident.id].sort().join("_")}`;
    try {
      localStorage.setItem(key, JSON.stringify(updatedMessages));
    } catch (e) {}

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiverId: activeChatResident.id,
          message: messageText
        })
      });
    } catch (e) {} finally {
      setIsSending(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!activeChatResident || !user) return;
    if (!confirm(`Are you sure you want to delete the chat history with ${activeChatResident.name}?`)) return;

    try {
      await fetch(`/api/messages/${activeChatResident.id}`, {
        method: "DELETE",
        credentials: "include"
      });
    } catch (e) {}

    const key = `homeverse_chat_${[user.id, activeChatResident.id].sort().join("_")}`;
    try {
      localStorage.removeItem(key);
    } catch (e) {}

    setChatMessages([]);
  };

  if (!mounted) return null;

  const approvedResidents = users
    .filter(
      (u) =>
        (u.role === "resident" || u.role === "secretary") &&
        u.status === "approved" &&
        u.id !== user?.id &&
        (!user?.communityCode || u.communityCode === user.communityCode)
    )
    .sort((a, b) => {
      const wingA = (a.building || "").toUpperCase();
      const wingB = (b.building || "").toUpperCase();
      if (wingA !== wingB) return wingA.localeCompare(wingB);
      const numA = parseInt((a.unit || "").replace(/\D/g, ""), 10) || 0;
      const numB = parseInt((b.unit || "").replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });

  const filteredResidents = approvedResidents.filter((r) => {
    return (
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.unit && r.unit.includes(search)) ||
      (r.building && r.building.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Resident Directory</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect, call, and message verified neighbors residing in Sunshine Complex
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, flat number, building wing..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl h-10 text-xs bg-card border-border/60"
        />
      </div>

      {/* Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filteredResidents.map((r, idx) => (
          <motion.div key={r.id || idx} variants={fadeInUp}>
            <Card className="border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col h-full justify-between rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {r.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-foreground truncate">{r.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      Flat {r.unit} • {r.building}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[9px] capitalize py-0.5 bg-secondary/50">
                    {r.role === "secretary" ? "Secretary" : (r.ownerOrTenant || "Resident")}
                  </Badge>
                  <Badge variant="outline" className="text-[9px] py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25">
                    Verified Resident
                  </Badge>
                </div>

                <div className="pt-3 border-t border-border/50 flex gap-2">
                  <a href={`tel:${r.phone}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl text-[11px] h-8 flex items-center justify-center gap-1.5 border-border/60"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> Call
                    </Button>
                  </a>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setActiveChatResident(r)}
                    className="flex-1 rounded-xl text-[11px] h-8 flex items-center justify-center gap-1.5 gradient-primary text-white border-0 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredResidents.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-16 text-muted-foreground border border-dashed rounded-2xl bg-secondary/5 text-xs">
            No residents found matching your search term.
          </div>
        )}
      </motion.div>

      {/* Neighbor Chat Dialog */}
      <Dialog open={Boolean(activeChatResident)} onOpenChange={(open) => !open && setActiveChatResident(null)}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden rounded-2xl">
          {activeChatResident && (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50 bg-secondary/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {activeChatResident.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground leading-tight">{activeChatResident.name}</h3>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                      Flat {activeChatResident.unit} · {activeChatResident.building}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteChat}
                    title="Delete Chat History"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div
                ref={chatScrollRef}
                className="p-4 h-[340px] overflow-y-auto space-y-3 bg-card"
              >
                {chatMessages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? "gradient-primary text-white rounded-br-none"
                            : "bg-secondary/40 text-foreground border border-border/30 rounded-bl-none"
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-0.5 px-1 font-mono">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                      </span>
                    </div>
                  );
                })}

                {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 opacity-30 mb-2" />
                    <p className="text-xs font-semibold">No messages yet with {activeChatResident.name}.</p>
                    <p className="text-[11px] opacity-75 mt-0.5">Say hello to your neighbor!</p>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border/50 bg-secondary/15 flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${activeChatResident.name}...`}
                  className="h-10 text-xs rounded-xl bg-card border-border/60"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="h-10 px-4 rounded-xl gradient-primary text-white border-0 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
