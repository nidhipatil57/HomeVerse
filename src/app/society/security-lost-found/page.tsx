"use client";

import { useState, useEffect } from "react";
import { Search, Check, X, ShieldAlert, Clock, MapPin, Calendar, ClipboardList, CheckCircle2, User, Phone, FileText } from "lucide-react";
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
    lostFoundItems, lostReports, itemMatches, verifyFoundItem, rejectFoundItem, handoverMatchedItem, suggestBelonging, fetchLostReports, fetchMatches, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      lostFoundItems: state.lostFoundItems || [],
      lostReports: state.lostReports || [],
      itemMatches: state.itemMatches || [],
      verifyFoundItem: state.verifyFoundItem,
      rejectFoundItem: state.rejectFoundItem,
      handoverMatchedItem: state.handoverMatchedItem,
      suggestBelonging: state.suggestBelonging,
      fetchLostReports: state.fetchLostReports,
      fetchMatches: state.fetchMatches,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("lost-items");

  // Lost Match Handover State
  const [showLostHandoverDialog, setShowLostHandoverDialog] = useState(false);
  const [selectedMatchForHandover, setSelectedMatchForHandover] = useState<any>(null);
  const [lostCollectedBy, setLostCollectedBy] = useState("");
  const [lostVerifiedBy, setLostVerifiedBy] = useState("");
  const [lostResolving, setLostResolving] = useState(false);

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
      setLostVerifiedBy(user.name);
    }
  }, [user]);

  if (!mounted) return null;

  const societyItems = lostFoundItems.filter(item => item.portal === "society");

  const filteredItems = societyItems.filter(item => {
    return item.description.toLowerCase().includes(search.toLowerCase()) ||
           item.foundLocation.toLowerCase().includes(search.toLowerCase());
  });

  const filteredLost = lostReports.filter(report => {
    return report.portal === "society" && (
      report.itemName.toLowerCase().includes(search.toLowerCase()) ||
      report.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Tab 1: Lost Items (Hide if Returned or Closed)
  const activeLostReports = filteredLost.filter(r => r.status !== "Returned" && r.status !== "Closed");

  // Tab 2: Found Items (Hide if Returned)
  const activeFoundItems = filteredItems.filter(item => item.status !== "Returned" && item.status !== "Rejected");

  // Tab 3: History (All confirmed matches)
  const confirmedMatches = itemMatches.filter(m => m.status === "Confirmed" && m.collectionDate);

  const handleVerify = async (id: string) => {
    if (confirm("Verify that you have physically received this item at the Security Desk?")) {
      await verifyFoundItem(id);
      alert("Item verified and marked as Available!");
      fetchLostReports();
      fetchMatches();
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("Are you sure you want to reject this found report?")) {
      await rejectFoundItem(id);
      alert("Found report rejected.");
      fetchLostReports();
      fetchMatches();
    }
  };

  const handleSendSuggestion = async () => {
    if (!selectedReportForSuggestion || !selectedFoundItemId) {
      alert("Please select a found item.");
      return;
    }
    setSubmittingSuggestion(true);
    try {
      await suggestBelonging(
        selectedReportForSuggestion.id,
        selectedFoundItemId,
        securityNote,
        ""
      );
      alert("Belonging match suggestion sent to resident successfully!");
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

  const openLostHandover = (match: any) => {
    setSelectedMatchForHandover(match);
    setLostCollectedBy(match.lostReport?.residentName || "");
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
      alert("Item successfully handed over back to the lost reporter and archived!");
      fetchLostReports();
      fetchMatches();
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
          placeholder="Search items by keyword or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl h-11 text-xs"
        />
      </div>

      <Tabs defaultValue="lost-items" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary/40 border border-border/30 p-1 rounded-xl h-11 w-full sm:w-auto overflow-x-auto flex">
          <TabsTrigger value="lost-items" className="rounded-lg text-xs font-semibold px-4 h-9">Lost Items ({activeLostReports.length})</TabsTrigger>
          <TabsTrigger value="found-items" className="rounded-lg text-xs font-semibold px-4 h-9">Found Items ({activeFoundItems.length})</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-xs font-semibold px-4 h-9">History ({confirmedMatches.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Lost Items */}
        <TabsContent value="lost-items" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-500" />
                Active Lost Item Reports
              </CardTitle>
              <CardDescription>All missing item reports filed by society residents.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {activeLostReports.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No active lost item reports.
                </div>
              ) : (
                activeLostReports.map((report) => {
                  const activeMatch = itemMatches.find(m => m.lostReportId === report.id && m.status === "Suggested");
                  return (
                    <div key={report.id} className="p-4 rounded-xl border border-border/60 bg-secondary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">{report.itemName}</span>
                          <Badge className={`text-[9px] font-bold ${
                            report.status === "Searching" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            report.status === "Belonging Suggested" ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" :
                            report.status === "Claim Confirmed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                            "bg-secondary text-muted-foreground"
                          }`}>
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{report.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1 font-semibold text-foreground"><User className="w-3.5 h-3.5" /> Resident: {report.residentName} (Flat {report.flatNumber})</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Last Seen: {report.lastSeenLocation}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date: {report.dateLost}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Time: {report.timeLost || "N/A"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0 md:self-center">
                        {report.status === "Claim Confirmed" && activeMatch ? (
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => openLostHandover(activeMatch)}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 text-xs font-semibold px-4 border-0"
                          >
                            Hand Over Item
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            type="button"
                            disabled={report.status === "Belonging Suggested"}
                            onClick={() => {
                              setSelectedReportForSuggestion(report);
                              setShowSuggestModal(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-secondary text-white disabled:text-muted-foreground rounded-xl h-9 text-xs font-semibold px-4 border-0"
                          >
                            {report.status === "Belonging Suggested" ? "Suggestion Sent" : "Send Found Item"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Found Items */}
        <TabsContent value="found-items" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-500" />
                Active Found Item reports
              </CardTitle>
              <CardDescription>All found items that have been deposited at the desk, waiting for claims or verification.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {activeFoundItems.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No active found items logged.
                </div>
              ) : (
                activeFoundItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-border/60 bg-secondary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4 items-center text-left">
                      {item.images?.[0] && (
                        <img src={item.images[0]} alt="Found Item" className="w-16 h-16 object-cover rounded-lg border border-border/40 shrink-0" />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">{item.description.split(" - ")[0]}</span>
                          <Badge className={`text-[9px] font-bold ${
                            item.status === "Pending Verification" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            item.status === "Available" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                            item.status === "Suggested To Resident" ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" :
                            item.status === "Claim Confirmed" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                            "bg-secondary text-muted-foreground"
                          }`}>
                            {item.status === "Pending Verification" ? "Pending Security Verification" : item.status === "Suggested To Resident" ? "Suggested" : item.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description.split(" - ").slice(1).join(" - ")}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Reporter: {item.reporterName}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location: {item.foundLocation}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date: {item.dateFound}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Time: {item.timeFound}</span>
                        </div>
                      </div>
                    </div>

                    {item.status === "Pending Verification" && (
                      <div className="flex gap-2 shrink-0 md:self-center">
                        <Button
                          size="sm"
                          type="button"
                          onClick={() => handleVerify(item.id)}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 text-xs font-semibold px-4 border-0"
                        >
                          Verify & Publish
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={() => handleReject(item.id)}
                          className="text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-xl h-9 text-xs font-semibold px-3"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: History */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Permanent Audit Logs (Handovers)
              </CardTitle>
              <CardDescription>Archived records of successfully returned or resolved items.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {confirmedMatches.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No historical handover logs.
                </div>
              ) : (
                confirmedMatches.map((match) => (
                  <div key={match.id} className="p-4 rounded-xl border border-border/60 bg-secondary/5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="flex gap-4 items-center text-left">
                      {match.foundItem?.images?.[0] && (
                        <img src={match.foundItem.images[0]} alt="Historical Item" className="w-16 h-16 object-cover rounded-lg border border-border/40 shrink-0" />
                      )}
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-foreground">
                          {match.lostReport?.itemName || match.foundItem?.description.split(" - ")[0]}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          <strong>Lost Report:</strong> {match.lostReport?.description || "N/A"}<br/>
                          <strong>Found Item:</strong> {match.foundItem?.description || "N/A"}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground">
                          <span>👤 <strong>Lost By:</strong> {match.lostReport?.residentName || "N/A"}</span>
                          <span>🔍 <strong>Found By:</strong> {match.foundItem?.reporterName || "N/A"}</span>
                          <span>📅 <strong>Reported Lost:</strong> {match.lostReport?.dateLost || "N/A"}</span>
                          <span>🤝 <strong>Returned:</strong> {match.collectionDate?.split("T")[0]} at {match.collectionTime}</span>
                          <span className="sm:col-span-2">🛡️ <strong>Security Handover Officer:</strong> {match.verifiedBy || "Desk Guard"}</span>
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
              <div className="p-3 bg-secondary/30 rounded-xl text-xs space-y-1 text-left">
                <div className="font-bold text-foreground">Lost Item: {selectedMatchForHandover.lostReport?.itemName}</div>
                <div className="text-muted-foreground">Category: {selectedMatchForHandover.lostReport?.category}</div>
                <div className="text-muted-foreground font-semibold">Owner: {selectedMatchForHandover.lostReport?.residentName}</div>
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

      {/* Submit Belonging Suggestion Modal */}
      <Dialog open={showSuggestModal} onOpenChange={setShowSuggestModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden bg-card text-foreground border border-border">
          <DialogHeader className="pb-2 border-b border-border/40">
            <DialogTitle className="font-[family-name:var(--font-heading)] text-base font-bold">Submit Belonging Suggestion</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select an available verified found item to suggest to this resident.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4 text-xs">
            {selectedReportForSuggestion && (
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-1 text-left">
                <span className="text-[10px] uppercase font-bold text-indigo-500 block">Resident's Lost Report</span>
                <div className="font-bold text-foreground">{selectedReportForSuggestion.itemName}</div>
                <div className="text-muted-foreground">{selectedReportForSuggestion.description}</div>
                <div className="text-muted-foreground font-medium">Reporter: {selectedReportForSuggestion.residentName} (Flat {selectedReportForSuggestion.flatNumber})</div>
              </div>
            )}

            <div className="space-y-2">
              <label className="font-bold text-muted-foreground block text-[11px] uppercase tracking-wider text-left">Available Found Items</label>
              {societyItems.filter(item => item.status === "Available").length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border/40 rounded-xl text-muted-foreground text-xs">
                  No verified found items currently available at the Security Desk.
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {societyItems.filter(item => item.status === "Available").map((item) => {
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
                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-bold text-xs truncate text-foreground">{item.description.split(" - ")[0]}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{item.description.split(" - ").slice(1).join(" - ")}</div>
                          <div className="text-[9px] text-muted-foreground mt-0.5">Found at {item.foundLocation} on {item.dateFound}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedFoundItemId && (
              <div className="space-y-3 pt-2 border-t border-border/40 text-left">
                <span className="font-bold text-muted-foreground block text-[11px] uppercase tracking-wider">Verification details</span>
                
                {/* Selected Item Preview */}
                {(() => {
                  const selectedItem = societyItems.find(item => item.id === selectedFoundItemId);
                  return selectedItem && selectedItem.images?.[0] ? (
                    <div className="flex items-center gap-2 bg-secondary/20 p-2 rounded-xl">
                      <img src={selectedItem.images[0]} alt="Selected Found Item" className="w-14 h-14 object-cover rounded-lg border border-border/40 shrink-0" />
                      <div className="text-[10px] text-muted-foreground">
                        <div className="font-semibold text-foreground">{selectedItem.description.split(" - ")[0]} Photo Attached</div>
                        This image will be sent to the resident for confirmation.
                      </div>
                    </div>
                  ) : null;
                })()}

                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Security Note (Optional)</label>
                  <Input 
                    value={securityNote} 
                    onChange={(e) => setSecurityNote(e.target.value)} 
                    placeholder="We think this may be your lost item. Please verify."
                    className="h-10 text-xs rounded-xl border border-border/60" 
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border/40 flex justify-end gap-2 shrink-0">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => {
                setShowSuggestModal(false);
                setSelectedReportForSuggestion(null);
                setSelectedFoundItemId("");
                setSecurityNote("");
              }}
              className="h-9 text-xs rounded-xl px-4"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendSuggestion} 
              disabled={submittingSuggestion || !selectedFoundItemId} 
              className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl px-5 font-semibold shadow-sm"
            >
              {submittingSuggestion ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
