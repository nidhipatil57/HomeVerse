"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UtensilsCrossed, Star, Clock, Users, TrendingUp, ThumbsUp,
  ThumbsDown, ChevronLeft, ChevronRight, Bot, Plus, Trash2, Edit, Save, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/store/useAuth";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { weeklyMenu as initialWeeklyMenu, crowdPredictions } from "@/data/mock-mess-menu";
import dynamic from "next/dynamic";

const HostelMessCrowdPredictionChart = dynamic(() => import("@/components/charts/HostelMessCrowdPredictionChart"), {
  ssr: false,
  loading: () => <div className="h-[250px] flex items-center justify-center bg-secondary/10 animate-pulse rounded-xl" />
});

export default function MessMenuPage() {
  const { user, initialize } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [menu, setMenu] = useState(initialWeeklyMenu);
  const [selectedDay, setSelectedDay] = useState(2); // Wednesday

  // Warden editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editMealType, setEditMealType] = useState<"breakfast" | "lunch" | "snacks" | "dinner">("lunch");
  const [editItemsText, setEditItemsText] = useState("");

  useEffect(() => {
    initialize();
    setMounted(true);
  }, [initialize]);

  if (!mounted) return null;

  const isWarden = user?.role === "warden";
  const currentMenu = menu[selectedDay];

  const handleOpenEdit = (mealType: any, currentItems: any[]) => {
    setEditMealType(mealType);
    setEditItemsText(currentItems.map(i => i.name).join(", "));
    setIsEditing(true);
  };

  const handleSaveMenu = () => {
    const updated = [...menu];
    const targetMeal = updated[selectedDay].meals.find(m => m.type === editMealType);
    if (targetMeal) {
      targetMeal.items = editItemsText.split(",").map(item => ({
        name: item.trim(),
        isVeg: !item.toLowerCase().includes("egg") && !item.toLowerCase().includes("chicken") && !item.toLowerCase().includes("fish"),
        calories: 150 + Math.floor(Math.random() * 200)
      })).filter(i => i.name);
    }
    setMenu(updated);
    setIsEditing(false);
    alert(`Menu updated for ${currentMenu.day} ${editMealType}`);
  };

  // --- WARDEN OPERATIONS DECK ---
  if (isWarden) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
              <UtensilsCrossed className="w-8 h-8 text-amber-500" /> Kitchen operations & Mess Management
            </h1>
            <p className="text-muted-foreground mt-1">Configure weekly catering rosters, track food feedback ratings, and inspect supply reserves</p>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b">
          {menu.map((day, index) => (
            <Button
              key={day.day}
              variant={selectedDay === index ? "default" : "outline"}
              className={`rounded-xl shrink-0 ${
                selectedDay === index ? "gradient-primary text-white border-0 shadow-lg shadow-primary/25" : ""
              }`}
              onClick={() => {
                setSelectedDay(index);
                setIsEditing(false);
              }}
            >
              {day.day}
            </Button>
          ))}
        </div>

        {/* Warden Management Split */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Menu roster editing */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3 border-b border-border/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Catering Roster: {currentMenu.day}</CardTitle>
                  <CardDescription>Review and modify ingredients listed for students</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {currentMenu.meals.map((meal) => (
                    <div key={meal.type} className="p-4 rounded-xl border border-border/50 bg-secondary/15 space-y-3 relative group">
                      <div className="flex justify-between items-center">
                        <span className="font-bold capitalize text-sm">{meal.type} ({meal.time})</span>
                        <Button
                          onClick={() => handleOpenEdit(meal.type as any, meal.items)}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {meal.items.map((it, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-center justify-between">
                            <span>{it.isVeg ? "🟢" : "🔴"} {it.name}</span>
                            <span>{it.calories} cal</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t flex justify-between items-center text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                          Feedback Score: {meal.rating || 4.2} ★
                        </span>
                        <span className="capitalize">{meal.crowdLevel} load</span>
                      </div>
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                    <span className="font-bold text-xs text-amber-600 block capitalize">Edit {editMealType} menu items</span>
                    <Input
                      value={editItemsText}
                      onChange={(e) => setEditItemsText(e.target.value)}
                      placeholder="e.g. Kadhi Pakora, Pulao, Salad (comma separated)"
                      className="h-10 text-xs rounded-xl"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" className="rounded-lg text-xs h-8">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveMenu} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg h-8 text-xs border-0">
                        <Save className="w-3.5 h-3.5 mr-1" /> Save Roster
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Crowd Predictions */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold">Canteen Crowd occupancy forecast</CardTitle>
                <CardDescription>Live hourly attendance forecasts to optimize catering service rates</CardDescription>
              </CardHeader>
              <CardContent>
                <HostelMessCrowdPredictionChart />
              </CardContent>
            </Card>
          </div>

          {/* Canteen Analytics & Stock Warnings */}
          <div className="lg:col-span-4 space-y-6">
            {/* Stock Levels */}
            <Card className="border-border/50">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-base font-bold">Kitchen Inventory Reserves</CardTitle>
                <CardDescription>Stock thresholds and warnings</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-3 text-xs">
                {[
                  { item: "Rice Grain Bags", status: "Healthy", qty: "42 Bags", color: "bg-green-500" },
                  { item: "Wheat Flour (Atta)", status: "Healthy", qty: "32 Bags", color: "bg-green-500" },
                  { item: "Fresh Milk / Dairy", status: "Critical Threshold", qty: "8 Litres", color: "bg-red-500 animate-pulse" },
                  { item: "Cooking Refined Oil", status: "Low Stock Warning", qty: "12 Litres", color: "bg-amber-500" },
                ].map((inv, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg border bg-secondary/5">
                    <div>
                      <h4 className="font-semibold text-foreground">{inv.item}</h4>
                      <p className="text-[10px] text-muted-foreground">Volume: {inv.qty}</p>
                    </div>
                    <Badge className={`${inv.status.includes("Critical") ? "bg-red-500/15 text-red-500" : inv.status.includes("Low") ? "bg-amber-500/15 text-amber-500" : "bg-green-500/15 text-green-500"}`}>
                      {inv.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Food Wastage reports */}
            <Card className="border-border/50">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-base font-bold">Mess Wastage Index</CardTitle>
                <CardDescription>Daily food disposal weight logs</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  {[
                    { meal: "Breakfast", waste: "4 kg", target: "12 kg limit" },
                    { meal: "Lunch", waste: "11 kg", target: "12 kg limit" },
                    { meal: "Dinner", waste: "15 kg", target: "12 kg limit", warning: true },
                  ].map((w, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold">{w.meal}</span>
                        <span className={w.warning ? "text-red-500 font-bold" : "text-muted-foreground"}>{w.waste} Disposed</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${w.warning ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${(parseInt(w.waste) / 20) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start gap-2 text-[10px] text-muted-foreground mt-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p>Dinner wastage exceeded maximum parameters by 3 kg. Consider reducing Roti preparation count by 10% on Wednesday cycles.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // --- STUDENT VIEW (Mess Menu & Feedback) ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">
            Hostel Mess Menu 🍽️
          </h1>
          <p className="text-muted-foreground mt-1">
            Daily menu calendar, nutritional counts, and AI crowd occupancy warnings
          </p>
        </div>
      </motion.div>

      {/* Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {menu.map((day, index) => (
          <Button
            key={day.day}
            variant={selectedDay === index ? "default" : "outline"}
            className={`rounded-xl shrink-0 ${
              selectedDay === index ? "gradient-primary text-white border-0 shadow-lg shadow-primary/25" : ""
            }`}
            onClick={() => setSelectedDay(index)}
          >
            {day.day}
          </Button>
        ))}
      </div>

      {/* Meals Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid sm:grid-cols-2 gap-4"
        key={selectedDay}
      >
        {currentMenu.meals.map((meal) => (
          <motion.div key={meal.type} variants={fadeInUp}>
            <Card className="border-border/50 hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold capitalize flex items-center gap-2 font-[family-name:var(--font-heading)]">
                      {meal.type === "breakfast" && "🌅"}
                      {meal.type === "lunch" && "☀️"}
                      {meal.type === "snacks" && "🍪"}
                      {meal.type === "dinner" && "🌙"}
                      {meal.type}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        meal.crowdLevel === "low"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : meal.crowdLevel === "moderate"
                            ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 mr-1" />
                      {meal.crowdLevel} load
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> {meal.time}
                  </p>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {/* Menu Items */}
                  <div className="space-y-2">
                    {meal.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-foreground">
                        <span className="flex items-center gap-1.5">
                          <span>{item.isVeg ? "🟢" : "🔴"}</span>
                          <span>{item.name}</span>
                        </span>
                        {item.calories && (
                          <span className="text-[10px] text-muted-foreground">{item.calories} cal</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0 border-t bg-secondary/5 mt-auto flex items-center justify-between gap-4 text-xs">
                {meal.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{meal.rating} ★</span>
                  </div>
                )}
                <div className="flex gap-1.5 mt-2">
                  <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-green-500/10" title="Recommend Dish">
                    <ThumbsUp className="w-3.5 h-3.5 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-red-500/10" title="Dislike Dish">
                    <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Crowd Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                AI Dining Occupancy predictions
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                AI Agent Forecast
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Peak student volume estimated: <span className="text-red-500 font-semibold">1:00 PM</span> and <span className="text-red-500 font-semibold">8:00 PM</span>. Try dining earlier or later.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <HostelMessCrowdPredictionChart />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
