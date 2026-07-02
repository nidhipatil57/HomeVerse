"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Bot,
  MessageSquareWarning,
  Users,
  IndianRupee,
  Heart,
  BarChart3,
  Store,
  Megaphone,
  Settings,
  UtensilsCrossed,
  WashingMachine,
  ClipboardCheck,
  Package,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Bot, MessageSquareWarning, Users, IndianRupee,
  Heart, BarChart3, Store, Megaphone, Settings,
  UtensilsCrossed, WashingMachine, ClipboardCheck, Package, GraduationCap,
};

interface SidebarProps {
  items: { label: string; href: string; icon: string }[];
  portalName: string;
  portalType: "society" | "hostel";
}

export function Sidebar({ items, portalName, portalType }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const PortalIcon = portalType === "society" ? Building2 : GraduationCap;
  const gradientClass = portalType === "society" ? "gradient-primary" : "from-emerald-600 to-teal-600 bg-gradient-to-br";

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border/50 bg-sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className={`w-8 h-8 rounded-lg ${gradientClass} flex items-center justify-center shadow-md`}>
                <PortalIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold font-[family-name:var(--font-heading)]">
                  Home<span className="text-gradient">Verse</span>
                </span>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  {portalName}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg w-8 h-8 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href;

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <Icon className={cn("w-4.5 h-4.5 shrink-0", isActive && "text-primary")} />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && isActive && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger render={linkContent} />
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>

        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="text-xs font-semibold gradient-primary text-white">
              NK
            </AvatarFallback>
          </Avatar>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate">Nidhi Kumar</p>
                <p className="text-xs text-muted-foreground truncate">
                  A-301 · Resident
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <Button variant="ghost" size="icon" className="rounded-lg w-8 h-8 shrink-0">
              <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
