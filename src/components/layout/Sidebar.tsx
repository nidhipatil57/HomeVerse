"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  // New icons
  Briefcase,
  MapPin,
  Wrench,
  Star,
  AlertTriangle,
  Shield,
  FileCheck,
  Bed,
  FileText,
  UserCheck,
  Calendar,
  BookOpen,
  CalendarPlus,
  Key,
  Clock,
  Zap,
  Search,
  Car,
  Camera,
  CalendarDays,
  CreditCard,
  Tag,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/store/useAuth";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Bot, MessageSquareWarning, Users, IndianRupee,
  Heart, BarChart3, Store, Megaphone, Settings,
  UtensilsCrossed, WashingMachine, ClipboardCheck, Package, GraduationCap,
  Briefcase, MapPin, Wrench, Star, AlertTriangle, Shield, FileCheck, Bed, FileText, UserCheck,
  Search, Car, Camera, Calendar, BookOpen, CalendarPlus, Key, Clock, Zap,
  CalendarDays, CreditCard, Tag, DollarSign,
};

interface SidebarProps {
  items: { label: string; href: string; icon: string }[];
  portalName: string;
  portalType: "society" | "hostel";
}

export const Sidebar = memo(function Sidebar({ items, portalName: initialPortalName, portalType: initialPortalType }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, initialize } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    setMounted(true);
  }, [initialize]);

  // Dynamic portal details based on active user role
  const activePortalType = mounted && user ? user.portal : initialPortalType;
  const activeUserRole = mounted && user ? user.role : "resident";

  let portalName = initialPortalName;
  if (mounted && user) {
    if (user.role === "manager") {
      portalName = "Manager Portal";
    } else if (user.role === "security") {
      portalName = "Security Portal";
    } else if (user.role === "warden") {
      portalName = "Warden Portal";
    } else if (user.role === "student") {
      portalName = "Student Portal";
    } else if (user.role === "secretary") {
      portalName = "Secretary Portal";
    } else {
      portalName = user.portal === "society" ? "Society Portal" : "Hostel Portal";
    }
  }

  const PortalIcon = activePortalType === "society" ? Building2 : GraduationCap;
  
  // Decide portal theme gradient
  let gradientClass = "gradient-primary"; // default society resident
  if (activePortalType === "hostel") {
    gradientClass = activeUserRole === "warden" 
      ? "from-amber-600 to-orange-600 bg-gradient-to-br" 
      : "from-emerald-600 to-teal-600 bg-gradient-to-br";
  } else if (activePortalType === "society") {
    if (activeUserRole === "manager") {
      gradientClass = "from-blue-600 to-indigo-600 bg-gradient-to-br";
    } else if (activeUserRole === "security") {
      gradientClass = "from-red-600 to-amber-600 bg-gradient-to-br";
    } else if (activeUserRole === "secretary") {
      gradientClass = "from-indigo-600 to-violet-600 bg-gradient-to-br";
    }
  }

  const initials = mounted && user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "NK";

  const displayName = mounted && user?.name ? user.name : "Nidhi Kumar";
  
  let displaySubtitle = "A-301 · Resident";
  if (mounted && user) {
    const parts = [];
    if (user.unit) parts.push(user.unit);
    if (user.workerCategory) parts.push(user.workerCategory);
    parts.push(user.role.charAt(0).toUpperCase() + user.role.slice(1));
    displaySubtitle = parts.join(" · ");
  }

  const handleLogout = () => {
    const portal = user?.portal || activePortalType;
    logout();
    router.replace(`/login?portal=${portal}`);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border/50 bg-sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 h-12 shrink-0">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className={`w-7 h-7 rounded-lg ${gradientClass} flex items-center justify-center shadow-md`}>
                <PortalIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold font-[family-name:var(--font-heading)]">
                  Home<span className="text-gradient">Verse</span>
                </span>
                <p className="text-[9px] text-muted-foreground leading-none mt-0.5">
                  {portalName}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg w-7 h-7 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <PanelLeft className="w-3.5 h-3.5" />
          ) : (
            <PanelLeftClose className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      {(() => {
        const isDenseList = items.length >= 14;
        return (
          <nav
            className={cn(
              "flex-1 px-2.5 py-1.5 min-h-0 flex flex-col justify-between overflow-hidden",
              !isDenseList && "space-y-1 justify-start overflow-y-auto"
            )}
          >
            {items.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = pathname === item.href;

              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 rounded-xl text-[13px] font-medium transition-all duration-150 group relative",
                    isDenseList ? "flex-1 min-h-0 max-h-[46px] my-px" : "h-10",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-primary/10 text-primary shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] h-5 rounded-r-full bg-primary"
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive && "text-primary")} />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="truncate text-[13px]"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && isActive && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50 shrink-0" />
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
        );
      })()}

      <Separator />

      {/* Footer */}
      <div className="px-3 py-2 shrink-0">
        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="text-[11px] font-bold gradient-primary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate leading-tight">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">
                {displaySubtitle}
              </p>
            </div>
          )}
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg w-7 h-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={handleLogout}
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
});
