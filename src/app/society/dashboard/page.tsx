"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the role-specific dashboards to reduce compile time and bundle size
const SocietyResidentDashboard = dynamic(
  () => import("@/components/dashboard/SocietyResidentDashboard").then((m) => m.SocietyResidentDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    )
  }
);

const SocietyWorkerDashboard = dynamic(
  () => import("@/components/dashboard/SocietyWorkerDashboard").then((m) => m.SocietyWorkerDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    )
  }
);

const SocietySecurityDashboard = dynamic(
  () => import("@/components/dashboard/SocietySecurityDashboard").then((m) => m.SocietySecurityDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    )
  }
);

const SocietySecretaryDashboard = dynamic(
  () => import("@/components/dashboard/SocietySecretaryDashboard").then((m) => m.SocietySecretaryDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    )
  }
);

export default function SocietyDashboardPage() {
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
      router.replace("/login?portal=society");
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
  if (user?.role === "worker") {
    return <SocietyWorkerDashboard worker={user} />;
  }

  if (user?.role === "security") {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
        </div>
      }>
        <SocietySecurityDashboard security={user} />
      </Suspense>
    );
  }

  if (user?.role === "secretary") {
    return <SocietySecretaryDashboard secretary={user} />;
  }

  return <SocietyResidentDashboard resident={user} />;
}
