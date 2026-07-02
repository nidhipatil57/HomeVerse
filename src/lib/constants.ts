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
  { label: 'Maintenance', href: '/society/maintenance', icon: 'IndianRupee' },
  { label: 'Community', href: '/society/community', icon: 'Heart' },
  { label: 'Analytics', href: '/society/analytics', icon: 'BarChart3' },
  { label: 'Marketplace', href: '/society/marketplace', icon: 'Store' },
  { label: 'Announcements', href: '/society/announcements', icon: 'Megaphone' },
  { label: 'Settings', href: '/society/settings', icon: 'Settings' },
];

export const HOSTEL_SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/hostel/dashboard', icon: 'LayoutDashboard' },
  { label: 'AI Assistant', href: '/hostel/ai-assistant', icon: 'Bot' },
  { label: 'Mess Menu', href: '/hostel/mess', icon: 'UtensilsCrossed' },
  { label: 'Laundry', href: '/hostel/laundry', icon: 'WashingMachine' },
  { label: 'Complaints', href: '/hostel/complaints', icon: 'MessageSquareWarning' },
  { label: 'Attendance', href: '/hostel/attendance', icon: 'ClipboardCheck' },
  { label: 'Parcels', href: '/hostel/parcels', icon: 'Package' },
  { label: 'Community', href: '/hostel/community', icon: 'Users' },
  { label: 'Marketplace', href: '/hostel/marketplace', icon: 'Store' },
  { label: 'Settings', href: '/hostel/settings', icon: 'Settings' },
];

export const STATS = [
  { label: 'Communities', value: 2500, suffix: '+' },
  { label: 'Residents', value: 1.2, suffix: 'M+', decimals: 1 },
  { label: 'Cities', value: 150, suffix: '+' },
  { label: 'Uptime', value: 99.9, suffix: '%', decimals: 1 },
];
