import { Complaint, Visitor, User, Announcement, EmergencyAlert, GatePass, VehicleLog, IncidentReport, SocietyExpense, FlatInfo, RentRecord } from "@/types";
import {
  LeaveRequest,
  LaundrySlot,
  Parcel,
  MarketplaceItem,
  LostFoundItem,
  MaintenanceBill,
  CommunityEvent,
  Notification
} from "@/lib/store/useCommunityStore";

export const getPrepopulatedComplaints = (): Complaint[] => [
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

export const getPrepopulatedLeaveRequests = (): LeaveRequest[] => [
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

export const getPrepopulatedVisitors = (): Visitor[] => [
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

export const getPrepopulatedLaundrySlots = (): LaundrySlot[] => {
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

  return prepopulatedLaundrySlots;
};

export const getPrepopulatedParcels = (): Parcel[] => [
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

export const getPrepopulatedMarketplaceItems = (): MarketplaceItem[] => [
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

export const getPrepopulatedLostFoundItems = (): LostFoundItem[] => [
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

export const getPrepopulatedMaintenanceBills = (): MaintenanceBill[] => [
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

export const getPrepopulatedCommunityEvents = (): CommunityEvent[] => [
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

export const getPrepopulatedNotifications = (): Notification[] => [
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

export const getPrepopulatedUsers = (): (User & Record<string, any>)[] => [
  {
    id: "user-resident-1",
    name: "Nidhi Kumar",
    email: "nidhi@sunshinecomplex.com",
    phone: "+91 98765 43210",
    role: "resident",
    portal: "society",
    unit: "301",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-01-10",
    status: "approved"
  },
  {
    id: "user-worker-1",
    name: "Ramesh Kumar",
    email: "ramesh@sunshinecomplex.com",
    phone: "+91 87654 32109",
    role: "worker",
    portal: "society",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    workerCategory: "Electrician",
    employeeId: "EMP-2940",
    workingShift: "Morning (9 AM - 5 PM)",
    joinedAt: "2026-02-15",
    status: "approved"
  },
  {
    id: "user-student-1",
    name: "Aarav Mehta",
    email: "aarav@vesit.edu",
    phone: "+91 76543 21098",
    role: "student",
    portal: "hostel",
    unit: "204",
    building: "Wing A",
    hostelName: "Boys Hostel",
    collegeName: "Vivekanand Education Society Institute of Technology",
    communityCode: "VESIT26",
    course: "Computer Science",
    year: "3rd Year",
    joinedAt: "2026-07-01",
    status: "approved"
  },
  {
    id: "user-warden-1",
    name: "Dr. K. S. Pillai",
    email: "pillai@vesit.edu",
    phone: "+91 65432 10987",
    role: "warden",
    portal: "hostel",
    assignedWing: "Wing A",
    hostelName: "Boys Hostel",
    collegeName: "Vivekanand Education Society Institute of Technology",
    communityCode: "VESIT26",
    employeeId: "WDN-1082",
    joinedAt: "2026-05-20",
    status: "approved"
  },
  {
    id: "user-security-1",
    name: "Rahul Sharma",
    email: "security@sunshinecomplex.com",
    phone: "+91 99887 76655",
    role: "security",
    portal: "society",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    employeeId: "SEC-9040",
    workingShift: "Morning",
    gate: "Gate 1",
    joinedAt: "2026-03-01",
    status: "approved"
  },
  {
    id: "user-secretary-1",
    name: "Rahul Verma",
    email: "rahul@sunshinecomplex.com",
    phone: "+91 98765 11111",
    role: "secretary",
    portal: "society",
    unit: "302",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-03-15",
    designation: "Secretary",
    committeeId: "SEC-COM-1",
    status: "approved"
  },
  {
    id: "user-resident-pending-1",
    name: "Gaurav Sen",
    email: "gaurav@sunshinecomplex.com",
    phone: "+91 91234 56789",
    role: "resident",
    portal: "society",
    unit: "102",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Tenant",
    status: "pending",
    joinedAt: "2026-07-02"
  },
  {
    id: "user-worker-pending-1",
    name: "Mohan Lal",
    email: "mohan@sunshinecomplex.com",
    phone: "+91 98989 89898",
    role: "worker",
    portal: "society",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    workerCategory: "Plumber",
    employeeId: "EMP-9002",
    status: "pending",
    joinedAt: "2026-07-03"
  }
];

export const getPrepopulatedEmergencies = (): EmergencyAlert[] => [
  {
    id: "EMG-001",
    residentId: "user-resident-1",
    residentName: "Nidhi Kumar",
    unit: "301",
    building: "A Wing",
    phone: "+91 98765 43210",
    emergencyType: "Medical",
    status: "pending",
    priority: "critical",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  }
];

export const getPrepopulatedGatePasses = (): GatePass[] => [
  {
    id: "PASS-001",
    name: "Ravi Kumar (Interior Designer)",
    company: "HomeDecor Studio",
    purpose: "Renovation contractor team",
    validFrom: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    validTo: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    assignedResident: "Nidhi Kumar",
    unit: "301",
    building: "A Wing",
    status: "active",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  }
];

export const getPrepopulatedVehicleLogs = (): VehicleLog[] => [
  {
    id: "VEH-001",
    vehicleNumber: "MH-12-AB-1234",
    ownerName: "Nidhi Kumar",
    ownerType: "resident",
    unit: "301",
    building: "A Wing",
    entryTime: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    status: "inside"
  },
  {
    id: "VEH-002",
    vehicleNumber: "MH-14-CD-5678",
    ownerName: "Delivery Cab (Uber)",
    ownerType: "delivery",
    unit: "202",
    building: "B Wing",
    entryTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    status: "inside"
  }
];

export const getPrepopulatedIncidents = (): IncidentReport[] => [
  {
    id: "INC-001",
    date: new Date().toISOString().split("T")[0],
    time: "11:20 AM",
    location: "Basement Parking B1",
    description: "Minor scrape between resident vehicle MH-12-AB-1234 and visitor vehicle. Notified owner.",
    type: "Vehicle Damage",
    status: "logged",
    reporter: "Rahul Sharma",
    createdAt: new Date().toISOString()
  }
];

export const getPrepopulatedAnnouncements = (): Announcement[] => [
  {
    id: "ANN-001",
    title: "Water Tank Cleaning Notice",
    content: "Please note that the main overhead water tanks for Tower A & B will be cleaned on Sunday between 10:00 AM and 04:00 PM. Water supply will be suspended.",
    author: "Rahul Sharma",
    authorRole: "security",
    priority: "important",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    tags: ["Maintenance", "Water Supply"]
  },
  {
    id: "ANN-002",
    title: "Gate 2 Parking Restrictions",
    content: "Gate 2 access road is undergoing pavement repair. Please do not park vehicles near the gate walkway.",
    author: "Rahul Sharma",
    authorRole: "security",
    priority: "normal",
    createdAt: new Date().toISOString(),
    tags: ["Parking", "Security"]
  }
];

export const getPrepopulatedExpenses = (): SocietyExpense[] => [
  {
    id: "EXP-001",
    category: "Security Salaries",
    vendor: "Tiger Security Agency",
    amount: 45000,
    date: "2026-07-01",
    notes: "Monthly salary payment for 3 gate guards."
  },
  {
    id: "EXP-002",
    category: "Lift Servicing",
    vendor: "Otis Elevators India",
    amount: 12500,
    date: "2026-06-28",
    notes: "Quarterly maintenance and safety checks for Wing A lift."
  },
  {
    id: "EXP-003",
    category: "Gardening",
    vendor: "Green Thumb Nursery",
    amount: 4000,
    date: "2026-07-02",
    notes: "Purchase of new lawn plants and fertilizer."
  }
];

export const getPrepopulatedFlats = (): FlatInfo[] => [
  { id: "FL-101", building: "A Wing", wing: "A", floor: 1, flatNumber: "101", status: "occupied", residentId: "user-resident-other", residentName: "Amit Shah" },
  { id: "FL-102", building: "A Wing", wing: "A", floor: 1, flatNumber: "102", status: "vacant" },
  { id: "FL-201", building: "A Wing", wing: "A", floor: 2, flatNumber: "201", status: "occupied", residentId: "user-resident-other2", residentName: "Sunita Rao" },
  { id: "FL-202", building: "A Wing", wing: "A", floor: 2, flatNumber: "202", status: "vacant" },
  { id: "FL-301", building: "A Wing", wing: "A", floor: 3, flatNumber: "301", status: "occupied", residentId: "user-resident-1", residentName: "Nidhi Kumar" },
  { id: "FL-302", building: "A Wing", wing: "A", floor: 3, flatNumber: "302", status: "occupied", residentId: "user-secretary-1", residentName: "Rahul Verma" },
  { id: "FL-B101", building: "B Wing", wing: "B", floor: 1, flatNumber: "101", status: "vacant" },
  { id: "FL-B102", building: "B Wing", wing: "B", floor: 1, flatNumber: "102", status: "occupied", residentId: "user-resident-other3", residentName: "Kishore Kumar" }
];

export const getPrepopulatedRentRecords = (): RentRecord[] => [
  {
    id: "RNT-001",
    unit: "101",
    building: "A Wing",
    tenantName: "Amit Shah",
    amount: 15000,
    dueDate: "2026-07-05",
    status: "pending"
  },
  {
    id: "RNT-002",
    unit: "102",
    building: "B Wing",
    tenantName: "Kishore Kumar",
    amount: 18000,
    dueDate: "2026-07-01",
    status: "paid",
    paidOn: "2026-06-30"
  }
];

export const getInitialDb = () => ({
  users: getPrepopulatedUsers(),
  complaints: getPrepopulatedComplaints(),
  leaveRequests: getPrepopulatedLeaveRequests(),
  visitors: getPrepopulatedVisitors(),
  laundrySlots: getPrepopulatedLaundrySlots(),
  parcels: getPrepopulatedParcels(),
  facilityBookings: [],
  marketplaceItems: getPrepopulatedMarketplaceItems(),
  lostFoundItems: getPrepopulatedLostFoundItems(),
  roomChangeRequests: [],
  maintenanceBills: getPrepopulatedMaintenanceBills(),
  communityEvents: getPrepopulatedCommunityEvents(),
  notifications: getPrepopulatedNotifications(),
  roommatePreferences: [],
  emergencies: getPrepopulatedEmergencies(),
  gatePasses: getPrepopulatedGatePasses(),
  vehicleLogs: getPrepopulatedVehicleLogs(),
  incidents: getPrepopulatedIncidents(),
  announcements: getPrepopulatedAnnouncements(),
  expenses: getPrepopulatedExpenses(),
  flats: getPrepopulatedFlats(),
  rentRecords: getPrepopulatedRentRecords()
});
