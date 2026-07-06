"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/useAuth";

export default function SocietyMaintenanceRedirect() {
  const router = useRouter();
  const { user, initialize } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    setMounted(true);
  }, [initialize]);

  useEffect(() => {
    if (!mounted || !user) return;
    if (user.role === "secretary") {
      router.replace("/society/maintenance-bills-mgmt");
    } else {
      router.replace("/society/maintenance-bills");
    }
  }, [mounted, user, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
    </div>
  );
}
