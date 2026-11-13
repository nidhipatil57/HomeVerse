"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { SOCIETY_SIDEBAR_ITEMS, MANAGER_SIDEBAR_ITEMS, SECURITY_SIDEBAR_ITEMS, SECRETARY_SIDEBAR_ITEMS } from "@/lib/constants";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";

const getAllowedPaths = (role: string): string[] => {
  switch (role) {
    case "resident":
      return [
        "/society/dashboard",
        "/society/ai-assistant",
        "/society/complaints",
        "/society/visitors",
        "/society/daily-checkins",
        "/society/payments",
        "/society/payment-gateway",
        "/society/maintenance",
        "/society/maintenance-bills",
        "/society/payment-history",
        "/society/utility-usage",
        "/society/events",
        "/society/lost-found",
        "/society/find-local-help",
        "/society/buy-sell",
        "/society/marketplace",
        "/society/local-businesses",
        "/society/resident-directory",
        "/society/book-borrowing",
        "/society/facility-booking",
        "/society/community",
        "/society/my-parcels",
        "/society/announcements",
        "/society/emergency",
        "/society/notifications",
        "/society/settings"
      ];
    case "manager":
      return [
        "/society/dashboard",
        "/society/ai-assistant",
        "/society/complaints",
        "/society/services",
        "/society/workers",
        "/society/schedules",
        "/society/daily-operations",
        "/society/daily-checkins",
        "/society/emergency",
        "/society/analytics",
        "/society/visitors",
        "/society/parcel-management",
        "/society/helpers-entry",
        "/society/maintenance",
        "/society/maintenance-bills-mgmt",
        "/society/payment-gateway",
        "/society/events",
        "/society/announcements",
        "/society/notifications",
        "/society/settings"
      ];
    case "security":
      return [
        "/society/dashboard",
        "/society/visitor-desk",
        "/society/visitors",
        "/society/parcel-management",
        "/society/helpers-entry",
        "/society/vehicle-logs",
        "/society/gate-logs",
        "/society/security-lost-found",
        "/society/lost-found",
        "/society/incident-reports",
        "/society/cctv",
        "/society/emergency",
        "/society/announcements",
        "/society/notifications",
        "/society/settings",
        "/society/events"
      ];
    case "secretary":
      return [
        "/society"
      ];
    case "worker":
      return [
        "/society/dashboard",
        "/society/complaints",
        "/society/services",
        "/society/workers",
        "/society/schedules",
        "/society/availability",
        "/society/daily-operations",
        "/society/notifications",
        "/society/settings"
      ];
    default:
      return ["/society/dashboard"];
  }
};

export default function SocietyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, initialize, isLoading } = useAuth();
  const initializeDb = useCommunityStore(state => state.initializeDb);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Route Guard checks after initialization and mount
  useEffect(() => {
    if (!mounted || isLoading) return;

    // 1. Unauthenticated or wrong session
    if (!isAuthenticated || !user) {
      router.replace("/login?portal=society");
      return;
    }

    // 2. Wrong Portal check
    if (user.portal !== "society") {
      router.replace(user.portal === "hostel" ? "/hostel/dashboard" : "/login?portal=society");
      return;
    }

    // 3. Role Authorization check
    const allowedPaths = getAllowedPaths(user.role);
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path));
    if (!isAllowed) {
      router.replace("/society/dashboard");
    }
  }, [mounted, user, isAuthenticated, isLoading, pathname, router]);

  // Show loading spinner during session checks
  if (!mounted || isLoading || !isAuthenticated || !user || user.portal !== "society") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    );
  }

  // Prevent rendering if role and path mismatch
  const allowedPaths = getAllowedPaths(user.role);
  if (!allowedPaths.some(path => pathname.startsWith(path))) {
    return null;
  }

  const items = user.role === "manager" 
    ? MANAGER_SIDEBAR_ITEMS 
    : user.role === "security" 
      ? SECURITY_SIDEBAR_ITEMS 
      : user.role === "secretary"
        ? SECRETARY_SIDEBAR_ITEMS
        : SOCIETY_SIDEBAR_ITEMS;

  const portalName = user.role === "manager" 
    ? "Manager Portal" 
    : user.role === "security" 
      ? "Security Portal" 
      : user.role === "secretary"
        ? "Secretary Portal"
        : "Society Portal";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        items={items}
        portalName={portalName}
        portalType="society"
      />
      <main className="pl-[72px] md:pl-[280px] transition-all duration-300">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
