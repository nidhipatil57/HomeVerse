"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { SOCIETY_SIDEBAR_ITEMS, WORKER_SIDEBAR_ITEMS, SECURITY_SIDEBAR_ITEMS, SECRETARY_SIDEBAR_ITEMS } from "@/lib/constants";
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
        "/society/maintenance-bills",
        "/society/payment-history",
        "/society/utility-usage",
        "/society/events",
        "/society/lost-found",
        "/society/find-local-help",
        "/society/buy-sell",
        "/society/local-businesses",
        "/society/resident-directory",
        "/society/book-borrowing",
        "/society/facility-booking",
        "/society/my-parcels",
        "/society/notifications",
        "/society/settings"
      ];
    case "worker":
      return [
        "/society/dashboard",
        "/society/complaints",
        "/society/route",
        "/society/emergency",
        "/society/inventory",
        "/society/performance",
        "/society/services",
        "/society/availability",
        "/society/notifications",
        "/society/settings"
      ];
    case "security":
      return [
        "/society/dashboard",
        "/society/visitor-desk",
        "/society/parcel-management",
        "/society/helpers-entry",
        "/society/vehicle-logs",
        "/society/gate-logs",
        "/society/security-lost-found",
        "/society/incident-reports",
        "/society/cctv",
        "/society/announcements",
        "/society/notifications",
        "/society/settings"
      ];
    case "secretary":
      return [
        "/society/dashboard",
        "/society/ai-assistant",
        "/society/residents",
        "/society/buildings",
        "/society/flats",
        "/society/workers",
        "/society/security-staff",
        "/society/complaints",
        "/society/maintenance-bills-mgmt",
        "/society/payments",
        "/society/expenses",
        "/society/financial-reports",
        "/society/analytics",
        "/society/announcements",
        "/society/events-mgmt",
        "/society/facility-management",
        "/society/approvals",
        "/society/notifications",
        "/society/settings"
      ];
    default:
      return [];
  }
};

export default function SocietyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, initialize, logout, isLoading } = useAuth();
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
      logout();
      router.replace("/login?portal=society");
      return;
    }

    // 2. Wrong Portal check
    if (user.portal !== "society") {
      logout();
      router.replace("/login?portal=society");
      return;
    }

    // 3. Role Authorization check
    const allowedPaths = getAllowedPaths(user.role);
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path));
    if (!isAllowed) {
      logout();
      router.replace("/login?portal=society");
    }
  }, [mounted, user, isAuthenticated, isLoading, pathname, router, logout]);

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

  const items = user.role === "worker" 
    ? WORKER_SIDEBAR_ITEMS 
    : user.role === "security" 
      ? SECURITY_SIDEBAR_ITEMS 
      : user.role === "secretary"
        ? SECRETARY_SIDEBAR_ITEMS
        : SOCIETY_SIDEBAR_ITEMS;

  const portalName = user.role === "worker" 
    ? "Worker Portal" 
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
