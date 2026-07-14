"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Trophy, Plus, Camera, Check, Filter, Calendar, MapPin, Info, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const CATEGORIES = [
  "Keys", "Wallet", "Mobile Phone", "Earbuds", "Watch", "Jewellery",
  "Water Bottle", "Books", "ID Card", "Debit/Credit Card", "Documents",
  "Bag", "Umbrella", "Clothes", "Other"
];

export default function LostFoundPage() {
  const { user, initialize } = useAuth();
  const {
    lostFoundItems, lostReports, reportLostFoundItem, claimLostFoundItem, reportLostItem, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      lostFoundItems: state.lostFoundItems || [],
      lostReports: state.lostReports || [],
      reportLostFoundItem: state.reportLostFoundItem,
      claimLostFoundItem: state.claimLostFoundItem,
      reportLostItem: state.reportLostItem,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("board");
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Report found form state
  const [showLfForm, setShowLfForm] = useState(false);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [colour, setColour] = useState("");
  const [description, setDescription] = useState("");
  const [dateFound, setDateFound] = useState("");
  const [timeFound, setTimeFound] = useState("");
  const [locationFound, setLocationFound] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [handedOver, setHandedOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Report lost form state
  const [showLostForm, setShowLostForm] = useState(false);
  const [lostItemName, setLostItemName] = useState("");
  const [lostCategory, setLostCategory] = useState("");
  const [lostBrand, setLostBrand] = useState("");
  const [lostColour, setLostColour] = useState("");
  const [lostDescription, setLostDescription] = useState("");
  const [lostDistinguishingFeatures, setLostDistinguishingFeatures] = useState("");
  const [lostDate, setLostDate] = useState("");
  const [lostTime, setLostTime] = useState("");
  const [lostLastSeenLocation, setLostLastSeenLocation] = useState("");
  const [lostAdditionalNotes, setLostAdditionalNotes] = useState("");
  const [lostSubmitting, setLostSubmitting] = useState(false);

  // Claim Form State
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState<any>(null);
  const [claimReason, setClaimReason] = useState("");
  const [itemDetails, setItemDetails] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const societyItems = lostFoundItems.filter(item => item.portal === "society");

  // Filtered items for Community Board (only Available, Claim Pending Verification, Ready for Pickup, and Returned)
  // Hide Pending Verification and Rejected from community board
  const communityBoardItems = societyItems.filter((item) => {
    return item.status !== "Pending Verification" && item.status !== "Rejected";
  });

  const filteredBoardItems = communityBoardItems.filter((item) => {
    const matchesSearch = 
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.foundLocation.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "available" && item.status === "Available for Claim") ||
      (statusFilter === "claimed" && (item.status === "Claim Pending Verification" || item.status === "Ready for Pickup")) ||
      (statusFilter === "returned" && item.status === "Returned");

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  // User's own reports
  const myReports = societyItems.filter(item => item.reporterId === user?.id);

  // User's own claims
  const myClaims = societyItems.filter(item => 
    item.claims && item.claims.some(claim => claim.residentId === user?.id)
  ).map(item => {
    const userClaim = item.claims?.find(c => c.residentId === user?.id);
    return {
      ...item,
      userClaim
    };
  });

  const handleReportLf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !category || !description || !dateFound || !timeFound || !locationFound || !handedOver) return;

    setSubmitting(true);
    try {
      await reportLostFoundItem({
        category,
        brand,
        colour,
        description: `${itemName} - ${description}`,
        images: ["/images/found-placeholder.jpg"],
        foundLocation: locationFound,
        dateFound,
        timeFound,
        additionalNotes,
        reporterId: user?.id || "user-resident-1",
        reporterName: user?.name || "Nidhi Kumar",
        portal: "society",
        communityCode: user?.communityCode || "SUN123"
      });

      setItemName("");
      setCategory("");
      setBrand("");
      setColour("");
      setDescription("");
      setDateFound("");
      setTimeFound("");
      setLocationFound("");
      setAdditionalNotes("");
      setHandedOver(false);
      setShowLfForm(false);
      alert("Found item report logged! Please hand the item to Security immediately.");
    } catch (err) {
      alert("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportLost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostItemName || !lostCategory || !lostDescription || !lostDate || !lostLastSeenLocation) return;

    setLostSubmitting(true);
    try {
      await reportLostItem({
        itemName: lostItemName,
        category: lostCategory,
        brand: lostBrand,
        colour: lostColour,
        description: lostDescription,
        distinguishingFeatures: lostDistinguishingFeatures,
        dateLost: lostDate,
        timeLost: lostTime,
        lastSeenLocation: lostLastSeenLocation,
        additionalNotes: lostAdditionalNotes,
        images: ["/images/lost-placeholder.jpg"],
        portal: "society",
        communityCode: user?.communityCode || "SUN123",
        residentId: user?.id || "user-resident-1",
        residentName: user?.name || "Nidhi Kumar",
        flatNumber: user?.unit || "A-402"
      });

      setLostItemName("");
      setLostCategory("");
      setLostBrand("");
      setLostColour("");
      setLostDescription("");
      setLostDistinguishingFeatures("");
      setLostDate("");
      setLostTime("");
      setLostLastSeenLocation("");
      setLostAdditionalNotes("");
      setShowLostForm(false);
      alert("Lost item report logged! Security will match it and notify you.");
    } catch (err) {
      alert("Failed to submit lost report. Please try again.");
    } finally {
      setLostSubmitting(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForClaim || !claimReason) return;

    setClaiming(true);
    try {
      await claimLostFoundItem(
        selectedItemForClaim.id,
        user?.id || "user-resident-1",
        user?.name || "Nidhi Kumar",
        claimReason,
        itemDetails,
        "", // Proof image optional
        contactNumber || user?.phone || ""
      );

      setClaimReason("");
      setItemDetails("");
      setContactNumber("");
      setShowClaimForm(false);
      setSelectedItemForClaim(null);
      alert("Claim request logged! Security has been notified.");
    } catch (err) {
      alert("Failed to submit claim. Please try again.");
    } finally {
      setClaiming(false);
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
            Report recovered belongings or claim items currently in security custody
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => initializeDb()} 
            variant="outline" 
            className="rounded-xl border-border/60 hover:bg-secondary/20 h-10 w-10 p-0"
            title="Refresh Registry"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </Button>

          <Dialog open={showLfForm} onOpenChange={setShowLfForm}>
            <Button onClick={() => setShowLfForm(true)} className="rounded-xl gradient-primary text-white border-0 shadow-md h-10">
              <Plus className="w-4 h-4 mr-2" /> Report Found Item
            </Button>
            <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)] text-lg">Report Found Item</DialogTitle>
                <DialogDescription>
                  Log details of an item you recovered in common society zones.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleReportLf} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Name</label>
                    <Input placeholder="e.g. Set of Keys, Blue Bottle" value={itemName} onChange={(e) => setItemName(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 px-3 border border-border rounded-xl bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Brand (Optional)</label>
                    <Input placeholder="e.g. Apple, Milton" value={brand} onChange={(e) => setBrand(e.target.value)} className="h-10 text-xs rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Colour (Optional)</label>
                    <Input placeholder="e.g. Black, Silver" value={colour} onChange={(e) => setColour(e.target.value)} className="h-10 text-xs rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Description</label>
                  <Textarea placeholder="Describe physical characteristics, brands, colors, keychains..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px] text-xs rounded-xl" required />
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
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Location Found</label>
                  <Input placeholder="e.g. Near Clubhouse main lobby, elevator C wing" value={locationFound} onChange={(e) => setLocationFound(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Additional Notes (Optional)</label>
                  <Input placeholder="e.g. Placed in a plastic pouch..." value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="confirmHandover" 
                    checked={handedOver} 
                    onChange={(e) => setHandedOver(e.target.checked)} 
                    className="mt-0.5 rounded cursor-pointer accent-primary" 
                    required
                  />
                  <label htmlFor="confirmHandover" className="text-[11px] leading-relaxed font-medium text-amber-700 dark:text-amber-400 cursor-pointer selection:bg-transparent">
                    I confirm that I have physically handed this item over to the Society Security Desk.
                  </label>
                </div>

                <DialogFooter className="mt-4">
                  <Button type="submit" disabled={!handedOver || submitting} className="w-full h-10 gradient-primary text-white border-0 rounded-xl font-semibold text-xs">
                    {submitting ? "Submitting Report..." : "Submit Report to Security"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showLostForm} onOpenChange={setShowLostForm}>
            <Button onClick={() => setShowLostForm(true)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-md h-10">
              <Plus className="w-4 h-4 mr-2" /> Report Lost Item
            </Button>
            <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)] text-lg">Report Lost Item</DialogTitle>
                <DialogDescription>
                  File a report for an item you lost to help Security match and locate it.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleReportLost} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Name</label>
                    <Input placeholder="e.g. iPhone 15, Brown Wallet" value={lostItemName} onChange={(e) => setLostItemName(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                    <select
                      value={lostCategory}
                      onChange={(e) => setLostCategory(e.target.value)}
                      className="w-full h-10 px-3 border border-border rounded-xl bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Brand (Optional)</label>
                    <Input placeholder="e.g. Apple, Wildhorn" value={lostBrand} onChange={(e) => setLostBrand(e.target.value)} className="h-10 text-xs rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Colour (Optional)</label>
                    <Input placeholder="e.g. Silver, Black" value={lostColour} onChange={(e) => setLostColour(e.target.value)} className="h-10 text-xs rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Description</label>
                  <Textarea placeholder="Describe the item in detail..." value={lostDescription} onChange={(e) => setLostDescription(e.target.value)} className="min-h-[80px] text-xs rounded-xl" required />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Distinguishing Features (Optional)</label>
                  <Input placeholder="e.g. Scratched bottom left, custom strap..." value={lostDistinguishingFeatures} onChange={(e) => setLostDistinguishingFeatures(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Date Lost</label>
                    <Input type="date" value={lostDate} onChange={(e) => setLostDate(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Approximate Time Lost (Optional)</label>
                    <Input type="time" value={lostTime} onChange={(e) => setLostTime(e.target.value)} className="h-10 text-xs rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Last Seen Location</label>
                  <Input placeholder="e.g. Near Clubhouse gym, elevator A wing lobby" value={lostLastSeenLocation} onChange={(e) => setLostLastSeenLocation(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Additional Notes (Optional)</label>
                  <Input placeholder="e.g. Please contact immediately..." value={lostAdditionalNotes} onChange={(e) => setLostAdditionalNotes(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>

                <DialogFooter className="mt-4">
                  <Button type="submit" disabled={lostSubmitting} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl font-semibold text-xs shadow-md">
                    {lostSubmitting ? "Submitting Report..." : "Submit Report to Security"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="board" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary/40 border border-border/30 p-1 rounded-xl h-11">
          <TabsTrigger value="board" className="rounded-lg text-xs font-semibold px-4 h-9">Community Board</TabsTrigger>
          <TabsTrigger value="my-lost-reports" className="rounded-lg text-xs font-semibold px-4 h-9">My Lost Reports ({lostReports.length})</TabsTrigger>
          <TabsTrigger value="my-found-reports" className="rounded-lg text-xs font-semibold px-4 h-9">My Found Reports ({myReports.length})</TabsTrigger>
          <TabsTrigger value="my-claims" className="rounded-lg text-xs font-semibold px-4 h-9">My Claims ({myClaims.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-6">
          {/* Search & Filters */}
          <Card className="border-border/50 bg-secondary/5">
            <CardContent className="p-4 grid sm:grid-cols-4 gap-4">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by keywords, location, or characteristics..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl h-10 text-xs bg-card"
                />
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-xl bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-xl bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available for Claim</option>
                  <option value="claimed">Claim Pending</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Items Board */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoardItems.map((item) => {
              const hasClaimed = item.claims?.some(c => c.residentId === user?.id);
              const isAvailable = item.status === "Available for Claim";
              
              return (
                <motion.div key={item.id} variants={fadeInUp}>
                  <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-card">
                    <div className="aspect-[16/9] bg-secondary/20 relative flex items-center justify-center text-muted-foreground/30 font-bold border-b">
                      <Trophy className="w-10 h-10 text-primary/30" />
                      <Badge className={`absolute top-3 left-3 text-[9px] hover:bg-secondary capitalize ${
                        item.status === "Available for Claim" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        item.status === "Claim Pending Verification" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        item.status === "Ready for Pickup" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" :
                        "bg-secondary text-foreground"
                      }`}>
                        {item.status}
                      </Badge>
                      <Badge variant="outline" className="absolute top-3 right-3 text-[9px] bg-card/65 font-bold border-border/30">
                        {item.category}
                      </Badge>
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-foreground line-clamp-1">{item.category}</h4>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.dateFound}
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                          <MapPin className="w-3.5 h-3.5 text-primary/65" />
                          <span>Location: {item.foundLocation}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t flex justify-between items-center">
                        <span className="text-[9px] text-muted-foreground italic">Custodian: Security Desk</span>
                        
                        {item.status === "Returned" ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] flex items-center gap-1 font-bold">
                            <Check className="w-3 h-3" /> Returned
                          </Badge>
                        ) : hasClaimed ? (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-bold">
                            Claim Requested
                          </Badge>
                        ) : isAvailable ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedItemForClaim(item);
                              setShowClaimForm(true);
                            }}
                            className="rounded-lg h-8 text-[10px] px-3 font-semibold gradient-primary text-white border-0 shadow-sm"
                          >
                            Claim Belonging
                          </Button>
                        ) : (
                          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[9px]">
                            {item.status}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {filteredBoardItems.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-20 text-muted-foreground border rounded-2xl bg-secondary/5 flex flex-col items-center justify-center gap-2">
                <AlertCircle className="w-8 h-8 text-muted-foreground/30" />
                <span>No verified items reported in the lost & found registry.</span>
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="my-lost-reports" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">My Lost Item Reports</CardTitle>
              <CardDescription>Monitor status and smart matches for your reported missing belongings.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {lostReports.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  You haven&apos;t filed any lost item reports yet.
                </div>
              ) : (
                lostReports.map((report) => (
                  <div key={report.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-secondary/5 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{report.itemName}</span>
                        <Badge className={`text-[9px] font-bold ${
                          report.status === "Searching" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          report.status === "Possible Match Found" ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" :
                          report.status === "Matched" ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" :
                          report.status === "Returned" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                          "bg-secondary text-muted-foreground border border-border"
                        }`}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{report.description}</p>
                      {report.distinguishingFeatures && (
                        <p className="text-[11px] text-indigo-500 mt-0.5">Features: {report.distinguishingFeatures}</p>
                      )}
                      <div className="flex gap-4 text-[10px] text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {report.lastSeenLocation}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Lost: {report.dateLost}</span>
                      </div>
                    </div>

                    <div className="text-[10px] font-medium text-muted-foreground sm:text-right shrink-0">
                      {report.status === "Searching" && (
                        <span className="text-amber-500">Searching for matches...</span>
                      )}
                      {report.status === "Possible Match Found" && (
                        <div className="space-y-1">
                          <span className="text-indigo-500 font-bold block">★ Match Suggested!</span>
                          <span className="text-[9px] text-muted-foreground block">Security is reviewing a potential match</span>
                        </div>
                      )}
                      {report.status === "Matched" && (
                        <div className="space-y-1">
                          <span className="text-purple-500 font-bold block">✓ Match Confirmed!</span>
                          <span className="text-[9px] text-muted-foreground block">Visit Security Desk to collect the item</span>
                        </div>
                      )}
                      {report.status === "Returned" && (
                        <span className="text-emerald-500 font-bold">Returned Successfully</span>
                      )}
                      {report.status === "Closed" && (
                        <span className="text-muted-foreground">Report Closed</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-found-reports" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">My Submitted Found Items</CardTitle>
              <CardDescription>Records of items you have recovered and deposited at the security gate desk.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {myReports.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  You haven&apos;t filed any found item reports yet.
                </div>
              ) : (
                myReports.map((item) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-secondary/5 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{item.category}</span>
                        <Badge className={`text-[9px] font-bold ${
                          item.status === "Pending Verification" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          item.status === "Available for Claim" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                          item.status === "Returned" ? "bg-secondary text-muted-foreground border border-border" :
                          "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                      <div className="flex gap-4 text-[10px] text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.foundLocation}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.dateFound}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground sm:text-right shrink-0">
                      {item.status === "Pending Verification" && (
                        <span className="text-amber-500 font-semibold flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" /> Hand it physically to Security Desk to publish
                        </span>
                      )}
                      {item.status === "Available for Claim" && (
                        <span className="text-emerald-500 font-medium">Published on board</span>
                      )}
                      {item.status === "Returned" && (
                        <span className="text-muted-foreground">Handed over back to owner</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-claims" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">My Active Claims</CardTitle>
              <CardDescription>Monitor status of claim applications submitted for lost belongings.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {myClaims.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No active claim requests submitted yet.
                </div>
              ) : (
                myClaims.map((item: any) => {
                  const claim = item.userClaim;
                  if (!claim) return null;
                  return (
                    <div key={claim.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-secondary/5 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{item.category}</span>
                          <Badge className={`text-[9px] font-bold ${
                            claim.status === "Claim Pending Verification" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            claim.status === "Ready for Pickup" ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" :
                            claim.status === "Returned" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                            "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}>
                            {claim.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">Reason: &quot;{claim.claimReason}&quot;</p>
                        <div className="flex gap-4 text-[10px] text-muted-foreground mt-1.5">
                          <span>Report Ref: {item.id}</span>
                          <span>Found Location: {item.foundLocation}</span>
                        </div>
                      </div>

                      <div className="text-[10px] font-medium text-muted-foreground sm:text-right shrink-0">
                        {claim.status === "Claim Pending Verification" && (
                          <span className="text-amber-500">Awaiting security verification</span>
                        )}
                        {claim.status === "Ready for Pickup" && (
                          <div className="space-y-1">
                            <span className="text-indigo-500 font-bold block">✓ Ready for Pickup!</span>
                            <span className="text-[9px] text-muted-foreground block">Collect from Security desk gate 1</span>
                          </div>
                        )}
                        {claim.status === "Returned" && (
                          <div className="space-y-0.5">
                            <span className="text-emerald-500 block font-bold">Collected</span>
                            <span className="text-[9px] block text-muted-foreground">{claim.collectionDate?.split("T")[0]} at {claim.collectionTime}</span>
                          </div>
                        )}
                        {claim.status === "Rejected" && (
                          <span className="text-red-500">Claim denied</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Claim Belonging Form Dialog */}
      <Dialog open={showClaimForm} onOpenChange={setShowClaimForm}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">File Ownership Claim</DialogTitle>
            <DialogDescription>
              Provide details below so Security can verify ownership before handover.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleClaimSubmit} className="space-y-4 mt-2">
            {selectedItemForClaim && (
              <div className="p-3 bg-secondary/30 rounded-xl text-xs space-y-1">
                <div className="font-bold text-foreground">Item: {selectedItemForClaim.category}</div>
                <div className="text-muted-foreground">{selectedItemForClaim.description}</div>
                <div className="text-muted-foreground">Found on: {selectedItemForClaim.dateFound} at {selectedItemForClaim.foundLocation}</div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Why do you believe this is yours?</label>
              <Textarea 
                placeholder="e.g. I dropped my keys on my way back from the clubhouse on Sunday evening." 
                value={claimReason} 
                onChange={(e) => setClaimReason(e.target.value)} 
                className="min-h-[70px] text-xs rounded-xl" 
                required 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Specific Item Details (Optional)</label>
              <Textarea 
                placeholder="Describe color, brand, distinct marks, or details not visible in description..." 
                value={itemDetails} 
                onChange={(e) => setItemDetails(e.target.value)} 
                className="min-h-[70px] text-xs rounded-xl" 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Callback Contact Number (Optional)</label>
              <Input 
                placeholder="e.g. +91 98765 43210" 
                value={contactNumber} 
                onChange={(e) => setContactNumber(e.target.value)} 
                className="h-10 text-xs rounded-xl" 
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={claiming} className="w-full h-10 gradient-primary text-white border-0 rounded-xl font-semibold text-xs">
                {claiming ? "Submitting Claim..." : "Submit Claim Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
