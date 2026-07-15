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

export interface Claim {
  id: string;
  itemId: string;
  residentId: string;
  residentName: string;
  claimReason: string;
  itemDetails?: string;
  proofImage?: string;
  contactNumber?: string;
  status: "Claim Pending Verification" | "Ready for Pickup" | "Returned" | "Rejected";
  approvalDate?: string;
  collectionDate?: string;
  collectionTime?: string;
  collectedBy?: string;
  verifiedBySecurity?: string;
  createdAt: string;
}

export interface FoundItem {
  id: string;
  reporterId: string;
  reporterName: string;
  communityCode: string;
  category: string;
  brand?: string;
  colour?: string;
  description: string;
  images: string[];
  foundLocation: string;
  dateFound: string;
  timeFound: string;
  additionalNotes?: string;
  status: "Pending Verification" | "Available" | "Suggested To Resident" | "Claim Requested" | "Claim Confirmed" | "Returned" | "Rejected" | "Available for Claim" | "Claim Pending Verification" | "Ready for Pickup" | "Possible Match Found" | "Owner Identified";
  portal: PortalType;
  createdAt: string;
  claims?: Claim[];
  matches?: ItemMatch[];
}

export interface LostReport {
  id: string;
  residentId?: string;
  itemName: string;
  category: string;
  brand?: string;
  colour?: string;
  description: string;
  distinguishingFeatures?: string;
  dateLost: string;
  timeLost?: string;
  lastSeenLocation: string;
  status: "Searching" | "Belonging Suggested" | "Claim Requested" | "Claim Confirmed" | "Returned" | "Closed" | "Possible Match Found" | "Matched";
  images: string[];
  additionalNotes?: string;
  portal: PortalType;
  communityCode: string;
  createdAt: string;
  updatedAt?: string;
  matches?: ItemMatch[];
  residentName?: string;
  flatNumber?: string;
}

export interface ItemMatch {
  id: string;
  lostReportId: string;
  foundItemId: string;
  status: "Suggested" | "Confirmed" | "Rejected";
  verifiedBy?: string;
  verificationDate?: string;
  collectionDate?: string;
  collectionTime?: string;
  collectedBy?: string;
  securityNote?: string;
  additionalPhoto?: string;
  createdAt: string;
  updatedAt?: string;
  lostReport?: LostReport;
  foundItem?: FoundItem;
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
  lostFoundItems: FoundItem[];
  lostReports: LostReport[];
  itemMatches: ItemMatch[];
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
  flatAttendance: any[];
  payments: any[];
  collections: any[];

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
  checkInFlatHelper: (helperId: string, flatNumber: string, residentId: string, residentName: string, servicePerformed: string) => Promise<void>;
  checkOutFlatHelper: (flatAttendanceId: string) => Promise<void>;
  completeFlatWork: (helperId: string, flatNumber: string, residentId: string, residentName: string, servicePerformed: string, notes?: string, photoUrl?: string) => Promise<void>;

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
  reportLostFoundItem: (item: Omit<FoundItem, "id" | "status" | "createdAt">) => Promise<void>;
  claimLostFoundItem: (
    id: string,
    residentId: string,
    residentName: string,
    claimReason: string,
    itemDetails?: string,
    proofImage?: string,
    contactNumber?: string
  ) => Promise<void>;
  resolveLostFoundItem: (id: string) => Promise<void>;
  verifyFoundItem: (id: string) => Promise<void>;
  rejectFoundItem: (id: string) => Promise<void>;
  approveClaim: (claimId: string) => Promise<void>;
  rejectClaim: (claimId: string) => Promise<void>;
  pickupItem: (claimId: string, collectedBy: string, verifiedBySecurity: string) => Promise<void>;
  reportLostItem: (report: Omit<LostReport, "id" | "status" | "createdAt">) => Promise<void>;
  confirmMatch: (matchId: string, verifiedBy: string) => Promise<void>;
  rejectMatch: (matchId: string) => Promise<void>;
  handoverMatchedItem: (matchId: string, collectedBy: string, verifiedBySecurity: string) => Promise<void>;
  suggestBelonging: (lostReportId: string, foundItemId: string, securityNote?: string, additionalPhoto?: string) => Promise<void>;
  claimSuggestedMatch: (matchId: string) => Promise<void>;
  rejectSuggestedMatch: (matchId: string) => Promise<void>;
  fetchLostReports: () => Promise<void>;
  fetchMatches: () => Promise<void>;

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
  generateBulkMaintenanceBills: (billDetails: {
    month: string;
    amount: number;
    dueDate?: string;
    lateFee?: number;
    description?: string;
    applicableTo?: string;
    selectedBuilding?: string;
    breakdown?: { label: string; amount: number }[];
  }) => Promise<void>;
  deleteMarketplaceItem: (itemId: string) => Promise<void>;
  updateWorkerServices: (workerId: string, details: {
    specializations: string[];
    experience: string;
    workingShift: string;
    phone: string;
    availability: string;
  }) => Promise<void>;

  // Society Collections & Payments actions
  createCollection: (details: any) => Promise<void>;
  editCollection: (id: string, details: any) => Promise<void>;
  cancelCollection: (id: string) => Promise<void>;
  payPayment: (id: string, paymentMethod: string) => Promise<void>;
  sendPaymentReminder: (id: string) => Promise<void>;
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
  lostReports: [],
  itemMatches: [],
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
  flatAttendance: [],
  payments: [],
  collections: [],

  initializeDb: () => {
    if (typeof window === "undefined") return;

    // 1. Initial REST state fetch
    const fetchInitialState = async () => {
      try {
        const endpoints = [
          { key: "complaints", path: "/api/complaints" },
          { key: "visitors", path: "/api/visitors" },
          { key: "helpers", path: "/api/visitors/helpers" },
          { key: "attendance", path: "/api/visitors/attendance" },
          { key: "flatAttendance", path: "/api/visitors/helpers/flat-attendance" },
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
          { key: "lostReports", path: "/api/lostfound/lost" },
          { key: "itemMatches", path: "/api/lostfound/matches" },
          { key: "flats", path: "/api/flats" },
          { key: "expenses", path: "/api/expenses" },
          { key: "users", path: "/api/users" },
          { key: "payments", path: "/api/payments" },
          { key: "collections", path: "/api/payments/collections" }
        ];

        const promises = endpoints.map(async ({ key, path }) => {
          try {
            const res = await fetch(path);
            if (res.ok) {
              let data = await res.json();
              if (key === "attendance" && Array.isArray(data)) {
                data = data.map((att: any) => ({
                  ...att,
                  workerId: att.helperId || att.workerId,
                  workerName: att.helperName || att.workerName,
                  workerCategory: att.category || att.workerCategory
                }));
              }
              set({ [key]: data } as any);
            }
          } catch (e) {}
        });

        await Promise.all(promises);
      } catch (err) {}
    };

    fetchInitialState();

    // 2. Establish Real-Time WebSocket Connection (Only once)
    if ((globalThis as any).__homeverse_listeners_active) return;
    (globalThis as any).__homeverse_listeners_active = true;

    const pollInterval = setInterval(async () => {
      const criticalEndpoints = [
        { key: "helpers", path: "/api/visitors/helpers" },
        { key: "attendance", path: "/api/visitors/attendance" },
        { key: "flatAttendance", path: "/api/visitors/helpers/flat-attendance" },
        { key: "payments", path: "/api/payments" },
        { key: "collections", path: "/api/payments/collections" }
      ];
      criticalEndpoints.forEach(async ({ key, path }) => {
        try {
          const res = await fetch(path);
          if (res.ok) {
            let data = await res.json();
            if (key === "attendance" && Array.isArray(data)) {
              data = data.map((att: any) => ({
                ...att,
                workerId: att.helperId || att.workerId,
                workerName: att.helperName || att.workerName,
                workerCategory: att.category || att.workerCategory
              }));
            }
            const currentStr = JSON.stringify((get() as any)[key]);
            const nextStr = JSON.stringify(data);
            if (currentStr !== nextStr) {
              set({ [key]: data } as any);
            }
          }
        } catch (e) {}
      });
    }, 3000);

    (globalThis as any).__homeverse_poll_interval = pollInterval;
    const socket = io("http://localhost:5000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true
    });

    (globalThis as any).__homeverse_socket = socket;

    socket.on("connect", () => {
      console.log("⚡ Connected to HomeVerse Socket.IO Server!");
    });

    socket.on("payment:update", (updated: any) => {
      const current = get().payments || [];
      const index = current.findIndex(p => p.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ payments: next });
      } else {
        set({ payments: [updated, ...current] });
      }
    });

    socket.on("collection:update", (updated: any) => {
      const current = get().collections || [];
      const index = current.findIndex(c => c.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ collections: next });
      } else {
        set({ collections: [updated, ...current] });
      }
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
      const normalized = {
        ...updated,
        workerId: updated.helperId || updated.workerId,
        workerName: updated.helperName || updated.workerName,
        workerCategory: updated.category || updated.workerCategory
      };
      const current = get().attendance || [];
      const index = current.findIndex(a => a.id === normalized.id);
      if (index > -1) {
        const next = [...current];
        next[index] = normalized;
        set({ attendance: next });
      } else {
        set({ attendance: [normalized, ...current] });
      }
    });

    socket.on("flat-attendance:update", (updated: any) => {
      const current = get().flatAttendance || [];
      const index = current.findIndex(a => a.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ flatAttendance: next });
      } else {
        set({ flatAttendance: [updated, ...current] });
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

    socket.on("lostreport:update", (updated: any) => {
      const current = get().lostReports || [];
      const index = current.findIndex(l => l.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ lostReports: next });
      } else {
        set({ lostReports: [updated, ...current] });
      }
    });

    socket.on("itemmatch:update", (updated: any) => {
      const current = get().itemMatches || [];
      const index = current.findIndex(m => m.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ itemMatches: next });
      } else {
        set({ itemMatches: [updated, ...current] });
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
    const res = await fetch("/api/visitors/helpers/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helperId, helperName, category, gate, assignedFlats })
    });
    if (res.ok) {
      const raw = await res.json();
      const data = {
        ...raw,
        workerId: raw.helperId || raw.workerId,
        workerName: raw.helperName || raw.workerName,
        workerCategory: raw.category || raw.workerCategory
      };
      set(state => {
        const filtered = state.attendance.filter(a => a.id !== data.id);
        return { attendance: [...filtered, data] };
      });
    }
  },

  checkOutHelper: async (attendanceId, gate) => {
    const res = await fetch("/api/visitors/helpers/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceId, gate })
    });
    if (res.ok) {
      const raw = await res.json();
      const data = {
        ...raw,
        workerId: raw.helperId || raw.workerId,
        workerName: raw.helperName || raw.workerName,
        workerCategory: raw.category || raw.workerCategory
      };
      set(state => {
        const filtered = state.attendance.filter(a => a.id !== data.id);
        return { attendance: [...filtered, data] };
      });
    }
  },

  checkInFlatHelper: async (helperId, flatNumber, residentId, residentName, servicePerformed) => {
    const res = await fetch("/api/visitors/helpers/flat-checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helperId, flatNumber, residentId, residentName, servicePerformed })
    });
    if (res.ok) {
      const data = await res.json();
      set(state => {
        const filtered = state.flatAttendance.filter(fa => fa.id !== data.id);
        return { flatAttendance: [...filtered, data] };
      });
    }
  },

  checkOutFlatHelper: async (flatAttendanceId) => {
    const res = await fetch("/api/visitors/helpers/flat-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flatAttendanceId })
    });
    if (res.ok) {
      const data = await res.json();
      set(state => {
        const filtered = state.flatAttendance.filter(fa => fa.id !== data.id);
        return { flatAttendance: [...filtered, data] };
      });
    }
  },

  completeFlatWork: async (helperId, flatNumber, residentId, residentName, servicePerformed, notes, photoUrl) => {
    const res = await fetch("/api/visitors/helpers/flat-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helperId, flatNumber, residentId, residentName, servicePerformed, notes, photoUrl })
    });
    if (res.ok) {
      const data = await res.json();
      set(state => {
        const filtered = state.flatAttendance.filter(fa => fa.id !== data.id);
        return { flatAttendance: [...filtered, data] };
      });
    }
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

  claimLostFoundItem: async (id, residentId, residentName, claimReason, itemDetails, proofImage, contactNumber) => {
    await fetch(`/api/lostfound/${id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ residentId, residentName, claimReason, itemDetails, proofImage, contactNumber })
    });
  },

  resolveLostFoundItem: async (id) => {
    await fetch(`/api/lostfound/${id}/verify`, {
      method: "PUT"
    });
  },

  verifyFoundItem: async (id) => {
    await fetch(`/api/lostfound/${id}/verify`, {
      method: "PUT"
    });
  },

  rejectFoundItem: async (id) => {
    await fetch(`/api/lostfound/${id}/reject`, {
      method: "PUT"
    });
  },

  approveClaim: async (claimId) => {
    await fetch(`/api/lostfound/claims/${claimId}/approve`, {
      method: "PUT"
    });
  },

  rejectClaim: async (claimId) => {
    await fetch(`/api/lostfound/claims/${claimId}/reject`, {
      method: "PUT"
    });
  },

  pickupItem: async (claimId, collectedBy, verifiedBySecurity) => {
    await fetch(`/api/lostfound/claims/${claimId}/pickup`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectedBy, verifiedBySecurity })
    });
  },

  reportLostItem: async (report) => {
    await fetch("/api/lostfound/lost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report)
    });
  },

  suggestBelonging: async (lostReportId, foundItemId, securityNote, additionalPhoto) => {
    await fetch("/api/lostfound/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lostReportId, foundItemId, securityNote, additionalPhoto })
    });
  },

  claimSuggestedMatch: async (matchId) => {
    await fetch(`/api/lostfound/matches/${matchId}/claim`, {
      method: "POST"
    });
  },

  rejectSuggestedMatch: async (matchId) => {
    await fetch(`/api/lostfound/matches/${matchId}/reject-match`, {
      method: "POST"
    });
  },

  confirmMatch: async (matchId, verifiedBy) => {
    await fetch(`/api/lostfound/matches/${matchId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verifiedBy })
    });
  },

  rejectMatch: async (matchId) => {
    await fetch(`/api/lostfound/matches/${matchId}/reject`, {
      method: "POST"
    });
  },

  handoverMatchedItem: async (matchId, collectedBy, verifiedBySecurity) => {
    await fetch(`/api/lostfound/matches/${matchId}/handover`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectedBy, verifiedBySecurity })
    });
  },

  fetchLostReports: async () => {
    try {
      const res = await fetch("/api/lostfound/lost");
      if (res.ok) {
        const data = await res.json();
        set({ lostReports: data });
      }
    } catch (e) {
      console.error(e);
    }
  },

  fetchMatches: async () => {
    try {
      const res = await fetch("/api/lostfound/matches");
      if (res.ok) {
        const data = await res.json();
        set({ itemMatches: data });
      }
    } catch (e) {
      console.error(e);
    }
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
  },

  createCollection: async (details) => {
    await fetch("/api/payments/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details)
    });
  },

  editCollection: async (id, details) => {
    await fetch(`/api/payments/collections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details)
    });
  },

  cancelCollection: async (id) => {
    await fetch(`/api/payments/collections/${id}`, {
      method: "DELETE"
    });
  },

  payPayment: async (id, paymentMethod) => {
    await fetch(`/api/payments/${id}/pay`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethod })
    });
  },

  sendPaymentReminder: async (id) => {
    await fetch(`/api/payments/${id}/remind`, {
      method: "POST"
    });
  }
}));
