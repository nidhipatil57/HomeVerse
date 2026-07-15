"use client";

import { useState, useEffect } from "react";
import { Search, Trophy, Plus, Camera, Check, Filter, Calendar, MapPin, Info, Clock, AlertCircle, RefreshCw, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";

export default function LostFoundPage() {
  const { user, initialize } = useAuth();
  const {
    lostFoundItems, lostReports, itemMatches, reportLostFoundItem, reportLostItem, claimSuggestedMatch, rejectSuggestedMatch, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      lostFoundItems: state.lostFoundItems || [],
      lostReports: state.lostReports || [],
      itemMatches: state.itemMatches || [],
      reportLostFoundItem: state.reportLostFoundItem,
      reportLostItem: state.reportLostItem,
      claimSuggestedMatch: state.claimSuggestedMatch,
      rejectSuggestedMatch: state.rejectSuggestedMatch,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("lost-items");

  // Report found form state
  const [showLfForm, setShowLfForm] = useState(false);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [dateFound, setDateFound] = useState("");
  const [timeFound, setTimeFound] = useState("");
  const [locationFound, setLocationFound] = useState("");
  const [foundPhotoUrl, setFoundPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Report lost form state
  const [showLostForm, setShowLostForm] = useState(false);
  const [lostItemName, setLostItemName] = useState("");
  const [lostDescription, setLostDescription] = useState("");
  const [lostDate, setLostDate] = useState("");
  const [lostTime, setLostTime] = useState("");
  const [lostLastSeenLocation, setLostLastSeenLocation] = useState("");
  const [lostSubmitting, setLostSubmitting] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const societyItems = lostFoundItems.filter(item => item.portal === "society");

  // Active user's lost reports: Hide if Returned/Closed
  const myLostReports = lostReports.filter(
    r => r.residentId === user?.id && r.portal === "society" && r.status !== "Returned" && r.status !== "Closed"
  );

  // Active user's submitted found items: Hide if Returned
  const myFoundReports = societyItems.filter(
    item => item.reporterId === user?.id && item.status !== "Returned" && item.status !== "Rejected"
  );

  // Claims matching resident's lost items that have been Suggested and not yet returned
  const myClaims = itemMatches.filter(
    m => m.lostReport?.residentId === user?.id && m.status === "Suggested" && m.lostReport?.status !== "Returned"
  );

  const handleReportFoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !description || !dateFound || !timeFound || !locationFound || !foundPhotoUrl) {
      alert("All fields including Photo URL are mandatory!");
      return;
    }

    setSubmitting(true);
    try {
      await reportLostFoundItem({
        category: "Other",
        brand: "",
        colour: "",
        description: `${itemName} - ${description}`,
        images: [foundPhotoUrl],
        foundLocation: locationFound,
        dateFound,
        timeFound,
        additionalNotes: "",
        reporterId: user?.id || "user-resident-1",
        reporterName: user?.name || "Nidhi Kumar",
        portal: "society",
        communityCode: user?.communityCode || "SUN123"
      });

      setItemName("");
      setDescription("");
      setDateFound("");
      setTimeFound("");
      setLocationFound("");
      setFoundPhotoUrl("");
      setShowLfForm(false);
      alert("Found item report logged! Please hand the item to Security immediately.");
    } catch (err) {
      alert("Failed to submit found item report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportLostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostItemName || !lostDescription || !lostDate || !lostTime || !lostLastSeenLocation) return;

    setLostSubmitting(true);
    try {
      await reportLostItem({
        itemName: lostItemName,
        category: "Other",
        brand: "",
        colour: "",
        description: lostDescription,
        distinguishingFeatures: "",
        dateLost: lostDate,
        timeLost: lostTime,
        lastSeenLocation: lostLastSeenLocation,
        additionalNotes: "",
        images: [],
        portal: "society",
        communityCode: user?.communityCode || "SUN123",
        residentId: user?.id || "user-resident-1",
        residentName: user?.name || "Nidhi Kumar",
        flatNumber: user?.unit || "A-402"
      });

      setLostItemName("");
      setLostDescription("");
      setLostDate("");
      setLostTime("");
      setLostLastSeenLocation("");
      setShowLostForm(false);
      alert("Lost item report submitted to Security desk!");
    } catch (err) {
      alert("Failed to submit lost report. Please try again.");
    } finally {
      setLostSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Lost & Found Desk 🔍
          </h1>
          <p className="text-muted-foreground mt-1">
            Report lost belongings, found items, or review desk suggestions.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => initializeDb()} 
            type="button"
            variant="outline" 
            className="rounded-xl border-border/60 hover:bg-secondary/20 h-10 w-10 p-0"
            title="Refresh Registry"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </Button>

          {/* Dialog for Reporting Lost Item */}
          <Dialog open={showLostForm} onOpenChange={setShowLostForm}>
            <Button onClick={() => setShowLostForm(true)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-md h-10">
              <Plus className="w-4 h-4 mr-2" /> Report Lost Item
            </Button>
            <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)] text-lg">Report Lost Item</DialogTitle>
                <DialogDescription>
                  File a report to notify Security of an item you lost.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleReportLostSubmit} className="space-y-4 mt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Name</label>
                  <Input placeholder="e.g. Leather Wallet, Golden Ring" value={lostItemName} onChange={(e) => setLostItemName(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Description</label>
                  <Textarea placeholder="Describe the item details..." value={lostDescription} onChange={(e) => setLostDescription(e.target.value)} className="min-h-[80px] text-xs rounded-xl" required />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Last Seen Location</label>
                  <Input placeholder="e.g. Gymnasium lobby, parking space A2" value={lostLastSeenLocation} onChange={(e) => setLostLastSeenLocation(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Date Lost</label>
                    <Input type="date" value={lostDate} onChange={(e) => setLostDate(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Time Lost</label>
                    <Input type="time" value={lostTime} onChange={(e) => setLostTime(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button type="submit" disabled={lostSubmitting} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl font-semibold text-xs shadow-md">
                    {lostSubmitting ? "Submitting..." : "Submit Report to Security"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog for Reporting Found Item */}
          <Dialog open={showLfForm} onOpenChange={setShowLfForm}>
            <Button onClick={() => setShowLfForm(true)} className="rounded-xl gradient-primary text-white border-0 shadow-md h-10">
              <Plus className="w-4 h-4 mr-2" /> Report Found Item
            </Button>
            <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)] text-lg">Report Found Item</DialogTitle>
                <DialogDescription>
                  Enter found item details. Resident reports must be physically deposited at the gate desk.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleReportFoundSubmit} className="space-y-4 mt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Name</label>
                  <Input placeholder="e.g. Smart Watch, Set of Keys" value={itemName} onChange={(e) => setItemName(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Description</label>
                  <Textarea placeholder="Describe the item in detail..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px] text-xs rounded-xl" required />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Found Location</label>
                  <Input placeholder="e.g. Near A Wing Lift entrance" value={locationFound} onChange={(e) => setLocationFound(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Date Found</label>
                    <Input type="date" value={dateFound} onChange={(e) => setDateFound(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Time Found</label>
                    <Input type="time" value={timeFound} onChange={(e) => setTimeFound(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Upload Photo (Mandatory)</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/70 hover:bg-secondary/20 cursor-pointer transition-colors relative h-12">
                      <Camera className="w-5 h-5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        {foundPhotoUrl ? "Photo Selected" : "Click to select a photo from your computer"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFoundPhotoUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        required
                      />
                    </div>
                    {foundPhotoUrl && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/60">
                        <img src={foundPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFoundPhotoUrl("")}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button type="submit" disabled={submitting} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl font-semibold text-xs shadow-md">
                    {submitting ? "Submitting..." : "Submit Report to Security"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="lost-items" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary/40 border border-border/30 p-1 rounded-xl h-11">
          <TabsTrigger value="lost-items" className="rounded-lg text-xs font-semibold px-4 h-9">Lost Items ({myLostReports.length})</TabsTrigger>
          <TabsTrigger value="found-items" className="rounded-lg text-xs font-semibold px-4 h-9">Found Items ({myFoundReports.length})</TabsTrigger>
          <TabsTrigger value="my-claims" className="rounded-lg text-xs font-semibold px-4 h-9">My Claims ({myClaims.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Lost Items */}
        <TabsContent value="lost-items" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">My Reported Lost Items</CardTitle>
              <CardDescription>Active reports for belongings you lost in the society.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {myLostReports.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No lost items reported. Click Report Lost Item to file one.
                </div>
              ) : (
                myLostReports.map((report) => (
                  <div key={report.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-secondary/5 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{report.itemName}</span>
                        <Badge className={`text-[9px] font-bold ${
                          report.status === "Searching" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          report.status === "Belonging Suggested" ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" :
                          report.status === "Claim Confirmed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                      <div className="flex gap-4 text-[10px] text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary/65" /> Last Seen: {report.lastSeenLocation}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary/65" /> Lost: {report.dateLost} at {report.timeLost || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Found Items */}
        <TabsContent value="found-items" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">My Reported Found Items</CardTitle>
              <CardDescription>Belongings you recovered and deposited at the gate desk.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {myFoundReports.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No found items reported by you.
                </div>
              ) : (
                myFoundReports.map((item) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-secondary/5 transition-colors">
                    <div className="flex gap-4 items-center">
                      {item.images?.[0] && (
                        <img src={item.images[0]} alt="Found Item" className="w-16 h-16 object-cover rounded-lg border border-border/40 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{item.description.split(" - ")[0]}</span>
                          <Badge className={`text-[9px] font-bold ${
                            item.status === "Pending Verification" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            item.status === "Available" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                            item.status === "Claim Confirmed" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                            "bg-secondary text-muted-foreground"
                          }`}>
                            {item.status === "Pending Verification" ? "Pending Security Verification" : item.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.description.split(" - ").slice(1).join(" - ")}</p>
                        <div className="flex gap-4 text-[10px] text-muted-foreground mt-1.5">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary/65" /> Found Location: {item.foundLocation}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary/65" /> Found Date: {item.dateFound}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: My Claims */}
        <TabsContent value="my-claims" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Suggested Claims</CardTitle>
              <CardDescription>Belongings proposed by Security matching your lost item reports.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {myClaims.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No active suggested claims.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {myClaims.map((match: any) => (
                    <div key={match.id} className="p-4 rounded-xl border border-border bg-card flex gap-4 text-xs relative overflow-hidden transition-all hover:shadow">
                      {match.foundItem?.images?.[0] && (
                        <img src={match.foundItem.images[0]} alt="Suggested Claim Photo" className="w-24 h-24 object-cover rounded-lg border border-border/40 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0 space-y-2 text-left">
                        <div>
                          <span className="font-bold text-sm text-foreground block truncate">
                            {match.foundItem?.description?.split(" - ")[0] || match.foundItem?.category}
                          </span>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {match.foundItem?.description?.split(" - ").slice(1).join(" - ") || match.foundItem?.description}
                          </p>
                        </div>

                        {match.securityNote && (
                          <div className="p-2.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-[11px] text-indigo-600 dark:text-indigo-400">
                            <strong>Security Message:</strong> &quot;{match.securityNote}&quot;
                          </div>
                        )}

                        <div className="flex gap-2 pt-1 border-t border-border/30">
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => {
                              if (confirm("Confirm that this suggested item belongs to you?")) {
                                claimSuggestedMatch(match.id);
                                alert("Suggested item confirmed! Please visit the Security Desk for physical collection.");
                              }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-7 text-[10px] font-semibold px-3.5"
                          >
                            Yes, This Is My Item
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (confirm("Decline this suggestion?")) {
                                rejectSuggestedMatch(match.id);
                                alert("Decline sent to Security.");
                              }
                            }}
                            className="text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-lg h-7 text-[10px] font-semibold px-2.5"
                          >
                            No, This Is Not Mine
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
