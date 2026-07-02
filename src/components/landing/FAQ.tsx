"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is HomeVerse?",
    answer:
      "HomeVerse is an intelligent Community Operating System (Community OS) that digitizes every aspect of residential communities — from gated societies and apartments to college hostels and PGs. It combines community management, AI assistance, predictive analytics, marketplace, and resident networking into one seamless platform.",
  },
  {
    question: "Is HomeVerse suitable for my small society?",
    answer:
      "Absolutely! HomeVerse scales from a 20-unit apartment to a 5,000+ unit mega township. Our Starter plan is completely free for communities up to 50 units, so you can get started without any cost.",
  },
  {
    question: "How does the AI Assistant work?",
    answer:
      "The AI Assistant understands natural language queries. Residents can ask questions like 'What is my maintenance bill?', 'When is the next society meeting?', or 'Show my water consumption' — and get instant, accurate responses drawn from your community's data.",
  },
  {
    question: "Can I use HomeVerse for hostel management?",
    answer:
      "Yes! HomeVerse has a dedicated Hostel Portal with specialized features like mess menu management, laundry booking, study room reservation, AI crowd prediction, roommate matching, and expense tracking — all designed specifically for student accommodations.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is our top priority. We use end-to-end encryption, role-based access control, and comply with data protection standards. Your community data is isolated and never shared with third parties. We also offer on-premise deployment for enterprise customers.",
  },
  {
    question: "What payment methods are supported for maintenance?",
    answer:
      "HomeVerse supports UPI, credit/debit cards, net banking, and wallet payments. We also support auto-debit for recurring maintenance payments, and send automatic reminders before due dates.",
  },
  {
    question: "Can the security guard use HomeVerse?",
    answer:
      "Yes! Security staff have their own simplified portal for visitor management — they can verify pre-approved visitors via QR code, log walk-in visitors, track parcel deliveries, and manage gate access, all from a mobile-friendly interface.",
  },
  {
    question: "Does HomeVerse work offline?",
    answer:
      "Core features like visitor verification and complaint viewing work offline. Data syncs automatically when the connection is restored. This ensures uninterrupted operation even during network issues.",
  },
];

export function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="py-24 sm:py-32 relative" ref={ref}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
            Got <span className="text-gradient">Questions</span>?
          </h2>
          <p className="text-muted-foreground text-lg mt-4">
            Everything you need to know about HomeVerse.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl border border-border/50 bg-card px-6 shadow-sm data-[state=open]:shadow-premium transition-shadow duration-300"
              >
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base py-5 hover:no-underline hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
