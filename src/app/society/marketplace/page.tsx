"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, Star, Search, Plus, ShoppingBag, Tag, Check, Trash2, ShieldCheck, PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import Link from "next/link";

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
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      marketplaceItems: state.marketplaceItems || [],
      listMarketplaceItem: state.listMarketplaceItem,
      sellMarketplaceItem: state.sellMarketplaceItem,
      deleteMarketplaceItem: state.deleteMarketplaceItem,
      initializeDb: state.initializeDb,
    }))
  );
  
  const [mounted, setMounted] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"services" | "buysell">("buysell");

  // Form State
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

  // Filter State
  const [search, setSearch] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isSecretary = user?.role === "secretary";

  // Load registered workers for this resident's society
  const registeredWorkers = users.filter(
    (u) => u.role === "worker" && u.communityCode === user?.communityCode
  );

  const dbWorkers = registeredWorkers.map(w => ({
    name: w.name,
    category: w.workerCategory || "Staff",
    rating: 4.8,
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

  const filteredItems = marketplaceItems.filter((item) => {
    if (item.portal !== "society") return false;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            HomeVerse Marketplace 🛒
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSecretary ? "Moderate resident postings and manage verified local service registries" : "Buy and sell items within your society or book verified local service technicians"}
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
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={activeTab === "buysell" ? "Search listed goods, furniture, electronics..." : "Search plumbing, electrical, tutors, housekeeping..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl h-11 text-xs"
        />
      </div>

      {/* Main Content Split */}
      <AnimatePresence mode="wait">
        {activeTab === "buysell" ? (
          <motion.div key="buysell" variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isOwner = item.sellerId === user?.id;
              return (
                <motion.div key={item.id} variants={fadeInUp}>
                  <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
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
        ) : (
          <motion.div key="services" variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <Card className="border-border/50 hover:shadow-md transition-shadow relative">
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
      </AnimatePresence>
    </div>
  );
}
