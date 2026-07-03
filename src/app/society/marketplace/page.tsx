"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, Star, Search, Plus, ShoppingBag, Tag, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import Link from "next/link";

const localVendors = [
  { name: "Ramesh Plumbing Services", category: "Plumber", rating: 4.8, reviews: 124, verified: true, initials: "RP", color: "from-blue-500 to-cyan-500" },
  { name: "Sharma Electricals & Spares", category: "Electrician", rating: 4.6, reviews: 89, verified: true, initials: "SE", color: "from-amber-500 to-yellow-500" },
  { name: "Meera's Home Cleaning", category: "Housekeeping", rating: 4.9, reviews: 203, verified: true, initials: "MC", color: "from-pink-500 to-rose-500" },
  { name: "Kumar Maths & Coding Tutors", category: "Tutor", rating: 4.7, reviews: 56, verified: true, initials: "KT", color: "from-green-500 to-emerald-500" },
];

export default function SocietyMarketplacePage() {
  const { user, initialize } = useAuth();
  const { marketplaceItems, listMarketplaceItem, sellMarketplaceItem, initializeDb } = useCommunityStore();
  const [mounted, setMounted] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"services" | "buysell">("buysell");

  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Furniture");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter State
  const [search, setSearch] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWorker = user?.role === "worker";

  // Filter listings
  const societyItems = marketplaceItems.filter(item => {
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
      price: price.startsWith("₹") ? price : `₹${price}`,
      description,
      category,
      sellerId: user?.id || "user-resident-1",
      sellerName: user?.name || "Nidhi Kumar",
      portal: "society"
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
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Community Marketplace 🏪</h1>
          <p className="text-muted-foreground mt-1">Hire verified local vendors or trade pre-loved household assets with neighbours</p>
        </div>

        {activeTab === "buysell" && !isWorker && (
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
                <DialogTitle className="font-[family-name:var(--font-heading)]">Post Classified Ads</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleListItem} className="space-y-4 mt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Title</label>
                  <Input placeholder="e.g. Wooden Crib / Sofa set" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl h-11" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Price (INR)</label>
                    <Input placeholder="e.g. 1500" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl h-11" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                    >
                      <option value="Furniture">Furniture</option>
                      <option value="Cycles">Cycles</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Books">Books</option>
                      <option value="Toys">Toys</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Description</label>
                  <Textarea placeholder="Add item details: condition, age, usage..." value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl min-h-[80px]" required />
                </div>
                <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11">
                  Publish Advertisement
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
          <Tag className="w-3.5 h-3.5 mr-1" /> Peer-to-Peer Buy & Sell
        </Button>
        <Button
          variant={activeTab === "services" ? "default" : "outline"}
          size="sm"
          className={`rounded-lg text-xs ${activeTab === "services" ? "gradient-primary text-white border-0" : ""}`}
          onClick={() => setActiveTab("services")}
        >
          <Store className="w-3.5 h-3.5 mr-1" /> Local Vendor Services
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={activeTab === "services" ? "Search plumbers, electricians..." : "Search items for sale..."} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl h-11" />
      </div>

      {/* Content Panels */}
      {activeTab === "services" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {localVendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase())).map((s) => (
            <Card key={s.name} className="border-border/50 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className={`text-sm font-bold text-white bg-gradient-to-br ${s.color}`}>{s.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-semibold">{s.name}</h3>
                      {s.verified && <Badge className="text-[9px] bg-green-500/10 text-green-600 border-green-500/20">Verified</Badge>}
                    </div>
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
                  <span className="text-xs text-muted-foreground">({s.reviews} reviews)</span>
                </div>
                <Link href="/society/complaints">
                  <Button className="w-full rounded-xl" variant="outline" size="sm">Book Service Request</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {societyItems.map((item) => {
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
                    <Badge className={isSold ? "bg-gray-500/10 text-gray-500" : "bg-green-500/15 text-green-500"}>
                      {isSold ? "Sold out" : "Available"}
                    </Badge>
                  </div>

                  {!isSold && !isWorker && !isMine ? (
                    <Button onClick={() => sellMarketplaceItem(item.id)} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 border-0 flex items-center justify-center gap-1.5 font-semibold">
                      <ShoppingBag className="w-4 h-4" /> Purchase Item
                    </Button>
                  ) : (
                    <Button disabled size="sm" className="w-full bg-secondary/80 text-muted-foreground rounded-lg h-9">
                      {isSold ? "Sold out" : isMine ? "Your Listing" : "View Details"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {societyItems.length === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground text-sm border rounded-2xl">No classified listings found.</div>
          )}
        </div>
      )}
    </div>
  );
}
