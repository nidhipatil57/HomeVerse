"use client";

import Link from "next/link";
import { Building2, Sparkles, Globe, MessageCircle, Link2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Product: [
    { label: "Society Portal", href: "/society/dashboard" },
    { label: "Hostel Portal", href: "/hostel/dashboard" },
    { label: "AI Assistant", href: "#features" },
    { label: "Analytics", href: "#features" },
    { label: "Marketplace", href: "#features" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press Kit", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Community Forum", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Status Page", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Data Processing", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-card border-t border-border/50">
      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-[family-name:var(--font-heading)] mb-4">
            Ready to Transform Your{" "}
            <span className="text-gradient">Community</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Join thousands of communities already using HomeVerse to simplify
            management and build stronger connections.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="rounded-2xl px-8 h-14 text-base font-semibold gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.03]"
              >
                Get Started for Free
              </Button>
            </Link>
            <Link href="#pricing">
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-8 h-14 text-base font-semibold"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>

        <Separator className="mb-12" />

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 text-white" />
                <Sparkles className="w-3 h-3 text-white/70 absolute -top-1 -right-1 hidden" />
              </div>
              <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
                Home<span className="text-gradient">Verse</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The intelligent Community OS for modern residential living.
            </p>
            <div className="flex gap-2">
              {[MessageCircle, Globe, Link2, Mail].map((Icon, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  className="rounded-xl w-9 h-9 hover:bg-primary/10"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 HomeVerse. All rights reserved.</p>
          <p>
            Built with ❤️ for communities across India
          </p>
        </div>
      </div>
    </footer>
  );
}
