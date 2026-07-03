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
}

// --- Complaints ---
export type ComplaintStatus = 'submitted' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
export type ComplaintPriority = 'critical' | 'high' | 'medium' | 'low';
export type ComplaintCategory =
  | 'electrical'
  | 'plumbing'
  | 'lift'
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
  | 'others';

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
  images?: string[];
  assignedTo?: string;
  assignedToId?: string;
  priorityScore?: number;
  estimatedResolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  rating?: number;
  timeline: ComplaintTimelineEntry[];
  portal?: PortalType;
  beforePhoto?: string;
  afterPhoto?: string;
  comments?: string;
}

export interface ComplaintTimelineEntry {
  status: ComplaintStatus;
  timestamp: string;
  note?: string;
  by?: string;
}

// --- Visitors ---
export type VisitorStatus = 'expected' | 'checked-in' | 'checked-out' | 'denied';

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  visitingUnit: string;
  visitingResident: string;
  status: VisitorStatus;
  photo?: string;
  qrCode?: string;
  expectedAt?: string;
  checkInTime?: string;
  checkOutTime?: string;
  approvedBy?: string;
  vehicleNumber?: string;
  date: string;
  portal?: PortalType;
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
