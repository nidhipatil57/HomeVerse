"use client";
import { motion } from "motion/react";
import { Settings, User, Bell, Shield, Palette, Globe, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const settingsSections = [
  { title: "Profile Settings", description: "Update your name, photo, and contact info", icon: User, color: "from-blue-500 to-cyan-500" },
  { title: "Notifications", description: "Manage email, SMS, and push notifications", icon: Bell, color: "from-amber-500 to-orange-500" },
  { title: "Privacy & Security", description: "Password, 2FA, and data preferences", icon: Shield, color: "from-red-500 to-pink-500" },
  { title: "Appearance", description: "Theme, language, and display settings", icon: Palette, color: "from-purple-500 to-violet-500" },
  { title: "Connected Accounts", description: "Manage linked accounts and integrations", icon: Globe, color: "from-green-500 to-emerald-500" },
  { title: "Help & Support", description: "FAQs, documentation, and contact support", icon: HelpCircle, color: "from-teal-500 to-cyan-500" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Settings ⚙️</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </motion.div>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsSections.map((s) => (
          <motion.div key={s.title} variants={fadeInUp}>
            <Card className="border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
