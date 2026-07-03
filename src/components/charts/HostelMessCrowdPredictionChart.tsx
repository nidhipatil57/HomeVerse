"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from "recharts";
import { crowdPredictions } from "@/data/mock-mess-menu";

export default function HostelMessCrowdPredictionChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={crowdPredictions}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" label={{ value: "Crowd %", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            fontSize: "12px",
          }}
        />
        <Bar
          dataKey="crowd"
          radius={[6, 6, 0, 0]}
          fill="var(--primary)"
        >
          {crowdPredictions.map((entry, index) => {
            const color = entry.crowd <= 30 ? "#22c55e" : entry.crowd <= 50 ? "#eab308" : entry.crowd <= 75 ? "#f97316" : "#ef4444";
            return <rect key={index} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
