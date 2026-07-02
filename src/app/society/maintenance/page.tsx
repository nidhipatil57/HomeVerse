"use client";

import { motion } from "motion/react";
import { IndianRupee, CreditCard, Clock, CheckCircle2, AlertTriangle, Download, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const bills = [
  { month: "July 2026", amount: 4500, status: "pending" as const, dueDate: "Jul 10, 2026", breakdown: [
    { label: "Society Maintenance", amount: 2500 },
    { label: "Sinking Fund", amount: 500 },
    { label: "Parking", amount: 800 },
    { label: "Water Charges", amount: 400 },
    { label: "Common Electricity", amount: 300 },
  ]},
  { month: "June 2026", amount: 4500, status: "paid" as const, dueDate: "Jun 10, 2026", paidOn: "Jun 8, 2026", breakdown: [
    { label: "Society Maintenance", amount: 2500 },
    { label: "Sinking Fund", amount: 500 },
    { label: "Parking", amount: 800 },
    { label: "Water Charges", amount: 400 },
    { label: "Common Electricity", amount: 300 },
  ]},
  { month: "May 2026", amount: 4200, status: "paid" as const, dueDate: "May 10, 2026", paidOn: "May 5, 2026", breakdown: [
    { label: "Society Maintenance", amount: 2500 },
    { label: "Sinking Fund", amount: 500 },
    { label: "Parking", amount: 800 },
    { label: "Water Charges", amount: 200 },
    { label: "Common Electricity", amount: 200 },
  ]},
  { month: "April 2026", amount: 4500, status: "paid" as const, dueDate: "Apr 10, 2026", paidOn: "Apr 12, 2026", breakdown: [
    { label: "Society Maintenance", amount: 2500 },
    { label: "Sinking Fund", amount: 500 },
    { label: "Parking", amount: 800 },
    { label: "Water Charges", amount: 400 },
    { label: "Common Electricity", amount: 300 },
  ]},
];

export default function MaintenancePage() {
  const totalPaid = bills.filter(b => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);
  const totalPending = bills.filter(b => b.status === "pending").reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Maintenance</h1>
          <p className="text-muted-foreground mt-1">View bills, payment history, and pending dues</p>
        </div>
        <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25 w-fit">
          <Download className="w-4 h-4 mr-2" /> Download Statement
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Paid (FY)", value: `₹${totalPaid.toLocaleString()}`, color: "#22c55e", icon: CheckCircle2 },
          { label: "Pending Dues", value: `₹${totalPending.toLocaleString()}`, color: "#ef4444", icon: AlertTriangle },
          { label: "Next Due Date", value: "Jul 10", color: "#f59e0b", icon: Clock },
          { label: "Payment Score", value: "95%", color: "#8b5cf6", icon: CreditCard },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeInUp}>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Bills List */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
        {bills.map((bill) => (
          <motion.div key={bill.month} variants={fadeInUp}>
            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)]">{bill.month}</h3>
                    <p className="text-xs text-muted-foreground">Due: {bill.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">₹{bill.amount.toLocaleString()}</p>
                    <Badge variant="outline" className={bill.status === "paid"
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : "bg-red-500/10 text-red-600 border-red-500/20"
                    }>
                      {bill.status === "paid" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {bill.status === "paid" ? `Paid on ${bill.paidOn}` : "Payment Due"}
                    </Badge>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-2 border-t border-border/50 pt-3">
                  {bill.breakdown.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {bill.status === "pending" && (
                  <Button className="w-full mt-4 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25 h-11">
                    <CreditCard className="w-4 h-4 mr-2" /> Pay Now
                  </Button>
                )}
                {bill.status === "paid" && (
                  <Button variant="outline" size="sm" className="mt-4 rounded-lg text-xs">
                    <Receipt className="w-3 h-3 mr-1" /> Download Receipt
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
