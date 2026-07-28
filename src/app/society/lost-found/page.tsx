"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Camera, Check, Filter, Calendar, MapPin, Info, Clock, AlertCircle, RefreshCw, X, Shield, Lock, FileText, ArrowRight, Eye, Send } from "lucide-react";
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

const CATEGORIES = ["Electronics", "Keys", "Documents", "Wallets/Bags", "Jewelry", "Clothing", "Other"];

// Category icons helper
function getCategoryIcon(cat: string) {
  switch (cat) {
    case "Electronics": return "🎧";
    case "Keys": return "🔑";
    case "Documents": return "📄";
    case "Wallets/Bags": return "💼";
    case "Jewelry": return "💍";
    case "Clothing": return "👕";
    default: return "📦";
  }
}

export default function LostFoundPage() {
  const { user, initialize } = useAuth();
  const {
    lostFoundItems, lostReports, claims, reportLostFoundItem, reportLostItem, initializeDb, fetchMyClaims, provideAdditionalEvidence
  } = useCommunityStore(
    useShallow((state) => ({
      lostFoundItems: state.lostFoundItems || [],
      lostReports: state.lostReports || [],
      claims: state.claims || [],
      reportLostFoundItem: state.reportLostFoundItem,
      reportLostItem: state.reportLostItem,
      initializeDb: state.initializeDb,
      fetchMyClaims: state.fetchMyClaims,
      provideAdditionalEvidence: state.provideAdditionalEvidence
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("browse-found");

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // Report found form state
  const [showLfForm, setShowLfForm] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Other");
  const [description, setDescription] = useState("");
  const [dateFound, setDateFound] = useState("");
  const [timeFound, setTimeFound] = useState("");
  const [locationFound, setLocationFound] = useState("");
  const [foundPhotoUrl, setFoundPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Private Lost Alert Form State
  const [showLostForm, setShowLostForm] = useState(false);
  const [lostItemName, setLostItemName] = useState("");
  const [lostItemCategory, setLostItemCategory] = useState("Other");
  const [lostDescription, setLostDescription] = useState("");
  const [lostDate, setLostDate] = useState("");
  const [lostTime, setLostTime] = useState("");
  const [lostLastSeenLocation, setLostLastSeenLocation] = useState("");
  const [lostSubmitting, setLostSubmitting] = useState(false);

  // Claim Request Form State (Evidence-based questionnaire)
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedItemToClaim, setSelectedItemToClaim] = useState<any | null>(null);
  const [claimReason, setClaimReason] = useState("");
  const [claimContact, setClaimContact] = useState("");
  const [claimProofUrl, setClaimProofUrl] = useState("");
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // Questionnaire answers
  const [qDetail, setQDetail] = useState("");
  const [qMarks, setQMarks] = useState("");
  const [qTime, setQTime] = useState("");
  const [qLocation, setQLocation] = useState("");

  // Category specific answers
  const [elecBrand, setElecBrand] = useState("");
  const [elecModel, setElecModel] = useState("");
  const [elecColour, setElecColour] = useState("");
  const [elecSerial, setElecSerial] = useState("");
  const [elecLockScreen, setElecLockScreen] = useState("");
  const [elecCase, setElecCase] = useState("");

  const [walletColour, setWalletColour] = useState("");
  const [walletBrand, setWalletBrand] = useState("");
  const [walletContents, setWalletContents] = useState("");
  const [walletCards, setWalletCards] = useState("");

  const [keysCount, setKeysCount] = useState("");
  const [keysKeychain, setKeysKeychain] = useState("");
  const [keysType, setKeysType] = useState("");

  const [jewelMaterial, setJewelMaterial] = useState("");
  const [jewelDesign, setJewelDesign] = useState("");
  const [jewelEngravings, setJewelEngravings] = useState("");
  const [jewelSize, setJewelSize] = useState("");

  // Provide additional evidence form state
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedClaimForEvidence, setSelectedClaimForEvidence] = useState<any | null>(null);
  const [additionalText, setAdditionalText] = useState("");
  const [additionalImage, setAdditionalImage] = useState("");
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    fetchMyClaims();
    setMounted(true);
  }, [initialize, initializeDb, fetchMyClaims]);

  const societyItems = useMemo(() => lostFoundItems.filter(item => item.portal === "society"), [lostFoundItems]);

  // Tab 1: Recently Found (Browse verified and published found items held at Security)
  const verifiedFoundItems = useMemo(() => {
    return societyItems.filter(
      item => (item.status === "Available" || item.status === "Available for Claim" || item.status === "Claim Pending Verification" || item.status === "Ready for Pickup")
    );
  }, [societyItems]);

  // Tab 3: Reported by Me (Found items reported by this resident to Security)
  const myFoundReports = useMemo(() => {
    return societyItems.filter(item => item.reporterId === user?.id && item.status !== "Returned");
  }, [societyItems, user]);

  // Tab 4: Private Alerts (Private lost alerts notified to Security by this resident)
  const myPrivateAlerts = useMemo(() => {
    return lostReports.filter(r => r.residentId === user?.id && r.portal === "society" && r.status === "Private Alert");
  }, [lostReports, user]);

  // Filtering Lists
  const filteredFeed = useMemo(() => {
    return verifiedFoundItems.filter(item => {
      const desc = item.description;
      const matchesSearch = desc.toLowerCase().includes(searchQuery.toLowerCase()) || item.foundLocation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryFilter === "All" || item.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [verifiedFoundItems, searchQuery, selectedCategoryFilter]);

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const itemName = c.item?.description?.split(" - ")[0] || "Unknown Item";
      const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) || c.claimReason.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryFilter === "All" || c.item?.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [claims, searchQuery, selectedCategoryFilter]);

  const filteredMyFoundReports = useMemo(() => {
    return myFoundReports.filter(item => {
      const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryFilter === "All" || item.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [myFoundReports, searchQuery, selectedCategoryFilter]);

  const filteredPrivateAlerts = useMemo(() => {
    return myPrivateAlerts.filter(r => {
      const matchesSearch = r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryFilter === "All" || r.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [myPrivateAlerts, searchQuery, selectedCategoryFilter]);

  const handleReportFoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !description || !dateFound || !timeFound || !locationFound || !foundPhotoUrl) {
      alert("All fields including Photo URL are mandatory!");
      return;
    }

    setSubmitting(true);
    try {
      await reportLostFoundItem({
        category: itemCategory,
        brand: "",
        colour: "",
        description: `${itemName} - ${description}`,
        images: [foundPhotoUrl],
        foundLocation: locationFound,
        dateFound,
        timeFound,
        additionalNotes: "",
        reporterId: user?.id || "user-resident-1",
        reporterName: user?.name || "Resident",
        portal: "society",
        communityCode: user?.communityCode || "SUN123"
      });

      setItemName("");
      setItemCategory("Other");
      setDescription("");
      setDateFound("");
      setTimeFound("");
      setLocationFound("");
      setFoundPhotoUrl("");
      setShowLfForm(false);
      alert("Found item report logged! Please hand the item to Security immediately.");
      initializeDb();
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
        category: lostItemCategory,
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
        residentName: user?.name || "Resident",
        flatNumber: user?.unit || "N/A"
      });

      setLostItemName("");
      setLostItemCategory("Other");
      setLostDescription("");
      setLostDate("");
      setLostTime("");
      setLostLastSeenLocation("");
      setShowLostForm(false);
      alert("Private lost alert sent to the Security desk!");
      initializeDb();
    } catch (err) {
      alert("Failed to submit private lost alert.");
    } finally {
      setLostSubmitting(false);
    }
  };

  const openClaimDialog = (item: any) => {
    setSelectedItemToClaim(item);
    setClaimReason("");
    setClaimContact("");
    setClaimProofUrl("");
    setQDetail("");
    setQMarks("");
    setQTime("");
    setQLocation("");
    setElecBrand("");
    setElecModel("");
    setElecColour("");
    setElecSerial("");
    setElecLockScreen("");
    setElecCase("");
    setWalletColour("");
    setWalletBrand("");
    setWalletContents("");
    setWalletCards("");
    setKeysCount("");
    setKeysKeychain("");
    setKeysType("");
    setJewelMaterial("");
    setJewelDesign("");
    setJewelEngravings("");
    setJewelSize("");
    setShowClaimModal(true);
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemToClaim || !claimContact) {
      alert("Contact Number is required!");
      return;
    }

    let autoClaimReason = "";
    let detailSummary = "";

    if (selectedItemToClaim.category === "Electronics") {
      if (!elecBrand || !elecModel || !elecColour || !qTime || !qLocation) {
        alert("Please fill in Brand, Model, Colour, Date Lost, and Location Lost.");
        return;
      }
      autoClaimReason = `Electronic Claim: Brand: ${elecBrand}, Model: ${elecModel}, Colour: ${elecColour}. lockscreen: ${elecLockScreen || "N/A"}.`;
      detailSummary = `Brand: ${elecBrand}, Model: ${elecModel}, Color: ${elecColour}, Lockscreen Wallpaper: ${elecLockScreen || "N/A"}, Case Cover: ${elecCase || "N/A"}`;
    } else if (selectedItemToClaim.category === "Keys") {
      if (!keysCount || !keysType || !qTime || !qLocation) {
        alert("Please fill in Key Count, Key Type, Date Lost, and Location Lost.");
        return;
      }
      autoClaimReason = `Keys Claim: Count: ${keysCount}, Keychain desc: ${keysKeychain || "None"}, Key type: ${keysType}.`;
      detailSummary = `Keys Count: ${keysCount}, Type: ${keysType}, Keychain: ${keysKeychain || "None"}`;
    } else if (selectedItemToClaim.category === "Wallets/Bags") {
      if (!walletColour || !qTime || !qLocation) {
        alert("Please fill in Color/Material, Date Lost, and Location Lost.");
        return;
      }
      autoClaimReason = `Wallet/Bag Claim: Brand: ${walletBrand || "N/A"}, Color: ${walletColour}, Cards inside: ${walletCards || "None"}, Contents: ${walletContents || "None"}.`;
      detailSummary = `Color/Material: ${walletColour}, Brand: ${walletBrand || "N/A"}, Cards: ${walletCards || "None"}, Contents: ${walletContents || "None"}`;
    } else if (selectedItemToClaim.category === "Documents") {
      if (!walletBrand || !walletColour || !qTime || !qLocation) {
        alert("Please fill in Document Type, Name on Document, Date Lost, and Location Lost.");
        return;
      }
      autoClaimReason = `Document Claim: Document Type: ${walletBrand}, Name on Doc: ${walletColour}, ID/Serial: ${walletCards || "N/A"}.`;
      detailSummary = `Document Type: ${walletBrand}, Name: ${walletColour}, Serial/ID: ${walletCards || "N/A"}`;
    } else if (selectedItemToClaim.category === "Jewelry") {
      if (!jewelMaterial || !jewelDesign || !qTime || !qLocation) {
        alert("Please fill in Material, Design/Type, Date Lost, and Location Lost.");
        return;
      }
      autoClaimReason = `Jewelry Claim: Material: ${jewelMaterial}, Design/Marks: ${jewelDesign}, Size: ${jewelSize || "N/A"}, Engravings: ${jewelEngravings || "None"}.`;
      detailSummary = `Material: ${jewelMaterial}, Design/Stones: ${jewelDesign}, Size/Weight: ${jewelSize || "N/A"}, Engravings: ${jewelEngravings || "None"}`;
    } else { // Clothing & Other
      if (!qDetail || !qTime || !qLocation) {
        alert("Please fill in Description, Date Lost, and Location Lost.");
        return;
      }
      autoClaimReason = `Other/Clothing Claim: Description: ${qDetail}, Marks: ${qMarks || "None"}.`;
      detailSummary = `Details: ${qDetail}, Marks: ${qMarks || "None"}`;
    }

    setSubmittingClaim(true);

    const evidencePayload = {
      descriptionDetail: detailSummary,
      marks: qMarks,
      timeLost: qTime,
      lastLocation: qLocation,
      electronics: {
        brand: elecBrand,
        model: elecModel,
        colour: elecColour,
        serialNumber: elecSerial,
        lockScreen: elecLockScreen,
        case: elecCase
      },
      wallet: {
        colour: walletColour,
        brand: walletBrand,
        contents: walletContents,
        cards: walletCards
      },
      keys: {
        count: keysCount,
        keychain: keysKeychain,
        type: keysType
      },
      jewelry: {
        material: jewelMaterial,
        design: jewelDesign,
        engravings: jewelEngravings,
        size: jewelSize
      }
    };

    try {
      const response = await fetch(`/api/lostfound/${selectedItemToClaim.id}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          claimReason: autoClaimReason,
          itemDetails: detailSummary,
          contactNumber: claimContact,
          proofImage: claimProofUrl,
          evidence: evidencePayload
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit claim request");
      }

      alert("Evidence-based ownership request submitted successfully to Security Desk!");
      setShowClaimModal(false);
      setSelectedItemToClaim(null);
      initializeDb();
      fetchMyClaims();
    } catch (err) {
      alert("Failed to submit claim request. Please try again.");
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForEvidence || !additionalText) return;

    setSubmittingEvidence(true);
    try {
      await provideAdditionalEvidence(selectedClaimForEvidence.id, additionalText, additionalImage);
      alert("Additional evidence submitted to Security desk!");
      setShowEvidenceModal(false);
      setSelectedClaimForEvidence(null);
      setAdditionalText("");
      setAdditionalImage("");
      fetchMyClaims();
      initializeDb();
    } catch (err) {
      alert("Failed to submit evidence.");
    } finally {
      setSubmittingEvidence(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Community Lost & Found 🔍
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse verified found items held by Security, submit claims, or notify Security of your lost property.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => {
              initializeDb();
              fetchMyClaims();
            }} 
            type="button"
            variant="outline" 
            className="rounded-xl border-border/60 hover:bg-secondary/20 h-10 w-10 p-0"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </Button>

          {/* Dialog for Reporting Found Item */}
          <Dialog open={showLfForm} onOpenChange={setShowLfForm}>
            <Button onClick={() => setShowLfForm(true)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-md h-10">
              <Plus className="w-4 h-4 mr-2" /> Found Something?
            </Button>
            <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto bg-card text-foreground border border-border">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)] text-lg">Report Found Item</DialogTitle>
                <DialogDescription>
                  Enter found item details. You must physically hand the item to Security for verification.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleReportFoundSubmit} className="space-y-4 mt-2 text-xs">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Name</label>
                  <Input placeholder="e.g. Smart Watch, Set of Keys" value={itemName} onChange={(e) => setItemName(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
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
                        {foundPhotoUrl ? "Photo Selected" : "Click to select a photo"}
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
                    {submitting ? "Submitting..." : "Submit to Security"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <Card className="border-border/40 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by description or location..."
              className="pl-10 h-10 text-xs rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold min-w-[150px]"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="browse-found" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary/40 border border-border/30 p-1 rounded-xl h-11 flex overflow-x-auto gap-0.5 max-w-full">
          <TabsTrigger value="browse-found" className="rounded-lg text-xs font-semibold px-4 h-9">Recently Found ({filteredFeed.length})</TabsTrigger>
          <TabsTrigger value="my-claims" className="rounded-lg text-xs font-semibold px-4 h-9">My Claims ({filteredClaims.length})</TabsTrigger>
          <TabsTrigger value="found-reports" className="rounded-lg text-xs font-semibold px-4 h-9">Reported by Me ({filteredMyFoundReports.length})</TabsTrigger>
          <TabsTrigger value="private-alerts" className="rounded-lg text-xs font-semibold px-4 h-9">Private Alerts ({filteredPrivateAlerts.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Recently Found Feed */}
        <TabsContent value="browse-found" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Recently Found Registry</CardTitle>
              <CardDescription>Verified items currently held by Security. Click claim to submit ownership verification details.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {filteredFeed.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No verified found items currently listed.
                </div>
              ) : (
                filteredFeed.map((item) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-secondary/5 transition-colors">
                    <div className="flex gap-4 items-center text-left">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{item.description.split(" - ")[0]}</span>
                          <Badge variant="outline" className="text-[9px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            Held by Security
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description.split(" - ").slice(1).join(" - ")}
                        </p>
                        <div className="flex gap-4 text-[10px] text-muted-foreground mt-1.5">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary/65" /> Location: {item.foundLocation}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary/65" /> Date: {item.dateFound} • {item.timeFound}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {(item.status === "Available" || item.status === "Available for Claim" || item.status === "Claim Pending Verification") && (
                        <Button
                          size="sm"
                          onClick={() => openClaimDialog(item)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold h-9 px-4 border-0"
                        >
                          View & Claim
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: My Claims */}
        <TabsContent value="my-claims" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">My Claims</CardTitle>
              <CardDescription>Ownership requests you have submitted. Security will verify your claim against the actual item.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {filteredClaims.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  You have not submitted any claims.
                </div>
              ) : (
                filteredClaims.map((claim) => {
                  const itemName = claim.item?.description?.split(" - ")[0] || "Found Item";
                  return (
                    <div key={claim.id} className="p-4 flex flex-col md:flex-row justify-between md:items-start gap-4 hover:bg-secondary/5 transition-colors">
                      <div className="space-y-2 text-left flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs">{itemName} (Ref: {claim.id})</span>
                          <Badge className={`text-[9px] font-bold ${
                            claim.status === "Claim Pending Verification" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            claim.status === "More Evidence Required" ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" :
                            claim.status === "Ready for Pickup" ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                            claim.status === "Rejected" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                            "bg-secondary text-muted-foreground"
                          }`}>
                            {claim.status === "Claim Pending Verification" ? "Pending Security Verification" : claim.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground"><strong>Claim details provided:</strong> {claim.claimReason}</p>
                        
                        {/* More Info Request */}
                        {claim.status === "More Evidence Required" && claim.moreEvidenceRequest && (
                          <div className="p-3 bg-purple-500/5 text-xs text-purple-600 rounded-xl border border-purple-500/10 space-y-1">
                            <span className="font-bold flex items-center gap-1"><AlertCircle className="w-4 h-4 shrink-0" /> Security Request:</span>
                            <p>&quot;{claim.moreEvidenceRequest}&quot;</p>
                          </div>
                        )}

                        {/* Rejected Reason */}
                        {claim.status === "Rejected" && claim.rejectReason && (
                          <div className="p-2.5 bg-red-500/5 text-[11px] text-red-500 rounded-lg border border-red-500/10">
                            <strong>Rejection Note:</strong> &quot;{claim.rejectReason}&quot;
                          </div>
                        )}

                        {/* Approved OTP Block */}
                        {claim.status === "Ready for Pickup" && (
                          <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                            <div className="space-y-1">
                              <span className="font-bold text-xs text-emerald-600 flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-600" /> ✅ Ownership Verified</span>
                              <p className="text-[11px] text-muted-foreground">Your claim for the {itemName} has been approved. Please collect it from the Security Desk.</p>
                            </div>
                            {claim.collectionOtp ? (
                              <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-center shrink-0">
                                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">Collection OTP</span>
                                <span className="text-xl font-extrabold text-emerald-700 tracking-widest">{claim.collectionOtp}</span>
                              </div>
                            ) : (
                              <div className="bg-secondary/40 px-4 py-2.5 rounded-xl shrink-0 text-center flex items-center gap-2">
                                <Lock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs font-bold text-muted-foreground">Verification Confirmed</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {claim.status === "More Evidence Required" && (
                        <div className="shrink-0 self-start md:self-center">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedClaimForEvidence(claim);
                              setAdditionalText("");
                              setAdditionalImage("");
                              setShowEvidenceModal(true);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold h-8"
                          >
                            Submit More Proof
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Reported by Me */}
        <TabsContent value="found-reports" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Reported Found Items</CardTitle>
              <CardDescription>Items you have found and reported. Deposit them at the gate desk so Security can verify and publish them.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {filteredMyFoundReports.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No found items reported by you.
                </div>
              ) : (
                filteredMyFoundReports.map((item) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-secondary/5 transition-colors">
                    <div className="flex gap-4 items-center text-left">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{item.description.split(" - ")[0]}</span>
                          <Badge className={`text-[9px] font-bold ${
                            item.status === "Pending Verification" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            item.status === "Available" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                            item.status === "Claim Confirmed" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                            "bg-secondary text-muted-foreground"
                          }`}>
                            {item.status === "Pending Verification" ? "Awaiting Security Verification" : item.status === "Available" ? "Published" : item.status}
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

        {/* Tab 4: Private Alerts */}
        <TabsContent value="private-alerts" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Private Lost Alerts</CardTitle>
                <CardDescription>Notify Security privately of your lost items. This registry is only visible to Security Officers.</CardDescription>
              </div>
              <Dialog open={showLostForm} onOpenChange={setShowLostForm}>
                <Button onClick={() => setShowLostForm(true)} size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-md">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Notify Security
                </Button>
                <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto bg-card text-foreground border border-border">
                  <DialogHeader>
                    <DialogTitle className="font-[family-name:var(--font-heading)] text-lg">Notify Security of Lost Item</DialogTitle>
                    <DialogDescription>
                      This alert goes privately to Security to cross-reference if they find a matching item.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleReportLostSubmit} className="space-y-4 mt-2 text-xs">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Name</label>
                      <Input placeholder="e.g. AirPods, Keys, Wallet" value={lostItemName} onChange={(e) => setLostItemName(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                      <select
                        value={lostItemCategory}
                        onChange={(e) => setLostItemCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Description / Distinguishing features</label>
                      <Textarea placeholder="Color, brand, keychains, markings..." value={lostDescription} onChange={(e) => setLostDescription(e.target.value)} className="min-h-[80px] text-xs rounded-xl" required />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Last Seen Location</label>
                      <Input placeholder="e.g. Near gym building, Tower A elevators" value={lostLastSeenLocation} onChange={(e) => setLostLastSeenLocation(e.target.value)} className="h-10 text-xs rounded-xl" required />
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
                        <Send className="w-4 h-4 mr-1.5 shrink-0" />
                        {lostSubmitting ? "Sending alert..." : "Send Private Alert to Security"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {filteredPrivateAlerts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No private alerts logged. Click Notify Security to submit one.
                </div>
              ) : (
                filteredPrivateAlerts.map((report) => (
                  <div key={report.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-start gap-4 hover:bg-secondary/5 transition-colors">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{report.itemName}</span>
                        <Badge variant="outline" className="text-[9px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                          Private Notice to Security
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{report.description}</p>
                      <div className="flex gap-4 text-[10px] text-muted-foreground pt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Lost: {report.lastSeenLocation}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date: {report.dateLost} at {report.timeLost || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Claim Submission Dialog (Questionnaire) */}
      <Dialog open={showClaimModal} onOpenChange={setShowClaimModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)] flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-indigo-500" />
              Ownership verification form
            </DialogTitle>
            <DialogDescription className="text-xs">
              Answer the questions below to submit ownership proof. This information will only be shared with Security.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleClaimSubmit} className="space-y-4 mt-2 text-xs">
            {selectedItemToClaim && (
              <div className="p-3 bg-secondary/35 rounded-xl border border-border/80 text-left space-y-0.5">
                <div className="font-bold text-foreground">Item: {selectedItemToClaim.description.split(" - ")[0]}</div>
                <div className="text-muted-foreground text-[10px]">Category: {selectedItemToClaim.category}</div>
              </div>
            )}

            {selectedItemToClaim && (
              <div className="space-y-4">
                {/* 1. Electronics Form */}
                {selectedItemToClaim.category === "Electronics" && (
                  <div className="space-y-3 text-left">
                    <span className="font-bold text-[10px] text-indigo-500 uppercase tracking-wider block">Electronics Ownership Details:</span>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">What brand is the device? *</label>
                      <Input placeholder="e.g. Apple, Samsung, Sony" value={elecBrand} onChange={(e) => setElecBrand(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Model Name *</label>
                      <Input placeholder="e.g. iPhone 13, Galaxy Buds Pro" value={elecModel} onChange={(e) => setElecModel(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Device Colour *</label>
                      <Input placeholder="e.g. Space Gray, Lilac" value={elecColour} onChange={(e) => setElecColour(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Serial Number / IMEI (if known)</label>
                      <Input placeholder="e.g. F2LGR102N24" value={elecSerial} onChange={(e) => setElecSerial(e.target.value)} className="h-10 text-xs rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Lockscreen wallpaper description or passcode hint</label>
                      <Input placeholder="e.g. Photo of a golden retriever, hint: 1995" value={elecLockScreen} onChange={(e) => setElecLockScreen(e.target.value)} className="h-10 text-xs rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Protective Case Cover description</label>
                      <Input placeholder="e.g. Red silicone case with Spigen logo" value={elecCase} onChange={(e) => setElecCase(e.target.value)} className="h-10 text-xs rounded-xl" />
                    </div>
                  </div>
                )}

                {/* 2. Keys Form */}
                {selectedItemToClaim.category === "Keys" && (
                  <div className="space-y-3 text-left">
                    <span className="font-bold text-[10px] text-indigo-500 uppercase tracking-wider block">Keys Ownership Details:</span>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Number of keys on the ring? *</label>
                      <Input placeholder="e.g. 3 keys, 1 key fob" value={keysCount} onChange={(e) => setKeysCount(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Type of keys (house, vehicle, cabinet...) *</label>
                      <Input placeholder="e.g. House key and Honda car key" value={keysType} onChange={(e) => setKeysType(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Describe the keyring / keychain / lanyard *</label>
                      <Input placeholder="e.g. Blue lanyard, metal ring with leather tag" value={keysKeychain} onChange={(e) => setKeysKeychain(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                  </div>
                )}

                {/* 3. Documents Form */}
                {selectedItemToClaim.category === "Documents" && (
                  <div className="space-y-3 text-left">
                    <span className="font-bold text-[10px] text-indigo-500 uppercase tracking-wider block">Document Ownership Details:</span>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Type of Document? *</label>
                      <Input placeholder="e.g. Aadhaar Card, Passport, Driver's License" value={walletBrand} onChange={(e) => setWalletBrand(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Name printed on the document *</label>
                      <Input placeholder="Must match the document exactly" value={walletColour} onChange={(e) => setWalletColour(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Document ID Number / Serial (if known)</label>
                      <Input placeholder="e.g. PAN number, Card digits" value={walletCards} onChange={(e) => setWalletCards(e.target.value)} className="h-10 text-xs rounded-xl" />
                    </div>
                  </div>
                )}

                {/* 4. Wallets/Bags Form */}
                {selectedItemToClaim.category === "Wallets/Bags" && (
                  <div className="space-y-3 text-left">
                    <span className="font-bold text-[10px] text-indigo-500 uppercase tracking-wider block">Wallet/Bag Ownership Details:</span>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Brand / Make</label>
                      <Input placeholder="e.g. Herschel backpack, Wildcraft wallet" value={walletBrand} onChange={(e) => setWalletBrand(e.target.value)} className="h-10 text-xs rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Color and Material *</label>
                      <Input placeholder="e.g. Black leather, green canvas" value={walletColour} onChange={(e) => setWalletColour(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Describe credit cards / IDs inside (names, bank...)</label>
                      <Input placeholder="e.g. Debit card under Rahul Mehta, Gym card" value={walletCards} onChange={(e) => setWalletCards(e.target.value)} className="h-10 text-xs rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Detailed list of contents (cash amount, items inside) *</label>
                      <Textarea placeholder="e.g. Approx $50 cash (two 20s and a 10), house key, pen" value={walletContents} onChange={(e) => setWalletContents(e.target.value)} className="min-h-[80px] rounded-xl text-xs" required />
                    </div>
                  </div>
                )}

                {/* 5. Jewelry Form */}
                {selectedItemToClaim.category === "Jewelry" && (
                  <div className="space-y-3 text-left">
                    <span className="font-bold text-[10px] text-indigo-500 uppercase tracking-wider block">Jewelry Ownership Details:</span>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Material / Metal Type *</label>
                      <Input placeholder="e.g. 24K Gold, Sterling Silver" value={jewelMaterial} onChange={(e) => setJewelMaterial(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Type of Jewelry & Design *</label>
                      <Input placeholder="e.g. Chain necklace with cross pendant, Ring with diamond" value={jewelDesign} onChange={(e) => setJewelDesign(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Custom Engravings or Inscriptions</label>
                      <Input placeholder="e.g. Initials 'R.M.' inside band" value={jewelEngravings} onChange={(e) => setJewelEngravings(e.target.value)} className="h-10 text-xs rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Approx Size or Length</label>
                      <Input placeholder="e.g. Size 7, 18-inch length" value={jewelSize} onChange={(e) => setJewelSize(e.target.value)} className="h-10 text-xs rounded-xl" />
                    </div>
                  </div>
                )}

                {/* 6. Other & Clothing Form */}
                {(selectedItemToClaim.category === "Other" || selectedItemToClaim.category === "Clothing") && (
                  <div className="space-y-3 text-left">
                    <span className="font-bold text-[10px] text-indigo-500 uppercase tracking-wider block">Item Ownership Details:</span>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Detailed Description of the item *</label>
                      <Textarea placeholder="Explain size, color, brand, print, pattern, etc." value={qDetail} onChange={(e) => setQDetail(e.target.value)} className="min-h-[80px] rounded-xl text-xs" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Any distinguishing marks / scratches / details</label>
                      <Input placeholder="e.g. Small tear on inner seam, sticker on back" value={qMarks} onChange={(e) => setQMarks(e.target.value)} className="h-10 text-xs rounded-xl" />
                    </div>
                  </div>
                )}

                {/* Universal Date/Time/Location Lost fields */}
                <div className="pt-3 border-t border-border/40 text-left space-y-3">
                  <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">When & Where was it lost:</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Approx Date Lost *</label>
                      <Input type="date" value={qTime} onChange={(e) => setQTime(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Approx Location Lost *</label>
                      <Input placeholder="e.g. Gym Lobby, Garden path" value={qLocation} onChange={(e) => setQLocation(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border/40 space-y-3">
              <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">Resident Contact:</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Contact Number *</label>
                  <Input placeholder="e.g. +1234567890" value={claimContact} onChange={(e) => setClaimContact(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Upload Photo / Proof URL (Optional)</label>
                  <Input placeholder="https://example.com/proof.jpg" value={claimProofUrl} onChange={(e) => setClaimProofUrl(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-border/40">
              <Button 
                type="submit" 
                disabled={submittingClaim} 
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl font-semibold shadow-md"
              >
                {submittingClaim ? "Submitting..." : "Submit Claim Details"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Additional Evidence Dialog */}
      <Dialog open={showEvidenceModal} onOpenChange={setShowEvidenceModal}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Submit Additional Proof</DialogTitle>
            <DialogDescription className="text-xs">
              Provide more information as requested by Security to evaluate ownership.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEvidenceSubmit} className="space-y-4 mt-2 text-xs">
            {selectedClaimForEvidence && (
              <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 text-left space-y-1">
                <span className="text-[10px] font-bold text-purple-600 uppercase block">Security Request:</span>
                <p className="text-muted-foreground text-xs font-medium">&quot;{selectedClaimForEvidence.moreEvidenceRequest}&quot;</p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Additional Text Proof / Details *</label>
              <Textarea 
                placeholder="Explain in detail or add more evidence text..." 
                value={additionalText} 
                onChange={(e) => setAdditionalText(e.target.value)} 
                className="min-h-[80px] rounded-xl text-xs"
                required 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Additional Proof Photo URL (Optional)</label>
              <Input 
                placeholder="https://example.com/more-proof.jpg" 
                value={additionalImage} 
                onChange={(e) => setAdditionalImage(e.target.value)} 
                className="h-10 text-xs rounded-xl" 
              />
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-border/40">
              <Button type="submit" disabled={submittingEvidence} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl font-semibold text-xs shadow-md">
                {submittingEvidence ? "Submitting Proof..." : "Submit Proof to Security"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
