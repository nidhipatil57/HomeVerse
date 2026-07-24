"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star, Search, PhoneCall, ShieldCheck, CalendarRange, Clock, CheckCircle2,
  MessageSquare, Send, Loader2, User, CalendarDays, MapPin, X, ArrowRight,
  TrendingUp, CheckCircle, AlertCircle, DollarSign, MessageCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";

export default function WorkerServicesPage() {
  const { user, initialize } = useAuth();
  const {
    workerProfiles,
    serviceBookings,
    chatMessages,
    updateBookingStatus,
    sendChatMessage,
    fetchChatMessages,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      workerProfiles: state.workerProfiles || [],
      serviceBookings: state.serviceBookings || [],
      chatMessages: state.chatMessages || [],
      updateBookingStatus: state.updateBookingStatus,
      sendChatMessage: state.sendChatMessage,
      fetchChatMessages: state.fetchChatMessages,
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  
  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Fetch messages in real-time when chatting
  useEffect(() => {
    let interval: any;
    if (selectedContact) {
      fetchChatMessages(selectedContact.id);
      interval = setInterval(() => {
        fetchChatMessages(selectedContact.id);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedContact, fetchChatMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Get active contacts (residents who booked or have chat history)
  const activeContacts = useMemo(() => {
    const contactsMap = new Map();
    // Add contacts from bookings
    serviceBookings.forEach((b) => {
      if (b.resident) {
        contactsMap.set(b.resident.id, {
          id: b.resident.id,
          name: b.resident.name,
          phone: b.resident.phone,
          unit: b.resident.unit,
          building: b.resident.building
        });
      }
    });

    // Make sure Sara Shah is in Ramesh's contact list if Ramesh is logged in (matches seed data)
    if (user?.id === "user-worker-1") {
      contactsMap.set("user-resident-1", {
        id: "user-resident-1",
        name: "Sara Shah",
        phone: "+91 98765 43210",
        unit: "204",
        building: "A Wing"
      });
    }

    return Array.from(contactsMap.values());
  }, [serviceBookings, user]);

  // Find profile of this worker
  const myProfile = useMemo(() => {
    return workerProfiles.find((w) => w.id === user?.id);
  }, [workerProfiles, user]);

  if (!mounted) return null;

  // Worker stats
  const pendingRequests = serviceBookings.filter((b) => b.status === "Pending");
  const activeBookings = serviceBookings.filter((b) => b.status === "Accepted");
  const completedBookings = serviceBookings.filter((b) => b.status === "Completed");

  const totalEarnings = completedBookings.length * (myProfile?.workerProfile?.visitCharge || 120.0);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedContact) return;

    setSendingMessage(true);
    try {
      await sendChatMessage({
        receiverId: selectedContact.id,
        message: chatInput
      });
      setChatInput("");
      fetchChatMessages(selectedContact.id);
    } catch (e) {
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden gradient-primary text-white p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl border-0">
        <div className="space-y-1">
          <Badge className="bg-white/10 text-white border-0 rounded-full px-3 py-1 text-xs backdrop-blur-sm">
            💼 Service Provider Console
          </Badge>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] leading-none tracking-tight">
            Worker Dashboard
          </h1>
          <p className="text-white/80 text-sm font-medium">
            Manage your service requests, communicate with residents, and track your completed job scorecards.
          </p>
        </div>
        <div className="flex gap-4 lg:gap-8 items-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-full md:w-auto">
          <div className="text-center flex-1 md:flex-none">
            <span className="block text-2xl font-bold">₹{totalEarnings}</span>
            <span className="text-[10px] text-white/70">Total Revenue</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center flex-1 md:flex-none">
            <span className="block text-2xl font-bold">{myProfile?.rating?.toFixed(1) || "4.8"}★</span>
            <span className="text-[10px] text-white/70">Average Rating</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center flex-1 md:flex-none">
            <span className="block text-2xl font-bold">{serviceBookings.length}</span>
            <span className="text-[10px] text-white/70">Total Jobs</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-[600px] h-12 bg-secondary/30 rounded-2xl p-1 mb-6">
          <TabsTrigger value="bookings" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            Job Requests
          </TabsTrigger>
          <TabsTrigger value="inbox" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            Inbox Chat
          </TabsTrigger>
          <TabsTrigger value="earnings" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            Earnings
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            Reviews
          </TabsTrigger>
        </TabsList>

        {/* BOOKINGS CONTENT */}
        <TabsContent value="bookings" className="space-y-6 outline-none">
          {/* Pending requests */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Pending Requests ({pendingRequests.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {pendingRequests.map((bk) => (
                <Card key={bk.id} className="border-amber-500/20 bg-amber-500/2.5 rounded-2xl overflow-hidden border">
                  <CardHeader className="pb-2 border-b border-border/10 bg-secondary/20 p-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">Flat {bk.resident?.unit} • {bk.resident?.name}</span>
                      <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[8px] font-extrabold uppercase py-0.5">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="space-y-1 text-muted-foreground text-[11px]">
                      <p><strong>Appointment Date:</strong> {bk.bookingDate}</p>
                      <p><strong>Preferred Time:</strong> {bk.bookingTime}</p>
                      <p><strong>Service Location:</strong> {bk.address}</p>
                      {bk.notes && <p className="italic bg-background p-2 rounded border-l-2 border-amber-500 mt-2">"{bk.notes}"</p>}
                    </div>
                    <div className="pt-2 flex gap-2 border-t border-border/10">
                      <Button
                        onClick={() => updateBookingStatus(bk.id, "Accepted")}
                        className="flex-1 h-8 rounded-lg text-[10px] font-bold bg-primary hover:bg-primary/95 text-white border-0 shadow-sm"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateBookingStatus(bk.id, "Rejected")}
                        className="flex-1 h-8 rounded-lg text-[10px] font-bold border-rose-500/30 text-rose-500 hover:bg-rose-500/5 bg-background"
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pendingRequests.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground text-xs italic bg-secondary/10 rounded-2xl border border-border/50">
                  No pending service dispatches or job tickets in queue.
                </div>
              )}
            </div>
          </div>

          {/* Accepted / In Progress bookings */}
          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" /> Active Assignments ({activeBookings.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {activeBookings.map((bk) => (
                <Card key={bk.id} className="border-primary/20 bg-background rounded-2xl overflow-hidden shadow-sm">
                  <CardHeader className="pb-2 border-b border-border/10 bg-secondary/10 p-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">Flat {bk.resident?.unit} • {bk.resident?.name}</span>
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-[8px] font-extrabold uppercase py-0.5">Accepted</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="space-y-1 text-muted-foreground text-[11px]">
                      <p><strong>Appointment Date:</strong> {bk.bookingDate}</p>
                      <p><strong>Arrival Time:</strong> {bk.bookingTime}</p>
                      <p><strong>Location:</strong> {bk.address}</p>
                      <p><strong>Contact Resident:</strong> {bk.resident?.phone}</p>
                      {bk.notes && <p className="italic bg-secondary/10 p-2 rounded border-l-2 border-primary mt-2">"{bk.notes}"</p>}
                    </div>
                    <div className="pt-2 flex gap-2 border-t border-border/10">
                      <Button
                        onClick={() => updateBookingStatus(bk.id, "Completed")}
                        className="w-full h-8 rounded-lg text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm"
                      >
                        Mark Completed
                      </Button>
                      <a href={`tel:${bk.resident?.phone}`} className="shrink-0">
                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg border-border/50 hover:bg-secondary">
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {activeBookings.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground text-xs italic bg-secondary/10 rounded-2xl border border-border/50">
                  No active work tasks in progress.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* INBOX MESSAGING TAB */}
        <TabsContent value="inbox" className="grid grid-cols-12 gap-6 outline-none h-[calc(100vh-22rem)]">
          {/* Contacts List sidebar */}
          <Card className="col-span-12 md:col-span-4 border-border/50 bg-card rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border/15">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-widest">Active Contacts</h4>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border/10">
              {activeContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id ? "bg-primary/5 border-r-3 border-primary" : "hover:bg-secondary/10"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {contact.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <span className="font-bold text-foreground block truncate">{contact.name}</span>
                    <span className="text-[10px] text-muted-foreground">Flat {contact.unit} · {contact.building}</span>
                  </div>
                </div>
              ))}
              {activeContacts.length === 0 && (
                <div className="text-center py-16 text-muted-foreground text-xs italic">
                  No resident chat threads active.
                </div>
              )}
            </div>
          </Card>

          {/* Chat Window */}
          <Card className="col-span-12 md:col-span-8 border-border/50 bg-card rounded-2xl overflow-hidden flex flex-col h-full">
            {selectedContact ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-border/15 bg-secondary/10 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                      {selectedContact.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{selectedContact.name}</h4>
                      <p className="text-[10px] text-muted-foreground">Flat {selectedContact.unit} • {selectedContact.building}</p>
                    </div>
                  </div>
                  <a href={`tel:${selectedContact.phone}`} className="shrink-0">
                    <Button variant="outline" size="sm" className="rounded-xl h-8.5 px-3.5 border-border/50 flex items-center gap-1.5 font-bold hover:bg-secondary/40">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                      {selectedContact.phone}
                    </Button>
                  </a>
                </div>

                {/* Messages list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/5 dark:bg-card">
                  {chatMessages.map((msg: any) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          isMe
                            ? "gradient-primary text-white rounded-tr-none"
                            : "bg-secondary/40 text-foreground rounded-tl-none border border-border/20"
                        }`}>
                          <p>{msg.message}</p>
                          <span className="block text-[8px] text-right mt-1 opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-border/10 bg-card">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type your response to the resident..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="h-10 rounded-xl bg-secondary/10 border-border/50 text-xs"
                    />
                    <Button
                      type="submit"
                      disabled={!chatInput.trim() || sendingMessage}
                      className="rounded-xl h-10 px-4 gradient-primary text-white border-0 flex gap-1 font-bold shrink-0"
                    >
                      {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 text-muted-foreground text-xs">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 animate-bounce" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Select a Chat Thread</h4>
                  <p className="text-[10px]">Click a contact in the sidebar list to see the resident message history.</p>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* EARNINGS TAB */}
        <TabsContent value="earnings" className="space-y-6 outline-none">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border/50 rounded-2xl bg-card shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">Average Payout</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><DollarSign className="w-4 h-4" /></div>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-foreground">₹{myProfile?.workerProfile?.visitCharge || "120"}</h2>
                <p className="text-[10px] text-muted-foreground font-medium">Standard visitation fee per accepted ticket</p>
              </div>
            </Card>

            <Card className="border-border/50 rounded-2xl bg-card shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">Revenue generated</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-emerald-500">₹{totalEarnings}</h2>
                <p className="text-[10px] text-muted-foreground font-medium">Calculated from {completedBookings.length} completed services</p>
              </div>
            </Card>

            <Card className="border-border/50 rounded-2xl bg-card shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">Satisfaction rating</span>
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center"><Star className="w-4 h-4 fill-yellow-500" /></div>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-foreground">{myProfile?.rating?.toFixed(1) || "4.8"} / 5</h2>
                <p className="text-[10px] text-muted-foreground font-medium">Calculated score from citizen feedback logs</p>
              </div>
            </Card>
          </div>

          <Card className="border-border/50 bg-card rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-base font-bold">Rostered Job Receipts ({completedBookings.length})</CardTitle>
              <CardDescription>Archived receipts of verified task completions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {completedBookings.map((bk) => (
                  <div key={bk.id} className="p-4 flex justify-between items-center hover:bg-secondary/10 transition-all text-xs">
                    <div className="space-y-1.5">
                      <span className="font-bold text-foreground block">Flat {bk.resident?.unit} • {bk.resident?.name}</span>
                      <p className="text-[10px] text-muted-foreground flex gap-4">
                        <span>Date: {bk.bookingDate}</span>
                        <span>Visit Cost: ₹{bk.price}</span>
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] font-extrabold uppercase py-0.5">Disbursed</Badge>
                  </div>
                ))}
                {completedBookings.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground text-xs italic">
                    No completed job receipts archived.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews" className="space-y-6 outline-none">
          <Card className="border-border/50 bg-card rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-base font-bold">Customer Feedback & Reviews ({myProfile?.workerReviews?.length || 0})</CardTitle>
              <CardDescription>Review list posted by Sunshine Complex residents</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {myProfile?.workerReviews?.map((rv: any) => (
                  <div key={rv.id} className="p-5 space-y-2 hover:bg-secondary/10 transition-all text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">Flat {rv.resident?.unit} • {rv.resident?.name || "Resident"}</span>
                      <div className="flex gap-0.5 shrink-0">
                        {[...Array(rv.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                        ))}
                        {[...Array(5 - rv.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-muted-foreground" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed italic bg-secondary/10 p-3 rounded-xl border-l-2 border-primary">
                      "{rv.reviewText || "No written comment logged."}"
                    </p>
                    <div className="text-[9px] text-muted-foreground pt-1">
                      Posted on: {new Date(rv.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {(!myProfile?.workerReviews || myProfile.workerReviews.length === 0) && (
                  <div className="text-center py-20 text-muted-foreground text-xs italic">
                    No citizen reviews or ratings recorded yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
