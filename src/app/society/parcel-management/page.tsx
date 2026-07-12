"use client";

import { useState, useEffect } from "react";
import { Package, Clock, Check, Key, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecurityParcelManagementPage() {
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

  // Parcel creation state
  const [recipientName, setRecipientName] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [courier, setCourier] = useState("Amazon Logistics");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Gate 1 Locker Post");

  // Parcel release state
  const [releaseParcelId, setReleaseParcelId] = useState("");
  const [parcelOtp, setParcelOtp] = useState("");
  const [parcelReleaseError, setParcelReleaseError] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const pendingParcels = parcels.filter(p => p.portal === "society" && p.status === "received");

  const handleAddParcelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !flatNumber) return;

    // Find recipient user from users list
    const recipient = users.find(
      u => u.name.toLowerCase().includes(recipientName.toLowerCase()) || u.unit === flatNumber
    );

    const recipientId = recipient ? recipient.id : "user-resident-1";
    const finalName = recipient ? recipient.name : recipientName;
    const otpVal = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit OTP

    addParcel({
      recipientId,
      recipientName: finalName,
      unit: flatNumber,
      courier,
      description: description || "Package Package",
      otp: otpVal,
      location,
      portal: "society",
      image: "/images/package-placeholder.jpg"
    });

    // Reset Form
    setRecipientName("");
    setFlatNumber("");
    setDescription("");
    alert(`Parcel recorded! Verification code ${otpVal} dispatched to Resident's dashboard.`);
  };

  const handleReleaseParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    setParcelReleaseError("");
    if (!releaseParcelId || !parcelOtp) return;

    const success = await pickupParcelWithOTP(releaseParcelId, parcelOtp);
    if (success) {
      setReleaseParcelId("");
      setParcelOtp("");
      alert("Parcel verified and released successfully!");
    } else {
      setParcelReleaseError("Invalid OTP or parcel is already collected.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Parcel Management 📦
        </h1>
        <p className="text-muted-foreground mt-1">
          Record inbound deliveries, dispatch release codes, and verify resident OTP collections
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Record Inbound Package */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-primary" />
                Log Inbound Courier Parcel
              </CardTitle>
              <CardDescription>Enter details to dispatch automated release OTP</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddParcelSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Resident / Flat</label>
                    <Input placeholder="e.g. A-301 or Name" value={recipientName} onChange={(e) => {
                      setRecipientName(e.target.value);
                      if (e.target.value.includes("-")) setFlatNumber(e.target.value);
                    }} className="h-9 rounded-lg text-xs" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Confirm Flat No</label>
                    <Input placeholder="e.g. A-301" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} className="h-9 rounded-lg text-xs" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Courier Service</label>
                    <select value={courier} onChange={(e) => setCourier(e.target.value)} className="w-full h-9 px-3.5 border rounded-lg text-xs bg-card">
                      <option>Amazon Logistics</option>
                      <option>Flipkart Kart</option>
                      <option>BlueDart Express</option>
                      <option>Delhivery Courier</option>
                      <option>Swiggy Instamart</option>
                      <option>Zomato Food</option>
                      <option>Other Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Gate Storage Spot</label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-9 rounded-lg text-xs" required />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Brief Description (Optional)</label>
                  <Input placeholder="e.g. Brown cardboard box" value={description} onChange={(e) => setDescription(e.target.value)} className="h-9 rounded-lg text-xs" />
                </div>
                <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 text-xs font-semibold shadow-sm">
                  Log Parcel Entry & Send OTP
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Release Package with OTP */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Key className="w-4 h-4 text-primary" />
                Release Parcel (OTP Verification)
              </CardTitle>
              <CardDescription>Enter the 4-digit code shown on Resident's app</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReleaseParcel} className="space-y-3">
                {parcelReleaseError && (
                  <div className="p-3 text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg">
                    {parcelReleaseError}
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Select Parcel</label>
                  <select
                    value={releaseParcelId}
                    onChange={(e) => setReleaseParcelId(e.target.value)}
                    className="w-full h-9 px-3 border rounded-lg text-xs bg-card"
                    required
                  >
                    <option value="">-- Choose Parcel --</option>
                    {pendingParcels.map(p => (
                      <option key={p.id} value={p.id}>Flat {p.unit} ({p.recipientName}) - {p.courier}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Verification OTP</label>
                  <Input
                    type="number"
                    maxLength={4}
                    placeholder="Enter 4-digit OTP"
                    value={parcelOtp}
                    onChange={(e) => setParcelOtp(e.target.value)}
                    className="h-9 rounded-lg text-xs"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-9 rounded-lg bg-green-600 hover:bg-green-700 text-white border-0 text-xs font-semibold shadow-sm">
                  Verify OTP & Release
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pending Parcels Log list */}
        <Card className="lg:col-span-7 border-border/50 flex flex-col h-[520px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Package className="w-4.5 h-4.5 text-amber-500" /> Pending Gate Locker Parcels ({pendingParcels.length})
            </CardTitle>
            <CardDescription>Parcels logged at Gate 1 holding locker</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {pendingParcels.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No pending locker parcels waiting at Gate.
              </div>
            ) : (
              pendingParcels.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/15 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold">Flat {p.unit} ({p.recipientName})</h4>
                    <p className="text-[10px] text-muted-foreground">{p.courier} • Spot: {p.location}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Logged: {p.receivedAt ? new Date(p.receivedAt).toLocaleDateString() : "N/A"} {p.receivedAt ? new Date(p.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</p>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold">
                    OTP: {p.otp}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
