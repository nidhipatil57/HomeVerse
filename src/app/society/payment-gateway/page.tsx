"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  Landmark,
  Lock,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  UserCheck,
  Wallet,
  XCircle,
  Loader2,
  RefreshCcw
} from "lucide-react";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import {
  GatewayCheckoutPayload,
  clearPendingGatewayCheckout,
  loadPendingGatewayCheckout
} from "@/lib/payment-gateway";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type MethodTab = "UPI" | "Card" | "Net Banking" | "Wallets";
type GatewayPhase = "checkout" | "processing" | "success" | "error";

const UPI_APPS = [
  { id: "gpay", name: "Google Pay", tag: "Instant • Zero Fee" },
  { id: "phonepe", name: "PhonePe", tag: "UPI Lite Supported" },
  { id: "paytm", name: "Paytm UPI", tag: "Fast Verify" },
  { id: "bhim", name: "BHIM / Any UPI", tag: "NPCI Direct" }
];

const NET_BANKS = [
  { id: "hdfc", name: "HDFC Bank", code: "HDFC" },
  { id: "icici", name: "ICICI Bank", code: "ICIC" },
  { id: "sbi", name: "State Bank of India", code: "SBIN" },
  { id: "axis", name: "Axis Bank", code: "AXIS" },
  { id: "kotak", name: "Kotak Mahindra", code: "KKBK" },
  { id: "indus", name: "IndusInd Bank", code: "INDB" }
];

const WALLETS = [
  { id: "amazon", name: "Amazon Pay", balance: "Linked Wallet" },
  { id: "mobikwik", name: "Mobikwik", balance: "Instant Cashback" },
  { id: "freecharge", name: "Freecharge", balance: "One-Tap" },
  { id: "payzapp", name: "HDFC PayZapp", balance: "Secure Vault" }
];

const PROCESSING_STEPS = [
  "Establishing 256-bit encrypted session...",
  "Authorizing transaction via HomeVerse Secure Switch...",
  "Recording verified payment & generating digital receipt..."
];

const CONFETTI_PARTICLES = Array.from({ length: 18 }).map((_, idx) => ({
  id: idx,
  x: ((idx * 37) % 260) - 130,
  y: -70 - ((idx * 29) % 110),
  rotate: (idx * 47) % 360,
  delay: (idx % 6) * 0.05,
  color:
    idx % 4 === 0
      ? "bg-emerald-400"
      : idx % 4 === 1
      ? "bg-sky-400"
      : idx % 4 === 2
      ? "bg-indigo-400"
      : "bg-amber-400"
}));

export default function MockPaymentGatewayPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { payPayment, payMaintenanceBill, registerForEvent } = useCommunityStore();

  const [payload, setPayload] = useState<GatewayCheckoutPayload | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState<MethodTab>("UPI");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [upiId, setUpiId] = useState("resident@okicici");
  const [cardNumber, setCardNumber] = useState("4532 8910 2234 8890");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("742");
  const [selectedBank, setSelectedBank] = useState("hdfc");
  const [selectedWallet, setSelectedWallet] = useState("amazon");

  const [phase, setPhase] = useState<GatewayPhase>("checkout");
  const [processStep, setProcessStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [completedTxnId, setCompletedTxnId] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [completedMethod, setCompletedMethod] = useState("");

  useEffect(() => {
    const pending = loadPendingGatewayCheckout();
    setPayload(pending);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (user?.name && !cardHolder) {
      setCardHolder(user.name.toUpperCase());
    }
    if (user?.name && upiId === "resident@okicici") {
      const slug = user.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (slug) setUpiId(`${slug}@okaxis`);
    }
  }, [user, cardHolder, upiId]);

  const resolvedMethodLabel = useMemo(() => {
    if (activeTab === "UPI") {
      const app = UPI_APPS.find((a) => a.id === selectedUpiApp)?.name || "UPI";
      return `UPI (${app})`;
    }
    if (activeTab === "Card") {
      const last4 = cardNumber.replace(/\s+/g, "").slice(-4) || "8890";
      return `Card (•••• ${last4})`;
    }
    if (activeTab === "Net Banking") {
      const bank = NET_BANKS.find((b) => b.id === selectedBank)?.name || "Net Banking";
      return `Net Banking (${bank})`;
    }
    const wallet = WALLETS.find((w) => w.id === selectedWallet)?.name || "Wallet";
    return `Wallet (${wallet})`;
  }, [activeTab, selectedUpiApp, cardNumber, selectedBank, selectedWallet]);

  const formatCardNumberInput = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleConfirmPay = async () => {
    if (!payload) return;

    if (activeTab === "UPI" && !upiId.includes("@")) {
      alert("Please enter a valid UPI ID (e.g., name@bank).");
      return;
    }
    if (activeTab === "Card" && cardNumber.replace(/\D/g, "").length < 12) {
      alert("Please enter a valid 16-digit card number.");
      return;
    }

    setErrorMessage("");
    setPhase("processing");
    setProcessStep(0);

    const txnId = `TXN-HV-${Math.floor(100000 + Math.random() * 900000)}`;
    const methodLabel = resolvedMethodLabel;

    try {
      await new Promise((r) => setTimeout(r, 650));
      setProcessStep(1);
      await new Promise((r) => setTimeout(r, 650));
      setProcessStep(2);

      if (payload.kind === "resident-payment") {
        await payPayment(payload.targetId, methodLabel, {
          transactionId: txnId,
          amount: payload.amount,
          paymentType: payload.title,
          dueDate: payload.dueDate,
          unit: payload.unit,
          building: payload.building,
          description: payload.subtitle,
          referenceId: payload.referenceId
        });
      } else if (payload.kind === "maintenance-bill") {
        await payMaintenanceBill(payload.targetId, {
          paymentMethod: methodLabel,
          transactionId: txnId,
          amount: payload.amount,
          unit: payload.unit,
          residentName: payload.residentName,
          month: payload.month,
          dueDate: payload.dueDate
        });
      } else if (payload.kind === "event-registration" && payload.eventPayload) {
        await registerForEvent(payload.eventPayload.eventId, {
          userId: payload.eventPayload.userId,
          userName: payload.eventPayload.userName,
          flatNumber: payload.eventPayload.flatNumber,
          contactNumber: payload.eventPayload.contactNumber,
          guestCount: payload.eventPayload.guestCount,
          guestNames: payload.eventPayload.guestNames,
          rsvpStatus: payload.eventPayload.rsvpStatus,
          paymentStatus: "Paid",
          paidAmount: payload.amount,
          paymentMethod: methodLabel,
          transactionId: txnId
        });
      }

      await new Promise((r) => setTimeout(r, 500));
      clearPendingGatewayCheckout();
      setCompletedTxnId(txnId);
      setCompletedMethod(methodLabel);
      setCompletedAt(new Date().toLocaleString());
      setPhase("success");
    } catch (err: any) {
      console.error("Gateway payment error:", err);
      setErrorMessage(err?.message || "Payment authorization could not be completed. Please try again.");
      setPhase("error");
    }
  };

  const handlePrintReceipt = () => {
    if (!payload) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>HomeVerse Receipt - ${completedTxnId}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #0f172a; background: #f8fafc; }
            .card { max-width: 560px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; }
            .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 18px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: 800; color: #2563eb; }
            .amount { font-size: 32px; font-weight: 800; color: #059669; text-align: center; margin: 16px 0; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .label { color: #64748b; }
            .val { font-weight: 600; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="card">
            <div class="header">
              <div class="title">SUNSHINE COMPLEX • HOMEVERSE</div>
              <div style="font-size:12px;color:#64748b;margin-top:4px;">Verified Digital Payment Receipt</div>
            </div>
            <div class="amount">₹${payload.amount.toLocaleString()}</div>
            <div class="row"><span class="label">Transaction ID</span><span class="val">${completedTxnId}</span></div>
            <div class="row"><span class="label">Paid For</span><span class="val">${payload.title}</span></div>
            <div class="row"><span class="label">Resident</span><span class="val">${payload.residentName || user?.name || "Resident"}</span></div>
            <div class="row"><span class="label">Flat / Wing</span><span class="val">${payload.building ? `${payload.building} • ` : ""}Flat ${payload.unit || user?.unit || "-"}</span></div>
            <div class="row"><span class="label">Method</span><span class="val">${completedMethod}</span></div>
            <div class="row"><span class="label">Timestamp</span><span class="val">${completedAt}</span></div>
            <div style="text-align:center;font-size:11px;color:#94a3b8;margin-top:24px;">Confirmed & Recorded in HomeVerse Ledger</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  if (!loaded) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!payload && phase !== "success") {
    return (
      <div className="relative min-h-[75vh] flex items-center justify-center p-4 overflow-hidden rounded-3xl">
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-md w-full rounded-3xl border border-white/25 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl shadow-2xl p-8 text-center space-y-4"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/15 flex items-center justify-center text-primary">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">No Active Payment Session</h2>
          <p className="text-xs text-muted-foreground">
            Select a bill, special occasion collection, or paid community event to launch the HomeVerse Secure Payment Gateway.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button onClick={() => router.push("/society/payments")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-xl">
              Go to Payments
            </Button>
            <Button variant="outline" onClick={() => router.push("/society/events")} className="flex-1 rounded-xl">
              Explore Events
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const returnHref = payload?.returnUrl || "/society/payments";
  const returnLabel = payload?.returnLabel || "Payments";

  const societyNameLabel = user?.societyName || payload?.building || "Sunshine Complex";
  const societyDomainSlug = societyNameLabel.toLowerCase().replace(/[^a-z0-9]/g, "") || "sunshinecomplex";
  const secretaryVpa = `secretary@${societyDomainSlug}.com`;

  return (
    <div className="relative min-h-[82vh] py-4 px-2 sm:px-4 overflow-hidden rounded-3xl">
      {/* Ambient Floating Orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -25, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none fixed sm:absolute -top-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/25 via-indigo-500/20 to-purple-500/25 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -28, 0], y: [0, 22, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none fixed sm:absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-sky-500/25 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none hidden lg:block absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-violet-500/15 blur-3xl"
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-5">
        {/* Top Glass Navigation Bar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/30 dark:border-white/10 bg-white/55 dark:bg-slate-900/55 backdrop-blur-xl px-4 py-3 shadow-lg shadow-indigo-500/5"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              disabled={phase === "processing"}
              onClick={() => router.push(returnHref)}
              className="rounded-xl h-8 px-2.5 text-xs hover:bg-white/60 dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              {phase === "success" ? `Back to ${returnLabel}` : "Cancel"}
            </Button>
            <div className="h-5 w-px bg-border/60 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-tight flex items-center gap-1.5">
                  HomeVerse SecurePay
                  <Badge className="text-[9px] py-0 px-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    256-Bit SSL
                  </Badge>
                </p>
                <p className="text-[10px] text-muted-foreground">Unified Society Mock Payment Gateway</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Sunshine Complex Verified Merchant</span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ==================== CHECKOUT PHASE ==================== */}
          {phase === "checkout" && payload && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="grid lg:grid-cols-12 gap-6 items-start"
            >
              {/* Left Column: Frosted Glass Order & Resident Summary */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="lg:col-span-5 space-y-4"
              >
                <div className="relative overflow-hidden rounded-3xl border border-white/40 dark:border-white/15 bg-white/65 dark:bg-slate-900/60 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10 p-6 space-y-5">
                  <div className="pointer-events-none absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl" />

                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border-primary/30 bg-primary/10 text-primary"
                    >
                      {payload.category ||
                        (payload.kind === "event-registration"
                          ? "Event Pass Checkout"
                          : payload.kind === "maintenance-bill"
                          ? "Maintenance Bill"
                          : "Society Payment")}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      REF: {payload.targetId.slice(0, 14)}
                    </span>
                  </div>

                  <div>
                    <h1 className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-foreground leading-snug">
                      {payload.title}
                    </h1>
                    {payload.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{payload.subtitle}</p>
                    )}
                  </div>

                  {/* Payer Identity Glass Inset */}
                  <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-3.5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-primary" /> Resident
                      </span>
                      <span className="font-bold">{payload.residentName || user?.name || "Resident"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary" /> Flat / Wing
                      </span>
                      <span className="font-semibold">
                        {payload.building ? `${payload.building} • ` : ""}
                        Flat {payload.unit || user?.unit || "—"}
                      </span>
                    </div>
                    {payload.dueDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" /> Date / Due
                        </span>
                        <span className="font-medium">{payload.dueDate}</span>
                      </div>
                    )}
                    {payload.eventPayload && (
                      <div className="flex items-center justify-between border-t border-border/40 pt-2">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5 text-indigo-500" /> Passes Included
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {payload.eventPayload.passCount} Pass(es) × ₹{payload.eventPayload.entryFee}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Amount Breakdown - Clean Light Theme */}
                  <div className="rounded-2xl bg-sky-50/80 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/70 p-5 space-y-2.5 shadow-sm">
                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                      <span>Payable Subtotal</span>
                      <span className="text-foreground font-semibold">₹{payload.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Platform & Gateway Fee</span>
                      <span>FREE (₹0)</span>
                    </div>
                    <div className="border-t border-sky-200/60 dark:border-slate-700 my-1" />
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-foreground">Total Amount</span>
                      <span className="text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
                        ₹{payload.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-2.5">
                    <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      Instant ledger sync & digital receipt will be recorded immediately upon authorization.
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Interactive Glass Methods Container */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-7 rounded-3xl border border-white/40 dark:border-white/15 bg-white/65 dark:bg-slate-900/60 backdrop-blur-2xl shadow-2xl shadow-blue-500/10 p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold font-[family-name:var(--font-heading)]">
                      Choose Payment Method
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Select any simulated method to authorize your HomeVerse transaction
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>

                {/* Animated Method Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/30 dark:border-white/10">
                  {(
                    [
                      { id: "UPI", icon: Smartphone, label: "UPI / QR" },
                      { id: "Card", icon: CreditCard, label: "Card" },
                      { id: "Net Banking", icon: Landmark, label: "NetBanking" },
                      { id: "Wallets", icon: Wallet, label: "Wallets" }
                    ] as const
                  ).map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors ${
                          isActive ? "text-white" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="gatewayMethodPill"
                            transition={{ type: "spring", stiffness: 360, damping: 28 }}
                            className="absolute inset-0 rounded-xl bg-blue-600 shadow-md shadow-blue-500/20"
                          />
                        )}
                        <Icon className="w-3.5 h-3.5 relative z-10" />
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Method Body with Animated Transitions */}
                <AnimatePresence mode="wait">
                  {activeTab === "UPI" && (
                    <motion.div
                      key="tab-upi"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="space-y-4"
                    >
                      <div className="grid sm:grid-cols-12 gap-4 items-center">
                        {/* 4 UPI Apps in one uniform light blue styling */}
                        <div className="sm:col-span-7 grid grid-cols-2 gap-2.5">
                          {UPI_APPS.map((app) => {
                            const selected = selectedUpiApp === app.id;
                            return (
                              <motion.button
                                key={app.id}
                                type="button"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedUpiApp(app.id)}
                                className={`text-left p-3 rounded-2xl border transition-all ${
                                  selected
                                    ? "bg-sky-100 dark:bg-sky-900/60 border-blue-500 ring-2 ring-blue-500/30 shadow-sm"
                                    : "bg-sky-50/90 dark:bg-sky-950/40 border-sky-200/70 dark:border-sky-800/50 hover:bg-sky-100/70 dark:hover:bg-sky-900/40"
                                }`}
                              >
                                <p className="text-xs font-bold text-sky-950 dark:text-sky-100">{app.name}</p>
                                <p className="text-[10px] text-sky-700/80 dark:text-sky-300/80 mt-0.5">{app.tag}</p>
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Dynamic QR Code pointing to secretary@societyname.com */}
                        <div className="sm:col-span-5 rounded-2xl border border-sky-200/80 dark:border-sky-800/60 bg-sky-50/70 dark:bg-slate-800/60 p-3.5 flex flex-col items-center justify-center text-center shadow-inner">
                          <div className="p-2 bg-white rounded-xl shadow-sm border border-sky-100">
                            <QRCodeSVG
                              value={`upi://pay?pa=${secretaryVpa}&pn=Secretary%20${encodeURIComponent(societyNameLabel)}&am=${payload.amount}&tn=${encodeURIComponent(payload.title)}`}
                              size={88}
                            />
                          </div>
                          <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 font-mono mt-2 break-all">{secretaryVpa}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">Scan Dynamic UPI QR • Auto-fills ₹{payload.amount.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold">UPI Virtual Payment Address (VPA)</label>
                        <Input
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@okaxis"
                          className="h-10 rounded-xl bg-white/60 dark:bg-slate-800/60 border-white/40 dark:border-white/15 backdrop-blur-md text-xs font-mono"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "Card" && (
                    <motion.div
                      key="tab-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="space-y-4"
                    >
                      {/* Interactive 3D Glass Card Preview */}
                      <motion.div
                        whileHover={{ rotateX: 2, rotateY: -3, scale: 1.01 }}
                        className="relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-600 border border-white/30 shadow-xl"
                      >
                        <motion.div
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                          className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
                        />
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 to-yellow-400/90 border border-white/40 shadow-sm" />
                          <span className="text-xs font-black tracking-widest uppercase opacity-90">VISA PLATINUM</span>
                        </div>
                        <p className="mt-6 text-lg sm:text-xl font-mono tracking-[0.2em] font-semibold">
                          {cardNumber || "4532 8910 2234 8890"}
                        </p>
                        <div className="mt-5 flex justify-between items-end text-[11px]">
                          <div>
                            <p className="text-[9px] uppercase opacity-70">Card Holder</p>
                            <p className="font-bold tracking-wide">{cardHolder || "RESIDENT MEMBER"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] uppercase opacity-70">Valid Thru</p>
                            <p className="font-mono font-bold">{cardExpiry || "08/29"}</p>
                          </div>
                        </div>
                      </motion.div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-semibold">Card Number</label>
                          <Input
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                            placeholder="4532 8910 2234 8890"
                            className="h-10 rounded-xl bg-white/60 dark:bg-slate-800/60 font-mono text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-semibold">Name on Card</label>
                          <Input
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                            placeholder="RESIDENT NAME"
                            className="h-10 rounded-xl bg-white/60 dark:bg-slate-800/60 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold">Expiry (MM/YY)</label>
                          <Input
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                            placeholder="08/29"
                            className="h-10 rounded-xl bg-white/60 dark:bg-slate-800/60 font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold">CVV</label>
                          <Input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="•••"
                            className="h-10 rounded-xl bg-white/60 dark:bg-slate-800/60 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "Net Banking" && (
                    <motion.div
                      key="tab-netbanking"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
                    >
                      {NET_BANKS.map((bank) => {
                        const selected = selectedBank === bank.id;
                        return (
                          <motion.button
                            key={bank.id}
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-3.5 rounded-2xl border text-left transition-all backdrop-blur-md ${
                              selected
                                ? "bg-primary/15 border-primary ring-2 ring-primary/25 shadow-md"
                                : "bg-white/50 dark:bg-slate-800/50 border-white/30 dark:border-white/10 hover:bg-white/75 dark:hover:bg-slate-800/80"
                            }`}
                          >
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary mb-1.5">
                              {bank.code}
                            </span>
                            <p className="text-xs font-bold leading-snug">{bank.name}</p>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}

                  {activeTab === "Wallets" && (
                    <motion.div
                      key="tab-wallets"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="grid grid-cols-2 gap-3"
                    >
                      {WALLETS.map((w) => {
                        const selected = selectedWallet === w.id;
                        return (
                          <motion.button
                            key={w.id}
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedWallet(w.id)}
                            className={`p-4 rounded-2xl border text-left transition-all backdrop-blur-md ${
                              selected
                                ? "bg-primary/15 border-primary ring-2 ring-primary/25 shadow-md"
                                : "bg-white/50 dark:bg-slate-800/50 border-white/30 dark:border-white/10"
                            }`}
                          >
                            <p className="text-xs font-bold">{w.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{w.balance}</p>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-2 border-t border-border/40 space-y-3">
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}>
                    <Button
                      onClick={handleConfirmPay}
                      className="w-full h-12 rounded-2xl text-sm font-bold text-white border-0 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Authorize & Pay ₹{payload.amount.toLocaleString()} via {resolvedMethodLabel}
                    </Button>
                  </motion.div>
                  <p className="text-center text-[10px] text-muted-foreground">
                    Mock Gateway Simulation • Persists directly to HomeVerse Neon Ledger & updates Secretary Records
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ==================== PROCESSING PHASE ==================== */}
          {phase === "processing" && payload && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="max-w-lg mx-auto rounded-3xl border border-white/40 dark:border-white/15 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl p-10 text-center space-y-6"
            >
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-blue-600 border-r-emerald-500"
                />
                <motion.div
                  animate={{ scale: [0.92, 1.05, 0.92] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg"
                >
                  <Lock className="w-7 h-7" />
                </motion.div>
              </div>

              <div>
                <h2 className="text-xl font-extrabold font-[family-name:var(--font-heading)]">
                  Processing ₹{payload.amount.toLocaleString()}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Please do not close or refresh while authorizing via {resolvedMethodLabel}
                </p>
              </div>

              <div className="space-y-2.5 text-left">
                {PROCESSING_STEPS.map((label, idx) => {
                  const done = processStep > idx;
                  const active = processStep === idx;
                  return (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0.4, x: -8 }}
                      animate={{ opacity: done || active ? 1 : 0.45, x: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                        done
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                          : active
                          ? "bg-blue-500/10 border-blue-500/30 text-foreground font-semibold"
                          : "bg-white/30 dark:bg-white/5 border-transparent text-muted-foreground"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : active ? (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-muted-foreground/40 shrink-0" />
                      )}
                      <span>{label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ==================== SUCCESS PHASE ==================== */}
          {phase === "success" && payload && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative max-w-lg mx-auto rounded-3xl border border-emerald-400/40 bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl shadow-2xl shadow-emerald-500/15 p-8 text-center space-y-6 overflow-hidden"
            >
              {/* Animated Celebration Particles */}
              <div className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2">
                {CONFETTI_PARTICLES.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                    animate={{
                      opacity: [1, 1, 0],
                      x: p.x,
                      y: p.y,
                      rotate: p.rotate,
                      scale: [0, 1.2, 0.7]
                    }}
                    transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }}
                    className={`absolute w-2.5 h-2.5 rounded-full ${p.color}`}
                  />
                ))}
              </div>

              <motion.div
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-11 h-11" />
              </motion.div>

              <div>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] uppercase tracking-wider mb-2">
                  Payment Verified & Synced
                </Badge>
                <h2 className="text-2xl font-extrabold font-[family-name:var(--font-heading)]">
                  ₹{payload.amount.toLocaleString()} Paid Successfully!
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {payload.kind === "event-registration"
                    ? `Your event registration & digital pass for "${payload.title}" are confirmed.`
                    : `Your payment for "${payload.title}" has been recorded in Secretary & Resident ledgers.`}
                </p>
              </div>

              <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 p-4 space-y-2.5 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono font-bold text-foreground">{completedTxnId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Item</span>
                  <span className="font-semibold text-right max-w-[60%] truncate">{payload.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-semibold">{completedMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Timestamp</span>
                  <span className="font-medium">{completedAt}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Button
                  variant="outline"
                  onClick={handlePrintReceipt}
                  className="flex-1 h-11 rounded-xl text-xs font-semibold bg-white/50 dark:bg-white/5"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Download Receipt
                </Button>
                <Button
                  onClick={() => router.push(returnHref)}
                  className="flex-1 h-11 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-500/25"
                >
                  Return to {returnLabel}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ==================== ERROR PHASE ==================== */}
          {phase === "error" && payload && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto rounded-3xl border border-red-400/40 bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl shadow-2xl p-8 text-center space-y-5"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/15 flex items-center justify-center text-red-500">
                <XCircle className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Authorization Failed</h2>
                <p className="text-xs text-muted-foreground mt-1">{errorMessage}</p>
              </div>
              <div className="flex gap-2.5">
                <Button variant="outline" onClick={() => router.push(returnHref)} className="flex-1 rounded-xl text-xs">
                  Back to {returnLabel}
                </Button>
                <Button onClick={() => setPhase("checkout")} className="flex-1 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white border-0 font-semibold shadow-md">
                  <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

