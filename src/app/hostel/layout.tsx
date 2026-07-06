"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { HOSTEL_SIDEBAR_ITEMS, WARDEN_SIDEBAR_ITEMS } from "@/lib/constants";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";

const getAllowedPaths = (role: string): string[] => {
  switch (role) {
    case "student":
      return [
        "/hostel/dashboard",
        "/hostel/ai-assistant",
        "/hostel/mess",
        "/hostel/laundry",
        "/hostel/complaints",
        "/hostel/leaves",
        "/hostel/attendance",
        "/hostel/study-rooms",
        "/hostel/marketplace",
        "/hostel/lost-found",
        "/hostel/events",
        "/hostel/roommate-finder",
        "/hostel/parcels",
        "/hostel/notifications",
        "/hostel/settings"
      ];
    case "warden":
      return [
        "/hostel/dashboard",
        "/hostel/students",
        "/hostel/rooms",
        "/hostel/attendance-mgmt",
        "/hostel/complaints",
        "/hostel/mess-management",
        "/hostel/laundry-management",
        "/hostel/visitors",
        "/hostel/parcel-management",
        "/hostel/announcements",
        "/hostel/reports",
        "/hostel/analytics",
        "/hostel/notifications",
        "/hostel/settings"
      ];
    default:
      return [];
  }
};

export default function HostelLayout({
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

  // Route Guard checks
  useEffect(() => {
    if (!mounted || isLoading) return;

    // 1. Unauthenticated or wrong session
    if (!isAuthenticated || !user) {
      logout();
      router.replace("/login?portal=hostel");
      return;
    }

    // 2. Wrong Portal check
    if (user.portal !== "hostel") {
      logout();
      router.replace("/login?portal=hostel");
      return;
    }

    // 3. Role Authorization check
    const allowedPaths = getAllowedPaths(user.role);
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path));
    if (!isAllowed) {
      logout();
      router.replace("/login?portal=hostel");
    }
  }, [mounted, user, isAuthenticated, isLoading, pathname, router, logout]);

  // Show loading spinner during session checks
  if (!mounted || isLoading || !isAuthenticated || !user || user.portal !== "hostel") {
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

  const items = user.role === "warden" ? WARDEN_SIDEBAR_ITEMS : HOSTEL_SIDEBAR_ITEMS;
  const portalName = user.role === "warden" ? "Warden Portal" : "Hostel Portal";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        items={items}
        portalName={portalName}
        portalType="hostel"
      />
      <main className="pl-[72px] md:pl-[280px] transition-all duration-300">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
