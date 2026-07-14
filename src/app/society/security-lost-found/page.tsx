"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Trophy, Check, X, ShieldAlert, Clock, MapPin, Calendar, ClipboardList, CheckCircle2, User, Phone, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecurityLostFoundPage() {
  const { user, initialize } = useAuth();
  const {
    lostFoundItems, lostReports, itemMatches, verifyFoundItem, rejectFoundItem, approveClaim, rejectClaim, pickupItem, confirmMatch, rejectMatch, handoverMatchedItem, fetchLostReports, fetchMatches, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      lostFoundItems: state.lostFoundItems || [],
      lostReports: state.lostReports || [],
      itemMatches: state.itemMatches || [],
      verifyFoundItem: state.verifyFoundItem,
      rejectFoundItem: state.rejectFoundItem,
      approveClaim: state.approveClaim,
      rejectClaim: state.rejectClaim,
      pickupItem: state.pickupItem,
      confirmMatch: state.confirmMatch,
      rejectMatch: state.rejectMatch,
      handoverMatchedItem: state.handoverMatchedItem,
      fetchLostReports: state.fetchLostReports,
      fetchMatches: state.fetchMatches,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  
  // Dialog Handover State
  const [showHandoverDialog, setShowHandoverDialog] = useState(false);
  const [selectedClaimForHandover, setSelectedClaimForHandover] = useState<any>(null);
  const [collectedBy, setCollectedBy] = useState("");
  const [verifiedBySecurity, setVerifiedBySecurity] = useState("");
  const [resolving, setResolving] = useState(false);

  // Lost Match Handover State
  const [showLostHandoverDialog, setShowLostHandoverDialog] = useState(false);
  const [selectedMatchForHandover, setSelectedMatchForHandover] = useState<any>(null);
  const [lostCollectedBy, setLostCollectedBy] = useState("");
  const [lostVerifiedBy, setLostVerifiedBy] = useState("");
  const [lostResolving, setLostResolving] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    fetchLostReports();
    fetchMatches();
    setMounted(true);
  }, [initialize, initializeDb, fetchLostReports, fetchMatches]);

  useEffect(() => {
    if (user?.name) {
      setVerifiedBySecurity(user.name);
      setLostVerifiedBy(user.name);
    }
  }, [user]);

  if (!mounted) return null;

  const societyItems = lostFoundItems.filter(item => item.portal === "society");

  const filteredItems = societyItems.filter(item => {
    return item.category.toLowerCase().includes(search.toLowerCase()) ||
           item.description.toLowerCase().includes(search.toLowerCase()) ||
           item.foundLocation.toLowerCase().includes(search.toLowerCase());
  });

  // Categorize items by status
  const pendingItems = filteredItems.filter(item => item.status === "Pending Verification");
  
  // Claims: items with status 'Claim Pending Verification' or items that have claims in pending status
  const activeClaimsItems = filteredItems.filter(item => 
    item.status === "Claim Pending Verification" && item.claims?.some(c => c.status === "Claim Pending Verification")
  );

  // Ready for pickup items (Approved claims or Confirmed matches ready for handover)
  const pickupItems = filteredItems.filter(item => item.status === "Ready for Pickup" || item.status === "Owner Identified");

  // Historical registry
  const historyItems = filteredItems.filter(item => 
    item.status === "Returned" || item.status === "Rejected" || item.status === "Available for Claim"
  );

  // Lost reports and smart matches
  const activeLostReports = lostReports.filter(r => r.status !== "Returned" && r.status !== "Closed");
  const suggestedMatches = itemMatches.filter(m => m.status === "Suggested");
  const confirmedMatches = itemMatches.filter(m => m.status === "Confirmed" && m.collectionDate);

  const handleVerify = async (id: string) => {
    if (confirm("Verify that you have received this item at the security gate desk? It will be published to the community board.")) {
      await verifyFoundItem(id);
      alert("Item verified and published successfully!");
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("Are you sure you want to reject this report? This item will not be published.")) {
      await rejectFoundItem(id);
      alert("Report rejected.");
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    if (confirm("Approve this claim? The resident will be notified to collect the item.")) {
      await approveClaim(claimId);
      alert("Claim approved! Status updated to Ready for Pickup.");
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    if (confirm("Are you sure you want to reject this claim?")) {
      await rejectClaim(claimId);
      alert("Claim rejected.");
    }
  };

  const openHandover = (claim: any, item: any) => {
    setSelectedClaimForHandover({ claim, item });
    setCollectedBy(claim.residentName);
    setShowHandoverDialog(true);
  };

  const handleHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForHandover || !collectedBy || !verifiedBySecurity) return;

    setResolving(true);
    try {
      await pickupItem(
        selectedClaimForHandover.claim.id,
        collectedBy,
        verifiedBySecurity
      );
      setShowHandoverDialog(false);
      setSelectedClaimForHandover(null);
      alert("Item successfully marked as Returned and logged in history.");
    } catch (err) {
      alert("Failed to complete handover.");
    } finally {
      setResolving(false);
    }
  };

  const handleConfirmMatch = async (matchId: string) => {
    if (confirm("Confirm this match? The lost item and found item will be linked and the resident will be notified to collect it.")) {
      await confirmMatch(matchId, user?.name || "Security");
      alert("Match confirmed successfully! Resident has been notified.");
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    if (confirm("Are you sure you want to reject this match suggestion?")) {
      await rejectMatch(matchId);
      alert("Match suggestion rejected.");
    }
  };

  const openLostHandover = (match: any) => {
    setSelectedMatchForHandover(match);
    setLostCollectedBy(match.lostReport.residentName);
    setShowLostHandoverDialog(true);
  };

  const handleLostHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForHandover || !lostCollectedBy || !lostVerifiedBy) return;

    setLostResolving(true);
    try {
      await handoverMatchedItem(
        selectedMatchForHandover.id,
        lostCollectedBy,
        lostVerifiedBy
      );
      setShowLostHandoverDialog(false);
      setSelectedMatchForHandover(null);
      alert("Item successfully handed over back to the lost reporter!");
    } catch (err) {
      alert("Failed to complete handover.");
    } finally {
      setLostResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Lost & Found Desk Registry 🔍
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage society lost-and-found items, verify handovers, and resolve ownership claims.
          </p>
        </div>
      </div>

      {/* Global Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search items by category, keyword, or found location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl h-11 text-xs"
        />
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-secondary/40 border border-border/30 p-1 rounded-xl h-11 w-full sm:w-auto overflow-x-auto flex">
          <TabsTrigger value="pending" className="rounded-lg text-xs font-semibold px-4 h-9">Pending Verification ({pendingItems.length})</TabsTrigger>
          <TabsTrigger value="lost-reports" className="rounded-lg text-xs font-semibold px-4 h-9">Lost Item Reports ({activeLostReports.length})</TabsTrigger>
          <TabsTrigger value="claims" className="rounded-lg text-xs font-semibold px-4 h-9">Claim Requests ({activeClaimsItems.length})</TabsTrigger>
          <TabsTrigger value="matches" className="rounded-lg text-xs font-semibold px-4 h-9">Possible Matches ({suggestedMatches.length})</TabsTrigger>
          <TabsTrigger value="pickup" className="rounded-lg text-xs font-semibold px-4 h-9">Ready for Pickup ({pickupItems.length})</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-xs font-semibold px-4 h-9">Permanent History ({historyItems.length + confirmedMatches.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Pending Verification */}
        <TabsContent value="pending" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-500" />
                Awaiting Gate Deposit & Verification
              </CardTitle>
              <CardDescription>Items reported by residents that need to be physically verified at the desk.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {pendingItems.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No pending found item reports needing verification.
                </div>
              ) : (
                pendingItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-border/60 bg-secondary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{item.category}</span>
                        <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold">
                          Pending Verification
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Reporter: {item.reporterName}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Found: {item.foundLocation}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date: {item.dateFound}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Time: {item.timeFound}</span>
                      </div>
                      {item.additionalNotes && (
                        <p className="text-[10px] text-amber-600 bg-amber-500/5 px-2.5 py-1 rounded-lg w-fit border border-amber-500/10 mt-1">
                          <strong>Notes:</strong> {item.additionalNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0 md:self-center">
                      <Button
                        size="sm"
                        onClick={() => handleVerify(item.id)}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 text-xs font-semibold px-4"
                      >
                        Verify & Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(item.id)}
                        className="text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-xl h-9 text-xs font-semibold px-3"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Claim Requests */}
        {/* Tab: Lost Item Reports */}
        <TabsContent value="lost-reports" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-500" />
                Resident Lost Item Reports
              </CardTitle>
              <CardDescription>Missing items reported by residents. The system automatically searches for suggested matches.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {activeLostReports.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No active lost item reports filed.
                </div>
              ) : (
                activeLostReports.map((report) => (
                  <div key={report.id} className="p-4 rounded-xl border border-border/60 bg-secondary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{report.itemName}</span>
                        <Badge className={`text-[9px] font-bold ${
                          report.status === "Searching" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          report.status === "Possible Match Found" ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" :
                          report.status === "Matched" ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{report.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Reporter: {report.residentName} (Flat {report.flatNumber})</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Last Seen: {report.lastSeenLocation}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date Lost: {report.dateLost}</span>
                        {report.timeLost && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Time: {report.timeLost}</span>}
                      </div>
                      {report.distinguishingFeatures && (
                        <p className="text-[10px] text-indigo-600 bg-indigo-500/5 px-2.5 py-1 rounded-lg w-fit border border-indigo-500/10 mt-1">
                          <strong>Distinguishing Features:</strong> {report.distinguishingFeatures}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Possible Matches */}
        <TabsContent value="matches" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-500" />
                Intelligent Smart Matches Suggested
              </CardTitle>
              <CardDescription>Review matching lost reports and found items side-by-side. Confirm to notify the resident.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {suggestedMatches.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No possible smart match suggestions.
                </div>
              ) : (
                suggestedMatches.map((match) => (
                  <div key={match.id} className="p-4 rounded-xl border border-border/60 bg-secondary/5 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Lost Report Card */}
                      <div className="p-3 bg-card border rounded-lg space-y-2">
                        <div className="text-[10px] uppercase font-bold text-indigo-500">Lost Report Details</div>
                        <div className="font-bold text-xs text-foreground">{match.lostReport?.itemName}</div>
                        <div className="text-[11px] text-muted-foreground">{match.lostReport?.description}</div>
                        <div className="text-[10px] text-muted-foreground space-y-0.5">
                          <div><strong>Category:</strong> {match.lostReport?.category}</div>
                          {match.lostReport?.brand && <div><strong>Brand:</strong> {match.lostReport.brand}</div>}
                          {match.lostReport?.colour && <div><strong>Colour:</strong> {match.lostReport.colour}</div>}
                          <div><strong>Last Seen:</strong> {match.lostReport?.lastSeenLocation} on {match.lostReport?.dateLost}</div>
                          <div><strong>Reporter:</strong> {match.lostReport?.residentName} (Flat {match.lostReport?.flatNumber})</div>
                        </div>
                      </div>

                      {/* Found Item Card */}
                      <div className="p-3 bg-card border rounded-lg space-y-2">
                        <div className="text-[10px] uppercase font-bold text-emerald-500">Found Item Details</div>
                        <div className="font-bold text-xs text-foreground">{match.foundItem?.category} found at {match.foundItem?.foundLocation}</div>
                        <div className="text-[11px] text-muted-foreground">{match.foundItem?.description}</div>
                        <div className="text-[10px] text-muted-foreground space-y-0.5">
                          <div><strong>Category:</strong> {match.foundItem?.category}</div>
                          {match.foundItem?.brand && <div><strong>Brand:</strong> {match.foundItem.brand}</div>}
                          {match.foundItem?.colour && <div><strong>Colour:</strong> {match.foundItem.colour}</div>}
                          <div><strong>Found:</strong> {match.foundItem?.foundLocation} on {match.foundItem?.dateFound}</div>
                          <div><strong>Deposited by:</strong> {match.foundItem?.reporterName}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                      <Button
                        size="sm"
                        onClick={() => handleConfirmMatch(match.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-8 text-[10px] font-bold px-4 shadow"
                      >
                        Match Item
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectMatch(match.id)}
                        className="text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-xl h-8 text-[10px] font-bold px-3"
                      >
                        Reject Match
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                Active Ownership Claim Requests
              </CardTitle>
              <CardDescription>Verify resident identity, details, and matching characteristics before approval.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {activeClaimsItems.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No active claim requests submitted.
                </div>
              ) : (
                activeClaimsItems.map((item) => {
                  const pendingClaims = item.claims?.filter(c => c.status === "Claim Pending Verification") || [];
                  return (
                    <div key={item.id} className="p-4 rounded-xl border border-border/60 bg-secondary/5 space-y-4">
                      {/* Found Item Details */}
                      <div className="border-b pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">FOUND ITEM</span>
                            <span className="font-bold text-sm text-foreground">{item.category}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                            Ref: {item.id}
                          </span>
                        </div>
                      </div>

                      {/* Claims list for this item */}
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Submitted Claims ({pendingClaims.length})</span>
                        {pendingClaims.map((claim) => (
                          <div key={claim.id} className="p-3.5 rounded-xl border border-border bg-card grid md:grid-cols-12 gap-4">
                            <div className="md:col-span-8 space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-xs flex items-center gap-1 text-foreground">
                                  <User className="w-3.5 h-3.5 text-muted-foreground" /> {claim.residentName}
                                </span>
                                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                  Resident (Flat ID Claim)
                                </span>
                              </div>

                              <div className="text-[11px] text-muted-foreground space-y-1">
                                <div><strong>Reason for claim:</strong> &quot;{claim.claimReason}&quot;</div>
                                {claim.itemDetails && (
                                  <div><strong>Characteristics / Proof details:</strong> {claim.itemDetails}</div>
                                )}
                                {claim.contactNumber && (
                                  <div className="flex items-center gap-1 text-primary mt-1 font-semibold">
                                    <Phone className="w-3 h-3" /> {claim.contactNumber}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="md:col-span-4 flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveClaim(claim.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-8 text-[10px] font-bold px-3 shadow"
                              >
                                Approve Claim
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectClaim(claim.id)}
                                className="text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-xl h-8 text-[10px] font-bold px-2.5"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Ready for Pickup */}
        <TabsContent value="pickup" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                Approved Items Awaiting Handover
              </CardTitle>
              <CardDescription>Claims verified. Hand over the items and log recipient verification details below.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {pickupItems.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No items currently approved and waiting to be collected.
                </div>
              ) : (
                pickupItems.map((item) => {
                  if (item.status === "Owner Identified") {
                    const matchedInfo = itemMatches.find(m => m.foundItemId === item.id && m.status === "Confirmed");
                    if (!matchedInfo) return null;
                    return (
                      <div key={item.id} className="p-4 rounded-xl border border-border/60 bg-secondary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{item.category} (Matched Lost Report)</span>
                            <Badge className="bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[9px] font-bold">
                              Owner Identified
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                          
                          <div className="p-2.5 rounded-lg bg-card border border-purple-500/10 text-[11px] text-muted-foreground space-y-0.5">
                            <div><strong>Matched Owner:</strong> {matchedInfo.lostReport?.residentName}</div>
                            <div><strong>Lost Item Description:</strong> {matchedInfo.lostReport?.description}</div>
                            {matchedInfo.lostReport?.distinguishingFeatures && <div><strong>Features:</strong> {matchedInfo.lostReport.distinguishingFeatures}</div>}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          <Button
                            size="sm"
                            onClick={() => openLostHandover(matchedInfo)}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 text-xs font-semibold px-4 shadow-sm"
                          >
                            Mark as Returned
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  const approvedClaim = item.claims?.find(c => c.status === "Ready for Pickup");
                  if (!approvedClaim) return null;
                  return (
                    <div key={item.id} className="p-4 rounded-xl border border-border/60 bg-secondary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{item.category}</span>
                          <Badge className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[9px] font-bold">
                            Ready for Pickup
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        
                        <div className="p-2.5 rounded-lg bg-card border border-indigo-500/10 text-[11px] text-muted-foreground space-y-0.5">
                          <div><strong>Approved Claimant:</strong> {approvedClaim.residentName}</div>
                          <div><strong>Claim Details:</strong> {approvedClaim.claimReason}</div>
                          {approvedClaim.contactNumber && <div><strong>Contact:</strong> {approvedClaim.contactNumber}</div>}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        <Button
                          size="sm"
                          onClick={() => openHandover(approvedClaim, item)}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 text-xs font-semibold px-4 shadow-sm"
                        >
                          Mark as Returned
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: History */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                Permanent Audit History & Log
              </CardTitle>
              <CardDescription>Permanent archives of all cataloged society found items, verifications, claims, and resolutions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {historyItems.length === 0 && confirmedMatches.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No items logged in history.
                </div>
              ) : (
                <>
                  {historyItems.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-secondary/5 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs">{item.category}</span>
                          <Badge className={`text-[9px] font-bold ${
                            item.status === "Returned" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                            item.status === "Rejected" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                            "bg-secondary text-foreground"
                          }`}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground mt-1.5">
                          <span>Reporter: {item.reporterName}</span>
                          <span>Location: {item.foundLocation}</span>
                          <span>Date Found: {item.dateFound}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-muted-foreground md:text-right shrink-0">
                        {item.status === "Returned" && (
                          (() => {
                            const returnedClaim = item.claims?.find(c => c.status === "Returned");
                            return (
                              <div className="space-y-0.5 font-medium">
                                <div className="text-emerald-600 font-bold">Returned Successfully</div>
                                <div>Recipient: {returnedClaim?.collectedBy || returnedClaim?.residentName}</div>
                                <div>Date: {returnedClaim?.collectionDate ? new Date(returnedClaim.collectionDate).toLocaleDateString() : ""}</div>
                                <div>Verified by: {returnedClaim?.verifiedBySecurity || "Security"}</div>
                              </div>
                            );
                          })()
                        )}
                        {item.status === "Rejected" && (
                          <div className="text-red-500 font-semibold">Report Rejected by Security</div>
                        )}
                        {item.status === "Available for Claim" && (
                          <div className="text-blue-500 font-medium">Currently Available (Awaiting Claims)</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {confirmedMatches.map((match) => (
                    <div key={match.id} className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-secondary/5 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs">{match.lostReport?.itemName} (Smart Match Return)</span>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold">
                            Returned
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{match.lostReport?.description}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground mt-1.5">
                          <span>Owner: {match.lostReport?.residentName}</span>
                          <span>Last Seen: {match.lostReport?.lastSeenLocation}</span>
                          <span>Date Lost: {match.lostReport?.dateLost}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-muted-foreground md:text-right shrink-0">
                        <div className="space-y-0.5 font-medium">
                          <div className="text-emerald-600 font-bold">Returned Successfully</div>
                          <div>Recipient: {match.collectedBy || match.lostReport?.residentName}</div>
                          <div>Date: {match.collectionDate ? new Date(match.collectionDate).toLocaleDateString() : ""}</div>
                          <div>Verified by: {match.verifiedBy || "Security"}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Handover Dialog Form */}
      <Dialog open={showHandoverDialog} onOpenChange={setShowHandoverDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Log Physical Handover</DialogTitle>
            <DialogDescription>
              Verify the recipient is physically present at the desk before submitting.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleHandoverSubmit} className="space-y-4 mt-2">
            {selectedClaimForHandover && (
              <div className="p-3 bg-secondary/30 rounded-xl text-xs space-y-1">
                <div className="font-bold text-foreground">Item: {selectedClaimForHandover.item.category}</div>
                <div className="text-muted-foreground">Description: {selectedClaimForHandover.item.description}</div>
                <div className="text-muted-foreground">Claimant: {selectedClaimForHandover.claim.residentName}</div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Handed Over To / Collected By</label>
              <Input 
                value={collectedBy} 
                onChange={(e) => setCollectedBy(e.target.value)} 
                className="h-10 text-xs rounded-xl" 
                required 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Verified By (Security Officer Name)</label>
              <Input 
                value={verifiedBySecurity} 
                onChange={(e) => setVerifiedBySecurity(e.target.value)} 
                className="h-10 text-xs rounded-xl" 
                required 
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={resolving} className="w-full h-10 gradient-primary text-white border-0 rounded-xl font-semibold text-xs">
                {resolving ? "Logging Handover..." : "Confirm Handover & Resolve"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lost Handover Dialog Form */}
      <Dialog open={showLostHandoverDialog} onOpenChange={setShowLostHandoverDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Log Lost Report Handover</DialogTitle>
            <DialogDescription>
              Verify the recipient is physically present at the desk before submitting handover.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLostHandoverSubmit} className="space-y-4 mt-2">
            {selectedMatchForHandover && (
              <div className="p-3 bg-secondary/30 rounded-xl text-xs space-y-1">
                <div className="font-bold text-foreground">Lost Item: {selectedMatchForHandover.lostReport?.itemName}</div>
                <div className="text-muted-foreground">Category: {selectedMatchForHandover.lostReport?.category}</div>
                <div className="text-muted-foreground">Owner: {selectedMatchForHandover.lostReport?.residentName}</div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Handed Over To / Collected By</label>
              <Input 
                value={lostCollectedBy} 
                onChange={(e) => setLostCollectedBy(e.target.value)} 
                className="h-10 text-xs rounded-xl" 
                required 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Verified By (Security Officer Name)</label>
              <Input 
                value={lostVerifiedBy} 
                onChange={(e) => setLostVerifiedBy(e.target.value)} 
                className="h-10 text-xs rounded-xl" 
                required 
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={lostResolving} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl font-semibold text-xs shadow-md">
                {lostResolving ? "Logging Handover..." : "Confirm Handover & Resolve"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
