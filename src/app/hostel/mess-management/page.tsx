"use client";

import { useState, useEffect } from "react";
import { UtensilsCrossed, Edit, Save, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/store/useAuth";
import { weeklyMenu as initialWeeklyMenu } from "@/data/mock-mess-menu";

export default function WardenMessManagementPage() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Mess Management 🍴
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure catering rosters, edit weekly menus, and inspect food feedback scores
        </p>
      </div>

      {/* Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b">
        {menu.map((day, index) => (
          <Button
            key={day.day}
            variant={selectedDay === index ? "default" : "outline"}
            className={`rounded-xl shrink-0 ${
              selectedDay === index ? "gradient-primary text-white border-0 shadow-md" : ""
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

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Menu roster editing */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Catering Roster: {currentMenu.day}</CardTitle>
              <CardDescription>Modify ingredients and items served to students</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {currentMenu.meals.map((meal) => (
                  <div key={meal.type} className="p-4 rounded-xl border border-border/50 bg-secondary/15 space-y-3 relative group">
                    <div className="flex justify-between items-center">
                      <span className="font-bold capitalize text-xs">{meal.type} ({meal.time})</span>
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
                  <div className="flex gap-2">
                    <Button onClick={handleSaveMenu} className="gradient-primary text-white border-0 h-9.5 text-xs font-semibold rounded-xl">
                      <Save className="w-3.5 h-3.5 mr-1" /> Save Roster
                    </Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-9.5 text-xs rounded-xl">Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column details */}
        <Card className="lg:col-span-4 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold">Kitchen Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>Ensure vegetable inventory is cleaned and checked by 6:00 AM daily.</p>
            <p>Quality check milk and grocery deliveries before storage.</p>
            <p>Record temperature values of storage lockers in the logs twice daily.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
