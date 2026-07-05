"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage } from "@/types";
import { useAuth } from "@/lib/store/useAuth";

interface AIChatProps {
  portalType: "society" | "hostel";
}

const suggestionsByRole: Record<string, string[]> = {
  // Society Portal
  "society-resident": [
    "What is my maintenance bill?",
    "When is the next society meeting?",
    "Where is my parcel?",
    "Has my complaint been resolved?",
    "When is garbage collection?",
  ],
  "society-secretary": [
    "Generate billing report",
    "Summarize pending complaints",
    "Review today's budget",
    "Who is the plumber on shift today?",
  ],
  "society-security": [
    "Verify guest OTP code",
    "Look up incident log",
    "Show active visitors",
    "Emergency gate procedure",
  ],
  "society-worker": [
    "Show today's tasks",
    "Get route instructions",
    "What tools do I need?",
    "Safety protocols",
  ],
  // Hostel Portal
  "hostel-student": [
    "What's today's dinner?",
    "When is laundry available?",
    "Where is my parcel?",
    "What are my hostel dues?",
  ],
  "hostel-warden": [
    "Review pending leaves",
    "Check laundry machine status",
    "Show student check-in list",
    "Mess demand analytics",
  ]
};

function getAIResponseByRole(message: string, portalType: "society" | "hostel", role: string): string {
  const lower = message.toLowerCase();

  if (portalType === "society") {
    // --- SECRETARY REPLIES ---
    if (role === "secretary") {
      if (lower.includes("report") || lower.includes("billing"))
        return "💰 **July 2026 Invoicing & Collections Audit**:\n\n• **Total Invoiced**: ₹5,40,000\n• **Collected**: ₹4,12,000 (76%)\n• **Outstanding**: ₹1,28,000 (12 households)\n• **Expenses logged**: ₹84,500\n• **Net reserves balance**: ₹3,27,500\n\nWould you like to send automated push reminders to outstanding flats?";
      if (lower.includes("complaint") || lower.includes("summar"))
        return "📋 **Active Tickets Summary**:\n\n• **Plumbing**: 2 pending (A-301 tap, Tower B corridor leak)\n• **Electrical**: 1 pending (B-402 regulator sparking)\n• **Lift Elevator**: 0 pending (resolved)\n\n💡 **AI Priority Recommendation**: Assign the Tower B leak to Ramesh (Plumber) immediately as it is worsening.";
      if (lower.includes("budget"))
        return "📊 **Monthly Budget Allocation**:\n\n• Security Salaries: ₹90,000\n• Utility Bills (Power/Water): ₹45,000\n• Emergency Reserve: ₹50,000\n• Repairs Contract: ₹35,000\n\nAll logs match bank statements. No anomalies flagged.";
      if (lower.includes("plumber") || lower.includes("worker") || lower.includes("electrician"))
        return "🛠️ **On-Duty Contractors Today**:\n\n• Ramesh (Plumbing) - Shift: 9 AM - 6 PM\n• Shankar (Electrical) - Shift: 10 AM - 7 PM\n• Mahesh (Gardening) - Shift: 8 AM - 12 PM\n\nAll verified. Tap on 'Helpers & Trades' in your dashboard to modify details.";
    }

    // --- SECURITY REPLIES ---
    if (role === "security") {
      if (lower.includes("otp") || lower.includes("verify"))
        return "🔑 **Verification Desk**:\n\nTo verify, enter the 4-digit code presented by the guest. Pre-approved entries will be matched automatically. For walk-ins, tap 'Log Walk-In Visitor' to register name and flat details.";
      if (lower.includes("incident") || lower.includes("log"))
        return "🚨 **Security Incident Log - Today**:\n\n1. **Parking Blockage (Tower C)**: Resolved by issuing fine.\n2. **Basement leakage**: Notified maintenance supervisor.\n3. **Lost Keys found**: Returned to Flat B-102.\n\nDo you want to file a new incident log?";
      if (lower.includes("visitor") || lower.includes("active"))
        return "👥 **Gated Entry Traffic**:\n\n• **Checked-In (Inside)**: 8 guests\n• **Pre-Approved Expected**: 4 guests\n• **Checked-Out**: 12 guests\n• **Denied Access**: 1 guest\n\nAll registers synchronized with the Central database.";
      if (lower.includes("emergency") || lower.includes("procedure"))
        return "🆘 **Emergency Gated Response Protocol**:\n\n• **Medical SOS**: Direct warden/guards to Flat location immediately. Intercom hotline: **#009**.\n• **Fire Hazard**: Sound master siren, isolate gas valves, call **+91-100-2940**.";
    }

    // --- WORKER REPLIES ---
    if (role === "worker") {
      if (lower.includes("task") || lower.includes("job"))
        return "🛠️ **Today's Assigned Jobs**:\n\n1. **AC Regulator Sparking (Flat B-402)** - Category: Electrical\n2. **Kitchen Tap Leak (Flat A-301)** - Category: Plumbing\n\n💡 **AI Route Recommendation**: Start at A-301 first, then move to B-402 to minimize climbing elevations.";
      if (lower.includes("route"))
        return "📍 **Walking Route Guidance**:\n\nYour optimal walking path: **Workshop → Tower A (Flat 301) → Tower B (Flat 402)**. Estimated walking time: 6 mins. You save 12 floors of elevator transfers today!";
      if (lower.includes("tool") || lower.includes("inventory"))
        return "🔧 **Required Tool Slip Suggestions**:\n\n• **Plumbing Job (A-301)**: Teflon tape, Adjustable spanner, 1/2\" pipe.\n• **Electrical Job (B-402)**: Insulated tester screwdriver, PVC black tape.\n\nAll marked as 'Acquired' or 'Ready' in your inventory panel.";
      if (lower.includes("safety"))
        return "⚠️ **Workplace Safety Guidelines**:\n\n1. Isolate main electricity breaker before checking sockets/wires.\n2. Wear rubber-grip safety gloves and safety harness if working on elevators/heights.";
    }

    // --- RESIDENT REPLIES (DEFAULT SOCIETY) ---
    if (lower.includes("maintenance") || lower.includes("bill"))
      return "Your maintenance bill for July 2026 is **₹4,500**. Breakdown:\n\n• Base Charges: ₹2,500\n• Sinking Fund: ₹500\n• Parking space: ₹800\n• Water Tariff: ₹400\n• Common Electricity: ₹300\n\n📅 **Due Date**: July 10, 2026. Settle online from the Maintenance page.";
    if (lower.includes("meeting"))
      return "The next **Annual General Meeting (AGM)** is scheduled for:\n\n📅 **July 15, 2026** at **6:00 PM**\n📍 **Clubhouse Lounge, Ground Floor**\n\nAgenda items: Financial Audit, Garden renovation, and Gym upgrades.";
    if (lower.includes("parcel") || lower.includes("package"))
      return "📦 **Parcel Delivery Alert**:\n\n1 parcel from **Amazon** is awaiting gate pickup at Gate 1 Locker.\nOTP for release: **4821**.";
    if (lower.includes("water") || lower.includes("consumption"))
      return "💧 **Water Consumption log for July 2026**:\n\n• **Total**: 12.4 KL (kiloliters)\n• **Trend**: **Down 5%** compared to last month average.\n• You saved approximately ₹180 this month!";
    if (lower.includes("complaint"))
      return "📋 **My Complaint Status**:\n\n• **Kitchen Tap Leaking (A-301)**: 🟡 Submitted (July 2). Assigned to Plumber Ramesh. Estimated arrival: 3:00 PM.\n• Tap 'Complaints' to view timeline.";
    if (lower.includes("garbage"))
      return "🗑️ **Garbage Disposal Schedule (Tower A)**:\n\n• **Wet Waste**: Daily (7:00 AM - 8:00 AM)\n• **Dry Waste**: Monday, Wednesday, Friday\n• Please keep segregated bins ready by 6:45 AM.";

  } else {
    // --- HOSTEL WARDEN REPLIES ---
    if (role === "warden") {
      if (lower.includes("leave") || lower.includes("pending"))
        return "📝 **Curfew Leaves - Pending warden review**:\n\n• **Aarav Mehta** (Room 204) - Outstation weekend visit (Reason: Parent drop-off)\n• **Rohan Das** (Room 201) - Medical curfew extension\n\nTap 'Leave Requests' in sidebar to approve/reject.";
      if (lower.includes("laundry") || lower.includes("machine"))
        return "👕 **Laundry Machinery Logs**:\n\n• Washing Machine #1: Active\n• Washing Machine #2: Active\n• Dryer #1: Active\n• Dryer #2: **Under maintenance** (Health: 45%). Technician dispatched.";
      if (lower.includes("check-in") || lower.includes("attendance"))
        return "📋 **Hostel Attendance Roll-Call**:\n\n• Present: 322/340 students\n• Approved Outings: 12\n• Missing Check-ins: 6 students (Tower B Block)\n\n curate SMS reminders?";
      if (lower.includes("demand") || lower.includes("mess"))
        return "🍽️ **Mess Demand Analytics**:\n\nEstimated lunch volume: **285 students**.\nFood wastage rating is 3.8 ★ (Dinner has highest engagement). Kitchen stock warning: Milk reserves low.";
    }

    // --- STUDENT REPLIES (DEFAULT HOSTEL) ---
    if (lower.includes("dinner") || lower.includes("menu") || lower.includes("today"))
      return "🍽️ **Today's Dinner Menu (Wednesday)**:\n\n• Palak Paneer 🟢\n• Egg Curry 🔴\n• Roti & Rice\n• Kheer (Dessert) 🍮\n\n⏰ Time: 7:30 PM - 9:30 PM\n👥 **Crowd Prediction**: High peak at 8:00 PM. Best to eat at 7:40 PM or 9:00 PM.";
    if (lower.includes("laundry"))
      return "👕 **Laundry Booking slots**:\n\n• Washer Machine #1: Available\n• Washer Machine #2: In use (free in 25 mins)\n\nReserve a slot from the Laundry page before curfew.";
    if (lower.includes("parcel"))
      return "📦 **Parcel Locker**:\n\n1 Flipkart Package has arrived at Warden Locker Room.\nOTP for retrieval: **4821**.";
    if (lower.includes("due") || lower.includes("fee"))
      return "💰 **Hostel Dues Status**:\n\n• Monthly rent (July): ₹3,000\n• Mess bill: ₹1,200\n• Laundry bill: ₹300\n\n**Total Dues: ₹4,500**. Due date: July 10, 2026.";
    if (lower.includes("study") || lower.includes("room"))
      return "📖 **Study Room occupancy**:\n\n• Reading Room A (Floor 1): 12 seats free.\n• Reading Room B (Floor 3): Full.\n• Tap booking from settings to reserve study spaces.";
    if (lower.includes("inspection"))
      return "📅 **Next Hostel Room Inspection**:\n\n• Monday, July 8 at 10:00 AM.\n• Checklist: Cleanliness, electrical appliances check, furniture hygiene.";
  }

  return "I am your role-specific AI assistant! I can help you with:\n\n• 📊 Status lookups\n• 📝 Complaint timeline trackers\n• 👥 Visitor verification logs\n• 💵 Outstanding dues audits\n\nAsk me a specific question!";
}

export function AIChat({ portalType }: AIChatProps) {
  const { user, initialize } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    setMounted(true);
  }, [initialize]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userRole = mounted && user ? user.role : "resident";

  // Derive suggestion key
  const suggestionKey = `${portalType}-${userRole}`;
  const suggestions = suggestionsByRole[suggestionKey] || suggestionsByRole[`${portalType}-resident`] || [];

  // Initialize welcome message once mounted
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
        welcomeText = "Hi! 👋 I'm your **AI Resident Assistant**. Ask me about your bills, parcels, expected guests, or utility logs.";
      }
    } else {
      if (userRole === "warden") {
        welcomeText = "Warden Console Assistant Online. 🎓 Ask me about curfew logs, leave requests, mess demand forecasting, or laundry machine status.";
      } else {
        welcomeText = "Hey! 👋 I'm your **AI Student Assistant**. Ask me about today's mess menu, laundry availability, or packages.";
      }
    }

    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: welcomeText,
        timestamp: new Date().toISOString(),
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
        content: getAIResponseByRole(messageText, portalType, userRole),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  if (!mounted) return null;

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
            Active · Adapting to {userRole.charAt(0).toUpperCase() + userRole.slice(1)} role
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
          {messages.length <= 1 && suggestions.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Lightbulb className="w-3 h-3" />
                Try asking:
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
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
