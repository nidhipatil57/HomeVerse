"use client";

import { useState, useEffect } from "react";
import { Bell, Check, MailOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function HostelNotificationsPage() {
  const { user, initialize } = useAuth();
  const {
    notifications, markNotificationsRead, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      notifications: state.notifications || [],
      markNotificationsRead: state.markNotificationsRead,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const myNotifications = notifications.filter(
    (n) => n.userId === user?.id || n.userId === "all_students"
  );

  const unreadCount = myNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Notifications Inbox 🔔
          </h1>
          <p className="text-muted-foreground mt-1">
            Read alerts, transaction updates, and announcements sent by the hostel warden
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={() => {
              markNotificationsRead(user?.id || "");
              alert("All notifications marked as read.");
            }}
            className="rounded-xl h-10 text-xs font-semibold gradient-primary text-white border-0 shadow-md"
          >
            <Check className="w-4 h-4 mr-1.5" /> Mark All as Read
          </Button>
        )}
      </div>

      {/* Inbox List */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-semibold flex items-center gap-1.5">
            <MailOpen className="w-4.5 h-4.5 text-primary" /> My Notifications Inbox
          </CardTitle>
          <CardDescription>Direct announcements and alert messages</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {myNotifications.map((n) => (
              <div key={n.id} className={`p-4 flex items-start gap-4 transition-colors ${
                !n.read ? "bg-primary/5" : "hover:bg-secondary/10"
              }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  !n.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1 text-xs flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`font-bold ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</h4>
                    <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
            {myNotifications.length === 0 && (
              <div className="text-center py-20 text-muted-foreground text-xs">
                Inbox empty. No notifications received.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
