"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";

export default function HostelComplaintsLineChart() {
  const data = [
    { name: "Jan", Open: 15, Resolved: 12 },
    { name: "Feb", Open: 18, Resolved: 16 },
    { name: "Mar", Open: 22, Resolved: 20 },
    { name: "Apr", Open: 14, Resolved: 15 },
    { name: "May", Open: 10, Resolved: 12 },
    { name: "Jun", Open: 8, Resolved: 9 },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <RechartsTooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
        <Line type="monotone" dataKey="Open" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
