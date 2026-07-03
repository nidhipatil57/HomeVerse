"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend
} from "recharts";

export default function HostelResourceUsageChart() {
  const resourceData = [
    { month: "Jan", Electricity: 4500, Water: 1200 },
    { month: "Feb", Electricity: 4200, Water: 1100 },
    { month: "Mar", Electricity: 4800, Water: 1300 },
    { month: "Apr", Electricity: 5600, Water: 1550 },
    { month: "May", Electricity: 6100, Water: 1700 },
    { month: "Jun", Electricity: 5900, Water: 1600 }
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={resourceData}>
        <defs>
          <linearGradient id="elecGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="watGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" />
        <YAxis />
        <RechartsTooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
        <Legend />
        <Area type="monotone" dataKey="Electricity" stroke="#eab308" fill="url(#elecGrad)" strokeWidth={2} name="Electricity (kWh)" />
        <Area type="monotone" dataKey="Water" stroke="#3b82f6" fill="url(#watGrad)" strokeWidth={2} name="Water (KL)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
