"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage } from "@/types";

interface AIChatProps {
  portalType: "society" | "hostel";
}

const societySuggestions = [
  "What is my maintenance bill?",
  "When is the next society meeting?",
  "How many visitors entered today?",
  "Show water consumption this month",
  "Has my complaint been resolved?",
  "When is garbage collection?",
];

const hostelSuggestions = [
  "What's today's dinner?",
  "When is laundry available?",
  "Where is my parcel?",
  "What are my hostel dues?",
  "Find available study room",
  "When is hostel inspection?",
];

function getAIResponse(message: string, portalType: "society" | "hostel"): string {
  const lower = message.toLowerCase();

  if (portalType === "society") {
    if (lower.includes("maintenance") || lower.includes("bill"))
      return "Your maintenance bill for July 2026 is **₹4,500**. Here's the breakdown:\n\n• Society Maintenance: ₹2,500\n• Sinking Fund: ₹500\n• Parking: ₹800\n• Water Charges: ₹400\n• Common Electricity: ₹300\n\n📅 Due Date: July 10, 2026\n\nYou can pay via UPI, net banking, or card from the Maintenance section.";
    if (lower.includes("meeting"))
      return "The next **Annual General Meeting (AGM)** is scheduled for:\n\n📅 **July 15, 2026** at **6:00 PM**\n📍 **Clubhouse, Ground Floor**\n\nAgenda items include:\n1. Financial report 2025-26\n2. New gym equipment proposal\n3. Security upgrade discussion\n4. Garden renovation\n\nWould you like to RSVP?";
    if (lower.includes("visitor"))
      return "Today's visitor summary for **Harmony Heights**:\n\n👥 **Total Visitors: 24**\n• ✅ Checked In: 8\n• ✅ Checked Out: 12\n• ⏳ Expected: 4\n\nRecent visitors:\n• Rahul Verma → A-301 (Personal)\n• Manoj Electrician → C-401 (AC Service)\n• Dr. Suresh → A-101 (Medical Visit)\n\nWant me to pre-approve a visitor for you?";
    if (lower.includes("water"))
      return "Your water consumption for **July 2026** so far:\n\n💧 **12.4 KL** (kiloliters)\n\nCompared to last month: **📉 Down 5%** — Great job!\n\n🏢 Building Average: 14.2 KL\n🏘️ Society Average: 13.8 KL\n\n💡 **AI Tip:** Your consumption is below average. You saved approximately ₹180 this month!";
    if (lower.includes("complaint") && lower.includes("resolv"))
      return "Here's the status of your complaints:\n\n1. **WiFi issue in lobby** — ✅ Resolved (July 1)\n   Rating: ⭐⭐⭐⭐ (4/5)\n\n2. **Parking dispute** — 🟡 Submitted (July 2)\n   Awaiting assignment\n\nWould you like to raise a new complaint or view details?";
    if (lower.includes("garbage"))
      return "Garbage collection schedule for **Tower A**:\n\n🗑️ **Dry Waste:** Monday, Wednesday, Friday\n♻️ **Wet Waste:** Daily (7:00 AM - 8:00 AM)\n📦 **E-Waste:** First Saturday of every month\n\n⏰ Next collection: Tomorrow, 7:00 AM (Wet Waste)\n\nPlease keep segregated bins ready by 6:45 AM.";
  } else {
    if (lower.includes("dinner") || lower.includes("menu") || lower.includes("today"))
      return "Today's dinner menu (**Wednesday**):\n\n🍽️ **Time:** 7:30 PM - 9:30 PM\n\n• Palak Paneer 🟢\n• Egg Curry 🔴\n• Roti\n• Rice\n• Kheer (Dessert) 🍮\n\n⭐ Rating: 4.3/5\n👥 **Crowd Prediction: High** (Peak at 8:00 PM)\n\n💡 **Best time to eat:** 7:30 PM or after 9:00 PM to avoid crowds!";
    if (lower.includes("laundry"))
      return "Laundry availability right now:\n\n🟢 **Machine 1 (Floor 2):** Available\n🔴 **Machine 2 (Floor 2):** In use (free in 25 min)\n🟢 **Machine 3 (Floor 4):** Available\n🟡 **Dryer 1 (Floor 2):** Available in 10 min\n\nWould you like to book a slot?";
    if (lower.includes("parcel"))
      return "You have **1 parcel** waiting for pickup:\n\n📦 **Flipkart Package**\nReceived: Today, 2:30 PM\nLocation: Hostel Reception\nPickup OTP: **4821**\n\n⏰ Please collect before 9:00 PM today.";
    if (lower.includes("due"))
      return "Your hostel fee status:\n\n💰 **Total Due: ₹4,500**\n\n• Hostel Rent (July): ₹3,000\n• Mess Charges: ₹1,200\n• Laundry: ₹300\n\n📅 Due Date: July 5, 2026\n\nPay online to avoid late fees!";
    if (lower.includes("study"))
      return "Available study rooms right now:\n\n🟢 **Reading Room A** (Floor 1) — 12 seats available\n🔴 **Reading Room B** (Floor 3) — Full\n🟢 **Meeting Room** (Floor 2) — Available\n🟢 **Gaming Room** — Available\n\nWould you like to reserve a spot?";
    if (lower.includes("inspection"))
      return "Next hostel inspection:\n\n📅 **July 8, 2026** (Monday)\n⏰ **10:00 AM - 1:00 PM**\n\nChecklist:\n• Room cleanliness\n• Electrical items check\n• Furniture condition\n• Bathroom hygiene\n\n💡 Make sure to keep your room clean and organized!";
  }

  return "I'd be happy to help! I can assist you with:\n\n• 📊 Bills & payments\n• 📝 Complaints & status\n• 👥 Visitor information\n• 💧 Utility consumption\n• 📅 Events & schedules\n• 📦 Parcel tracking\n\nTry asking me something specific!";
}

export function AIChat({ portalType }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: portalType === "society"
        ? "Hi! 👋 I'm your **AI Community Assistant**. I can help you with maintenance bills, complaints, visitor info, utility consumption, and more. Just ask me anything!"
        : "Hey there! 👋 I'm your **AI Hostel Assistant**. Ask me about today's menu, laundry availability, parcels, study rooms, or anything else about hostel life!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = portalType === "society" ? societySuggestions : hostelSuggestions;

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
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(messageText, portalType),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-[family-name:var(--font-heading)]">
            AI {portalType === "society" ? "Community" : "Hostel"} Assistant
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Always online · Powered by AI
          </p>
        </div>
      </div>

      {/* Messages */}
      <Card className="flex-1 border-border/50 overflow-hidden">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className={`text-xs ${msg.role === "assistant" ? "gradient-primary text-white" : "bg-secondary"}`}>
                      {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "gradient-primary text-white rounded-br-md"
                        : "bg-secondary/50 rounded-bl-md"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="gradient-primary text-white text-xs">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-secondary/50 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                  <motion.div className="w-2 h-2 rounded-full bg-muted-foreground/40" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-muted-foreground/40" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-muted-foreground/40" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Lightbulb className="w-3 h-3" />
                Try asking:
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-colors border border-border/50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 h-11 px-4 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-xl h-11 w-11 gradient-primary text-white border-0 shadow-lg shadow-primary/25"
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
