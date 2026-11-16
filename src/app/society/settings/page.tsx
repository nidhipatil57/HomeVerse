"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings, User, Bell, Shield, Palette, Globe, HelpCircle,
  Briefcase, ArrowLeft, Check, Clock, Phone, Award, CheckSquare,
  Lock, KeyRound, CheckCircle2, ChevronRight, Moon, Sun, Smartphone,
  Mail, MessageSquare, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

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
  const [mounted, setMounted] = useState(false);

  // Active sub-page
  const [activeSection, setActiveSection] = useState<string>("menu");

  // Profile Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [building, setBuilding] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Notifications preferences
  const [notifPreferences, setNotifPreferences] = useState({
    complaints: true,
    visitors: true,
    payments: true,
    bookings: true,
    announcements: true,
    emergency: true
  });

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [directoryVisible, setDirectoryVisible] = useState(true);

  // Worker Services Form States
  const [experience, setExperience] = useState("");
  const [workingShift, setWorkingShift] = useState("");
  const [availability, setAvailability] = useState("Available");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSavedServices, setIsSavedServices] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Load user data into form once mounted
  useEffect(() => {
    if (mounted && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setUnit(user.unit || "");
      setBuilding(user.building || "");
      setExperience(user.experience || "");
      setWorkingShift(user.workingShift || "");
      setAvailability(user.availability || "Available");
      setSelectedServices(user.specializations || []);

      // Load saved notification prefs if any
      try {
        const savedPrefs = localStorage.getItem(`homeverse_notifs_${user.id}`);
        if (savedPrefs) setNotifPreferences(JSON.parse(savedPrefs));
      } catch (e) {}
    }
  }, [mounted, user]);

  if (!mounted || !user) return null;

  const isWorker = user.role === "worker";

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      phone,
      unit,
      building
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleToggleNotif = (key: keyof typeof notifPreferences) => {
    const updated = { ...notifPreferences, [key]: !notifPreferences[key] };
    setNotifPreferences(updated);
    try {
      localStorage.setItem(`homeverse_notifs_${user.id}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

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
    updateWorkerServices(user.id, details);
    updateProfile(details);
    setIsSavedServices(true);
    setTimeout(() => setIsSavedServices(false), 3000);
  };

  const sectionsList = [
    { id: "profile", title: "Profile Settings", description: "Update your name, contact phone, flat, and info", icon: User, color: "from-blue-500 to-cyan-500" },
    { id: "notifications", title: "Notifications", description: "Configure payment reminders, visitor check-ins & alerts", icon: Bell, color: "from-amber-500 to-orange-500" },
    { id: "privacy", title: "Privacy & Security", description: "Change password, two-factor auth & directory visibility", icon: Shield, color: "from-red-500 to-pink-500" },
    { id: "appearance", title: "Appearance", description: "Interface theme, color mode and display preferences", icon: Palette, color: "from-purple-500 to-violet-500" },
    { id: "connected", title: "Connected Accounts", description: "Manage linked Google ID, UPI handles & WhatsApp", icon: Globe, color: "from-green-500 to-emerald-500" },
    { id: "help", title: "Help & Support", description: "Community FAQs, platform guides & emergency assistance", icon: HelpCircle, color: "from-teal-500 to-cyan-500" },
  ];

  if (isWorker) {
    sectionsList.unshift({
      id: "my-services",
      title: "My Services",
      description: "Manage service catalog, shifts, and resident booking availability",
      icon: Briefcase,
      color: "from-violet-600 to-indigo-600"
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {activeSection === "menu" ? (
        <motion.div
          key="menu"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Settings</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your personal account, privacy preferences, notifications, and security
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {sectionsList.map((s) => (
              <motion.div key={s.id} variants={fadeInUp}>
                <Card
                  className="border-border/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-card"
                  onClick={() => setActiveSection(s.id)}
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div>
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3.5 shadow-md group-hover:scale-105 transition-transform`}>
                        <s.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-sm text-foreground mb-1 flex items-center justify-between">{s.title}
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Back button */}
          <Button
            onClick={() => setActiveSection("menu")}
            variant="ghost"
            className="pl-0 text-muted-foreground hover:text-foreground hover:bg-transparent text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Settings
          </Button>

          {/* Section 1: Profile Settings */}
          {activeSection === "profile" && (
            <Card className="border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold text-foreground">Profile Settings</CardTitle>
                <CardDescription className="text-xs">
                  Update your personal details. Changes persist to your Neon DB profile and reflect across all portals.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {saveSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Profile saved successfully and synchronized across HomeVerse!
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Name</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Email Address (Registered)</label>
                      <Input
                        value={email}
                        disabled
                        className="h-10 text-xs rounded-xl bg-secondary/30 text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone Number</label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98000 00000"
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Building Wing</label>
                      <Input
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                        placeholder="A Wing"
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Flat / Unit Number</label>
                      <Input
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="301"
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Role / Designation</label>
                      <Input
                        value={user.role.toUpperCase()}
                        disabled
                        className="h-10 text-xs rounded-xl bg-secondary/30 text-muted-foreground cursor-not-allowed font-semibold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" className="h-10 px-6 rounded-xl font-bold text-xs gradient-primary text-white border-0 shadow-md">
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Section 2: Notifications */}
          {activeSection === "notifications" && (
            <Card className="border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold text-foreground">Notification Delivery Preferences</CardTitle>
                <CardDescription className="text-xs">
                  Choose which community alerts, payment reminders, and status updates you want to receive.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {[
                  { key: "payments" as const, title: "Maintenance & Special Payments", desc: "Get notified when new monthly maintenance or festival charges are dispatched." },
                  { key: "announcements" as const, title: "Society Announcements", desc: "Receive alerts for AGM notices, maintenance shutdowns, and circulars." },
                  { key: "visitors" as const, title: "Visitor Check-ins & Domestic Passes", desc: "Immediate push notification whenever a guest or helper enters your gate." },
                  { key: "complaints" as const, title: "Complaint Resolutions", desc: "Tracking alerts when your maintenance ticket is assigned or marked resolved." },
                  { key: "bookings" as const, title: "Facility Reservations", desc: "Booking confirmations and reminder alerts before your reserved facility slot starts." },
                  { key: "emergency" as const, title: "Emergency & Security Broadcasts", desc: "Urgent security, fire, or gate alert notifications (Recommended: ON)." },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-secondary/15">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleNotif(item.key)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                        notifPreferences[item.key] ? "bg-primary" : "bg-muted border border-border"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          notifPreferences[item.key] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Section 3: Privacy & Security */}
          {activeSection === "privacy" && (
            <div className="space-y-5">
              <Card className="border-border/60 bg-card">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-base font-bold text-foreground">Change Password</CardTitle>
                  <CardDescription className="text-xs">
                    Ensure your account uses a secure password of at least 6 characters.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  {passwordSuccess && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Password updated successfully!
                    </div>
                  )}
                  {passwordError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {passwordError}
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Current Password</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Confirm New Password</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                    <Button type="submit" className="h-10 px-6 rounded-xl font-bold text-xs gradient-primary text-white border-0 shadow-md">
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-base font-bold text-foreground">Privacy Controls</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-secondary/15">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Resident Directory Visibility</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Allow neighbors in Sunshine Complex to view your name and unit in the Directory.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDirectoryVisible(!directoryVisible)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                        directoryVisible ? "bg-primary" : "bg-muted border border-border"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${directoryVisible ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-secondary/15">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Two-Factor Authentication (2FA)</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Require an SMS OTP when logging in from a new device.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                        twoFactorEnabled ? "bg-primary" : "bg-muted border border-border"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${twoFactorEnabled ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Section 4: Appearance */}
          {activeSection === "appearance" && (
            <Card className="border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold text-foreground">Appearance & Display</CardTitle>
                <CardDescription className="text-xs">
                  Customize theme colors and visual display. Settings persist automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/15">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Color Mode (Light / Dark)</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Toggle between daytime light theme and high-contrast dark theme.</p>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/15">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Portal Language</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Select interface display language.</p>
                  </div>
                  <select className="h-9 px-3 rounded-xl border border-border/60 bg-card text-xs font-semibold">
                    <option value="en">English (Default)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="mr">Marathi (मराठी)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 5: Connected Accounts */}
          {activeSection === "connected" && (
            <Card className="border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold text-foreground">Connected Accounts & Integrations</CardTitle>
                <CardDescription className="text-xs">
                  Connected external providers for authentication, payments, and instant alerts.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center font-bold text-xs text-primary">
                      G
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Google Workspace Single Sign-On</h4>
                      <p className="text-[11px] text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    Connected
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center font-bold text-xs text-emerald-600">
                      WA
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">WhatsApp Gate Alerts</h4>
                      <p className="text-[11px] text-muted-foreground">{phone || "+91 98000 00000"}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 6: Help & Support */}
          {activeSection === "help" && (
            <div className="space-y-4">
              <Card className="border-border/60 bg-card">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-base font-bold text-foreground">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-border/50 bg-secondary/15">
                    <h4 className="font-bold text-foreground">How are monthly maintenance bills generated?</h4>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                      Maintenance charges and special occasion assessments are generated when the Secretary dispatches the bulk billing cycle. They immediately appear in your Payments portal.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/50 bg-secondary/15">
                    <h4 className="font-bold text-foreground">How does automatic Facility Booking work?</h4>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                      Facility booking is direct and peer-to-peer. When you select an available slot, HomeVerse automatically confirms and locks it instantly without requiring manual committee approval.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/50 bg-secondary/15">
                    <h4 className="font-bold text-foreground">How do domestic helper gate passes work?</h4>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                      All verified domestic staff assigned to your flat are automatically synced with Gate Security and displayed in both Daily Check-Ins and the Visitors Gate Pass tab.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-secondary/15">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-foreground">Emergency Society Control Room</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Available 24x7 for urgent security or medical assistance.</p>
                  </div>
                  <a href="tel:+919800000000">
                    <Button variant="outline" className="h-9 px-4 text-xs font-bold rounded-xl border-border/60">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-primary" /> Call Security
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Worker Services */}
          {activeSection === "my-services" && isWorker && (
            <Card className="border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold text-foreground">Service Offerings & Specializations</CardTitle>
                <CardDescription className="text-xs">
                  Update your service catalog, experience, and shift hours
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {isSavedServices && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Services updated and live in Community Directory!
                  </div>
                )}

                <form onSubmit={handleSaveServices} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {availableServices.map((service) => {
                      const isChecked = selectedServices.includes(service);
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => handleToggleService(service)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                            isChecked
                              ? "border-primary bg-primary/5 text-primary shadow-sm"
                              : "border-border/50 bg-card hover:bg-secondary/40 text-muted-foreground"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <CheckSquare className={`w-4 h-4 ${isChecked ? "text-primary" : "text-muted-foreground/40"}`} />
                            {service}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Experience</label>
                      <Input
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 5 years"
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Working Shift</label>
                      <Input
                        value={workingShift}
                        onChange={(e) => setWorkingShift(e.target.value)}
                        placeholder="09:00 AM - 06:00 PM"
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" className="h-10 px-6 rounded-xl font-bold text-xs gradient-primary text-white border-0 shadow-md">
                      Save Services
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
