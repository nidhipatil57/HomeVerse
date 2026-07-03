"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, Star, Search, Plus, ShoppingBag, Tag } from "lucide-react";
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

const campusVendors = [
  { name: "Campus Xerox & Printing", category: "Printing / Stationery", rating: 4.7, reviews: 89, initials: "CX", color: "from-blue-500 to-cyan-500" },
  { name: "Bhaiya Ji Late Night Tea", category: "Snacks & Refreshment", rating: 4.9, reviews: 234, initials: "BC", color: "from-amber-500 to-yellow-500" },
  { name: "Quick Fix Mobile Repair", category: "Gadgets Service", rating: 4.5, reviews: 45, initials: "QF", color: "from-green-500 to-emerald-500" },
  { name: "Laundry Express (Express Delivery)", category: "Clothes wash", rating: 4.6, reviews: 112, initials: "LE", color: "from-pink-500 to-rose-500" },
];

export default function HostelMarketplacePage() {
  const { user, initialize } = useAuth();
  const { marketplaceItems, listMarketplaceItem, sellMarketplaceItem, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      marketplaceItems: state.marketplaceItems,
      listMarketplaceItem: state.listMarketplaceItem,
      sellMarketplaceItem: state.sellMarketplaceItem,
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
  const [category, setCategory] = useState("Cycles");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter State
  const [search, setSearch] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWarden = user?.role === "warden";

  // Filter listings
  const hostelItems = marketplaceItems.filter(item => {
    if (item.portal !== "hostel") return false;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleListItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim() || !description.trim()) return;

    listMarketplaceItem({
      title,
      price: price.startsWith("₹") ? price : `₹${price}`,
      description,
      category,
      sellerId: user?.id || "user-student-1",
      sellerName: user?.name || "Aarav Mehta",
      portal: "hostel"
    });

    setTitle("");
    setPrice("");
    setDescription("");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Campus Marketplace 🏪</h1>
          <p className="text-muted-foreground mt-1">Book services around campus or trade study materials, cycles, or hostel appliances</p>
        </div>

        {activeTab === "buysell" && !isWarden && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4 mr-2" /> List Item
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)]">List Item for Sale</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleListItem} className="space-y-4 mt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Item name</label>
                  <Input placeholder="e.g. Study table lamp / lab coat" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl h-11" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Price (INR)</label>
                    <Input placeholder="e.g. 350" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl h-11" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                    >
                      <option value="Cycles">Cycles</option>
                      <option value="Notes">Notes / Textbooks</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Electronics">Electronics</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Description</label>
                  <Textarea placeholder="Explain item condition, age, campus pickup spot..." value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl min-h-[80px]" required />
                </div>
                <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11">
                  List Campus Ad
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/20 pb-2">
        <Button
          variant={activeTab === "buysell" ? "default" : "outline"}
          size="sm"
          className={`rounded-lg text-xs ${activeTab === "buysell" ? "gradient-primary text-white border-0" : ""}`}
          onClick={() => setActiveTab("buysell")}
        >
          <Tag className="w-3.5 h-3.5 mr-1" /> Student P2P Buy & Sell
        </Button>
        <Button
          variant={activeTab === "services" ? "default" : "outline"}
          size="sm"
          className={`rounded-lg text-xs ${activeTab === "services" ? "gradient-primary text-white border-0" : ""}`}
          onClick={() => setActiveTab("services")}
        >
          <Store className="w-3.5 h-3.5 mr-1" /> Campus Vendor Services
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={activeTab === "services" ? "Search campus printing, chai..." : "Search peer listings..."} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl h-11" />
      </div>

      {/* Lists */}
      {activeTab === "services" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campusVendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase())).map((s) => (
            <Card key={s.name} className="border-border/50 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className={`text-sm font-bold text-white bg-gradient-to-br ${s.color}`}>{s.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(s.rating) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{s.rating}</span>
                  <span className="text-xs text-muted-foreground">({s.reviews})</span>
                </div>
                <Button className="w-full rounded-xl" variant="outline" size="sm">Call Vendor Shop</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hostelItems.map((item) => {
            const isSold = item.status === "sold";
            const isMine = item.sellerId === user?.id;

            return (
              <Card key={item.id} className={`border-border/50 flex flex-col justify-between h-[230px] ${isSold ? "opacity-60" : ""}`}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[9px]">{item.category}</Badge>
                    <span className="text-lg font-extrabold text-foreground">{item.price}</span>
                  </div>
                  <CardTitle className="text-base font-bold mt-1 text-foreground line-clamp-1">{item.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2 leading-relaxed">&quot;{item.description}&quot;</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="border-t border-border/20 pt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Seller: {item.sellerName}</span>
                    <Badge className={isSold ? "bg-gray-500/10 text-gray-500 animate-none" : "bg-green-500/15 text-green-500"}>
                      {isSold ? "Sold out" : "For Sale"}
                    </Badge>
                  </div>

                  {!isSold && !isWarden && !isMine ? (
                    <Button onClick={() => sellMarketplaceItem(item.id)} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 border-0 flex items-center justify-center gap-1.5 font-semibold">
                      <ShoppingBag className="w-4 h-4" /> Settle Purchase
                    </Button>
                  ) : (
                    <Button disabled size="sm" className="w-full bg-secondary/80 text-muted-foreground rounded-lg h-9">
                      {isSold ? "Sold out" : isMine ? "Your Item Ad" : "Details Locked"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {hostelItems.length === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground text-sm border rounded-2xl">No campus student listings found.</div>
          )}
        </div>
      )}
    </div>
  );
}
