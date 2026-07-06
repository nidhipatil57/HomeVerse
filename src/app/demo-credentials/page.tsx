"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, GraduationCap, Shield, Users, ArrowLeft, ArrowRight,
  Copy, Check, Lock, Mail, Sparkles, User, Briefcase, KeyRound,
  ShieldCheck, AlertCircle, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/store/useAuth";
import { getPrepopulatedUsers } from "@/data/mock-db-seed";
import { useCommunityStore } from "@/lib/store/useCommunityStore";

function DemoCredentialsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout } = useAuth();
  const initializeDb = useCommunityStore(state => state.initializeDb);

  // Hydrate store database on mount
  useEffect(() => {
    initializeDb();
  }, [initializeDb]);

  // Read portal query param
  const portalParam = searchParams.get("portal");
  const isFixedPortal = portalParam === "society" || portalParam === "hostel";

  // Tabs states
  const [activePortal, setActivePortal] = useState<"society" | "hostel">("society");
  const [activeSocietySubTab, setActiveSocietySubTab] = useState<"residents" | "secretary" | "security" | "worker">("residents");
  const [activeHostelSubTab, setActiveHostelSubTab] = useState<"boys" | "girls" | "warden">("boys");
  
  const [copiedText, setCopiedText] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Sync activePortal with query param
  useEffect(() => {
    if (portalParam === "society" || portalParam === "hostel") {
      setActivePortal(portalParam);
    }
  }, [portalParam]);

  const users = getPrepopulatedUsers();

  const societyUsers = users.filter(u => u.portal === "society");
  const hostelUsers = users.filter(u => u.portal === "hostel");

  // Society subdivisions
  const societyResidents = societyUsers.filter(u => u.role === "resident");
  const societySecretary = societyUsers.filter(u => u.role === "secretary");
  const societySecurity = societyUsers.filter(u => u.role === "security");
  const societyWorker = societyUsers.filter(u => u.role === "worker");

  // Hostel subdivisions
  const hostelBoys = hostelUsers.filter(u => u.role === "student" && u.hostelName === "Boys Hostel");
  const hostelGirls = hostelUsers.filter(u => u.role === "student" && u.hostelName === "Girls Hostel");
  const hostelWardens = hostelUsers.filter(u => u.role === "warden");

  const getFilteredUsers = () => {
    if (activePortal === "society") {
      switch (activeSocietySubTab) {
        case "residents": return societyResidents;
        case "secretary": return societySecretary;
        case "security": return societySecurity;
        case "worker": return societyWorker;
      }
    } else {
      switch (activeHostelSubTab) {
        case "boys": return hostelBoys;
        case "girls": return hostelGirls;
        case "warden": return hostelWardens;
      }
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleResetDatabase = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("homeverse_db");
      localStorage.removeItem("homeverse_auth");
      window.location.reload();
    }
  };

  const handleAutoLogin = async (user: any) => {
    setError("");
    setLoadingUser(user.id);
    try {
      await logout(); // Clean session first
      const success = await login(user.email, user.role, user.portal);
      if (success) {
        router.replace(user.portal === "society" ? "/society/dashboard" : "/hostel/dashboard");
      } else {
        setError(`Failed to authenticate as ${user.name}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoadingUser("");
    }
  };

  const renderRoleIcon = (role: string) => {
    switch (role) {
      case "secretary":
        return <ShieldCheck className="w-5 h-5 text-violet-500" />;
      case "security":
        return <Shield className="w-5 h-5 text-indigo-500" />;
      case "resident":
        return <Users className="w-5 h-5 text-emerald-500" />;
      case "worker":
        return <Briefcase className="w-5 h-5 text-amber-500" />;
      case "warden":
        return <ShieldCheck className="w-5 h-5 text-rose-500" />;
      case "student":
        return <GraduationCap className="w-5 h-5 text-teal-500" />;
      default:
        return <User className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const renderRoleGradient = (role: string) => {
    switch (role) {
      case "secretary":
        return "from-violet-600/10 to-indigo-600/10 border-violet-500/20";
      case "security":
        return "from-indigo-600/10 to-blue-600/10 border-indigo-500/20";
      case "resident":
        return "from-emerald-600/10 to-teal-600/10 border-emerald-500/20";
      case "worker":
        return "from-amber-600/10 to-orange-600/10 border-amber-500/20";
      case "warden":
        return "from-rose-600/10 to-pink-600/10 border-rose-500/20";
      case "student":
        return "from-teal-600/10 to-cyan-600/10 border-teal-500/20";
      default:
        return "from-secondary to-secondary/50 border-border/50";
    }
  };

  const renderUserCards = (userList: any[]) => {
    if (userList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground bg-card/20 border border-dashed border-border/40 rounded-2xl">
          No users registered in this category.
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {userList.map((u) => {
          const isCopiedEmail = copiedText === `${u.id}-email`;
          const isCopiedPass = copiedText === `${u.id}-pass`;
          const isLoading = loadingUser === u.id;

          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`h-full border bg-card/60 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${renderRoleGradient(u.role)}`}>
                <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {renderRoleIcon(u.role)}
                      <Badge variant="outline" className="capitalize text-[10px] font-semibold tracking-wider">
                        {u.role}
                      </Badge>
                      {u.status === "pending" && (
                        <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/25 border-0 text-[10px] font-bold">
                          Pending Approval
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold font-[family-name:var(--font-heading)] mt-1.5">
                      {u.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {u.portal === "society" 
                        ? `${u.building || "A Wing"} · Flat ${u.unit || "N/A"}`
                        : `${u.hostelName || "Hostel"} · Room ${u.unit || "N/A"}`
                      }
                    </CardDescription>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center font-bold text-sm shrink-0 border border-border/40">
                    {u.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-6">
                  {/* Meta Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {u.workerCategory && (
                      <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 border-0 text-[9px] font-bold">
                        {u.workerCategory}
                      </Badge>
                    )}
                    {u.specializations && u.specializations.map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-[8px] font-semibold">
                        {s}
                      </Badge>
                    ))}
                    {u.ownerOrTenant && (
                      <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 border-0 text-[9px] font-bold">
                        {u.ownerOrTenant}
                      </Badge>
                    )}
                    {u.course && (
                      <Badge className="bg-teal-500/10 text-teal-700 hover:bg-teal-500/15 border-0 text-[9px] font-bold">
                        {u.year} - {u.course}
                      </Badge>
                    )}
                    {u.employeeId && (
                      <Badge variant="outline" className="text-[9px] font-mono">
                        ID: {u.employeeId}
                      </Badge>
                    )}
                    {u.workingShift && (
                      <Badge variant="outline" className="text-[9px]">
                        Shift: {u.workingShift.split(" ")[0]}
                      </Badge>
                    )}
                  </div>

                  {/* Credentials Box */}
                  <div className="bg-background/80 rounded-xl p-3.5 space-y-2.5 border border-border/30 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[11px] truncate select-all">{u.email}</span>
                        <button
                          onClick={() => handleCopy(u.email, `${u.id}-email`)}
                          className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                        >
                          {isCopiedEmail ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-border/20 pt-2.5">
                      <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                        <Lock className="w-3.5 h-3.5" /> Password
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] select-all font-semibold text-foreground">
                          {u.password || `${u.name.split(" ")[0]}@123`}
                        </span>
                        <button
                          onClick={() => handleCopy(u.password || `${u.name.split(" ")[0]}@123`, `${u.id}-pass`)}
                          className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                        >
                          {isCopiedPass ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Auto Login Button */}
                  <Button
                    onClick={() => handleAutoLogin(u)}
                    disabled={u.status === "pending" || !!loadingUser}
                    className="w-full h-10 rounded-xl gradient-primary text-white border-0 hover:shadow-lg transition-all text-xs font-bold mt-1 shadow-md shadow-primary/10"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> Authenticating...
                      </>
                    ) : u.status === "pending" ? (
                      "Awaiting Approval"
                    ) : (
                      <>
                        Auto Login As {u.name.split(" ")[0]} <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Gradients background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-emerald-600/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Back navigation */}
        <Link href="/login">
          <Button variant="ghost" className="mb-2 pl-2 text-muted-foreground hover:text-foreground rounded-lg">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Button>
        </Link>

        {/* Title and Reset Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/20 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight font-[family-name:var(--font-heading)] sm:text-4xl text-foreground">
                HomeVerse <span className="text-gradient">Demo Sandbox</span>
              </h1>
            </div>
          </div>
          <Button
            onClick={handleResetDatabase}
            variant="outline"
            className="flex items-center gap-2 rounded-xl text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all shadow-sm shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Sandbox Database
          </Button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold rounded-2xl flex items-center gap-2.5 shadow-lg"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portal Tabs Selector - Hidden if portal param is active */}
        {!isFixedPortal && (
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card/40 border border-border/40 backdrop-blur-md p-4 rounded-2xl">
            <div className="flex gap-2.5 shrink-0 bg-background/50 p-1.5 rounded-xl border border-border/20">
              <Button
                variant={activePortal === "society" ? "default" : "ghost"}
                onClick={() => setActivePortal("society")}
                className={`rounded-lg font-semibold text-xs h-9 px-4 ${
                  activePortal === "society" ? "gradient-primary text-white border-0 shadow-md" : "text-muted-foreground"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 mr-2" />
                🏢 Sunshine Complex (Society)
              </Button>
              <Button
                variant={activePortal === "hostel" ? "default" : "ghost"}
                onClick={() => setActivePortal("hostel")}
                className={`rounded-lg font-semibold text-xs h-9 px-4 ${
                  activePortal === "hostel" ? "gradient-primary text-white border-0 shadow-md" : "text-muted-foreground"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 mr-2" />
                🏠 VESIT Hostels
              </Button>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-secondary/40 px-3 py-1.5 rounded-lg border border-border/30">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              Click &quot;Auto Login&quot; to sign in instantly with role-based layouts
            </div>
          </div>
        )}

        {/* Subtabs Selectors */}
        <AnimatePresence mode="wait">
          {activePortal === "society" ? (
            <motion.div
              key="society-subtabs"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex gap-2 border-b border-border/20 pb-3 flex-wrap"
            >
              {[
                { id: "residents", label: "Resident", count: societyResidents.length },
                { id: "secretary", label: "Secretary", count: societySecretary.length },
                { id: "security", label: "Security", count: societySecurity.length },
                { id: "worker", label: "Worker", count: societyWorker.length },
              ].map((sub) => (
                <Button
                  key={sub.id}
                  variant={activeSocietySubTab === sub.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveSocietySubTab(sub.id as any)}
                  className={`rounded-xl text-xs h-9 px-4 transition-all duration-200 ${
                    activeSocietySubTab === sub.id ? "gradient-primary text-white border-0 shadow-md scale-[1.02]" : "hover:bg-secondary/40"
                  }`}
                >
                  {sub.label}
                  <Badge variant="secondary" className="ml-2 bg-background/20 text-foreground text-[10px] px-1.5 py-0.5 rounded-full border-0">
                    {sub.count}
                  </Badge>
                </Button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="hostel-subtabs"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex gap-2 border-b border-border/20 pb-3 flex-wrap"
            >
              {[
                { id: "boys", label: "Boys Hostel", count: hostelBoys.length },
                { id: "girls", label: "Girls Hostel", count: hostelGirls.length },
                { id: "warden", label: "Warden", count: hostelWardens.length },
              ].map((sub) => (
                <Button
                  key={sub.id}
                  variant={activeHostelSubTab === sub.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveHostelSubTab(sub.id as any)}
                  className={`rounded-xl text-xs h-9 px-4 transition-all duration-200 ${
                    activeHostelSubTab === sub.id ? "gradient-primary text-white border-0 shadow-md scale-[1.02]" : "hover:bg-secondary/40"
                  }`}
                >
                  {sub.label}
                  <Badge variant="secondary" className="ml-2 bg-background/20 text-foreground text-[10px] px-1.5 py-0.5 rounded-full border-0">
                    {sub.count}
                  </Badge>
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Cards Grid */}
        <div className="min-h-[400px]">
          {activePortal === "society" ? (
            <div className="space-y-6">
              <div className="border-b border-border/20 pb-2 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Society Ecosystem Accounts — {activeSocietySubTab} ({getFilteredUsers()?.length})
                </h2>
              </div>
              {renderUserCards(getFilteredUsers() || [])}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-border/20 pb-2 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Hostel Ecosystem Accounts — {activeHostelSubTab} ({getFilteredUsers()?.length})
                </h2>
              </div>
              {renderUserCards(getFilteredUsers() || [])}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DemoCredentialsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground font-medium">Loading sandbox environment...</span>
        </div>
      </div>
    }>
      <DemoCredentialsContent />
    </Suspense>
  );
}
