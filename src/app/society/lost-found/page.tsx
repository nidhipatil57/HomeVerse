"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Trophy, Plus, Camera, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function LostFoundPage() {
  const { user, initialize } = useAuth();
  const {
    lostFoundItems, reportLostFoundItem, claimLostFoundItem,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      lostFoundItems: state.lostFoundItems || [],
      reportLostFoundItem: state.reportLostFoundItem,
      claimLostFoundItem: state.claimLostFoundItem,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  // Report form state
  const [lfTitle, setLfTitle] = useState("");
  const [lfDesc, setLfDesc] = useState("");
  const [showLfForm, setShowLfForm] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const activeLfItems = lostFoundItems.filter(item => item.portal === "society");

  const filteredItems = activeLfItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleReportLf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lfTitle.trim() || !lfDesc.trim()) return;

    reportLostFoundItem({
      title: lfTitle,
      description: lfDesc,
      reporterId: user?.id || "user-resident-1",
      reporterName: user?.name || "Nidhi Kumar",
      portal: "society"
    });

    setLfTitle("");
    setLfDesc("");
    setShowLfForm(false);
    alert("Item reported successfully to the lost & found registry!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Lost & Found 🔍
          </h1>
          <p className="text-muted-foreground mt-1">
            Report missing belongings or browse items recovered inside Sunshine Complex common areas
          </p>
        </div>

        <Dialog open={showLfForm} onOpenChange={setShowLfForm}>
          <DialogTrigger
            render={
              <Button className="rounded-xl gradient-primary text-white border-0 shadow-md">
                <Plus className="w-4 h-4 mr-2" /> Report Lost/Found Item
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Report Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleReportLf} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Title</label>
                <Input placeholder="e.g. Leather Wallet, Keys Keychain" value={lfTitle} onChange={(e) => setLfTitle(e.target.value)} className="h-10 text-xs rounded-xl" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Details & Location Found/Lost</label>
                <Textarea placeholder="Where was it last seen or found? Add descriptions..." value={lfDesc} onChange={(e) => setLfDesc(e.target.value)} className="min-h-[80px] text-xs rounded-xl" required />
              </div>
              <Button type="submit" className="w-full h-10 gradient-primary text-white border-0 rounded-xl font-semibold text-xs mt-2">
                Submit Report
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search items, wallets, keys, accessories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl h-11 text-xs"
        />
      </div>

      {/* Items list */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isReporter = item.reporterId === user?.id;
          return (
            <motion.div key={item.id} variants={fadeInUp}>
              <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                <div className="aspect-[16/9] bg-secondary/30 relative flex items-center justify-center text-muted-foreground/30 font-bold border-b">
                  <Trophy className="w-12 h-12 text-primary/30" />
                  <Badge className="absolute top-3 left-3 bg-secondary/80 text-foreground border-border text-[9px] hover:bg-secondary capitalize">
                    {item.status}
                  </Badge>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">Reported by: {item.reporterName}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t flex justify-end items-center">
                    {item.status === "reported" ? (
                      !isReporter ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            claimLostFoundItem(item.id, user?.id || "user-resident-1", user?.name || "Nidhi Kumar");
                            alert("Claim request logged! Security and reporter notified.");
                          }}
                          className="rounded-lg h-8 text-[10px] px-3 font-semibold gradient-primary text-white border-0"
                        >
                          Claim Belonging
                        </Button>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px]">
                          Pending Claim
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Handed Over
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-20 text-muted-foreground border rounded-2xl bg-secondary/5">
            No items reported in the lost & found registry.
          </div>
        )}
      </motion.div>
    </div>
  );
}
