"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store, Star, Search, Plus, ShoppingBag, Tag, Check, Trash2, ShieldCheck,
  PhoneCall, Briefcase, MapPin, Award, Clock, Phone, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const localVendors = [
  { name: "Ramesh Plumbing Services", category: "Plumber", rating: 4.8, reviews: 124, verified: true, initials: "RP", color: "from-blue-500 to-cyan-500", phone: "+91 98765 43210" },
  { name: "Sharma Electricals & Spares", category: "Electrician", rating: 4.6, reviews: 89, verified: true, initials: "SE", color: "from-amber-500 to-yellow-500", phone: "+91 98765 43211" },
  { name: "Meera's Home Cleaning", category: "Housekeeping", rating: 4.9, reviews: 203, verified: true, initials: "MC", color: "from-pink-500 to-rose-500", phone: "+91 98765 43212" },
  { name: "Kumar Maths & Coding Tutors", category: "Tutor", rating: 4.7, reviews: 56, verified: true, initials: "KT", color: "from-green-500 to-emerald-500", phone: "+91 98765 43213" },
];

export default function SocietyMarketplacePage() {
  const { user, initialize } = useAuth();
  const {
    users,
    marketplaceItems,
    listMarketplaceItem,
    sellMarketplaceItem,
    deleteMarketplaceItem,
    sendNotification,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      marketplaceItems: state.marketplaceItems || [],
      listMarketplaceItem: state.listMarketplaceItem,
      sellMarketplaceItem: state.sellMarketplaceItem,
      deleteMarketplaceItem: state.deleteMarketplaceItem,
      sendNotification: state.sendNotification,
      initializeDb: state.initializeDb,
    }))
  );
  
  const [mounted, setMounted] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"buysell" | "services" | "localhelp">("buysell");

  // Buy & Sell Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Furniture");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Vendor form state (Secretary only)
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorCat, setNewVendorCat] = useState("Plumber");
  const [newVendorPhone, setNewVendorPhone] = useState("");
  const [showVendorDialog, setShowVendorDialog] = useState(false);

  // Dynamic state for vendors
  const [vendorsList, setVendorsList] = useState(localVendors);

  // Filter & Search States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "nearest" | "experience" | "active">("rating");

  // Contact Dialog State
  const [contactWorker, setContactWorker] = useState<any>(null);
  const [bookingSuccessWorker, setBookingSuccessWorker] = useState<string | null>(null);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isSecretary = user?.role === "secretary";

  // 1. Get verified vendors for "Verified Service Registry"
  const registeredWorkersForRegistry = users.filter(
    (u) => u.role === "worker" && u.communityCode === user?.communityCode
  );

  const dbWorkers = registeredWorkersForRegistry.map(w => ({
    name: w.name,
    category: w.workerCategory || "Staff",
    rating: w.rating || 4.8,
    reviews: 14,
    verified: true,
    initials: w.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
    color: "from-blue-600 to-indigo-600",
    phone: w.phone
  }));

  const allVendors = [
    ...vendorsList.map(v => ({ ...v, color: "from-purple-500 to-indigo-500" })),
    ...dbWorkers
  ];

  const filteredVendors = allVendors.filter((v) => {
    const query = search.toLowerCase();
    const nameMatch = v.name.toLowerCase().includes(query);
    const categoryMatch = v.category.toLowerCase().includes(query);
    return nameMatch || categoryMatch;
  });

  // 2. Filter Goods
  const filteredItems = marketplaceItems.filter((item) => {
    if (item.portal !== "society") return false;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // 3. Find Local Help (Workers List)
  const societyWorkers = users.filter(
    (u) => u.role === "worker" && u.communityCode === user?.communityCode && u.status === "approved"
  );

  // Generate stable mock distance
  const getDistance = (workerId: string) => {
    const code = workerId.charCodeAt(workerId.length - 1) || 0;
    return ((code % 7 + 1) * 0.2).toFixed(1);
  };

  // Filter and Sort Workers
  const getFilteredWorkers = () => {
    let result = [...societyWorkers];

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter(w => (w.workerCategory || "").toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by search query (matches name or specific specializations/services)
    if (search.trim() !== "") {
      const query = search.toLowerCase();
      result = result.filter(w => {
        const nameMatch = w.name.toLowerCase().includes(query);
        const specMatch = w.specializations?.some(s => s.toLowerCase().includes(query)) || false;
        const categoryMatch = (w.workerCategory || "").toLowerCase().includes(query);
        return nameMatch || specMatch || categoryMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "experience") {
        const expA = parseInt(a.experience || "0", 10);
        const expB = parseInt(b.experience || "0", 10);
        return expB - expA;
      }
      if (sortBy === "nearest") {
        const distA = parseFloat(getDistance(a.id));
        const distB = parseFloat(getDistance(b.id));
        return distA - distB;
      }
      if (sortBy === "active") {
        // Mock recent activity sort
        return b.joinedAt.localeCompare(a.joinedAt);
      }
      return 0;
    });

    return result;
  };

  const handleListItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim() || !description.trim()) return;

    listMarketplaceItem({
      title,
      price,
      description,
      category,
      sellerId: user?.id || "resident-user",
      sellerName: user?.name || "Nidhi Kumar",
      portal: "society",
      image: "/images/marketplace-placeholder.jpg"
    });

    setTitle("");
    setPrice("");
    setDescription("");
    setDialogOpen(false);
    alert("Item listed successfully in community marketplace!");
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim() || !newVendorPhone.trim()) return;

    const newV = {
      name: newVendorName,
      category: newVendorCat,
      rating: 5.0,
      reviews: 1,
      verified: true,
      initials: newVendorName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      color: "from-purple-500 to-indigo-500",
      phone: newVendorPhone
    };

    setVendorsList([newV, ...vendorsList]);
    setNewVendorName("");
    setNewVendorPhone("");
    setShowVendorDialog(false);
    alert("Verified local vendor added successfully!");
  };

  const handleRemoveVendor = (name: string) => {
    setVendorsList(vendorsList.filter(v => v.name !== name));
    alert("Vendor removed from verified registry.");
  };

  const handleContactWorker = (worker: any) => {
    setContactWorker(worker);
  };

  const handleBookWorker = (worker: any) => {
    // Send notification to worker
    sendNotification(
      worker.id,
      "New Booking Request 📅",
      `Resident ${user?.name} (Flat ${user?.unit || "N/A"}) has requested your service. Contact: ${user?.phone}`,
      "info"
    );
    
    // Send success notification to resident
    sendNotification(
      user?.id || "resident-user",
      "Booking Request Sent",
      `Service booking request has been sent to ${worker.name}.`,
      "success"
    );

    setBookingSuccessWorker(worker.name);
    setTimeout(() => {
      setBookingSuccessWorker(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            HomeVerse Marketplace 🛒
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSecretary 
              ? "Moderate resident postings and manage verified local service registries" 
              : activeTab === "localhelp"
                ? "Find, search, and book domestic help and service providers in your complex"
                : "Buy and sell items within your society or book verified local service technicians"
            }
          </p>
        </div>

        <div className="flex gap-2">
          {activeTab === "buysell" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                render={
                  <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                    <Plus className="w-4 h-4 mr-2" /> List Item for Sale
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-[family-name:var(--font-heading)]">List Item for Sale</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleListItem} className="space-y-4 mt-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Title</label>
                    <Input placeholder="e.g. Study Desk, Bicycle" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Price (₹)</label>
                      <Input type="number" placeholder="Price in ₹" value={price} onChange={(e) => setPrice(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-10 px-3 border rounded-xl text-xs bg-card">
                        <option>Electronics</option>
                        <option>Furniture</option>
                        <option>Bicycles</option>
                        <option>Books / Notes</option>
                        <option>Other Accessories</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Description</label>
                    <Textarea placeholder="Item condition, usage period, location details..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px] text-xs rounded-xl" required />
                  </div>
                  <Button type="submit" className="w-full h-10 gradient-primary text-white border-0 rounded-xl font-semibold text-xs mt-2">
                    Submit Listing
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {activeTab === "services" && isSecretary && (
            <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
              <DialogTrigger
                render={
                  <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                    <Plus className="w-4 h-4 mr-2" /> Add Verified Vendor
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-[family-name:var(--font-heading)]">Add Verified Local Vendor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddVendor} className="space-y-4 mt-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Vendor/Agency Name</label>
                    <Input placeholder="e.g. Verma Dry Cleaners" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} className="h-10 text-xs rounded-xl" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                      <select value={newVendorCat} onChange={(e) => setNewVendorCat(e.target.value)} className="w-full h-10 px-3 border rounded-xl text-xs bg-card">
                        <option>Plumber</option>
                        <option>Electrician</option>
                        <option>Housekeeping</option>
                        <option>Tutor</option>
                        <option>Carpenter</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone Number</label>
                      <Input value={newVendorPhone} onChange={(e) => setNewVendorPhone(e.target.value)} className="h-10 text-xs rounded-xl" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-10 gradient-primary text-white border-0 rounded-xl font-semibold text-xs mt-2">
                    Register Vendor Link
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-border/50 pb-px">
        <div className="flex gap-6">
          {[
            { id: "buysell", label: "Buy & Sell Listings", icon: Tag },
            { id: "services", label: "Verified Service Registry", icon: Store },
            { id: "localhelp", label: "Find Local Help 🛠️", icon: Briefcase },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearch(""); // Reset search
                }}
                className={`flex items-center gap-1.5 pb-3.5 text-sm font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Booking Alert Banner */}
      <AnimatePresence>
        {bookingSuccessWorker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-sm"
          >
            <Check className="w-4.5 h-4.5 shrink-0" />
            <span>Success: Service request has been logged. {bookingSuccessWorker} has been notified.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Filter Row */}
      {activeTab !== "localhelp" ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === "buysell" ? "Search listed goods, furniture, electronics..." : "Search plumbing, electrical, tutors, housekeeping..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl h-11 text-xs"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search worker name or specific services (e.g. Cleaning, Leakage, Fan Installation)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl h-11 text-xs"
              />
            </div>
            
            <div className="flex items-center gap-2 self-stretch md:self-auto">
              <span className="text-xs text-muted-foreground shrink-0 font-semibold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-11 px-3 border border-input rounded-xl text-xs bg-background flex-1 md:flex-initial"
              >
                <option value="rating">⭐️ Highest Rated</option>
                <option value="nearest">📍 Nearest First</option>
                <option value="experience">💼 Most Experienced</option>
                <option value="active">⏱️ Recently Active</option>
              </select>
            </div>
          </div>

          {/* Horizontal Category Selection Bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-wrap">
            {["All", "Maid", "Electrician", "Plumber", "Carpenter", "Painter", "Housekeeping", "Gardener"].map((cat) => (
              <Button
                key={cat}
                type="button"
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full text-xs h-8 px-4 font-semibold ${
                  selectedCategory === cat ? "gradient-primary text-white border-0 shadow-sm" : ""
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Split */}
      <AnimatePresence mode="wait">
        {activeTab === "buysell" && (
          <motion.div key="buysell" variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isOwner = item.sellerId === user?.id;
              return (
                <motion.div key={item.id} variants={fadeInUp}>
                  <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-card/60 backdrop-blur-md">
                    <div className="aspect-[4/3] bg-secondary/30 relative flex items-center justify-center text-muted-foreground/30 font-bold border-b">
                      <ShoppingBag className="w-12 h-12" />
                      <Badge className="absolute top-3 left-3 bg-secondary/80 text-foreground border-border text-[9px] hover:bg-secondary">
                        {item.category}
                      </Badge>
                      <Badge className="absolute top-3 right-3 gradient-primary text-white border-0 text-sm font-bold shadow-md">
                        ₹{item.price}
                      </Badge>
                    </div>
                    <CardHeader className="p-4 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base font-bold line-clamp-1">{item.title}</CardTitle>
                      </div>
                      <CardDescription className="text-xs line-clamp-2 mt-1">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 border-t border-secondary mt-auto flex items-center justify-between gap-3 bg-secondary/5">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[8px] bg-secondary border">{item.sellerName[0]}</AvatarFallback>
                        </Avatar>
                        <span>Seller: {item.sellerName}</span>
                      </div>

                      {/* Moderate / Delete Actions */}
                      <div className="flex gap-1.5 mt-2">
                        {item.status === "available" && isOwner && (
                          <Button
                            onClick={() => {
                              sellMarketplaceItem(item.id);
                              alert("Item marked as sold!");
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-8 text-[10px] px-2.5 font-bold"
                          >
                            Mark Sold
                          </Button>
                        )}
                        {item.status === "sold" && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 text-[10px]">
                            Sold
                          </Badge>
                        )}
                        {(isOwner || isSecretary) && (
                          <Button
                            onClick={() => deleteMarketplaceItem(item.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground rounded-lg p-0"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-20 text-muted-foreground border rounded-2xl bg-secondary/5">
                No marketplace listings found.
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "services" && (
          <motion.div key="services" variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <Card className="border-border/50 hover:shadow-md transition-shadow relative bg-card/60 backdrop-blur-md">
                  {isSecretary && localVendors.some(v => v.name === vendor.name) && (
                    <Button
                      onClick={() => handleRemoveVendor(vendor.name)}
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 w-7 h-7 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg p-0"
                      title="De-register Vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <CardContent className="p-4 flex items-start gap-3.5 text-xs">
                    <div className="w-10 h-10 rounded-xl gradient-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {vendor.initials}
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-foreground text-sm truncate">{vendor.name}</h4>
                          {vendor.verified && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-semibold">{vendor.category}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                        <span className="font-bold">{vendor.rating}</span>
                        <span className="text-muted-foreground text-[10px]">({vendor.reviews} reviews)</span>
                      </div>
                      <a href={`tel:${vendor.phone}`} className="block">
                        <Button size="sm" variant="outline" className="w-full rounded-lg h-8 text-[10px] mt-1 flex items-center justify-center gap-1">
                          <PhoneCall className="w-3 h-3 text-emerald-500" /> Contact Vendor
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {filteredVendors.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-20 text-muted-foreground border rounded-2xl bg-secondary/5">
                No local vendors registered in current directory.
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "localhelp" && (
          <motion.div key="localhelp" variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredWorkers().map((worker) => (
              <motion.div key={worker.id} variants={fadeInUp}>
                <Card className="border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-card/60 backdrop-blur-md">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-bold">
                            {worker.workerCategory}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" /> {getDistance(worker.id)} km
                          </span>
                        </div>
                        <CardTitle className="text-base font-bold mt-1">{worker.name}</CardTitle>
                      </div>
                      <Badge className={
                        worker.availability === "Available" 
                          ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 border-0 text-[9px] font-bold"
                          : worker.availability === "Busy"
                            ? "bg-red-500/10 text-red-600 hover:bg-red-500/15 border-0 text-[9px] font-bold"
                            : "bg-muted text-muted-foreground border-0 text-[9px] font-bold"
                      }>
                        {worker.availability === "Available" ? "🟢 Available" : worker.availability === "Busy" ? "🔴 Busy" : "⚪ Off Duty"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Rating & Experience */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 text-foreground font-semibold">
                          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                          {worker.rating || 4.7}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-muted-foreground" />
                          {worker.experience || "3 years"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {worker.workingShift ? worker.workingShift.split(" ")[0] : "Day"}
                        </span>
                      </div>

                      {/* Services Offered */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Services Offered</p>
                        <div className="flex flex-wrap gap-1">
                          {worker.specializations && worker.specializations.length > 0 ? (
                            worker.specializations.map((spec) => (
                              <Badge key={spec} variant="secondary" className="text-[9px] font-medium py-0 px-1.5">
                                {spec}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">No specific services selected</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border/20">
                      <Button 
                        onClick={() => handleContactWorker(worker)} 
                        variant="outline" 
                        className="rounded-xl h-9 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-secondary/50"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-500" /> Contact
                      </Button>
                      <Button 
                        onClick={() => handleBookWorker(worker)} 
                        disabled={worker.availability !== "Available"}
                        className="rounded-xl h-9 text-[11px] font-semibold gradient-primary text-white border-0 shadow-sm"
                      >
                        Book Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {getFilteredWorkers().length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-20 text-muted-foreground border rounded-2xl bg-secondary/5">
                No workers found matching selected category and services query.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact dialog */}
      <Dialog open={!!contactWorker} onOpenChange={() => setContactWorker(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          {contactWorker && (
            <>
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)]">Worker Contact Profile</DialogTitle>
                <DialogDescription>Get in touch directly with local help</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2 mt-1">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="text-base bg-secondary border">
                      {contactWorker.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-base font-bold">{contactWorker.name}</h3>
                    <p className="text-xs text-muted-foreground">{contactWorker.workerCategory} • {contactWorker.experience || "3 years"}</p>
                  </div>
                </div>

                <div className="space-y-3.5 bg-secondary/30 p-4 rounded-xl text-xs border border-border/30">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Call Line</span>
                    <a href={`tel:${contactWorker.phone}`} className="font-bold text-primary hover:underline">{contactWorker.phone}</a>
                  </div>
                  <div className="flex justify-between items-center border-t border-border/20 pt-2.5">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Shift / Hours</span>
                    <span className="font-semibold">{contactWorker.workingShift || "Morning (9 AM - 5 PM)"}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border/20 pt-2.5">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" /> Rating</span>
                    <span className="font-bold">{contactWorker.rating || 4.7} / 5.0</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={() => setContactWorker(null)} className="rounded-xl h-10 text-xs font-semibold px-5">
                    Close Details
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
