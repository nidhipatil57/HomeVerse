"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SocietyMarketplaceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/society/buy-sell");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
    </div>
  );
}
