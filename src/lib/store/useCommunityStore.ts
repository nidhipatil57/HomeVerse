"use client";

import { create } from "zustand";
import {
  Complaint, Visitor, UserRole, PortalType, User, Announcement, EmergencyAlert,
  GatePass, VehicleLog, IncidentReport, SocietyExpense, FlatInfo, RentRecord
} from "@/types";
import { db, auth } from "@/lib/firebase/config";
import {
  collection, doc, setDoc, updateDoc, deleteDoc, getDoc, onSnapshot
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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
  machineId: string; // e.g. "M1", "M2", "M3", "M4"
  machineName: string;
  slot: string; // e.g. "09:00 - 10:00 AM"
  date: string;
  bookedBy?: string; // Student ID
  bookedByName?: string; // Student Name
  status: "available" | "booked";
}

export interface Parcel {
  id: string;
  recipientId: string;
  recipientName: string;
  unit: string; // flat or room
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
  facility: string; // Gym, Badminton Court, Swimming Pool, Clubhouse, Party Hall
  userId: string;
  userName: string;
  unit: string;
  date: string;
  slot: string; // e.g. "10:00 AM - 11:00 AM"
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
  category: string; // Books, Cycles, Furniture, Electronics, Notes
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
  rsvps: string[]; // User IDs
}

export interface Notification {
  id: string;
  userId: string; // Target user or "all_residents" or "all_students"
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error" | "alert";
  read: boolean;
  createdAt: string;
}

export interface RoommatePreference {
  userId: string;
  userName: string;
  lifestyle: string; // "Early Bird" | "Night Owl"
  food: string; // "Veg" | "Non-Veg" | "No preference"
  cleanliness: string; // "Neat Freak" | "Moderate" | "Relaxed"
  budget: string; // "Low" | "Medium" | "High"
  sleeping: string; // "Light Sleeper" | "Heavy Sleeper"
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

  initializeDb: () => void;
  saveDb: () => void;
  addRegisteredUser: (u: User & Record<string, any>) => Promise<void>;
  
  // Complaint Transactions
  addComplaint: (c: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "timeline">) => Promise<void>;
  updateComplaintStatus: (id: string, status: Complaint["status"], details?: { by?: string; note?: string; afterPhoto?: string }) => Promise<void>;
  assignComplaintWorker: (id: string, workerName: string, workerId: string, eta: string) => Promise<void>;
  rateComplaint: (id: string, rating: number) => Promise<void>;

  // Leaves Transactions
  submitLeaveRequest: (req: Omit<LeaveRequest, "id" | "status" | "createdAt">) => Promise<void>;
  approveRejectLeave: (id: string, status: "approved" | "rejected") => Promise<void>;

  // Visitors Transactions
  submitVisitorRequest: (v: Omit<Visitor, "id" | "status" | "qrCode">) => Promise<void>;
  checkInVisitor: (id: string) => Promise<void>;
  checkOutVisitor: (id: string) => Promise<void>;
  denyVisitorEntry: (id: string, reason: string) => Promise<void>;

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

  initializeDb: () => {
    if (typeof window === "undefined") return;
    if ((globalThis as any).__homeverse_auth_listener_active) return;
    (globalThis as any).__homeverse_auth_listener_active = true;

    onAuthStateChanged(auth, (firebaseUser: any) => {
      if (firebaseUser) {
        if ((globalThis as any).__homeverse_listeners_active) return;
        (globalThis as any).__homeverse_listeners_active = true;

        const collectionsToListen = [
          { key: "complaints", coll: "complaints" },
          { key: "leaveRequests", coll: "leaveRequests" },
          { key: "visitors", coll: "visitors" },
          { key: "laundrySlots", coll: "laundrySlots" },
          { key: "parcels", coll: "parcels" },
          { key: "facilityBookings", coll: "facilityBookings" },
          { key: "marketplaceItems", coll: "marketplaceItems" },
          { key: "lostFoundItems", coll: "lostFoundItems" },
          { key: "roomChangeRequests", coll: "roomChangeRequests" },
          { key: "maintenanceBills", coll: "maintenanceBills" },
          { key: "communityEvents", coll: "communityEvents" },
          { key: "notifications", coll: "notifications" },
          { key: "roommatePreferences", coll: "roommatePreferences" },
          { key: "users", coll: "users" },
          { key: "emergencies", coll: "emergencies" },
          { key: "gatePasses", coll: "gatePasses" },
          { key: "vehicleLogs", coll: "vehicleLogs" },
          { key: "incidents", coll: "incidents" },
          { key: "announcements", coll: "announcements" },
          { key: "expenses", coll: "expenses" },
          { key: "flats", coll: "flats" },
          { key: "rentRecords", coll: "rentRecords" }
        ];

        (globalThis as any).__homeverse_unsubscribers = collectionsToListen.map(({ key, coll }) => {
          return onSnapshot(collection(db, coll), (snapshot) => {
            const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            set({ [key]: list } as any);
          });
        });
      } else {
        if ((globalThis as any).__homeverse_unsubscribers) {
          (globalThis as any).__homeverse_unsubscribers.forEach((unsub: any) => unsub());
          delete (globalThis as any).__homeverse_unsubscribers;
        }
        (globalThis as any).__homeverse_listeners_active = false;
      }
    });
  },

  // No-op since we write straight to Firestore
  saveDb: () => {},

  addRegisteredUser: async (u) => {
    await setDoc(doc(db, "users", u.id), u);
  },

  // ==========================================
  // COMPLAINT TRANSACTIONS
  // ==========================================
  addComplaint: async (c) => {
    const id = `CMP-${Math.floor(100 + Math.random() * 900)}`;
    const newComplaint: Complaint = {
      ...c,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { status: "submitted", timestamp: new Date().toISOString(), note: "Complaint registered successfully." }
      ]
    };
    await setDoc(doc(db, "complaints", id), newComplaint);

    const title = `New Ticket Raised 📋`;
    const message = `Unit ${c.unit} raised ticket: "${c.title}"`;
    await get().sendNotification("all_residents", title, message, "info");
  },

  updateComplaintStatus: async (id, status, details) => {
    const compDoc = await getDoc(doc(db, "complaints", id));
    if (!compDoc.exists()) return;
    const comp = compDoc.data() as Complaint;
    const newTimeline = [...(comp.timeline || [])];
    if (details?.note) {
      newTimeline.push({
        status,
        timestamp: new Date().toISOString(),
        note: details.note,
        by: details.by,
        afterPhoto: details.afterPhoto
      });
    }
    const updates: Partial<Complaint> = {
      status,
      updatedAt: new Date().toISOString(),
      timeline: newTimeline
    };
    await updateDoc(doc(db, "complaints", id), updates);

    await get().sendNotification(
      comp.raisedBy,
      `Ticket Status Updated ⚙️`,
      `Your ticket "${comp.title}" is now: ${status.toUpperCase()}`,
      "success"
    );
  },

  assignComplaintWorker: async (id, workerName, workerId, eta) => {
    const updates = {
      assignedTo: `${workerName} (ETA: ${eta})`,
      assignedToId: workerId,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(doc(db, "complaints", id), updates);
    
    await get().sendNotification(
      workerId,
      `New Job Assigned 🛠️`,
      `You have been assigned: "${id}". Please review ETA.`,
      "info"
    );
  },

  rateComplaint: async (id, rating) => {
    await updateDoc(doc(db, "complaints", id), {
      rating,
      updatedAt: new Date().toISOString()
    });
  },

  // ==========================================
  // LEAVES TRANSACTIONS
  // ==========================================
  submitLeaveRequest: async (req) => {
    const id = `LEV-${Math.floor(100 + Math.random() * 900)}`;
    const newReq: LeaveRequest = {
      ...req,
      id,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "leaveRequests", id), newReq);

    await get().sendNotification(
      "user-warden-1",
      "New Outstation Request ✈️",
      `${req.studentName} has requested outstation leave.`,
      "warning"
    );
  },

  approveRejectLeave: async (id, status) => {
    await updateDoc(doc(db, "leaveRequests", id), { status });
    const leaveDoc = await getDoc(doc(db, "leaveRequests", id));
    if (leaveDoc.exists()) {
      const leaveData = leaveDoc.data() as LeaveRequest;
      await get().sendNotification(
        leaveData.studentId,
        `Leave Request ${status.toUpperCase()} ✈️`,
        `Your leave request from ${leaveData.fromDate} has been ${status}.`,
        status === "approved" ? "success" : "error"
      );
    }
  },

  // ==========================================
  // VISITORS TRANSACTIONS
  // ==========================================
  submitVisitorRequest: async (v) => {
    const id = `VIS-${Math.floor(100 + Math.random() * 900)}`;
    const qrCode = `QR-HOMEVERSE-${id}`;
    const newVisitor: Visitor = {
      ...v,
      id,
      status: "expected",
      qrCode
    };
    await setDoc(doc(db, "visitors", id), newVisitor);

    await get().sendNotification(
      "user-security-1",
      "Pre-approved Visitor Scheduled 🚪",
      `Visitor ${v.name} scheduled for unit ${v.visitingUnit}.`,
      "info"
    );
  },

  checkInVisitor: async (id) => {
    await updateDoc(doc(db, "visitors", id), {
      status: "checked-in",
      checkInTime: new Date().toISOString()
    });
    
    const visDoc = await getDoc(doc(db, "visitors", id));
    if (visDoc.exists()) {
      const vis = visDoc.data() as Visitor;
      const resident = get().users.find(u => u.role === "resident" && u.unit === vis.visitingUnit);
      if (resident) {
        await get().sendNotification(
          resident.id,
          "Visitor Checked In 🔔",
          `Your visitor ${vis.name} has checked in at the gate.`,
          "success"
        );
      }
    }
  },

  checkOutVisitor: async (id) => {
    await updateDoc(doc(db, "visitors", id), {
      status: "checked-out",
      checkOutTime: new Date().toISOString()
    });
  },

  denyVisitorEntry: async (id, reason) => {
    await updateDoc(doc(db, "visitors", id), {
      status: "denied",
      denialReason: reason
    });
  },

  // ==========================================
  // LAUNDRY TRANSACTIONS
  // ==========================================
  bookLaundrySlot: async (machineId, slot, date, studentId, studentName) => {
    const slotId = `${machineId}-${date}-${slot.replace(/\s+/g, "")}`;
    const newSlot: LaundrySlot = {
      id: slotId,
      machineId,
      machineName: machineId === "M1" || machineId === "M3" ? "Front Load LG" : "Top Load Samsung",
      slot,
      date,
      bookedBy: studentId,
      bookedByName: studentName,
      status: "booked"
    };
    await setDoc(doc(db, "laundrySlots", slotId), newSlot);
    return true;
  },

  cancelLaundrySlot: async (machineId, slot, date) => {
    const slotId = `${machineId}-${date}-${slot.replace(/\s+/g, "")}`;
    await deleteDoc(doc(db, "laundrySlots", slotId));
  },

  // ==========================================
  // PARCELS TRANSACTIONS
  // ==========================================
  addParcel: async (p) => {
    const id = `PRC-${Math.floor(100 + Math.random() * 900)}`;
    const newParcel: Parcel = {
      ...p,
      id,
      status: "received",
      receivedAt: new Date().toISOString()
    };
    await setDoc(doc(db, "parcels", id), newParcel);

    await get().sendNotification(
      p.recipientId,
      "New Parcel at Desk 📦",
      `A parcel from ${p.courier} has been logged. OTP: ${p.otp}`,
      "warning"
    );
  },

  pickupParcelWithOTP: async (id, otp) => {
    const docRef = doc(db, "parcels", id);
    const parcelDoc = await getDoc(docRef);
    if (parcelDoc.exists()) {
      const parcel = parcelDoc.data() as Parcel;
      if (parcel.otp === otp) {
        await updateDoc(docRef, {
          status: "picked-up",
          pickedUpAt: new Date().toISOString()
        });
        return true;
      }
    }
    return false;
  },

  // ==========================================
  // ROOM ALLOCATION TRANSACTIONS
  // ==========================================
  reallocateRoom: async (studentId, newRoom, newBlock, newFloor) => {
    await updateDoc(doc(db, "users", studentId), {
      unit: newRoom,
      building: newBlock,
      floor: newFloor
    });
    await get().sendNotification(
      studentId,
      "Room Reallocation 🛌",
      `Your room allocation has been updated: ${newBlock} - Room ${newRoom}`,
      "info"
    );
  },

  vacateRoom: async (studentId) => {
    await updateDoc(doc(db, "users", studentId), {
      unit: "",
      building: ""
    });
  },

  requestRoomChange: async (req) => {
    const id = `RCH-${Math.floor(100 + Math.random() * 900)}`;
    const newReq: RoomChangeRequest = {
      ...req,
      id,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "roomChangeRequests", id), newReq);

    await get().sendNotification(
      "user-warden-1",
      "Room Change Request 🔄",
      `${req.studentName} requested room change to ${req.requestedRoom}`,
      "warning"
    );
  },

  approveRoomChange: async (id) => {
    const reqDoc = await getDoc(doc(db, "roomChangeRequests", id));
    if (reqDoc.exists()) {
      const req = reqDoc.data() as RoomChangeRequest;
      await updateDoc(doc(db, "roomChangeRequests", id), { status: "approved" });
      await updateDoc(doc(db, "users", req.studentId), {
        unit: req.requestedRoom,
        building: req.requestedBlock
      });
      await get().sendNotification(
        req.studentId,
        "Room Change Approved 🔄",
        `Your room change request to ${req.requestedRoom} has been approved.`,
        "success"
      );
    }
  },

  // ==========================================
  // ROOMMATE PREFERENCE TRANSACTIONS
  // ==========================================
  submitRoommatePreference: async (pref) => {
    await setDoc(doc(db, "roommatePreferences", pref.userId), pref);
  },

  // ==========================================
  // FACILITY BOOKINGS
  // ==========================================
  bookFacility: async (booking) => {
    const id = `FAC-${Math.floor(100 + Math.random() * 900)}`;
    const newBooking: FacilityBooking = {
      ...booking,
      id,
      status: "booked"
    };
    await setDoc(doc(db, "facilityBookings", id), newBooking);
    return true;
  },

  cancelFacilityBooking: async (id) => {
    await updateDoc(doc(db, "facilityBookings", id), { status: "cancelled" });
  },

  // ==========================================
  // MARKETPLACE TRANSACTIONS
  // ==========================================
  listMarketplaceItem: async (item) => {
    const id = `ITEM-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: MarketplaceItem = {
      ...item,
      id,
      status: "available",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "marketplaceItems", id), newItem);
  },

  sellMarketplaceItem: async (id) => {
    await updateDoc(doc(db, "marketplaceItems", id), { status: "sold" });
  },

  deleteMarketplaceItem: async (itemId) => {
    await deleteDoc(doc(db, "marketplaceItems", itemId));
  },

  // ==========================================
  // LOST & FOUND TRANSACTIONS
  // ==========================================
  reportLostFoundItem: async (item) => {
    const id = `LF-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: LostFoundItem = {
      ...item,
      id,
      status: "reported",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "lostFoundItems", id), newItem);
  },

  claimLostFoundItem: async (id, claimantId, claimantName) => {
    await updateDoc(doc(db, "lostFoundItems", id), {
      status: "claimed",
      claimantId,
      claimantName
    });
  },

  resolveLostFoundItem: async (id) => {
    await updateDoc(doc(db, "lostFoundItems", id), { status: "claimed" });
  },

  // ==========================================
  // BILLING & FINANCE
  // ==========================================
  payMaintenanceBill: async (id) => {
    await updateDoc(doc(db, "maintenanceBills", id), {
      status: "paid",
      paidOn: new Date().toISOString().split("T")[0]
    });
  },

  // ==========================================
  // EVENTS
  // ==========================================
  createEvent: async (ev) => {
    const id = `EVT-${Math.floor(100 + Math.random() * 900)}`;
    const newEvent: CommunityEvent = {
      ...ev,
      id,
      rsvps: []
    };
    await setDoc(doc(db, "communityEvents", id), newEvent);
  },

  rsvpEvent: async (id, userId) => {
    const docRef = doc(db, "communityEvents", id);
    const evDoc = await getDoc(docRef);
    if (evDoc.exists()) {
      const ev = evDoc.data() as CommunityEvent;
      const currentRsvps = ev.rsvps || [];
      const newRsvps = currentRsvps.includes(userId)
        ? currentRsvps.filter((u) => u !== userId)
        : [...currentRsvps, userId];
      await updateDoc(docRef, { rsvps: newRsvps });
    }
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  sendNotification: async (userId, title, message, type) => {
    const id = `NTF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newNtf: Notification = {
      id,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "notifications", id), newNtf);
  },

  markNotificationsRead: async (userId) => {
    const userNtfs = get().notifications.filter((n) => n.userId === userId && !n.read);
    for (const ntf of userNtfs) {
      await updateDoc(doc(db, "notifications", ntf.id), { read: true });
    }
  },

  // ==========================================
  // SECURITY OPERATIONS
  // ==========================================
  raiseEmergencyAlert: async (alert) => {
    const id = `EMG-${Math.floor(100 + Math.random() * 900)}`;
    const newAlert: EmergencyAlert = {
      ...alert,
      id,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "emergencies", id), newAlert);

    await get().sendNotification(
      "user-security-1",
      "🚨 EMERGENCY SIREN ALARM 🚨",
      `Medical/Security panic button pressed at unit ${alert.unit}. Resident: ${alert.residentName}.`,
      "alert"
    );
  },

  updateEmergencyStatus: async (id, status, notes) => {
    await updateDoc(doc(db, "emergencies", id), {
      status,
      notes: notes || ""
    });
  },

  issueGatePass: async (pass) => {
    const id = `PASS-${Math.floor(100 + Math.random() * 900)}`;
    const newPass: GatePass = {
      ...pass,
      id,
      status: "active",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "gatePasses", id), newPass);
  },

  logVehicleEntry: async (vehicle) => {
    const id = `VEH-${Math.floor(100 + Math.random() * 900)}`;
    const newVehicle: VehicleLog = {
      ...vehicle,
      id,
      entryTime: new Date().toISOString(),
      status: "inside"
    };
    await setDoc(doc(db, "vehicleLogs", id), newVehicle);
  },

  logVehicleExit: async (id) => {
    await updateDoc(doc(db, "vehicleLogs", id), {
      exitTime: new Date().toISOString(),
      status: "exited"
    });
  },

  addAnnouncement: async (ann) => {
    const id = `ANN-${Math.floor(100 + Math.random() * 900)}`;
    const newAnn: Announcement = {
      ...ann,
      id,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "announcements", id), newAnn);
  },

  addIncidentReport: async (incident) => {
    const id = `INC-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident: IncidentReport = {
      ...incident,
      id,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "incidents", id), newIncident);
  },

  approveUser: async (userId) => {
    await updateDoc(doc(db, "users", userId), { status: "approved" });
  },

  rejectUser: async (userId) => {
    await updateDoc(doc(db, "users", userId), { status: "rejected" });
  },

  activateDeactivateUser: async (userId, status) => {
    await updateDoc(doc(db, "users", userId), { status });
  },

  addFlat: async (flat) => {
    const id = `FL-${flat.building.replace(/\s+/g, "")}-${flat.flatNumber}`;
    await setDoc(doc(db, "flats", id), { id, ...flat });
  },

  addExpense: async (expense) => {
    const id = `EXP-${Math.floor(100 + Math.random() * 900)}`;
    const newExpense: SocietyExpense = { id, ...expense };
    await setDoc(doc(db, "expenses", id), newExpense);
  },

  addRentRecord: async (rent) => {
    const id = `RNT-${Math.floor(100 + Math.random() * 900)}`;
    const newRent: RentRecord = { id, ...rent };
    await setDoc(doc(db, "rentRecords", id), newRent);
  },

  payRentRecord: async (id) => {
    await updateDoc(doc(db, "rentRecords", id), {
      status: "paid",
      paidOn: new Date().toISOString().split("T")[0]
    });
  },

  generateBulkMaintenanceBills: async (billDetails) => {
    const approvedResidents = get().users.filter(
      (u) => u.role === "resident" && u.status === "approved"
    );
    for (const res of approvedResidents) {
      const id = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;
      const bill = {
        id,
        residentId: res.id,
        residentName: res.name,
        unit: res.unit || "N/A",
        month: billDetails.month,
        amount: billDetails.amount,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split("T")[0],
        status: "pending",
        breakdown: billDetails.breakdown
      };
      await setDoc(doc(db, "maintenanceBills", id), bill);

      await get().sendNotification(
        res.id,
        "Maintenance Bill Generated 🧾",
        `Maintenance bill of ₹${billDetails.amount} for ${billDetails.month} has been generated. Due date: ${new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split("T")[0]}`,
        "warning"
      );
    }
  },

  updateWorkerServices: async (workerId, details) => {
    await updateDoc(doc(db, "users", workerId), details);
  }
}));
