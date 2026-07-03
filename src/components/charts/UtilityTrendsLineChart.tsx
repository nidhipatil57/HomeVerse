"use client";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from "recharts";
import { utilityData } from "@/data/mock-dashboard";

export default function UtilityTrendsLineChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={utilityData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <RechartsTooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
        <Line type="monotone" dataKey="electricity" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} name="Electricity (kWh)" />
        <Line type="monotone" dataKey="water" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} name="Water (KL)" />
      </LineChart>
    </ResponsiveContainer>
  );
}
