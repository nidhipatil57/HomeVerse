"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  ArrowRight,
  Shield,
  Users,
  MessageSquare,
  CreditCard,
  BarChart3,
  Bot,
  UtensilsCrossed,
  WashingMachine,
  BookOpen,
  Package,
  ClipboardCheck,
} from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const portals = [
  {
    title: "Society Management",
    subtitle: "For Apartments, Gated Communities & Residential Complexes",
    icon: Building2,
    href: "/society/dashboard",
    gradient: "from-violet-600 to-indigo-600",
    shadow: "shadow-violet-500/20",
    features: [
      { icon: Shield, label: "Visitor Management" },
      { icon: MessageSquare, label: "Complaint Tracking" },
      { icon: CreditCard, label: "Maintenance Payments" },
      { icon: BarChart3, label: "Community Analytics" },
      { icon: Bot, label: "AI Assistant" },
      { icon: Users, label: "Resident Network" },
    ],
    stats: { communities: "2,500+", residents: "1.2M+" },
  },
  {
    title: "Hostel Management",
    subtitle: "For College Hostels, PGs & Student Accommodations",
    icon: GraduationCap,
    href: "/hostel/dashboard",
    gradient: "from-emerald-600 to-teal-600",
    shadow: "shadow-emerald-500/20",
    features: [
      { icon: UtensilsCrossed, label: "Mess Menu & Ratings" },
      { icon: WashingMachine, label: "Laundry Booking" },
      { icon: BookOpen, label: "Study Room Reservation" },
      { icon: Package, label: "Parcel Tracking" },
      { icon: ClipboardCheck, label: "Attendance" },
      { icon: Bot, label: "AI Assistant" },
    ],
    stats: { hostels: "800+", students: "350K+" },
  },
];

export function PortalSelector() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="portals" className="py-24 sm:py-32 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Choose Your Ecosystem
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
            Two Portals, One{" "}
            <span className="text-gradient">Powerful Platform</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
            Whether you manage a residential society or a student hostel,
            HomeVerse adapts to your needs with specialized features.
          </p>
        </motion.div>

        {/* Portal Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-8"
        >
          {portals.map((portal) => (
            <motion.div key={portal.title} variants={fadeInUp}>
              <Link href={portal.href} className="block group">
                <div className="relative rounded-3xl bg-card border border-border/50 p-8 lg:p-10 shadow-premium hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:-translate-y-1">
                  {/* Background Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
                  />

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-6 shadow-lg ${portal.shadow}`}
                  >
                    <portal.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl lg:text-3xl font-bold mb-2 font-[family-name:var(--font-heading)]">
                    {portal.title}
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    {portal.subtitle}
                  </p>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {portal.features.map((feature) => (
                      <div
                        key={feature.label}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/50 text-sm group-hover:bg-secondary/80 transition-colors"
                      >
                        <feature.icon className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300">
                    Explore Portal
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
