export type GatewayPaymentKind = "resident-payment" | "maintenance-bill" | "event-registration";

export interface GatewayCheckoutPayload {
  kind: GatewayPaymentKind;
  targetId: string;
  title: string;
  subtitle?: string;
  category?: string;
  amount: number;
  unit?: string;
  building?: string;
  residentName?: string;
  dueDate?: string;
  returnUrl: string;
  returnLabel?: string;
  // Optional metadata depending on kind
  referenceId?: string;
  month?: string;
  eventPayload?: {
    eventId: string;
    userId: string;
    userName: string;
    flatNumber?: string;
    contactNumber?: string;
    guestCount: number;
    guestNames?: string;
    rsvpStatus: string;
    entryFee: number;
    passCount: number;
    eventDate?: string;
    eventLocation?: string;
  };
}

const STORAGE_KEY = "homeverse_pending_gateway_tx";

export function savePendingGatewayCheckout(payload: GatewayCheckoutPayload): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("Failed to store pending gateway checkout:", e);
  }
}

export function loadPendingGatewayCheckout(): GatewayCheckoutPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GatewayCheckoutPayload;
  } catch (e) {
    return null;
  }
}

export function clearPendingGatewayCheckout(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

