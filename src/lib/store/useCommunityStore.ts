"use client";

import { create } from "zustand";
import { Complaint, Visitor, UserRole, PortalType } from "@/types";

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

  initializeDb: () => void;
  saveDb: () => void;
  
  // Complaint Transactions
  addComplaint: (c: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "timeline">) => void;
  updateComplaintStatus: (id: string, status: Complaint["status"], details?: { by?: string; note?: string; afterPhoto?: string }) => void;
  assignComplaintWorker: (id: string, workerName: string, workerId: string, eta: string) => void;
  rateComplaint: (id: string, rating: number) => void;

  // Leaves Transactions
  submitLeaveRequest: (req: Omit<LeaveRequest, "id" | "status" | "createdAt">) => void;
  approveRejectLeave: (id: string, status: "approved" | "rejected") => void;

  // Visitors Transactions
  submitVisitorRequest: (v: Omit<Visitor, "id" | "status" | "qrCode">) => void;
  checkInVisitor: (id: string) => void;
  checkOutVisitor: (id: string) => void;

  // Laundry Transactions
  bookLaundrySlot: (machineId: string, slot: string, date: string, studentId: string, studentName: string) => boolean;
  cancelLaundrySlot: (machineId: string, slot: string, date: string) => void;

  // Parcels Transactions
  addParcel: (p: Omit<Parcel, "id" | "status" | "receivedAt">) => void;
  pickupParcelWithOTP: (id: string, otp: string) => boolean;

  // Room Allocation Transactions
  reallocateRoom: (studentId: string, newRoom: string, newBlock: string, newFloor: string) => void;
  requestRoomChange: (req: Omit<RoomChangeRequest, "id" | "status" | "createdAt">) => void;
  approveRoomChange: (id: string) => void;

  // Roommate Matching Transactions
  submitRoommatePreference: (pref: RoommatePreference) => void;

  // Facility Bookings
  bookFacility: (booking: Omit<FacilityBooking, "id" | "status">) => boolean;
  cancelFacilityBooking: (id: string) => void;

  // Marketplace Transactions
  listMarketplaceItem: (item: Omit<MarketplaceItem, "id" | "status" | "createdAt">) => void;
  sellMarketplaceItem: (id: string) => void;

  // Lost & Found Transactions
  reportLostFoundItem: (item: Omit<LostFoundItem, "id" | "status" | "createdAt">) => void;
  claimLostFoundItem: (id: string, claimantId: string, claimantName: string) => void;

  // Maintenance Bills Payments
  payMaintenanceBill: (id: string) => void;

  // Community Events
  createEvent: (ev: Omit<CommunityEvent, "id" | "rsvps">) => void;
  rsvpEvent: (id: string, userId: string) => void;

  // Notifications
  sendNotification: (userId: string, title: string, message: string, type: Notification["type"]) => void;
  markNotificationsRead: (userId: string) => void;
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

  initializeDb: () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("homeverse_db");
      if (stored) {
        set(JSON.parse(stored));
        return;
      }
    } catch (e) {
      console.error("Failed to load local DB", e);
    }

    // Prepopulate database with mock data connected across roles
    const prepopulatedComplaints: Complaint[] = [
      {
        id: "CMP-001",
        title: "Kitchen Tap Leaking Continuously",
        description: "Water is dripping from the hot water faucet line. Flooded cabinet under kitchen counter.",
        category: "plumbing",
        status: "assigned",
        priority: "high",
        raisedBy: "user-resident-1",
        raisedByName: "Nidhi Kumar",
        unit: "A-301",
        building: "Tower A",
        createdAt: "2026-07-02T10:00:00",
        updatedAt: "2026-07-02T10:15:00",
        assignedTo: "Ramesh Kumar (Plumber)",
        priorityScore: 80,
        timeline: [
          { status: "submitted", timestamp: "2026-07-02T10:00:00", note: "Complaint registered" },
          { status: "assigned", timestamp: "2026-07-02T10:15:00", note: "Assigned to Plumber Team", by: "Admin" }
        ]
      },
      {
        id: "CMP-002",
        title: "Curfew Block A Corridor Light Flickering",
        description: "Flickering lights in common path. Safety hazard near lift lobby.",
        category: "electrical",
        status: "in-progress",
        priority: "medium",
        raisedBy: "user-student-1",
        raisedByName: "Aarav Mehta",
        unit: "204",
        building: "Block B",
        createdAt: "2026-07-02T08:30:00",
        updatedAt: "2026-07-02T09:00:00",
        assignedTo: "Ramesh Kumar (Electrician)",
        priorityScore: 60,
        timeline: [
          { status: "submitted", timestamp: "2026-07-02T08:30:00", note: "Complaint registered" },
          { status: "assigned", timestamp: "2026-07-02T08:45:00", note: "Assigned to Ramesh Kumar", by: "Warden" },
          { status: "in-progress", timestamp: "2026-07-02T09:00:00", note: "Inspection started by electrician", by: "Ramesh Kumar" }
        ]
      }
    ];

    const prepopulatedLeaveRequests: LeaveRequest[] = [
      {
        id: "LEAVE-001",
        studentId: "user-student-1",
        studentName: "Aarav Mehta",
        room: "204 (Block B)",
        parentContact: "+91 99999 88888",
        reason: "Outstation travel for college hackathon.",
        fromDate: "2026-07-05",
        toDate: "2026-07-08",
        status: "pending",
        createdAt: "2026-07-02T15:00:00"
      }
    ];

    const prepopulatedVisitors: Visitor[] = [
      {
        id: "VIS-001",
        name: "Sanjay Mehta",
        phone: "+91 98765 09876",
        purpose: "Family visit / Parent dropoff",
        visitingUnit: "204",
        visitingResident: "Aarav Mehta",
        status: "checked-in",
        expectedAt: "2026-07-03T10:00:00",
        checkInTime: "2026-07-03T10:15:00",
        date: "2026-07-03",
        approvedBy: "Dr. K. S. Pillai (Warden)"
      },
      {
        id: "VIS-002",
        name: "Vikram Kumar",
        phone: "+91 98111 22233",
        purpose: "Personal Guest",
        visitingUnit: "A-301",
        visitingResident: "Nidhi Kumar",
        status: "expected",
        expectedAt: "2026-07-03T18:00:00",
        date: "2026-07-03",
        approvedBy: "Nidhi Kumar"
      }
    ];

    // Prepopulate Laundry machines (M1, M2, M3, M4) with 5 slots each for today
    const prepopulatedLaundrySlots: LaundrySlot[] = [];
    const machines = [
      { id: "M1", name: "Washing Machine #1 (Block A)" },
      { id: "M2", name: "Washing Machine #2 (Block B)" },
      { id: "M3", name: "Dryer #1 (Block A)" },
      { id: "M4", name: "Dryer #2 (Block B)" }
    ];
    const slots = [
      "09:00 - 10:00 AM",
      "10:00 - 11:00 AM",
      "11:00 - 12:00 PM",
      "02:00 - 03:00 PM",
      "03:00 - 04:00 PM"
    ];
    const todayStr = new Date().toISOString().split("T")[0];

    machines.forEach((m) => {
      slots.forEach((s) => {
        prepopulatedLaundrySlots.push({
          id: `${m.id}-${s.replace(/\s+/g, "")}`,
          machineId: m.id,
          machineName: m.name,
          slot: s,
          date: todayStr,
          status: "available"
        });
      });
    });

    // Book one slot to show double-booking block
    prepopulatedLaundrySlots[3].status = "booked";
    prepopulatedLaundrySlots[3].bookedBy = "user-student-other";
    prepopulatedLaundrySlots[3].bookedByName = "Rohan Das";

    const prepopulatedParcels: Parcel[] = [
      {
        id: "PRC-001",
        recipientId: "user-student-1",
        recipientName: "Aarav Mehta",
        unit: "204",
        courier: "Amazon Logistics",
        description: "Standard Box (Books & Stationery)",
        otp: "4821",
        location: "Block B Warden Locker Room",
        status: "received",
        portal: "hostel",
        receivedAt: "2026-07-02T11:30:00"
      },
      {
        id: "PRC-002",
        recipientId: "user-resident-1",
        recipientName: "Nidhi Kumar",
        unit: "A-301",
        courier: "BlueDart",
        description: "Document Envelope",
        otp: "1092",
        location: "Tower A Guard Post",
        status: "received",
        portal: "society",
        receivedAt: "2026-07-02T14:45:00"
      }
    ];

    const prepopulatedMarketplaceItems: MarketplaceItem[] = [
      {
        id: "MKT-001",
        title: "Mountain Cycle (18-Speed)",
        description: "Excellent riding condition, disk brakes. Used for 1 year around campus.",
        price: "₹3,500",
        sellerId: "user-student-other",
        sellerName: "Rohan Das",
        category: "Cycles",
        status: "available",
        portal: "hostel",
        createdAt: "2026-07-01T12:00:00"
      },
      {
        id: "MKT-002",
        title: "Academic Notes - CS Algorithms",
        description: "Complete handwritten notes covering all core sorting, graph algorithms, and DP proofs.",
        price: "₹250",
        sellerId: "user-student-1",
        sellerName: "Aarav Mehta",
        category: "Notes",
        status: "available",
        portal: "hostel",
        createdAt: "2026-07-02T09:00:00"
      },
      {
        id: "MKT-003",
        title: "Baby Cradle / Wooden Crib",
        description: "Solid pine wood cradle with smooth rocking swings. Very good condition.",
        price: "₹4,500",
        sellerId: "user-resident-1",
        sellerName: "Nidhi Kumar",
        category: "Furniture",
        status: "available",
        portal: "society",
        createdAt: "2026-06-30T10:00:00"
      }
    ];

    const prepopulatedLostFoundItems: LostFoundItem[] = [
      {
        id: "LF-001",
        title: "Black Leather Wallet",
        description: "Found near Block B badminton court. Contains cards but no cash.",
        status: "reported",
        reporterId: "user-student-other",
        reporterName: "Rohan Das",
        portal: "hostel",
        createdAt: "2026-07-02T16:30:00"
      }
    ];

    const prepopulatedMaintenanceBills: MaintenanceBill[] = [
      {
        id: "BILL-001",
        residentId: "user-resident-1",
        residentName: "Nidhi Kumar",
        unit: "A-301",
        month: "July 2026",
        amount: 4500,
        dueDate: "2026-07-10",
        status: "pending"
      }
    ];

    const prepopulatedCommunityEvents: CommunityEvent[] = [
      {
        id: "EV-001",
        title: "Independence Day Cultural Fest",
        description: "Traditional music, dance events, flag hoisting ceremony and evening high tea at the clubhouse.",
        date: "2026-08-15",
        time: "09:00 AM - 07:00 PM",
        location: "Main Clubhouse & Lawn",
        organizer: "Society Committee",
        priority: "important",
        rsvps: []
      }
    ];

    const prepopulatedNotifications: Notification[] = [
      {
        id: "NTF-001",
        userId: "user-resident-1",
        title: "Maintenance Bill Generated",
        message: "Maintenance bill of ₹4,500 for July 2026 is due by July 10.",
        type: "warning",
        read: false,
        createdAt: "2026-07-01T09:00:00"
      },
      {
        id: "NTF-002",
        userId: "user-student-1",
        title: "Parcel Arrived at Locker",
        message: "Your BlueDart courier parcel is registered. Pickup OTP: 4821.",
        type: "success",
        read: false,
        createdAt: "2026-07-02T11:30:00"
      }
    ];

    const initialDb = {
      complaints: prepopulatedComplaints,
      leaveRequests: prepopulatedLeaveRequests,
      visitors: prepopulatedVisitors,
      laundrySlots: prepopulatedLaundrySlots,
      parcels: prepopulatedParcels,
      facilityBookings: [],
      marketplaceItems: prepopulatedMarketplaceItems,
      lostFoundItems: prepopulatedLostFoundItems,
      roomChangeRequests: [],
      maintenanceBills: prepopulatedMaintenanceBills,
      communityEvents: prepopulatedCommunityEvents,
      notifications: prepopulatedNotifications,
      roommatePreferences: []
    };

    set(initialDb);
    try {
      localStorage.setItem("homeverse_db", JSON.stringify(initialDb));
    } catch (e) {}
  },

  // Helper transaction to save database
  saveDb: () => {
    if (typeof window === "undefined") return;
    const {
      complaints, leaveRequests, visitors, laundrySlots, parcels,
      facilityBookings, marketplaceItems, lostFoundItems, roomChangeRequests,
      maintenanceBills, communityEvents, notifications, roommatePreferences
    } = get();
    try {
      localStorage.setItem("homeverse_db", JSON.stringify({
        complaints, leaveRequests, visitors, laundrySlots, parcels,
        facilityBookings, marketplaceItems, lostFoundItems, roomChangeRequests,
        maintenanceBills, communityEvents, notifications, roommatePreferences
      }));
    } catch (e) {}
  },

  // ==========================================
  // COMPLAINT TRANSACTIONS
  // ==========================================
  addComplaint: (c) => {
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
    set(state => ({ complaints: [newComplaint, ...state.complaints] }));
    get().saveDb();

    // Trigger Notification
    const isHostel = c.portal === "hostel";
    if (isHostel) {
      // Notify Warden
      get().sendNotification("user-warden-1", "New Complaint Raised", `Student ${c.raisedByName} raised a complaint: "${c.title}"`, "warning");
    } else {
      // Notify Committee/Admin
      get().sendNotification("admin", "New Maintenance Job", `${c.raisedByName} (Flat ${c.unit}) reported: "${c.title}"`, "warning");
    }
  },

  updateComplaintStatus: (id, status, details = {}) => {
    set(state => ({
      complaints: state.complaints.map(c => {
        if (c.id === id) {
          const timestamp = new Date().toISOString();
          const timelineEntry = {
            status,
            timestamp,
            note: details.note || `Status updated to ${status}.`,
            by: details.by || "System"
          };
          return {
            ...c,
            status,
            updatedAt: timestamp,
            beforePhoto: details.afterPhoto ? c.beforePhoto : (details.note?.includes("proof") ? details.afterPhoto : c.beforePhoto), // fallback
            resolvedAt: status === "resolved" ? timestamp : c.resolvedAt,
            timeline: [...c.timeline, timelineEntry],
            // Append completion notes/images if applicable
            ...(status === "resolved" || status === "closed" ? {
              comments: details.note,
              afterPhoto: details.afterPhoto
            } : {})
          };
        }
        return c;
      })
    }));
    get().saveDb();

    // Notify User
    const updated = get().complaints.find(c => c.id === id);
    if (updated) {
      get().sendNotification(
        updated.raisedBy,
        `Complaint Update: ${updated.title.slice(0, 20)}...`,
        `Complaint status has been updated to "${status}".`,
        status === "resolved" ? "success" : "info"
      );
    }
  },

  assignComplaintWorker: (id, workerName, workerId, eta) => {
    set(state => ({
      complaints: state.complaints.map(c => {
        if (c.id === id) {
          const timestamp = new Date().toISOString();
          const timelineEntry = {
            status: "assigned" as const,
            timestamp,
            note: `Assigned to ${workerName}. Est. resolution: ${eta}`,
            by: "Admin/Warden"
          };
          return {
            ...c,
            status: "assigned" as const,
            assignedTo: workerName,
            estimatedResolution: eta,
            updatedAt: timestamp,
            timeline: [...c.timeline, timelineEntry]
          };
        }
        return c;
      })
    }));
    get().saveDb();

    const updated = get().complaints.find(c => c.id === id);
    if (updated) {
      // Notify Resident
      get().sendNotification(
        updated.raisedBy,
        "Worker Assigned to Task",
        `Worker ${workerName} has been assigned. Estimated time: ${eta}`,
        "info"
      );
      // Notify Worker
      get().sendNotification(
        workerId,
        "New Job Assigned",
        `Job details: ${updated.title} at ${updated.building} Unit ${updated.unit}. Priority: ${updated.priority}`,
        "alert"
      );
    }
  },

  rateComplaint: (id, rating) => {
    set(state => ({
      complaints: state.complaints.map(c => {
        if (c.id === id) {
          return { ...c, rating, status: "closed" as const };
        }
        return c;
      })
    }));
    get().saveDb();
  },

  // ==========================================
  // LEAVE TRANSACTIONS
  // ==========================================
  submitLeaveRequest: (req) => {
    const newLeave: LeaveRequest = {
      ...req,
      id: `LEAVE-${Math.floor(100 + Math.random() * 900)}`,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    set(state => ({ leaveRequests: [newLeave, ...state.leaveRequests] }));
    get().saveDb();

    // Notify Warden
    get().sendNotification("user-warden-1", "Leave Approval Required", `${req.studentName} requested leave from ${req.fromDate}.`, "warning");
  },

  approveRejectLeave: (id, status) => {
    set(state => ({
      leaveRequests: state.leaveRequests.map(l => l.id === id ? { ...l, status } : l)
    }));
    get().saveDb();

    const request = get().leaveRequests.find(l => l.id === id);
    if (request) {
      get().sendNotification(
        request.studentId,
        `Leave Request ${status === "approved" ? "Approved ✔" : "Rejected ✘"}`,
        `Your outing request for dates ${request.fromDate} to ${request.toDate} has been ${status}.`,
        status === "approved" ? "success" : "error"
      );
    }
  },

  // ==========================================
  // VISITORS TRANSACTIONS
  // ==========================================
  submitVisitorRequest: (v) => {
    const id = `VIS-${Math.floor(100 + Math.random() * 900)}`;
    const newVisitor: Visitor = {
      ...v,
      id,
      status: v.portal === "hostel" ? "expected" : "expected", // needs warden approval if hostel
      qrCode: `QR-CODE-${id}`,
      approvedBy: v.approvedBy || v.visitingResident
    };
    set(state => ({ visitors: [newVisitor, ...state.visitors] }));
    get().saveDb();

    if (v.portal === "hostel") {
      // Send approval to Warden
      get().sendNotification("user-warden-1", "Hostel Visitor Requested", `${v.visitingResident} requested visitor access for ${v.name}.`, "info");
    }
  },

  checkInVisitor: (id) => {
    set(state => ({
      visitors: state.visitors.map(v => v.id === id ? { ...v, status: "checked-in", checkInTime: new Date().toISOString() } : v)
    }));
    get().saveDb();

    const visitor = get().visitors.find(v => v.id === id);
    if (visitor) {
      // Notify resident/student
      const matchingComplaints = get().complaints.filter(c => c.raisedByName === visitor.visitingResident);
      const recipientId = matchingComplaints.length > 0 ? matchingComplaints[0].raisedBy : "user-resident-1";
      get().sendNotification(
        recipientId,
        "Visitor Checked In 🏢",
        `Your pre-approved guest ${visitor.name} has checked into the main gate.`,
        "success"
      );
    }
  },

  checkOutVisitor: (id) => {
    set(state => ({
      visitors: state.visitors.map(v => v.id === id ? { ...v, status: "checked-out", checkOutTime: new Date().toISOString() } : v)
    }));
    get().saveDb();
  },

  // ==========================================
  // LAUNDRY TRANSACTIONS
  // ==========================================
  bookLaundrySlot: (machineId, slot, date, studentId, studentName) => {
    // Check if slot is already booked
    const existing = get().laundrySlots.find(
      (s) => s.machineId === machineId && s.slot === slot && s.date === date
    );

    if (existing && existing.status === "booked") {
      return false; // already taken
    }

    set(state => ({
      laundrySlots: state.laundrySlots.map(s => {
        if (s.machineId === machineId && s.slot === slot && s.date === date) {
          return { ...s, status: "booked", bookedBy: studentId, bookedByName: studentName };
        }
        return s;
      })
    }));
    get().saveDb();

    // Notify Student
    get().sendNotification(
      studentId,
      "Laundry Slot Confirmed 🧺",
      `Successfully reserved machine ${machineId} for slot ${slot}.`,
      "success"
    );

    return true;
  },

  cancelLaundrySlot: (machineId, slot, date) => {
    const existing = get().laundrySlots.find(
      (s) => s.machineId === machineId && s.slot === slot && s.date === date
    );
    const prevBookedBy = existing?.bookedBy;

    set(state => ({
      laundrySlots: state.laundrySlots.map(s => {
        if (s.machineId === machineId && s.slot === slot && s.date === date) {
          return { ...s, status: "available", bookedBy: undefined, bookedByName: undefined };
        }
        return s;
      })
    }));
    get().saveDb();

    if (prevBookedBy) {
      get().sendNotification(
        prevBookedBy,
        "Laundry Booking Cancelled",
        `Your laundry reservation for machine ${machineId} has been cancelled.`,
        "info"
      );
    }
  },

  // ==========================================
  // PARCELS TRANSACTIONS
  // ==========================================
  addParcel: (p) => {
    const id = `PRC-${Math.floor(100 + Math.random() * 900)}`;
    const newParcel: Parcel = {
      ...p,
      id,
      status: "received",
      receivedAt: new Date().toISOString()
    };
    set(state => ({ parcels: [newParcel, ...state.parcels] }));
    get().saveDb();

    // Notify recipient
    get().sendNotification(
      p.recipientId,
      "New Package Received 📦",
      `A parcel from ${p.courier} is registered at ${p.location}. Pickup OTP is: ${p.otp}`,
      "success"
    );
  },

  pickupParcelWithOTP: (id, otp) => {
    const parcel = get().parcels.find(p => p.id === id);
    if (parcel && parcel.otp === otp && parcel.status === "received") {
      set(state => ({
        parcels: state.parcels.map(p => p.id === id ? { ...p, status: "picked-up", pickedUpAt: new Date().toISOString() } : p)
      }));
      get().saveDb();

      // Notify Student/Resident
      get().sendNotification(
        parcel.recipientId,
        "Package Handed Over",
        `You have successfully collected your courier from ${parcel.courier}.`,
        "success"
      );
      return true;
    }
    return false;
  },

  // ==========================================
  // ROOM ALLOCATION & ROOMMATE PREFERENCES
  // ==========================================
  reallocateRoom: (studentId, newRoom, newBlock, newFloor) => {
    // 1. Update complaints raised by this student to match new room/block
    set(state => ({
      complaints: state.complaints.map(c => {
        if (c.raisedBy === studentId) {
          return { ...c, unit: newRoom, building: newBlock };
        }
        return c;
      }),
      // 2. Update leave requests
      leaveRequests: state.leaveRequests.map(l => {
        if (l.studentId === studentId) {
          return { ...l, room: `${newRoom} (${newBlock})` };
        }
        return l;
      }),
      // 3. Update parcels
      parcels: state.parcels.map(p => {
        if (p.recipientId === studentId) {
          return { ...p, unit: newRoom };
        }
        return p;
      }),
      // 4. Update visitors
      visitors: state.visitors.map(v => {
        if (v.visitingResident.includes(studentId) || v.visitingUnit === studentId) {
          return { ...v, visitingUnit: newRoom };
        }
        return v;
      })
    }));

    // Trigger Notification
    get().sendNotification(
      studentId,
      "Room Reallocated 🛌",
      `Warden has updated your room assignment to Block ${newBlock}, Room ${newRoom}. All logs updated.`,
      "warning"
    );

    get().saveDb();
  },

  requestRoomChange: (req) => {
    const id = `RMCHG-${Math.floor(100 + Math.random() * 900)}`;
    const newReq: RoomChangeRequest = {
      ...req,
      id,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    set(state => ({ roomChangeRequests: [newReq, ...state.roomChangeRequests] }));
    get().saveDb();

    // Notify Warden
    get().sendNotification(
      "user-warden-1",
      "Room Transfer Request",
      `Student ${req.studentName} requested room transfer to ${req.requestedBlock} Room ${req.requestedRoom}.`,
      "info"
    );
  },

  approveRoomChange: (id) => {
    const request = get().roomChangeRequests.find(r => r.id === id);
    if (request && request.status === "pending") {
      set(state => ({
        roomChangeRequests: state.roomChangeRequests.map(r => r.id === id ? { ...r, status: "approved" as const } : r)
      }));
      
      // Perform actual room re-allocation
      get().reallocateRoom(request.studentId, request.requestedRoom, request.requestedBlock, "2");
      get().saveDb();
    }
  },

  submitRoommatePreference: (pref) => {
    set(state => {
      const idx = state.roommatePreferences.findIndex(p => p.userId === pref.userId);
      if (idx !== -1) {
        return {
          roommatePreferences: state.roommatePreferences.map(p => p.userId === pref.userId ? pref : p)
        };
      }
      return { roommatePreferences: [pref, ...state.roommatePreferences] };
    });
    get().saveDb();
  },

  // ==========================================
  // FACILITY BOOKINGS (SOCIETY)
  // ==========================================
  bookFacility: (booking) => {
    const existing = get().facilityBookings.find(
      (b) => b.facility === booking.facility && b.date === booking.date && b.slot === booking.slot && b.status === "booked"
    );

    if (existing) {
      return false; // double booking block
    }

    const id = `FAC-${Math.floor(100 + Math.random() * 900)}`;
    const newBooking: FacilityBooking = {
      ...booking,
      id,
      status: "booked"
    };

    set(state => ({ facilityBookings: [newBooking, ...state.facilityBookings] }));
    get().saveDb();

    get().sendNotification(
      booking.userId,
      "Facility Reservation Confirmed",
      `Your booking for ${booking.facility} on ${booking.date} at ${booking.slot} is confirmed.`,
      "success"
    );

    return true;
  },

  cancelFacilityBooking: (id) => {
    set(state => ({
      facilityBookings: state.facilityBookings.map(b => b.id === id ? { ...b, status: "cancelled" as const } : b)
    }));
    get().saveDb();
  },

  // ==========================================
  // MARKETPLACE TRANSACTIONS
  // ==========================================
  listMarketplaceItem: (item) => {
    const id = `MKT-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: MarketplaceItem = {
      ...item,
      id,
      status: "available",
      createdAt: new Date().toISOString()
    };
    set(state => ({ marketplaceItems: [newItem, ...state.marketplaceItems] }));
    get().saveDb();

    // Broadcast notice to portal
    const targetGroup = item.portal === "hostel" ? "all_students" : "all_residents";
    get().sendNotification(
      targetGroup,
      "New Listing in Marketplace 🏷️",
      `A new item "${item.title}" is listed for sale by ${item.sellerName}.`,
      "info"
    );
  },

  sellMarketplaceItem: (id) => {
    set(state => ({
      marketplaceItems: state.marketplaceItems.map(item => item.id === id ? { ...item, status: "sold" as const } : item)
    }));
    get().saveDb();
  },

  // ==========================================
  // LOST & FOUND TRANSACTIONS
  // ==========================================
  reportLostFoundItem: (item) => {
    const id = `LF-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: LostFoundItem = {
      ...item,
      id,
      status: "reported",
      createdAt: new Date().toISOString()
    };
    set(state => ({ lostFoundItems: [newItem, ...state.lostFoundItems] }));
    get().saveDb();

    // Broadcast notice
    const targetGroup = item.portal === "hostel" ? "all_students" : "all_residents";
    get().sendNotification(
      targetGroup,
      "Item Reported in Lost & Found 🔍",
      `Found: "${item.title}" reported by ${item.reporterName}. Check board to claim.`,
      "warning"
    );
  },

  claimLostFoundItem: (id, claimantId, claimantName) => {
    set(state => ({
      lostFoundItems: state.lostFoundItems.map(item =>
        item.id === id
          ? { ...item, status: "claimed" as const, claimantId, claimantName }
          : item
      )
    }));
    get().saveDb();

    const claimed = get().lostFoundItems.find(item => item.id === id);
    if (claimed) {
      // Notify reporter
      get().sendNotification(
        claimed.reporterId,
        "Lost & Found Claim Filed",
        `${claimantName} claimed the reported item: "${claimed.title}".`,
        "success"
      );
    }
  },

  // ==========================================
  // MAINTENANCE BILLS
  // ==========================================
  payMaintenanceBill: (id) => {
    set(state => ({
      maintenanceBills: state.maintenanceBills.map(b =>
        b.id === id ? { ...b, status: "paid" as const, paidOn: new Date().toISOString().split("T")[0] } : b
      )
    }));
    get().saveDb();

    const bill = get().maintenanceBills.find(b => b.id === id);
    if (bill) {
      get().sendNotification(
        bill.residentId,
        "Maintenance Paid successfully 💳",
        `Payment of ₹${bill.amount} for ${bill.month} has been processed successfully.`,
        "success"
      );
      // Notify admin
      get().sendNotification(
        "admin",
        "Maintenance Payment Received",
        `Resident ${bill.residentName} (Flat ${bill.unit}) paid maintenance ₹${bill.amount} for ${bill.month}`,
        "info"
      );
    }
  },

  // ==========================================
  // COMMUNITY EVENTS
  // ==========================================
  createEvent: (ev) => {
    const id = `EV-${Math.floor(100 + Math.random() * 900)}`;
    const newEvent: CommunityEvent = { ...ev, id, rsvps: [] };
    set(state => ({ communityEvents: [newEvent, ...state.communityEvents] }));
    get().saveDb();

    // Notify all residents
    get().sendNotification("all_residents", "New Society Event Announced 🗓️", `Upcoming Event: "${ev.title}" organized at ${ev.location}. RSVP now!`, "info");
  },

  rsvpEvent: (id, userId) => {
    set(state => ({
      communityEvents: state.communityEvents.map(ev => {
        if (ev.id === id) {
          const rsvps = ev.rsvps.includes(userId)
            ? ev.rsvps.filter(u => u !== userId) // toggle off RSVP
            : [...ev.rsvps, userId];
          return { ...ev, rsvps };
        }
        return ev;
      })
    }));
    get().saveDb();
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  sendNotification: (userId, title, message, type) => {
    const newNtf: Notification = {
      id: `NTF-${Math.floor(100 + Math.random() * 900)}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    set(state => ({ notifications: [newNtf, ...state.notifications] }));
    get().saveDb();
  },

  markNotificationsRead: (userId) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.userId === userId || n.userId === "all_residents" || n.userId === "all_students"
          ? { ...n, read: true }
          : n
      )
    }));
    get().saveDb();
  }
}));
