"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { HOSTEL_SIDEBAR_ITEMS, WARDEN_SIDEBAR_ITEMS } from "@/lib/constants";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";

export default function HostelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initialize } = useAuth();
  const initializeDb = useCommunityStore(state => state.initializeDb);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  const items = mounted && user?.role === "warden" ? WARDEN_SIDEBAR_ITEMS : HOSTEL_SIDEBAR_ITEMS;
  const portalName = mounted && user?.role === "warden" ? "Warden Portal" : "Hostel Portal";

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
