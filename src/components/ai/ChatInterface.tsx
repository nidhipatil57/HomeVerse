"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, Sparkles, Lightbulb, Star, ShieldCheck, CalendarRange, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { ChatMessage } from "@/types";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";

interface AIChatProps {
  portalType: "society" | "hostel";
}

const suggestionsByRole: Record<string, string[]> = {
  // Society Portal
  "society-resident": [
    "I need a plumber tomorrow morning.",
    "Show me an electrician available now.",
    "Is there a maid recommended in my society?",
    "What is my maintenance bill?",
    "Where is my parcel?"
  ],
  "society-secretary": [
    "Generate billing report",
    "Summarize pending complaints",
    "Review today's budget",
    "Who is the plumber on shift today?"
  ],
  "society-security": [
    "Verify guest OTP code",
    "Look up incident log",
    "Show active visitors",
    "Emergency gate procedure"
  ],
  "society-worker": [
    "Show today's tasks",
    "Get route instructions",
    "What tools do I need?",
    "Safety protocols"
  ]
};

function getAIResponseByRole(message: string, portalType: "society" | "hostel"): string {
  const lower = message.toLowerCase();

  // Plumber check
  if (lower.includes("plumber") || lower.includes("leak") || lower.includes("tap") || lower.includes("pipe")) {
    return "I found an experienced plumber available in Sunshine Complex today!\n\n**Amit Kumar (Plumber)**\n⭐ 4.7 (18 reviews) · 4 years exp\nVisit Charge: ₹120\n🟢 Available Now\n\nYou can book Amit directly using the interactive recommendation card below:\n\n[RECOMMENDED_WORKER:user-worker-2]";
  }

  // Electrician check
  if (lower.includes("electrician") || lower.includes("wire") || lower.includes("spark") || lower.includes("fan") || lower.includes("mcb") || lower.includes("switch")) {
    return "I found a highly-rated electrician available on shift today:\n\n**Ramesh Kumar (Electrician)**\n⭐ 4.8 (24 reviews) · 5 years exp\nVisit Charge: ₹150\n🟢 Available Now\n\nYou can schedule an appointment immediately:\n\n[RECOMMENDED_WORKER:user-worker-1]";
  }

  // Maid check
  if (lower.includes("maid") || lower.includes("clean") || lower.includes("housekeep") || lower.includes("utensil")) {
    return "Here is a trusted, verified maid highly recommended by residents in your society:\n\n**Meena Sharma (Maid)**\n⭐ 4.8 (42 reviews) · 6 years exp\nVisit Charge: ₹80\n🟢 Available Now\n\nBook Meena directly from this card:\n\n[RECOMMENDED_WORKER:user-worker-3]";
  }

  // Carpenter check
  if (lower.includes("carpenter") || lower.includes("furniture") || lower.includes("wood") || lower.includes("door") || lower.includes("lock")) {
    return "I located a verified carpenter rostered in your gate logs today:\n\n**Sanjay Dutt (Carpenter)**\n⭐ 4.5 (12 reviews) · 7 years exp\nVisit Charge: ₹200\n🟢 Available Now\n\nBook Sanjay for any custom woodwork or lock repairs:\n\n[RECOMMENDED_WORKER:user-worker-4]";
  }

  // Gardener check
  if (lower.includes("gardener") || lower.includes("lawn") || lower.includes("plant") || lower.includes("garden") || lower.includes("weed")) {
    return "Here is a professional gardener active in Sunshine Complex today:\n\n**Ram Lal (Gardener)**\n⭐ 4.7 (30 reviews) · 10 years exp\nVisit Charge: ₹100\n🟢 Available Now\n\nBook Ram Lal for lawn pruning and planting:\n\n[RECOMMENDED_WORKER:user-worker-6]";
  }

  // Fallbacks
  if (lower.includes("maintenance") || lower.includes("bill")) {
    return "Your maintenance bill for July 2026 is **₹4,500**. Breakdown:\n\n• Base Charges: ₹2,500\n• Sinking Fund: ₹500\n• Parking space: ₹800\n• Water Tariff: ₹400\n• Common Electricity: ₹300\n\n📅 **Due Date**: July 10, 2026. Settle online from the Maintenance page.";
  }
  if (lower.includes("meeting")) {
    return "The next **Annual General Meeting (AGM)** is scheduled for:\n\n📅 **July 15, 2026** at **6:00 PM**\n📍 **Clubhouse Lounge, Ground Floor**\n\nAgenda items: Financial Audit, Garden renovation, and Gym upgrades.";
  }
  if (lower.includes("parcel") || lower.includes("package")) {
    return "📦 **Parcel Delivery Alert**:\n\n1 parcel from **Amazon** is awaiting gate pickup at Gate 1 Locker.\nOTP for release: **4821**.";
  }

  return "I am your community assistant! I can help you find available plumbers, electricians, maids, gardeners, or carpenters, as well as check your bills and parcels. Try asking: 'I need a plumber tomorrow.'";
}

export function AIChat({ portalType }: AIChatProps) {
  const { user, initialize } = useAuth();
  const {
    workerProfiles,
    createBooking,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      workerProfiles: state.workerProfiles || [],
      createBooking: state.createBooking,
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Booking Modal
  const [bookingWorker, setBookingWorker] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  useEffect(() => {
    if (user) {
      setBookingAddress(`${user.building || "A Wing"}, Flat ${user.unit || "204"}`);
    }
  }, [user]);

  const userRole = mounted && user ? user.role : "resident";
  const suggestionKey = `${portalType}-${userRole}`;
  const suggestions = suggestionsByRole[suggestionKey] || suggestionsByRole[`${portalType}-resident`] || [];

  // Welcome Message
  useEffect(() => {
    if (!mounted) return;
    
    let welcomeText = "";
    if (portalType === "society") {
      if (userRole === "secretary") {
        welcomeText = "Greetings, Secretary. 💼 I am your **AI Administrative Assistant**. Ask me to generate billing reports, summarize pending complaints, or audit budget lists.";
      } else if (userRole === "security") {
        welcomeText = "Gated Entry Assistant Online. 🚨 I can verify visitor OTPs, retrieve incident registries, or outline emergency procedures.";
      } else if (userRole === "worker") {
        welcomeText = "Service Assistant Online. 🛠️ Let me fetch your walking routes, tool slips, or workplace safety instructions.";
      } else {
        welcomeText = "Hi! 👋 I'm your **AI Community Assistant**. Ask me to search and book plumbers, electricians, maids, or ask about bills and parcels.";
      }
    } else {
      welcomeText = "Hey! 👋 I'm your **AI Hostel Assistant**. Ask me about today's mess menu, laundry slots, or packages.";
    }

    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: welcomeText,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [mounted, portalType, userRole]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponseByRole(messageText, portalType),
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime || !bookingWorker) return;

    setBookingLoading(true);
    try {
      await createBooking({
        workerId: bookingWorker.id,
        category: bookingWorker.workerCategory,
        bookingDate,
        bookingTime,
        address: bookingAddress,
        notes: bookingNotes
      });
      alert(`Successfully booked ${bookingWorker.name}! Booking request sent.`);
      setBookingWorker(null);
      setBookingNotes("");
      
      // Add confirmation message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `✅ I have successfully scheduled a booking request with **${bookingWorker.name}** for **${bookingDate} at ${bookingTime}**. They have been notified!`,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (e) {
      alert("Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const parseMessageContent = (content: string) => {
    const workerRegex = /\[RECOMMENDED_WORKER:(.+)\]/;
    const match = content.match(workerRegex);
    if (match) {
      const workerId = match[1];
      const cleanText = content.replace(workerRegex, "").trim();
      return { text: cleanText, workerId };
    }
    return { text: content, workerId: null };
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/10">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-[family-name:var(--font-heading)]">
            AI {portalType === "society" ? "Community" : "Hostel"} Assistant
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active · Ready to recommend and book local workers
          </p>
        </div>
      </div>

      {/* Messages Card */}
      <Card className="flex-1 border-border/50 overflow-hidden bg-card shadow-sm">
        <CardContent className="p-0 h-full flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const { text, workerId } = parseMessageContent(msg.content);
                const worker = workerId ? workerProfiles.find(w => w.id === workerId) : null;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className={`text-xs ${!isUser ? "gradient-primary text-white border-0" : "bg-secondary"}`}>
                        {!isUser ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="max-w-[75%] space-y-3">
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "gradient-primary text-white rounded-br-none"
                          : "bg-secondary/40 text-foreground border border-border/20 rounded-bl-none shadow-sm"
                      }`}>
                        {text}
                      </div>

                      {/* Interactive Worker Card */}
                      {worker && (
                        <div className="border border-border/60 bg-card rounded-2xl p-4 space-y-3.5 shadow-sm max-w-sm">
                          <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                              {worker.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div className="min-w-0 flex-1 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-foreground truncate block">{worker.name}</span>
                                {worker.workerProfile?.isVerified && (
                                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground block uppercase font-semibold">{worker.workerCategory}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-secondary/15 rounded-xl p-2">
                            <div>
                              <span className="text-muted-foreground block">Charge</span>
                              <strong className="text-primary font-bold">₹{worker.workerProfile?.visitCharge || "120"}</strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Rating</span>
                              <strong className="text-foreground font-bold flex items-center gap-0.5">
                                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500 shrink-0" />
                                {worker.rating?.toFixed(1) || "4.8"}
                              </strong>
                            </div>
                          </div>

                          <Button
                            onClick={() => setBookingWorker(worker)}
                            className="w-full rounded-xl h-9 text-xs font-bold gradient-primary text-white border-0 shadow-md shadow-primary/10 flex items-center gap-1.5"
                          >
                            <CalendarRange className="w-3.5 h-3.5" />
                            Book Amit Directly
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="gradient-primary text-white text-xs border-0"><Bot className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="bg-secondary/40 border border-border/20 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 shadow-sm">
                  <motion.div className="w-2 h-2 rounded-full bg-muted-foreground/40" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-muted-foreground/40" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-muted-foreground/40" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && suggestions.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                Try asking:
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary/30 hover:bg-primary/10 hover:text-primary transition-colors border border-border/50 text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="p-4 border-t border-border/10 bg-card">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI to find a plumber, check bills..."
                className="flex-1 h-11 px-4 rounded-xl bg-secondary/10 border border-border/50 text-sm focus-visible:ring-primary focus:outline-none"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                className="rounded-xl h-11 w-11 gradient-primary text-white border-0 shadow-md"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* BOOKING DIALOG FROM RECOMMENDATION */}
      <Dialog open={!!bookingWorker} onOpenChange={(open) => !open && setBookingWorker(null)}>
        {bookingWorker && (
          <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border border-border/50">
            <DialogHeader className="pb-3 border-b border-border/10">
              <DialogTitle className="font-extrabold text-foreground font-[family-name:var(--font-heading)]">Confirm AI-Assisted Booking</DialogTitle>
              <DialogDescription className="text-xs">Scheduling a service visit with <strong>{bookingWorker.name}</strong></DialogDescription>
            </DialogHeader>

            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Preferred Date</label>
                  <Input
                    type="date"
                    required
                    value={bookingDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="h-10 rounded-xl bg-secondary/10 border-border/50 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Preferred Time</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="h-10 w-full rounded-xl bg-background border border-border/50 px-3 text-xs outline-none"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Service Address</label>
                <Input
                  required
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  className="h-10 rounded-xl bg-secondary/10 border-border/50 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Brief problem description</label>
                <textarea
                  placeholder="Notes for the technician..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="h-20 w-full p-3 rounded-xl bg-secondary/10 border border-border/50 text-xs resize-none outline-none"
                />
              </div>

              <div className="bg-primary/5 rounded-2xl p-3 border border-primary/10 flex justify-between items-center text-[11px] font-medium text-foreground">
                <span>Total Visit Charge:</span>
                <span className="font-extrabold text-primary">₹{bookingWorker.workerProfile?.visitCharge || "120"}</span>
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setBookingWorker(null)} className="flex-1 rounded-xl h-10 border-border/50 font-bold">
                  Cancel
                </Button>
                <Button type="submit" disabled={bookingLoading} className="flex-1 rounded-xl h-10 text-xs font-bold gradient-primary text-white border-0 shadow-md">
                  {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirm & Send"}
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
