"use client";

import { useEffect, useState } from "react";
import { SecretaryEventsView } from "@/app/society/events/page";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { RefreshCw } from "lucide-react";

export default function SecretaryEventsMgmtPage() {
  const { user, initialize } = useAuth();
  const { initializeDb } = useCommunityStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading secretary events management...</p>
        </div>
      </div>
    );
  }

  return <SecretaryEventsView user={user} />;
}
