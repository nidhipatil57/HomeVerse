"use client";

import { useState, useEffect } from "react";
import { Search, Trophy, Plus, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecurityLostFoundPage() {
  const { user, initialize } = useAuth();
  const {
    lostFoundItems, reportLostFoundItem, resolveLostFoundItem, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      lostFoundItems: state.lostFoundItems || [],
      reportLostFoundItem: state.reportLostFoundItem,
      resolveLostFoundItem: state.resolveLostFoundItem,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const handleAddFoundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    reportLostFoundItem({
      title,
      description: `${description || "Found at gate."} Location: ${location}`,
      portal: "society",
      reporterId: user?.id || "sec-guard-1",
      reporterName: user?.name || "Rahul",
      image: "/images/found-placeholder.jpg"
    });

    setTitle("");
    setDescription("");
    setLocation("");
    alert("Recovered item cataloged in society bulletin!");
  };

  const activeLfItems = lostFoundItems.filter(item => item.portal === "society");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Lost & Found Registry 🔍
        </h1>
        <p className="text-muted-foreground mt-1">
          Catalog recovered keys, wallets, or electronics found on premises and log verified handovers
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <Card className="lg:col-span-5 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold">Catalog Recovered Item</CardTitle>
            <CardDescription>File details of found accessories</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFoundSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Item name / Title</label>
                <Input placeholder="e.g. Set of Keys, Black Wallet" value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Recovered Location inside Complex</label>
                <Input placeholder="e.g. Near Swimming Pool lobby" value={location} onChange={(e) => setLocation(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Item Description / Details</label>
                <Input placeholder="e.g. Keychain with red ribbon" value={description} onChange={(e) => setDescription(e.target.value)} className="h-9 rounded-lg text-xs" />
              </div>
              <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 text-xs font-semibold shadow-sm">
                Catalog Item
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: List */}
        <Card className="lg:col-span-7 border-border/50 flex flex-col h-[500px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Trophy className="w-4.5 h-4.5 text-primary" /> Recovered items awaiting handover ({activeLfItems.filter(item => item.status === "reported").length})
            </CardTitle>
            <CardDescription>Verify claim identities before handover resolution</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeLfItems.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No found items currently in gate custody.
              </div>
            ) : (
              activeLfItems.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/15 flex items-center justify-between text-xs hover:bg-secondary/25 transition-colors">
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
                    <p className="text-[9px] text-muted-foreground">Status: <strong className="text-primary capitalize">{item.status}</strong></p>
                  </div>
                  {item.status === "reported" ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        resolveLostFoundItem(item.id);
                        alert("Claim verified and resolved successfully!");
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-8 text-[10px] font-semibold shrink-0"
                    >
                      Resolve Claim
                    </Button>
                  ) : (
                    <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-bold shrink-0 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Resolved
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
