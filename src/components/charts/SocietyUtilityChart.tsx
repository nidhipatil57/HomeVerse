"use client";

import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";
import { utilityData } from "@/data/mock-dashboard";

export default function SocietyUtilityChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={utilityData}>
        <defs>
          <linearGradient id="electricityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            fontSize: "12px",
          }}
        />
        <Area type="monotone" dataKey="electricity" stroke="#eab308" fill="url(#electricityGrad)" strokeWidth={2} name="Electricity (kWh)" />
        <Area type="monotone" dataKey="water" stroke="#0ea5e9" fill="url(#waterGrad)" strokeWidth={2} name="Water (KL)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
