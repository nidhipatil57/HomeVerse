"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Plus, ShoppingBag, Tag, Trash2, CheckCircle2, Heart, MessageSquare, 
  Phone, Share2, ExternalLink, Eye, Clock, UserCheck, Building2, Sparkles, 
  Filter, SlidersHorizontal, ArrowUpDown, CheckCheck, RotateCcw, Edit2, 
  Image as ImageIcon, X, ShieldCheck, AlertTriangle, ChevronLeft, ChevronRight,
  Info, IndianRupee, Layers, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore, MarketplaceItem, MarketplaceEnquiry } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const CATEGORIES = [
  "All Items",
  "Furniture",
  "Electronics",
  "Books",
  "Home Appliances",
  "Clothing",
  "Sports Equipment",
  "Musical Instruments",
  "Other"
] as const;

const CONDITIONS = ["All Conditions", "New", "Like New", "Good", "Fair"] as const;

const PRESET_IMAGES: Record<string, string> = {
  "Furniture": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80",
  "Electronics": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  "Books": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
  "Home Appliances": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80",
  "Clothing": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80",
  "Sports Equipment": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
  "Musical Instruments": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80",
  "Other": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"
};

function formatItemDate(dateStr?: string | null): string {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

export default function BuySellPage() {
  const { user, initialize } = useAuth();
  const {
    marketplaceItems,
    marketplaceEnquiries,
    marketplaceSavedIds,
    listMarketplaceItem,
    updateMarketplaceItem,
    sellMarketplaceItem,
    deleteMarketplaceItem,
    enquireMarketplaceItem,
    toggleSaveMarketplaceItem,
    clearAllMarketplaceData,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      marketplaceItems: state.marketplaceItems || [],
      marketplaceEnquiries: state.marketplaceEnquiries || [],
      marketplaceSavedIds: state.marketplaceSavedIds || [],
      listMarketplaceItem: state.listMarketplaceItem,
      updateMarketplaceItem: state.updateMarketplaceItem,
      sellMarketplaceItem: state.sellMarketplaceItem,
      deleteMarketplaceItem: state.deleteMarketplaceItem,
      enquireMarketplaceItem: state.enquireMarketplaceItem,
      toggleSaveMarketplaceItem: state.toggleSaveMarketplaceItem,
      clearAllMarketplaceData: state.clearAllMarketplaceData,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "my-listings" | "saved" | "enquiries">("browse");
  const [myListingsSubTab, setMyListingsSubTab] = useState<"active" | "sold" | "inactive">("active");
  const [enquirySubTab, setEnquirySubTab] = useState<"received" | "sent">("received");

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Items");
  const [selectedCondition, setSelectedCondition] = useState<string>("All Conditions");
  const [priceRange, setPriceRange] = useState<"all" | "under1k" | "1k-5k" | "5k-15k" | "above15k">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<MarketplaceItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Form States (Create & Edit)
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<string>("Furniture");
  const [formCondition, setFormCondition] = useState<string>("Good");
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContactPref, setFormContactPref] = useState<string>("In-app");
  const [formPhone, setFormPhone] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enquiry Message Form State
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [isEnquiring, setIsEnquiring] = useState(false);
  const [enquirySentSuccess, setEnquirySentSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  const isSecretary = user?.role === "secretary";

  // Auto-populate phone and contact info
  useEffect(() => {
    if (user?.phone && !formPhone) {
      setFormPhone(user.phone);
    }
  }, [user, formPhone]);

  // Reset form
  const resetForm = () => {
    setFormTitle("");
    setFormCategory("Furniture");
    setFormCondition("Good");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormDescription("");
    setFormContactPref("In-app");
    setFormPhone(user?.phone || "");
    setFormImages([]);
    setEditingItem(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditDialog = (item: MarketplaceItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormCondition(item.condition || "Good");
    setFormPrice(item.price.replace(/[^\d.]/g, ""));
    setFormOriginalPrice(item.originalPrice ? item.originalPrice.replace(/[^\d.]/g, "") : "");
    setFormDescription(item.description);
    setFormContactPref(item.contactPreference || "In-app");
    setFormPhone(item.contactPhone || user?.phone || "");
    setFormImages(item.images && item.images.length > 0 ? [...item.images] : (item.image ? [item.image] : []));
    setIsEditOpen(true);
  };

  // Image Upload Handler via FileReader
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is larger than 5MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addPresetImage = (cat: string) => {
    const url = PRESET_IMAGES[cat] || PRESET_IMAGES["Other"];
    if (url && !formImages.includes(url)) {
      setFormImages((prev) => [...prev, url]);
    }
  };

  const removeFormImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Submit Listing (Create)
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPrice.trim() || !formDescription.trim()) {
      alert("Please complete all required fields (Item Name, Price, and Description).");
      return;
    }

    const numPrice = parseFloat(formPrice.replace(/[^\d.]/g, ""));
    if (isNaN(numPrice) || numPrice <= 0) {
      alert("Please enter a valid positive price.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalImages = formImages.length > 0 ? formImages : [PRESET_IMAGES[formCategory] || PRESET_IMAGES["Other"]];
      
      await listMarketplaceItem({
        title: formTitle.trim(),
        description: formDescription.trim(),
        price: numPrice.toString(),
        originalPrice: formOriginalPrice ? formOriginalPrice.trim() : null,
        condition: formCondition,
        category: formCategory,
        images: finalImages,
        image: finalImages[0],
        sellerId: user?.id || "user-resident-1",
        sellerName: user?.name || "Resident",
        flatNumber: user?.unit || "Flat 202",
        building: user?.building || "A Wing",
        contactPreference: formContactPref,
        contactPhone: formPhone.trim(),
        portal: "society"
      });

      setIsCreateOpen(false);
      resetForm();
      alert("Item listed successfully in the society marketplace!");
    } catch (err: any) {
      alert(err?.message || "Failed to create listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Listing (Edit)
  const handleEditListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!formTitle.trim() || !formPrice.trim() || !formDescription.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    const numPrice = parseFloat(formPrice.replace(/[^\d.]/g, ""));
    if (isNaN(numPrice) || numPrice <= 0) {
      alert("Please enter a valid positive price.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalImages = formImages.length > 0 ? formImages : [PRESET_IMAGES[formCategory] || PRESET_IMAGES["Other"]];

      await updateMarketplaceItem(editingItem.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        price: numPrice.toString(),
        originalPrice: formOriginalPrice ? formOriginalPrice.trim() : null,
        condition: formCondition,
        category: formCategory,
        images: finalImages,
        image: finalImages[0],
        contactPreference: formContactPref,
        contactPhone: formPhone.trim()
      });

      setIsEditOpen(false);
      resetForm();
      alert("Listing updated successfully!");
    } catch (err: any) {
      alert(err?.message || "Failed to update listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark As Sold Handler
  const handleMarkSold = async (item: MarketplaceItem) => {
    if (confirm(`Mark "${item.title}" as SOLD? This will move it to your Sold Listings and remove it from active browsing.`)) {
      await sellMarketplaceItem(item.id);
      if (selectedDetailItem?.id === item.id) {
        setSelectedDetailItem(null);
      }
      alert(`"${item.title}" has been marked as Sold!`);
    }
  };

  // Delete Listing Handler
  const handleDeleteListing = async (item: MarketplaceItem) => {
    const isOwner = item.sellerId === user?.id;
    const promptMsg = isOwner 
      ? `Are you sure you want to delete your listing for "${item.title}"?`
      : `[Secretary Moderation] Are you sure you want to remove listing "${item.title}" from ${item.sellerName}?`;

    if (confirm(promptMsg)) {
      await deleteMarketplaceItem(item.id);
      if (selectedDetailItem?.id === item.id) {
        setSelectedDetailItem(null);
      }
      alert("Listing removed from community marketplace.");
    }
  };

  // Submit In-App Enquiry Handler
  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetailItem) return;
    if (!enquiryMessage.trim()) {
      alert("Please write a message to the seller.");
      return;
    }

    setIsEnquiring(true);
    try {
      await enquireMarketplaceItem(selectedDetailItem.id, enquiryMessage.trim(), {
        buyerFlat: user?.unit ? `Flat ${user.unit}` : "Resident Flat",
        buyerPhone: user?.phone || ""
      });
      setEnquirySentSuccess(true);
      setEnquiryMessage("");
      setTimeout(() => setEnquirySentSuccess(false), 4000);
    } catch (err: any) {
      alert(err?.message || "Failed to send enquiry.");
    } finally {
      setIsEnquiring(false);
    }
  };

  // Secretary Fresh Reset Handler
  const handleResetMarketplaceClean = async () => {
    if (confirm("Reset the entire Buy & Sell marketplace to fresh/empty? This will delete all active listings, enquiries, and saved bookmarks across the community.")) {
      await clearAllMarketplaceData();
      alert("Marketplace has been completely cleared and reset to fresh!");
    }
  };

  // Filtered public browse items (only active items in society)
  const publicActiveItems = useMemo(() => {
    const seen = new Set<string>();
    return (marketplaceItems || [])
      .filter((item) => {
        if (!item || !item.id) return false;
        if (seen.has(item.id)) return false;
        seen.add(item.id);

        if (item.portal && item.portal !== "society") return false;
        // Only active listings in public marketplace
        const status = (item.status || "active").toLowerCase();
        if (status !== "active" && status !== "available") return false;

        // Price range filter
        const rawPrice = parseFloat(String(item.price || "0").replace(/[^\d.]/g, ""));
        if (priceRange === "under1k" && rawPrice >= 1000) return false;
        if (priceRange === "1k-5k" && (rawPrice < 1000 || rawPrice > 5000)) return false;
        if (priceRange === "5k-15k" && (rawPrice < 5000 || rawPrice > 15000)) return false;
        if (priceRange === "above15k" && rawPrice <= 15000) return false;

        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchSeller = item.sellerName?.toLowerCase().includes(q);
          const matchCategory = item.category?.toLowerCase().includes(q);
          const matchFlat = item.flatNumber?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSeller && !matchCategory && !matchFlat) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = parseFloat(String(a.price || "0").replace(/[^\d.]/g, ""));
        const priceB = parseFloat(String(b.price || "0").replace(/[^\d.]/g, ""));
        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        // Default newest
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [marketplaceItems, priceRange, search, sortBy]);

  // My listings
  const myListings = useMemo(() => {
    const seen = new Set<string>();
    return (marketplaceItems || []).filter((i) => {
      if (!i || !i.id || seen.has(i.id)) return false;
      seen.add(i.id);
      return i.sellerId === user?.id;
    });
  }, [marketplaceItems, user]);

  const myListingsFiltered = useMemo(() => {
    return myListings.filter((item) => {
      const status = (item.status || "active").toLowerCase();
      if (myListingsSubTab === "active") return status === "active" || status === "available";
      if (myListingsSubTab === "sold") return status === "sold";
      return status === "inactive";
    });
  }, [myListings, myListingsSubTab]);

  // Saved items
  const savedItems = useMemo(() => {
    const seen = new Set<string>();
    return (marketplaceItems || []).filter((item) => {
      if (!item || !item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return marketplaceSavedIds.includes(item.id);
    });
  }, [marketplaceItems, marketplaceSavedIds]);

  // Enquiries received (as seller) and sent (as buyer)
  const receivedEnquiries = useMemo(() => {
    const seen = new Set<string>();
    return (marketplaceEnquiries || []).filter((enq) => {
      if (!enq || !enq.id || seen.has(enq.id)) return false;
      seen.add(enq.id);
      return enq.sellerId === user?.id;
    });
  }, [marketplaceEnquiries, user]);

  const sentEnquiries = useMemo(() => {
    const seen = new Set<string>();
    return (marketplaceEnquiries || []).filter((enq) => {
      if (!enq || !enq.id || seen.has(enq.id)) return false;
      seen.add(enq.id);
      return enq.buyerId === user?.id || enq.buyerPhone === user?.phone;
    });
  }, [marketplaceEnquiries, user]);

  if (!mounted || !user) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ========================================================================= */}
      {/* Secretary Oversight Banner */}
      {/* ========================================================================= */}
      {isSecretary && (
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">Society Marketplace Oversight & Moderation</h3>
                <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30">Secretary Privileges</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitor community trade, review listing safety, and remove inappropriate posts across all society flats.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetMarketplaceClean}
              className="h-8 text-xs font-semibold text-rose-600 border-rose-300 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
              title="Wipe marketplace records clean"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Fresh Marketplace
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Header & Quick Action */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold font-[family-name:var(--font-heading)] flex items-center gap-2 text-foreground">Buy & Sell</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Browse pre-owned goods, furniture, electronics, and books listed for sale by your verified neighbors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openCreateDialog}
            className="rounded-xl h-10 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" /> List Item for Sale
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Main Navigation Tabs */}
      {/* ========================================================================= */}
      <div className="flex border-b border-border/50 gap-2 text-xs font-semibold overflow-x-auto no-scrollbar">
        {[
          { id: "browse", label: "Browse Marketplace", count: publicActiveItems.length },
          { id: "my-listings", label: "My Listings", count: myListings.length },
          { id: "saved", label: "Saved Items", count: savedItems.length },
          { id: "enquiries", label: "Enquiries", count: receivedEnquiries.length + sentEnquiries.length }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BROWSE MARKETPLACE */}
      {/* ========================================================================= */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Search & Filter Controls Card */}
          <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md">
            <CardContent className="p-3.5">
              {/* Row 1: Search & Price Range & Sort */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-6 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search listed goods, seller name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 rounded-xl h-10 text-xs bg-background"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-border/80 bg-background text-xs text-foreground font-medium"
                  >
                    <option value="all">All Prices</option>
                    <option value="under1k">Under ₹1,000</option>
                    <option value="1k-5k">₹1,000 – ₹5,000</option>
                    <option value="5k-15k">₹5,000 – ₹15,000</option>
                    <option value="above15k">Above ₹15,000</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-border/80 bg-background text-xs text-foreground font-medium"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Cards Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {publicActiveItems.map((item, idx) => {
              const isOwner = item.sellerId === user?.id;
              const isSaved = marketplaceSavedIds.includes(item.id);
              const displayImage = (item.images && item.images.length > 0) ? item.images[0] : (item.image || PRESET_IMAGES[item.category] || PRESET_IMAGES["Other"]);
              const rawPrice = parseFloat(String(item.price || "0").replace(/[^\d.]/g, ""));

              return (
                <motion.div key={item.id ? `${item.id}-${idx}` : `mkt-${idx}`} variants={fadeInUp} className="h-full">
                  <Card className="overflow-hidden border-border/60 hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 flex flex-col h-full rounded-2xl group bg-card">
                    {/* Card Media Preview */}
                    <div 
                      onClick={() => {
                        setSelectedDetailItem(item);
                        setActiveImageIndex(0);
                      }}
                      className="aspect-[4/3] bg-muted/40 relative overflow-hidden cursor-pointer flex items-center justify-center border-b border-border/40"
                    >
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            // Fallback to preset or placeholder
                            (e.target as HTMLImageElement).src = PRESET_IMAGES[item.category] || PRESET_IMAGES["Other"];
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                          <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
                          <span className="text-[10px] mt-1 font-semibold">{item.category}</span>
                        </div>
                      )}

                      {/* Top Overlay Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        <Badge className="bg-black/60 backdrop-blur-md text-white border-0 text-[10px] font-semibold px-2 py-0.5">
                          {item.category}
                        </Badge>
                      </div>

                      {/* Bookmark / Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveMarketplaceItem(item.id);
                        }}
                        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                          isSaved
                            ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                            : "bg-black/40 text-white/80 hover:bg-black/60 hover:text-white"
                        }`}
                        title={isSaved ? "Saved in Bookmarks" : "Save Item"}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
                      </button>

                      {/* Image count pill if multiple */}
                      {item.images && item.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-mono flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> {item.images.length}
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div 
                      onClick={() => {
                        setSelectedDetailItem(item);
                        setActiveImageIndex(0);
                      }}
                      className="p-4 flex-1 flex flex-col justify-between cursor-pointer space-y-3"
                    >
                      <div>
                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-[family-name:var(--font-heading)]">
                            ₹{rawPrice.toLocaleString()}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Seller & Location Footer */}
                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Avatar className="w-5 h-5 shrink-0 border">
                            <AvatarFallback className="text-[9px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {item.sellerName?.[0] || "R"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate font-medium">{item.sellerName}</span>
                          <span className="shrink-0">•</span>
                          <span className="font-semibold text-foreground truncate">
                            {item.flatNumber || "Flat"}
                          </span>
                        </div>
                        <span className="text-[10px] shrink-0 font-medium">
                          {formatItemDate(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-3 pt-0 flex items-center gap-2 bg-card">
                      {isOwner ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(item)}
                            className="flex-1 h-8 rounded-xl text-xs font-semibold"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1 text-blue-500" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleMarkSold(item)}
                            className="flex-1 h-8 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Mark Sold
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDetailItem(item);
                              setActiveImageIndex(0);
                            }}
                            className="flex-1 h-8 rounded-xl text-xs font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDetailItem(item);
                              setActiveImageIndex(0);
                            }}
                            className="flex-1 h-8 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5 mr-1" /> Contact
                          </Button>
                        </>
                      )}

                      {/* Secretary Moderation Quick Delete */}
                      {isSecretary && !isOwner && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteListing(item)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                          title="Secretary: Remove Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Empty State */}
          {publicActiveItems.length === 0 && (
            <div className="text-center py-24 px-4 border border-dashed border-border/80 rounded-3xl bg-secondary/10 space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No active listings found</h3>
                <p className="text-xs text-muted-foreground">
                  {search || selectedCategory !== "All Items" || priceRange !== "all"
                    ? "Try adjusting your search criteria or category filters to discover more items."
                    : "The society marketplace is currently fresh. Be the first neighbor to list pre-owned goods for sale!"}
                </p>
              </div>
              <Button
                onClick={openCreateDialog}
                className="rounded-xl h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              >
                <Plus className="w-4 h-4 mr-1.5" /> List First Item
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY LISTINGS (Seller Command Center) */}
      {/* ========================================================================= */}
      {activeTab === "my-listings" && (
        <div className="space-y-6">
          {/* Sub-tabs: Active, Sold, Inactive */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/50 border border-border/60">
              {[
                { id: "active", label: "Active Listings", count: myListings.filter(i => (i.status || "active").toLowerCase() === "active" || (i.status || "").toLowerCase() === "available").length },
                { id: "sold", label: "Sold Items", count: myListings.filter(i => i.status?.toLowerCase() === "sold").length },
                { id: "inactive", label: "Removed / Inactive", count: myListings.filter(i => i.status?.toLowerCase() === "inactive").length }
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setMyListingsSubTab(sub.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    myListingsSubTab === sub.id
                      ? "bg-background text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sub.label} ({sub.count})
                </button>
              ))}
            </div>

            <Button
              size="sm"
              onClick={openCreateDialog}
              className="h-9 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Listing
            </Button>
          </div>

          {/* My Listings List / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myListingsFiltered.map((item, idx) => {
              const displayImage = (item.images && item.images.length > 0) ? item.images[0] : (item.image || PRESET_IMAGES[item.category] || PRESET_IMAGES["Other"]);
              const rawPrice = parseFloat(String(item.price || "0").replace(/[^\d.]/g, ""));
              const itemEnqs = marketplaceEnquiries.filter((e) => e.itemId === item.id);

              return (
                <Card key={item.id ? `${item.id}-${idx}` : `my-${idx}`} className="overflow-hidden border-border/60 rounded-2xl flex flex-col justify-between bg-card shadow-sm">
                  <div>
                    <div className="aspect-[16/9] bg-muted/40 relative overflow-hidden flex items-center justify-center border-b">
                      {displayImage ? (
                        <img src={displayImage} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
                      )}
                      <Badge className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[10px]">
                        {item.category}
                      </Badge>
                      <Badge
                        className={`absolute top-2.5 right-2.5 text-[10px] font-bold ${
                          item.status?.toLowerCase() === "sold"
                            ? "bg-emerald-600 text-white"
                            : item.status?.toLowerCase() === "inactive"
                            ? "bg-slate-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {item.status?.toUpperCase() || "ACTIVE"}
                      </Badge>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₹{rawPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ID: {item.id}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                        <span>Listed: {formatItemDate(item.createdAt)}</span>
                      </div>

                      {itemEnqs.length > 0 && (
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-[11px] text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{itemEnqs.length} Enquiry received from neighbors</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-border/40 mt-3 flex items-center gap-2">
                    {item.status?.toLowerCase() !== "sold" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(item)}
                          className="flex-1 h-8 rounded-xl text-xs font-semibold"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1 text-blue-500" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleMarkSold(item)}
                          className="flex-1 h-8 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Mark Sold
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteListing(item)}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                      title="Remove Listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {myListingsFiltered.length === 0 && (
            <div className="text-center py-20 border border-dashed border-border/80 rounded-3xl bg-secondary/10 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                No {myListingsSubTab} listings under your account
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Got pre-owned furniture, devices, or books to sell? List them to your apartment community right now!
              </p>
              <Button
                onClick={openCreateDialog}
                className="rounded-xl h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              >
                <Plus className="w-4 h-4 mr-1.5" /> List an Item
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SAVED ITEMS (Bookmarks) */}
      {/* ========================================================================= */}
      {activeTab === "saved" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Your Saved Items</h2>
              <p className="text-xs text-muted-foreground">Keep track of interesting community goods you might want to buy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {savedItems.map((item, idx) => {
              const displayImage = (item.images && item.images.length > 0) ? item.images[0] : (item.image || PRESET_IMAGES[item.category] || PRESET_IMAGES["Other"]);
              const rawPrice = parseFloat(String(item.price || "0").replace(/[^\d.]/g, ""));
              const isSold = item.status?.toLowerCase() === "sold";

              return (
                <Card key={item.id ? `${item.id}-${idx}` : `saved-${idx}`} className="overflow-hidden border-border/60 rounded-2xl flex flex-col justify-between bg-card shadow-sm">
                  <div>
                    <div 
                      onClick={() => {
                        setSelectedDetailItem(item);
                        setActiveImageIndex(0);
                      }}
                      className="aspect-[4/3] bg-muted/40 relative overflow-hidden cursor-pointer flex items-center justify-center border-b"
                    >
                      {displayImage ? (
                        <img src={displayImage} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
                      )}
                      {isSold && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveMarketplaceItem(item.id);
                        }}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30"
                        title="Remove from saved"
                      >
                        <Heart className="w-4 h-4 fill-white" />
                      </button>
                    </div>

                    <div className="p-4 space-y-2">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ₹{rawPrice.toLocaleString()}
                      </span>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      <p className="text-[11px] text-muted-foreground pt-1">
                        Seller: <strong>{item.sellerName}</strong> ({item.flatNumber || "Flat"})
                      </p>
                    </div>
                  </div>

                  <div className="p-3 pt-0 border-t border-border/40 mt-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDetailItem(item);
                        setActiveImageIndex(0);
                      }}
                      className="flex-1 h-8 rounded-xl text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                    </Button>
                    {!isSold && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDetailItem(item);
                          setActiveImageIndex(0);
                        }}
                        className="flex-1 h-8 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1" /> Contact
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {savedItems.length === 0 && (
            <div className="text-center py-20 border border-dashed border-border/80 rounded-3xl bg-secondary/10 space-y-2">
              <Heart className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">No saved listings yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Click the heart icon on any marketplace card to bookmark goods you want to check later!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ENQUIRIES (Buyer-Seller Inbox) */}
      {/* ========================================================================= */}
      {activeTab === "enquiries" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <button
              onClick={() => setEnquirySubTab("received")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                enquirySubTab === "received"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              Enquiries Received as Seller ({receivedEnquiries.length})
            </button>
            <button
              onClick={() => setEnquirySubTab("sent")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                enquirySubTab === "sent"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              Enquiries Sent as Buyer ({sentEnquiries.length})
            </button>
          </div>

          <div className="space-y-3">
            {(enquirySubTab === "received" ? receivedEnquiries : sentEnquiries).map((enq) => {
              const matchedItem = marketplaceItems.find((i) => i.id === enq.itemId);

              return (
                <Card key={enq.id} className="p-4 border-border/60 rounded-2xl bg-card shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/30 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {enquirySubTab === "received" ? `From: ${enq.buyerName}` : `To Seller of: ${enq.itemTitle || "Item"}`}
                        </span>
                        {enq.buyerFlat && (
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200">
                            {enq.buyerFlat}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Concerning Item: <strong className="text-foreground">{enq.itemTitle || "Marketplace Product"}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatItemDate(enq.createdAt)}</span>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="p-3 rounded-xl bg-secondary/30 text-xs text-foreground font-medium border border-border/30">
                    "{enq.message}"
                  </div>

                  {/* Contact Details & Quick Response */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                      {enq.buyerPhone && (
                        <a href={`tel:${enq.buyerPhone}`} className="hover:text-blue-600 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {enq.buyerPhone}
                        </a>
                      )}
                      {enq.buyerPhone && (
                        <a
                          href={`https://wa.me/${enq.buyerPhone.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(enq.buyerName)},%20regarding%20your%20enquiry%20on%20${encodeURIComponent(enq.itemTitle || "my item")}:`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" /> Reply on WhatsApp
                        </a>
                      )}
                    </div>

                    {matchedItem && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDetailItem(matchedItem);
                          setActiveImageIndex(0);
                        }}
                        className="h-7 text-[11px] px-2 rounded-lg"
                      >
                        <Eye className="w-3 h-3 mr-1" /> View Listing
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}

            {(enquirySubTab === "received" ? receivedEnquiries : sentEnquiries).length === 0 && (
              <div className="text-center py-20 border border-dashed border-border/80 rounded-3xl bg-secondary/10 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <p className="text-sm font-semibold text-foreground">
                  No {enquirySubTab} enquiries yet
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {enquirySubTab === "received" 
                    ? "When neighbors send questions about your listings, their messages will appear here." 
                    : "When you contact sellers about items in the marketplace, your outgoing queries will be tracked here."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIALOG 1: LIST ITEM FOR SALE (Create) */}
      {/* ========================================================================= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg p-5 rounded-2xl overflow-hidden">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-lg font-bold flex items-center gap-2"><Plus className="w-4 h-4 text-blue-600" /> List Item for Sale</DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Post pre-owned goods for sale to all residents in Sunshine Complex.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateListing} className="space-y-3 pt-1 text-xs">
            {/* Item Title & Category */}
            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-7">
                <label className="text-[11px] font-bold text-foreground block mb-0.5">Item Title *</label>
                <Input
                  placeholder="e.g. Ergonomic Office Chair"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-8 rounded-lg text-xs"
                  required
                />
              </div>
              <div className="col-span-5">
                <label className="text-[11px] font-bold text-foreground block mb-0.5">Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border/80 bg-background text-xs text-foreground font-medium"
                >
                  {CATEGORIES.filter(c => c !== "All Items").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Contact preference & Phone */}
            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-4">
                <label className="text-[11px] font-bold text-foreground block mb-0.5">Selling Price (₹) *</label>
                <Input
                  type="number"
                  placeholder="e.g. 2500"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="h-8 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400"
                  required
                />
              </div>
              <div className="col-span-4">
                <label className="text-[11px] font-bold text-foreground block mb-0.5">Contact Method</label>
                <select
                  value={formContactPref}
                  onChange={(e) => setFormContactPref(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg border border-border/70 bg-background text-xs"
                >
                  <option value="In-app">In-App Enquiry</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Phone">Phone Call</option>
                </select>
              </div>
              <div className="col-span-4">
                <label className="text-[11px] font-bold text-foreground block mb-0.5">Contact Phone</label>
                <Input
                  placeholder="Phone number"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="h-8 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-bold text-foreground block mb-0.5">Description *</label>
              <Textarea
                placeholder="Give details about specifications, dimensions, and pick-up details..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
                className="min-h-[46px] max-h-[52px] rounded-lg text-xs leading-snug py-1.5 px-2.5 resize-none"
                required
              />
            </div>

            {/* Product Images Upload */}
            <div>
              <label className="text-[11px] font-bold text-foreground block mb-1">Product Images</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="marketplace-file-upload"
                />
                <label
                  htmlFor="marketplace-file-upload"
                  className="h-9 px-3 rounded-lg border border-dashed border-border/80 bg-secondary/15 hover:bg-secondary/30 transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Upload Photos</span>
                </label>

                {/* Thumbnails */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {formImages.map((img, idx) => (
                    <div key={idx} className="relative w-9 h-9 rounded-lg overflow-hidden border border-border/70 shrink-0 group">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFormImage(idx)}
                        className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/70 text-white flex items-center justify-center text-[8px] hover:bg-rose-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {formImages.length === 0 && (
                    <span className="text-[10px] text-muted-foreground self-center">Optional product photos</span>
                  )}
                </div>
              </div>
            </div>

            {/* Seller Info strip */}
            <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-secondary/25 border border-border/40 text-muted-foreground">
              <span className="flex items-center gap-1 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Seller: <strong className="text-foreground">{user.name}</strong>
              </span>
              <span>Unit: <strong className="text-foreground">{user.unit ? `Flat ${user.unit}` : "Resident"}</strong></span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 active:scale-[0.99] transition-all"
            >
              {isSubmitting ? "Listing item..." : "Publish Item to Marketplace"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 2: EDIT LISTING */}
      {/* ========================================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg p-5 rounded-2xl overflow-hidden">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-lg font-bold flex items-center gap-2"><Edit2 className="w-4 h-4 text-blue-600" /> Edit Listing</DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Update details or adjust price for your listing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditListing} className="space-y-3 pt-1 text-xs">
            {/* Title & Category */}
            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-7">
                <label className="text-[11px] font-bold text-foreground block mb-0.5">Item Title *</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-8 rounded-lg text-xs"
                  required
                />
              </div>
              <div className="col-span-5">
                <label className="text-[11px] font-bold text-foreground block mb-0.5">Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border/80 bg-background text-xs font-medium"
                >
                  {CATEGORIES.filter(c => c !== "All Items").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Contact Phone */}
            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-6">
                <label className="text-[11px] font-bold text-foreground block mb-0.5">Selling Price (₹) *</label>
                <Input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="h-8 rounded-lg text-xs font-bold text-blue-600"
                  required
                />
              </div>
              <div className="col-span-6">
                <label className="text-[11px] font-bold text-foreground block mb-0.5">Contact Phone</label>
                <Input
                  placeholder="Phone number"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="h-8 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-bold text-foreground block mb-0.5">Description *</label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
                className="min-h-[46px] max-h-[52px] rounded-lg text-xs leading-snug py-1.5 px-2.5 resize-none"
                required
              />
            </div>

            {/* Images Edit */}
            <div>
              <label className="text-[11px] font-bold text-foreground block mb-1">Product Images</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="marketplace-file-edit-upload"
                />
                <label
                  htmlFor="marketplace-file-edit-upload"
                  className="h-9 px-3 rounded-lg border border-dashed border-border/80 bg-secondary/15 hover:bg-secondary/30 transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Upload Photos</span>
                </label>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {formImages.map((img, idx) => (
                    <div key={idx} className="relative w-9 h-9 rounded-lg overflow-hidden border shrink-0">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFormImage(idx)}
                        className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/70 text-white flex items-center justify-center text-[8px] hover:bg-rose-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20"
            >
              {isSubmitting ? "Saving changes..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 3: ITEM DETAILS & CONTACT MODAL */}
      {/* ========================================================================= */}
      <Dialog open={!!selectedDetailItem} onOpenChange={(open) => !open && setSelectedDetailItem(null)}>
        {selectedDetailItem && (
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
            <div className="space-y-5">
              {/* Image Carousel / Gallery */}
              {(() => {
                const images = selectedDetailItem.images && selectedDetailItem.images.length > 0
                  ? selectedDetailItem.images
                  : [selectedDetailItem.image || PRESET_IMAGES[selectedDetailItem.category] || PRESET_IMAGES["Other"]];
                const activeImg = images[activeImageIndex] || images[0];

                return (
                  <div className="space-y-2.5">
                    <div className="aspect-[16/10] bg-muted/40 rounded-2xl overflow-hidden relative border flex items-center justify-center">
                      <img
                        src={activeImg}
                        alt={selectedDetailItem.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PRESET_IMAGES[selectedDetailItem.category] || PRESET_IMAGES["Other"];
                        }}
                      />
                      <Badge className="absolute top-3 left-3 bg-black/60 text-white text-xs">
                        {selectedDetailItem.category}
                      </Badge>
                      <Badge
                        className={`absolute top-3 right-3 text-xs font-bold ${
                          selectedDetailItem.status?.toLowerCase() === "sold"
                            ? "bg-rose-600 text-white"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {selectedDetailItem.status?.toUpperCase() || "ACTIVE"}
                      </Badge>

                      {/* Navigation arrows if multiple images */}
                      {images.length > 1 && (
                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                          <button
                            type="button"
                            onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                            className="pointer-events-auto w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                            className="pointer-events-auto w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image thumbnails */}
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto p-1">
                        {images.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                              activeImageIndex === idx ? "border-blue-600 ring-2 ring-blue-500/20" : "border-border/60 opacity-70"
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Title & Price Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-border/40 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-foreground">{selectedDetailItem.title}</h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>Listed: {formatItemDate(selectedDetailItem.createdAt)}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-[family-name:var(--font-heading)]">
                    ₹{parseFloat(String(selectedDetailItem.price || "0").replace(/[^\d.]/g, "")).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Item Details</h4>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-secondary/15 p-3.5 rounded-2xl border border-border/40">
                  {selectedDetailItem.description}
                </p>
              </div>

              {/* Verified Seller Identity Box */}
              <div className="p-4 rounded-2xl border border-border/60 bg-secondary/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-10 h-10 border shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                      {selectedDetailItem.sellerName?.[0] || "R"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-foreground truncate">{selectedDetailItem.sellerName}</span>
                      <span title="Verified Resident"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /></span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {selectedDetailItem.flatNumber || "Flat"} • {selectedDetailItem.building || "Sunshine Complex"}
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] bg-background border-border/60 shrink-0">
                  Prefers: {selectedDetailItem.contactPreference || "In-app"}
                </Badge>
              </div>

              {/* Buyer Interactive Actions / Seller Controls */}
              {selectedDetailItem.sellerId === user.id ? (
                /* Owner Actions */
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const itemToEdit = selectedDetailItem;
                        setSelectedDetailItem(null);
                        openEditDialog(itemToEdit);
                      }}
                      className="flex-1 h-10 rounded-xl text-xs font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Edit Listing
                    </Button>
                    {selectedDetailItem.status?.toLowerCase() !== "sold" && (
                      <Button
                        onClick={() => handleMarkSold(selectedDetailItem)}
                        className="flex-1 h-10 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="w-3.5 h-3.5 mr-1.5" /> Mark Sold
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteListing(selectedDetailItem)}
                      className="h-10 px-3 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>

                  {/* Enquiries Received for this item */}
                  {(() => {
                    const itemEnqs = marketplaceEnquiries.filter((e) => e.itemId === selectedDetailItem.id);
                    if (itemEnqs.length === 0) return null;

                    return (
                      <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                        <h4 className="text-xs font-bold text-blue-950 dark:text-blue-100 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Received Enquiries ({itemEnqs.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto divide-y divide-border/20">
                          {itemEnqs.map((enq) => (
                            <div key={enq.id} className="pt-2 text-[11px] space-y-1">
                              <div className="flex justify-between font-bold">
                                <span>{enq.buyerName} ({enq.buyerFlat || "Flat"})</span>
                                <span className="text-[10px] text-muted-foreground">{formatItemDate(enq.createdAt)}</span>
                              </div>
                              <p className="text-muted-foreground italic">"{enq.message}"</p>
                              {enq.buyerPhone && (
                                <a href={`tel:${enq.buyerPhone}`} className="text-blue-600 hover:underline inline-block">
                                  📞 {enq.buyerPhone}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Non-owner / Buyer Interaction */
                <div className="space-y-4 pt-2 border-t border-border/40">
                  {selectedDetailItem.status?.toLowerCase() === "sold" ? (
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
                      This item has already been marked as SOLD by the seller.
                    </div>
                  ) : (
                    <>
                      {/* Contact Options */}
                      <div className="flex gap-2">
                        {/* WhatsApp if available */}
                        {selectedDetailItem.contactPhone && (
                          <a
                            href={`https://wa.me/${selectedDetailItem.contactPhone.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(selectedDetailItem.sellerName)},%20I%20saw%20your%20listing%20"${encodeURIComponent(selectedDetailItem.title)}"%20on%20HomeVerse.%20Is%20it%20available?`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1"
                          >
                            <Button variant="outline" className="w-full h-10 rounded-xl text-xs font-semibold text-emerald-600 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
                            </Button>
                          </a>
                        )}

                        {/* Phone Call if available */}
                        {selectedDetailItem.contactPhone && (
                          <a href={`tel:${selectedDetailItem.contactPhone}`} className="flex-1">
                            <Button variant="outline" className="w-full h-10 rounded-xl text-xs font-semibold">
                              <Phone className="w-3.5 h-3.5 mr-1.5" /> Call Seller
                            </Button>
                          </a>
                        )}

                        {/* Save Bookmark */}
                        <Button
                          variant="outline"
                          onClick={() => toggleSaveMarketplaceItem(selectedDetailItem.id)}
                          className={`h-10 px-3 rounded-xl text-xs ${
                            marketplaceSavedIds.includes(selectedDetailItem.id)
                              ? "text-rose-600 border-rose-300"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${marketplaceSavedIds.includes(selectedDetailItem.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                          {marketplaceSavedIds.includes(selectedDetailItem.id) ? "Saved" : "Save"}
                        </Button>
                      </div>

                      {/* In-App Direct Enquiry Form */}
                      <form onSubmit={handleSendEnquiry} className="space-y-3 pt-2">
                        <label className="text-xs font-bold text-foreground block">
                          Send In-App Enquiry to {selectedDetailItem.sellerName}
                        </label>
                        <Textarea
                          placeholder={`Hi ${selectedDetailItem.sellerName}, I am interested in your ${selectedDetailItem.title}. Is it still available for inspection?`}
                          value={enquiryMessage}
                          onChange={(e) => setEnquiryMessage(e.target.value)}
                          className="min-h-[70px] rounded-xl text-xs"
                          required
                        />

                        {enquirySentSuccess && (
                          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                            <CheckCheck className="w-4 h-4 text-emerald-600" />
                            Your enquiry has been dispatched to {selectedDetailItem.sellerName}!
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={isEnquiring}
                          className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                          {isEnquiring ? "Sending enquiry..." : "Send Message to Seller"}
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
