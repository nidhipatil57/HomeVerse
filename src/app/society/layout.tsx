"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { SOCIETY_SIDEBAR_ITEMS, WORKER_SIDEBAR_ITEMS, SECURITY_SIDEBAR_ITEMS } from "@/lib/constants";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";

const WORKER_ONLY_PATHS = [
  "/society/route",
  "/society/inventory",
  "/society/performance",
  "/society/emergency"
];

const SECURITY_ALLOWED_PATHS = [
  "/society/dashboard",
  "/society/visitors",
  "/society/announcements",
  "/society/settings"
];

const RESIDENT_ONLY_PATHS = [
  "/society/maintenance",
  "/society/community",
  "/society/visitors",
  "/society/marketplace",
  "/society/analytics",
  "/society/announcements"
];

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
    if (user.role === "worker") {
      // Worker attempting resident-only routes
      const isResidentRoute = RESIDENT_ONLY_PATHS.some(path => pathname.startsWith(path));
      if (isResidentRoute) {
        logout();
        router.replace("/login?portal=society");
      }
    } else if (user.role === "resident") {
      // Resident attempting worker-only routes
      const isWorkerRoute = WORKER_ONLY_PATHS.some(path => pathname.startsWith(path));
      if (isWorkerRoute) {
        logout();
        router.replace("/login?portal=society");
      }
    } else if (user.role === "security") {
      // Security attempting unauthorized routes
      const isAllowed = SECURITY_ALLOWED_PATHS.some(path => pathname.startsWith(path));
      if (!isAllowed) {
        logout();
        router.replace("/login?portal=society");
      }
    } else {
      // Unrecognized role for society
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
  if (user.role === "worker" && RESIDENT_ONLY_PATHS.some(path => pathname.startsWith(path))) {
    return null;
  }
  if (user.role === "resident" && WORKER_ONLY_PATHS.some(path => pathname.startsWith(path))) {
    return null;
  }
  if (user.role === "security" && !SECURITY_ALLOWED_PATHS.some(path => pathname.startsWith(path))) {
    return null;
  }

  const items = user.role === "worker" 
    ? WORKER_SIDEBAR_ITEMS 
    : user.role === "security" 
      ? SECURITY_SIDEBAR_ITEMS 
      : SOCIETY_SIDEBAR_ITEMS;

  const portalName = user.role === "worker" 
    ? "Worker Portal" 
    : user.role === "security" 
      ? "Security Portal" 
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
