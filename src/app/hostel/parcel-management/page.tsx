"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Clock, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function WardenParcelManagementPage() {
  const { user, initialize } = useAuth();
  const {
    parcels, addParcel, pickupParcelWithOTP, users, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      parcels: state.parcels || [],
      addParcel: state.addParcel,
      pickupParcelWithOTP: state.pickupParcelWithOTP,
      users: state.users || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Form State
  const [recipientName, setRecipientName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [courier, setCourier] = useState("Amazon Logistics");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Hostel Block A Locker");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const handleAddParcelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !roomNumber) return;

    const recipient = users.find(
      u => u.name.toLowerCase().includes(recipientName.toLowerCase()) || u.room === roomNumber
    );

    const recipientId = recipient ? recipient.id : "user-student-1";
    const finalName = recipient ? recipient.name : recipientName;
    const otpVal = Math.floor(1000 + Math.random() * 9000).toString();

    addParcel({
      recipientId,
      recipientName: finalName,
      unit: roomNumber,
      courier,
      description: description || "Cardboard Box",
      otp: otpVal,
      location,
      portal: "hostel",
      image: "/images/package-placeholder.jpg"
    });

    setRecipientName("");
    setRoomNumber("");
    setDescription("");
    alert(`Parcel logged at hostel locker! OTP ${otpVal} generated for student.`);
  };

  const activeParcels = parcels.filter(p => p.portal === "hostel" && p.status === "received");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Parcel Management 📦
        </h1>
        <p className="text-muted-foreground mt-1">
          Record incoming student packages, dispatch locker codes, and view active locker bins
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <Card className="lg:col-span-5 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-primary" /> Log Student Package
            </CardTitle>
            <CardDescription>Enter details of incoming courier box</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddParcelSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Student / Room Number</label>
                <Input placeholder="e.g. 102 or Name" value={recipientName} onChange={(e) => {
                  setRecipientName(e.target.value);
                  if (!isNaN(Number(e.target.value))) setRoomNumber(e.target.value);
                }} className="h-9 rounded-lg text-xs" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Confirm Room No</label>
                  <Input placeholder="e.g. 102" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="h-9 rounded-lg text-xs" required />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Courier Carrier</label>
                  <select value={courier} onChange={(e) => setCourier(e.target.value)} className="w-full h-9 px-3.5 border rounded-lg text-xs bg-card">
                    <option>Amazon Logistics</option>
                    <option>Flipkart Kart</option>
                    <option>BlueDart Express</option>
                    <option>Delhivery Courier</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Locker Storage Spot</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Package description</label>
                <Input placeholder="e.g. Standard Box (Books & Stationery)" value={description} onChange={(e) => setDescription(e.target.value)} className="h-9 rounded-lg text-xs" />
              </div>
              <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 text-xs font-semibold shadow-sm">
                Log Inbound Package & Generate OTP
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right List */}
        <Card className="lg:col-span-7 border-border/50 flex flex-col h-[500px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-primary" /> Active Locker Parcels ({activeParcels.length})
            </CardTitle>
            <CardDescription>Parcels currently held in hostel locker bins</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeParcels.map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/15 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold">Room {p.unit} ({p.recipientName})</h4>
                  <p className="text-[10px] text-muted-foreground">{p.courier} • Location: {p.location}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Logged: {p.dateReceived} {p.timeReceived}</p>
                </div>
                <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold">
                  OTP: {p.otp}
                </Badge>
              </div>
            ))}
            {activeParcels.length === 0 && (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No active packages.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
