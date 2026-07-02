"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { NAV_LINKS } from "@/lib/constants";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass shadow-premium py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-shadow duration-300">
                <Building2 className="w-5 h-5 text-white" />
                <Sparkles className="w-3 h-3 text-white/70 absolute -top-1 -right-1" />
              </div>
              <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
                Home<span className="text-gradient">Verse</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-primary/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="text-sm font-medium rounded-xl"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button className="text-sm font-medium rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]">
                  Get Started
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[60px] z-40 glass shadow-premium mx-4 rounded-2xl p-6 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full rounded-xl">
                    Log in
                  </Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button className="w-full rounded-xl gradient-primary text-white border-0">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
