// ==========================================
// HomeVerse - Mock Visitors Data
// ==========================================

import type { Visitor } from '@/types';

export const mockVisitors: Visitor[] = [
  {
    id: 'VIS-001', name: 'Rahul Verma', phone: '9876543210', purpose: 'Personal Visit',
    visitingUnit: 'A-301', visitingResident: 'Amit Patel', status: 'checked-in',
    expectedAt: '2026-07-02T10:00:00', checkInTime: '2026-07-02T10:05:00',
    date: '2026-07-02', approvedBy: 'Amit Patel',
  },
  {
    id: 'VIS-002', name: 'Deepika Courier', phone: '9123456789', purpose: 'Delivery - Amazon',
    visitingUnit: 'B-205', visitingResident: 'Neha Gupta', status: 'checked-out',
    checkInTime: '2026-07-02T09:30:00', checkOutTime: '2026-07-02T09:35:00',
    date: '2026-07-02', approvedBy: 'Security',
  },
  {
    id: 'VIS-003', name: 'Manoj Electrician', phone: '9988776655', purpose: 'AC Service',
    visitingUnit: 'C-401', visitingResident: 'Vikram Singh', status: 'expected',
    expectedAt: '2026-07-02T14:00:00',
    date: '2026-07-02', approvedBy: 'Vikram Singh',
  },
  {
    id: 'VIS-004', name: 'Anjali Mehta', phone: '9876501234', purpose: 'Family Visit',
    visitingUnit: 'A-602', visitingResident: 'Rajesh Mehta', status: 'checked-in',
    expectedAt: '2026-07-02T11:00:00', checkInTime: '2026-07-02T11:10:00',
    date: '2026-07-02', approvedBy: 'Rajesh Mehta',
  },
  {
    id: 'VIS-005', name: 'Swiggy Delivery', phone: '9111222333', purpose: 'Food Delivery',
    visitingUnit: 'B-303', visitingResident: 'Priya Sharma', status: 'checked-out',
    checkInTime: '2026-07-02T12:45:00', checkOutTime: '2026-07-02T12:50:00',
    date: '2026-07-02', approvedBy: 'Security',
  },
  {
    id: 'VIS-006', name: 'Dr. Suresh Reddy', phone: '9444555666', purpose: 'Medical Visit',
    visitingUnit: 'A-101', visitingResident: 'Kamla Devi', status: 'expected',
    expectedAt: '2026-07-02T16:00:00',
    date: '2026-07-02', approvedBy: 'Kamla Devi',
  },
  {
    id: 'VIS-007', name: 'Plumber - Municipal', phone: '9000111222', purpose: 'Water line check',
    visitingUnit: 'Common Area', visitingResident: 'Admin', status: 'denied',
    expectedAt: '2026-07-02T08:00:00',
    date: '2026-07-02',
  },
];
