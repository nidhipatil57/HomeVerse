"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small communities just getting started",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Up to 50 units",
      "Complaint management",
      "Visitor log",
      "Basic announcements",
      "Community forum",
      "Email support",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Professional",
    description: "For growing societies that need advanced management",
    monthlyPrice: 2999,
    annualPrice: 29990,
    features: [
      "Up to 500 units",
      "AI Community Assistant",
      "Smart visitor management with QR",
      "Maintenance payments",
      "Utility monitoring",
      "Parcel management",
      "Community marketplace",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large complexes and hostel chains",
    monthlyPrice: 9999,
    annualPrice: 99990,
    features: [
      "Unlimited units",
      "Everything in Professional",
      "Predictive AI analytics",
      "Custom integrations",
      "Multi-property management",
      "White-label branding",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise deployment",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section
      id="pricing"
      className="py-24 sm:py-32 relative overflow-hidden"
      ref={ref}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Simple Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
            Plans for Every{" "}
            <span className="text-gradient">Community Size</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span
              className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                isAnnual ? "bg-primary" : "bg-muted"
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                animate={{ left: isAnnual ? "26px" : "2px" }}
                transition={{ duration: 0.2 }}
              />
            </button>
            <span
              className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}
            >
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                Save 17%
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={fadeInUp}>
              <div
                className={`h-full rounded-2xl p-8 flex flex-col transition-all duration-500 ${
                  plan.highlighted
                    ? "bg-card border-2 border-primary/30 shadow-xl shadow-primary/10 scale-[1.02] relative"
                    : "bg-card border border-border/50 shadow-premium hover:shadow-xl hover:-translate-y-0.5"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-primary text-white border-0 shadow-lg shadow-primary/25 px-4">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold font-[family-name:var(--font-heading)]">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-[family-name:var(--font-heading)]">
                      {plan.monthlyPrice === 0
                        ? "Free"
                        : `₹${isAnnual ? Math.round(plan.annualPrice / 12).toLocaleString() : plan.monthlyPrice.toLocaleString()}`}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-muted-foreground text-sm">
                        /month
                      </span>
                    )}
                  </div>
                  {plan.monthlyPrice > 0 && isAnnual && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Billed ₹{plan.annualPrice.toLocaleString()} annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full rounded-xl h-12 font-semibold ${
                    plan.highlighted
                      ? "gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
