// ==========================================
// HomeVerse - App Constants
// ==========================================

export const APP_NAME = 'HomeVerse';
export const APP_TAGLINE = 'The Operating System for Modern Communities';
export const APP_DESCRIPTION =
  'An intelligent Community Operating System that digitizes every aspect of residential communities — from gated societies to student hostels.';

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Portals', href: '#portals' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export const COMPLAINT_CATEGORIES = [
  { value: 'electrical', label: 'Electrical', icon: 'Zap', color: '#f59e0b' },
  { value: 'plumbing', label: 'Plumbing', icon: 'Droplets', color: '#3b82f6' },
  { value: 'lift', label: 'Lift / Elevator', icon: 'ArrowUpDown', color: '#8b5cf6' },
  { value: 'parking', label: 'Parking', icon: 'Car', color: '#6366f1' },
  { value: 'security', label: 'Security', icon: 'Shield', color: '#ef4444' },
  { value: 'water', label: 'Water Supply', icon: 'Waves', color: '#06b6d4' },
  { value: 'gardening', label: 'Gardening', icon: 'TreePine', color: '#22c55e' },
  { value: 'housekeeping', label: 'Housekeeping', icon: 'Sparkles', color: '#ec4899' },
  { value: 'internet', label: 'Internet / WiFi', icon: 'Wifi', color: '#14b8a6' },
  { value: 'furniture', label: 'Furniture', icon: 'Armchair', color: '#a855f7' },
  { value: 'room-cleaning', label: 'Room Cleaning', icon: 'SprayCan', color: '#f97316' },
  { value: 'mess', label: 'Mess / Canteen', icon: 'UtensilsCrossed', color: '#eab308' },
  { value: 'bathroom', label: 'Bathroom', icon: 'Bath', color: '#0ea5e9' },
  { value: 'others', label: 'Others', icon: 'CircleDot', color: '#64748b' },
] as const;

export const COMPLAINT_STATUSES = [
  { value: 'submitted', label: 'Submitted', color: '#3b82f6' },
  { value: 'assigned', label: 'Assigned', color: '#f59e0b' },
  { value: 'in-progress', label: 'In Progress', color: '#f97316' },
  { value: 'resolved', label: 'Resolved', color: '#22c55e' },
  { value: 'closed', label: 'Closed', color: '#64748b' },
] as const;

export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#ef4444', bg: '#fef2f2' },
  high: { label: 'High', color: '#f97316', bg: '#fff7ed' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  low: { label: 'Low', color: '#22c55e', bg: '#f0fdf4' },
} as const;

export const SOCIETY_SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/society/dashboard', icon: 'LayoutDashboard' },
  { label: 'AI Assistant', href: '/society/ai-assistant', icon: 'Bot' },
  { label: 'Complaints', href: '/society/complaints', icon: 'MessageSquareWarning' },
  { label: 'Visitors', href: '/society/visitors', icon: 'Users' },
  { label: 'Maintenance Bills', href: '/society/maintenance-bills', icon: 'IndianRupee' },
  { label: 'Payment History', href: '/society/payment-history', icon: 'FileText' },
  { label: 'Utility Usage', href: '/society/utility-usage', icon: 'Zap' },
  { label: 'Events', href: '/society/events', icon: 'Calendar' },
  { label: 'Lost & Found', href: '/society/lost-found', icon: 'Search' },
  { label: 'Find Local Help', href: '/society/find-local-help', icon: 'Wrench' },
  { label: 'Buy & Sell', href: '/society/buy-sell', icon: 'Tag' },
  { label: 'Local Businesses', href: '/society/local-businesses', icon: 'Store' },
  { label: 'Resident Directory', href: '/society/resident-directory', icon: 'UserCheck' },
  { label: 'Book Borrowing', href: '/society/book-borrowing', icon: 'BookOpen' },
  { label: 'Facility Booking', href: '/society/facility-booking', icon: 'CalendarPlus' },
  { label: 'My Parcels', href: '/society/my-parcels', icon: 'Package' },
  { label: 'Notifications', href: '/society/notifications', icon: 'Megaphone' },
  { label: 'Settings', href: '/society/settings', icon: 'Settings' },
];

export const SECRETARY_SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/society/dashboard', icon: 'LayoutDashboard' },
  { label: 'AI Assistant', href: '/society/ai-assistant', icon: 'Bot' },
  { label: 'Residents', href: '/society/residents', icon: 'Users' },
  { label: 'Buildings', href: '/society/buildings', icon: 'Building2' },
  { label: 'Flats', href: '/society/flats', icon: 'Building2' },
  { label: 'Workers', href: '/society/workers', icon: 'Wrench' },
  { label: 'Security Staff', href: '/society/security-staff', icon: 'Shield' },
  { label: 'Complaints', href: '/society/complaints', icon: 'MessageSquareWarning' },
  { label: 'Maintenance Bills', href: '/society/maintenance-bills-mgmt', icon: 'IndianRupee' },
  { label: 'Payments', href: '/society/payments', icon: 'CreditCard' },
  { label: 'Expenses', href: '/society/expenses', icon: 'DollarSign' },
  { label: 'Financial Reports', href: '/society/financial-reports', icon: 'FileText' },
  { label: 'Analytics', href: '/society/analytics', icon: 'BarChart3' },
  { label: 'Announcements', href: '/society/announcements', icon: 'Megaphone' },
  { label: 'Events', href: '/society/events-mgmt', icon: 'Calendar' },
  { label: 'Facility Management', href: '/society/facility-management', icon: 'CalendarPlus' },
  { label: 'Approvals', href: '/society/approvals', icon: 'ClipboardCheck' },
  { label: 'Notifications', href: '/society/notifications', icon: 'Megaphone' },
  { label: 'Settings', href: '/society/settings', icon: 'Settings' },
];

export const SECURITY_SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/society/dashboard', icon: 'LayoutDashboard' },
  { label: 'Visitor Desk', href: '/society/visitor-desk', icon: 'Users' },
  { label: 'Parcel Management', href: '/society/parcel-management', icon: 'Package' },
  { label: 'Helpers Entry', href: '/society/helpers-entry', icon: 'Wrench' },
  { label: 'Vehicle Logs', href: '/society/vehicle-logs', icon: 'Car' },
  { label: 'Gate Logs', href: '/society/gate-logs', icon: 'Key' },
  { label: 'Lost & Found', href: '/society/security-lost-found', icon: 'Search' },
  { label: 'Incident Reports', href: '/society/incident-reports', icon: 'FileText' },
  { label: 'CCTV', href: '/society/cctv', icon: 'Camera' },
  { label: 'Security Notices', href: '/society/announcements', icon: 'Megaphone' },
  { label: 'Notifications', href: '/society/notifications', icon: 'Megaphone' },
  { label: 'Settings', href: '/society/settings', icon: 'Settings' },
];

export const WORKER_SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/society/dashboard', icon: 'LayoutDashboard' },
  { label: 'Assigned Tasks', href: '/society/complaints', icon: 'MessageSquareWarning' },
  { label: "Today's Route", href: '/society/route', icon: 'MapPin' },
  { label: 'Emergency Tasks', href: '/society/emergency', icon: 'AlertTriangle' },
  { label: 'Inventory Suggestions', href: '/society/inventory', icon: 'Wrench' },
  { label: 'Performance', href: '/society/performance', icon: 'Star' },
  { label: 'My Services', href: '/society/services', icon: 'Briefcase' },
  { label: 'Availability', href: '/society/availability', icon: 'Clock' },
  { label: 'Notifications', href: '/society/notifications', icon: 'Megaphone' },
  { label: 'Settings', href: '/society/settings', icon: 'Settings' },
];

export const HOSTEL_SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/hostel/dashboard', icon: 'LayoutDashboard' },
  { label: 'AI Assistant', href: '/hostel/ai-assistant', icon: 'Bot' },
  { label: 'Mess Menu', href: '/hostel/mess', icon: 'UtensilsCrossed' },
  { label: 'Laundry', href: '/hostel/laundry', icon: 'WashingMachine' },
  { label: 'Complaints', href: '/hostel/complaints', icon: 'MessageSquareWarning' },
  { label: 'Leave Requests', href: '/hostel/leaves', icon: 'FileCheck' },
  { label: 'Attendance', href: '/hostel/attendance', icon: 'ClipboardCheck' },
  { label: 'Study Rooms', href: '/hostel/study-rooms', icon: 'BookOpen' },
  { label: 'Marketplace', href: '/hostel/marketplace', icon: 'Store' },
  { label: 'Lost & Found', href: '/hostel/lost-found', icon: 'Search' },
  { label: 'Events', href: '/hostel/events', icon: 'Calendar' },
  { label: 'Roommate Finder', href: '/hostel/roommate-finder', icon: 'Users' },
  { label: 'My Parcels', href: '/hostel/parcels', icon: 'Package' },
  { label: 'Notifications', href: '/hostel/notifications', icon: 'Megaphone' },
  { label: 'Settings', href: '/hostel/settings', icon: 'Settings' },
];

export const WARDEN_SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/hostel/dashboard', icon: 'LayoutDashboard' },
  { label: 'Students', href: '/hostel/students', icon: 'UserCheck' },
  { label: 'Room Allocation', href: '/hostel/rooms', icon: 'Bed' },
  { label: 'Attendance', href: '/hostel/attendance-mgmt', icon: 'ClipboardCheck' },
  { label: 'Complaints', href: '/hostel/complaints', icon: 'MessageSquareWarning' },
  { label: 'Mess Management', href: '/hostel/mess-management', icon: 'UtensilsCrossed' },
  { label: 'Laundry Management', href: '/hostel/laundry-management', icon: 'WashingMachine' },
  { label: 'Visitor Logs', href: '/hostel/visitors', icon: 'Shield' },
  { label: 'Parcel Management', href: '/hostel/parcel-management', icon: 'Package' },
  { label: 'Announcements', href: '/hostel/announcements', icon: 'Megaphone' },
  { label: 'Reports', href: '/hostel/reports', icon: 'FileText' },
  { label: 'Analytics', href: '/hostel/analytics', icon: 'BarChart3' },
  { label: 'Notifications', href: '/hostel/notifications', icon: 'Megaphone' },
  { label: 'Settings', href: '/hostel/settings', icon: 'Settings' },
];

export const STATS = [
  { label: 'Communities', value: 2500, suffix: '+' },
  { label: 'Residents', value: 1.2, suffix: 'M+', decimals: 1 },
  { label: 'Cities', value: 150, suffix: '+' },
  { label: 'Uptime', value: 99.9, suffix: '%', decimals: 1 },
];
