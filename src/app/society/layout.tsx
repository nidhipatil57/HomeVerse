"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { SOCIETY_SIDEBAR_ITEMS } from "@/lib/constants";

export default function SocietyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        items={SOCIETY_SIDEBAR_ITEMS}
        portalName="Society Portal"
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
