"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
  Bot,
  BarChart3,
  Shield,
  MessageSquareWarning,
  CreditCard,
  Package,
  Droplets,
  Zap,
  Users,
  Store,
  Heart,
  BellRing,
} from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const features = [
  {
    icon: Bot,
    title: "AI Community Assistant",
    description:
      'Ask anything in natural language — "What is my maintenance bill?" or "When is the next meeting?"',
    color: "from-violet-500 to-purple-600",
    size: "col-span-1 md:col-span-2 row-span-1",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description:
      "AI-powered insights on water usage, maintenance needs, complaint hotspots, and budget forecasting.",
    color: "from-blue-500 to-cyan-600",
    size: "col-span-1 row-span-1",
  },
  {
    icon: Shield,
    title: "Smart Visitor Management",
    description:
      "Pre-approve guests, generate QR codes, one-time passes, and real-time security verification.",
    color: "from-emerald-500 to-green-600",
    size: "col-span-1 row-span-1",
  },
  {
    icon: MessageSquareWarning,
    title: "AI Complaint Prioritization",
    description:
      "Auto-detect urgency based on severity, affected residents, safety risk, and infrastructure importance.",
    color: "from-amber-500 to-orange-600",
    size: "col-span-1 row-span-1",
  },
  {
    icon: CreditCard,
    title: "Digital Payments",
    description:
      "Online maintenance payments, auto-reminders, invoices, receipts, and payment analytics.",
    color: "from-pink-500 to-rose-600",
    size: "col-span-1 row-span-1",
  },
  {
    icon: Package,
    title: "Parcel Intelligence",
    description:
      "Photo verification, OTP pickup, delivery notifications, and parcel history tracking.",
    color: "from-orange-500 to-red-600",
    size: "col-span-1 md:col-span-2 row-span-1",
  },
  {
    icon: Droplets,
    title: "Utility Monitoring",
    description:
      "Track electricity, water, and gas consumption with building-wise and flat-wise analytics.",
    color: "from-cyan-500 to-blue-600",
    size: "col-span-1 row-span-1",
  },
  {
    icon: Users,
    title: "Resident Network",
    description:
      "Skills directory, local business promotion, and trusted community networking.",
    color: "from-indigo-500 to-violet-600",
    size: "col-span-1 row-span-1",
  },
  {
    icon: Store,
    title: "Verified Marketplace",
    description:
      "Book verified plumbers, electricians, maids, tutors, and more — all rated by your community.",
    color: "from-teal-500 to-emerald-600",
    size: "col-span-1 row-span-1",
  },
  {
    icon: Heart,
    title: "Emergency Help",
    description:
      "One-tap SOS for medical emergencies, senior citizen assistance, and blood requirements.",
    color: "from-red-500 to-pink-600",
    size: "col-span-1 row-span-1",
  },
  {
    icon: BellRing,
    title: "Smart Notifications",
    description:
      "Real-time alerts via push, SMS, and email — never miss what matters in your community.",
    color: "from-yellow-500 to-amber-600",
    size: "col-span-1 row-span-1",
  },
  {
    icon: Zap,
    title: "Instant Actions",
    description:
      "Quick access to raise complaints, approve visitors, pay bills, and book facilities.",
    color: "from-purple-500 to-indigo-600",
    size: "col-span-1 row-span-1",
  },
];

export function FeatureShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      className="py-24 sm:py-32 relative overflow-hidden"
      ref={ref}
    >
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Feature-Rich Platform
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
            Everything Your Community{" "}
            <span className="text-gradient">Needs</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
            From AI-powered automation to community networking — every feature
            designed to make residential life effortless.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className={`${feature.size} group`}
            >
              <div className="h-full rounded-2xl bg-card border border-border/50 p-6 shadow-premium hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5 overflow-hidden relative">
                {/* Hover Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold mb-2 font-[family-name:var(--font-heading)]">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
