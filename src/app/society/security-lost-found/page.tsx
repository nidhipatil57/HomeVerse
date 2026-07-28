"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Check, X, ShieldAlert, Clock, MapPin, Calendar, ClipboardList, CheckCircle2, User, Phone, FileText, HelpCircle, Shield, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecurityLostFoundPage() {
  const { user, initialize } = useAuth();
  const {
    lostFoundItems, lostReports, itemMatches, verifyFoundItem, handoverMatchedItem, suggestBelonging, fetchLostReports, fetchMatches, initializeDb, approveClaim, rejectClaimWithReason, pickupItemWithOtp, verifyLostReport, rejectFoundItemWithReason, rejectLostReport, requestMoreInfoLostReport, requestMoreEvidence
  } = useCommunityStore(
    useShallow((state) => ({
      lostFoundItems: state.lostFoundItems || [],
      lostReports: state.lostReports || [],
      itemMatches: state.itemMatches || [],
      verifyFoundItem: state.verifyFoundItem,
      handoverMatchedItem: state.handoverMatchedItem,
      suggestBelonging: state.suggestBelonging,
      fetchLostReports: state.fetchLostReports,
      fetchMatches: state.fetchMatches,
      initializeDb: state.initializeDb,
      approveClaim: state.approveClaim,
      rejectClaimWithReason: state.rejectClaimWithReason,
      pickupItemWithOtp: state.pickupItemWithOtp,
      verifyLostReport: state.verifyLostReport,
      rejectFoundItemWithReason: state.rejectFoundItemWithReason,
      rejectLostReport: state.rejectLostReport,
      requestMoreInfoLostReport: state.requestMoreInfoLostReport,
      requestMoreEvidence: state.requestMoreEvidence
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  // Rejection Dialog states
  const [showRejectFoundDialog, setShowRejectFoundDialog] = useState(false);
  const [selectedFoundForReject, setSelectedFoundForReject] = useState<string | null>(null);
  const [foundRejectReason, setFoundRejectReason] = useState("");
  const [foundRejectSubmitting, setFoundRejectSubmitting] = useState(false);

  // Claim Rejection Dialog states
  const [showRejectClaimDialog, setShowRejectClaimDialog] = useState(false);
  const [selectedClaimForReject, setSelectedClaimForReject] = useState<string | null>(null);
  const [claimRejectReason, setClaimRejectReason] = useState("");
  const [claimRejectSubmitting, setClaimRejectSubmitting] = useState(false);

  // Request Claim Evidence Dialog states
  const [showReqEvidenceDialog, setShowReqEvidenceDialog] = useState(false);
  const [selectedClaimForEvidence, setSelectedClaimForEvidence] = useState<string | null>(null);
  const [evidenceRequestMsg, setEvidenceRequestMsg] = useState("");
  const [evidenceRequestSubmitting, setEvidenceRequestSubmitting] = useState(false);

  // Claim Handover State (secure collection OTP)
  const [showClaimHandoverDialog, setShowClaimHandoverDialog] = useState(false);
  const [selectedClaimForHandover, setSelectedClaimForHandover] = useState<any>(null);
  const [claimCollectedBy, setClaimCollectedBy] = useState("");
  const [claimVerifiedBy, setClaimVerifiedBy] = useState("");
  const [claimOtp, setClaimOtp] = useState("");
  const [claimResolving, setClaimResolving] = useState(false);

  // Manual Matching Suggestion State
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [selectedReportForSuggestion, setSelectedReportForSuggestion] = useState<any>(null);
  const [selectedFoundItemId, setSelectedFoundItemId] = useState("");
  const [securityNote, setSecurityNote] = useState("");
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    fetchLostReports();
    fetchMatches();
    setMounted(true);
  }, [initialize, initializeDb, fetchLostReports, fetchMatches]);

  useEffect(() => {
    if (user?.name) {
      setClaimVerifiedBy(user.name);
    }
  }, [user]);

  const societyItems = useMemo(() => lostFoundItems.filter(item => item.portal === "society"), [lostFoundItems]);

  const filteredItems = useMemo(() => {
    return societyItems.filter(item => {
      return item.description.toLowerCase().includes(search.toLowerCase()) ||
             item.foundLocation.toLowerCase().includes(search.toLowerCase());
    });
  }, [societyItems, search]);

  const filteredLost = useMemo(() => {
    return lostReports.filter(report => {
      return report.portal === "society" && (
        report.itemName.toLowerCase().includes(search.toLowerCase()) ||
        report.description.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [lostReports, search]);

  // Tab 1: Pending Verification (Found items reported by residents that Security hasn't verified yet)
  const pendingFoundItems = useMemo(() => {
    return filteredItems.filter(item => item.status === "Pending Verification");
  }, [filteredItems]);

  // Tab 2: Published Items (Verified items currently held at Security desk)
  const publishedItems = useMemo(() => {
    return filteredItems.filter(
      item => item.status === "Available" || item.status === "Available for Claim" || item.status === "Claim Pending Verification" || item.status === "Ready for Pickup"
    );
  }, [filteredItems]);

  // Private Lost Alerts for manual matching drawer/list (under Tab 2)
  const privateLostAlerts = useMemo(() => {
    return filteredLost.filter(r => r.status === "Private Alert");
  }, [filteredLost]);

  // Tab 3: Claims (Resident claim requests for published items)
  const activeClaims = useMemo(() => {
    const list: any[] = [];
    publishedItems.forEach(item => {
      if (item.claims && item.claims.length > 0) {
        item.claims.forEach((c: any) => {
          list.push({
            ...c,
            itemDescription: item.description,
            itemFoundLocation: item.foundLocation,
            itemDateFound: item.dateFound,
            itemCategory: item.category,
            foundItem: item
          });
        });
      }
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [publishedItems]);

  // Tab 4: History (Handovers & Rejected logs)
  const confirmedMatches = useMemo(() => itemMatches.filter(m => m.status === "Confirmed" && m.collectionDate), [itemMatches]);
  const returnedClaims = useMemo(() => {
    const list: any[] = [];
    societyItems.forEach(item => {
      if (item.claims) {
        item.claims.forEach((c: any) => {
          if (c.status === "Returned") {
            list.push({ ...c, itemDescription: item.description, reporterName: item.reporterName });
          }
        });
      }
    });
    return list;
  }, [societyItems]);

  const historyLogs = useMemo(() => {
    const list: any[] = [];
    
    confirmedMatches.forEach(m => {
      list.push({
        id: m.id,
        type: "Match Handover",
        itemName: m.lostReport?.itemName || m.foundItem?.description.split(" - ")[0],
        lostDesc: m.lostReport?.description || "N/A",
        foundDesc: m.foundItem?.description || "N/A",
        lostBy: m.lostReport?.residentName || "N/A",
        foundBy: m.foundItem?.reporterName || "N/A",
        dateLost: m.lostReport?.dateLost || "N/A",
        collectionDate: m.collectionDate ? new Date(m.collectionDate).toISOString().split("T")[0] : "N/A",
        collectionTime: m.collectionTime || "N/A",
        verifiedBy: m.verifiedBy,
        photo: m.foundItem?.images?.[0]
      });
    });

    returnedClaims.forEach(claim => {
      list.push({
        id: claim.id,
        type: "Direct Claim Handover",
        itemName: claim.itemDescription.split(" - ")[0],
        lostDesc: "Evidence Claim Request",
        foundDesc: claim.itemDescription,
        lostBy: claim.residentName,
        foundBy: claim.reporterName || "Community Member",
        dateLost: "N/A",
        collectionDate: claim.collectionDate ? new Date(claim.collectionDate).toISOString().split("T")[0] : "N/A",
        collectionTime: claim.collectionTime || "N/A",
        verifiedBy: claim.verifiedBySecurity || "Security Officer",
        photo: claim.proofImage
      });
    });

    return list.sort((a, b) => new Date(b.collectionDate).getTime() - new Date(a.collectionDate).getTime());
  }, [confirmedMatches, returnedClaims]);

  const handleVerify = async (id: string) => {
    if (confirm("Verify that you have physically received this item at the Security Desk?")) {
      await verifyFoundItem(id);
      alert("Item verified and published to the notices board!");
      initializeDb();
      fetchLostReports();
      fetchMatches();
    }
  };

  const handleRejectFoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFoundForReject || !foundRejectReason) return;

    setFoundRejectSubmitting(true);
    try {
      await rejectFoundItemWithReason(selectedFoundForReject, foundRejectReason);
      alert("Found item report rejected successfully.");
      setShowRejectFoundDialog(false);
      setSelectedFoundForReject(null);
      setFoundRejectReason("");
      initializeDb();
      fetchLostReports();
      fetchMatches();
    } catch (err) {
      alert("Failed to reject report.");
    } finally {
      setFoundRejectSubmitting(false);
    }
  };

  const handleRejectClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForReject || !claimRejectReason) return;

    setClaimRejectSubmitting(true);
    try {
      await rejectClaimWithReason(selectedClaimForReject, claimRejectReason);
      alert("Ownership claim rejected.");
      setShowRejectClaimDialog(false);
      setSelectedClaimForReject(null);
      setClaimRejectReason("");
      initializeDb();
      fetchLostReports();
      fetchMatches();
    } catch (err) {
      alert("Failed to reject claim.");
    } finally {
      setClaimRejectSubmitting(false);
    }
  };

  const handleReqEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForEvidence || !evidenceRequestMsg) return;

    setEvidenceRequestSubmitting(true);
    try {
      await requestMoreEvidence(selectedClaimForEvidence, evidenceRequestMsg);
      alert("Resident notified of more evidence request!");
      setShowReqEvidenceDialog(false);
      setSelectedClaimForEvidence(null);
      setEvidenceRequestMsg("");
      initializeDb();
      fetchLostReports();
      fetchMatches();
    } catch (err) {
      alert("Failed to request evidence.");
    } finally {
      setEvidenceRequestSubmitting(false);
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    if (confirm("Approve this claim? This will generate a Collection OTP for the resident.")) {
      try {
        await approveClaim(claimId);
        alert("Claim approved! The resident is notified and must present their Collection OTP at the desk.");
        initializeDb();
        fetchLostReports();
        fetchMatches();
      } catch (err) {
        alert("Failed to approve claim.");
      }
    }
  };

  const openClaimHandover = (claim: any) => {
    setSelectedClaimForHandover(claim);
    setClaimCollectedBy(claim.residentName);
    setClaimOtp("");
    setShowClaimHandoverDialog(true);
  };

  const handleClaimHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForHandover || !claimCollectedBy || !claimVerifiedBy || !claimOtp) {
      alert("All fields including Collection OTP are mandatory!");
      return;
    }

    setClaimResolving(true);
    try {
      await pickupItemWithOtp(selectedClaimForHandover.id, claimOtp, claimCollectedBy, claimVerifiedBy);
      alert("Handover logged successfully! Item status resolved to Returned.");
      setShowClaimHandoverDialog(false);
      setSelectedClaimForHandover(null);
      setClaimOtp("");
      fetchLostReports();
      fetchMatches();
      initializeDb();
    } catch (err) {
      alert("Handover failed. Please check that the OTP matches the one generated on the resident's portal.");
    } finally {
      setClaimResolving(false);
    }
  };

  const openSuggestModal = (report: any) => {
    setSelectedReportForSuggestion(report);
    setSelectedFoundItemId("");
    setSecurityNote("");
    setShowSuggestModal(true);
  };

  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportForSuggestion || !selectedFoundItemId) {
      alert("Please select a verified found item to suggest!");
      return;
    }

    setSubmittingSuggestion(true);
    try {
      await suggestBelonging(selectedReportForSuggestion.id, selectedFoundItemId, securityNote);
      alert("Matching suggestion sent to the resident!");
      setShowSuggestModal(false);
      setSelectedReportForSuggestion(null);
      setSelectedFoundItemId("");
      setSecurityNote("");
      fetchLostReports();
      fetchMatches();
    } catch (err) {
      console.error(err);
      alert("Failed to send suggestion.");
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  const renderEvidence = (evidenceStr: string | undefined) => {
    if (!evidenceStr) return <span className="text-muted-foreground text-xs block italic mt-1">No detailed questionnaire evidence submitted.</span>;
    try {
      const evidence = JSON.parse(evidenceStr);
      return (
        <div className="space-y-2 text-xs text-left p-3.5 bg-secondary/35 rounded-xl border border-border/40 mt-2">
          <div className="font-bold text-[10px] uppercase text-indigo-600 tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-indigo-500" /> Evidence Questionnaire Answers:
          </div>
          {evidence.descriptionDetail && <p><strong>Detailed Description:</strong> {evidence.descriptionDetail}</p>}
          {evidence.timeLost && <p><strong>Approx Date Lost:</strong> {evidence.timeLost}</p>}
          {evidence.lastLocation && <p><strong>Last Seen Location:</strong> {evidence.lastLocation}</p>}
          {evidence.marks && <p><strong>Identifying Marks:</strong> {evidence.marks}</p>}

          {/* Conditional Category details */}
          {evidence.electronics && (evidence.electronics.brand || evidence.electronics.model) && (
            <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
              <span className="font-bold text-foreground text-[9px] uppercase text-indigo-600">Electronics:</span>
              <p><strong>Brand/Model:</strong> {evidence.electronics.brand} {evidence.electronics.model}</p>
              {evidence.electronics.colour && <p><strong>Colour:</strong> {evidence.electronics.colour}</p>}
              {evidence.electronics.serialNumber && <p><strong>Serial/IMEI:</strong> {evidence.electronics.serialNumber}</p>}
              {evidence.electronics.lockScreen && <p><strong>Lockscreen Wallpaper:</strong> {evidence.electronics.lockScreen}</p>}
              {evidence.electronics.case && <p><strong>Case Cover:</strong> {evidence.electronics.case}</p>}
            </div>
          )}

          {evidence.wallet && (evidence.wallet.colour || evidence.wallet.brand) && (
            <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
              <span className="font-bold text-foreground text-[9px] uppercase text-indigo-600">Wallet/Bag/Docs:</span>
              <p><strong>Wallet Details:</strong> {evidence.wallet.colour} {evidence.wallet.brand}</p>
              {evidence.wallet.cards && <p><strong>Cards Inside:</strong> {evidence.wallet.cards}</p>}
            </div>
          )}

          {evidence.keys && (evidence.keys.count || evidence.keys.keychain) && (
            <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
              <span className="font-bold text-foreground text-[9px] uppercase text-indigo-600">Keys:</span>
              <p><strong>Key Count:</strong> {evidence.keys.count} ({evidence.keys.type} Key)</p>
              {evidence.keys.keychain && <p><strong>Keychain Description:</strong> {evidence.keys.keychain}</p>}
            </div>
          )}

          {evidence.jewelry && (evidence.jewelry.material || evidence.jewelry.design) && (
            <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
              <span className="font-bold text-foreground text-[9px] uppercase text-indigo-600">Jewelry:</span>
              <p><strong>Material:</strong> {evidence.jewelry.material} (Size: {evidence.jewelry.size})</p>
              {evidence.jewelry.design && <p><strong>Design/Markings:</strong> {evidence.jewelry.design}</p>}
            </div>
          )}
        </div>
      );
    } catch (e) {
      return <span className="text-muted-foreground text-xs font-semibold">Error parsing evidence data.</span>;
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Lost & Found Officer Console 🛡️
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage found items, cross-reference private alerts, and process claims.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs shrink-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search descriptions/locations..." 
            className="pl-9 h-10 text-xs rounded-xl" 
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary/40 border border-border/30 p-1 rounded-xl h-11 flex overflow-x-auto gap-0.5 max-w-full">
          <TabsTrigger value="pending" className="rounded-lg text-xs font-semibold px-4 h-9">Pending Verification ({pendingFoundItems.length})</TabsTrigger>
          <TabsTrigger value="published" className="rounded-lg text-xs font-semibold px-4 h-9">Published Items ({publishedItems.length})</TabsTrigger>
          <TabsTrigger value="claims" className="rounded-lg text-xs font-semibold px-4 h-9">Claims ({activeClaims.length})</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-xs font-semibold px-4 h-9">History ({historyLogs.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Pending Verification */}
        <TabsContent value="pending" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Awaiting Verification Queue
              </CardTitle>
              <CardDescription>Items reported by residents that have not been physically logged or verified at the Security Desk.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {pendingFoundItems.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No found items awaiting verification.
                </div>
              ) : (
                pendingFoundItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-border/60 bg-secondary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                    <div className="flex gap-4 items-center text-left">
                      {item.images?.[0] && (
                        <img src={item.images[0]} alt="Found Item" className="w-16 h-16 object-cover rounded-lg border border-border/40 shrink-0" />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{item.description.split(" - ")[0]}</span>
                          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] font-bold">
                            Pending Verification
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{item.description.split(" - ").slice(1).join(" - ")}</p>
                        <div className="grid grid-cols-2 gap-x-4 text-[10px] text-muted-foreground">
                          <span>📍 <strong>Found At:</strong> {item.foundLocation}</span>
                          <span>📅 <strong>Reported:</strong> {item.dateFound}</span>
                          <span>👤 <strong>Finder:</strong> {item.reporterName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <Button
                        size="sm"
                        onClick={() => handleVerify(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-9 shrink-0 px-3 flex items-center gap-1 border-0"
                      >
                        <Check className="w-4 h-4" /> Verify & Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedFoundForReject(item.id);
                          setFoundRejectReason("");
                          setShowRejectFoundDialog(true);
                        }}
                        className="text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-xl text-xs font-semibold h-9 shrink-0 px-3 flex items-center gap-1"
                      >
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Published Items + Private Alerts Split Layout */}
        <TabsContent value="published" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side: Published Items List */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border/50">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-indigo-500" />
                    Published / Held at Security Desk
                  </CardTitle>
                  <CardDescription>Verified items currently held in storage at the gate desk. Residents can see these.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {publishedItems.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground text-xs">
                      No published items currently held.
                    </div>
                  ) : (
                    publishedItems.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-border/60 bg-secondary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                        <div className="flex gap-4 items-center text-left">
                          {item.images?.[0] && (
                            <img src={item.images[0]} alt="Published Item" className="w-14 h-14 object-cover rounded-lg border border-border/40 shrink-0" />
                          )}
                          <div className="space-y-1">
                            <div className="font-bold text-sm text-foreground">{item.description.split(" - ")[0]}</div>
                            <p className="text-muted-foreground">{item.description.split(" - ").slice(1).join(" - ")}</p>
                            <div className="grid grid-cols-2 gap-x-4 text-[10px] text-muted-foreground">
                              <span>📍 <strong>Location:</strong> {item.foundLocation}</span>
                              <span>📅 <strong>Logged:</strong> {item.dateFound}</span>
                              <span>📦 <strong>Category:</strong> {item.category}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider">
                            Held at Desk
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right side: Private Lost Alerts Panel */}
            <div className="space-y-4">
              <Card className="border-border/50 bg-secondary/10">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    Private Lost Alerts ({privateLostAlerts.length})
                  </CardTitle>
                  <CardDescription className="text-[11px]">Private notifications reported by residents. Security can suggest matching items.</CardDescription>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  {privateLostAlerts.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-[11px]">
                      No private lost alerts logged.
                    </div>
                  ) : (
                    privateLostAlerts.map((report) => (
                      <div key={report.id} className="p-3 rounded-xl border border-border bg-card text-xs text-left space-y-1.5 shadow-sm">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-foreground text-xs">{report.itemName}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground">Flat {report.flatNumber}</span>
                        </div>
                        <p className="text-muted-foreground text-[11px] line-clamp-2">&quot;{report.description}&quot;</p>
                        <div className="text-[10px] text-muted-foreground space-y-0.5 pt-1 border-t border-border/40">
                          <div>📍 <strong>Last seen:</strong> {report.lastSeenLocation}</div>
                          <div>📅 <strong>Lost date:</strong> {report.dateLost}</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => openSuggestModal(report)}
                          className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] h-7 font-bold border-0"
                        >
                          Suggest Match
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Claims */}
        <TabsContent value="claims" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                Resident Ownership Claims
              </CardTitle>
              <CardDescription>Residents claiming possession of published items. Verify details and approve for desk pickup.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {activeClaims.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No active ownership claims to review.
                </div>
              ) : (
                activeClaims.map((claim) => (
                  <div key={claim.id} className="p-4 rounded-xl border border-border/60 bg-secondary/5 flex flex-col md:flex-row justify-between items-start gap-4 text-xs">
                    <div className="space-y-2 flex-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          {claim.itemDescription.split(" - ")[0]}
                        </span>
                        <Badge className={`text-[9px] font-bold ${
                          claim.status === "Claim Pending Verification" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                          claim.status === "More Evidence Required" ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" :
                          claim.status === "Ready for Pickup" ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {claim.status === "Claim Pending Verification" ? "Pending Verification" : claim.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span>👤 <strong>Claimant:</strong> {claim.residentName}</span>
                        <span>📞 <strong>Contact:</strong> {claim.contactNumber || "N/A"}</span>
                        <span>📅 <strong>Claimed on:</strong> {new Date(claim.createdAt).toLocaleDateString()}</span>
                      </div>

                      {claim.claimReason && (
                        <p className="text-muted-foreground text-xs pt-1">
                          <strong>Reason / Lockscreen / Description:</strong> &quot;{claim.claimReason}&quot;
                        </p>
                      )}

                      {/* Display Questionnaires */}
                      {renderEvidence(claim.evidence)}

                      {claim.proofImage && (
                        <div className="pt-2">
                          <a href={claim.proofImage} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold text-[11px]">
                            <FileText className="w-3.5 h-3.5" /> View Uploaded Photo Proof
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-44 shrink-0 justify-center">
                      {claim.status === "Claim Pending Verification" && (
                        <>
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => handleApproveClaim(claim.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold h-9 w-full border-0"
                          >
                            Approve Claim
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setSelectedClaimForEvidence(claim.id);
                              setEvidenceRequestMsg("");
                              setShowReqEvidenceDialog(true);
                            }}
                            className="bg-purple-600/5 hover:bg-purple-600/15 text-purple-600 border border-purple-600/20 rounded-xl text-xs font-semibold h-9 w-full"
                          >
                            Request More Evidence
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setSelectedClaimForReject(claim.id);
                              setClaimRejectReason("");
                              setShowRejectClaimDialog(true);
                            }}
                            className="text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-xl text-xs font-semibold h-9 w-full"
                          >
                            Reject Claim
                          </Button>
                        </>
                      )}

                      {claim.status === "More Evidence Required" && (
                        <div className="text-center p-2 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[10px] text-purple-600 font-semibold">
                          Awaiting resident details...
                        </div>
                      )}

                      {claim.status === "Ready for Pickup" && (
                        <Button
                          size="sm"
                          type="button"
                          onClick={() => openClaimHandover(claim)}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 w-full border-0 flex items-center justify-center gap-1.5"
                        >
                          <Key className="w-4 h-4 shrink-0" />
                          Log Handover (Verify OTP)
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: History */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Handover Audit Logs
              </CardTitle>
              <CardDescription>Archived records of successfully returned or resolved items.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {historyLogs.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No historical handover logs.
                </div>
              ) : (
                historyLogs.map((log, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/60 bg-secondary/5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold">
                    <div className="flex gap-4 items-center text-left">
                      {log.photo && (
                        <img src={log.photo} alt="Historical Item" className="w-16 h-16 object-cover rounded-lg border border-border/40 shrink-0" />
                      )}
                      <div className="space-y-1 font-normal">
                        <div className="font-bold text-sm text-foreground">
                          {log.itemName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          <strong>Type:</strong> {log.type}<br/>
                          <strong>Lost Report:</strong> {log.lostDesc}<br/>
                          <strong>Found Item:</strong> {log.foundDesc}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground pt-1">
                          <span>👤 <strong>Claimed By:</strong> {log.lostBy}</span>
                          <span>🔍 <strong>Found By:</strong> {log.foundBy}</span>
                          <span>🤝 <strong>Returned:</strong> {log.collectionDate} at {log.collectionTime}</span>
                          <span className="sm:col-span-2">🛡️ <strong>Security Handover Officer:</strong> {log.verifiedBy}</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
                        Returned
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Found Report Dialog */}
      <Dialog open={showRejectFoundDialog} onOpenChange={setShowRejectFoundDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Reject Found Report</DialogTitle>
            <DialogDescription className="text-xs">
              State the reason for rejecting this found item report.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRejectFoundSubmit} className="space-y-4 mt-2 text-xs">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Rejection Reason *</label>
              <Textarea 
                placeholder="Explain why this found item report is invalid (e.g. Insufficient details, duplicate)..." 
                value={foundRejectReason} 
                onChange={(e: any) => setFoundRejectReason(e.target.value)} 
                className="min-h-[80px] rounded-xl text-xs" 
                required 
              />
            </div>
            <DialogFooter className="mt-4 pt-3 border-t border-border/40">
              <Button type="submit" disabled={foundRejectSubmitting} className="w-full h-10 bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl font-semibold shadow-md">
                {foundRejectSubmitting ? "Rejecting..." : "Confirm Reject Report"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject Claim Dialog */}
      <Dialog open={showRejectClaimDialog} onOpenChange={setShowRejectClaimDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Reject Ownership Claim</DialogTitle>
            <DialogDescription className="text-xs">
              State the reason for rejecting the ownership claim request.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRejectClaimSubmit} className="space-y-4 mt-2 text-xs">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Rejection Reason *</label>
              <Textarea 
                placeholder="e.g. Wrong color mentioned, serial number mismatch, did not provide enough evidence..." 
                value={claimRejectReason} 
                onChange={(e: any) => setClaimRejectReason(e.target.value)} 
                className="min-h-[80px] rounded-xl text-xs" 
                required 
              />
            </div>
            <DialogFooter className="mt-4 pt-3 border-t border-border/40">
              <Button type="submit" disabled={claimRejectSubmitting} className="w-full h-10 bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl font-semibold shadow-md">
                {claimRejectSubmitting ? "Rejecting Claim..." : "Confirm Reject Claim"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Request More Evidence Dialog */}
      <Dialog open={showReqEvidenceDialog} onOpenChange={setShowReqEvidenceDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Request More Evidence</DialogTitle>
            <DialogDescription className="text-xs">
              State what additional evidence or photos you need from the claimant.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReqEvidenceSubmit} className="space-y-4 mt-2 text-xs">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Evidence Required Message *</label>
              <Textarea 
                placeholder="e.g. Please upload purchase receipt, photo of lockscreen, or specify contents details..." 
                value={evidenceRequestMsg} 
                onChange={(e: any) => setEvidenceRequestMsg(e.target.value)} 
                className="min-h-[80px] rounded-xl text-xs" 
                required 
              />
            </div>
            <DialogFooter className="mt-4 pt-3 border-t border-border/40">
              <Button type="submit" disabled={evidenceRequestSubmitting} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl font-semibold shadow-md">
                {evidenceRequestSubmitting ? "Sending Request..." : "Send Evidence Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Claim Handover Dialog Form (OTP secure handover) */}
      <Dialog open={showClaimHandoverDialog} onOpenChange={setShowClaimHandoverDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)] flex items-center gap-1.5 text-base">
              <Shield className="w-5 h-5 text-indigo-500" /> Secure OTP Handover
            </DialogTitle>
            <DialogDescription className="text-xs">
              Verify the claimant is physically present. Enter the 6-digit Collection OTP generated on their portal to finalize return.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleClaimHandoverSubmit} className="space-y-4 mt-2 text-xs">
            {selectedClaimForHandover && (
              <div className="p-3 bg-secondary/35 rounded-xl text-xs space-y-0.5 text-left border">
                <div className="font-bold text-foreground">Claim Ref: {selectedClaimForHandover.id}</div>
                <div className="text-muted-foreground">Claimant: {selectedClaimForHandover.residentName}</div>
                <div className="text-muted-foreground">Item: {selectedClaimForHandover.itemDescription.split(" - ")[0]}</div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Collection OTP (6-digits) *</label>
              <Input 
                placeholder="Enter 6-digit OTP code..." 
                value={claimOtp} 
                onChange={(e) => setClaimOtp(e.target.value)} 
                className="h-10 text-sm font-extrabold tracking-widest text-center rounded-xl border border-indigo-500/40" 
                maxLength={6}
                required 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Collected By (Resident Name) *</label>
              <Input 
                value={claimCollectedBy} 
                onChange={(e) => setClaimCollectedBy(e.target.value)} 
                className="h-10 text-xs rounded-xl" 
                required 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Verified By (Security Officer Name) *</label>
              <Input 
                value={claimVerifiedBy} 
                onChange={(e) => setClaimVerifiedBy(e.target.value)} 
                className="h-10 text-xs rounded-xl" 
                required 
              />
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-border/40">
              <Button type="submit" disabled={claimResolving} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl font-semibold text-xs shadow-md">
                {claimResolving ? "Verifying OTP & Logging Handover..." : "Verify OTP & Release Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manual Matching Suggestion Modal */}
      <Dialog open={showSuggestModal} onOpenChange={setShowSuggestModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden bg-card text-foreground border border-border">
          <DialogHeader className="pb-2 border-b border-border/40">
            <DialogTitle className="font-[family-name:var(--font-heading)] text-base font-bold">Submit Belonging Suggestion</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select an available verified found item to suggest to this resident.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSuggestSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
            <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4">
              {selectedReportForSuggestion && (
                <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-0.5 text-left">
                  <span className="text-[10px] uppercase font-bold text-purple-600 block">Resident's Private Lost Alert</span>
                  <div className="font-bold text-foreground">{selectedReportForSuggestion.itemName}</div>
                  <div className="text-muted-foreground text-xs">{selectedReportForSuggestion.description}</div>
                  <div className="text-muted-foreground text-[10px]">Reporter: {selectedReportForSuggestion.residentName} (Flat {selectedReportForSuggestion.flatNumber})</div>
                </div>
              )}

              <div className="space-y-2">
                <label className="font-bold text-muted-foreground block text-[10px] uppercase tracking-wider text-left">Available Found Items</label>
                {societyItems.filter(item => item.status === "Available" || item.status === "Available for Claim").length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-border/40 rounded-xl text-muted-foreground text-xs">
                    No verified found items currently available at the Security Desk.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {societyItems.filter(item => item.status === "Available" || item.status === "Available for Claim").map((item) => {
                      const isSelected = selectedFoundItemId === item.id;
                      return (
                        <div 
                          key={item.id} 
                          onClick={() => setSelectedFoundItemId(item.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
                            isSelected ? "border-indigo-500 bg-indigo-500/5 shadow-sm" : "border-border/60 hover:bg-secondary/20"
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="foundItemSelect"
                            checked={isSelected}
                            onChange={() => setSelectedFoundItemId(item.id)}
                            className="accent-indigo-600 shrink-0"
                          />
                          {item.images?.[0] && (
                            <img src={item.images[0]} alt="Found" className="w-10 h-10 object-cover rounded-lg border border-border/40 shrink-0" />
                          )}
                          <div className="text-left space-y-0.5">
                            <div className="font-bold text-foreground">{item.description.split(" - ")[0]}</div>
                            <div className="text-muted-foreground text-[10px] line-clamp-1">{item.description.split(" - ").slice(1).join(" - ")}</div>
                            <div className="text-[10px] text-muted-foreground">📍 {item.foundLocation} • 📅 {item.dateFound}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Security Suggestion Message (Optional)</label>
                <Textarea 
                  placeholder="e.g. A similar item has been turned in. Please verify if this matches yours." 
                  value={securityNote} 
                  onChange={(e) => setSecurityNote(e.target.value)} 
                  className="min-h-[60px] rounded-xl text-xs" 
                />
              </div>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-border/40 shrink-0">
              <Button 
                type="submit" 
                disabled={submittingSuggestion || !selectedFoundItemId} 
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl font-semibold shadow-md"
              >
                {submittingSuggestion ? "Sending Suggestion..." : "Send Match Suggestion"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
