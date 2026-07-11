"use client";

import { create } from "zustand";
import {
  Complaint, Visitor, UserRole, PortalType, User, Announcement, EmergencyAlert,
  GatePass, VehicleLog, IncidentReport, SocietyExpense, FlatInfo, RentRecord,
  ComplaintPriority, AiAnalysis, ComplaintChatMessage
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
  rateComplaint: (id: string, rating: number, review?: string) => Promise<void>;
  addComplaintChatMessage: (id: string, message: Omit<ComplaintChatMessage, "id" | "timestamp">) => Promise<void>;
  mergeComplaints: (parentTicketId: string, duplicateTicketIds: string[]) => Promise<void>;
  subscribeToComplaint: (id: string, userId: string, userName: string, unit: string) => Promise<void>;
  updateComplaintEta: (id: string, eta: string) => Promise<void>;

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

        const userDocRef = doc(db, "users", firebaseUser.uid);
        getDoc(userDocRef).then((userDoc) => {
          const isSec = userDoc.exists() && userDoc.data()?.role === "secretary";

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
            { key: "flats", coll: "flats" },
            { key: "rentRecords", coll: "rentRecords" }
          ];

          if (isSec) {
            collectionsToListen.push({ key: "expenses", coll: "expenses" });
          }

          if ((globalThis as any).__homeverse_unsubscribers) {
            (globalThis as any).__homeverse_unsubscribers.forEach((unsub: any) => unsub());
          }

          (globalThis as any).__homeverse_unsubscribers = collectionsToListen.map(({ key, coll }) => {
            return onSnapshot(collection(db, coll), (snapshot) => {
              const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
              set({ [key]: list } as any);
            });
          });
        }).catch((err) => {
          console.error("Error setting up Firestore snapshot listeners:", err);
          (globalThis as any).__homeverse_listeners_active = false;
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
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const id = `COMP-${year}-${rand}`;
    
    // AI Analysis Simulation
    const titleAndDesc = `${c.title} ${c.description}`.toLowerCase();
    
    // Predict priority
    let predictedPriority: ComplaintPriority = c.priority || 'medium';
    if (c.emergency || (titleAndDesc.includes("leak") && (titleAndDesc.includes("gas") || titleAndDesc.includes("water enter"))) || titleAndDesc.includes("trapped")) {
      predictedPriority = 'emergency';
    } else if (titleAndDesc.includes("spark") || titleAndDesc.includes("fire") || titleAndDesc.includes("theft") || titleAndDesc.includes("short circuit")) {
      predictedPriority = 'critical';
    } else if (titleAndDesc.includes("broken") || titleAndDesc.includes("not working") || titleAndDesc.includes("stolen")) {
      predictedPriority = 'high';
    }

    // Predict category if not supplied or for suggestion
    let suggestedCategory = c.category || 'others';
    if (titleAndDesc.includes("leak") || titleAndDesc.includes("pipe") || titleAndDesc.includes("tap") || titleAndDesc.includes("dripping")) {
      suggestedCategory = 'water-leakage';
    } else if (titleAndDesc.includes("wire") || titleAndDesc.includes("spark") || titleAndDesc.includes("mcb") || titleAndDesc.includes("fan") || titleAndDesc.includes("light") || titleAndDesc.includes("short")) {
      suggestedCategory = 'electrical';
    } else if (titleAndDesc.includes("lift") || titleAndDesc.includes("elevator") || titleAndDesc.includes("stuck") || titleAndDesc.includes("trapped")) {
      suggestedCategory = 'lift';
    } else if (titleAndDesc.includes("park") || titleAndDesc.includes("car") || titleAndDesc.includes("vehicle") || titleAndDesc.includes("double park")) {
      suggestedCategory = 'parking';
    } else if (titleAndDesc.includes("cleaning") || titleAndDesc.includes("dirt") || titleAndDesc.includes("dust") || titleAndDesc.includes("sweep")) {
      suggestedCategory = 'cleaning';
    } else if (titleAndDesc.includes("guard") || titleAndDesc.includes("gate") || titleAndDesc.includes("suspicious") || titleAndDesc.includes("theft")) {
      suggestedCategory = 'security';
    }
    
    // Predict required materials & cost
    let requiredMaterials: string[] = ["Standard inspection kit"];
    let expectedCost = "₹200 - ₹500";
    if (suggestedCategory === 'plumbing' || suggestedCategory === 'water-leakage') {
      requiredMaterials = ["PVC replacement pipe", "Teflon sealing tape", "Silicone thread sealant", "Pipe wrench", "Coupling joints"];
      expectedCost = "₹450 - ₹1,200";
    } else if (suggestedCategory === 'electrical') {
      requiredMaterials = ["Insulated screwdriver set", "Replacement 16A MCB", "Wire strippers", "Electrical insulation tape", "Digital multimeter"];
      expectedCost = "₹350 - ₹950";
    } else if (suggestedCategory === 'lift') {
      requiredMaterials = ["Elevator guide rail lubrication", "Safety brake cleaner", "Control panel spare fuses", "Intercom contact kit"];
      expectedCost = "₹2,500 - ₹6,500";
    } else if (suggestedCategory === 'cleaning' || suggestedCategory === 'housekeeping') {
      requiredMaterials = ["Premium floor disinfectant", "Microfiber cleaning cloths", "High-reach duster", "Heavy-duty broom & mop set"];
      expectedCost = "₹150 - ₹300";
    } else if (suggestedCategory === 'pest-control') {
      requiredMaterials = ["Organic gel pesticides", "Handheld sprayer", "Aerosol sprayers", "Rodent snap traps", "Protective safety gear"];
      expectedCost = "₹800 - ₹1,800";
    }

    // Predict estimated completion
    let estimatedCompletion = "24 Hours";
    if (predictedPriority === 'emergency') {
      estimatedCompletion = "2 Hours";
    } else if (predictedPriority === 'critical') {
      estimatedCompletion = "4 Hours";
    } else if (predictedPriority === 'high') {
      estimatedCompletion = "12 Hours";
    }

    // Duplicate detection
    const existingComplaints = get().complaints || [];
    const duplicateMatch = existingComplaints.find(comp => 
      comp.status !== 'closed' &&
      comp.category === c.category &&
      comp.building === c.building &&
      (comp.wing === c.wing || !c.wing || !comp.wing) &&
      (comp.title.toLowerCase().includes(c.title.toLowerCase()) || 
       c.title.toLowerCase().includes(comp.title.toLowerCase()) ||
       comp.description.toLowerCase().includes(c.description.toLowerCase()))
    );

    const aiAnalysis: AiAnalysis = {
      predictedPriority,
      suggestedCategory,
      estimatedCompletion,
      requiredMaterials,
      expectedCost,
      possibleDuplicateOf: duplicateMatch ? duplicateMatch.id : undefined,
      isDuplicate: duplicateMatch ? true : false
    };

    const newComplaint: Complaint = {
      ...c,
      id,
      priority: predictedPriority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { status: "submitted", timestamp: new Date().toISOString(), note: "Complaint registered successfully and AI diagnostics compiled." }
      ],
      chat: [],
      aiAnalysis
    };

    await setDoc(doc(db, "complaints", id), newComplaint);

    // If duplicate was found, automatically append to the parent's group
    if (duplicateMatch) {
      const parentDoc = await getDoc(doc(db, "complaints", duplicateMatch.id));
      if (parentDoc.exists()) {
        const parentData = parentDoc.data() as Complaint;
        const currentGroup = parentData.duplicateGroup || [];
        if (!currentGroup.includes(id)) {
          await updateDoc(doc(db, "complaints", duplicateMatch.id), {
            duplicateGroup: [...currentGroup, id]
          });
        }
      }
    }

    const title = `New Ticket Raised 📋`;
    const message = `Unit ${c.unit} raised ticket: "${c.title}"`;
    await get().sendNotification("all_residents", title, message, "info");
  },

  updateComplaintStatus: async (id, status, details) => {
    const compDoc = await getDoc(doc(db, "complaints", id));
    if (!compDoc.exists()) return;
    const comp = compDoc.data() as Complaint;
    const newTimeline = [...(comp.timeline || [])];
    
    const timestamp = new Date().toISOString();
    newTimeline.push({
      status,
      timestamp,
      note: details?.note || `Status updated to ${status}.`,
      by: details?.by,
      afterPhoto: details?.afterPhoto
    });
    
    const updates: Partial<Complaint> = {
      status,
      updatedAt: timestamp,
      timeline: newTimeline
    };
    if (details?.afterPhoto) {
      updates.afterPhoto = details.afterPhoto;
      updates.completionPhotos = [...(comp.completionPhotos || []), details.afterPhoto];
    }
    
    await updateDoc(doc(db, "complaints", id), updates);

    // Notifications
    let residentMsg = "";
    let secretaryMsg = "";
    let workerMsg = "";

    if (status === "under-review") {
      residentMsg = `Your ticket "${comp.title}" is now Under Review.`;
      secretaryMsg = `Ticket ${id} is under review.`;
    } else if (status === "accepted") {
      residentMsg = `Worker ${comp.assignedTo || "assigned"} has accepted your ticket: "${comp.title}".`;
      secretaryMsg = `Worker accepted ticket ${id}.`;
    } else if (status === "in-progress") {
      residentMsg = `Work has started on your ticket: "${comp.title}".`;
      secretaryMsg = `Worker started work on ticket ${id}.`;
    } else if (status === "completed") {
      residentMsg = `Worker marked your ticket "${comp.title}" as completed. Please verify!`;
      secretaryMsg = `Worker completed ticket ${id}, pending resident verification.`;
    } else if (status === "resolved") {
      residentMsg = `Ticket "${comp.title}" has been resolved.`;
      secretaryMsg = `Ticket ${id} has been resolved.`;
    } else if (status === "resident-verification") {
      residentMsg = `Please verify resolution of ticket: "${comp.title}".`;
      secretaryMsg = `Resident verification pending for ${id}.`;
    } else if (status === "closed") {
      residentMsg = `Your ticket "${comp.title}" is now Closed. Thank you!`;
      secretaryMsg = `Ticket ${id} is closed.`;
      if (comp.assignedToId) {
        workerMsg = `Ticket ${id} has been closed by resident.`;
      }
    }

    if (residentMsg) {
      await get().sendNotification(comp.raisedBy, `Ticket Update ⚙️`, residentMsg, "info");
    }
    if (secretaryMsg) {
      const secretaryUser = get().users.find(u => u.role === "secretary");
      const targetSecId = secretaryUser?.id || "user-secretary-1";
      await get().sendNotification(targetSecId, `Ticket Status Alert 📋`, secretaryMsg, "info");
    }
    if (workerMsg && comp.assignedToId) {
      await get().sendNotification(comp.assignedToId, `Job Closed 🛠️`, workerMsg, "success");
    }
  },

  assignComplaintWorker: async (id, workerName, workerId, eta) => {
    const updates = {
      assignedTo: `${workerName} (ETA: ${eta})`,
      assignedToId: workerId,
      estimatedArrival: eta,
      status: "assigned" as const,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(doc(db, "complaints", id), updates);
    
    // Notify worker
    await get().sendNotification(
      workerId,
      `New Job Assigned 🛠️`,
      `You have been assigned: "${id}". Please review ETA.`,
      "info"
    );

    // Notify resident
    const compDoc = await getDoc(doc(db, "complaints", id));
    if (compDoc.exists()) {
      const comp = compDoc.data() as Complaint;
      await get().sendNotification(
        comp.raisedBy,
        `Contractor Assigned 🛠️`,
        `${workerName} has been assigned to ticket "${comp.title}". ETA: ${eta}`,
        "info"
      );
    }
  },

  rateComplaint: async (id, rating, review) => {
    const compDoc = await getDoc(doc(db, "complaints", id));
    if (!compDoc.exists()) return;
    const comp = compDoc.data() as Complaint;
    
    const timestamp = new Date().toISOString();
    const newTimeline = [...(comp.timeline || [])];
    newTimeline.push({
      status: "closed",
      timestamp,
      note: `Resident closed the ticket and rated it ${rating} stars. Review: ${review || "No review left."}`,
      by: comp.raisedByName
    });

    await updateDoc(doc(db, "complaints", id), {
      rating,
      ratingReview: review || "",
      status: "closed",
      updatedAt: timestamp,
      timeline: newTimeline
    });

    // Update worker rating if worker is assigned
    if (comp.assignedToId) {
      const workerId = comp.assignedToId;
      const allComplaints = get().complaints || [];
      const ratedComplaints = allComplaints.filter(c => 
        c.assignedToId === workerId && 
        c.id !== id && 
        typeof c.rating === "number"
      );
      
      const ratings = ratedComplaints.map(c => c.rating as number);
      ratings.push(rating);
      
      const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      
      await updateDoc(doc(db, "users", workerId), {
        rating: Number(averageRating.toFixed(2))
      });
    }

    const secretaryUser = get().users.find(u => u.role === "secretary");
    const targetSecId = secretaryUser?.id || "user-secretary-1";
    await get().sendNotification(
      targetSecId, 
      `Ticket Closed & Rated ⭐`, 
      `Ticket ${id} closed. Rated ${rating} stars by ${comp.raisedByName}.`, 
      "success"
    );

    if (comp.assignedToId) {
      await get().sendNotification(
        comp.assignedToId,
        `Job Rated ⭐`,
        `Your job ${id} was rated ${rating} stars.`,
        "success"
      );
    }
  },

  addComplaintChatMessage: async (id, msg) => {
    const compDoc = await getDoc(doc(db, "complaints", id));
    if (!compDoc.exists()) return;
    const comp = compDoc.data() as Complaint;
    const chat = comp.chat || [];
    
    const newMsg: ComplaintChatMessage = {
      ...msg,
      id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString()
    };

    const senderLabel = msg.senderRole === "resident" ? "Resident" : msg.senderRole === "worker" ? "Worker" : "Secretary";
    const timelineEntry = {
      status: comp.status,
      timestamp: new Date().toISOString(),
      note: `${senderLabel} Sent Message: "${msg.message.substring(0, 40)}${msg.message.length > 40 ? '...' : ''}"`,
      by: msg.senderName
    };
    const newTimeline = [...(comp.timeline || []), timelineEntry];
    
    await updateDoc(doc(db, "complaints", id), {
      chat: [...chat, newMsg],
      timeline: newTimeline,
      updatedAt: new Date().toISOString()
    });
  },

  mergeComplaints: async (parentTicketId, duplicateTicketIds) => {
    const parentDoc = await getDoc(doc(db, "complaints", parentTicketId));
    if (!parentDoc.exists()) return;
    const parentData = parentDoc.data() as Complaint;
    const currentGroup = parentData.duplicateGroup || [];
    
    const newGroup = Array.from(new Set([...currentGroup, ...duplicateTicketIds]));
    await updateDoc(doc(db, "complaints", parentTicketId), {
      duplicateGroup: newGroup,
      updatedAt: new Date().toISOString()
    });

    for (const childId of duplicateTicketIds) {
      const childDoc = await getDoc(doc(db, "complaints", childId));
      if (childDoc.exists()) {
        const childData = childDoc.data() as Complaint;
        const newTimeline = [...(childData.timeline || [])];
        newTimeline.push({
          status: "closed",
          timestamp: new Date().toISOString(),
          note: `Ticket merged into parent ticket ${parentTicketId} as duplicate.`,
          by: "Secretary"
        });
        await updateDoc(doc(db, "complaints", childId), {
          parentTicketId,
          status: "closed",
          timeline: newTimeline,
          updatedAt: new Date().toISOString()
        });
      }
    }
  },

  subscribeToComplaint: async (id, userId, userName, unit) => {
    const compDoc = await getDoc(doc(db, "complaints", id));
    if (!compDoc.exists()) return;
    const comp = compDoc.data() as Complaint;
    const currentSubs = comp.subscribers || [];
    if (currentSubs.find(s => s.userId === userId)) return; // already subscribed

    const updatedSubs = [...currentSubs, { userId, name: userName, unit }];
    const newTimeline = [...(comp.timeline || [])];
    newTimeline.push({
      status: comp.status,
      timestamp: new Date().toISOString(),
      note: `Resident ${userName} (Flat ${unit}) joined this common issue.`,
      by: userName
    });

    await updateDoc(doc(db, "complaints", id), {
      subscribers: updatedSubs,
      timeline: newTimeline,
      updatedAt: new Date().toISOString()
    });
  },

  updateComplaintEta: async (id, eta) => {
    const compDoc = await getDoc(doc(db, "complaints", id));
    if (!compDoc.exists()) return;
    const comp = compDoc.data() as Complaint;
    
    const newTimeline = [...(comp.timeline || [])];
    newTimeline.push({
      status: comp.status,
      timestamp: new Date().toISOString(),
      note: `Worker updated Estimated Arrival Time (ETA) to: ${eta}`,
      by: comp.assignedTo || "Worker"
    });

    await updateDoc(doc(db, "complaints", id), {
      estimatedArrival: eta,
      timeline: newTimeline,
      updatedAt: new Date().toISOString()
    });

    // Notify resident
    await get().sendNotification(
      comp.raisedBy,
      `ETA Update ⚙️`,
      `Worker has updated the ETA for your ticket "${comp.title}" to: ${eta}`,
      "info"
    );
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
