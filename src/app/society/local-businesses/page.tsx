"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Store, Star, Search, MapPin, PhoneCall, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const localBusinesses = [
  { name: "Verma Dry Cleaners", category: "Laundry & Ironing", rating: 4.8, reviews: 340, address: "Shop 12, Commercial Wing, Block B", phone: "+91 99999 11111", verified: true, initials: "VD" },
  { name: "Daily Needs Superstore", category: "Grocery & Provisions", rating: 4.7, reviews: 1220, address: "Basement Floor, Complex Gate 2", phone: "+91 99999 22222", verified: true, initials: "DN" },
  { name: "Sunshine Cafe & Bakery", category: "Dining & Food", rating: 4.9, reviews: 489, address: "Terrace Garden, Clubhouse Level 2", phone: "+91 99999 33333", verified: true, initials: "SC" },
  { name: "Apex Pharmacy", category: "Medical Store", rating: 4.6, reviews: 290, address: "Shop 4, Commercial Wing, Block A", phone: "+91 99999 44444", verified: true, initials: "AP" },
  { name: "Harmony Unisex Salon", category: "Beauty & Grooming", rating: 4.7, reviews: 180, address: "First Floor, Commercial Wing", phone: "+91 99999 55555", verified: true, initials: "HS" },
];

export default function LocalBusinessesPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredBusinesses = localBusinesses.filter((b) => {
    return b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Local Businesses 🏬
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore and contact verified stores, pharmacies, salons, and eateries located inside or near Sunshine Complex
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search grocery, pharmacy, dry cleaners..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl h-11 text-xs"
        />
      </div>

      {/* Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map((biz, idx) => (
          <motion.div key={idx} variants={fadeInUp}>
            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
              <CardContent className="p-5 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                      {biz.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-foreground text-sm truncate">{biz.name}</h3>
                        {biz.verified && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </div>
                      <Badge variant="secondary" className="mt-1 text-[10px] font-semibold">
                        {biz.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 text-xs">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold">{biz.rating}</span>
                    <span className="text-muted-foreground">({biz.reviews} reviews)</span>
                  </div>

                  <div className="flex items-start gap-2 mt-4 text-xs text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0 text-primary" />
                    <span>{biz.address}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <a href={`tel:${biz.phone}`} className="block">
                    <Button variant="outline" className="w-full rounded-xl h-9 text-xs font-semibold flex items-center justify-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-500" /> Call Store
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
