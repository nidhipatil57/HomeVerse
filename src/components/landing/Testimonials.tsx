"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const testimonials = [
  {
    name: "Rajesh Mehta",
    role: "Society President",
    community: "Harmony Heights, Mumbai",
    content:
      "HomeVerse transformed how we manage our 500+ family society. Complaints are resolved 3x faster, and the AI insights helped us reduce water wastage by 25%.",
    rating: 5,
    initials: "RM",
  },
  {
    name: "Dr. Priya Singh",
    role: "Resident",
    community: "Green Valley Apartments, Bangalore",
    content:
      "The visitor management system is incredible. I pre-approve guests with a QR code, and the parcel OTP system means I never miss a delivery. It's like living in the future.",
    rating: 5,
    initials: "PS",
  },
  {
    name: "Ankit Sharma",
    role: "Hostel Warden",
    community: "IIT Delhi Boys Hostel",
    content:
      "Managing 800 students was a nightmare before HomeVerse. Now, mess feedback, laundry booking, and complaint tracking all happen digitally. The AI crowd prediction is a game-changer.",
    rating: 5,
    initials: "AS",
  },
  {
    name: "Sneha Kapoor",
    role: "Student",
    community: "Vidya Bhawan Hostel, Pune",
    content:
      "I love the mess menu ratings and the laundry slot booking. The AI assistant tells me the best time to eat to avoid crowds. Such a smart app!",
    rating: 5,
    initials: "SK",
  },
  {
    name: "Vikram Reddy",
    role: "Facility Manager",
    community: "Prestige Towers, Hyderabad",
    content:
      "The analytics dashboard gives me a bird's eye view of everything — utility consumption, complaint heatmaps, maintenance spending. Decision making is now data-driven.",
    rating: 4,
    initials: "VR",
  },
  {
    name: "Meera Iyer",
    role: "Committee Member",
    community: "Lakshmi Enclave, Chennai",
    content:
      "We eliminated 90% of our WhatsApp group chaos. Announcements, event RSVPs, and maintenance reminders — everything is organized in one beautiful platform.",
    rating: 5,
    initials: "MI",
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="testimonials" className="py-24 sm:py-32 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Loved by Communities
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
            Trusted by <span className="text-gradient">Thousands</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
            See what residents, wardens, and society managers have to say about
            HomeVerse.
          </p>
        </motion.div>

        {/* Testimonial Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={fadeInUp}>
              <div className="h-full rounded-2xl bg-card border border-border/50 p-6 shadow-premium hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5 flex flex-col">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/20 mb-4" />

                {/* Content */}
                <p className="text-muted-foreground text-sm leading-relaxed flex-grow mb-6">
                  &ldquo;{t.content}&rdquo;
                </p>

                {/* Rating */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < t.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-xs font-semibold gradient-primary text-white">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.role} · {t.community}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
