"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, Clock, CheckCircle2, Key, Camera, Plus, Search, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function ParcelsPage() {
  const { user, initialize } = useAuth();
  const { parcels, addParcel, pickupParcelWithOTP, initializeDb } = useCommunityStore();
  const [mounted, setMounted] = useState(false);

  // Warden Form State
  const [recipientId, setRecipientId] = useState("user-student-1");
  const [recipientName, setRecipientName] = useState("Aarav Mehta");
  const [unit, setUnit] = useState("204");
  const [courier, setCourier] = useState("Amazon Logistics");
  const [description, setDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Student OTP State
  const [enteredOtp, setEnteredOtp] = useState("");
  const [activePickupId, setActivePickupId] = useState<string | null>(null);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWarden = user?.role === "warden";

  // Filter parcels
  const filteredParcels = parcels.filter(p => {
    if (p.portal !== "hostel") return false;
    if (!isWarden) {
      return p.recipientId === user?.id || p.unit === user?.unit;
    }
    return true;
  });

  const awaitingCount = filteredParcels.filter(p => p.status === "received").length;
  const pickedCount = filteredParcels.filter(p => p.status === "picked-up").length;

  const handleRegisterParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courier.trim() || !description.trim()) return;

    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    addParcel({
      recipientId,
      recipientName,
      unit,
      courier,
      description,
      otp: randomOtp,
      location: "Block B Warden Locker Room",
      portal: "hostel",
      image: "/images/package-default.jpg"
    });

    setDescription("");
    setShowAddForm(false);
  };

  const handleVerifyOtp = (id: string) => {
    setOtpError("");
    const success = pickupParcelWithOTP(id, enteredOtp);
    if (success) {
      setEnteredOtp("");
      setActivePickupId(null);
    } else {
      setOtpError("Incorrect OTP. Please try again.");
    }
  };

  const handleSelectRecipient = (val: string) => {
    setRecipientId(val);
    if (val === "user-student-1") {
      setRecipientName("Aarav Mehta");
      setUnit("204");
    } else {
      setRecipientName("Rohan Das");
      setUnit("201");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Parcels 📦</h1>
          <p className="text-muted-foreground mt-1">
            {isWarden ? "Locker Room Control: Check in courier packages and verify student OTP pickups" : "Track your package deliveries and retrieve them via secure OTP"}
          </p>
        </div>

        {isWarden && (
          <Button onClick={() => setShowAddForm(!showAddForm)} className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4 mr-2" /> Log Incoming Courier
          </Button>
        )}
      </div>

      {/* Grid count cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-500 font-[family-name:var(--font-heading)]">{awaitingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting Pickup</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-500 font-[family-name:var(--font-heading)]">{pickedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Log Incoming Parcel Form */}
      {isWarden && showAddForm && (
        <Card className="border-border/50 p-6 bg-secondary/15">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-bold">Register Incoming Package</CardTitle>
          </CardHeader>
          <form onSubmit={handleRegisterParcel} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Student</label>
                <select
                  value={recipientId}
                  onChange={(e) => handleSelectRecipient(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="user-student-1">Aarav Mehta (CS - Room 204)</option>
                  <option value="user-student-other">Rohan Das (EC - Room 201)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Courier Service</label>
                <Input value={courier} onChange={(e) => setCourier(e.target.value)} className="h-10 text-xs rounded-lg animate-none" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Package Contents / Notes</label>
                <Input placeholder="e.g. Dell cardboard box" value={description} onChange={(e) => setDescription(e.target.value)} className="h-10 text-xs rounded-lg animate-none" required />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="rounded-lg h-9">Cancel</Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 border-0">Log Package & Send SMS</Button>
            </div>
          </form>
        </Card>
      )}

      {/* List */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
        {filteredParcels.map((p) => (
          <motion.div key={p.id} variants={fadeInUp}>
            <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.status === "received" ? "bg-orange-500/10" : "bg-green-500/10"}`}>
                    <Package className={`w-5 h-5 ${p.status === "received" ? "text-orange-500" : "text-green-500"}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{p.courier} · {p.description}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Recipient: {p.recipientName} (Room {p.unit}) • Registered {new Date(p.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {p.status === "received" && (
                    <>
                      {activePickupId === p.id ? (
                        <div className="flex items-center gap-1.5 bg-secondary/80 p-1.5 rounded-xl border">
                          <Input
                            placeholder="Enter 4-digit OTP"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                            className="h-8 w-28 text-center text-xs rounded-lg animate-none font-mono"
                          />
                          <Button onClick={() => handleVerifyOtp(p.id)} size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-8 px-2 border-0 text-xs">Verify</Button>
                          <Button onClick={() => setActivePickupId(null)} size="sm" variant="ghost" className="h-8 px-2 text-xs rounded-lg text-muted-foreground">X</Button>
                        </div>
                      ) : (
                        <>
                          <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-xs py-1"><Key className="w-3.5 h-3.5 mr-1" />OTP: {p.otp}</Badge>
                          {!isWarden && (
                            <Button onClick={() => { setActivePickupId(p.id); setOtpError(""); }} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-8 px-3 border-0 text-xs">
                              Collect Package
                            </Button>
                          )}
                        </>
                      )}
                    </>
                  )}
                  
                  <Badge variant="outline" className={p.status === "received" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" : "bg-green-500/10 text-green-600 border-green-500/20"}>
                    {p.status === "received" ? "Awaiting Pickup" : "Collected"}
                  </Badge>
                </div>
              </CardContent>
              {activePickupId === p.id && otpError && (
                <div className="px-4 pb-3 text-right text-xs text-red-500 font-semibold">{otpError}</div>
              )}
            </Card>
          </motion.div>
        ))}
        {filteredParcels.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm border rounded-2xl">No parcels registered for Room {user?.unit}.</div>
        )}
      </motion.div>
    </div>
  );
}
