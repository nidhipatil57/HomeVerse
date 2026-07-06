"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Trophy, Plus, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function HostelLostFoundPage() {
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

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const activeLfItems = lostFoundItems.filter(item => item.portal === "hostel");

  const filteredItems = activeLfItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Lost & Found Registry 🔍
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse recovered accessories, keys, or folders found inside the hostel block wings
        </p>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search keys, wallets, cards..."
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
                    <p className="text-[10px] text-muted-foreground mt-2 font-semibold">Found by: {item.reporterName}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t flex justify-end items-center">
                    {item.status === "reported" ? (
                      !isReporter ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            claimLostFoundItem(item.id, user?.id || "user-student-1", user?.name || "Aarav Mehta");
                            alert("Claim request logged! Warden and reporter notified.");
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
