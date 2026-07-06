"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, ShoppingBag, Tag, Trash2, CheckCircle2 } from "lucide-react";
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

export default function BuySellPage() {
  const { user, initialize } = useAuth();
  const {
    marketplaceItems,
    listMarketplaceItem,
    sellMarketplaceItem,
    deleteMarketplaceItem,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      marketplaceItems: state.marketplaceItems || [],
      listMarketplaceItem: state.listMarketplaceItem,
      sellMarketplaceItem: state.sellMarketplaceItem,
      deleteMarketplaceItem: state.deleteMarketplaceItem,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  // Listing Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Furniture");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isSecretary = user?.role === "secretary";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Buy & Sell 🛒
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse goods, furniture, electronics, and books listed for sale by your neighbors
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl gradient-primary text-white border-0 shadow-md">
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
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search listed goods, furniture, electronics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl h-11 text-xs"
        />
      </div>

      {/* Main Content */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <CardTitle className="text-base font-bold line-clamp-1">{item.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 border-t border-secondary mt-auto flex items-center justify-between gap-3 bg-secondary/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-[8px] bg-secondary border">{item.sellerName[0]}</AvatarFallback>
                    </Avatar>
                    <span>Seller: {item.sellerName}</span>
                  </div>

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
    </div>
  );
}
