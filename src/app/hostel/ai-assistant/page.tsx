"use client";

import dynamic from "next/dynamic";

const AIChat = dynamic(() => import("@/components/ai/ChatInterface").then((mod) => mod.AIChat), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
    </div>
  )
});

export default function HostelAIAssistant() {
  return <AIChat portalType="hostel" />;
}
