"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, GraduationCap, Shield, Users, Eye, EyeOff,
  Sparkles, ArrowRight, Mail, Lock, ArrowLeft, Briefcase, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth, MOCK_USERS } from "@/lib/store/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsMock, user, initialize } = useAuth();
  const [selectedEcosystem, setSelectedEcosystem] = useState<"society" | "hostel" | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Set default role when ecosystem changes
  useEffect(() => {
    if (selectedEcosystem === "society") {
      setSelectedRole("resident");
      setEmail("nidhi@society.com");
    } else if (selectedEcosystem === "hostel") {
      setSelectedRole("student");
      setEmail("aarav@hostel.com");
    }
    setPassword("password");
    setError("");
  }, [selectedEcosystem]);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    if (role === "resident") setEmail("nidhi@society.com");
    else if (role === "worker") setEmail("ramesh@society.com");
    else if (role === "student") setEmail("aarav@hostel.com");
    else if (role === "warden") setEmail("pillai@hostel.com");
    setPassword("password");
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const portal = selectedEcosystem === "society" ? "society" : "hostel";
      const success = await login(email, selectedRole as any, portal);
      if (success) {
        router.push(selectedEcosystem === "society" ? "/society/dashboard" : "/hostel/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantLogin = (role: "resident" | "worker" | "student" | "warden") => {
    loginAsMock(role);
    router.push(role === "resident" || role === "worker" ? "/society/dashboard" : "/hostel/dashboard");
  };

  const getEcosystemRoles = () => {
    if (selectedEcosystem === "society") {
      return [
        { id: "resident", label: "Resident", icon: Users, description: "Flat Owner or Tenant" },
        { id: "worker", label: "Worker / Staff", icon: Briefcase, description: "Society Service Providers" },
      ];
    } else {
      return [
        { id: "student", label: "Student", icon: GraduationCap, description: "Hostel Resident" },
        { id: "warden", label: "Warden", icon: UserCheck, description: "Hostel Admin Command Center" },
      ];
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative gradient-primary overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link href="/" className="flex items-center gap-2.5 mb-12 w-fit">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-[family-name:var(--font-heading)]">
              HomeVerse
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight font-[family-name:var(--font-heading)] mb-6">
              Welcome back to
              <br />
              your community
            </h1>
            <p className="text-lg text-white/70 leading-relaxed max-w-md">
              Access your role-based dashboard, manage complaints, track tasks, and
              stay connected with your community — all in one platform.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex gap-8 mt-12"
          >
            {[
              { value: "2,500+", label: "Communities" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9★", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Right Panel - Flow */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <AnimatePresence mode="wait">
          {selectedEcosystem === null ? (
            /* ECOSYSTEM SELECTION */
            <motion.div
              key="ecosystem-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md text-center space-y-8"
            >
              {/* Mobile Logo */}
              <Link href="/" className="flex items-center gap-2.5 justify-center lg:hidden mb-4">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold font-[family-name:var(--font-heading)]">
                  Home<span className="text-gradient">Verse</span>
                </span>
              </Link>

              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
                  Welcome to HomeVerse
                </span>
                <h2 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] tracking-tight">
                  Choose Your Community
                </h2>
                <p className="text-muted-foreground mt-2">
                  Select your ecosystem to proceed to your portal
                </p>
              </div>

              <div className="grid gap-4 mt-6">
                {/* Society Ecosystem Card */}
                <button
                  onClick={() => setSelectedEcosystem("society")}
                  className="group relative flex items-center gap-5 p-5 rounded-2xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-foreground">🏢 Society Portal</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Residential Societies, Apartments & Gated Communities
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>

                {/* Hostel Ecosystem Card */}
                <button
                  onClick={() => setSelectedEcosystem("hostel")}
                  className="group relative flex items-center gap-5 p-5 rounded-2xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-foreground">🏠 Hostel Portal</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      College Hostels, PG Accommodations & Student Housing
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mt-8">
                Don&apos;t have an account yet?{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Get Started
                </Link>
              </p>
            </motion.div>
          ) : (
            /* LOGIN FORM */
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              {/* Back Button */}
              <button
                onClick={() => setSelectedEcosystem(null)}
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Change Ecosystem
              </button>

              <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-1 flex items-center gap-2">
                Sign In
                <span className="text-xs px-2 py-0.5 rounded-full capitalize font-semibold bg-primary/10 text-primary border border-primary/20">
                  {selectedEcosystem} Portal
                </span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Choose your role and enter your credentials
              </p>

              {/* Dynamic Role Selector */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {getEcosystemRoles().map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleChange(role.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 ${
                      selectedRole === role.id
                        ? "border-primary/30 bg-primary/5 shadow-sm"
                        : "border-border/50 hover:border-border hover:bg-secondary/30"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedRole === role.id ? "gradient-primary" : "bg-secondary"
                    }`}>
                      <role.icon className={`w-4 h-4 ${selectedRole === role.id ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">{role.label}</p>
                      <p className="text-[9px] text-muted-foreground truncate leading-tight mt-0.5">{role.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Form */}
              <form className="space-y-4" onSubmit={handleManualLogin}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" className="rounded border-border accent-primary" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <Link href="#" className="text-primary hover:underline text-sm">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all text-base font-semibold mt-2"
                >
                  {loading ? "Signing In..." : "Sign In"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              {/* Quick Demo Login Cards */}
              <div className="mt-6 space-y-3 p-4 rounded-2xl bg-secondary/20 border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Login Demo Accounts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedEcosystem === "society" ? (
                    <>
                      <button
                        onClick={() => handleInstantLogin("resident")}
                        className="p-2.5 rounded-xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-colors text-xs flex flex-col gap-0.5"
                      >
                        <span className="font-semibold text-foreground">Nidhi (Resident)</span>
                        <span className="text-[10px] text-muted-foreground">nidhi@society.com</span>
                      </button>
                      <button
                        onClick={() => handleInstantLogin("worker")}
                        className="p-2.5 rounded-xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-colors text-xs flex flex-col gap-0.5"
                      >
                        <span className="font-semibold text-foreground">Ramesh (Worker)</span>
                        <span className="text-[10px] text-muted-foreground">ramesh@society.com</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleInstantLogin("student")}
                        className="p-2.5 rounded-xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-colors text-xs flex flex-col gap-0.5"
                      >
                        <span className="font-semibold text-foreground">Aarav (Student)</span>
                        <span className="text-[10px] text-muted-foreground">aarav@hostel.com</span>
                      </button>
                      <button
                        onClick={() => handleInstantLogin("warden")}
                        className="p-2.5 rounded-xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-colors text-xs flex flex-col gap-0.5"
                      >
                        <span className="font-semibold text-foreground">Dr. Pillai (Warden)</span>
                        <span className="text-[10px] text-muted-foreground">pillai@hostel.com</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="relative my-5">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" className="h-11 rounded-xl">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </Button>
                <Button type="button" variant="outline" className="h-11 rounded-xl">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Get Started
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
