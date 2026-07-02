"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import {
  Building2,
  GraduationCap,
  ArrowRight,
  Shield,
  Cpu,
  BarChart3,
  Users,
  Sparkles,
} from "lucide-react";
import { STATS } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 mesh-gradient opacity-50" />

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating buildings/shapes */}
        <motion.div
          className="absolute top-[15%] left-[8%] w-20 h-20 rounded-2xl gradient-primary opacity-10 blur-sm"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[25%] right-[10%] w-16 h-16 rounded-full bg-accent/10 blur-sm"
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[15%] w-24 h-24 rounded-3xl bg-primary/5 blur-md"
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-[40%] right-[20%] w-12 h-12 rounded-xl bg-chart-3/10 blur-sm"
          animate={{ y: [0, 20, 0], rotate: [0, 10, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute bottom-[30%] right-[8%] w-28 h-28 rounded-full bg-chart-5/5 blur-lg"
          animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.15]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass shadow-premium mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            AI-Powered Community Intelligence
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 font-[family-name:var(--font-heading)]"
        >
          The Operating System
          <br />
          <span className="text-gradient">for Modern Communities</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground mb-10 leading-relaxed"
        >
          Digitize every aspect of your community — from gated societies to
          student hostels. AI-powered management, predictive analytics, and
          seamless digital experiences, all in one platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/society/dashboard">
            <Button
              size="lg"
              className="rounded-2xl px-8 h-14 text-base font-semibold gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.03] group"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Society Portal
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/hostel/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl px-8 h-14 text-base font-semibold glass border-border/50 hover:border-primary/30 shadow-premium hover:shadow-lg transition-all duration-300 hover:scale-[1.03] group"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Hostel Portal
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-16"
        >
          {[
            { icon: Shield, label: "Smart Security" },
            { icon: Cpu, label: "AI-Powered" },
            { icon: BarChart3, label: "Predictive Analytics" },
            { icon: Users, label: "Community Network" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-sm text-muted-foreground"
            >
              <Icon className="w-3.5 h-3.5 text-primary" />
              {label}
            </div>
          ))}
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gradient font-[family-name:var(--font-heading)]">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals || 0}
                  duration={2.5}
                />
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
