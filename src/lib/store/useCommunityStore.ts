import { create } from "zustand";
import { io } from "socket.io-client";
import { getAuthHeaders, getStoredAuthToken } from "./useAuth";
import {
  Complaint, ComplaintTimelineEntry, Visitor, VisitorStatus, UserRole, PortalType, User, Announcement, EmergencyAlert,
  GatePass, VehicleLog, IncidentReport, SocietyExpense, FlatInfo, RentRecord,
  ComplaintPriority, AiAnalysis, ComplaintChatMessage, Helper, HelperAttendance
} from "@/types";
import {
  getPrepopulatedComplaints,
  getPrepopulatedLeaveRequests,
  getPrepopulatedVisitors,
  getPrepopulatedLaundrySlots,
  getPrepopulatedParcels,
  getPrepopulatedMarketplaceItems,
  getPrepopulatedFoundItems,
  getPrepopulatedClaims,
  getPrepopulatedLostReports,
  getPrepopulatedItemMatches,
  getPrepopulatedMaintenanceBills,
  getPrepopulatedCommunityEvents,
  getPrepopulatedNotifications,
  getPrepopulatedUsers,
  getPrepopulatedEmergencies,
  getPrepopulatedGatePasses,
  getPrepopulatedVehicleLogs,
  getPrepopulatedIncidents,
  getPrepopulatedAnnouncements,
  getPrepopulatedExpenses,
  getPrepopulatedFlats,
  getPrepopulatedRentRecords,
  getPrepopulatedCollections,
  getPrepopulatedPayments,
  getPrepopulatedHelpers,
  getPrepopulatedHelperAttendance,
  getPrepopulatedFlatAttendance
} from "@/data/mock-db-seed";

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
  status: "Claim Pending Verification" | "Ready for Pickup" | "Returned" | "Rejected" | "More Evidence Required" | string;
  approvalDate?: string;
  collectionDate?: string;
  collectionTime?: string;
  collectedBy?: string;
  verifiedBySecurity?: string;
  createdAt: string;
  item?: FoundItem;
  evidence?: string;
  rejectReason?: string;
  collectionOtp?: string;
  moreEvidenceRequest?: string;
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
  status: "Pending Verification" | "Available" | "Suggested To Resident" | "Claim Requested" | "Claim Confirmed" | "Returned" | "Rejected" | "Available for Claim" | "Claim Pending Verification" | "Ready for Pickup" | "Possible Match Found" | "Owner Identified" | string;
  portal: PortalType;
  createdAt: string;
  claims?: Claim[];
  matches?: ItemMatch[];
  verification_status?: string;
  publication_status?: string;
  rejectReason?: string;
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
  status: "Pending Verification" | "Searching" | "Belonging Suggested" | "Claim Requested" | "Claim Confirmed" | "Returned" | "Closed" | "Possible Match Found" | "Matched" | "More Info Requested" | "Rejected" | string;
  images: string[];
  additionalNotes?: string;
  portal: PortalType;
  communityCode: string;
  createdAt: string;
  updatedAt?: string;
  matches?: ItemMatch[];
  residentName?: string;
  flatNumber?: string;
  verification_status?: string;
  publication_status?: string;
  rejectReason?: string;
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
  lateFee?: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  flatNumber?: string;
  contactNumber?: string;
  registeredAt: string;
  guestCount: number;
  guestNames?: string;
  rsvpStatus: string;
  paymentStatus?: "Paid" | "Free" | "Pending";
  paidAmount?: number;
  paymentMethod?: string;
}

export interface EventVolunteer {
  id: string;
  eventId: string;
  userId: string;
  volunteerName: string;
  flatNumber?: string;
  contactNumber?: string;
  role: string;
  volunteeredAt: string;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  flatNumber?: string;
  markedAt: string;
  markedBy: string;
}

export interface EventFeedback {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  suggestions?: string;
  wouldAttendSimilar: boolean;
  submittedAt: string;
}

export interface EventGalleryPhoto {
  id: string;
  eventId: string;
  imageUrl: string;
  uploadedAt: string;
}

export interface EventPollVote {
  id: string;
  pollId: string;
  userId: string;
  userName: string;
  option: string;
  votedAt: string;
}

export interface EventPoll {
  id: string;
  eventId: string;
  question: string;
  options: string[];
  status: "Open" | "Closed";
  createdAt: string;
  votes?: EventPollVote[];
}

export interface EventExpense {
  id: string;
  eventId: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
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
  rsvps: any[];
  
  category?: string;
  bannerImage?: string;
  endTime?: string;
  contactPerson?: string;
  contactNumber?: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  entryFee?: number;
  registrationFee?: "Free" | "Paid";
  eligibility?: string;
  additionalInstructions?: string;
  registrationRequired?: boolean;
  volunteerRequired?: boolean;
  visibility?: string;
  rules?: string;
  thingsToBring?: string;
  budget?: number;
  status?: string;
  createdAt?: string;

  registrations?: EventRegistration[];
  volunteers?: EventVolunteer[];
  attendance?: EventAttendance[];
  feedbacks?: EventFeedback[];
  gallery?: EventGalleryPhoto[];
  polls?: EventPoll[];
  expenses?: EventExpense[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error" | "alert";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  link?: string;
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
  claims: Claim[];
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
  serviceCategories: any[];
  workerProfiles: any[];
  workerSkills: any[];
  workerAvailability: any[];
  serviceBookings: any[];
  serviceReviews: any[];
  favoriteWorkers: any[];
  chatMessages: any[];

  createBooking: (bookingData: any) => Promise<any>;
  updateBookingStatus: (id: string, status: string, extraData?: any) => Promise<any>;
  submitReview: (reviewData: any) => Promise<any>;
  toggleFavorite: (workerId: string) => Promise<any>;
  updateAvailability: (availabilityData: any) => Promise<any>;
  sendChatMessage: (messageData: any) => Promise<any>;
  fetchChatMessages: (userId: string) => Promise<any>;
  verifyWorker: (workerId: string, data: any) => Promise<any>;
  fetchWorkerStats: () => Promise<any>;
  forwardBooking: (id: string, adminNotes: string) => Promise<any>;
  scheduleBooking: (id: string, operationalNotes: string) => Promise<any>;
  completeBooking: (id: string, notes: string) => Promise<any>;
  reviewComplaintSecretary: (id: string, data: any) => Promise<any>;
  actionComplaintManager: (id: string, data: any) => Promise<any>;
  addStaticWorker: (workerData: any) => Promise<any>;
  updateStaticWorker: (id: string, workerData: any) => Promise<any>;
  deleteStaticWorker: (id: string) => Promise<any>;

  initializeDb: () => void;
  saveDb: () => void;
  addRegisteredUser: (u: User & Record<string, any>) => Promise<void>;
  
  // Complaint Transactions
  addComplaint: (c: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "timeline">) => Promise<Complaint>;
  updateComplaintStatus: (id: string, status: Complaint["status"], details?: { by?: string; note?: string; afterPhoto?: string; priority?: ComplaintPriority }) => Promise<void>;
  assignComplaintWorker: (id: string, workerName: string, workerId: string, eta: string) => Promise<void>;
  rateComplaint: (id: string, rating: number, review?: string) => Promise<void>;
  addComplaintChatMessage: (id: string, message: Omit<ComplaintChatMessage, "id" | "timestamp">) => Promise<void>;
  mergeComplaints: (parentTicketId: string, duplicateTicketIds: string[]) => Promise<void>;
  subscribeToComplaint: (id: string, userId: string, userName: string, unit: string) => Promise<void>;
  updateComplaintEta: (id: string, eta: string) => Promise<void>;
  deleteComplaint: (id: string) => Promise<void>;

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
  registerHelper: (h: Omit<Helper, "id" | "joinedAt">) => Promise<{ helper: Helper; pass: GatePass }>;
  deleteHelper: (id: string) => Promise<void>;
  removeHelperFromFlat: (helperId: string, flatNumber: string) => Promise<void>;
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
    contactNumber?: string,
    evidence?: any
  ) => Promise<void>;
  resolveLostFoundItem: (id: string) => Promise<void>;
  verifyFoundItem: (id: string) => Promise<void>;
  verifyLostReport: (id: string) => Promise<void>;
  rejectFoundItem: (id: string) => Promise<void>;
  rejectFoundItemWithReason: (id: string, reason: string) => Promise<void>;
  rejectLostReport: (id: string, reason: string) => Promise<void>;
  requestMoreInfoLostReport: (id: string, message: string) => Promise<void>;
  editLostReport: (id: string, report: Partial<LostReport>) => Promise<void>;
  approveClaim: (claimId: string) => Promise<void>;
  rejectClaim: (claimId: string) => Promise<void>;
  rejectClaimWithReason: (claimId: string, reason: string) => Promise<void>;
  requestMoreEvidence: (claimId: string, message: string) => Promise<void>;
  provideAdditionalEvidence: (claimId: string, text: string, image?: string) => Promise<void>;
  pickupItem: (claimId: string, collectedBy: string, verifiedBySecurity: string) => Promise<void>;
  pickupItemWithOtp: (claimId: string, otp: string, collectedBy: string, verifiedBySecurity: string) => Promise<void>;
  reportLostItem: (report: Omit<LostReport, "id" | "status" | "createdAt">) => Promise<void>;
  confirmMatch: (matchId: string, verifiedBy: string) => Promise<void>;
  rejectMatch: (matchId: string) => Promise<void>;
  handoverMatchedItem: (matchId: string, collectedBy: string, verifiedBySecurity: string) => Promise<void>;
  suggestBelonging: (lostReportId: string, foundItemId: string, securityNote?: string, additionalPhoto?: string) => Promise<void>;
  claimSuggestedMatch: (matchId: string) => Promise<void>;
  rejectSuggestedMatch: (matchId: string) => Promise<void>;
  fetchLostReports: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  fetchMyClaims: () => Promise<void>;

  // Society Finance & Billing Transactions
  payMaintenanceBill: (
    id: string,
    meta?: {
      paymentMethod?: string;
      transactionId?: string;
      amount?: number;
      unit?: string;
      residentName?: string;
      month?: string;
      dueDate?: string;
    }
  ) => Promise<any>;

  // Community Events
  createEvent: (ev: any) => Promise<void>;
  updateEventDetails: (id: string, data: any) => Promise<void>;
  cancelEvent: (id: string) => Promise<void>;
  registerForEvent: (id: string, data: any) => Promise<any>;
  cancelEventRegistration: (id: string, userId: string) => Promise<void>;
  volunteerForEvent: (id: string, data: any) => Promise<void>;
  markEventAttendance: (id: string, userId: string, isAttending: boolean) => Promise<void>;
  submitEventFeedback: (id: string, data: any) => Promise<void>;
  uploadEventPhoto: (id: string, imageUrl: string) => Promise<void>;
  createEventPoll: (id: string, question: string, options: string[]) => Promise<void>;
  voteInPoll: (pollId: string, option: string) => Promise<void>;
  logEventExpense: (id: string, data: any) => Promise<void>;
  rsvpEvent: (id: string, status: string) => Promise<void>;

  // Notifications
  sendNotification: (userId: string, title: string, message: string, type: Notification["type"]) => Promise<void>;
  markNotificationsRead: (userId: string) => Promise<void>;

  // Security Operations
  raiseEmergencyAlert: (alert: Omit<EmergencyAlert, "id" | "status" | "createdAt">) => Promise<void>;
  updateEmergencyStatus: (id: string, status: EmergencyAlert["status"], notes?: string) => Promise<void>;
  issueGatePass: (pass: Omit<GatePass, "id" | "status" | "createdAt">) => Promise<GatePass>;
  revokeGatePass: (id: string) => Promise<void>;
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
  createCollection: (details: any) => Promise<any>;
  editCollection: (id: string, details: any) => Promise<any>;
  cancelCollection: (id: string) => Promise<void>;
  payPayment: (
    id: string,
    paymentMethod: string,
    meta?: {
      transactionId?: string;
      amount?: number;
      paymentType?: string;
      dueDate?: string;
      unit?: string;
      building?: string;
      description?: string;
      referenceId?: string;
      residentId?: string;
      residentName?: string;
    }
  ) => Promise<any>;
  sendPaymentReminder: (id: string) => Promise<void>;
}

const normalizeWingValue = (val?: string | null) => {
  if (!val) return "";
  const cleaned = val.trim().toLowerCase();
  const m = cleaned.match(/\bwing\s*([a-z0-9-]+)\b|\b([a-z0-9-]+)\s*wing\b/i);
  if (m) return (m[1] || m[2] || "").toLowerCase();
  return cleaned;
};

const matchesCollectionAudienceLocal = (
  visibility: string | undefined,
  applicableBuildings: string[] | undefined,
  applicableFlats: string[] | undefined,
  building?: string,
  unit?: string
) => {
  const vis = (visibility || "Everyone").trim().toLowerCase();
  if (vis === "everyone" || vis === "all residents") return true;
  if (applicableBuildings && applicableBuildings.length > 0 && building) {
    const userWing = normalizeWingValue(building);
    if (
      applicableBuildings.some(
        (b) =>
          b.trim().toLowerCase() === building.trim().toLowerCase() ||
          (userWing && normalizeWingValue(b) === userWing)
      )
    ) {
      return true;
    }
  }
  if (applicableFlats && applicableFlats.length > 0 && unit) {
    if (applicableFlats.some((f) => f.trim().toLowerCase() === unit.trim().toLowerCase())) {
      return true;
    }
  }
  return false;
};

const mergeAndDedupePayments = (dbPayments: any[], existingOrSeed: any[]): any[] => {
  const map = new Map<string, any>();
  for (const item of existingOrSeed || []) {
    if (item?.id) map.set(item.id, item);
  }
  // Authoritative Neon DB payments overwrite any matching local/seed record
  for (const item of dbPayments || []) {
    if (item?.id) map.set(item.id, item);
  }
  const merged = Array.from(map.values());
  const seenPendingMaint = new Set<string>();
  const finalList: any[] = [];
  for (const p of merged) {
    const isMaint = p.paymentType === "Maintenance" || (p.description || "").toLowerCase().includes("maintenance");
    if (isMaint && p.status?.toLowerCase() === "pending") {
      const cleanFlat = (p.unit || "").replace(/^[A-Za-z\s-]+/, "").trim();
      const cleanBldg = (p.building || "").toUpperCase().replace(/[^A-Z]/g, "") ||
                        (p.unit || "").toUpperCase().replace(/[^A-Z]/g, "");
      const unitKey = cleanFlat ? `${cleanBldg}-${cleanFlat}` : (p.residentId || p.unit || "unit");
      const dedupKey = `${unitKey}_pending_maintenance`;
      if (seenPendingMaint.has(dedupKey)) continue;
      seenPendingMaint.add(dedupKey);
    }
    finalList.push(p);
  }
  finalList.sort(
    (a, b) => new Date(b.paidDate || b.createdAt || b.dueDate || 0).getTime() - new Date(a.paidDate || a.createdAt || a.dueDate || 0).getTime()
  );
  return finalList;
};

const loadLocalOrSeed = <T>(key: string, seedFn: () => T): T => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`homeverse_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          if (key === "users") {
            const seeds = seedFn() as any[];
            const hasNewUser = parsed.some((u: any) => u.id === "user-resident-16");
            const secIn301 = parsed.some((u: any) => u.id === "user-secretary-1" && u.unit === "301");
            if (!hasNewUser || !secIn301) {
              localStorage.setItem("homeverse_users", JSON.stringify(seeds));
              return seeds as unknown as T;
            }
          }
          if (key === "helpers" || key === "attendance" || key === "flatAttendance") {
            const seeds = seedFn() as any[];
            if (parsed.length === 0 && seeds && seeds.length > 0) {
              localStorage.setItem(`homeverse_${key}`, JSON.stringify(seeds));
              return seeds as unknown as T;
            }
          }
          if (key === "flats") {
            const seeds = seedFn() as any[];
            const hasC301 = parsed.some((f: any) => f.id === "FL-C301");
            if (!hasC301 || parsed.length < seeds.length) {
              localStorage.setItem("homeverse_flats", JSON.stringify(seeds));
              return seeds as unknown as T;
            }
          }
          if (key === "collections") {
            return (Array.isArray(parsed) ? parsed : []) as unknown as T;
          }
          if (key === "payments") {
            return (Array.isArray(parsed) ? parsed : []) as unknown as T;
          }
          if (key === "maintenanceBills") {
            return (Array.isArray(parsed) ? parsed : []) as unknown as T;
          }
          if (key === "helpers") {
            const seeds = seedFn() as any[];
            const hasAllFlats = parsed.length >= 20 && parsed.some((h: any) => h.id === "HLP-126");
            const finalHelpers = hasAllFlats ? parsed : seeds;
            localStorage.setItem("homeverse_helpers", JSON.stringify(finalHelpers));
            return finalHelpers as unknown as T;
          }
          if (key === "gatePasses") {
            const seeds = seedFn() as any[];
            const hasAllPasses = parsed.length >= 20 && parsed.some((p: any) => p.id === "GP-9012");
            const finalPasses = hasAllPasses ? parsed : seeds;
            localStorage.setItem("homeverse_gatePasses", JSON.stringify(finalPasses));
            return finalPasses as unknown as T;
          }
          if (key === "complaints") {
            const cleaned = parsed.filter((c: any) => c && c.id && !/^CMP-1[5-9]\d{8,}/.test(String(c.id)));
            localStorage.setItem("homeverse_complaints", JSON.stringify(cleaned));
            return cleaned as unknown as T;
          }
          if (parsed.length > 0) {
            return parsed as unknown as T;
          }
        }
      }
    } catch (e) {}
  }
  return seedFn();
};

export const useCommunityStore = create<CommunityState>((set, get) => ({
  complaints: loadLocalOrSeed("complaints", () => [] as Complaint[]),
  leaveRequests: loadLocalOrSeed("leaveRequests", getPrepopulatedLeaveRequests),
  visitors: loadLocalOrSeed("visitors", getPrepopulatedVisitors),
  laundrySlots: loadLocalOrSeed("laundrySlots", getPrepopulatedLaundrySlots),
  parcels: loadLocalOrSeed("parcels", getPrepopulatedParcels),
  facilityBookings: [],
  marketplaceItems: loadLocalOrSeed("marketplaceItems", getPrepopulatedMarketplaceItems),
  lostFoundItems: loadLocalOrSeed("lostFoundItems", getPrepopulatedFoundItems),
  lostReports: loadLocalOrSeed("lostReports", getPrepopulatedLostReports),
  itemMatches: loadLocalOrSeed("itemMatches", getPrepopulatedItemMatches),
  claims: loadLocalOrSeed("claims", getPrepopulatedClaims),
  roomChangeRequests: [],
  maintenanceBills: loadLocalOrSeed("maintenanceBills", getPrepopulatedMaintenanceBills),
  communityEvents: loadLocalOrSeed("communityEvents", getPrepopulatedCommunityEvents),
  notifications: loadLocalOrSeed("notifications", getPrepopulatedNotifications),
  roommatePreferences: [],
  users: loadLocalOrSeed("users", getPrepopulatedUsers),
  emergencies: loadLocalOrSeed("emergencies", getPrepopulatedEmergencies),
  gatePasses: loadLocalOrSeed("gatePasses", getPrepopulatedGatePasses),
  vehicleLogs: loadLocalOrSeed("vehicleLogs", getPrepopulatedVehicleLogs),
  incidents: loadLocalOrSeed("incidents", getPrepopulatedIncidents),
  announcements: loadLocalOrSeed("announcements", getPrepopulatedAnnouncements),
  expenses: loadLocalOrSeed("expenses", getPrepopulatedExpenses),
  flats: loadLocalOrSeed("flats", getPrepopulatedFlats),
  rentRecords: loadLocalOrSeed("rentRecords", getPrepopulatedRentRecords),
  favorites: [],
  helpers: loadLocalOrSeed("helpers", getPrepopulatedHelpers),
  attendance: loadLocalOrSeed("attendance", getPrepopulatedHelperAttendance),
  flatAttendance: loadLocalOrSeed("flatAttendance", getPrepopulatedFlatAttendance),
  payments: loadLocalOrSeed("payments", getPrepopulatedPayments),
  collections: loadLocalOrSeed("collections", getPrepopulatedCollections),
  serviceCategories: [],
  workerProfiles: [],
  workerSkills: [],
  workerAvailability: [],
  serviceBookings: [],
  serviceReviews: [],
  favoriteWorkers: [],
  chatMessages: [],

  initializeDb: () => {
    if (typeof window === "undefined") return;

    // Load any localStorage data if store currently has empty arrays
    const state = get();
    const localUpdates: Partial<CommunityState> = {};

    // Load persisted collections & payments without wiping secretary special occasions or event fees
    if (typeof window !== "undefined") {
      try {
        const storedCollections = localStorage.getItem("homeverse_collections");
        if (storedCollections) {
          try {
            const parsedCollections = JSON.parse(storedCollections);
            if (Array.isArray(parsedCollections)) {
              localUpdates.collections = parsedCollections;
            }
          } catch (e) {}
        }

        const storedEvents = localStorage.getItem("homeverse_communityEvents");
        if (storedEvents) {
          try {
            const parsedEvents = JSON.parse(storedEvents);
            if (Array.isArray(parsedEvents)) {
              localUpdates.communityEvents = parsedEvents;
            }
          } catch (e) {}
        }

        // Clear all previous dummy payments and bills once to start 100% fresh
        const FRESH_PAYMENTS_KEY = "homeverse_fresh_payments_clean_2026_fresh_v2";
        if (localStorage.getItem(FRESH_PAYMENTS_KEY) !== "true") {
          localStorage.removeItem("homeverse_payments");
          localStorage.removeItem("homeverse_maintenanceBills");
          localStorage.removeItem("homeverse_collections");
          localStorage.setItem(FRESH_PAYMENTS_KEY, "true");
          fetch("/api/payments/clear-all", { method: "POST" }).catch(() => {});
        }

        const storedPayments = localStorage.getItem("homeverse_payments");
        let finalPayments: any[] = [];
        if (storedPayments) {
          try {
            const parsed = JSON.parse(storedPayments);
            if (Array.isArray(parsed)) finalPayments = parsed;
          } catch (e) {}
        }
        localUpdates.payments = finalPayments;

        const storedBills = localStorage.getItem("homeverse_maintenanceBills");
        let finalBills: any[] = [];
        if (storedBills) {
          try {
            const parsed = JSON.parse(storedBills);
            if (Array.isArray(parsed)) finalBills = parsed;
          } catch (e) {}
        }
        localUpdates.maintenanceBills = finalBills;

        localStorage.setItem("homeverse_maintenanceBills", JSON.stringify(finalBills));
        localUpdates.maintenanceBills = finalBills;

        // Ensure users and flats are updated
        const storedUsers = localStorage.getItem("homeverse_users");
        let finalUsers = getPrepopulatedUsers();
        if (storedUsers) {
          try {
            const parsed = JSON.parse(storedUsers);
            if (Array.isArray(parsed) && parsed.some((u: any) => u.id === "user-resident-16") && parsed.some((u: any) => u.id === "user-secretary-1" && u.unit === "301")) {
              finalUsers = parsed;
            }
          } catch (e) {}
        }
        localStorage.setItem("homeverse_users", JSON.stringify(finalUsers));
        localUpdates.users = finalUsers;

        const storedFlats = localStorage.getItem("homeverse_flats");
        let finalFlats = getPrepopulatedFlats();
        if (storedFlats) {
          try {
            const parsed = JSON.parse(storedFlats);
            if (Array.isArray(parsed) && parsed.some((f: any) => f.id === "FL-C301") && parsed.length >= 17) {
              finalFlats = parsed;
            }
          } catch (e) {}
        }
        localStorage.setItem("homeverse_flats", JSON.stringify(finalFlats));
        localUpdates.flats = finalFlats;

        // Ensure fresh helpers and gate passes for each flat
        const storedHelpers = localStorage.getItem("homeverse_helpers");
        let finalHelpers = getPrepopulatedHelpers();
        if (storedHelpers) {
          try {
            const parsed = JSON.parse(storedHelpers);
            if (Array.isArray(parsed) && parsed.length >= 20 && parsed.some((h: any) => h.id === "HLP-126")) {
              finalHelpers = parsed;
            }
          } catch (e) {}
        }
        localStorage.setItem("homeverse_helpers", JSON.stringify(finalHelpers));
        localUpdates.helpers = finalHelpers;

        const storedPasses = localStorage.getItem("homeverse_gatePasses");
        let finalPasses = getPrepopulatedGatePasses();
        if (storedPasses) {
          try {
            const parsed = JSON.parse(storedPasses);
            if (Array.isArray(parsed) && parsed.length >= 20 && parsed.some((p: any) => p.id === "GP-9012")) {
              finalPasses = parsed;
            }
          } catch (e) {}
        }
        localStorage.setItem("homeverse_gatePasses", JSON.stringify(finalPasses));
        localUpdates.gatePasses = finalPasses;

        const storedAtt = localStorage.getItem("homeverse_attendance");
        let finalAtt = getPrepopulatedHelperAttendance();
        if (storedAtt) {
          try {
            const parsed = JSON.parse(storedAtt);
            if (Array.isArray(parsed) && parsed.length >= 4) {
              finalAtt = parsed;
            }
          } catch (e) {}
        }
        localStorage.setItem("homeverse_attendance", JSON.stringify(finalAtt));
        localUpdates.attendance = finalAtt;

        const storedFlatAtt = localStorage.getItem("homeverse_flatAttendance");
        let finalFlatAtt = getPrepopulatedFlatAttendance();
        if (storedFlatAtt) {
          try {
            const parsed = JSON.parse(storedFlatAtt);
            if (Array.isArray(parsed) && parsed.length > 0) {
              finalFlatAtt = parsed;
            }
          } catch (e) {}
        }
        localStorage.setItem("homeverse_flatAttendance", JSON.stringify(finalFlatAtt));
        localUpdates.flatAttendance = finalFlatAtt;
      } catch (e) {}
    }

    const syncKeys = [
      "maintenanceBills", "rentRecords", "expenses",
      "complaints", "visitors", "parcels", "announcements", "users"
    ];
    for (const k of syncKeys) {
      if (!state[k as keyof CommunityState] || (state[k as keyof CommunityState] as any[]).length === 0) {
        try {
          const raw = localStorage.getItem(`homeverse_${k}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localUpdates[k as keyof CommunityState] = parsed as any;
            }
          }
        } catch (e) {}
      }
    }
    if (Object.keys(localUpdates).length > 0) {
      set(localUpdates as any);
    }

    const currentToken = getStoredAuthToken() || "";
    const alreadyInitialized = Boolean((globalThis as any).__homeverse_db_initialized);
    const tokenChanged = (globalThis as any).__homeverse_last_token !== currentToken;
    if (alreadyInitialized && !tokenChanged) return;
    (globalThis as any).__homeverse_db_initialized = true;
    (globalThis as any).__homeverse_last_token = currentToken;

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
          { key: "collections", path: "/api/payments/collections" },
          { key: "serviceCategories", path: "/api/community-services/categories" },
          { key: "workerProfiles", path: "/api/community-services/workers" },
          { key: "serviceBookings", path: "/api/community-services/bookings" },
          { key: "favoriteWorkers", path: "/api/community-services/favorites" }
        ];

        const updates: Record<string, any> = {};
        const reqInit: RequestInit = { credentials: "include", headers: getAuthHeaders() };

        await Promise.all(
          endpoints.map(async ({ key, path }) => {
            try {
              const res = await fetch(path, reqInit);
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
                if (key === "users" && Array.isArray(data)) {
                  if (typeof window !== "undefined") {
                    try {
                      const localRegs = JSON.parse(localStorage.getItem("homeverse_registered_users") || "[]");
                      const dbEmails = new Set(data.map((u: any) => u.email.toLowerCase()));
                      const uniqueLocal = localRegs.filter((u: any) => !dbEmails.has(u.email.toLowerCase()));
                      data = [...data, ...uniqueLocal];
                    } catch (e) {}
                  }
                }
                if (key === "communityEvents" && Array.isArray(data)) {
                  if (typeof window !== "undefined") {
                    try {
                      const stored = localStorage.getItem("homeverse_communityEvents");
                      if (stored) {
                        const localEvents = JSON.parse(stored);
                        if (Array.isArray(localEvents) && localEvents.length > 0) {
                          const dbIds = new Set(data.map((e: any) => e.id));
                          const uniqueLocal = localEvents.filter((e: any) => !dbIds.has(e.id));
                          data = [...data, ...uniqueLocal];
                        }
                      }
                      localStorage.setItem("homeverse_communityEvents", JSON.stringify(data));
                    } catch (e) {}
                  }
                }

                // Sort lists so recent items are always on top
                if (Array.isArray(data)) {
                  if (key === "complaints") {
                    data.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                  } else if (key === "visitors") {
                    data.sort((a: any, b: any) => {
                      const tB = new Date(b.checkInTime || b.expectedAt || b.date || 0).getTime() || 0;
                      const tA = new Date(a.checkInTime || a.expectedAt || a.date || 0).getTime() || 0;
                      return tB - tA;
                    });
                  } else if (key === "announcements" || key === "emergencies" || key === "incidents" || key === "notifications" || key === "leaveRequests") {
                    data.sort((a: any, b: any) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime());
                  } else if (key === "parcels") {
                    data.sort((a: any, b: any) => new Date(b.receivedAt || b.createdAt || 0).getTime() - new Date(a.receivedAt || a.createdAt || 0).getTime());
                  } else if (key === "attendance") {
                    data.sort((a: any, b: any) => new Date(b.checkInTime || b.date || 0).getTime() - new Date(a.checkInTime || a.date || 0).getTime());
                  } else if (key === "serviceBookings") {
                    data.sort((a: any, b: any) => new Date(b.createdAt || b.scheduledDate || 0).getTime() - new Date(a.createdAt || a.scheduledDate || 0).getTime());
                  }
                }

                if (key === "payments" && Array.isArray(data)) {
                  const baseSeeds = getPrepopulatedPayments();
                  data = mergeAndDedupePayments(data, baseSeeds);
                }

                if (Array.isArray(data) && (data.length > 0 || key === "complaints" || key === "notifications" || key === "collections" || key === "payments")) {
                  updates[key] = data;
                  if (typeof window !== "undefined") {
                    try {
                      localStorage.setItem(`homeverse_${key}`, JSON.stringify(data));
                    } catch (e) {}
                  }
                }
              }
            } catch (e) {}
          })
        );

        if (Object.keys(updates).length > 0) {
          set(updates as any);
        }
      } catch (err) {}
    };

    fetchInitialState();

    // 2. Establish Real-Time WebSocket Connection (Only once)
    if ((globalThis as any).__homeverse_listeners_active) return;
    (globalThis as any).__homeverse_listeners_active = true;

    const pollInterval = setInterval(async () => {
      if (typeof document !== "undefined" && document.hidden) return;

      const criticalEndpoints = [
        { key: "complaints", path: "/api/complaints" },
        { key: "notifications", path: "/api/notifications" },
        { key: "serviceBookings", path: "/api/community-services/bookings" },
        { key: "helpers", path: "/api/visitors/helpers" },
        { key: "attendance", path: "/api/visitors/attendance" },
        { key: "flatAttendance", path: "/api/visitors/helpers/flat-attendance" },
        { key: "payments", path: "/api/payments" },
        { key: "collections", path: "/api/payments/collections" },
        { key: "users", path: "/api/users" },
        { key: "communityEvents", path: "/api/events" }
      ];

      const batchUpdates: Record<string, any> = {};
      const pollInit: RequestInit = { credentials: "include", headers: getAuthHeaders() };

      await Promise.all(
        criticalEndpoints.map(async ({ key, path }) => {
          try {
            const res = await fetch(path, pollInit);
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
              if (Array.isArray(data)) {
                if (key === "complaints") {
                  data.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                } else if (key === "notifications") {
                  data.sort((a: any, b: any) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime());
                } else if (key === "serviceBookings") {
                  data.sort((a: any, b: any) => new Date(b.createdAt || b.scheduledDate || 0).getTime() - new Date(a.createdAt || a.scheduledDate || 0).getTime());
                } else if (key === "attendance") {
                  data.sort((a: any, b: any) => new Date(b.checkInTime || b.date || 0).getTime() - new Date(a.checkInTime || a.date || 0).getTime());
                }
              }
              if (key === "communityEvents" && Array.isArray(data)) {
                if (typeof window !== "undefined") {
                  try {
                    const stored = localStorage.getItem("homeverse_communityEvents");
                    if (stored) {
                      const localEvents = JSON.parse(stored);
                      if (Array.isArray(localEvents) && localEvents.length > 0) {
                        const dbIds = new Set(data.map((e: any) => e.id));
                        const uniqueLocal = localEvents.filter((e: any) => !dbIds.has(e.id));
                        data = [...data, ...uniqueLocal];
                      }
                    }
                    localStorage.setItem("homeverse_communityEvents", JSON.stringify(data));
                  } catch (e) {}
                }
              }
              if (key === "payments" && Array.isArray(data)) {
                const baseSeeds = getPrepopulatedPayments();
                data = mergeAndDedupePayments(data, baseSeeds);
              }
              const currentStr = JSON.stringify((get() as any)[key]);
              const nextStr = JSON.stringify(data);
              if (currentStr !== nextStr) {
                batchUpdates[key] = data;
                if ((key === "complaints" || key === "notifications" || key === "payments" || key === "collections") && typeof window !== "undefined") {
                  try { localStorage.setItem(`homeverse_${key}`, nextStr); } catch (e) {}
                }
              }
            }
          } catch (e) {}
        })
      );

      if (Object.keys(batchUpdates).length > 0) {
        set(batchUpdates as any);
      }
    }, 8000);

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

    socket.on("payment:update", (updated: any) => {
      if (!updated || !updated.id) return;
      const next = mergeAndDedupePayments([updated], get().payments || []);
      set({ payments: next });
      if (typeof window !== "undefined") {
        try { localStorage.setItem("homeverse_payments", JSON.stringify(next)); } catch (e) {}
      }
    });

    socket.on("collection:update", (updated: any) => {
      if (!updated || !updated.id) return;
      const current = get().collections || [];
      const index = current.findIndex(c => c.id === updated.id);
      const next = index > -1
        ? current.map((c, idx) => (idx === index ? updated : c))
        : [updated, ...current];
      set({ collections: next });
      if (typeof window !== "undefined") {
        try { localStorage.setItem("homeverse_collections", JSON.stringify(next)); } catch (e) {}
      }
    });

    socket.on("complaint:update", (updated: any) => {
      if (!updated || !updated.id) return;
      const current = get().complaints || [];
      const index = current.findIndex(c => c.id === updated.id);
      const next = index > -1
        ? current.map((c, idx) => (idx === index ? updated : c))
        : [updated, ...current];
      set({ complaints: next });
      if (typeof window !== "undefined") {
        try { localStorage.setItem("homeverse_complaints", JSON.stringify(next)); } catch (e) {}
      }
    });

    socket.on("complaint:delete", ({ id }: any) => {
      if (!id) return;
      const next = (get().complaints || []).filter(c => c.id !== id);
      set({ complaints: next });
      if (typeof window !== "undefined") {
        try { localStorage.setItem("homeverse_complaints", JSON.stringify(next)); } catch (e) {}
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
      if (!updated || !updated.id) return;
      const current = get().notifications || [];
      const index = current.findIndex(n => n.id === updated.id);
      const next = index > -1
        ? current.map((n, idx) => (idx === index ? updated : n))
        : [updated, ...current];
      set({ notifications: next });
      if (typeof window !== "undefined") {
        try { localStorage.setItem("homeverse_notifications", JSON.stringify(next)); } catch (e) {}
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

    socket.on("booking:update", (updated: any) => {
      const current = get().serviceBookings || [];
      const index = current.findIndex(b => b.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = updated;
        set({ serviceBookings: next });
      } else {
        set({ serviceBookings: [updated, ...current] });
      }
    });

    socket.on("message:new", (newMsg: any) => {
      const current = get().chatMessages || [];
      const index = current.findIndex(m => m.id === newMsg.id);
      if (index === -1) {
        set({ chatMessages: [...current, newMsg] });
      }
    });

    socket.on("review:update", (newReview: any) => {
      const current = get().serviceReviews || [];
      const index = current.findIndex(r => r.id === newReview.id);
      if (index === -1) {
        set({ serviceReviews: [newReview, ...current] });
      }
      fetch("/api/community-services/workers")
        .then(res => res.json())
        .then(data => set({ workerProfiles: data }))
        .catch(() => {});
    });

    socket.on("favorite:update", () => {
      fetch("/api/community-services/favorites")
        .then(res => res.json())
        .then(data => set({ favoriteWorkers: data }))
        .catch(() => {});
    });

    socket.on("worker:update", (updated: any) => {
      if (updated.deleted) {
        set({ workerProfiles: get().workerProfiles.filter(w => w.id !== updated.id) });
        return;
      }
      const current = get().workerProfiles || [];
      const index = current.findIndex(w => w.id === updated.id);
      if (index > -1) {
        const next = [...current];
        next[index] = { ...next[index], ...updated };
        set({ workerProfiles: next });
      }
    });

    socket.on("availability:update", () => {
      fetch("/api/community-services/workers")
        .then(res => res.json())
        .then(data => set({ workerProfiles: data }))
        .catch(() => {});
    });

    if (typeof window !== "undefined") {
      const handleEventsStorage = (e: StorageEvent) => {
        if (e.key === "homeverse_communityEvents" && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) {
              set({ communityEvents: parsed });
            }
          } catch (err) {}
        }
      };
      window.addEventListener("storage", handleEventsStorage);
    }
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
    const res = await fetch("/api/complaints", {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(c)
    });

    if (!res.ok) {
      let errMsg = `Failed to register complaint (HTTP ${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) errMsg = body.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const savedComplaint: Complaint = await res.json();
    set((state) => {
      const filtered = (state.complaints || []).filter((cmp) => cmp.id !== savedComplaint.id);
      const updated = [savedComplaint, ...filtered];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_complaints", JSON.stringify(updated));
        } catch (e) {}
      }
      return { complaints: updated };
    });
    return savedComplaint;
  },

  updateComplaintStatus: async (id, status, details) => {
    const res = await fetch(`/api/complaints/${id}/status`, {
      method: "PUT",
      credentials: "include",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        status,
        note: details?.note,
        by: details?.by,
        priority: details?.priority,
        afterPhoto: details?.afterPhoto
      })
    });

    if (!res.ok) {
      let errMsg = `Failed to update complaint status (HTTP ${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) errMsg = body.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const serverUpdated: Complaint = await res.json();
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => (cmp.id === id ? serverUpdated : cmp));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_complaints", JSON.stringify(updated));
        } catch (e) {}
      }
      return { complaints: updated };
    });
  },

  assignComplaintWorker: async (id, workerName, workerId, eta) => {
    const res = await fetch(`/api/complaints/${id}/assign`, {
      method: "PUT",
      credentials: "include",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ assignedTo: workerName, assignedToId: workerId, note: `Assigned ETA: ${eta}` })
    });

    if (!res.ok) {
      let errMsg = `Failed to assign worker (HTTP ${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) errMsg = body.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const serverUpdated: Complaint = await res.json();
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => (cmp.id === id ? serverUpdated : cmp));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_complaints", JSON.stringify(updated));
        } catch (e) {}
      }
      return { complaints: updated };
    });
  },

  rateComplaint: async (id, rating, review) => {
    const res = await fetch(`/api/complaints/${id}/rate`, {
      method: "PUT",
      credentials: "include",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ rating, review })
    });

    if (!res.ok) {
      let errMsg = `Failed to rate and close complaint (HTTP ${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) errMsg = body.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const serverUpdated: Complaint = await res.json();
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => (cmp.id === id ? serverUpdated : cmp));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_complaints", JSON.stringify(updated));
        } catch (e) {}
      }
      return { complaints: updated };
    });
  },

  addComplaintChatMessage: async (id, msg) => {
    const res = await fetch(`/api/complaints/${id}/chat`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ message: msg.message, senderId: msg.senderId, senderName: msg.senderName, senderRole: msg.senderRole })
    });

    if (!res.ok) {
      let errMsg = `Failed to send chat message (HTTP ${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) errMsg = body.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const savedMsg = await res.json();
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => {
        if (cmp.id === id) {
          const existing = cmp.chat || [];
          const hasMsg = existing.some((m: any) => m.id === savedMsg.id);
          return {
            ...cmp,
            chat: hasMsg ? existing : [...existing, savedMsg]
          };
        }
        return cmp;
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_complaints", JSON.stringify(updated));
        } catch (e) {}
      }
      return { complaints: updated };
    });
  },

  mergeComplaints: async (parentTicketId, duplicateTicketIds) => {
    const res = await fetch("/api/complaints/merge", {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ parentTicketId, duplicateTicketIds })
    });

    if (!res.ok) {
      let errMsg = `Failed to merge complaints (HTTP ${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) errMsg = body.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const body = await res.json();
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => {
        if (cmp.id === parentTicketId && body?.parent) {
          return body.parent;
        }
        if (duplicateTicketIds.includes(cmp.id)) {
          return { ...cmp, status: "closed" as const, parentTicketId };
        }
        return cmp;
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_complaints", JSON.stringify(updated));
        } catch (e) {}
      }
      return { complaints: updated };
    });
  },

  subscribeToComplaint: async (id, userId, userName, unit) => {
    const res = await fetch(`/api/complaints/${id}/subscribe`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ userId, userName, unit })
    });

    if (!res.ok) {
      let errMsg = `Failed to subscribe to complaint (HTTP ${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) errMsg = body.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const savedSub = await res.json();
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => {
        if (cmp.id === id) {
          const subs = cmp.subscribers || [];
          if (!subs.some((s: any) => s.userId === userId)) {
            return {
              ...cmp,
              subscribers: [...subs, { userId, name: userName || savedSub.userName, unit: unit || savedSub.unit }]
            };
          }
        }
        return cmp;
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_complaints", JSON.stringify(updated));
        } catch (e) {}
      }
      return { complaints: updated };
    });
  },

  updateComplaintEta: async (id, eta) => {
    const res = await fetch(`/api/complaints/${id}/eta`, {
      method: "PUT",
      credentials: "include",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ eta })
    });

    if (!res.ok) {
      let errMsg = `Failed to update ETA (HTTP ${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) errMsg = body.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const serverUpdated: Complaint = await res.json();
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => (cmp.id === id ? serverUpdated : cmp));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_complaints", JSON.stringify(updated));
        } catch (e) {}
      }
      return { complaints: updated };
    });
  },

  deleteComplaint: async (id) => {
    const res = await fetch(`/api/complaints/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      let errMsg = `Failed to delete complaint (HTTP ${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) errMsg = body.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    set((state) => {
      const updated = (state.complaints || []).filter((cmp) => cmp.id !== id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_complaints", JSON.stringify(updated));
        } catch (e) {}
      }
      return { complaints: updated };
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
    const id = `VIS-${Math.floor(100 + Math.random() * 900)}`;
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const newVisitor: Visitor = {
      ...v,
      id,
      otp,
      qrCode: `HOMEVERSE-PASS-${id}-${otp}`,
      status: v.status || "approved",
      date: v.date || new Date().toISOString().split("T")[0],
      expectedAt: v.expectedAt || new Date().toISOString()
    };

    set((state) => {
      const next = [newVisitor, ...(state.visitors || [])];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_visitors", JSON.stringify(next));
        } catch (e) {}
      }
      return { visitors: next };
    });

    try {
      await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVisitor)
      });
    } catch (e) {}
  },

  checkInVisitor: async (id, remarks) => {
    const timeNow = new Date().toISOString();
    set((state) => {
      let targetVisitor: Visitor | undefined;
      const nextVisitors = (state.visitors || []).map((v) => {
        if (v.id === id) {
          targetVisitor = { ...v, status: "checked-in" as const, checkInTime: timeNow, approvedBy: remarks || v.approvedBy };
          return targetVisitor;
        }
        return v;
      });

      let nextNotifications = state.notifications || [];
      if (targetVisitor) {
        const notif: Notification = {
          id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: targetVisitor.visitingResidentId || "",
          title: "Visitor Checked In at Gate",
          message: `${targetVisitor.isDelivery ? (targetVisitor.deliveryCompany || "Delivery Partner") : targetVisitor.name} has checked in at the security gate for Flat ${targetVisitor.visitingUnit}.`,
          type: "info",
          read: false,
          createdAt: timeNow,
          actionUrl: "/society/visitors"
        };
        nextNotifications = [notif, ...nextNotifications];
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_visitors", JSON.stringify(nextVisitors));
          localStorage.setItem("homeverse_notifications", JSON.stringify(nextNotifications));
        } catch (e) {}
      }

      return { visitors: nextVisitors, notifications: nextNotifications };
    });

    try {
      await fetch(`/api/visitors/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "checked-in", checkInTime: timeNow, approvedBy: remarks })
      });
    } catch (e) {}
  },

  checkOutVisitor: async (id) => {
    const timeNow = new Date().toISOString();
    set((state) => {
      let targetVisitor: Visitor | undefined;
      const nextVisitors = (state.visitors || []).map((v) => {
        if (v.id === id) {
          targetVisitor = { ...v, status: "checked-out" as const, checkOutTime: timeNow };
          return targetVisitor;
        }
        return v;
      });

      let nextNotifications = state.notifications || [];
      if (targetVisitor) {
        const notif: Notification = {
          id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: targetVisitor.visitingResidentId || "",
          title: "Visitor Checked Out",
          message: `${targetVisitor.isDelivery ? (targetVisitor.deliveryCompany || "Delivery Partner") : targetVisitor.name} has checked out from Society Premises.`,
          type: "info",
          read: false,
          createdAt: timeNow,
          actionUrl: "/society/visitors"
        };
        nextNotifications = [notif, ...nextNotifications];
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_visitors", JSON.stringify(nextVisitors));
          localStorage.setItem("homeverse_notifications", JSON.stringify(nextNotifications));
        } catch (e) {}
      }

      return { visitors: nextVisitors, notifications: nextNotifications };
    });

    try {
      await fetch(`/api/visitors/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "checked-out", checkOutTime: timeNow })
      });
    } catch (e) {}
  },

  denyVisitorEntry: async (id, reason, remarks) => {
    set((state) => {
      const nextVisitors = (state.visitors || []).map((v) =>
        v.id === id ? { ...v, status: "denied" as const, approvedBy: `${reason}: ${remarks || ""}` } : v
      );
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_visitors", JSON.stringify(nextVisitors));
        } catch (e) {}
      }
      return { visitors: nextVisitors };
    });
    try {
      await fetch(`/api/visitors/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "denied", approvedBy: `${reason}: ${remarks}` })
      });
    } catch (e) {}
  },

  cancelVisitorRequest: async (id) => {
    set((state) => {
      const nextVisitors = (state.visitors || []).map((v) =>
        v.id === id ? { ...v, status: "cancelled" as const } : v
      );
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_visitors", JSON.stringify(nextVisitors));
        } catch (e) {}
      }
      return { visitors: nextVisitors };
    });
    try {
      await fetch(`/api/visitors/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" })
      });
    } catch (e) {}
  },

  approveVisitorRequest: async (id) => {
    set((state) => {
      const nextVisitors = (state.visitors || []).map((v) =>
        v.id === id ? { ...v, status: "approved" as const } : v
      );
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_visitors", JSON.stringify(nextVisitors));
        } catch (e) {}
      }
      return { visitors: nextVisitors };
    });
    try {
      await fetch(`/api/visitors/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" })
      });
    } catch (e) {}
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
    const id = `EMG-VIS-${Date.now()}`;
    const newV: Visitor = {
      id,
      name: agency,
      phone: "112 / Emergency",
      purpose: `EMERGENCY: ${reason}`,
      vehicleNumber,
      status: "checked-in",
      visitingUnit: "All Premises",
      visitingResident: "Security Control",
      date: new Date().toISOString().split("T")[0],
      checkInTime: new Date().toISOString(),
      portal: "society"
    };
    set((state) => {
      const next = [newV, ...(state.visitors || [])];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_visitors", JSON.stringify(next));
        } catch (e) {}
      }
      return { visitors: next };
    });
    try {
      await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newV)
      });
    } catch (e) {}
  },

  registerHelper: async (h) => {
    const id = `HLP-${Date.now()}`;
    const passId = `GP-${Math.floor(1000 + Math.random() * 9000)}`;
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const flatUnit = (h.assignedFlats && h.assignedFlats[0]) || "202";
    const residentName = (h.assignedResidents && h.assignedResidents[0]) || "Resident";

    const newPass: GatePass = {
      id: passId,
      name: h.name,
      phone: h.phone || "+91 98000 00000",
      passType: h.category || "Maid",
      purpose: `${h.category || "Domestic Help"} Gate Pass`,
      validFrom: new Date().toISOString().split("T")[0],
      validTo: "Open",
      permittedDays: h.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      allowedTimings: `${h.expectedArrival || "08:00 AM"} - ${h.expectedExit || "06:00 PM"}`,
      assignedResident: residentName,
      unit: flatUnit,
      building: "A Wing",
      status: "active",
      otp,
      qrCodeData: `HOMEVERSE-PASS-${passId}-${otp}`,
      createdAt: new Date().toISOString()
    };

    const newHelper: Helper = {
      ...h,
      id,
      joinedAt: new Date().toISOString().split("T")[0],
      passId,
      passStatus: "active"
    };

    set((state) => {
      const nextHelpers = [newHelper, ...(state.helpers || [])];
      const nextPasses = [newPass, ...(state.gatePasses || [])];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_helpers", JSON.stringify(nextHelpers));
          localStorage.setItem("homeverse_gatePasses", JSON.stringify(nextPasses));
        } catch (e) {}
      }
      return { helpers: nextHelpers, gatePasses: nextPasses };
    });

    try {
      await fetch("/api/visitors/helpers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHelper)
      });
      await fetch("/api/gatepasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPass)
      });
    } catch (e) {}

    return { helper: newHelper, pass: newPass };
  },

  deleteHelper: async (id) => {
    set((state) => {
      const next = (state.helpers || []).filter(h => h.id !== id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_helpers", JSON.stringify(next));
        } catch (e) {}
      }
      return { helpers: next };
    });
    try {
      await fetch(`/api/visitors/helpers/${id}`, {
        method: "DELETE"
      });
    } catch (e) {}
  },

  removeHelperFromFlat: async (helperId: string, flatNumber: string) => {
    const cleanFlat = (flatNumber || "").replace(/^[A-Za-z\s-]+/, '').trim();
    set((state) => {
      let passIdToRevoke: string | null = null;
      const nextHelpers = (state.helpers || []).map((h) => {
        if (h.id === helperId) {
          passIdToRevoke = h.passId || null;
          const remainingFlats = (h.assignedFlats || []).filter((f) => {
            const clean = f.replace(/^[A-Za-z\s-]+/, '').trim();
            return clean !== cleanFlat && f !== flatNumber;
          });
          return {
            ...h,
            assignedFlats: remainingFlats,
            passStatus: remainingFlats.length === 0 ? ("revoked" as const) : h.passStatus
          };
        }
        return h;
      }).filter((h) => (h.assignedFlats || []).length > 0);

      let nextPasses = state.gatePasses || [];
      if (passIdToRevoke) {
        nextPasses = nextPasses.map((gp) =>
          gp.id === passIdToRevoke ? { ...gp, status: "revoked" as const } : gp
        );
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_helpers", JSON.stringify(nextHelpers));
          localStorage.setItem("homeverse_gatePasses", JSON.stringify(nextPasses));
        } catch (e) {}
      }

      return {
        helpers: nextHelpers,
        gatePasses: nextPasses
      };
    });

    try {
      await fetch(`/api/visitors/helpers/${helperId}`, {
        method: "DELETE"
      });
    } catch (e) {}
  },

  checkInHelper: async (helperId, helperName, category, gate, assignedFlats) => {
    const timeNow = new Date().toISOString();
    const todayStr = new Date().toLocaleDateString("en-CA");
    const attId = `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newAtt: HelperAttendance = {
      id: attId,
      workerId: helperId,
      workerName: helperName,
      workerCategory: category,
      date: todayStr,
      checkInTime: timeNow,
      entryGate: gate || "Society Gate",
      status: "checked-in",
      assignedFlats: assignedFlats || []
    };

    set((state) => {
      const filtered = (state.attendance || []).filter(
        (a) => a.id !== attId && !(a.workerId === helperId && a.date === todayStr && !a.checkOutTime)
      );
      const nextAtt = [newAtt, ...filtered];

      // Dispatch notifications to residents of assigned flats
      const newNotifs: Notification[] = (assignedFlats || []).map((flat) => ({
        id: `NTF-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userId: "",
        title: "Domestic Helper Checked In",
        message: `Your domestic helper ${helperName} (${category}) has checked in at ${gate || "Society Gate"} at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
        type: "info",
        read: false,
        createdAt: timeNow,
        actionUrl: "/society/helpers-entry"
      }));

      const nextNotifications = [...newNotifs, ...(state.notifications || [])];

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_attendance", JSON.stringify(nextAtt));
          localStorage.setItem("homeverse_notifications", JSON.stringify(nextNotifications));
        } catch (e) {}
      }

      return {
        attendance: nextAtt,
        notifications: nextNotifications
      };
    });

    try {
      await fetch("/api/visitors/helpers/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helperId, helperName, category, gate, assignedFlats })
      });
    } catch (e) {}
  },

  checkOutHelper: async (attendanceId, gate) => {
    const timeNow = new Date().toISOString();

    set((state) => {
      let targetAtt: HelperAttendance | undefined;
      const nextAtt = (state.attendance || []).map((a) => {
        if (a.id === attendanceId) {
          const inTime = a.checkInTime ? new Date(a.checkInTime).getTime() : Date.now();
          const duration = Math.max(1, Math.round((Date.now() - inTime) / (1000 * 60)));
          targetAtt = {
            ...a,
            status: "checked-out" as const,
            checkOutTime: timeNow,
            exitGate: gate || "Society Gate",
            duration
          };
          return targetAtt;
        }
        return a;
      });

      let nextNotifications = state.notifications || [];
      if (targetAtt) {
        const flats = targetAtt.assignedFlats || [];
        const newNotifs: Notification[] = flats.map((flat) => ({
          id: `NTF-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: "",
          title: "Domestic Helper Checked Out",
          message: `Your domestic helper ${targetAtt?.workerName} (${targetAtt?.workerCategory}) has checked out at ${gate || "Society Gate"} at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
          type: "info",
          read: false,
          createdAt: timeNow,
          actionUrl: "/society/helpers-entry"
        }));
        nextNotifications = [...newNotifs, ...nextNotifications];
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_attendance", JSON.stringify(nextAtt));
          localStorage.setItem("homeverse_notifications", JSON.stringify(nextNotifications));
        } catch (e) {}
      }

      return {
        attendance: nextAtt,
        notifications: nextNotifications
      };
    });

    try {
      await fetch("/api/visitors/helpers/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId, gate })
      });
    } catch (e) {}
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

  claimLostFoundItem: async (id, residentId, residentName, claimReason, itemDetails, proofImage, contactNumber, evidence) => {
    await fetch(`/api/lostfound/${id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ residentId, residentName, claimReason, itemDetails, proofImage, contactNumber, evidence })
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

  verifyLostReport: async (id) => {
    await fetch(`/api/lostfound/lost/${id}/verify`, {
      method: "PUT"
    });
  },

  rejectFoundItem: async (id) => {
    await fetch(`/api/lostfound/${id}/reject`, {
      method: "PUT"
    });
  },

  rejectFoundItemWithReason: async (id, reason) => {
    await fetch(`/api/lostfound/${id}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectReason: reason })
    });
  },

  rejectLostReport: async (id, reason) => {
    await fetch(`/api/lostfound/lost/${id}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectReason: reason })
    });
  },

  requestMoreInfoLostReport: async (id, message) => {
    await fetch(`/api/lostfound/lost/${id}/request-info`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectReason: message })
    });
  },

  editLostReport: async (id, report) => {
    await fetch(`/api/lostfound/lost/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report)
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

  rejectClaimWithReason: async (claimId, reason) => {
    await fetch(`/api/lostfound/claims/${claimId}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectReason: reason })
    });
  },

  requestMoreEvidence: async (claimId, message) => {
    await fetch(`/api/lostfound/claims/${claimId}/request-evidence`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
  },

  provideAdditionalEvidence: async (claimId, text, image) => {
    await fetch(`/api/lostfound/claims/${claimId}/provide-evidence`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ additionalText: text, additionalImage: image })
    });
  },

  pickupItem: async (claimId, collectedBy, verifiedBySecurity) => {
    await fetch(`/api/lostfound/claims/${claimId}/pickup`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectedBy, verifiedBySecurity })
    });
  },

  pickupItemWithOtp: async (claimId, otp, collectedBy, verifiedBySecurity) => {
    await fetch(`/api/lostfound/claims/${claimId}/pickup`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp, collectedBy, verifiedBySecurity })
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

  fetchMyClaims: async () => {
    try {
      const res = await fetch("/api/lostfound/claims");
      if (res.ok) {
        const data = await res.json();
        set({ claims: data });
      }
    } catch (e) {
      console.error(e);
    }
  },

  payMaintenanceBill: async (id, meta) => {
    const existingBill = get().maintenanceBills.find((b) => b.id === id);
    const txnId = meta?.transactionId || `TXN-BILL-${Math.floor(100000 + Math.random() * 900000)}`;
    const paymentMethod = meta?.paymentMethod || "UPI";

    let updatedBill: any = null;
    try {
      const res = await fetch(`/api/maintenance/${id}/pay`, {
        method: "PUT",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          paymentMethod,
          transactionId: txnId,
          amount: meta?.amount ?? existingBill?.amount,
          unit: meta?.unit ?? existingBill?.unit,
          residentName: meta?.residentName ?? existingBill?.residentName,
          month: meta?.month ?? existingBill?.month,
          dueDate: meta?.dueDate ?? existingBill?.dueDate
        })
      });
      if (res.ok) {
        updatedBill = await res.json();
      }
    } catch (e) {
      console.warn("Backend maintenance pay sync note:", e);
    }

    const paidDate = updatedBill?.paidOn || new Date().toISOString();

    set((state) => {
      const nextBills = state.maintenanceBills.map((b) =>
        b.id === id ? { ...b, status: "paid" as const, paidOn: paidDate } : b
      );
      const hasLinkedPayment = state.payments.some((p) => p.referenceId === id || p.id === id);
      const nextPayments = hasLinkedPayment
        ? state.payments.map((p) =>
            p.referenceId === id || p.id === id
              ? {
                  ...p,
                  status: "Paid",
                  paidDate,
                  paymentMethod,
                  transactionId: txnId,
                  receiptPath: `/receipts/${p.id}.pdf`
                }
              : p
          )
        : [
            {
              id: `PAY-${id}`,
              residentId: updatedBill?.residentId || "",
              residentName: updatedBill?.residentName || meta?.residentName || "Resident",
              unit: updatedBill?.unit || meta?.unit || "",
              building: "",
              societyId: "SUN123",
              paymentType: "Maintenance",
              description: `${updatedBill?.month || meta?.month || "Society"} Maintenance Bill`,
              amount: Number(updatedBill?.amount || meta?.amount || 4500),
              status: "Paid",
              dueDate: updatedBill?.dueDate || meta?.dueDate || paidDate.slice(0, 10),
              paidDate,
              paymentMethod,
              transactionId: txnId,
              receiptPath: `/receipts/${id}.pdf`,
              referenceId: id
            },
            ...state.payments
          ];

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_maintenanceBills", JSON.stringify(nextBills));
          localStorage.setItem("homeverse_payments", JSON.stringify(nextPayments));
        } catch (e) {}
      }
      return { maintenanceBills: nextBills, payments: nextPayments };
    });

    return updatedBill || { id, status: "paid", paidOn: paidDate };
  },

  createEvent: async (ev) => {
    const id = ev.id || `EV-${Math.floor(100 + Math.random() * 900)}`;
    const newEvent: CommunityEvent = {
      ...ev,
      id,
      status: ev.status || "Published",
      category: ev.category || "Cultural",
      priority: ev.priority || "normal",
      rsvps: ev.rsvps || [],
      registrations: ev.registrations || [],
      createdAt: new Date().toISOString()
    };

    set((state) => {
      const nextEvents = [newEvent, ...(state.communityEvents || [])];
      let nextNotifs = [...(state.notifications || [])];

      // If published, notify residents
      if (newEvent.status === "Published" || newEvent.status === "Active") {
        const residents = (state.users || []).filter((u) => u.role === "resident");
        const newNotifs = residents.map((r) => ({
          id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: r.id,
          title: "New Event Published",
          message: `🎪 "${newEvent.title}" is scheduled at ${newEvent.location} on ${newEvent.date} (${newEvent.time}). Discover & Register now!`,
          type: "info" as const,
          read: false,
          createdAt: new Date().toISOString()
        }));
        nextNotifs = [...newNotifs, ...nextNotifs];
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_communityEvents", JSON.stringify(nextEvents));
          localStorage.setItem("homeverse_notifications", JSON.stringify(nextNotifs));
          window.dispatchEvent(new Event("homeverse:events_updated"));
        } catch (e) {}
      }

      return { communityEvents: nextEvents, notifications: nextNotifs };
    });

    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent)
      });
    } catch (e) {}
  },

  updateEventDetails: async (id, data) => {
    set((state) => {
      let isCancelled = false;
      let isPublished = false;
      let isRescheduled = false;
      let eventTitle = "";
      let registeredUsers: string[] = [];

      const nextEvents = (state.communityEvents || []).map((ev) => {
        if (ev.id === id) {
          eventTitle = data.title || ev.title;
          registeredUsers = (ev.registrations || []).map((r) => r.userId);
          if (ev.status === "Draft" && (data.status === "Published" || data.status === "Active")) {
            isPublished = true;
          }
          if (data.status === "Cancelled" && ev.status !== "Cancelled") {
            isCancelled = true;
          }
          if ((data.date && data.date !== ev.date) || (data.time && data.time !== ev.time)) {
            isRescheduled = true;
          }
          return { ...ev, ...data };
        }
        return ev;
      });

      let nextNotifs = [...(state.notifications || [])];

      if (isCancelled && registeredUsers.length > 0) {
        const cancelNotifs = registeredUsers.map((uid) => ({
          id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: uid,
          title: "Event Cancelled",
          message: `⚠️ "${eventTitle}" has been cancelled by the Secretary.`,
          type: "warning" as const,
          read: false,
          createdAt: new Date().toISOString()
        }));
        nextNotifs = [...cancelNotifs, ...nextNotifs];
      } else if (isRescheduled && registeredUsers.length > 0) {
        const reschedNotifs = registeredUsers.map((uid) => ({
          id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: uid,
          title: "Event Rescheduled",
          message: `📅 "${eventTitle}" has been rescheduled to ${data.date || "new date"} at ${data.time || "new time"}.`,
          type: "warning" as const,
          read: false,
          createdAt: new Date().toISOString()
        }));
        nextNotifs = [...reschedNotifs, ...nextNotifs];
      } else if (isPublished) {
        const residents = (state.users || []).filter((u) => u.role === "resident");
        const pubNotifs = residents.map((r) => ({
          id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: r.id,
          title: "New Event Published",
          message: `🎪 "${eventTitle}" is now published and open for registrations!`,
          type: "info" as const,
          read: false,
          createdAt: new Date().toISOString()
        }));
        nextNotifs = [...pubNotifs, ...nextNotifs];
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_communityEvents", JSON.stringify(nextEvents));
          localStorage.setItem("homeverse_notifications", JSON.stringify(nextNotifs));
          window.dispatchEvent(new Event("homeverse:events_updated"));
        } catch (e) {}
      }

      return { communityEvents: nextEvents, notifications: nextNotifs };
    });

    try {
      await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } catch (e) {}
  },

  cancelEvent: async (id) => {
    await get().updateEventDetails(id, { status: "Cancelled" });
  },

  registerForEvent: async (id, data) => {
    let updatedEvent: any = null;
    try {
      const res = await fetch(`/api/events/${id}/register`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        updatedEvent = await res.json();
      }
    } catch (e) {
      console.warn("Backend event register sync note:", e);
    }

    if (!updatedEvent) {
      const existing = (get().communityEvents || []).find((ev) => ev.id === id);
      const guestCountNum = data.guestCount ? parseInt(data.guestCount) : 0;
      const newReg = {
        id: `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        eventId: id,
        userId: data.userId,
        userName: data.userName || "Resident",
        flatNumber: data.flatNumber || "A-202",
        contactNumber: data.contactNumber || "",
        registeredAt: new Date().toISOString(),
        guestCount: guestCountNum,
        guestNames: data.guestNames || "",
        rsvpStatus: data.rsvpStatus || "Going",
        paymentStatus: data.paymentStatus || (data.paidAmount > 0 ? "Paid" : "Free"),
        paidAmount: Number(data.paidAmount || 0),
        paymentMethod: data.paymentMethod || "UPI",
        transactionId: data.transactionId || null
      };
      const prevRegs = existing?.registrations || [];
      const filteredRegs = prevRegs.filter((r) => r.userId !== data.userId);
      updatedEvent = {
        ...(existing || { id, title: "Society Event", location: "Clubhouse", date: new Date().toISOString().split("T")[0] }),
        registrations: [...filteredRegs, newReg]
      };
    }

    // Refresh payments if paid event
    let serverPayments: any[] | null = null;
    if (data.paidAmount && Number(data.paidAmount) > 0) {
      try {
        const payRes = await fetch("/api/payments", { credentials: "include", headers: getAuthHeaders() });
        if (payRes.ok) serverPayments = await payRes.json();
      } catch (e) {}
    }

    set((state) => {
      const nextEvents = (state.communityEvents || []).some((ev) => ev.id === id)
        ? (state.communityEvents || []).map((ev) => (ev.id === id ? updatedEvent : ev))
        : [updatedEvent, ...(state.communityEvents || [])];

      let nextPayments = state.payments || [];
      if (serverPayments && Array.isArray(serverPayments)) {
        nextPayments = mergeAndDedupePayments(serverPayments, nextPayments);
      } else if (data.paidAmount && Number(data.paidAmount) > 0) {
        const paymentRecord = {
          id: `PAY-EVT-${id}-${data.userId}`.slice(0, 64),
          residentId: data.userId,
          residentName: data.userName || "Resident",
          unit: data.flatNumber || "",
          building: "",
          societyId: "SUN123",
          paymentType: `Event: ${updatedEvent?.title || "Society Event"}`,
          description: `Event Pass (${1 + (data.guestCount ? parseInt(data.guestCount) : 0)} pass)`,
          amount: Number(data.paidAmount),
          status: "Paid",
          dueDate: updatedEvent?.date || new Date().toISOString().split("T")[0],
          paidDate: new Date().toISOString(),
          paymentMethod: data.paymentMethod || "UPI",
          transactionId: data.transactionId || `TXN-EVT-${Math.floor(100000 + Math.random() * 900000)}`,
          receiptPath: `/receipts/EVT-${id}.pdf`,
          referenceId: id
        };
        nextPayments = mergeAndDedupePayments([paymentRecord], nextPayments);
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_communityEvents", JSON.stringify(nextEvents));
          localStorage.setItem("homeverse_payments", JSON.stringify(nextPayments));
          window.dispatchEvent(new Event("homeverse:events_updated"));
        } catch (e) {}
      }

      return { communityEvents: nextEvents, payments: nextPayments };
    });

    return updatedEvent;
  },

  cancelEventRegistration: async (id, userId) => {
    const res = await fetch(`/api/events/${id}/register`, {
      method: "DELETE",
      credentials: "include",
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to cancel registration");
    }
    const updatedEvent = await res.json().catch(() => null);

    set((state) => {
      const nextEvents = (state.communityEvents || []).map((ev) => {
        if (ev.id === id) {
          if (updatedEvent && updatedEvent.id === id) return updatedEvent;
          const filteredRegs = (ev.registrations || []).filter((r) => r.userId !== userId);
          return { ...ev, registrations: filteredRegs };
        }
        return ev;
      });

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_communityEvents", JSON.stringify(nextEvents));
          window.dispatchEvent(new Event("homeverse:events_updated"));
        } catch (e) {}
      }

      return { communityEvents: nextEvents };
    });
  },

  volunteerForEvent: async (id, data) => {
    await fetch(`/api/events/${id}/volunteer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  },

  markEventAttendance: async (id, userId, isAttending) => {
    await fetch(`/api/events/${id}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isAttending })
    });
  },

  submitEventFeedback: async (id, data) => {
    await fetch(`/api/events/${id}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  },

  uploadEventPhoto: async (id, imageUrl) => {
    await fetch(`/api/events/${id}/gallery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl })
    });
  },

  createEventPoll: async (id, question, options) => {
    await fetch(`/api/events/${id}/polls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options })
    });
  },

  voteInPoll: async (pollId, option) => {
    await fetch(`/api/events/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ option })
    });
  },

  logEventExpense: async (id, data) => {
    await fetch(`/api/events/${id}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  },

  rsvpEvent: async (id, status) => {
    await fetch(`/api/events/${id}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  },

  sendNotification: async (userId, title, message, type) => {
    await fetch("/api/notifications", {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ userId, title, message, type })
    });
  },

  markNotificationsRead: async (userId) => {
    const res = await fetch("/api/notifications/read", {
      method: "PUT",
      credentials: "include",
      headers: getAuthHeaders()
    });
    if (res.ok) {
      set((state) => {
        const next = (state.notifications || []).map((n) =>
          (!userId || n.userId === userId || n.userId === "all_residents") ? { ...n, read: true } : n
        );
        if (typeof window !== "undefined") {
          try { localStorage.setItem("homeverse_notifications", JSON.stringify(next)); } catch (e) {}
        }
        return { notifications: next };
      });
    }
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
    const id = (pass as any).id || `GP-${Math.floor(1000 + Math.random() * 9000)}`;
    const otp = (pass as any).otp || String(Math.floor(100000 + Math.random() * 900000));
    const newPass: GatePass = {
      ...pass,
      id,
      otp,
      qrCodeData: `HOMEVERSE-PASS-${id}-${otp}`,
      status: "active",
      createdAt: new Date().toISOString()
    };

    set((state) => {
      const updatedPasses = [newPass, ...(state.gatePasses || [])];

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_gatePasses", JSON.stringify(updatedPasses));
        } catch (e) {}
      }

      return {
        gatePasses: updatedPasses
      };
    });

    try {
      await fetch("/api/gatepasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPass)
      });
    } catch (e) {}
    return newPass;
  },

  revokeGatePass: async (id) => {
    set((state) => {
      const updatedPasses = (state.gatePasses || []).map((p) =>
        p.id === id ? { ...p, status: "revoked" as const } : p
      );
      const updatedHelpers = (state.helpers || []).map((h) =>
        h.passId === id ? { ...h, passStatus: "revoked" as const } : h
      );

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_gatePasses", JSON.stringify(updatedPasses));
          localStorage.setItem("homeverse_helpers", JSON.stringify(updatedHelpers));
        } catch (e) {}
      }

      return {
        gatePasses: updatedPasses,
        helpers: updatedHelpers
      };
    });

    try {
      await fetch(`/api/gatepasses/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "revoked" })
      });
    } catch (e) {}
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
    const res = await fetch(`/api/users/${userId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" })
    });
    if (res.ok) {
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? { ...u, status: "approved" } : u))
      }));
    }
  },

  rejectUser: async (userId) => {
    const res = await fetch(`/api/users/${userId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" })
    });
    if (res.ok) {
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? { ...u, status: "rejected" } : u))
      }));
    }
  },

  activateDeactivateUser: async (userId, status) => {
    const res = await fetch(`/api/users/${userId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? { ...u, status } : u))
      }));
    }
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
    const paidDate = new Date().toISOString().split("T")[0];
    set((state) => {
      const nextRent = state.rentRecords.map((r) => {
        if (r.id === id) {
          return { ...r, status: "paid" as const, paidOn: paidDate };
        }
        return r;
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_rentRecords", JSON.stringify(nextRent));
        } catch (e) {}
      }
      return { rentRecords: nextRent };
    });

    try {
      await fetch(`/api/rent/${id}/pay`, { method: "PUT" });
    } catch (e) {}
  },

  generateBulkMaintenanceBills: async (billDetails) => {
    set((state) => {
      let residents = state.users.filter((u) => u.role === "resident" && (u.portal === "society" || !u.portal));
      if (residents.length === 0 && state.flats && state.flats.length > 0) {
        residents = state.flats.map((f, idx) => ({
          id: f.residentId || `user-resident-${idx + 1}`,
          name: f.residentName || `Resident ${(f as any).flatNumber || (f as any).number || idx + 101}`,
          unit: (f as any).flatNumber || (f as any).number || `${idx + 101}`,
          building: f.building || f.wing || "A Wing",
          role: "resident",
          portal: "society"
        } as any));
      }
      const existingBills = state.maintenanceBills || [];
      const targetResidents = residents.filter((r) => {
        if (billDetails.applicableTo === "Selected Building" && billDetails.selectedBuilding) {
          return r.building === billDetails.selectedBuilding;
        }
        return true;
      }).filter((r) => !existingBills.some((eb) => (eb.residentId === r.id || eb.unit === r.unit) && eb.month === billDetails.month && eb.status === "pending"));

      const newBills = targetResidents.map((r, i) => {
        const bId = `BILL-${Date.now()}-${i + 1}`;
        return {
          id: bId,
          residentId: r.id,
          residentName: r.name,
          unit: r.unit || "",
          building: r.building || "",
          month: billDetails.month,
          amount: billDetails.amount,
          dueDate: billDetails.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
          status: "pending" as const,
          lateFee: billDetails.lateFee,
          breakdown: billDetails.breakdown || [
            { label: "Maintenance", amount: billDetails.amount }
          ]
        };
      });

      const newPayments = newBills.map((b) => ({
        id: `PAY-BILL-${b.id}`,
        residentId: b.residentId,
        residentName: b.residentName,
        unit: b.unit,
        building: b.building || "",
        societyId: "SUN123",
        paymentType: "Maintenance",
        amount: b.amount,
        status: "pending",
        dueDate: b.dueDate,
        paidDate: null,
        receiptPath: null,
        transactionId: null,
        paymentMethod: null,
        referenceId: b.id,
        createdAt: new Date().toISOString(),
        description: billDetails.description || `${billDetails.month} Maintenance Charges`,
        lateFee: b.lateFee
      }));

      const newNotifs = newBills.map((b) => ({
        id: `NTF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        userId: b.residentId,
        title: "Maintenance Bill Generated 🧾",
        message: `📢 ${billDetails.month} maintenance bill (₹${billDetails.amount.toLocaleString()}) has been dispatched. Due date: ${b.dueDate}`,
        type: "warning" as const,
        read: false,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }));

      const nextBills = [...newBills, ...state.maintenanceBills];
      const nextPayments = [...newPayments, ...state.payments];
      const nextNotifs = [...newNotifs, ...(state.notifications || [])];

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_maintenanceBills", JSON.stringify(nextBills));
          localStorage.setItem("homeverse_payments", JSON.stringify(nextPayments));
          localStorage.setItem("homeverse_notifications", JSON.stringify(nextNotifs));
        } catch (e) {}
      }

      return { maintenanceBills: nextBills, payments: nextPayments, notifications: nextNotifs };
    });

    try {
      await fetch("/api/maintenance/generate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billDetails)
      });
    } catch (e) {}
  },

  updateWorkerServices: async (workerId, details) => {
    await fetch("/api/users/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details)
    });
  },

  createCollection: async (details) => {
    const res = await fetch("/api/payments/collections", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(details)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to announce special collection");
    }
    const created = await res.json();
    const { payments: createdPayments, ...createdCollection } = created;

    set((state) => {
      const nextCollections = [
        createdCollection,
        ...state.collections.filter((c) => c.id !== createdCollection.id)
      ];

      let generatedPayments = Array.isArray(createdPayments) ? createdPayments : [];
      if (generatedPayments.length === 0) {
        const residents = state.users.filter((u) => u.role === "resident" && u.portal === "society");
        const targetResidents = residents.filter((r) =>
          matchesCollectionAudienceLocal(
            details.visibility,
            details.applicableBuildings,
            details.applicableFlats,
            r.building,
            r.unit
          )
        );
        generatedPayments = targetResidents.map((r, idx) => ({
          id: `PAY-COLL-${Date.now()}-${idx}`,
          residentId: r.id,
          residentName: r.name,
          unit: r.unit || "",
          building: r.building || "",
          societyId: "SUN123",
          paymentType: details.title,
          amount: Number(details.amount),
          status: "pending",
          dueDate: details.dueDate,
          paidDate: null,
          receiptPath: null,
          transactionId: null,
          paymentMethod: null,
          referenceId: createdCollection.id,
          createdAt: new Date().toISOString(),
          description: details.description || ""
        }));
      }

      const nextPayments = mergeAndDedupePayments(generatedPayments, state.payments);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_collections", JSON.stringify(nextCollections));
          localStorage.setItem("homeverse_payments", JSON.stringify(nextPayments));
        } catch (e) {}
      }

      return { collections: nextCollections, payments: nextPayments };
    });

    return created;
  },

  editCollection: async (id, details) => {
    const res = await fetch(`/api/payments/collections/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(details)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to update collection");
    }
    const updated = await res.json();

    set((state) => {
      const nextCollections = state.collections.map((c) => (c.id === id ? { ...c, ...updated } : c));
      const nextPayments = state.payments.map((p) => {
        if (p.referenceId === id && p.status?.toLowerCase() !== "paid") {
          return {
            ...p,
            paymentType: details.title || p.paymentType,
            amount: details.amount ? Number(details.amount) : p.amount,
            dueDate: details.dueDate || p.dueDate
          };
        }
        return p;
      });

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_collections", JSON.stringify(nextCollections));
          localStorage.setItem("homeverse_payments", JSON.stringify(nextPayments));
        } catch (e) {}
      }

      return { collections: nextCollections, payments: nextPayments };
    });

    return updated;
  },

  cancelCollection: async (id) => {
    const res = await fetch(`/api/payments/collections/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to cancel collection");
    }

    set((state) => {
      const nextCollections = state.collections.map((c) => (c.id === id ? { ...c, status: "cancelled" } : c));
      const nextPayments = state.payments.filter((p) => !(p.referenceId === id && p.status?.toLowerCase() !== "paid"));

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_collections", JSON.stringify(nextCollections));
          localStorage.setItem("homeverse_payments", JSON.stringify(nextPayments));
        } catch (e) {}
      }

      return { collections: nextCollections, payments: nextPayments };
    });
  },

  payPayment: async (id, paymentMethod, meta) => {
    const existing = get().payments.find((p) => p.id === id);
    const txnId = meta?.transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    let updatedPayment: any = null;
    try {
      const res = await fetch(`/api/payments/${id}/pay`, {
        method: "PUT",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          paymentMethod,
          transactionId: txnId,
          amount: meta?.amount ?? existing?.amount,
          paymentType: meta?.paymentType ?? existing?.paymentType,
          dueDate: meta?.dueDate ?? existing?.dueDate,
          unit: meta?.unit ?? existing?.unit,
          building: meta?.building ?? existing?.building,
          description: meta?.description ?? existing?.description,
          referenceId: meta?.referenceId ?? existing?.referenceId,
          residentId: meta?.residentId ?? existing?.residentId,
          residentName: meta?.residentName ?? existing?.residentName
        })
      });
      if (res.ok) {
        updatedPayment = await res.json();
      }
    } catch (e) {
      console.warn("Backend payment update failed, continuing with store update:", e);
    }

    const paidDate = updatedPayment?.paidDate || new Date().toISOString();
    const resolvedTxn = updatedPayment?.transactionId || txnId;
    const resolvedMethod = updatedPayment?.paymentMethod || paymentMethod || "UPI";

    set((state) => {
      const refBillId = updatedPayment?.referenceId || existing?.referenceId || meta?.referenceId || null;
      const paymentItem = updatedPayment || {
        id,
        residentId: meta?.residentId || existing?.residentId || "",
        residentName: meta?.residentName || existing?.residentName || "Resident",
        unit: meta?.unit || existing?.unit || "",
        building: meta?.building || existing?.building || "",
        societyId: "SUN123",
        paymentType: meta?.paymentType || existing?.paymentType || "Maintenance",
        description: meta?.description || existing?.description || "Monthly Society Maintenance",
        amount: Number(meta?.amount || existing?.amount || 4500),
        status: "Paid",
        dueDate: meta?.dueDate || existing?.dueDate || paidDate.slice(0, 10),
        paidDate,
        transactionId: resolvedTxn,
        paymentMethod: resolvedMethod,
        receiptPath: `/receipts/${id}.pdf`,
        referenceId: refBillId || id
      };

      const nextPayments = mergeAndDedupePayments([paymentItem], state.payments);

      let nextBills = state.maintenanceBills;
      if (refBillId) {
        nextBills = state.maintenanceBills.map((b) =>
          b.id === refBillId || b.id === id ? { ...b, status: "paid" as const, paidOn: paidDate.slice(0, 10) } : b
        );
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_payments", JSON.stringify(nextPayments));
          localStorage.setItem("homeverse_maintenanceBills", JSON.stringify(nextBills));
        } catch (e) {}
      }

      return { payments: nextPayments, maintenanceBills: nextBills };
    });

    return updatedPayment || { id, status: "Paid", transactionId: resolvedTxn };
  },

  sendPaymentReminder: async (id) => {
    const res = await fetch(`/api/payments/${id}/remind`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to send reminder");
    }
  },

  createBooking: async (bookingData: any) => {
    const res = await fetch("/api/community-services/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    throw new Error("Failed to create booking");
  },

  updateBookingStatus: async (id: string, status: string, extraData?: any) => {
    const res = await fetch(`/api/community-services/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extraData })
    });
    if (res.ok) {
      const data = await res.json();
      set((state) => ({
        serviceBookings: state.serviceBookings.map((b) => (b.id === id ? data : b))
      }));
      return data;
    }
    throw new Error("Failed to update booking status");
  },

  submitReview: async (reviewData: any) => {
    const res = await fetch("/api/community-services/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData)
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    throw new Error("Failed to submit review");
  },

  toggleFavorite: async (workerId: string) => {
    const res = await fetch("/api/community-services/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerId })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    throw new Error("Failed to toggle favorite");
  },

  updateAvailability: async (availabilityData: any) => {
    const res = await fetch("/api/community-services/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(availabilityData)
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    throw new Error("Failed to update availability");
  },

  sendChatMessage: async (messageData: any) => {
    const res = await fetch("/api/community-services/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData)
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    throw new Error("Failed to send message");
  },

  fetchChatMessages: async (userId: string) => {
    const res = await fetch(`/api/community-services/messages/${userId}`);
    if (res.ok) {
      const data = await res.json();
      set({ chatMessages: data });
      return data;
    }
    throw new Error("Failed to fetch messages");
  },

  verifyWorker: async (workerId: string, data: any) => {
    const res = await fetch(`/api/community-services/workers/${workerId}/verify`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const result = await res.json();
      set((state) => {
        const nextUsers = state.users.map((u) => {
          if (u.id === workerId) {
            return {
              ...u,
              status: (data.approve ? "approved" : data.remove ? "rejected" : u.status) as any
            };
          }
          return u;
        }).filter(u => (u.status as string) !== "removed");

        const nextProfiles = state.workerProfiles.map((p) => {
          if (p.workerId === workerId || p.id === workerId) {
            return {
              ...p,
              isSocietyVerified: data.isSocietyVerified !== undefined ? data.isSocietyVerified : p.isSocietyVerified,
              isPoliceVerified: data.isPoliceVerified !== undefined ? data.isPoliceVerified : p.isPoliceVerified,
            };
          }
          return p;
        });

        return { users: nextUsers, workerProfiles: nextProfiles } as any;
      });
      return result;
    }
    throw new Error("Failed to verify worker");
  },

  fetchWorkerStats: async () => {
    const res = await fetch("/api/community-services/stats");
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    throw new Error("Failed to fetch stats");
  },

  forwardBooking: async (id, adminNotes) => {
    const res = await fetch(`/api/community-services/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Forwarded to Manager", adminNotes, forwardedToManager: true })
    });
    if (res.ok) {
      const data = await res.json();
      set((state) => ({
        serviceBookings: state.serviceBookings.map((b) => (b.id === id ? data : b))
      }));
      return data;
    }
    throw new Error("Failed to forward booking");
  },

  scheduleBooking: async (id, operationalNotes) => {
    const res = await fetch(`/api/community-services/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Scheduled", operationalNotes })
    });
    if (res.ok) {
      const data = await res.json();
      set((state) => ({
        serviceBookings: state.serviceBookings.map((b) => (b.id === id ? data : b))
      }));
      return data;
    }
    throw new Error("Failed to schedule booking");
  },

  completeBooking: async (id, notes) => {
    const res = await fetch(`/api/community-services/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Completed", operationalNotes: notes })
    });
    if (res.ok) {
      const data = await res.json();
      set((state) => ({
        serviceBookings: state.serviceBookings.map((b) => (b.id === id ? data : b))
      }));
      return data;
    }
    throw new Error("Failed to complete booking");
  },

  reviewComplaintSecretary: async (id, data) => {
    let updated: any = null;
    try {
      const res = await fetch(`/api/complaints/${id}/secretary-review`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (res.ok) {
        updated = await res.json();
      }
    } catch (e) {
      console.warn("Backend secretary review error:", e);
    }

    const now = new Date().toISOString();
    const nextStatus = data.status || "Forwarded to Manager";

    set((state) => {
      const existing = state.complaints.find((c) => c.id === id);
      const resolvedUpdated = updated || {
        ...(existing || {}),
        id,
        status: nextStatus,
        priority: data.priority || existing?.priority || "medium",
        category: data.category || existing?.category || "General",
        department: data.department || existing?.department || "Operations",
        adminNotes: data.adminNotes || existing?.adminNotes || "",
        forwardedAt: nextStatus === "Rejected" ? undefined : now,
        forwardedByName: "Rahul Verma",
        rejectedAt: nextStatus === "Rejected" ? now : undefined,
        rejectReason: nextStatus === "Rejected" ? data.adminNotes : undefined,
        timeline: [
          ...(existing?.timeline || []),
          {
            id: `TL-${Date.now()}`,
            status: nextStatus,
            timestamp: now,
            note: data.adminNotes || (nextStatus === "Rejected" ? "Rejected by Secretary." : "Forwarded to Operations Manager by Secretary."),
            by: "Rahul Verma"
          }
        ]
      };
      const next = state.complaints.map((c) => (c.id === id ? { ...c, ...resolvedUpdated } : c));
      if (typeof window !== "undefined") {
        try { localStorage.setItem("homeverse_complaints", JSON.stringify(next)); } catch (e) {}
      }
      return { complaints: next };
    });

    return updated || { id, status: nextStatus };
  },

  actionComplaintManager: async (id, data) => {
    let updated: any = null;
    try {
      const res = await fetch(`/api/complaints/${id}/manager-action`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (res.ok) {
        updated = await res.json();
      }
    } catch (e) {
      console.warn("Backend manager action error:", e);
    }

    const now = new Date().toISOString();
    const nextStatus = data.status || "In Progress";

    set((state) => {
      const existing = state.complaints.find((c) => c.id === id);
      const resolvedUpdated = updated || {
        ...(existing || {}),
        id,
        status: nextStatus,
        assignedTo: data.assignedTo || existing?.assignedTo,
        assignedToId: data.assignedToId || existing?.assignedToId,
        expectedArrival: data.expectedArrival || existing?.expectedArrival,
        operationalNotes: data.operationalNotes || existing?.operationalNotes,
        timeline: [
          ...(existing?.timeline || []),
          {
            id: `TL-${Date.now()}`,
            status: nextStatus,
            timestamp: now,
            note: data.operationalNotes || `Status updated to ${nextStatus} by Manager.`,
            by: "Manager"
          }
        ]
      };
      const next = state.complaints.map((c) => (c.id === id ? { ...c, ...resolvedUpdated } : c));
      if (typeof window !== "undefined") {
        try { localStorage.setItem("homeverse_complaints", JSON.stringify(next)); } catch (e) {}
      }
      return { complaints: next };
    });

    return updated || { id, status: nextStatus };
  },

  addStaticWorker: async (workerData) => {
    const res = await fetch("/api/community-services/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workerData)
    });
    if (res.ok) {
      const data = await res.json();
      set((state) => ({
        users: [...state.users, data.user as any],
        workerProfiles: [...state.workerProfiles, data.profile as any]
      }));
      return data;
    }
    throw new Error("Failed to add worker");
  },

  updateStaticWorker: async (id, workerData) => {
    const res = await fetch(`/api/community-services/workers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workerData)
    });
    if (res.ok) {
      const data = await res.json();
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? data.user as any : u)),
        workerProfiles: state.workerProfiles.map((p) => (p.workerId === id || p.id === id ? data.profile as any : p))
      }));
      return data;
    }
    throw new Error("Failed to update worker");
  },

  deleteStaticWorker: async (id) => {
    const res = await fetch(`/api/community-services/workers/${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      const data = await res.json();
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        workerProfiles: state.workerProfiles.filter((p) => p.workerId !== id && p.id !== id)
      }));
      return data;
    }
    throw new Error("Failed to delete worker");
  }
}));
