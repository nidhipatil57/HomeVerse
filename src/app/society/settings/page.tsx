"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings, User, Bell, Shield, Palette, Globe, HelpCircle,
  Briefcase, ArrowLeft, Check, Clock, Phone, Award, Sparkles, CheckSquare
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";

const settingsSections = [
  { title: "Profile Settings", description: "Update your name, photo, and contact info", icon: User, color: "from-blue-500 to-cyan-500", id: "profile" },
  { title: "Notifications", description: "Manage email, SMS, and push notifications", icon: Bell, color: "from-amber-500 to-orange-500", id: "notifications" },
  { title: "Privacy & Security", description: "Password, 2FA, and data preferences", icon: Shield, color: "from-red-500 to-pink-500", id: "privacy" },
  { title: "Appearance", description: "Theme, language, and display settings", icon: Palette, color: "from-purple-500 to-violet-500", id: "appearance" },
  { title: "Connected Accounts", description: "Manage linked accounts and integrations", icon: Globe, color: "from-green-500 to-emerald-500", id: "connected" },
  { title: "Help & Support", description: "FAQs, documentation, and contact support", icon: HelpCircle, color: "from-teal-500 to-cyan-500", id: "help" },
];

const CATEGORY_SERVICES: Record<string, string[]> = {
  maid: ["Cleaning", "Cooking", "Laundry", "Utensils", "Ironing", "Baby Care", "Elder Care"],
  electrician: ["Fan Installation", "Switch Repair", "Wiring", "Lighting", "Appliance Repair"],
  plumber: ["Leakage", "Pipe Repair", "Tap Installation", "Bathroom Fittings"],
  carpenter: ["Furniture Repair", "Door Repair", "Shelf Installation"],
  painter: ["Wall Painting", "Texture Paint", "Touch-up"],
  housekeeping: ["Deep Cleaning", "Dusting", "Trash Removal"],
  gardener: ["Lawn Mowing", "Pruning", "Watering", "Planting"],
};

export default function SettingsPage() {
  const { user, updateProfile, initialize } = useAuth();
  const { updateWorkerServices, initializeDb } = useCommunityStore();
  const [activeSection, setActiveSection] = useState<"menu" | "my-services">("menu");
  const [mounted, setMounted] = useState(false);

  // My Services Form States
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [workingShift, setWorkingShift] = useState("");
  const [availability, setAvailability] = useState("Available");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Load user data into form once mounted
  useEffect(() => {
    if (mounted && user) {
      setPhone(user.phone || "");
      setExperience(user.experience || "");
      setWorkingShift(user.workingShift || "");
      setAvailability(user.availability || "Available");
      setSelectedServices(user.specializations || []);
    }
  }, [mounted, user]);

  if (!mounted || !user) return null;

  const isWorker = user.role === "worker";

  // Prepend "My Services" card if user is a worker
  const displaySections = [...settingsSections];
  if (isWorker) {
    displaySections.unshift({
      title: "My Services",
      description: "Update your service offerings, availability, working hours, and experience",
      icon: Briefcase,
      color: "from-violet-600 to-indigo-600 bg-gradient-to-br",
      id: "my-services"
    });
  }

  const categoryKey = (user.workerCategory || "").toLowerCase();
  const availableServices = CATEGORY_SERVICES[categoryKey] || ["General Service", "Emergency Repair"];

  const handleToggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleSaveServices = (e: React.FormEvent) => {
    e.preventDefault();
    const details = {
      phone,
      experience,
      workingShift,
      availability,
      specializations: selectedServices,
    };
    // Save to community db
    updateWorkerServices(user.id, details);
    // Save to active auth session
    updateProfile(details);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {activeSection === "menu" ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Settings ⚙️</h1>
              <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
            </div>
            
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displaySections.map((s) => (
                <motion.div key={s.title} variants={fadeInUp}>
                  <Card 
                    className="border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                    onClick={() => {
                      if (s.id === "my-services") {
                        setActiveSection("my-services");
                      } else {
                        alert(`${s.title} page is simulated in this sandbox environment.`);
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <s.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-1 flex items-center gap-1.5">
                        {s.title}
                        {s.id === "my-services" && (
                          <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">Active</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="my-services"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 max-w-3xl"
          >
            {/* Back Navigation */}
            <Button
              onClick={() => setActiveSection("menu")}
              variant="ghost"
              className="pl-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Settings
            </Button>

            {/* Title Header */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
                My Services 🛠️
              </h1>
              <p className="text-muted-foreground mt-1">
                Customize your professional details, shifts, and specific service listings visible to society residents
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveServices} className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg">Service Offerings & Specializations</CardTitle>
                  <CardDescription>
                    Select the specific services you provide. Residents search for these terms when finding local help.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableServices.map((service) => {
                      const isChecked = selectedServices.includes(service);
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => handleToggleService(service)}
                          className={`flex items-center justify-between p-4 rounded-xl border text-left text-xs font-semibold transition-all ${
                            isChecked
                              ? "border-primary bg-primary/5 text-primary shadow-sm"
                              : "border-border/50 bg-background/50 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <CheckSquare className={`w-4 h-4 ${isChecked ? "text-primary" : "text-muted-foreground/40"}`} />
                            {service}
                          </span>
                          {isChecked && <Badge className="text-[8px] bg-primary/20 text-primary hover:bg-primary/25 border-0">Enabled</Badge>}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg">Professional Stats & Details</CardTitle>
                  <CardDescription>
                    Update your availability status, working shift hours, and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Experience
                      </label>
                      <Input
                        placeholder="e.g. 5 years"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="h-10 text-xs rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Working Hours / Shift
                      </label>
                      <Input
                        placeholder="e.g. Morning (9 AM - 5 PM)"
                        value={workingShift}
                        onChange={(e) => setWorkingShift(e.target.value)}
                        className="h-10 text-xs rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Contact Number
                      </label>
                      <Input
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-10 text-xs rounded-xl font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Availability Status
                      </label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="w-full h-10 px-3 border border-input rounded-xl text-xs bg-background"
                      >
                        <option value="Available">🟢 Available for Bookings</option>
                        <option value="Busy">🔴 Busy / Fully Booked</option>
                        <option value="Unavailable">⚪ Off Duty / Leave</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Alert */}
              <AnimatePresence>
                {isSaved && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm"
                  >
                    <Check className="w-4 h-4 shrink-0" />
                    Your services portfolio has been successfully updated and synced across residents' directories.
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveSection("menu")}
                  className="rounded-xl h-10 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl h-10 text-xs font-semibold gradient-primary text-white border-0 shadow-md shadow-primary/20 px-6"
                >
                  Save Portfolio Changes
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
