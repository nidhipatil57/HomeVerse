// ==========================================
// HomeVerse - Mock Dashboard Data
// ==========================================

import type { ActivityItem, Announcement, DashboardStat, UtilityData } from '@/types';

export const societyDashboardStats: DashboardStat[] = [
  { label: 'Pending Complaints', value: 12, change: -8, trend: 'down', icon: 'MessageSquareWarning', color: '#f59e0b' },
  { label: 'Maintenance Dues', value: '₹2.4L', change: 5, trend: 'up', icon: 'IndianRupee', color: '#ef4444' },
  { label: 'Upcoming Events', value: 3, change: 0, trend: 'stable', icon: 'Calendar', color: '#8b5cf6' },
  { label: "Today's Visitors", value: 24, change: 12, trend: 'up', icon: 'Users', color: '#3b82f6' },
  { label: 'Parcels Pending', value: 7, change: -3, trend: 'down', icon: 'Package', color: '#f97316' },
  { label: 'Announcements', value: 5, change: 2, trend: 'up', icon: 'Megaphone', color: '#06b6d4' },
  { label: 'Water Usage', value: '12.4KL', change: -5, trend: 'down', icon: 'Droplets', color: '#0ea5e9' },
  { label: 'Electricity', value: '890 kWh', change: 3, trend: 'up', icon: 'Zap', color: '#eab308' },
  { label: 'Community Score', value: '92%', change: 4, trend: 'up', icon: 'Heart', color: '#ec4899' },
];

export const hostelDashboardStats: DashboardStat[] = [
  { label: "Today's Menu", value: '4 Meals', change: 0, trend: 'stable', icon: 'UtensilsCrossed', color: '#f59e0b' },
  { label: 'Attendance', value: '94%', change: 2, trend: 'up', icon: 'ClipboardCheck', color: '#22c55e' },
  { label: 'Laundry Queue', value: 3, change: -2, trend: 'down', icon: 'WashingMachine', color: '#3b82f6' },
  { label: 'Open Complaints', value: 8, change: -5, trend: 'down', icon: 'MessageSquareWarning', color: '#ef4444' },
  { label: 'Parcels', value: 5, change: 3, trend: 'up', icon: 'Package', color: '#f97316' },
  { label: 'Upcoming Events', value: 2, change: 1, trend: 'up', icon: 'Calendar', color: '#8b5cf6' },
  { label: 'Mess Crowd', value: 'Low', change: 0, trend: 'stable', icon: 'Users', color: '#06b6d4' },
  { label: 'Hostel Dues', value: '₹4,500', change: 0, trend: 'stable', icon: 'IndianRupee', color: '#eab308' },
];

export const recentActivity: ActivityItem[] = [
  {
    id: '1', type: 'complaint', title: 'Lift not working – Tower B',
    description: 'Complaint raised by Priya Sharma (B-402). Priority: High',
    timestamp: '2 min ago', icon: 'MessageSquareWarning', color: '#f59e0b', user: 'Priya Sharma',
  },
  {
    id: '2', type: 'visitor', title: 'Visitor checked in – Rahul Verma',
    description: 'Visiting Amit Patel (A-301). Purpose: Personal',
    timestamp: '15 min ago', icon: 'UserCheck', color: '#22c55e', user: 'Security Desk',
  },
  {
    id: '3', type: 'payment', title: 'Maintenance paid – A-205',
    description: 'Neha Gupta paid ₹4,500 for July 2026',
    timestamp: '32 min ago', icon: 'IndianRupee', color: '#3b82f6', user: 'Neha Gupta',
  },
  {
    id: '4', type: 'parcel', title: 'Parcel received – C-101',
    description: 'Amazon package for Raj Kumar. OTP: 4821',
    timestamp: '1 hour ago', icon: 'Package', color: '#f97316', user: 'Security Desk',
  },
  {
    id: '5', type: 'event', title: 'Independence Day Celebration',
    description: 'Cultural event scheduled for Aug 15. RSVP open.',
    timestamp: '2 hours ago', icon: 'PartyPopper', color: '#8b5cf6', user: 'Society Committee',
  },
  {
    id: '6', type: 'announcement', title: 'Water tank cleaning – July 5',
    description: 'Water supply will be disrupted from 10 AM to 2 PM',
    timestamp: '3 hours ago', icon: 'Megaphone', color: '#06b6d4', user: 'Admin',
  },
  {
    id: '7', type: 'maintenance', title: 'Garden maintenance completed',
    description: 'Monthly garden trimming done for all towers',
    timestamp: '5 hours ago', icon: 'TreePine', color: '#22c55e', user: 'Maintenance Staff',
  },
  {
    id: '8', type: 'complaint', title: 'WiFi issue resolved – Tower A',
    description: 'Router replaced in Tower A common area. Speed normalized.',
    timestamp: '6 hours ago', icon: 'Wifi', color: '#14b8a6', user: 'IT Team',
  },
];

export const announcements: Announcement[] = [
  {
    id: '1', title: 'Annual General Meeting',
    content: 'The AGM is scheduled for July 15, 2026 at 6 PM in the clubhouse. All members are requested to attend.',
    author: 'Rajesh Mehta', authorRole: 'committee', priority: 'important', createdAt: '2026-07-01T10:00:00',
    tags: ['meeting', 'important'],
  },
  {
    id: '2', title: 'Water Tank Cleaning',
    content: 'Water supply will be disrupted on July 5 from 10 AM to 2 PM for annual tank cleaning.',
    author: 'Admin Office', authorRole: 'admin', priority: 'urgent', createdAt: '2026-07-01T08:00:00',
    tags: ['water', 'maintenance'],
  },
  {
    id: '3', title: 'New Gym Equipment Arrived',
    content: 'We have added new treadmills and weight machines to the society gym. Come check them out!',
    author: 'Sports Committee', authorRole: 'committee', priority: 'normal', createdAt: '2026-06-30T15:00:00',
    tags: ['gym', 'amenities'],
  },
];

export const utilityData: UtilityData[] = [
  { month: 'Jan', electricity: 780, water: 11.2 },
  { month: 'Feb', electricity: 720, water: 10.8 },
  { month: 'Mar', electricity: 810, water: 12.1 },
  { month: 'Apr', electricity: 890, water: 13.5 },
  { month: 'May', electricity: 960, water: 14.2 },
  { month: 'Jun', electricity: 920, water: 13.8 },
  { month: 'Jul', electricity: 890, water: 12.4 },
];

export const expenseBreakdown = [
  { name: 'Maintenance', value: 35, color: '#8b5cf6' },
  { name: 'Security', value: 20, color: '#3b82f6' },
  { name: 'Utilities', value: 18, color: '#06b6d4' },
  { name: 'Gardening', value: 10, color: '#22c55e' },
  { name: 'Housekeeping', value: 12, color: '#f59e0b' },
  { name: 'Others', value: 5, color: '#64748b' },
];

export const complaintsByCategory = [
  { name: 'Plumbing', count: 18, color: '#3b82f6' },
  { name: 'Electrical', count: 15, color: '#f59e0b' },
  { name: 'Lift', count: 12, color: '#8b5cf6' },
  { name: 'Parking', count: 9, color: '#6366f1' },
  { name: 'Security', count: 7, color: '#ef4444' },
  { name: 'Water', count: 6, color: '#06b6d4' },
  { name: 'Internet', count: 5, color: '#14b8a6' },
  { name: 'Others', count: 4, color: '#64748b' },
];
