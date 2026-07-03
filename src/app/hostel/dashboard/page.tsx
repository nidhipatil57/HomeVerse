"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the role-specific dashboards to reduce compile time and bundle size
const HostelStudentDashboard = dynamic(
  () => import("@/components/dashboard/HostelStudentDashboard").then((m) => m.HostelStudentDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    )
  }
);

const HostelWardenDashboard = dynamic(
  () => import("@/components/dashboard/HostelWardenDashboard").then((m) => m.HostelWardenDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    )
  }
);

export default function HostelDashboardPage() {
  const { user, initialize, logout } = useAuth();
  const initializeDb = useCommunityStore(state => state.initializeDb);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  useEffect(() => {
    if (!mounted || !user) return;

    // Push state to block back navigation and capture it
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      logout();
      router.replace("/login?portal=hostel");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [mounted, user, logout, router]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    );
  }

  // Swap Dashboards dynamically based on role
  if (user?.role === "warden") {
    return <HostelWardenDashboard warden={user} />;
  }

  return <HostelStudentDashboard student={user} />;
}
