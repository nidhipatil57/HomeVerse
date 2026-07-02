import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { PortalSelector } from "@/components/landing/PortalSelector";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="flex-1">
      <Navbar />
      <Hero />
      <PortalSelector />
      <FeatureShowcase />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
