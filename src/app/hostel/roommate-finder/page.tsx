"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Search, Plus, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function RoommateFinderPage() {
  const { user, initialize } = useAuth();
  const {
    roommatePreferences, submitRoommatePreference, users, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      roommatePreferences: state.roommatePreferences || [],
      submitRoommatePreference: state.submitRoommatePreference,
      users: state.users || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Preference Form State
  const [lifestyle, setLifestyle] = useState("Early Bird");
  const [food, setFood] = useState("Veg");
  const [cleanliness, setCleanliness] = useState("Neat Freak");
  const [budget, setBudget] = useState("Medium");
  const [sleeping, setSleeping] = useState("Light Sleeper");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const handlePreferenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRoommatePreference({
      userId: user?.id || "student-1",
      userName: user?.name || "Aarav Mehta",
      lifestyle,
      food,
      cleanliness,
      budget,
      sleeping
    });
    alert("Lifestyle preferences saved! Matching with other profiles...");
  };

  // Find matches (simple rule based matching: match on lifestyle and cleanliness)
  const myPref = roommatePreferences.find(p => p.userId === user?.id);

  const matches = roommatePreferences.filter(p => p.userId !== user?.id).map((other) => {
    let score = 0;
    if (myPref) {
      if (other.lifestyle === myPref.lifestyle) score += 25;
      if (other.cleanliness === myPref.cleanliness) score += 25;
      if (other.food === myPref.food) score += 25;
      if (other.budget === myPref.budget) score += 25;
    } else {
      score = 75; // Default score
    }
    return { ...other, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Roommate Finder 👥
        </h1>
        <p className="text-muted-foreground mt-1">
          Save your lifestyle habits and match with compatible roommates based on sleeping patterns, food, and cleanliness
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Preference Form */}
        <Card className="lg:col-span-5 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" /> Setup Preferences
            </CardTitle>
            <CardDescription>Tell roommates about your daily habits</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePreferenceSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Daily Habit</label>
                <select value={lifestyle} onChange={(e) => setLifestyle(e.target.value)} className="w-full h-9 px-3 border rounded-lg text-xs bg-card">
                  <option>Early Bird</option>
                  <option>Night Owl</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Food Habits</label>
                <select value={food} onChange={(e) => setFood(e.target.value)} className="w-full h-9 px-3 border rounded-lg text-xs bg-card">
                  <option>Veg</option>
                  <option>Non-Veg</option>
                  <option>No Preference</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Cleanliness Preference</label>
                <select value={cleanliness} onChange={(e) => setCleanliness(e.target.value)} className="w-full h-9 px-3 border rounded-lg text-xs bg-card">
                  <option>Neat Freak</option>
                  <option>Moderate</option>
                  <option>Relaxed</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Monthly Budget</label>
                <select value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full h-9 px-3 border rounded-lg text-xs bg-card">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Sleeping Habits</label>
                <select value={sleeping} onChange={(e) => setSleeping(e.target.value)} className="w-full h-9 px-3 border rounded-lg text-xs bg-card">
                  <option>Light Sleeper</option>
                  <option>Heavy Sleeper</option>
                </select>
              </div>
              <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 text-xs font-semibold shadow-sm">
                Save Preferences
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Matches List */}
        <Card className="lg:col-span-7 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Compatible Profiles Found</CardTitle>
            <CardDescription>Matching calculations based on cleanliness & sleeping habits</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {matches.map((m, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-secondary/15 transition-colors text-xs">
                  <div>
                    <h4 className="font-bold">{m.userName}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Habit: {m.lifestyle} • Clean: {m.cleanliness} • Sleep: {m.sleeping}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className="border-emerald-500/25 text-emerald-500 bg-emerald-500/5 text-[9px] font-bold">
                      {m.matchScore}% Match
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => alert(`Connection request sent to ${m.userName}!`)}
                      className="rounded-lg h-8 text-[9px] font-semibold"
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
              {matches.length === 0 && (
                <div className="text-center py-20 text-muted-foreground text-xs">
                  Save preferences to view matches.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
