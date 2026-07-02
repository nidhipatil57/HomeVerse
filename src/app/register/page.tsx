"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Building2, User, Mail, Phone, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, GraduationCap, Shield, Users, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const steps = ["Basic Info", "Choose Role", "Community", "Complete"];

const roles = [
  { id: "resident", label: "Resident", icon: Users, description: "I live in a society/hostel", gradient: "from-blue-500 to-cyan-500" },
  { id: "admin", label: "Administrator", icon: Building2, description: "I manage a society", gradient: "from-violet-500 to-purple-500" },
  { id: "warden", label: "Hostel Warden", icon: GraduationCap, description: "I manage a hostel", gradient: "from-emerald-500 to-green-500" },
  { id: "security", label: "Security Staff", icon: Shield, description: "I handle security operations", gradient: "from-amber-500 to-orange-500" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold font-[family-name:var(--font-heading)]">
            Home<span className="text-gradient">Verse</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-card rounded-3xl border border-border/50 shadow-premium p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    i <= step ? "gradient-primary text-white" : "bg-secondary text-muted-foreground"
                  }`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`hidden sm:block w-12 h-[2px] rounded-full ${i < step ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-3">
              Step {step + 1} of {steps.length}: <span className="font-medium text-foreground">{steps[step]}</span>
            </p>
          </div>

          {/* Step Content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">Create your account</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">First Name</label>
                    <Input placeholder="Nidhi" className="rounded-xl h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Last Name</label>
                    <Input placeholder="Kumar" className="rounded-xl h-11" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="nidhi@example.com" className="pl-10 rounded-xl h-11" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="+91 XXXXX XXXXX" className="pl-10 rounded-xl h-11" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10 rounded-xl h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">How will you use HomeVerse?</h2>
                <p className="text-sm text-muted-foreground">Select your primary role</p>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                        selectedRole === role.id
                          ? "border-primary/30 bg-primary/5 shadow-lg -translate-y-0.5"
                          : "border-border/50 hover:border-border hover:bg-secondary/30"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-3 shadow-md`}>
                        <role.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-semibold">{role.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">Join your community</h2>
                <p className="text-sm text-muted-foreground">Enter the code shared by your society admin or hostel warden</p>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Community Code</label>
                  <Input placeholder="e.g., HH-MUM-2026" className="rounded-xl h-11 text-center text-lg tracking-widest font-mono" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Don&apos;t have a code?{" "}
                  <button className="text-primary font-medium hover:underline">Create a new community</button>
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-lg">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">You&apos;re all set!</h2>
                <p className="text-sm text-muted-foreground">
                  Welcome to HomeVerse. Your community awaits.
                </p>
                <Link href="/society/dashboard">
                  <Button className="w-full h-12 rounded-xl gradient-primary text-white border-0 shadow-lg text-base font-semibold mt-4">
                    Enter HomeVerse
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Navigation */}
          {step < 3 && (
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                  onClick={() => setStep(step - 1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              <Button
                className={`flex-1 rounded-xl h-11 gradient-primary text-white border-0 shadow-lg ${step === 0 ? "w-full" : ""}`}
                onClick={() => setStep(step + 1)}
              >
                {step === 2 ? "Complete" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
