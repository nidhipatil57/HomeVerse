"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  UtensilsCrossed, Star, Clock, Users, TrendingUp, ThumbsUp,
  ThumbsDown, ChevronLeft, ChevronRight, Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { weeklyMenu, crowdPredictions } from "@/data/mock-mess-menu";
import dynamic from "next/dynamic";

const HostelMessCrowdPredictionChart = dynamic(() => import("@/components/charts/HostelMessCrowdPredictionChart"), {
  ssr: false,
  loading: () => <div className="h-[250px] flex items-center justify-center bg-secondary/10 animate-pulse rounded-xl" />
});

export default function MessMenuPage() {
  const [selectedDay, setSelectedDay] = useState(2); // Wednesday

  const currentMenu = weeklyMenu[selectedDay];

  const crowdColors = {
    low: "#22c55e",
    moderate: "#eab308",
    high: "#f97316",
    "very-high": "#ef4444",
  };

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
            Mess Menu 🍽️
          </h1>
          <p className="text-muted-foreground mt-1">
            Daily menu with ratings and AI crowd predictions
          </p>
        </div>
      </motion.div>

      {/* Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {weeklyMenu.map((day, index) => (
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
            <Card className="border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold capitalize flex items-center gap-2 font-[family-name:var(--font-heading)]">
                    {meal.type === "breakfast" && "🌅"}
                    {meal.type === "lunch" && "☀️"}
                    {meal.type === "snacks" && "🍪"}
                    {meal.type === "dinner" && "🌙"}
                    {meal.type}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      meal.crowdLevel === "low"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : meal.crowdLevel === "moderate"
                          ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                          : meal.crowdLevel === "high"
                            ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {meal.crowdLevel} crowd
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {meal.time}
                </p>
              </CardHeader>
              <CardContent>
                {/* Menu Items */}
                <div className="space-y-2 mb-4">
                  {meal.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{item.isVeg ? "🟢" : "🔴"}</span>
                        <span>{item.name}</span>
                      </div>
                      {item.calories && (
                        <span className="text-xs text-muted-foreground">{item.calories} cal</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total Calories */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 mb-3">
                  <span className="text-xs text-muted-foreground">Total Calories</span>
                  <span className="text-sm font-semibold">
                    {meal.items.reduce((sum, item) => sum + (item.calories || 0), 0)} cal
                  </span>
                </div>

                {/* Rating */}
                {meal.rating && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(meal.rating!)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{meal.rating}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-green-500/10">
                        <ThumbsUp className="w-3.5 h-3.5 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-red-500/10">
                        <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Crowd Prediction Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                AI Crowd Prediction — Today
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                AI Powered
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Best time to eat: <span className="text-green-500 font-medium">7:30 AM</span>,{" "}
              <span className="text-green-500 font-medium">2:00 PM</span>, and{" "}
              <span className="text-green-500 font-medium">9:00 PM</span>
            </p>
          </CardHeader>
          <CardContent>
            <HostelMessCrowdPredictionChart />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
