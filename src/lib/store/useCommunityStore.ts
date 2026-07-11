import { create } from "zustand";
import { io } from "socket.io-client";
import {
  Complaint, Visitor, VisitorStatus, UserRole, PortalType, User, Announcement, EmergencyAlert,
  GatePass, VehicleLog, IncidentReport, SocietyExpense, FlatInfo, RentRecord,
  ComplaintPriority, AiAnalysis, ComplaintChatMessage, Helper, HelperAttendance
} from "@/types";

// ==========================================
// Centralized Database Interfaces
// ==========================================
export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  parentContact: string;
  reason: string;
  fromDate: string;
  toDate: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface LaundrySlot {
  id: string;
  machineId: string;
  machineName: string;
  slot: string;
  date: string;
  bookedBy?: string;
  bookedByName?: string;
  status: "available" | "booked";
}

export interface Parcel {
  id: string;
  recipientId: string;
  recipientName: string;
  unit: string;
  courier: string;
  description: string;
  image?: string;
  otp: string;
  location: string;
  status: "received" | "picked-up";
  portal: PortalType;
  receivedAt: string;
  pickedUpAt?: string;
}

export interface FacilityBooking {
  id: string;
  facility: string;
  userId: string;
  userName: string;
  unit: string;
  date: string;
  slot: string;
  status: "booked" | "cancelled";
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: string;
  sellerId: string;
  sellerName: string;
  image?: string;
  category: string;
  status: "available" | "sold";
  portal: PortalType;
  createdAt: string;
}

export interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  status: "reported" | "claimed";
  reporterId: string;
  reporterName: string;
  claimantId?: string;
  claimantName?: string;
  portal: PortalType;
  createdAt: string;
}

export interface RoomChangeRequest {
  id: string;
  studentId: string;
  studentName: string;
  currentRoom: string;
  currentBlock: string;
  requestedRoom: string;
  requestedBlock: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface MaintenanceBill {
  id: string;
  residentId: string;
  residentName: string;
  unit: string;
  month: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  paidOn?: string;
  breakdown?: { label: string; amount: number }[];
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  priority: "normal" | "important" | "urgent";
  rsvps: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error" | "alert";
  read: boolean;
  createdAt: string;
}

export interface RoommatePreference {
  userId: string;
  userName: string;
  lifestyle: string;
  food: string;
  cleanliness: string;
  budget: string;
  sleeping: string;
}

interface CommunityState {
  complaints: Complaint[];
  leaveRequests: LeaveRequest[];
  visitors: Visitor[];
  laundrySlots: LaundrySlot[];
  parcels: Parcel[];
  facilityBookings: FacilityBooking[];
  marketplaceItems: MarketplaceItem[];
  lostFoundItems: LostFoundItem[];
  roomChangeRequests: RoomChangeRequest[];
  maintenanceBills: MaintenanceBill[];
  communityEvents: CommunityEvent[];
  notifications: Notification[];
  roommatePreferences: RoommatePreference[];
  users: (User & Record<string, any>)[];
  emergencies: EmergencyAlert[];
  gatePasses: GatePass[];
  vehicleLogs: VehicleLog[];
  incidents: IncidentReport[];
  announcements: Announcement[];
  expenses: SocietyExpense[];
  flats: FlatInfo[];
  rentRecords: RentRecord[];
  favorites: Visitor[];
  helpers: Helper[];
  attendance: HelperAttendance[];

  initializeDb: () => void;
  saveDb: () => void;
  addRegisteredUser: (u: User & Record<string, any>) => Promise<void>;
  
  // Complaint Transactions
  addComplaint: (c: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "timeline">) => Promise<void>;
  updateComplaintStatus: (id: string, status: Complaint["status"], details?: { by?: string; note?: string; afterPhoto?: string }) => Promise<void>;
  assignComplaintWorker: (id: string, workerName: string, workerId: string, eta: string) => Promise<void>;
  rateComplaint: (id: string, rating: number, review?: string) => Promise<void>;
  addComplaintChatMessage: (id: string, message: Omit<ComplaintChatMessage, "id" | "timestamp">) => Promise<void>;
  mergeComplaints: (parentTicketId: string, duplicateTicketIds: string[]) => Promise<void>;
  subscribeToComplaint: (id: string, userId: string, userName: string, unit: string) => Promise<void>;
  updateComplaintEta: (id: string, eta: string) => Promise<void>;

  // Leaves Transactions
  submitLeaveRequest: (req: Omit<LeaveRequest, "id" | "status" | "createdAt">) => Promise<void>;
  approveRejectLeave: (id: string, status: "approved" | "rejected") => Promise<void>;

  // Visitors Transactions
  submitVisitorRequest: (v: Omit<Visitor, "id" | "qrCode" | "otp" | "timeline" | "status"> & Partial<Pick<Visitor, "status" | "visitorType" | "visitType">>) => Promise<void>;
  checkInVisitor: (id: string, remarks?: string) => Promise<void>;
  checkOutVisitor: (id: string) => Promise<void>;
  denyVisitorEntry: (id: string, reason: string, remarks?: string) => Promise<void>;
  cancelVisitorRequest: (id: string) => Promise<void>;
  approveVisitorRequest: (id: string) => Promise<void>;
  addFavoriteVisitor: (visitor: Omit<Visitor, "id" | "status" | "timeline" | "qrCode" | "otp" | "date">) => Promise<void>;
  removeFavoriteVisitor: (id: string) => Promise<void>;
  logEmergencyVisitor: (agency: string, reason: string, vehicleNumber?: string) => Promise<void>;

  // Daily Helpers & Attendance Transactions
  registerHelper: (h: Omit<Helper, "id" | "joinedAt">) => Promise<void>;
  deleteHelper: (id: string) => Promise<void>;
  checkInHelper: (workerId: string, workerName: string, category: string, gate: string, assignedFlats: string[]) => Promise<void>;
  checkOutHelper: (attendanceId: string, gate: string) => Promise<void>;

  // Laundry Transactions
  bookLaundrySlot: (machineId: string, slot: string, date: string, studentId: string, studentName: string) => Promise<boolean>;
  cancelLaundrySlot: (machineId: string, slot: string, date: string) => Promise<void>;

  // Parcels Transactions
  addParcel: (p: Omit<Parcel, "id" | "status" | "receivedAt">) => Promise<void>;
  pickupParcelWithOTP: (id: string, otp: string) => Promise<boolean>;

  // Room Allocation Transactions
  reallocateRoom: (studentId: string, newRoom: string, newBlock: string, newFloor: string) => Promise<void>;
  vacateRoom: (studentId: string) => Promise<void>;
  requestRoomChange: (req: Omit<RoomChangeRequest, "id" | "status" | "createdAt">) => Promise<void>;
  approveRoomChange: (id: string) => Promise<void>;

  // Roommate Matching Transactions
  submitRoommatePreference: (pref: RoommatePreference) => Promise<void>;

  // Facility Bookings
  bookFacility: (booking: Omit<FacilityBooking, "id" | "status">) => Promise<boolean>;
  cancelFacilityBooking: (id: string) => Promise<void>;

  // Marketplace Transactions
  listMarketplaceItem: (item: Omit<MarketplaceItem, "id" | "status" | "createdAt">) => Promise<void>;
  sellMarketplaceItem: (id: string) => Promise<void>;

  // Lost & Found Transactions
  reportLostFoundItem: (item: Omit<LostFoundItem, "id" | "status" | "createdAt">) => Promise<void>;
  claimLostFoundItem: (id: string, claimantId: string, claimantName: string) => Promise<void>;
  resolveLostFoundItem: (id: string) => Promise<void>;

  // Society Finance & Billing Transactions
  payMaintenanceBill: (id: string) => Promise<void>;

  // Community Events
  createEvent: (ev: Omit<CommunityEvent, "id" | "rsvps">) => Promise<void>;
  rsvpEvent: (id: string, userId: string) => Promise<void>;

  // Notifications
  sendNotification: (userId: string, title: string, message: string, type: Notification["type"]) => Promise<void>;
  markNotificationsRead: (userId: string) => Promise<void>;

  // Security Operations
  raiseEmergencyAlert: (alert: Omit<EmergencyAlert, "id" | "status" | "createdAt">) => Promise<void>;
  updateEmergencyStatus: (id: string, status: EmergencyAlert["status"], notes?: string) => Promise<void>;
  issueGatePass: (pass: Omit<GatePass, "id" | "status" | "createdAt">) => Promise<void>;
  logVehicleEntry: (vehicle: Omit<VehicleLog, "id" | "entryTime" | "status">) => Promise<void>;
  logVehicleExit: (id: string) => Promise<void>;
  addAnnouncement: (ann: Omit<Announcement, "id" | "createdAt">) => Promise<void>;
  addIncidentReport: (incident: Omit<IncidentReport, "id" | "createdAt">) => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  activateDeactivateUser: (userId: string, status: 'approved' | 'deactivated') => Promise<void>;
  addFlat: (flat: Omit<FlatInfo, 'id'>) => Promise<void>;
  addExpense: (expense: Omit<SocietyExpense, 'id'>) => Promise<void>;
  addRentRecord: (rent: Omit<RentRecord, 'id'>) => Promise<void>;
  payRentRecord: (id: string) => Promise<void>;
  generateBulkMaintenanceBills: (billDetails: { month: string; amount: number; breakdown: { label: string; amount: number }[] }) => Promise<void>;
  deleteMarketplaceItem: (itemId: string) => Promise<void>;
  updateWorkerServices: (workerId: string, details: {
    specializations: string[];
    experience: string;
    workingShift: string;
    phone: string;
    availability: string;
  }) => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  complaints: [],
  leaveRequests: [],
  visitors: [],
  laundrySlots: [],
  parcels: [],
  facilityBookings: [],
  marketplaceItems: [],
  lostFoundItems: [],
  roomChangeRequests: [],
  maintenanceBills: [],
  communityEvents: [],
  notifications: [],
  roommatePreferences: [],
  users: [],
  emergencies: [],
  gatePasses: [],
  vehicleLogs: [],
  incidents: [],
  announcements: [],
  expenses: [],
  flats: [],
  rentRecords: [],
  favorites: [],
  helpers: [],
  attendance: [],

  initializeDb: () => {
    if (typeof window === "undefined") return;
    if ((globalThis as any).__homeverse_listeners_active) return;
    (globalThis as any).__homeverse_listeners_active = true;

    // 1. Initial REST state fetch
    const fetchInitialState = async () => {
      try {
        const endpoints = [
          { key: "complaints", path: "/api/complaints" },
          { key: "visitors", path: "/api/visitors" },
          { key: "helpers", path: "/api/visitors/helpers" },
          { key: "attendance", path: "/api/visitors/attendance" },
          { key: "favorites", path: "/api/visitors/favorites" },
          { key: "announcements", path: "/api/announcements" },
          { key: "leaveRequests", path: "/api/leaveRequests" },
          { key: "laundrySlots", path: "/api/laundry" },
          { key: "parcels", path: "/api/parcels" },
          { key: "roomChangeRequests", path: "/api/roomchange" },
          { key: "maintenanceBills", path: "/api/maintenance" },
          { key: "rentRecords", path: "/api/rent" },
          { key: "communityEvents", path: "/api/events" },
          { key: "notifications", path: "/api/notifications" },
          { key: "roommatePreferences", path: "/api/roommates" },
          { key: "emergencies", path: "/api/emergencies" },
          { key: "gatePasses", path: "/api/gatepasses" },
          { key: "vehicleLogs", path: "/api/vehiclelogs" },
          { key: "incidents", path: "/api/incidents" },
          { key: "marketplaceItems", path: "/api/marketplace" },
          { key: "lostFoundItems", path: "/api/lostfound" },
          { key: "flats", path: "/api/flats" },
          { key: "expenses", path: "/api/expenses" },
          { key: "users", path: "/api/users" }
        ];

        const promises = endpoints.map(async ({ key, path }) => {
          try {
            const res = await fetch(path);
            if (res.ok) {
              const data = await res.json();
              set({ [key]: data } as any);
            }
          } catch (e) {}
        });

        await Promise.all(promises);
      } catch (err) {}
    };

    fetchInitialState();

    // 2. Establish Real-Time WebSocket Connection
    const socket = io("http://localhost:5000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true
    });

    (globalThis as any).__homeverse_socket = socket;

    socket.on("connect", () => {
      console.log("⚡ Connected to HomeVerse Socket.IO Server!");
    });

    socket.on("complaint:update", (updated: any) => {
      const current = get().complaints || [];
      const index = current.findIndex(c => c.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ complaints: next });
      } else {
        set({ complaints: [updated, ...current] });
      }
    });

    socket.on("visitor:update", (updated: any) => {
      const current = get().visitors || [];
      const index = current.findIndex(v => v.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ visitors: next });
      } else {
        set({ visitors: [updated, ...current] });
      }
    });

    socket.on("helper:update", (updated: any) => {
      const current = get().helpers || [];
      const index = current.findIndex(h => h.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ helpers: next });
      } else {
        set({ helpers: [updated, ...current] });
      }
    });

    socket.on("helper:delete", ({ id }: any) => {
      const current = get().helpers || [];
      set({ helpers: current.filter(h => h.id !== id) });
    });

    socket.on("attendance:update", (updated: any) => {
      const current = get().attendance || [];
      const index = current.findIndex(a => a.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ attendance: next });
      } else {
        set({ attendance: [updated, ...current] });
      }
    });

    socket.on("favorite:update", (updated: any) => {
      const current = get().favorites || [];
      const index = current.findIndex(f => f.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ favorites: next });
      } else {
        set({ favorites: [updated, ...current] });
      }
    });

    socket.on("favorite:delete", ({ id }: any) => {
      const current = get().favorites || [];
      set({ favorites: current.filter(f => f.id !== id) });
    });

    socket.on("announcement:update", (updated: any) => {
      const current = get().announcements || [];
      const index = current.findIndex(a => a.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ announcements: next });
      } else {
        set({ announcements: [updated, ...current] });
      }
    });

    socket.on("leave:update", (updated: any) => {
      const current = get().leaveRequests || [];
      const index = current.findIndex(l => l.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ leaveRequests: next });
      } else {
        set({ leaveRequests: [updated, ...current] });
      }
    });

    socket.on("laundry:update", (updated: any) => {
      const current = get().laundrySlots || [];
      const index = current.findIndex(l => l.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ laundrySlots: next });
      } else {
        set({ laundrySlots: [updated, ...current] });
      }
    });

    socket.on("laundry:delete", ({ id }: any) => {
      const current = get().laundrySlots || [];
      set({ laundrySlots: current.filter(l => l.id !== id) });
    });

    socket.on("parcel:update", (updated: any) => {
      const current = get().parcels || [];
      const index = current.findIndex(p => p.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ parcels: next });
      } else {
        set({ parcels: [updated, ...current] });
      }
    });

    socket.on("roomchange:update", (updated: any) => {
      const current = get().roomChangeRequests || [];
      const index = current.findIndex(r => r.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ roomChangeRequests: next });
      } else {
        set({ roomChangeRequests: [updated, ...current] });
      }
    });

    socket.on("maintenance:update", (updated: any) => {
      const current = get().maintenanceBills || [];
      const index = current.findIndex(m => m.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ maintenanceBills: next });
      } else {
        set({ maintenanceBills: [updated, ...current] });
      }
    });

    socket.on("rent:update", (updated: any) => {
      const current = get().rentRecords || [];
      const index = current.findIndex(r => r.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ rentRecords: next });
      } else {
        set({ rentRecords: [updated, ...current] });
      }
    });

    socket.on("event:update", (updated: any) => {
      const current = get().communityEvents || [];
      const index = current.findIndex(e => e.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ communityEvents: next });
      } else {
        set({ communityEvents: [updated, ...current] });
      }
    });

    socket.on("notification:update", (updated: any) => {
      const current = get().notifications || [];
      const index = current.findIndex(n => n.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ notifications: next });
      } else {
        set({ notifications: [updated, ...current] });
      }
    });

    socket.on("emergency:update", (updated: any) => {
      const current = get().emergencies || [];
      const index = current.findIndex(e => e.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ emergencies: next });
      } else {
        set({ emergencies: [updated, ...current] });
      }
    });

    socket.on("gatepass:update", (updated: any) => {
      const current = get().gatePasses || [];
      const index = current.findIndex(g => g.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ gatePasses: next });
      } else {
        set({ gatePasses: [updated, ...current] });
      }
    });

    socket.on("vehiclelog:update", (updated: any) => {
      const current = get().vehicleLogs || [];
      const index = current.findIndex(v => v.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ vehicleLogs: next });
      } else {
        set({ vehicleLogs: [updated, ...current] });
      }
    });

    socket.on("incident:update", (updated: any) => {
      const current = get().incidents || [];
      const index = current.findIndex(i => i.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ incidents: next });
      } else {
        set({ incidents: [updated, ...current] });
      }
    });

    socket.on("marketplace:update", (updated: any) => {
      const current = get().marketplaceItems || [];
      const index = current.findIndex(m => m.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ marketplaceItems: next });
      } else {
        set({ marketplaceItems: [updated, ...current] });
      }
    });

    socket.on("lostfound:update", (updated: any) => {
      const current = get().lostFoundItems || [];
      const index = current.findIndex(l => l.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ lostFoundItems: next });
      } else {
        set({ lostFoundItems: [updated, ...current] });
      }
    });

    socket.on("flat:update", (updated: any) => {
      const current = get().flats || [];
      const index = current.findIndex(f => f.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ flats: next });
      } else {
        set({ flats: [updated, ...current] });
      }
    });

    socket.on("expense:update", (updated: any) => {
      const current = get().expenses || [];
      const index = current.findIndex(e => e.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ expenses: next });
      } else {
        set({ expenses: [updated, ...current] });
      }
    });

    socket.on("user:update", (updated: any) => {
      const current = get().users || [];
      const index = current.findIndex(u => u.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ users: next });
      } else {
        set({ users: [updated, ...current] });
      }
    });
  },

  saveDb: () => {},

  addRegisteredUser: async (u) => {
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(u)
    });
  },

  addComplaint: async (c) => {
    await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c)
    });
  },

  updateComplaintStatus: async (id, status, details) => {
    await fetch(`/api/complaints/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: details?.note, by: details?.by })
    });
  },

  assignComplaintWorker: async (id, workerName, workerId, eta) => {
    await fetch(`/api/complaints/${id}/assign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: workerName, assignedToId: workerId, note: `Assigned ETA: ${eta}` })
    });
  },

  rateComplaint: async (id, rating, review) => {
    await fetch(`/api/complaints/${id}/rate`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, review })
    });
  },

  addComplaintChatMessage: async (id, msg) => {
    await fetch(`/api/complaints/${id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg.message })
    });
  },

  mergeComplaints: async (parentTicketId, duplicateTicketIds) => {
    await fetch("/api/complaints/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentTicketId, duplicateTicketIds })
    });
  },

  subscribeToComplaint: async (id, userId, userName, unit) => {
    await fetch(`/api/complaints/${id}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userName, unit })
    });
  },

  updateComplaintEta: async (id, eta) => {
    await fetch(`/api/complaints/${id}/eta`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eta })
    });
  },

  submitLeaveRequest: async (req) => {
    await fetch("/api/leaveRequests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req)
    });
  },

  approveRejectLeave: async (id, status) => {
    await fetch(`/api/leaveRequests/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  },

  submitVisitorRequest: async (v) => {
    await fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v)
    });
  },

  checkInVisitor: async (id, remarks) => {
    await fetch(`/api/visitors/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "checked-in", checkInTime: new Date().toISOString(), approvedBy: remarks })
    });
  },

  checkOutVisitor: async (id) => {
    await fetch(`/api/visitors/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "checked-out", checkOutTime: new Date().toISOString() })
    });
  },

  denyVisitorEntry: async (id, reason, remarks) => {
    await fetch(`/api/visitors/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "denied", approvedBy: `${reason}: ${remarks}` })
    });
  },

  cancelVisitorRequest: async (id) => {
    await fetch(`/api/visitors/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" })
    });
  },

  approveVisitorRequest: async (id) => {
    await fetch(`/api/visitors/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" })
    });
  },

  addFavoriteVisitor: async (f) => {
    await fetch("/api/visitors/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f)
    });
  },

  removeFavoriteVisitor: async (id) => {
    await fetch(`/api/visitors/favorites/${id}`, {
      method: "DELETE"
    });
  },

  logEmergencyVisitor: async (agency, reason, vehicleNumber) => {
    await fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: agency, purpose: `EMERGENCY: ${reason}`, vehicleNumber, status: "checked-in" })
    });
  },

  registerHelper: async (h) => {
    await fetch("/api/visitors/helpers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(h)
    });
  },

  deleteHelper: async (id) => {
    await fetch(`/api/visitors/helpers/${id}`, {
      method: "DELETE"
    });
  },

  checkInHelper: async (helperId, helperName, category, gate, assignedFlats) => {
    await fetch("/api/visitors/helpers/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helperId, helperName, category, gate, assignedFlats })
    });
  },

  checkOutHelper: async (attendanceId, gate) => {
    await fetch("/api/visitors/helpers/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceId, gate })
    });
  },

  bookLaundrySlot: async (machineId, slot, date, studentId, studentName) => {
    const res = await fetch("/api/laundry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ machineId, machineName: slot, date, timeSlot: slot })
    });
    return res.ok;
  },

  cancelLaundrySlot: async (machineId, slot, date) => {
    const matched = get().laundrySlots.find(l => l.machineId === machineId && l.slot === slot && l.date === date);
    if (matched) {
      await fetch(`/api/laundry/${matched.id}`, {
        method: "DELETE"
      });
    }
  },

  addParcel: async (p) => {
    await fetch("/api/parcels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p)
    });
  },

  pickupParcelWithOTP: async (id, otp) => {
    const res = await fetch(`/api/parcels/${id}/release`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp })
    });
    return res.ok;
  },

  reallocateRoom: async (studentId, newRoom, newBlock, newFloor) => {
    await fetch(`/api/users/${studentId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unit: newRoom, building: newBlock })
    });
  },

  vacateRoom: async (studentId) => {
    await fetch(`/api/users/${studentId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unit: null, building: null })
    });
  },

  requestRoomChange: async (req) => {
    await fetch("/api/roomchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req)
    });
  },

  approveRoomChange: async (id) => {
    await fetch(`/api/roomchange/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" })
    });
  },

  submitRoommatePreference: async (pref) => {
    await fetch("/api/roommates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pref)
    });
  },

  bookFacility: async (booking) => {
    const res = await fetch("/api/facility-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking)
    });
    return res.ok;
  },

  cancelFacilityBooking: async (id) => {
    await fetch(`/api/facility-bookings/${id}`, {
      method: "DELETE"
    });
  },

  listMarketplaceItem: async (item) => {
    await fetch("/api/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
  },

  sellMarketplaceItem: async (id) => {
    await fetch(`/api/marketplace/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "sold" })
    });
  },

  deleteMarketplaceItem: async (itemId) => {
    await fetch(`/api/marketplace/${itemId}`, {
      method: "DELETE"
    });
  },

  reportLostFoundItem: async (item) => {
    await fetch("/api/lostfound", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
  },

  claimLostFoundItem: async (id, claimantId, claimantName) => {
    await fetch(`/api/lostfound/${id}/claim`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimantId, claimantName })
    });
  },

  resolveLostFoundItem: async (id) => {
    await fetch(`/api/lostfound/${id}/claim`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "claimed" })
    });
  },

  payMaintenanceBill: async (id) => {
    await fetch(`/api/maintenance/${id}/pay`, {
      method: "PUT"
    });
  },

  createEvent: async (ev) => {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ev)
    });
  },

  rsvpEvent: async (id, userId) => {
    await fetch(`/api/events/${id}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status: "Going" })
    });
  },

  sendNotification: async (userId, title, message, type) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title, message, type })
    });
  },

  markNotificationsRead: async (userId) => {
    await fetch("/api/notifications/read", {
      method: "PUT"
    });
  },

  raiseEmergencyAlert: async (alert) => {
    await fetch("/api/emergencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alert)
    });
  },

  updateEmergencyStatus: async (id, status, notes) => {
    await fetch(`/api/emergencies/${id}/resolve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes })
    });
  },

  issueGatePass: async (pass) => {
    await fetch("/api/gatepasses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pass)
    });
  },

  logVehicleEntry: async (vehicle) => {
    await fetch("/api/vehiclelogs/entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicle)
    });
  },

  logVehicleExit: async (id) => {
    await fetch(`/api/vehiclelogs/${id}/exit`, {
      method: "PUT"
    });
  },

  addAnnouncement: async (ann) => {
    await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ann)
    });
  },

  addIncidentReport: async (incident) => {
    await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incident)
    });
  },

  approveUser: async (userId) => {
    await fetch(`/api/users/${userId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" })
    });
  },

  rejectUser: async (userId) => {
    await fetch(`/api/users/${userId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" })
    });
  },

  activateDeactivateUser: async (userId, status) => {
    await fetch(`/api/users/${userId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  },

  addFlat: async (flat) => {
    await fetch("/api/flats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flat)
    });
  },

  addExpense: async (expense) => {
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense)
    });
  },

  addRentRecord: async (rent) => {
    await fetch("/api/rent/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rent)
    });
  },

  payRentRecord: async (id) => {
    await fetch(`/api/rent/${id}/pay`, {
      method: "PUT"
    });
  },

  generateBulkMaintenanceBills: async (billDetails) => {
    await fetch("/api/maintenance/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(billDetails)
    });
  },

  updateWorkerServices: async (workerId, details) => {
    await fetch("/api/users/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details)
    });
  }
}));
