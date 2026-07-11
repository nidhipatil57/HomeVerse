// ==========================================
// HomeVerse - TypeScript Type Definitions
// ==========================================

// --- Auth & Users ---
export type UserRole = 'resident' | 'worker' | 'student' | 'warden' | 'admin' | 'security' | 'committee' | 'secretary';
export type PortalType = 'society' | 'hostel';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  portal: PortalType;
  unit?: string; // Flat/Room number
  building?: string;
  joinedAt: string;
  status?: 'pending' | 'approved' | 'rejected' | 'deactivated';
  designation?: string;
  committeeId?: string;
  // Worker-specific properties
  workerCategory?: string;
  workingShift?: string;
  specializations?: string[];
  experience?: string;
  rating?: number;
  availability?: string; // e.g. "Available" | "Busy"
  ownerOrTenant?: string;
  // Student/Hostel-specific properties
  course?: string;
  year?: string;
  branch?: string;
  gender?: string;
  hostelName?: string;
  collegeName?: string;
  communityCode?: string;
  employeeId?: string;
}

// --- Complaints ---
export type ComplaintStatus =
  | 'submitted'
  | 'under-review'
  | 'assigned'
  | 'accepted'
  | 'travelling'
  | 'reached-society'
  | 'reached-building'
  | 'reached-flat'
  | 'work-started'
  | 'in-progress'
  | 'completed'
  | 'resolved'
  | 'resident-verification'
  | 'closed';

export type ComplaintPriority = 'critical' | 'high' | 'medium' | 'low' | 'emergency';

export type ComplaintCategory =
  | 'electrical'
  | 'plumbing'
  | 'lift'
  | 'water-leakage'
  | 'water-supply'
  | 'parking'
  | 'security'
  | 'water'
  | 'gardening'
  | 'housekeeping'
  | 'internet'
  | 'wifi'
  | 'furniture'
  | 'room-cleaning'
  | 'mess'
  | 'bathroom'
  | 'cleaning'
  | 'noise'
  | 'pest-control'
  | 'common-area'
  | 'clubhouse'
  | 'swimming-pool'
  | 'others';

export interface ComplaintChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface AiAnalysis {
  predictedPriority: ComplaintPriority;
  suggestedCategory: string;
  estimatedCompletion: string;
  requiredMaterials: string[];
  expectedCost: string;
  possibleDuplicateOf?: string;
  isDuplicate?: boolean;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  raisedBy: string;
  raisedByName: string;
  unit: string;
  building: string;
  wing?: string;
  emergency?: boolean;
  images?: string[];
  videos?: string[];
  documents?: string[];
  invoices?: string[];
  completionPhotos?: string[];
  assignedTo?: string;
  assignedToId?: string;
  priorityScore?: number;
  estimatedResolution?: string;
  estimatedArrival?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  rating?: number;
  ratingReview?: string;
  timeline: ComplaintTimelineEntry[];
  portal?: PortalType;
  beforePhoto?: string;
  afterPhoto?: string;
  comments?: string;
  chat?: ComplaintChatMessage[];
  aiAnalysis?: AiAnalysis;
  duplicateGroup?: string[];
  parentTicketId?: string;
  secretaryNotes?: string;
  subscribers?: { userId: string; unit: string; name: string }[];
}

export interface ComplaintTimelineEntry {
  status: ComplaintStatus;
  timestamp: string;
  note?: string;
  by?: string;
  afterPhoto?: string;
}

// --- Visitors ---
export type VisitorStatus =
  | 'pending'
  | 'approved'
  | 'at-gate'
  | 'checked-in'
  | 'inside'
  | 'checked-out'
  | 'expired'
  | 'cancelled'
  | 'denied'
  | 'expected';

export interface VisitorTimelineEvent {
  status: VisitorStatus;
  timestamp: string;
  note?: string;
  by?: string;
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  visitingUnit: string;
  visitingResident: string;
  visitingResidentId?: string;
  status: VisitorStatus;
  photo?: string;
  qrCode?: string;
  otp?: string;
  expectedAt?: string;
  expectedExit?: string;
  checkInTime?: string;
  checkOutTime?: string;
  approvedBy?: string;
  vehicleNumber?: string;
  vehicleType?: 'two-wheeler' | 'four-wheeler' | 'none';
  parkingSlot?: string;
  numberOfVisitors?: number;
  specialInstructions?: string;
  date: string;
  portal?: PortalType;
  
  // Redesign fields
  visitorType?: string;
  visitType?: 'one-time' | 'recurring';
  recurringSchedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    days?: string[];
    time?: string;
  };
  timeline?: VisitorTimelineEvent[];
  isFavorite?: boolean;
  remarks?: string;
}

// --- Maintenance ---
export interface MaintenanceBill {
  id: string;
  unit: string;
  residentName: string;
  month: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidOn?: string;
  breakdown: {
    label: string;
    amount: number;
  }[];
  lateFee?: number;
}

// --- Events ---
export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  type: 'festival' | 'meeting' | 'workshop' | 'competition' | 'social' | 'sports';
  rsvpCount: number;
  maxCapacity?: number;
  image?: string;
}

// --- Announcements ---
export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: UserRole;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  expiresAt?: string;
  tags: string[];
}

// --- Parcels ---
export interface Parcel {
  id: string;
  residentName: string;
  unit: string;
  courier: string;
  description: string;
  receivedAt: string;
  pickedUpAt?: string;
  status: 'received' | 'notified' | 'picked-up';
  otp?: string;
  image?: string;
}

// --- Mess Menu (Hostel) ---
export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export interface MealItem {
  name: string;
  isVeg: boolean;
  calories?: number;
}

export interface DayMenu {
  day: string;
  date: string;
  meals: {
    type: MealType;
    time: string;
    items: MealItem[];
    rating?: number;
    crowdLevel?: 'low' | 'moderate' | 'high' | 'very-high';
  }[];
}

// --- Laundry (Hostel) ---
export interface LaundryMachine {
  id: string;
  name: string;
  type: 'washer' | 'dryer';
  status: 'available' | 'in-use' | 'maintenance';
  currentUser?: string;
  estimatedFreeAt?: string;
  floor: number;
}

export interface LaundryBooking {
  id: string;
  machineId: string;
  userId: string;
  slot: string;
  date: string;
  status: 'booked' | 'in-progress' | 'completed' | 'cancelled';
}

// --- Dashboard Stats ---
export interface DashboardStat {
  label: string;
  value: number | string;
  change?: number; // percentage
  trend?: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

// --- Notifications ---
export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'alert';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
  icon?: string;
}

// --- AI Chat ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  data?: Record<string, unknown>; // structured data for rich responses
}

// --- Activity Feed ---
export interface ActivityItem {
  id: string;
  type: 'complaint' | 'visitor' | 'payment' | 'event' | 'parcel' | 'announcement' | 'maintenance';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  user?: string;
}

// --- Utility Data ---
export interface UtilityData {
  month: string;
  electricity: number;
  water: number;
  gas?: number;
}

// --- Pricing ---
export interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

// --- Testimonial ---
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  community: string;
  avatar: string;
  content: string;
  rating: number;
}

// --- FAQ ---
export interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'society' | 'hostel' | 'pricing' | 'security';
}

// --- Security & Emergency ---
export interface EmergencyAlert {
  id: string;
  residentId: string;
  residentName: string;
  unit: string;
  building: string;
  phone: string;
  emergencyType: 'Medical' | 'Fire' | 'Lift Stuck' | 'Suspicious Activity' | 'Theft' | 'Gas Leakage';
  status: 'pending' | 'accepted' | 'dispatched' | 'resolved';
  priority: 'critical' | 'high';
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
}

export interface GatePass {
  id: string;
  name: string;
  company?: string;
  purpose: string;
  validFrom: string;
  validTo: string;
  assignedResident: string;
  unit: string;
  building: string;
  status: 'active' | 'expired' | 'used';
  createdAt: string;
}

export interface VehicleLog {
  id: string;
  vehicleNumber: string;
  ownerName: string;
  ownerType: 'resident' | 'visitor' | 'delivery' | 'worker';
  unit: string;
  building: string;
  entryTime: string;
  exitTime?: string;
  status: 'inside' | 'exited';
}

export interface IncidentReport {
  id: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: 'Visitor Dispute' | 'Lost Child' | 'Vehicle Damage' | 'Parking Violation' | 'Noise Complaint' | 'Theft Attempt' | 'Others';
  status: 'logged' | 'under-review' | 'resolved';
  reporter: string;
  images?: string[];
  createdAt: string;
}

// --- Secretary Specific Data Models ---
export interface SocietyExpense {
  id: string;
  category: string;
  vendor: string;
  amount: number;
  date: string;
  invoiceUrl?: string;
  notes?: string;
}

export interface FlatInfo {
  id: string;
  building: string;
  wing: string;
  floor: number;
  flatNumber: string;
  status: 'occupied' | 'vacant';
  residentId?: string;
  residentName?: string;
}

export interface RentRecord {
  id: string;
  unit: string;
  building: string;
  tenantName: string;
  tenantId?: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending';
  paidOn?: string;
}

export interface Helper {
  id: string;
  name: string;
  category: string;
  phone: string;
  workingDays: string[];
  expectedArrival: string;
  expectedExit: string;
  assignedFlats: string[];
  assignedResidents: string[];
  residentIds: string[];
  joinedAt: string;
  portal: 'society';
}

export interface HelperAttendance {
  id: string;
  workerId: string;
  workerName: string;
  workerCategory: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  entryGate: string;
  exitGate?: string;
  status: 'present' | 'late' | 'checked-in' | 'checked-out';
  assignedFlats: string[];
  duration?: number;
}
