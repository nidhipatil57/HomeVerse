"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Store, Star, Search, MapPin, PhoneCall, ShieldCheck, Clock, MessageSquare, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { staggerContainer, fadeInUp } from "@/lib/animations";

interface LocalBusiness {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  address: string;
  phone: string;
  timings: string;
  verified: boolean;
  image: string;
  tags: string[];
}

const localBusinesses: LocalBusiness[] = [
  {
    id: "biz-1",
    name: "Verma Dry Cleaners & Laundry",
    category: "Laundry & Dry Cleaning",
    rating: 4.8,
    reviews: 340,
    address: "Shop 12, Commercial Wing, Block B",
    phone: "+91 99999 11111",
    timings: "8:00 AM - 9:00 PM",
    verified: true,
    image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80",
    tags: ["Steam Press", "Express Service", "Dry Cleaning", "Doorstep Pickup"]
  },
  {
    id: "biz-2",
    name: "Daily Needs Superstore",
    category: "Grocery & Provisions",
    rating: 4.7,
    reviews: 1220,
    address: "Basement Floor, Complex Gate 2",
    phone: "+91 99999 22222",
    timings: "7:00 AM - 10:30 PM",
    verified: true,
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80",
    tags: ["Fresh Veggies", "Daily Dairy", "Home Delivery", "Instant UPI"]
  },
  {
    id: "biz-3",
    name: "Sunshine Cafe & Bakery",
    category: "Dining & Bakery",
    rating: 4.9,
    reviews: 489,
    address: "Terrace Garden, Clubhouse Level 2",
    phone: "+91 99999 33333",
    timings: "8:30 AM - 11:00 PM",
    verified: true,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    tags: ["Fresh Pastries", "Artisan Coffee", "Society Delivery", "Seating Area"]
  },
  {
    id: "biz-4",
    name: "Apex Pharmacy & Wellness",
    category: "Pharmacy & Medical",
    rating: 4.6,
    reviews: 290,
    address: "Shop 4, Commercial Wing, Block A",
    phone: "+91 99999 44444",
    timings: "24x7 Emergency Service",
    verified: true,
    image: "https://images.unsplash.com/photo-1586015555751-63c294155b1a?w=600&auto=format&fit=crop&q=80",
    tags: ["24x7 Open", "Doctor Consultation", "Emergency Meds", "Home Delivery"]
  },
  {
    id: "biz-5",
    name: "Harmony Unisex Salon & Spa",
    category: "Salon & Grooming",
    rating: 4.7,
    reviews: 180,
    address: "First Floor, Commercial Wing",
    phone: "+91 99999 55555",
    timings: "10:00 AM - 8:30 PM",
    verified: true,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80",
    tags: ["Hair Styling", "Facials & Spa", "Men & Women", "By Appointment"]
  },
  {
    id: "biz-6",
    name: "QuickFix Electronics & Mobile",
    category: "Electronics & Repairs",
    rating: 4.5,
    reviews: 215,
    address: "Shop 8, Commercial Arcade",
    phone: "+91 99999 66666",
    timings: "10:00 AM - 9:00 PM",
    verified: true,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    tags: ["Phone Repair", "Laptop Service", "Accessories", "Home Visit"]
  }
];

const categories = [
  "All",
  "Grocery & Provisions",
  "Pharmacy & Medical",
  "Dining & Bakery",
  "Laundry & Dry Cleaning",
  "Salon & Grooming",
  "Electronics & Repairs"
];

export default function LocalBusinessesPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredBusinesses = localBusinesses.filter((b) => {
    const matchesCategory = selectedCategory === "All" || b.category === selectedCategory;
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Local Businesses</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Explore and contact verified stores, pharmacies, salons, and eateries located inside Sunshine Complex
        </p>
      </div>

      {/* Category Pills & Search Bar (Matches Community Services Layout) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap bg-muted/70 p-1 rounded-2xl border border-border/60 self-start gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-card text-foreground shadow-sm border border-border/40 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search store, grocery, pharmacy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl h-10 text-xs bg-card border-border/60"
          />
        </div>
      </div>

      {/* Directory Grid (Matching Community Services Worker Card UI) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredBusinesses.map((biz) => {
          const cleanPhone = biz.phone.replace(/[^0-9]/g, "");

          return (
            <motion.div key={biz.id} variants={fadeInUp}>
              <Card className="border-border/60 bg-card hover:border-primary/40 transition-all duration-300 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between h-full">
                <div>
                  {/* Photo Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-secondary/30">
                    <img
                      src={biz.image}
                      alt={biz.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-card/90 text-foreground backdrop-blur-md border border-border/40 text-[10px] font-bold shadow-sm">
                        {biz.category}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/90 text-white px-2 py-0.5 rounded-lg text-xs font-bold shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-white text-white" />
                      <span>{biz.rating}</span>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-base text-foreground line-clamp-1">{biz.name}</h3>
                        {biz.verified && (
                          <span title="Verified Commercial Establishment">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs mt-0.5 block">
                        Based on {biz.reviews} resident reviews
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-secondary/20 p-3 rounded-xl border border-border/50">
                      <div>
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block font-semibold">
                          Timings
                        </span>
                        <div className="flex items-center gap-1 text-foreground font-semibold text-[11px] mt-0.5">
                          <Clock className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate">{biz.timings}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block font-semibold">
                          Location
                        </span>
                        <div className="flex items-center gap-1 text-foreground font-semibold text-[11px] mt-0.5">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate">{biz.address}</span>
                        </div>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-border/40">
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block font-semibold">
                          Direct Helpline
                        </span>
                        <span className="font-mono font-bold text-foreground text-xs">{biz.phone}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider block">
                        Highlights & Services
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {biz.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 bg-secondary/40 text-foreground font-semibold rounded-md border border-border/40"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-border/50 flex items-center gap-2">
                    <a href={`tel:${cleanPhone}`} className="flex-1">
                      <Button
                        variant="default"
                        className="w-full rounded-xl h-9 text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call Store
                      </Button>
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(biz.name)},%20I%20am%20a%20resident%20at%20Sunshine%20Complex.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full rounded-xl h-9 text-xs font-semibold flex items-center justify-center gap-1.5 border-border/60"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
