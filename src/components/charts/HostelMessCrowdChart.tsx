"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend
} from "recharts";

export default function HostelMessCrowdChart() {
  const data = [
    { name: "Mon", Breakfast: 240, Lunch: 210, Dinner: 290 },
    { name: "Tue", Breakfast: 230, Lunch: 220, Dinner: 310 },
    { name: "Wed", Breakfast: 250, Lunch: 200, Dinner: 320 },
    { name: "Thu", Breakfast: 220, Lunch: 205, Dinner: 280 },
    { name: "Fri", Breakfast: 240, Lunch: 240, Dinner: 330 },
    { name: "Sat", Breakfast: 180, Lunch: 150, Dinner: 220 },
    { name: "Sun", Breakfast: 150, Lunch: 120, Dinner: 210 },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <RechartsTooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
        <Legend />
        <Bar dataKey="Breakfast" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Lunch" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Dinner" fill="#eab308" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
