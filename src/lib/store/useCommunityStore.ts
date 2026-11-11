import { create } from "zustand";
import { io } from "socket.io-client";
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
  payMaintenanceBill: (id: string) => Promise<void>;

  // Community Events
  createEvent: (ev: any) => Promise<void>;
  updateEventDetails: (id: string, data: any) => Promise<void>;
  cancelEvent: (id: string) => Promise<void>;
  registerForEvent: (id: string, data: any) => Promise<void>;
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
  createCollection: (details: any) => Promise<void>;
  editCollection: (id: string, details: any) => Promise<void>;
  cancelCollection: (id: string) => Promise<void>;
  payPayment: (id: string, paymentMethod: string) => Promise<void>;
  sendPaymentReminder: (id: string) => Promise<void>;
}

const loadLocalOrSeed = <T>(key: string, seedFn: () => T): T => {
  if (typeof window !== "undefined") {
    try {
      if (key === "collections") {
        localStorage.removeItem("homeverse_collections");
        return [] as unknown as T;
      }
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
            localStorage.removeItem("homeverse_collections");
            return [] as unknown as T;
          }
          if (key === "payments") {
            const seeds = seedFn() as any[];
            const source = (Array.isArray(parsed) && parsed.length >= 100) ? parsed : seeds;
            const sanitized = source.map((p: any) => {
              const isOct = p.id?.includes("OCT") || (p.description || "").includes("October 2026") || (p.dueDate && p.dueDate.startsWith("2026-10"));
              if (isOct && p.paymentType === "Maintenance") {
                return p.status === "paid" ? p : { ...p, status: "pending" };
              }
              return { ...p, status: "paid" };
            });
            localStorage.setItem("homeverse_payments", JSON.stringify(sanitized));
            return sanitized as unknown as T;
          }
          if (key === "maintenanceBills") {
            const seeds = seedFn() as any[];
            const source = (Array.isArray(parsed) && parsed.length >= 17) ? parsed : seeds;
            const sanitized = source.map((b: any) => {
              if (b.month === "October 2026" || b.id?.includes("OCT")) {
                return b.status === "paid" ? b : { ...b, status: "pending" };
              }
              return { ...b, status: "paid" };
            });
            localStorage.setItem("homeverse_maintenanceBills", JSON.stringify(sanitized));
            return sanitized as unknown as T;
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
  complaints: loadLocalOrSeed("complaints", getPrepopulatedComplaints),
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

    // Purge legacy special occasion payments/collections and ensure October bills are active
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("homeverse_collections");
        localUpdates.collections = [];

        const storedPayments = localStorage.getItem("homeverse_payments");
        let finalPayments = getPrepopulatedPayments();
        if (storedPayments) {
          try {
            const parsed = JSON.parse(storedPayments);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.filter(
                (p: any) =>
                  (p.paymentType === "Maintenance" ||
                   p.paymentType?.includes("Ganesh") ||
                   p.paymentType?.includes("Navratri")) &&
                  !(p.paymentType !== "Maintenance" && p.status === "pending")
              );
              const hasNav = cleaned.some((p: any) => p.paymentType?.includes("Navratri") && p.status === "paid");
              const hasSep = cleaned.some((p: any) => (p.description || "").includes("September 2026"));
              const hasOct = cleaned.some((p: any) => (p.description || "").includes("October 2026") || p.id?.includes("OCT"));
              const hasNewUserOct = cleaned.some((p: any) => p.residentId === "user-resident-16" && p.id?.includes("OCT"));
              if (hasNav && hasSep && hasOct && hasNewUserOct) {
                finalPayments = cleaned;
              }
            }
          } catch (e) {}
        }
        localStorage.setItem("homeverse_payments", JSON.stringify(finalPayments));
        localUpdates.payments = finalPayments;

        const storedBills = localStorage.getItem("homeverse_maintenanceBills");
        let finalBills = getPrepopulatedMaintenanceBills();
        if (storedBills) {
          try {
            const parsed = JSON.parse(storedBills);
            if (Array.isArray(parsed)) {
              const hasSep = parsed.some((b: any) => b.month === "September 2026" && b.status === "paid");
              const hasOct = parsed.some((b: any) => b.month === "October 2026" && b.status === "pending");
              const hasNewUserOct = parsed.some((b: any) => b.residentId === "user-resident-16" && b.month === "October 2026");
              if (hasSep && hasOct && hasNewUserOct) {
                finalBills = parsed;
              }
            }
          } catch (e) {}
        }
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
        // Guarantee empty collections and clean payments with ONLY October pending
        localStorage.removeItem("homeverse_collections");
        localUpdates.collections = [];

        const initStoredPayments = localStorage.getItem("homeverse_payments");
        let basePayments = getPrepopulatedPayments();
        if (initStoredPayments) {
          try {
            const parsedP = JSON.parse(initStoredPayments);
            if (Array.isArray(parsedP) && parsedP.length >= 100) {
              basePayments = parsedP;
            }
          } catch (e) {}
        }
        const cleanPayments = basePayments.map((p: any) => {
          const isOct = p.id?.includes("OCT") || (p.description || "").includes("October 2026") || (p.dueDate && p.dueDate.startsWith("2026-10"));
          if (isOct && p.paymentType === "Maintenance") {
            return p.status === "paid" ? p : { ...p, status: "pending" };
          }
          return { ...p, status: "paid" };
        });
        localStorage.setItem("homeverse_payments", JSON.stringify(cleanPayments));
        localUpdates.payments = cleanPayments;
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

    if ((globalThis as any).__homeverse_db_initialized) return;
    (globalThis as any).__homeverse_db_initialized = true;

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

        await Promise.all(
          endpoints.map(async ({ key, path }) => {
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

                if (Array.isArray(data) && data.length > 0) {
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
        { key: "serviceBookings", path: "/api/community-services/bookings" },
        { key: "helpers", path: "/api/visitors/helpers" },
        { key: "attendance", path: "/api/visitors/attendance" },
        { key: "flatAttendance", path: "/api/visitors/helpers/flat-attendance" },
        { key: "payments", path: "/api/payments" },
        { key: "collections", path: "/api/payments/collections" },
        { key: "users", path: "/api/users" }
      ];

      const batchUpdates: Record<string, any> = {};

      await Promise.all(
        criticalEndpoints.map(async ({ key, path }) => {
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
              if (Array.isArray(data)) {
                if (key === "complaints") {
                  data.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                } else if (key === "serviceBookings") {
                  data.sort((a: any, b: any) => new Date(b.createdAt || b.scheduledDate || 0).getTime() - new Date(a.createdAt || a.scheduledDate || 0).getTime());
                } else if (key === "attendance") {
                  data.sort((a: any, b: any) => new Date(b.checkInTime || b.date || 0).getTime() - new Date(a.checkInTime || a.date || 0).getTime());
                }
              }
              const currentStr = JSON.stringify((get() as any)[key]);
              const nextStr = JSON.stringify(data);
              if (currentStr !== nextStr) {
                batchUpdates[key] = data;
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
    const id = `CMP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();
    const newComplaint: Complaint = {
      ...c,
      id,
      status: (c.status as any) || "submitted",
      portal: c.portal || "society",
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: (c.status as any) || "submitted",
          timestamp: now,
          by: c.raisedByName || "Resident",
          note: "Complaint registered and submitted."
        }
      ],
      chat: [],
      subscribers: []
    };

    set((state) => {
      const updated = [newComplaint, ...(state.complaints || [])];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_complaints", JSON.stringify(updated));
        } catch (e) {}
      }
      return { complaints: updated };
    });

    try {
      await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComplaint)
      });
    } catch (e) {}
  },

  updateComplaintStatus: async (id, status, details) => {
    const now = new Date().toISOString();
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => {
        if (cmp.id === id) {
          const newTimelineItem: ComplaintTimelineEntry = {
            status,
            timestamp: now,
            by: details?.by || "Staff",
            note: details?.note || `Status changed to ${status}`,
            afterPhoto: details?.afterPhoto
          };
          return {
            ...cmp,
            status,
            updatedAt: now,
            timeline: [...(cmp.timeline || []), newTimelineItem]
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

    try {
      await fetch(`/api/complaints/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: details?.note, by: details?.by })
      });
    } catch (e) {}
  },

  assignComplaintWorker: async (id, workerName, workerId, eta) => {
    const now = new Date().toISOString();
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => {
        if (cmp.id === id) {
          const newTimelineItem: ComplaintTimelineEntry = {
            status: "assigned" as const,
            timestamp: now,
            by: "Management",
            note: `Assigned to ${workerName} (ETA: ${eta})`
          };
          return {
            ...cmp,
            status: "assigned" as const,
            assignedTo: workerName,
            assignedToId: workerId,
            eta,
            updatedAt: now,
            timeline: [...(cmp.timeline || []), newTimelineItem]
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

    try {
      await fetch(`/api/complaints/${id}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: workerName, assignedToId: workerId, note: `Assigned ETA: ${eta}` })
      });
    } catch (e) {}
  },

  rateComplaint: async (id, rating, review) => {
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => {
        if (cmp.id === id) {
          return { ...cmp, rating, review };
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

    try {
      await fetch(`/api/complaints/${id}/rate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, review })
      });
    } catch (e) {}
  },

  addComplaintChatMessage: async (id, msg) => {
    const now = new Date().toISOString();
    const newMsg = {
      id: `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: now,
      ...msg
    };
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => {
        if (cmp.id === id) {
          return {
            ...cmp,
            chat: [...(cmp.chat || []), newMsg]
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

    try {
      await fetch(`/api/complaints/${id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg.message, senderId: msg.senderId, senderName: msg.senderName, senderRole: msg.senderRole })
      });
    } catch (e) {}
  },

  mergeComplaints: async (parentTicketId, duplicateTicketIds) => {
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => {
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

    try {
      await fetch("/api/complaints/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentTicketId, duplicateTicketIds })
      });
    } catch (e) {}
  },

  subscribeToComplaint: async (id, userId, userName, unit) => {
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => {
        if (cmp.id === id) {
          const subs = cmp.subscribers || [];
          if (!subs.some((s: any) => s.userId === userId)) {
            return {
              ...cmp,
              subscribers: [...subs, { userId, name: userName, unit }]
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

    try {
      await fetch(`/api/complaints/${id}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName, unit })
      });
    } catch (e) {}
  },

  updateComplaintEta: async (id, eta) => {
    set((state) => {
      const updated = (state.complaints || []).map((cmp) => {
        if (cmp.id === id) {
          return { ...cmp, eta };
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

    try {
      await fetch(`/api/complaints/${id}/eta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eta })
      });
    } catch (e) {}
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

  payMaintenanceBill: async (id) => {
    const paidDate = new Date().toISOString();
    const txnId = `TXN-BILL-${Math.floor(10000 + Math.random() * 90000)}`;
    set((state) => {
      const nextBills = state.maintenanceBills.map((b) => {
        if (b.id === id) {
          return { ...b, status: "paid" as const, paidOn: paidDate };
        }
        return b;
      });

      const nextPayments = state.payments.map((p) => {
        if (p.referenceId === id || p.id === id) {
          return {
            ...p,
            status: "paid",
            paidDate,
            paymentMethod: "UPI",
            transactionId: txnId,
            receiptPath: `/receipts/RCP-${p.id}.pdf`
          };
        }
        return p;
      });

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_maintenanceBills", JSON.stringify(nextBills));
          localStorage.setItem("homeverse_payments", JSON.stringify(nextPayments));
        } catch (e) {}
      }

      return { maintenanceBills: nextBills, payments: nextPayments };
    });

    try {
      await fetch(`/api/maintenance/${id}/pay`, { method: "PUT" });
    } catch (e) {}
  },

  createEvent: async (ev) => {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ev)
    });
  },

  updateEventDetails: async (id, data) => {
    await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  },

  cancelEvent: async (id) => {
    await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelled" })
    });
  },

  registerForEvent: async (id, data) => {
    await fetch(`/api/events/${id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
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
      const residents = state.users.filter((u) => u.role === "resident" && u.portal === "society");
      const targetResidents = residents.filter((r) => {
        if (billDetails.applicableTo === "Selected Building" && billDetails.selectedBuilding) {
          return r.building === billDetails.selectedBuilding;
        }
        return true;
      });

      const newBills = targetResidents.map((r, i) => ({
        id: `BILL-${Date.now()}-${i}`,
        residentId: r.id,
        residentName: r.name,
        unit: r.unit || "",
        month: billDetails.month,
        amount: billDetails.amount,
        dueDate: billDetails.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
        status: "pending" as const,
        lateFee: billDetails.lateFee,
        breakdown: billDetails.breakdown || [
          { label: "Maintenance", amount: billDetails.amount }
        ]
      }));

      const newPayments = newBills.map((b) => ({
        id: `PAY-BILL-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`,
        residentId: b.residentId,
        residentName: b.residentName,
        unit: b.unit,
        building: "",
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
        lateFee: billDetails.lateFee
      }));

      const nextBills = [...newBills, ...state.maintenanceBills];
      const nextPayments = [...newPayments, ...state.payments];

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_maintenanceBills", JSON.stringify(nextBills));
          localStorage.setItem("homeverse_payments", JSON.stringify(nextPayments));
        } catch (e) {}
      }

      return { maintenanceBills: nextBills, payments: nextPayments };
    });

    try {
      await fetch("/api/maintenance/generate", {
        method: "POST",
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
    const newCollId = `COLL-${Math.floor(100 + Math.random() * 900)}`;
    const newColl = {
      id: newCollId,
      ...details,
      status: "active",
      createdAt: new Date().toISOString(),
      communityCode: "SUN123"
    };

    set((state) => {
      const nextCollections = [newColl, ...state.collections];

      // Generate pending payments for all residents
      const residents = state.users.filter((u) => u.role === "resident" && u.portal === "society");
      const targetResidents = residents.filter((r) => {
        if (details.visibility === "Everyone") return true;
        if (details.applicableBuildings?.length > 0 && r.building && details.applicableBuildings.includes(r.building)) return true;
        if (details.applicableFlats?.length > 0 && r.unit && details.applicableFlats.includes(r.unit)) return true;
        return false;
      });

      const newPayments = targetResidents.map((r) => ({
        id: `PAY-COLL-${Math.floor(100 + Math.random() * 900)}-${Date.now()}`,
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
        referenceId: newCollId,
        createdAt: new Date().toISOString(),
        description: details.description || ""
      }));

      const nextPayments = [...newPayments, ...state.payments];

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_collections", JSON.stringify(nextCollections));
          localStorage.setItem("homeverse_payments", JSON.stringify(nextPayments));
        } catch (e) {}
      }

      return { collections: nextCollections, payments: nextPayments };
    });

    try {
      await fetch("/api/payments/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details)
      });
    } catch (e) {}
  },

  editCollection: async (id, details) => {
    set((state) => {
      const nextCollections = state.collections.map((c) => (c.id === id ? { ...c, ...details } : c));
      const nextPayments = state.payments.map((p) => {
        if (p.referenceId === id && p.status !== "paid") {
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

    try {
      await fetch(`/api/payments/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details)
      });
    } catch (e) {}
  },

  cancelCollection: async (id) => {
    set((state) => {
      const nextCollections = state.collections.map((c) => (c.id === id ? { ...c, status: "cancelled" } : c));
      const nextPayments = state.payments.filter((p) => !(p.referenceId === id && p.status !== "paid"));

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_collections", JSON.stringify(nextCollections));
          localStorage.setItem("homeverse_payments", JSON.stringify(nextPayments));
        } catch (e) {}
      }

      return { collections: nextCollections, payments: nextPayments };
    });

    try {
      await fetch(`/api/payments/collections/${id}`, { method: "DELETE" });
    } catch (e) {}
  },

  payPayment: async (id, paymentMethod) => {
    const paidDate = new Date().toISOString();
    const txnId = `TXN-${paymentMethod || "UPI"}-${Math.floor(10000 + Math.random() * 90000)}`;
    set((state) => {
      let refBillId: string | null = null;
      const nextPayments = state.payments.map((p) => {
        if (p.id === id) {
          refBillId = p.referenceId || null;
          return {
            ...p,
            status: "paid",
            paidDate,
            paymentMethod: paymentMethod || "UPI",
            transactionId: txnId,
            receiptPath: `/receipts/RCP-${p.id}.pdf`
          };
        }
        return p;
      });

      // Also update linked maintenanceBill if exists
      let nextBills = state.maintenanceBills;
      if (refBillId) {
        nextBills = state.maintenanceBills.map((b) => {
          if (b.id === refBillId) {
            return { ...b, status: "paid" as const, paidOn: paidDate };
          }
          return b;
        });
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_payments", JSON.stringify(nextPayments));
          localStorage.setItem("homeverse_maintenanceBills", JSON.stringify(nextBills));
        } catch (e) {}
      }

      return { payments: nextPayments, maintenanceBills: nextBills };
    });

    try {
      await fetch(`/api/payments/${id}/pay`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod })
      });
    } catch (e) {}
  },

  sendPaymentReminder: async (id) => {
    try {
      await fetch(`/api/payments/${id}/remind`, {
        method: "POST"
      });
    } catch (e) {}
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
    const res = await fetch(`/api/complaints/${id}/secretary-review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updated = await res.json();
      set((state) => ({
        complaints: state.complaints.map((c) => (c.id === id ? updated : c))
      }));
      return updated;
    }
    throw new Error("Failed to review complaint");
  },

  actionComplaintManager: async (id, data) => {
    const res = await fetch(`/api/complaints/${id}/manager-action`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updated = await res.json();
      set((state) => ({
        complaints: state.complaints.map((c) => (c.id === id ? updated : c))
      }));
      return updated;
    }
    throw new Error("Failed to update complaint operations");
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
