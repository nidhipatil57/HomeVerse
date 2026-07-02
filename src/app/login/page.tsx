"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Building2, GraduationCap, Shield, Users, Eye, EyeOff,
  Sparkles, ArrowRight, Mail, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const roles = [
  { id: "resident", label: "Resident", icon: Users, description: "Flat owners & tenants" },
  { id: "admin", label: "Admin", icon: Building2, description: "Society management" },
  { id: "warden", label: "Warden", icon: GraduationCap, description: "Hostel administration" },
  { id: "security", label: "Security", icon: Shield, description: "Gate & safety staff" },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("resident");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative gradient-primary overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
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
              Access your dashboard, manage complaints, track visitors, and
              stay connected with your community — all in one place.
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

          {/* Decorative Elements */}
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-heading)]">
              Home<span className="text-gradient">Verse</span>
            </span>
          </Link>

          <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-1">
            Sign In
          </h2>
          <p className="text-muted-foreground mb-8">
            Choose your role and enter your credentials
          </p>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 ${
                  selectedRole === role.id
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-border/50 hover:border-border hover:bg-secondary/30"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedRole === role.id ? "gradient-primary" : "bg-secondary"
                }`}>
                  <role.icon className={`w-4 h-4 ${selectedRole === role.id ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{role.label}</p>
                  <p className="text-[10px] text-muted-foreground">{role.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                className="pl-10 h-12 rounded-xl"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link href="#" className="text-primary hover:underline text-sm">
                Forgot password?
              </Link>
            </div>

            <Link
              href={selectedRole === "warden" ? "/hostel/dashboard" : "/society/dashboard"}
            >
              <Button className="w-full h-12 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all text-base font-semibold mt-2">
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 rounded-xl">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-11 rounded-xl">
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
      </div>
    </div>
  );
}
