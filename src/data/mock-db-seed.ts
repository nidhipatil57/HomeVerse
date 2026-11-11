import { Complaint, Visitor, User, Announcement, EmergencyAlert, GatePass, VehicleLog, IncidentReport, SocietyExpense, FlatInfo, RentRecord, Helper, HelperAttendance } from "@/types";
import {
  LeaveRequest,
  LaundrySlot,
  Parcel,
  MarketplaceItem,
  FoundItem,
  Claim,
  MaintenanceBill,
  CommunityEvent,
  Notification,
  LostReport,
  ItemMatch
} from "@/lib/store/useCommunityStore";

export const getPrepopulatedComplaints = (): Complaint[] => [
  {
    id: "CMP-001",
    title: "Kitchen Pipe Water Leakage",
    description: "Water is dripping from the kitchen inlet line. Flooded cabinet under the kitchen counter.",
    category: "plumbing",
    status: "in-progress",
    priority: "high",
    raisedBy: "user-resident-1",
    raisedByName: "Sara Shah",
    unit: "A-202",
    building: "A Wing",
    portal: "society",
    createdAt: "2026-07-03T10:00:00",
    updatedAt: "2026-07-03T10:30:00",
    assignedTo: "Amit Kumar (Plumber)",
    assignedToId: "user-worker-2",
    priorityScore: 75,
    timeline: [
      { status: "submitted", timestamp: "2026-07-03T10:00:00", note: "Complaint registered" },
      { status: "assigned", timestamp: "2026-07-03T10:15:00", note: "Assigned to Plumber Team", by: "Secretary" },
      { status: "in-progress", timestamp: "2026-07-03T10:30:00", note: "Amit Kumar is on the way.", by: "Amit Kumar" }
    ]
  },
  {
    id: "CMP-002",
    title: "Living Room MCB Tripping",
    description: "MCB trips immediately when turning on the AC unit. Safety hazard near dining table.",
    category: "electrical",
    status: "resolved",
    priority: "critical",
    raisedBy: "user-resident-2",
    raisedByName: "Nidhi Kumar",
    unit: "A-101",
    building: "A Wing",
    portal: "society",
    createdAt: "2026-07-02T14:00:00",
    updatedAt: "2026-07-02T16:00:00",
    resolvedAt: "2026-07-02T16:00:00",
    assignedTo: "Ramesh Kumar (Electrician)",
    assignedToId: "user-worker-1",
    priorityScore: 90,
    timeline: [
      { status: "submitted", timestamp: "2026-07-02T14:00:00", note: "Complaint registered" },
      { status: "assigned", timestamp: "2026-07-02T14:15:00", note: "Assigned to Ramesh Kumar", by: "Secretary" },
      { status: "in-progress", timestamp: "2026-07-02T14:30:00", note: "Inspection started by electrician", by: "Ramesh Kumar" },
      { status: "resolved", timestamp: "2026-07-02T16:00:00", note: "Fixed short circuit and replaced faulty wiring in AC point", by: "Ramesh Kumar" }
    ]
  },
  {
    id: "CMP-003",
    title: "Ceiling Fan Making Loud Noise & Not Spinning",
    description: "Ceiling fan in room 204 makes a heavy humming noise but doesn't spin at speed.",
    category: "electrical",
    status: "assigned",
    priority: "medium",
    raisedBy: "user-student-1",
    raisedByName: "Aarav Mehta",
    unit: "204",
    building: "Wing A",
    portal: "hostel",
    createdAt: "2026-07-04T09:00:00",
    updatedAt: "2026-07-04T09:30:00",
    assignedTo: "Ramesh Kumar (Electrician)",
    assignedToId: "user-worker-1",
    priorityScore: 60,
    timeline: [
      { status: "submitted", timestamp: "2026-07-04T09:00:00", note: "Complaint registered" },
      { status: "assigned", timestamp: "2026-07-04T09:30:00", note: "Assigned to Electrician Team", by: "Warden" }
    ]
  },
  {
    id: "CMP-004",
    title: "No WiFi Internet Access in Wing B",
    description: "Cannot authenticate or load web pages on VESIT-Secure-WiFi from room B-102.",
    category: "wifi",
    status: "resolved",
    priority: "high",
    raisedBy: "user-student-2",
    raisedByName: "Priya Sharma",
    unit: "102",
    building: "Wing B",
    portal: "hostel",
    createdAt: "2026-07-03T11:00:00",
    updatedAt: "2026-07-03T13:00:00",
    resolvedAt: "2026-07-03T13:00:00",
    assignedTo: "Hostel IT Admin",
    priorityScore: 80,
    timeline: [
      { status: "submitted", timestamp: "2026-07-03T11:00:00", note: "Complaint registered" },
      { status: "assigned", timestamp: "2026-07-03T11:15:00", note: "Assigned to IT Support Group", by: "Warden" },
      { status: "resolved", timestamp: "2026-07-03T13:00:00", note: "Router rebooted and IP allocation issue resolved.", by: "Hostel IT Admin" }
    ]
  }
];

export const getPrepopulatedLeaveRequests = (): LeaveRequest[] => [
  {
    id: "LEAVE-001",
    studentId: "user-student-1",
    studentName: "Aarav Mehta",
    room: "204 (Wing A)",
    parentContact: "+91 98222 11111",
    reason: "Outstation travel for college hackathon.",
    fromDate: "2026-07-05",
    toDate: "2026-07-08",
    status: "pending",
    createdAt: "2026-07-02T15:00:00"
  },
  {
    id: "LEAVE-002",
    studentId: "user-student-3",
    studentName: "Rohan Das",
    room: "105 (Wing A)",
    parentContact: "+91 98765 43210",
    reason: "Going home for family function.",
    fromDate: "2026-07-10",
    toDate: "2026-07-15",
    status: "approved",
    createdAt: "2026-07-03T12:00:00"
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
    expectedAt: "2026-07-05T10:00:00",
    checkInTime: "2026-07-05T10:15:00",
    date: "2026-07-05",
    portal: "hostel",
    approvedBy: "Dr. K. S. Pillai (Warden)"
  },
  {
    id: "VIS-002",
    name: "Vikram Kumar",
    phone: "+91 98111 22233",
    purpose: "Personal Guest",
    visitingUnit: "A-101",
    visitingResident: "Nidhi Kumar",
    status: "expected",
    expectedAt: "2026-07-05T18:00:00",
    date: "2026-07-05",
    portal: "society",
    approvedBy: "Nidhi Kumar"
  },
  {
    id: "VIS-003",
    name: "Rohit Sharma",
    phone: "+91 98333 44444",
    purpose: "Delivery Agent / Setup Assistant",
    visitingUnit: "A-202",
    visitingResident: "Sara Shah",
    status: "checked-out",
    expectedAt: "2026-07-04T11:00:00",
    checkInTime: "2026-07-04T11:05:00",
    checkOutTime: "2026-07-04T11:45:00",
    date: "2026-07-04",
    portal: "society",
    approvedBy: "Sara Shah"
  },
  {
    id: "VIS-004",
    name: "Anita Sen",
    phone: "+91 98555 66666",
    purpose: "Relative",
    visitingUnit: "102",
    visitingResident: "Gaurav Sen",
    status: "denied",
    date: "2026-07-05",
    portal: "society",
    approvedBy: "Raj Singh (Security)"
  },
  {
    id: "VIS-005",
    name: "Amazon Logistics Courier",
    phone: "+91 98222 11000",
    purpose: "Package Delivery",
    visitingUnit: "202",
    visitingResident: "Sara Shah",
    visitingResidentId: "user-resident-1",
    status: "approved",
    isDelivery: true,
    deliveryCompany: "Amazon",
    otp: "639201",
    qrCode: "HOMEVERSE-PASS-VIS-005-639201",
    expectedAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    date: new Date().toISOString().split("T")[0],
    portal: "society"
  },
  {
    id: "VIS-006",
    name: "Karan Singhania",
    phone: "+91 98111 55443",
    purpose: "College friend meetup",
    visitingUnit: "202",
    visitingResident: "Sara Shah",
    visitingResidentId: "user-resident-1",
    status: "pending",
    otp: "892014",
    qrCode: "HOMEVERSE-PASS-VIS-006-892014",
    expectedAt: new Date().toISOString(),
    date: new Date().toISOString().split("T")[0],
    portal: "society"
  },
  {
    id: "VIS-007",
    name: "Swiggy Delivery Partner",
    phone: "+91 98777 66554",
    purpose: "Food Delivery",
    visitingUnit: "202",
    visitingResident: "Sara Shah",
    visitingResidentId: "user-resident-1",
    status: "checked-in",
    isDelivery: true,
    deliveryCompany: "Swiggy",
    checkInTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    expectedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    otp: "128394",
    qrCode: "HOMEVERSE-PASS-VIS-007-128394",
    date: new Date().toISOString().split("T")[0],
    portal: "society"
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

  // Book Machine 1 (09:00 - 10:00 AM) for Aarav Mehta
  const index1 = prepopulatedLaundrySlots.findIndex(s => s.machineId === "M1" && s.slot === "09:00 - 10:00 AM");
  if (index1 !== -1) {
    prepopulatedLaundrySlots[index1].status = "booked";
    prepopulatedLaundrySlots[index1].bookedBy = "user-student-1";
    prepopulatedLaundrySlots[index1].bookedByName = "Aarav Mehta";
  }

  // Book Machine 3 (11:00 AM - 12:00 PM) for Rohan Das
  const index3 = prepopulatedLaundrySlots.findIndex(s => s.machineId === "M3" && s.slot === "11:00 - 12:00 PM");
  if (index3 !== -1) {
    prepopulatedLaundrySlots[index3].status = "booked";
    prepopulatedLaundrySlots[index3].bookedBy = "user-student-3";
    prepopulatedLaundrySlots[index3].bookedByName = "Rohan Das";
  }

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
    receivedAt: "2026-07-04T11:30:00"
  },
  {
    id: "PRC-002",
    recipientId: "user-resident-2",
    recipientName: "Nidhi Kumar",
    unit: "A-301",
    courier: "BlueDart",
    description: "Document Envelope",
    otp: "1092",
    location: "Tower A Guard Post",
    status: "received",
    portal: "society",
    receivedAt: "2026-07-05T14:45:00"
  },
  {
    id: "PRC-003",
    recipientId: "user-student-2",
    recipientName: "Priya Sharma",
    unit: "102",
    courier: "Flipkart",
    description: "Gadget Accessories Box",
    otp: "5566",
    location: "Block B Warden Locker Room",
    status: "received",
    portal: "hostel",
    receivedAt: "2026-07-05T15:10:00"
  },
  {
    id: "PRC-004",
    recipientId: "user-resident-1",
    recipientName: "Sara Shah",
    unit: "A-202",
    courier: "Delhivery",
    description: "Home decor items package",
    otp: "9988",
    location: "Tower A Guard Post",
    status: "picked-up",
    portal: "society",
    receivedAt: "2026-07-04T10:00:00",
    pickedUpAt: "2026-07-04T17:30:00"
  }
];

export const getPrepopulatedMarketplaceItems = (): MarketplaceItem[] => [
  {
    id: "MKT-001",
    title: "Mountain Cycle (18-Speed)",
    description: "Excellent riding condition, disc brakes. Used for 1 year around campus.",
    price: "₹3,500",
    sellerId: "user-student-3",
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
    title: "Microwave Oven (Solitaire 20L)",
    description: "Compact microwave, excellent heating. Used for only 6 months. Relocating, so selling.",
    price: "₹2,500",
    sellerId: "user-resident-2",
    sellerName: "Nidhi Kumar",
    category: "Electronics",
    status: "available",
    portal: "society",
    createdAt: "2026-06-30T10:00:00"
  },
  {
    id: "MKT-004",
    title: "Wooden Study Table",
    description: "Spacious wooden study table with a drawer and small shelf. Great for students.",
    price: "₹1,200",
    sellerId: "user-resident-1",
    sellerName: "Sara Shah",
    category: "Furniture",
    status: "available",
    portal: "society",
    createdAt: "2026-07-04T15:00:00"
  },
  {
    id: "MKT-005",
    title: "Acoustic Guitar - Kadence Frontier",
    description: "Sunburst color acoustic guitar, barely used. Comes with bag and picks.",
    price: "₹3,800",
    sellerId: "user-resident-4",
    sellerName: "Kishore Kumar",
    category: "Others",
    status: "available",
    portal: "society",
    createdAt: "2026-07-03T11:00:00"
  }
];

export const getPrepopulatedFoundItems = (): FoundItem[] => [
  {
    id: "LF-001",
    reporterId: "user-student-2",
    reporterName: "Priya Sharma",
    communityCode: "VESIT26",
    category: "Other",
    description: "Casio Scientific Calculator fx-991EX found in library study room 3.",
    images: ["/images/found-calculator.jpg"],
    foundLocation: "Library study room 3",
    dateFound: "2026-07-04",
    timeFound: "16:30",
    additionalNotes: "Model fx-991EX, has some scratches.",
    status: "Pending Verification",
    portal: "hostel",
    createdAt: "2026-07-04T16:30:00Z",
    claims: []
  },
  {
    id: "LF-002",
    reporterId: "user-resident-2",
    reporterName: "Nidhi Kumar",
    communityCode: "SUN123",
    category: "Keys",
    description: "Bunch of keys found on the floor near A Wing lift entrance. Has 3 keys attached.",
    images: ["/images/found-keys.jpg"],
    foundLocation: "Near A Wing lift entrance",
    dateFound: "2026-07-05",
    timeFound: "09:00",
    additionalNotes: "Keyring has a small leather strap.",
    status: "Available",
    portal: "society",
    createdAt: "2026-07-05T09:00:00Z",
    claims: []
  },
  {
    id: "LF-003",
    reporterId: "user-security-1",
    reporterName: "Raj Singh",
    communityCode: "SUN123",
    category: "Wallet",
    description: "Brown leather wallet found in Clubhouse lobby. Contains some cash and transportation card.",
    images: ["/images/found-wallet.jpg"],
    foundLocation: "Clubhouse lobby",
    dateFound: "2026-07-02",
    timeFound: "18:00",
    additionalNotes: "Handed over to security desk immediately.",
    status: "Returned",
    portal: "society",
    createdAt: "2026-07-02T18:00:00Z",
    claims: [
      {
        id: "CLM-001",
        itemId: "LF-003",
        residentId: "user-resident-1",
        residentName: "Sara Shah",
        claimReason: "I lost my brown wallet in the clubhouse yesterday. It has my transportation card.",
        itemDetails: "Casio transportation card, two banknotes, brown faux leather.",
        proofImage: "",
        contactNumber: "+91 98765 43210",
        status: "Returned",
        approvalDate: "2026-07-03T10:00:00.000Z",
        collectionDate: "2026-07-03T10:30:00.000Z",
        collectionTime: "10:30 AM",
        collectedBy: "Sara Shah",
        verifiedBySecurity: "Raj Singh",
        createdAt: "2026-07-02T19:00:00Z"
      }
    ]
  },
  {
    id: "LF-004",
    reporterId: "user-resident-1",
    reporterName: "Sara Shah",
    communityCode: "SUN123",
    category: "Water Bottle",
    description: "Milton steel water bottle found at the clubhouse table.",
    images: ["/images/found-bottle.jpg"],
    foundLocation: "Clubhouse table",
    dateFound: "2026-07-06",
    timeFound: "11:00",
    additionalNotes: "Blue color, steel cap.",
    status: "Claim Pending Verification",
    portal: "society",
    createdAt: "2026-07-06T11:00:00Z",
    claims: [
      {
        id: "CLM-002",
        itemId: "LF-004",
        residentId: "user-resident-2",
        residentName: "Nidhi Kumar",
        claimReason: "My Milton blue bottle was left at the clubhouse table during the committee meeting.",
        itemDetails: "Blue color, scratched bottom, has a yellow sticker.",
        proofImage: "",
        contactNumber: "+91 87654 32110",
        status: "Claim Pending Verification",
        createdAt: "2026-07-06T12:00:00Z"
      }
    ]
  },
  {
    id: "LF-005",
    reporterId: "user-resident-2",
    reporterName: "Nidhi Kumar",
    communityCode: "SUN123",
    category: "Earbuds",
    description: "White Bluetooth Earbuds found near gym treadmill.",
    images: ["/images/found-earbuds.jpg"],
    foundLocation: "Gym treadmill",
    dateFound: "2026-07-07",
    timeFound: "10:00",
    additionalNotes: "Left case open.",
    status: "Ready for Pickup",
    portal: "society",
    createdAt: "2026-07-07T10:00:00Z",
    claims: [
      {
        id: "CLM-003",
        itemId: "LF-005",
        residentId: "user-resident-1",
        residentName: "Sara Shah",
        claimReason: "I forgot my white earbuds at the gym treadmill.",
        itemDetails: "White case, has a small black mark on the side.",
        proofImage: "",
        contactNumber: "+91 98765 43210",
        status: "Ready for Pickup",
        approvalDate: "2026-07-07T12:00:00.000Z",
        createdAt: "2026-07-07T11:00:00Z"
      }
    ]
  }
];

export const getPrepopulatedClaims = (): Claim[] => [
  // Defined inline above under claims of FoundItem for local offline store sync
];

export const getPrepopulatedMaintenanceBills = (): MaintenanceBill[] => [
  {
    "id": "BILL-JUL-A101",
    "residentId": "user-resident-2",
    "residentName": "Nidhi Kumar",
    "unit": "101",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-A101",
    "residentId": "user-resident-2",
    "residentName": "Nidhi Kumar",
    "unit": "101",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-A101",
    "residentId": "user-resident-2",
    "residentName": "Nidhi Kumar",
    "unit": "101",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-A101",
    "residentId": "user-resident-2",
    "residentName": "Nidhi Kumar",
    "unit": "101",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-A102",
    "residentId": "user-resident-10",
    "residentName": "Gaurav Sen",
    "unit": "102",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-A102",
    "residentId": "user-resident-10",
    "residentName": "Gaurav Sen",
    "unit": "102",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-A102",
    "residentId": "user-resident-10",
    "residentName": "Gaurav Sen",
    "unit": "102",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-A102",
    "residentId": "user-resident-10",
    "residentName": "Gaurav Sen",
    "unit": "102",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-A201",
    "residentId": "user-resident-3",
    "residentName": "Sunita Rao",
    "unit": "201",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-A201",
    "residentId": "user-resident-3",
    "residentName": "Sunita Rao",
    "unit": "201",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-A201",
    "residentId": "user-resident-3",
    "residentName": "Sunita Rao",
    "unit": "201",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-A201",
    "residentId": "user-resident-3",
    "residentName": "Sunita Rao",
    "unit": "201",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-A202",
    "residentId": "user-resident-1",
    "residentName": "Sara Shah",
    "unit": "202",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-A202",
    "residentId": "user-resident-1",
    "residentName": "Sara Shah",
    "unit": "202",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-A202",
    "residentId": "user-resident-1",
    "residentName": "Sara Shah",
    "unit": "202",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-A202",
    "residentId": "user-resident-1",
    "residentName": "Sara Shah",
    "unit": "202",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-A301",
    "residentId": "user-secretary-1",
    "residentName": "Rahul Verma",
    "unit": "301",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-A301",
    "residentId": "user-secretary-1",
    "residentName": "Rahul Verma",
    "unit": "301",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-A301",
    "residentId": "user-secretary-1",
    "residentName": "Rahul Verma",
    "unit": "301",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-A301",
    "residentId": "user-secretary-1",
    "residentName": "Rahul Verma",
    "unit": "301",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-A302",
    "residentId": "user-resident-6",
    "residentName": "Rahul Mehta",
    "unit": "302",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-A302",
    "residentId": "user-resident-6",
    "residentName": "Rahul Mehta",
    "unit": "302",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-A302",
    "residentId": "user-resident-6",
    "residentName": "Rahul Mehta",
    "unit": "302",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-A302",
    "residentId": "user-resident-6",
    "residentName": "Rahul Mehta",
    "unit": "302",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-B101",
    "residentId": "user-resident-4",
    "residentName": "Kishore Kumar",
    "unit": "101",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-B101",
    "residentId": "user-resident-4",
    "residentName": "Kishore Kumar",
    "unit": "101",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-B101",
    "residentId": "user-resident-4",
    "residentName": "Kishore Kumar",
    "unit": "101",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-B101",
    "residentId": "user-resident-4",
    "residentName": "Kishore Kumar",
    "unit": "101",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-B102",
    "residentId": "user-resident-7",
    "residentName": "Anjali Patil",
    "unit": "102",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-B102",
    "residentId": "user-resident-7",
    "residentName": "Anjali Patil",
    "unit": "102",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-B102",
    "residentId": "user-resident-7",
    "residentName": "Anjali Patil",
    "unit": "102",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-B102",
    "residentId": "user-resident-7",
    "residentName": "Anjali Patil",
    "unit": "102",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-B201",
    "residentId": "user-resident-8",
    "residentName": "Rohan Kulkarni",
    "unit": "201",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-B201",
    "residentId": "user-resident-8",
    "residentName": "Rohan Kulkarni",
    "unit": "201",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-B201",
    "residentId": "user-resident-8",
    "residentName": "Rohan Kulkarni",
    "unit": "201",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-B201",
    "residentId": "user-resident-8",
    "residentName": "Rohan Kulkarni",
    "unit": "201",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-B202",
    "residentId": "user-resident-11",
    "residentName": "Vikram Malhotra",
    "unit": "202",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-B202",
    "residentId": "user-resident-11",
    "residentName": "Vikram Malhotra",
    "unit": "202",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-B202",
    "residentId": "user-resident-11",
    "residentName": "Vikram Malhotra",
    "unit": "202",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-B202",
    "residentId": "user-resident-11",
    "residentName": "Vikram Malhotra",
    "unit": "202",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-B301",
    "residentId": "user-resident-12",
    "residentName": "Sneha Reddy",
    "unit": "301",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-B301",
    "residentId": "user-resident-12",
    "residentName": "Sneha Reddy",
    "unit": "301",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-B301",
    "residentId": "user-resident-12",
    "residentName": "Sneha Reddy",
    "unit": "301",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-B301",
    "residentId": "user-resident-12",
    "residentName": "Sneha Reddy",
    "unit": "301",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-B302",
    "residentId": "user-resident-13",
    "residentName": "Manish Sharma",
    "unit": "302",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-B302",
    "residentId": "user-resident-13",
    "residentName": "Manish Sharma",
    "unit": "302",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-B302",
    "residentId": "user-resident-13",
    "residentName": "Manish Sharma",
    "unit": "302",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-B302",
    "residentId": "user-resident-13",
    "residentName": "Manish Sharma",
    "unit": "302",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-C101",
    "residentId": "user-resident-5",
    "residentName": "Amit Joshi",
    "unit": "101",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-C101",
    "residentId": "user-resident-5",
    "residentName": "Amit Joshi",
    "unit": "101",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-C101",
    "residentId": "user-resident-5",
    "residentName": "Amit Joshi",
    "unit": "101",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-C101",
    "residentId": "user-resident-5",
    "residentName": "Amit Joshi",
    "unit": "101",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-C102",
    "residentId": "user-resident-14",
    "residentName": "Deepak Patel",
    "unit": "102",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-C102",
    "residentId": "user-resident-14",
    "residentName": "Deepak Patel",
    "unit": "102",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-C102",
    "residentId": "user-resident-14",
    "residentName": "Deepak Patel",
    "unit": "102",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-C102",
    "residentId": "user-resident-14",
    "residentName": "Deepak Patel",
    "unit": "102",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-C201",
    "residentId": "user-resident-9",
    "residentName": "Priya Desai",
    "unit": "201",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-C201",
    "residentId": "user-resident-9",
    "residentName": "Priya Desai",
    "unit": "201",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-C201",
    "residentId": "user-resident-9",
    "residentName": "Priya Desai",
    "unit": "201",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-C201",
    "residentId": "user-resident-9",
    "residentName": "Priya Desai",
    "unit": "201",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-C202",
    "residentId": "user-resident-15",
    "residentName": "Meera Iyer",
    "unit": "202",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-C202",
    "residentId": "user-resident-15",
    "residentName": "Meera Iyer",
    "unit": "202",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-C202",
    "residentId": "user-resident-15",
    "residentName": "Meera Iyer",
    "unit": "202",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-C202",
    "residentId": "user-resident-15",
    "residentName": "Meera Iyer",
    "unit": "202",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-JUL-C301",
    "residentId": "user-resident-16",
    "residentName": "Suresh Nair",
    "unit": "301",
    "month": "July 2026",
    "amount": 4500,
    "dueDate": "2026-07-10",
    "status": "paid",
    "paidOn": "2026-07-04",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-AUG-C301",
    "residentId": "user-resident-16",
    "residentName": "Suresh Nair",
    "unit": "301",
    "month": "August 2026",
    "amount": 4500,
    "dueDate": "2026-08-15",
    "status": "paid",
    "paidOn": "2026-08-08",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-SEP-C301",
    "residentId": "user-resident-16",
    "residentName": "Suresh Nair",
    "unit": "301",
    "month": "September 2026",
    "amount": 4500,
    "dueDate": "2026-09-15",
    "status": "paid",
    "paidOn": "2026-09-06",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  },
  {
    "id": "BILL-OCT-C301",
    "residentId": "user-resident-16",
    "residentName": "Suresh Nair",
    "unit": "301",
    "month": "October 2026",
    "amount": 4500,
    "dueDate": "2026-10-15",
    "status": "pending",
    "breakdown": [
      {
        "label": "Society Maintenance",
        "amount": 3000
      },
      {
        "label": "Water Charges",
        "amount": 500
      },
      {
        "label": "Electricity Charges",
        "amount": 600
      },
      {
        "label": "Parking Slot",
        "amount": 400
      }
    ]
  }
];

export const getPrepopulatedCollections = (): any[] => [];

export const getPrepopulatedPayments = (): any[] => [
  {
    "id": "PAY-JUL-A101",
    "residentId": "user-resident-2",
    "residentName": "Nidhi Kumar",
    "unit": "101",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-A101.pdf",
    "transactionId": "TXN-UPI-JUL-90185",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-A101",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-A101",
    "residentId": "user-resident-2",
    "residentName": "Nidhi Kumar",
    "unit": "101",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-A101.pdf",
    "transactionId": "TXN-UPI-AUG-94650",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-A101",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-A101",
    "residentId": "user-resident-2",
    "residentName": "Nidhi Kumar",
    "unit": "101",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-A101.pdf",
    "transactionId": "TXN-UPI-SEP-96364",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-A101",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-A101",
    "residentId": "user-resident-2",
    "residentName": "Nidhi Kumar",
    "unit": "101",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-A101.pdf",
    "transactionId": "TXN-UPI-GANESH-68418",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-A101",
    "residentId": "user-resident-2",
    "residentName": "Nidhi Kumar",
    "unit": "101",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-A101.pdf",
    "transactionId": "TXN-UPI-NAV-47466",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-A101",
    "residentId": "user-resident-2",
    "residentName": "Nidhi Kumar",
    "unit": "101",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-A101",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-A102",
    "residentId": "user-resident-10",
    "residentName": "Gaurav Sen",
    "unit": "102",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-A102.pdf",
    "transactionId": "TXN-UPI-JUL-41844",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-A102",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-A102",
    "residentId": "user-resident-10",
    "residentName": "Gaurav Sen",
    "unit": "102",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-A102.pdf",
    "transactionId": "TXN-UPI-AUG-88225",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-A102",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-A102",
    "residentId": "user-resident-10",
    "residentName": "Gaurav Sen",
    "unit": "102",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-A102.pdf",
    "transactionId": "TXN-UPI-SEP-58514",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-A102",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-A102",
    "residentId": "user-resident-10",
    "residentName": "Gaurav Sen",
    "unit": "102",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-A102.pdf",
    "transactionId": "TXN-UPI-GANESH-84000",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-A102",
    "residentId": "user-resident-10",
    "residentName": "Gaurav Sen",
    "unit": "102",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-A102.pdf",
    "transactionId": "TXN-UPI-NAV-56872",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-A102",
    "residentId": "user-resident-10",
    "residentName": "Gaurav Sen",
    "unit": "102",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-A102",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-A201",
    "residentId": "user-resident-3",
    "residentName": "Sunita Rao",
    "unit": "201",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-A201.pdf",
    "transactionId": "TXN-UPI-JUL-74968",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-A201",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-A201",
    "residentId": "user-resident-3",
    "residentName": "Sunita Rao",
    "unit": "201",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-A201.pdf",
    "transactionId": "TXN-UPI-AUG-21991",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-A201",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-A201",
    "residentId": "user-resident-3",
    "residentName": "Sunita Rao",
    "unit": "201",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-A201.pdf",
    "transactionId": "TXN-UPI-SEP-17368",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-A201",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-A201",
    "residentId": "user-resident-3",
    "residentName": "Sunita Rao",
    "unit": "201",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-A201.pdf",
    "transactionId": "TXN-UPI-GANESH-38997",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-A201",
    "residentId": "user-resident-3",
    "residentName": "Sunita Rao",
    "unit": "201",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-A201.pdf",
    "transactionId": "TXN-UPI-NAV-87581",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-A201",
    "residentId": "user-resident-3",
    "residentName": "Sunita Rao",
    "unit": "201",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-A201",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-A202",
    "residentId": "user-resident-1",
    "residentName": "Sara Shah",
    "unit": "202",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-A202.pdf",
    "transactionId": "TXN-UPI-JUL-71379",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-A202",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-A202",
    "residentId": "user-resident-1",
    "residentName": "Sara Shah",
    "unit": "202",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-A202.pdf",
    "transactionId": "TXN-UPI-AUG-35358",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-A202",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-A202",
    "residentId": "user-resident-1",
    "residentName": "Sara Shah",
    "unit": "202",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-A202.pdf",
    "transactionId": "TXN-UPI-SEP-50822",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-A202",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-A202",
    "residentId": "user-resident-1",
    "residentName": "Sara Shah",
    "unit": "202",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-A202.pdf",
    "transactionId": "TXN-UPI-GANESH-46437",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-A202",
    "residentId": "user-resident-1",
    "residentName": "Sara Shah",
    "unit": "202",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-A202.pdf",
    "transactionId": "TXN-UPI-NAV-59973",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-A202",
    "residentId": "user-resident-1",
    "residentName": "Sara Shah",
    "unit": "202",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-A202",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-A301",
    "residentId": "user-secretary-1",
    "residentName": "Rahul Verma",
    "unit": "301",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-A301.pdf",
    "transactionId": "TXN-UPI-JUL-77255",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-A301",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-A301",
    "residentId": "user-secretary-1",
    "residentName": "Rahul Verma",
    "unit": "301",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-A301.pdf",
    "transactionId": "TXN-UPI-AUG-59136",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-A301",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-A301",
    "residentId": "user-secretary-1",
    "residentName": "Rahul Verma",
    "unit": "301",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-A301.pdf",
    "transactionId": "TXN-UPI-SEP-41652",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-A301",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-A301",
    "residentId": "user-secretary-1",
    "residentName": "Rahul Verma",
    "unit": "301",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-A301.pdf",
    "transactionId": "TXN-UPI-GANESH-37855",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-A301",
    "residentId": "user-secretary-1",
    "residentName": "Rahul Verma",
    "unit": "301",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-A301.pdf",
    "transactionId": "TXN-UPI-NAV-58211",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-A301",
    "residentId": "user-secretary-1",
    "residentName": "Rahul Verma",
    "unit": "301",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-A301",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-A302",
    "residentId": "user-resident-6",
    "residentName": "Rahul Mehta",
    "unit": "302",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-A302.pdf",
    "transactionId": "TXN-UPI-JUL-56077",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-A302",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-A302",
    "residentId": "user-resident-6",
    "residentName": "Rahul Mehta",
    "unit": "302",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-A302.pdf",
    "transactionId": "TXN-UPI-AUG-65695",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-A302",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-A302",
    "residentId": "user-resident-6",
    "residentName": "Rahul Mehta",
    "unit": "302",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-A302.pdf",
    "transactionId": "TXN-UPI-SEP-69998",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-A302",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-A302",
    "residentId": "user-resident-6",
    "residentName": "Rahul Mehta",
    "unit": "302",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-A302.pdf",
    "transactionId": "TXN-UPI-GANESH-44837",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-A302",
    "residentId": "user-resident-6",
    "residentName": "Rahul Mehta",
    "unit": "302",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-A302.pdf",
    "transactionId": "TXN-UPI-NAV-55328",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-A302",
    "residentId": "user-resident-6",
    "residentName": "Rahul Mehta",
    "unit": "302",
    "building": "A Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-A302",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-B101",
    "residentId": "user-resident-4",
    "residentName": "Kishore Kumar",
    "unit": "101",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-B101.pdf",
    "transactionId": "TXN-UPI-JUL-94023",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-B101",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-B101",
    "residentId": "user-resident-4",
    "residentName": "Kishore Kumar",
    "unit": "101",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-B101.pdf",
    "transactionId": "TXN-UPI-AUG-92254",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-B101",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-B101",
    "residentId": "user-resident-4",
    "residentName": "Kishore Kumar",
    "unit": "101",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-B101.pdf",
    "transactionId": "TXN-UPI-SEP-57607",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-B101",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-B101",
    "residentId": "user-resident-4",
    "residentName": "Kishore Kumar",
    "unit": "101",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-B101.pdf",
    "transactionId": "TXN-UPI-GANESH-90635",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-B101",
    "residentId": "user-resident-4",
    "residentName": "Kishore Kumar",
    "unit": "101",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-B101.pdf",
    "transactionId": "TXN-UPI-NAV-59398",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-B101",
    "residentId": "user-resident-4",
    "residentName": "Kishore Kumar",
    "unit": "101",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-B101",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-B102",
    "residentId": "user-resident-7",
    "residentName": "Anjali Patil",
    "unit": "102",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-B102.pdf",
    "transactionId": "TXN-UPI-JUL-25208",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-B102",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-B102",
    "residentId": "user-resident-7",
    "residentName": "Anjali Patil",
    "unit": "102",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-B102.pdf",
    "transactionId": "TXN-UPI-AUG-16443",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-B102",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-B102",
    "residentId": "user-resident-7",
    "residentName": "Anjali Patil",
    "unit": "102",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-B102.pdf",
    "transactionId": "TXN-UPI-SEP-98309",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-B102",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-B102",
    "residentId": "user-resident-7",
    "residentName": "Anjali Patil",
    "unit": "102",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-B102.pdf",
    "transactionId": "TXN-UPI-GANESH-67145",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-B102",
    "residentId": "user-resident-7",
    "residentName": "Anjali Patil",
    "unit": "102",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-B102.pdf",
    "transactionId": "TXN-UPI-NAV-76405",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-B102",
    "residentId": "user-resident-7",
    "residentName": "Anjali Patil",
    "unit": "102",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-B102",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-B201",
    "residentId": "user-resident-8",
    "residentName": "Rohan Kulkarni",
    "unit": "201",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-B201.pdf",
    "transactionId": "TXN-UPI-JUL-90102",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-B201",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-B201",
    "residentId": "user-resident-8",
    "residentName": "Rohan Kulkarni",
    "unit": "201",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-B201.pdf",
    "transactionId": "TXN-UPI-AUG-75190",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-B201",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-B201",
    "residentId": "user-resident-8",
    "residentName": "Rohan Kulkarni",
    "unit": "201",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-B201.pdf",
    "transactionId": "TXN-UPI-SEP-16925",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-B201",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-B201",
    "residentId": "user-resident-8",
    "residentName": "Rohan Kulkarni",
    "unit": "201",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-B201.pdf",
    "transactionId": "TXN-UPI-GANESH-57790",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-B201",
    "residentId": "user-resident-8",
    "residentName": "Rohan Kulkarni",
    "unit": "201",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-B201.pdf",
    "transactionId": "TXN-UPI-NAV-42795",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-B201",
    "residentId": "user-resident-8",
    "residentName": "Rohan Kulkarni",
    "unit": "201",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-B201",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-B202",
    "residentId": "user-resident-11",
    "residentName": "Vikram Malhotra",
    "unit": "202",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-B202.pdf",
    "transactionId": "TXN-UPI-JUL-24833",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-B202",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-B202",
    "residentId": "user-resident-11",
    "residentName": "Vikram Malhotra",
    "unit": "202",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-B202.pdf",
    "transactionId": "TXN-UPI-AUG-62923",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-B202",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-B202",
    "residentId": "user-resident-11",
    "residentName": "Vikram Malhotra",
    "unit": "202",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-B202.pdf",
    "transactionId": "TXN-UPI-SEP-50959",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-B202",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-B202",
    "residentId": "user-resident-11",
    "residentName": "Vikram Malhotra",
    "unit": "202",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-B202.pdf",
    "transactionId": "TXN-UPI-GANESH-83226",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-B202",
    "residentId": "user-resident-11",
    "residentName": "Vikram Malhotra",
    "unit": "202",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-B202.pdf",
    "transactionId": "TXN-UPI-NAV-50469",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-B202",
    "residentId": "user-resident-11",
    "residentName": "Vikram Malhotra",
    "unit": "202",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-B202",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-B301",
    "residentId": "user-resident-12",
    "residentName": "Sneha Reddy",
    "unit": "301",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-B301.pdf",
    "transactionId": "TXN-UPI-JUL-41465",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-B301",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-B301",
    "residentId": "user-resident-12",
    "residentName": "Sneha Reddy",
    "unit": "301",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-B301.pdf",
    "transactionId": "TXN-UPI-AUG-11011",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-B301",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-B301",
    "residentId": "user-resident-12",
    "residentName": "Sneha Reddy",
    "unit": "301",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-B301.pdf",
    "transactionId": "TXN-UPI-SEP-78146",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-B301",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-B301",
    "residentId": "user-resident-12",
    "residentName": "Sneha Reddy",
    "unit": "301",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-B301.pdf",
    "transactionId": "TXN-UPI-GANESH-53938",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-B301",
    "residentId": "user-resident-12",
    "residentName": "Sneha Reddy",
    "unit": "301",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-B301.pdf",
    "transactionId": "TXN-UPI-NAV-78781",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-B301",
    "residentId": "user-resident-12",
    "residentName": "Sneha Reddy",
    "unit": "301",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-B301",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-B302",
    "residentId": "user-resident-13",
    "residentName": "Manish Sharma",
    "unit": "302",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-B302.pdf",
    "transactionId": "TXN-UPI-JUL-93322",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-B302",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-B302",
    "residentId": "user-resident-13",
    "residentName": "Manish Sharma",
    "unit": "302",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-B302.pdf",
    "transactionId": "TXN-UPI-AUG-81624",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-B302",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-B302",
    "residentId": "user-resident-13",
    "residentName": "Manish Sharma",
    "unit": "302",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-B302.pdf",
    "transactionId": "TXN-UPI-SEP-49861",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-B302",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-B302",
    "residentId": "user-resident-13",
    "residentName": "Manish Sharma",
    "unit": "302",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-B302.pdf",
    "transactionId": "TXN-UPI-GANESH-28905",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-B302",
    "residentId": "user-resident-13",
    "residentName": "Manish Sharma",
    "unit": "302",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-B302.pdf",
    "transactionId": "TXN-UPI-NAV-53640",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-B302",
    "residentId": "user-resident-13",
    "residentName": "Manish Sharma",
    "unit": "302",
    "building": "B Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-B302",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-C101",
    "residentId": "user-resident-5",
    "residentName": "Amit Joshi",
    "unit": "101",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-C101.pdf",
    "transactionId": "TXN-UPI-JUL-67847",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-C101",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-C101",
    "residentId": "user-resident-5",
    "residentName": "Amit Joshi",
    "unit": "101",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-C101.pdf",
    "transactionId": "TXN-UPI-AUG-60152",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-C101",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-C101",
    "residentId": "user-resident-5",
    "residentName": "Amit Joshi",
    "unit": "101",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-C101.pdf",
    "transactionId": "TXN-UPI-SEP-93032",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-C101",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-C101",
    "residentId": "user-resident-5",
    "residentName": "Amit Joshi",
    "unit": "101",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-C101.pdf",
    "transactionId": "TXN-UPI-GANESH-12263",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-C101",
    "residentId": "user-resident-5",
    "residentName": "Amit Joshi",
    "unit": "101",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-C101.pdf",
    "transactionId": "TXN-UPI-NAV-59019",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-C101",
    "residentId": "user-resident-5",
    "residentName": "Amit Joshi",
    "unit": "101",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-C101",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-C102",
    "residentId": "user-resident-14",
    "residentName": "Deepak Patel",
    "unit": "102",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-C102.pdf",
    "transactionId": "TXN-UPI-JUL-97389",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-C102",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-C102",
    "residentId": "user-resident-14",
    "residentName": "Deepak Patel",
    "unit": "102",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-C102.pdf",
    "transactionId": "TXN-UPI-AUG-78563",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-C102",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-C102",
    "residentId": "user-resident-14",
    "residentName": "Deepak Patel",
    "unit": "102",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-C102.pdf",
    "transactionId": "TXN-UPI-SEP-38997",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-C102",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-C102",
    "residentId": "user-resident-14",
    "residentName": "Deepak Patel",
    "unit": "102",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-C102.pdf",
    "transactionId": "TXN-UPI-GANESH-85846",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-C102",
    "residentId": "user-resident-14",
    "residentName": "Deepak Patel",
    "unit": "102",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-C102.pdf",
    "transactionId": "TXN-UPI-NAV-13557",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-C102",
    "residentId": "user-resident-14",
    "residentName": "Deepak Patel",
    "unit": "102",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-C102",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-C201",
    "residentId": "user-resident-9",
    "residentName": "Priya Desai",
    "unit": "201",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-C201.pdf",
    "transactionId": "TXN-UPI-JUL-16156",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-C201",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-C201",
    "residentId": "user-resident-9",
    "residentName": "Priya Desai",
    "unit": "201",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-C201.pdf",
    "transactionId": "TXN-UPI-AUG-23013",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-C201",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-C201",
    "residentId": "user-resident-9",
    "residentName": "Priya Desai",
    "unit": "201",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-C201.pdf",
    "transactionId": "TXN-UPI-SEP-33307",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-C201",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-C201",
    "residentId": "user-resident-9",
    "residentName": "Priya Desai",
    "unit": "201",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-C201.pdf",
    "transactionId": "TXN-UPI-GANESH-38649",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-C201",
    "residentId": "user-resident-9",
    "residentName": "Priya Desai",
    "unit": "201",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-C201.pdf",
    "transactionId": "TXN-UPI-NAV-62990",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-C201",
    "residentId": "user-resident-9",
    "residentName": "Priya Desai",
    "unit": "201",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-C201",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-C202",
    "residentId": "user-resident-15",
    "residentName": "Meera Iyer",
    "unit": "202",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-C202.pdf",
    "transactionId": "TXN-UPI-JUL-26403",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-C202",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-C202",
    "residentId": "user-resident-15",
    "residentName": "Meera Iyer",
    "unit": "202",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-C202.pdf",
    "transactionId": "TXN-UPI-AUG-16640",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-C202",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-C202",
    "residentId": "user-resident-15",
    "residentName": "Meera Iyer",
    "unit": "202",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-C202.pdf",
    "transactionId": "TXN-UPI-SEP-83180",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-C202",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-C202",
    "residentId": "user-resident-15",
    "residentName": "Meera Iyer",
    "unit": "202",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-C202.pdf",
    "transactionId": "TXN-UPI-GANESH-11727",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-C202",
    "residentId": "user-resident-15",
    "residentName": "Meera Iyer",
    "unit": "202",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-C202.pdf",
    "transactionId": "TXN-UPI-NAV-19766",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-C202",
    "residentId": "user-resident-15",
    "residentName": "Meera Iyer",
    "unit": "202",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-C202",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-JUL-C301",
    "residentId": "user-resident-16",
    "residentName": "Suresh Nair",
    "unit": "301",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-07-10",
    "paidDate": "2026-07-04",
    "receiptPath": "/receipts/RCP-JUL-C301.pdf",
    "transactionId": "TXN-UPI-JUL-71956",
    "paymentMethod": "UPI",
    "referenceId": "BILL-JUL-C301",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "description": "July 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-AUG-C301",
    "residentId": "user-resident-16",
    "residentName": "Suresh Nair",
    "unit": "301",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-08-15",
    "paidDate": "2026-08-08",
    "receiptPath": "/receipts/RCP-AUG-C301.pdf",
    "transactionId": "TXN-UPI-AUG-28516",
    "paymentMethod": "UPI",
    "referenceId": "BILL-AUG-C301",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "description": "August 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-SEP-C301",
    "residentId": "user-resident-16",
    "residentName": "Suresh Nair",
    "unit": "301",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "paid",
    "dueDate": "2026-09-15",
    "paidDate": "2026-09-06",
    "receiptPath": "/receipts/RCP-SEP-C301.pdf",
    "transactionId": "TXN-UPI-SEP-91165",
    "paymentMethod": "UPI",
    "referenceId": "BILL-SEP-C301",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "description": "September 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  },
  {
    "id": "PAY-GANESH-C301",
    "residentId": "user-resident-16",
    "residentName": "Suresh Nair",
    "unit": "301",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Ganesh Festival Contribution",
    "amount": 1000,
    "status": "paid",
    "dueDate": "2026-07-30",
    "paidDate": "2026-07-28",
    "receiptPath": "/receipts/RCP-GANESH-C301.pdf",
    "transactionId": "TXN-UPI-GANESH-40783",
    "paymentMethod": "UPI",
    "createdAt": "2026-07-20T00:00:00.000Z",
    "description": "Ganesh Festival 2026 Society Contribution & Puja Fund",
    "lateFee": 0
  },
  {
    "id": "PAY-NAV-C301",
    "residentId": "user-resident-16",
    "residentName": "Suresh Nair",
    "unit": "301",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Navratri Festival Contribution",
    "amount": 499,
    "status": "paid",
    "dueDate": "2026-10-25",
    "paidDate": "2026-10-18",
    "receiptPath": "/receipts/RCP-NAV-C301.pdf",
    "transactionId": "TXN-UPI-NAV-62978",
    "paymentMethod": "UPI",
    "createdAt": "2026-10-10T00:00:00.000Z",
    "description": "Navratri 2026 Garba Night & Cultural Evening Pass",
    "lateFee": 0
  },
  {
    "id": "PAY-OCT-C301",
    "residentId": "user-resident-16",
    "residentName": "Suresh Nair",
    "unit": "301",
    "building": "C Wing",
    "societyId": "SUN123",
    "paymentType": "Maintenance",
    "amount": 4500,
    "status": "pending",
    "dueDate": "2026-10-15",
    "referenceId": "BILL-OCT-C301",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "description": "October 2026 Society Maintenance (Maintenance: ₹3000, Water: ₹500, Electricity: ₹600, Parking: ₹400)",
    "lateFee": 0
  }
];

export const getPrepopulatedCommunityEvents = (): CommunityEvent[] => [];

export const getPrepopulatedNotifications = (): Notification[] => [
  // Nidhi Kumar (Resident)
  {
    id: "NTF-001",
    userId: "user-resident-2",
    title: "Maintenance Bill Generated",
    message: "Maintenance bill of ₹4,500 for July 2026 is due by July 10.",
    type: "warning",
    read: false,
    createdAt: "2026-07-01T09:00:00"
  },
  {
    id: "NTF-002",
    userId: "user-resident-2",
    title: "Parcel Arrived at Guard Post",
    message: "Your BlueDart courier parcel is registered. Pickup OTP: 1092.",
    type: "success",
    read: false,
    createdAt: "2026-07-05T14:45:00"
  },
  {
    id: "NTF-003",
    userId: "user-resident-2",
    title: "Visitor Checked In",
    message: "Visitor Vikram Kumar has checked in at Gate 1.",
    type: "info",
    read: false,
    createdAt: "2026-07-05T10:15:00"
  },
  // Sara Shah (Resident)
  {
    id: "NTF-004",
    userId: "user-resident-1",
    title: "Complaint In Progress",
    message: "Your complaint regarding Kitchen Pipe Water Leakage has been assigned to Plumber Amit Kumar.",
    type: "info",
    read: false,
    createdAt: "2026-07-03T10:15:00"
  },
  // Ramesh Kumar (Worker - Electrician)
  {
    id: "NTF-005",
    userId: "user-worker-1",
    title: "New Job Assigned",
    message: "You have been assigned to: Ceiling Fan Not Working in Room 204.",
    type: "info",
    read: false,
    createdAt: "2026-07-04T09:30:00"
  },
  // Amit Kumar (Worker - Plumber)
  {
    id: "NTF-006",
    userId: "user-worker-2",
    title: "New Job Assigned",
    message: "You have been assigned to: Kitchen Pipe Water Leakage in Flat A-202.",
    type: "info",
    read: false,
    createdAt: "2026-07-03T10:15:00"
  },
  // Rahul Verma (Secretary)
  {
    id: "NTF-007",
    userId: "user-secretary-1",
    title: "Maintenance Bill Paid",
    message: "Resident Sara Shah (A-202) has paid the July maintenance bill.",
    type: "success",
    read: false,
    createdAt: "2026-07-03T12:30:00"
  },
  {
    id: "NTF-008",
    userId: "user-secretary-1",
    title: "New Resident Awaiting Approval",
    message: "Resident Gaurav Sen (Flat A-102) has registered and requires your approval.",
    type: "alert",
    read: false,
    createdAt: "2026-07-05T11:00:00"
  },
  {
    id: "NTF-009",
    userId: "user-secretary-1",
    title: "Critical Complaint Registered",
    message: "High priority plumbing complaint raised by Sara Shah: Kitchen Pipe Water Leakage.",
    type: "warning",
    read: false,
    createdAt: "2026-07-03T10:00:00"
  },
  // Raj Singh (Security)
  {
    id: "NTF-010",
    userId: "user-security-1",
    title: "Visitor Gate Checkin",
    message: "Visitor Sanjay Mehta checked in for Aarav Mehta (Room 204).",
    type: "info",
    read: false,
    createdAt: "2026-07-05T10:15:00"
  },
  {
    id: "NTF-011",
    userId: "user-security-1",
    title: "New Parcel Delivered",
    message: "BlueDart parcel received for resident Nidhi Kumar (A-301).",
    type: "success",
    read: false,
    createdAt: "2026-07-05T14:45:00"
  },
  // Aarav Mehta (Student)
  {
    id: "NTF-012",
    userId: "user-student-1",
    title: "Laundry Slot Starting",
    message: "Your booked laundry slot for Washing Machine #1 starts in 10 minutes (9:00 AM).",
    type: "warning",
    read: false,
    createdAt: "2026-07-05T08:50:00"
  },
  {
    id: "NTF-013",
    userId: "user-student-1",
    title: "Incoming Parcel Received",
    message: "Amazon package received at Warden locker room. Pickup OTP: 4821.",
    type: "success",
    read: false,
    createdAt: "2026-07-04T11:30:00"
  },
  // Dr. K. S. Pillai (Warden)
  {
    id: "NTF-014",
    userId: "user-warden-1",
    title: "New Student Leave Request",
    message: "Student Aarav Mehta (Room 204) has submitted an outstation leave request.",
    type: "alert",
    read: false,
    createdAt: "2026-07-02T15:00:00"
  },
  {
    id: "NTF-015",
    userId: "user-warden-1",
    title: "Hostel Complaint Received",
    message: "Room 204 (Aarav Mehta) has reported: Ceiling Fan Making Loud Noise.",
    type: "warning",
    read: false,
    createdAt: "2026-07-04T09:00:00"
  }
];

export const getPrepopulatedUsers = (): (User & Record<string, any>)[] => [
  // --- MANAGER ---
  {
    id: "user-manager-1",
    name: "Vikram Malhotra",
    email: "manager@sunshinecomplex.com",
    phone: "+91 98765 22222",
    role: "manager",
    portal: "society",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    status: "approved",
    joinedAt: "2026-01-15",
    password: "Manager@123"
  },
  // --- SECRETARY ---
  {
    id: "user-secretary-1",
    name: "Rahul Verma",
    email: "rahul@sunshinecomplex.com",
    phone: "+91 98765 11111",
    role: "secretary",
    portal: "society",
    unit: "301",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-03-15",
    designation: "Secretary",
    committeeId: "SEC-COM-1",
    status: "approved",
    password: "Rahul@123"
  },
  // --- SECURITY (Only ONE) ---
  {
    id: "user-security-1",
    name: "Raj Singh",
    email: "raj@sunshinecomplex.com",
    phone: "+91 99887 76655",
    role: "security",
    portal: "society",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    employeeId: "SEC-9040",
    workingShift: "Morning (9 AM - 5 PM)",
    gate: "Gate 1",
    joinedAt: "2026-03-01",
    status: "approved",
    password: "Raj@123"
  },
  // --- RESIDENTS (16 Units across A, B, C Wings) ---
  {
    id: "user-resident-2",
    name: "Nidhi Kumar",
    email: "nidhi@sunshinecomplex.com",
    phone: "+91 98765 43216",
    role: "resident",
    portal: "society",
    unit: "101",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-01-15",
    status: "approved",
    password: "Nidhi@123"
  },
  {
    id: "user-resident-10",
    name: "Gaurav Sen",
    email: "gaurav@sunshinecomplex.com",
    phone: "+91 98765 43219",
    role: "resident",
    portal: "society",
    unit: "102",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Tenant",
    joinedAt: "2026-01-15",
    status: "approved",
    password: "Gaurav@123"
  },
  {
    id: "user-resident-3",
    name: "Sunita Rao",
    email: "sunita@sunshinecomplex.com",
    phone: "+91 98765 43218",
    role: "resident",
    portal: "society",
    unit: "201",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-01-15",
    status: "approved",
    password: "Sunita@123"
  },
  {
    id: "user-resident-1",
    name: "Sara Shah",
    email: "sara@sunshinecomplex.com",
    phone: "+91 98765 43210",
    role: "resident",
    portal: "society",
    unit: "202",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-01-15",
    status: "approved",
    password: "Sara@123"
  },
  {
    id: "user-resident-6",
    name: "Rahul Mehta",
    email: "rahul.mehta@sunshinecomplex.com",
    phone: "+91 98765 43211",
    role: "resident",
    portal: "society",
    unit: "302",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-01-15",
    status: "approved",
    password: "Rahul@123"
  },
  {
    id: "user-resident-4",
    name: "Kishore Kumar",
    email: "kishore@sunshinecomplex.com",
    phone: "+91 98765 43217",
    role: "resident",
    portal: "society",
    unit: "101",
    building: "B Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Tenant",
    joinedAt: "2026-01-15",
    status: "approved",
    password: "Kishore@123"
  },
  {
    id: "user-resident-7",
    name: "Anjali Patil",
    email: "anjali@sunshinecomplex.com",
    phone: "+91 98765 43212",
    role: "resident",
    portal: "society",
    unit: "102",
    building: "B Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-01-15",
    status: "approved",
    password: "Anjali@123"
  },
  {
    id: "user-resident-8",
    name: "Rohan Kulkarni",
    email: "rohan.k@sunshinecomplex.com",
    phone: "+91 98765 43213",
    role: "resident",
    portal: "society",
    unit: "201",
    building: "B Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-01-15",
    status: "approved",
    password: "Rohan@123"
  },
  {
    id: "user-resident-11",
    name: "Vikram Malhotra",
    email: "vikram.m@sunshinecomplex.com",
    phone: "+91 98765 43220",
    role: "resident",
    portal: "society",
    unit: "202",
    building: "B Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-10-01",
    status: "approved",
    password: "Vikram@123"
  },
  {
    id: "user-resident-12",
    name: "Sneha Reddy",
    email: "sneha.r@sunshinecomplex.com",
    phone: "+91 98765 43221",
    role: "resident",
    portal: "society",
    unit: "301",
    building: "B Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-10-01",
    status: "approved",
    password: "Sneha@123"
  },
  {
    id: "user-resident-13",
    name: "Manish Sharma",
    email: "manish.s@sunshinecomplex.com",
    phone: "+91 98765 43222",
    role: "resident",
    portal: "society",
    unit: "302",
    building: "B Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Tenant",
    joinedAt: "2026-10-01",
    status: "approved",
    password: "Manish@123"
  },
  {
    id: "user-resident-5",
    name: "Amit Joshi",
    email: "amit.j@sunshinecomplex.com",
    phone: "+91 98765 43215",
    role: "resident",
    portal: "society",
    unit: "101",
    building: "C Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Tenant",
    joinedAt: "2026-01-15",
    status: "approved",
    password: "Amit@123"
  },
  {
    id: "user-resident-14",
    name: "Deepak Patel",
    email: "deepak.p@sunshinecomplex.com",
    phone: "+91 98765 43223",
    role: "resident",
    portal: "society",
    unit: "102",
    building: "C Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-10-01",
    status: "approved",
    password: "Deepak@123"
  },
  {
    id: "user-resident-9",
    name: "Priya Desai",
    email: "priya.d@sunshinecomplex.com",
    phone: "+91 98765 43214",
    role: "resident",
    portal: "society",
    unit: "201",
    building: "C Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-01-15",
    status: "approved",
    password: "Priya@123"
  },
  {
    id: "user-resident-15",
    name: "Meera Iyer",
    email: "meera.i@sunshinecomplex.com",
    phone: "+91 98765 43224",
    role: "resident",
    portal: "society",
    unit: "202",
    building: "C Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-10-01",
    status: "approved",
    password: "Meera@123"
  },
  {
    id: "user-resident-16",
    name: "Suresh Nair",
    email: "suresh.n@sunshinecomplex.com",
    phone: "+91 98765 43225",
    role: "resident",
    portal: "society",
    unit: "301",
    building: "C Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-10-01",
    status: "approved",
    password: "Suresh@123"
  },
  // --- WORKERS ---
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
    specializations: ["Fan Installation", "Switch Repair", "Wiring", "Lighting", "Appliance Repair"],
    rating: 4.8,
    experience: "5 years",
    availability: "Available",
    joinedAt: "2026-02-15",
    status: "approved",
    password: "Ramesh@123"
  },
  {
    id: "user-worker-2",
    name: "Amit Kumar",
    email: "amit@sunshinecomplex.com",
    phone: "+91 87654 32110",
    role: "worker",
    portal: "society",
    building: "B Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    workerCategory: "Plumber",
    employeeId: "EMP-2941",
    workingShift: "General (10 AM - 6 PM)",
    specializations: ["Leakage", "Pipe Repair", "Tap Installation", "Bathroom Fittings"],
    rating: 4.7,
    experience: "4 years",
    availability: "Available",
    joinedAt: "2026-02-20",
    status: "approved",
    password: "Amit@123"
  },
  {
    id: "user-worker-4",
    name: "Sanjay Dutt",
    email: "sanjay@sunshinecomplex.com",
    phone: "+91 87654 32112",
    role: "worker",
    portal: "society",
    building: "C Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    workerCategory: "Carpenter",
    employeeId: "EMP-2943",
    workingShift: "Afternoon (12 PM - 8 PM)",
    specializations: ["Furniture Repair", "Door Repair", "Shelf Installation"],
    rating: 4.5,
    experience: "7 years",
    availability: "Available",
    joinedAt: "2026-03-10",
    status: "approved",
    password: "Sanjay@123"
  },
  {
    id: "user-worker-11",
    name: "Vijay Dev",
    email: "vijay@sunshinecomplex.com",
    phone: "+91 87654 32115",
    role: "worker",
    portal: "society",
    building: "C Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    workerCategory: "Painter",
    employeeId: "EMP-2946",
    workingShift: "General (9 AM - 5 PM)",
    specializations: ["Wall Painting", "Texture Paint", "Touch-up"],
    rating: 4.6,
    experience: "5 years",
    availability: "Available",
    joinedAt: "2026-03-18",
    status: "approved",
    password: "Vijay@123"
  },
  {
    id: "user-worker-5",
    name: "Pooja Sharma",
    email: "pooja@sunshinecomplex.com",
    phone: "+91 87654 32113",
    role: "worker",
    portal: "society",
    building: "B Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    workerCategory: "Housekeeping",
    employeeId: "EMP-2944",
    workingShift: "Morning (8 AM - 4 PM)",
    specializations: ["Deep Cleaning", "Dusting", "Trash Removal"],
    rating: 4.8,
    experience: "3 years",
    availability: "Available",
    joinedAt: "2026-03-12",
    status: "approved",
    password: "Pooja@123"
  },
  {
    id: "user-worker-6",
    name: "Ram Lal",
    email: "ramlal@sunshinecomplex.com",
    phone: "+91 87654 32114",
    role: "worker",
    portal: "society",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    workerCategory: "Gardener",
    employeeId: "EMP-2945",
    workingShift: "Morning (8 AM - 4 PM)",
    specializations: ["Lawn Mowing", "Pruning", "Watering", "Planting"],
    rating: 4.7,
    experience: "10 years",
    availability: "Available",
    joinedAt: "2026-03-15",
    status: "approved",
    password: "Ramlal@123"
  },
  // --- MAIDS (4 different maids with different specializations) ---
  {
    id: "user-worker-3",
    name: "Meena Sharma",
    email: "meena@sunshinecomplex.com",
    phone: "+91 87654 32111",
    role: "worker",
    portal: "society",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    workerCategory: "Maid",
    employeeId: "EMP-2942",
    workingShift: "Morning (7 AM - 1 PM)",
    specializations: ["Cleaning", "Utensils"],
    rating: 4.8,
    experience: "6 years",
    availability: "Available",
    joinedAt: "2026-03-01",
    status: "approved",
    password: "Meena@123"
  },
  {
    id: "user-worker-8",
    name: "Sunita Patil",
    email: "sunita.patil@sunshinecomplex.com",
    phone: "+91 87654 32118",
    role: "worker",
    portal: "society",
    building: "B Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    workerCategory: "Maid",
    employeeId: "EMP-2947",
    workingShift: "Morning (6 AM - 12 PM)",
    specializations: ["Cooking", "Cleaning"],
    rating: 5.0,
    experience: "8 years",
    availability: "Available",
    joinedAt: "2026-03-05",
    status: "approved",
    password: "Sunita@123"
  },
  {
    id: "user-worker-9",
    name: "Rani Sharma",
    email: "rani@sunshinecomplex.com",
    phone: "+91 87654 32119",
    role: "worker",
    portal: "society",
    building: "C Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    workerCategory: "Maid",
    employeeId: "EMP-2948",
    workingShift: "Afternoon (1 PM - 6 PM)",
    specializations: ["Laundry", "Cleaning"],
    rating: 4.5,
    experience: "3 years",
    availability: "Available",
    joinedAt: "2026-03-08",
    status: "approved",
    password: "Rani@123"
  },
  {
    id: "user-worker-10",
    name: "Kavita Joshi",
    email: "kavita@sunshinecomplex.com",
    phone: "+91 87654 32120",
    role: "worker",
    portal: "society",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    workerCategory: "Maid",
    employeeId: "EMP-2949",
    workingShift: "Morning (8 AM - 2 PM)",
    specializations: ["Cooking", "Baby Care"],
    rating: 5.0,
    experience: "8 years",
    availability: "Available",
    joinedAt: "2026-03-12",
    status: "approved",
    password: "Kavita@123"
  },
  // --- WARDEN ---
  {
    id: "user-warden-1",
    name: "Dr. K. S. Pillai",
    email: "pillai@vesit.edu",
    phone: "+91 65432 10987",
    role: "warden",
    portal: "hostel",
    assignedWing: "Wing A",
    hostelName: "Girls Hostel",
    collegeName: "Vivekanand Education Society Institute of Technology",
    communityCode: "VESIT26",
    employeeId: "WDN-1082",
    joinedAt: "2026-05-20",
    status: "approved",
    password: "Pillai@123"
  },
  {
    id: "user-warden-2",
    name: "Dr. A. P. J. Prasad",
    email: "prasad@vesit.edu",
    phone: "+91 65432 10988",
    role: "warden",
    portal: "hostel",
    assignedWing: "Wing B",
    hostelName: "Boys Hostel",
    collegeName: "Vivekanand Education Society Institute of Technology",
    communityCode: "VESIT26",
    employeeId: "WDN-1083",
    joinedAt: "2026-05-22",
    status: "approved",
    password: "Prasad@123"
  },
  // --- STUDENTS ---
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
    year: "FY",
    branch: "EXTC",
    gender: "Male",
    joinedAt: "2026-07-01",
    status: "approved",
    password: "Aarav@123"
  },
  {
    id: "user-student-2",
    name: "Priya Sharma",
    email: "priya@vesit.edu",
    phone: "+91 76543 21099",
    role: "student",
    portal: "hostel",
    unit: "102",
    building: "Wing B",
    hostelName: "Girls Hostel",
    collegeName: "Vivekanand Education Society Institute of Technology",
    communityCode: "VESIT26",
    course: "Information Technology",
    year: "SY",
    branch: "CMPN",
    gender: "Female",
    joinedAt: "2026-07-01",
    status: "approved",
    password: "Priya@123"
  },
  {
    id: "user-student-3",
    name: "Rohan Das",
    email: "rohan@vesit.edu",
    phone: "+91 76543 21100",
    role: "student",
    portal: "hostel",
    unit: "105",
    building: "Wing A",
    hostelName: "Boys Hostel",
    collegeName: "Vivekanand Education Society Institute of Technology",
    communityCode: "VESIT26",
    course: "Electronics & Telecom",
    year: "TY",
    branch: "IT",
    gender: "Male",
    joinedAt: "2026-07-02",
    status: "approved",
    password: "Rohan@123"
  },
  {
    id: "user-student-4",
    name: "Sneha Reddy",
    email: "sneha@vesit.edu",
    phone: "+91 76543 21101",
    role: "student",
    portal: "hostel",
    unit: "205",
    building: "Wing B",
    hostelName: "Girls Hostel",
    collegeName: "Vivekanand Education Society Institute of Technology",
    communityCode: "VESIT26",
    course: "Instrumentation Eng",
    year: "LY",
    branch: "INST",
    gender: "Female",
    joinedAt: "2026-07-02",
    status: "approved",
    password: "Sneha@123"
  },
  {
    id: "user-student-5",
    name: "Kabir Malhotra",
    email: "kabir@vesit.edu",
    phone: "+91 76543 21102",
    role: "student",
    portal: "hostel",
    unit: "301",
    building: "Wing A",
    hostelName: "Boys Hostel",
    collegeName: "Vivekanand Education Society Institute of Technology",
    communityCode: "VESIT26",
    course: "Computer Science",
    year: "SY",
    branch: "EXTC",
    gender: "Male",
    joinedAt: "2026-07-03",
    status: "approved",
    password: "Kabir@123"
  },
  {
    id: "user-student-6",
    name: "Ananya Iyer",
    email: "ananya@vesit.edu",
    phone: "+91 76543 21103",
    role: "student",
    portal: "hostel",
    unit: "302",
    building: "Wing B",
    hostelName: "Girls Hostel",
    collegeName: "Vivekanand Education Society Institute of Technology",
    communityCode: "VESIT26",
    course: "Computer Science",
    year: "FY",
    branch: "CMPN",
    gender: "Female",
    joinedAt: "2026-07-03",
    status: "approved",
    password: "Ananya@123"
  }
];

export const getPrepopulatedEmergencies = (): EmergencyAlert[] => [
  {
    id: "EMG-001",
    residentId: "user-resident-2",
    residentName: "Nidhi Kumar",
    unit: "101",
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
    "id": "PASS-001",
    "name": "Ravi Kumar (Interior Designer)",
    "company": "HomeDecor Studio",
    "purpose": "Renovation contractor team",
    "validFrom": "2026-11-10T11:14:58.699Z",
    "validTo": "2026-11-17T13:14:58.701Z",
    "assignedResident": "Nidhi Kumar",
    "unit": "101",
    "building": "A Wing",
    "status": "active",
    "otp": "682910",
    "qrCodeData": "HOMEVERSE-PASS-PASS-001-682910",
    "createdAt": "2026-11-10T11:14:58.701Z"
  },
  {
    "id": "GP-1011",
    "name": "Kamla Devi",
    "phone": "+91 98201 10101",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "08:00 AM - 12:00 PM",
    "assignedResident": "Nidhi Kumar",
    "unit": "101",
    "building": "A Wing",
    "status": "active",
    "otp": "131415",
    "qrCodeData": "HOMEVERSE-PASS-GP-1011-131415",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-1021",
    "name": "Rekha Shinde",
    "phone": "+91 98201 10102",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "07:30 AM - 11:30 AM",
    "assignedResident": "Gaurav Sen",
    "unit": "102",
    "building": "A Wing",
    "status": "active",
    "otp": "162830",
    "qrCodeData": "HOMEVERSE-PASS-GP-1021-162830",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-1022",
    "name": "Pooja Sharma",
    "phone": "+91 98201 10103",
    "passType": "Cook",
    "purpose": "Cook Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "allowedTimings": "07:00 AM - 10:00 AM",
    "assignedResident": "Gaurav Sen",
    "unit": "102",
    "building": "A Wing",
    "status": "active",
    "otp": "194245",
    "qrCodeData": "HOMEVERSE-PASS-GP-1022-194245",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-2011",
    "name": "Laxmi Bai",
    "phone": "+91 98201 10201",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "09:00 AM - 01:00 PM",
    "assignedResident": "Sunita Rao",
    "unit": "201",
    "building": "A Wing",
    "status": "active",
    "otp": "225660",
    "qrCodeData": "HOMEVERSE-PASS-GP-2011-225660",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-2021",
    "name": "Sunita Patil",
    "phone": "+91 87654 32118",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "allowedTimings": "07:00 AM - 01:00 PM",
    "assignedResident": "Sara Shah",
    "unit": "202",
    "building": "A Wing",
    "status": "active",
    "otp": "257075",
    "qrCodeData": "HOMEVERSE-PASS-GP-2021-257075",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-2022",
    "name": "Meena Sharma",
    "phone": "+91 98201 12345",
    "passType": "Cook",
    "purpose": "Cook Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "07:00 AM - 12:00 PM",
    "assignedResident": "Sara Shah",
    "unit": "202",
    "building": "A Wing",
    "status": "active",
    "otp": "288490",
    "qrCodeData": "HOMEVERSE-PASS-GP-2022-288490",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-3011",
    "name": "Geeta Maurya",
    "phone": "+91 98201 10301",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "08:30 AM - 12:30 PM",
    "assignedResident": "Rahul Verma (Secretary)",
    "unit": "301",
    "building": "A Wing",
    "status": "active",
    "otp": "319905",
    "qrCodeData": "HOMEVERSE-PASS-GP-3011-319905",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-3021",
    "name": "Anita Pawar",
    "phone": "+91 98201 10302",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "07:00 AM - 11:00 AM",
    "assignedResident": "Rahul Mehta",
    "unit": "302",
    "building": "A Wing",
    "status": "active",
    "otp": "351320",
    "qrCodeData": "HOMEVERSE-PASS-GP-3021-351320",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-3022",
    "name": "Shanti Bai",
    "phone": "+91 98201 10303",
    "passType": "Cook",
    "purpose": "Cook Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "allowedTimings": "06:30 PM - 09:30 PM",
    "assignedResident": "Rahul Mehta",
    "unit": "302",
    "building": "A Wing",
    "status": "active",
    "otp": "382735",
    "qrCodeData": "HOMEVERSE-PASS-GP-3022-382735",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-4011",
    "name": "Radha Yadav",
    "phone": "+91 98201 20101",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "08:00 AM - 12:00 PM",
    "assignedResident": "Kishore Kumar",
    "unit": "101",
    "building": "B Wing",
    "status": "active",
    "otp": "414150",
    "qrCodeData": "HOMEVERSE-PASS-GP-4011-414150",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-4021",
    "name": "Kavita Das",
    "phone": "+91 98201 20102",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "07:30 AM - 11:30 AM",
    "assignedResident": "Anjali Patil",
    "unit": "102",
    "building": "B Wing",
    "status": "active",
    "otp": "445565",
    "qrCodeData": "HOMEVERSE-PASS-GP-4021-445565",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-4022",
    "name": "Vimla Devi",
    "phone": "+91 98201 20103",
    "passType": "Cook",
    "purpose": "Cook Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "07:00 AM - 10:30 AM",
    "assignedResident": "Anjali Patil",
    "unit": "102",
    "building": "B Wing",
    "status": "active",
    "otp": "476980",
    "qrCodeData": "HOMEVERSE-PASS-GP-4022-476980",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-5011",
    "name": "Suman Kumari",
    "phone": "+91 98201 20201",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "09:00 AM - 01:00 PM",
    "assignedResident": "Rohan Kulkarni",
    "unit": "201",
    "building": "B Wing",
    "status": "active",
    "otp": "508395",
    "qrCodeData": "HOMEVERSE-PASS-GP-5011-508395",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-5021",
    "name": "Poonam Solanki",
    "phone": "+91 98201 20202",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "08:00 AM - 12:00 PM",
    "assignedResident": "Vikram Malhotra",
    "unit": "202",
    "building": "B Wing",
    "status": "active",
    "otp": "539810",
    "qrCodeData": "HOMEVERSE-PASS-GP-5021-539810",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-5022",
    "name": "Asha Ben",
    "phone": "+91 98201 20203",
    "passType": "Cook",
    "purpose": "Cook Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "allowedTimings": "06:00 PM - 09:00 PM",
    "assignedResident": "Vikram Malhotra",
    "unit": "202",
    "building": "B Wing",
    "status": "active",
    "otp": "571225",
    "qrCodeData": "HOMEVERSE-PASS-GP-5022-571225",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-6011",
    "name": "Deepa Rao",
    "phone": "+91 98201 20301",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "08:30 AM - 12:30 PM",
    "assignedResident": "Sneha Reddy",
    "unit": "301",
    "building": "B Wing",
    "status": "active",
    "otp": "602640",
    "qrCodeData": "HOMEVERSE-PASS-GP-6011-602640",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-6021",
    "name": "Sarita Verma",
    "phone": "+91 98201 20302",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "07:30 AM - 11:30 AM",
    "assignedResident": "Manish Sharma",
    "unit": "302",
    "building": "B Wing",
    "status": "active",
    "otp": "634055",
    "qrCodeData": "HOMEVERSE-PASS-GP-6021-634055",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-6022",
    "name": "Kiran Joshi",
    "phone": "+91 98201 20303",
    "passType": "Cook",
    "purpose": "Cook Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "07:00 AM - 11:00 AM",
    "assignedResident": "Manish Sharma",
    "unit": "302",
    "building": "B Wing",
    "status": "active",
    "otp": "665470",
    "qrCodeData": "HOMEVERSE-PASS-GP-6022-665470",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-7011",
    "name": "Usha Rathod",
    "phone": "+91 98201 30101",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "08:00 AM - 12:00 PM",
    "assignedResident": "Amit Joshi",
    "unit": "101",
    "building": "C Wing",
    "status": "active",
    "otp": "696885",
    "qrCodeData": "HOMEVERSE-PASS-GP-7011-696885",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-7012",
    "name": "Maya Patel",
    "phone": "+91 98201 30102",
    "passType": "Cook",
    "purpose": "Cook Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "allowedTimings": "07:00 AM - 10:30 AM",
    "assignedResident": "Amit Joshi",
    "unit": "101",
    "building": "C Wing",
    "status": "active",
    "otp": "728300",
    "qrCodeData": "HOMEVERSE-PASS-GP-7012-728300",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-7021",
    "name": "Mangala Bai",
    "phone": "+91 98201 30103",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "09:00 AM - 01:00 PM",
    "assignedResident": "Deepak Patel",
    "unit": "102",
    "building": "C Wing",
    "status": "active",
    "otp": "759715",
    "qrCodeData": "HOMEVERSE-PASS-GP-7021-759715",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-8011",
    "name": "Tara Devi",
    "phone": "+91 98201 30201",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "07:30 AM - 11:30 AM",
    "assignedResident": "Priya Desai",
    "unit": "201",
    "building": "C Wing",
    "status": "active",
    "otp": "791130",
    "qrCodeData": "HOMEVERSE-PASS-GP-8011-791130",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-8012",
    "name": "Indira Shinde",
    "phone": "+91 98201 30202",
    "passType": "Cook",
    "purpose": "Cook Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "06:30 PM - 09:30 PM",
    "assignedResident": "Priya Desai",
    "unit": "201",
    "building": "C Wing",
    "status": "active",
    "otp": "822545",
    "qrCodeData": "HOMEVERSE-PASS-GP-8012-822545",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-8021",
    "name": "Savita More",
    "phone": "+91 98201 30203",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "08:00 AM - 12:00 PM",
    "assignedResident": "Meera Iyer",
    "unit": "202",
    "building": "C Wing",
    "status": "active",
    "otp": "853960",
    "qrCodeData": "HOMEVERSE-PASS-GP-8021-853960",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-9011",
    "name": "Manju Devi",
    "phone": "+91 98201 30301",
    "passType": "Maid",
    "purpose": "Maid Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "allowedTimings": "07:00 AM - 11:00 AM",
    "assignedResident": "Suresh Nair",
    "unit": "301",
    "building": "C Wing",
    "status": "active",
    "otp": "885375",
    "qrCodeData": "HOMEVERSE-PASS-GP-9011-885375",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "id": "GP-9012",
    "name": "Lakshmi Nair",
    "phone": "+91 98201 30302",
    "passType": "Cook",
    "purpose": "Cook Domestic Pass",
    "validFrom": "2026-01-01",
    "validTo": "Open",
    "permittedDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "allowedTimings": "07:30 AM - 11:00 AM",
    "assignedResident": "Suresh Nair",
    "unit": "301",
    "building": "C Wing",
    "status": "active",
    "otp": "916790",
    "qrCodeData": "HOMEVERSE-PASS-GP-9012-916790",
    "createdAt": "2026-01-15T08:00:00.000Z"
  }
];

export const getPrepopulatedVehicleLogs = (): VehicleLog[] => [
  {
    id: "VEH-001",
    vehicleNumber: "MH-12-AB-1234",
    ownerName: "Nidhi Kumar",
    ownerType: "resident",
    unit: "101",
    building: "A Wing",
    entryTime: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    status: "inside"
  },
  {
    id: "VEH-002",
    vehicleNumber: "MH-14-CD-5678",
    ownerName: "Delivery Cab (Uber)",
    ownerType: "delivery",
    unit: "204",
    building: "A Wing",
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
    reporter: "Raj Singh",
    createdAt: new Date().toISOString()
  }
];

export const getPrepopulatedAnnouncements = (): Announcement[] => [
  {
    id: "ANN-001",
    title: "Water Tank Cleaning Notice",
    content: "Please note that the main overhead water tanks for Tower A & B will be cleaned on Sunday between 10:00 AM and 04:00 PM. Water supply will be suspended.",
    author: "Rahul Verma",
    authorRole: "secretary",
    priority: "important",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    tags: ["Maintenance", "Water Supply"]
  },
  {
    id: "ANN-002",
    title: "Gate 2 Parking Restrictions",
    content: "Gate 2 access road is undergoing pavement repair. Please do not park vehicles near the gate walkway.",
    author: "Raj Singh",
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
  // A Wing (6 flats)
  { id: "FL-A101", building: "A Wing", wing: "A", floor: 1, flatNumber: "101", status: "occupied", residentId: "user-resident-2", residentName: "Nidhi Kumar" },
  { id: "FL-A102", building: "A Wing", wing: "A", floor: 1, flatNumber: "102", status: "occupied", residentId: "user-resident-10", residentName: "Gaurav Sen" },
  { id: "FL-A201", building: "A Wing", wing: "A", floor: 2, flatNumber: "201", status: "occupied", residentId: "user-resident-3", residentName: "Sunita Rao" },
  { id: "FL-A202", building: "A Wing", wing: "A", floor: 2, flatNumber: "202", status: "occupied", residentId: "user-resident-1", residentName: "Sara Shah" },
  { id: "FL-A301", building: "A Wing", wing: "A", floor: 3, flatNumber: "301", status: "occupied", residentId: "user-secretary-1", residentName: "Rahul Verma (Secretary)" },
  { id: "FL-A302", building: "A Wing", wing: "A", floor: 3, flatNumber: "302", status: "occupied", residentId: "user-resident-6", residentName: "Rahul Mehta" },

  // B Wing (6 flats)
  { id: "FL-B101", building: "B Wing", wing: "B", floor: 1, flatNumber: "101", status: "occupied", residentId: "user-resident-4", residentName: "Kishore Kumar" },
  { id: "FL-B102", building: "B Wing", wing: "B", floor: 1, flatNumber: "102", status: "occupied", residentId: "user-resident-7", residentName: "Anjali Patil" },
  { id: "FL-B201", building: "B Wing", wing: "B", floor: 2, flatNumber: "201", status: "occupied", residentId: "user-resident-8", residentName: "Rohan Kulkarni" },
  { id: "FL-B202", building: "B Wing", wing: "B", floor: 2, flatNumber: "202", status: "occupied", residentId: "user-resident-11", residentName: "Vikram Malhotra" },
  { id: "FL-B301", building: "B Wing", wing: "B", floor: 3, flatNumber: "301", status: "occupied", residentId: "user-resident-12", residentName: "Sneha Reddy" },
  { id: "FL-B302", building: "B Wing", wing: "B", floor: 3, flatNumber: "302", status: "occupied", residentId: "user-resident-13", residentName: "Manish Sharma" },

  // C Wing (5 flats)
  { id: "FL-C101", building: "C Wing", wing: "C", floor: 1, flatNumber: "101", status: "occupied", residentId: "user-resident-5", residentName: "Amit Joshi" },
  { id: "FL-C102", building: "C Wing", wing: "C", floor: 1, flatNumber: "102", status: "occupied", residentId: "user-resident-14", residentName: "Deepak Patel" },
  { id: "FL-C201", building: "C Wing", wing: "C", floor: 2, flatNumber: "201", status: "occupied", residentId: "user-resident-9", residentName: "Priya Desai" },
  { id: "FL-C202", building: "C Wing", wing: "C", floor: 2, flatNumber: "202", status: "occupied", residentId: "user-resident-15", residentName: "Meera Iyer" },
  { id: "FL-C301", building: "C Wing", wing: "C", floor: 3, flatNumber: "301", status: "occupied", residentId: "user-resident-16", residentName: "Suresh Nair" }
];

export const getPrepopulatedRentRecords = (): RentRecord[] => [
  {
    id: "RNT-001",
    unit: "101",
    building: "B Wing",
    tenantName: "Kishore Kumar",
    amount: 15000,
    dueDate: "2026-07-05",
    status: "pending"
  },
  {
    id: "RNT-002",
    unit: "101",
    building: "C Wing",
    tenantName: "Amit Shah",
    amount: 18000,
    dueDate: "2026-07-01",
    status: "paid",
    paidOn: "2026-06-30"
  },
  {
    id: "RNT-003",
    unit: "204",
    building: "Wing A",
    tenantName: "Aarav Mehta",
    amount: 25000,
    dueDate: "2026-08-10",
    status: "pending"
  },
  {
    id: "RNT-004",
    unit: "201",
    building: "Wing A",
    tenantName: "Rohan Das",
    amount: 25000,
    dueDate: "2026-08-10",
    status: "paid",
    paidOn: "2026-07-05"
  }
];

export const getPrepopulatedLostReports = (): LostReport[] => [
  {
    id: "LR-001",
    residentId: "user-resident-1",
    itemName: "Black Leather Wallet",
    category: "Wallet",
    brand: "Wildhorn",
    colour: "Black",
    description: "Lost my black leather wallet near the clubhouse gym entrance or parking area.",
    distinguishingFeatures: "Contains a college ID and a driver's license for Sara Shah.",
    dateLost: "2026-07-14",
    timeLost: "18:00",
    lastSeenLocation: "Clubhouse Gym Entrance",
    status: "Searching",
    images: [],
    additionalNotes: "Reward if found.",
    portal: "society",
    communityCode: "SUN123",
    createdAt: new Date().toISOString()
  },
  {
    id: "LR-002",
    residentId: "user-resident-2",
    itemName: "Silver Ring",
    category: "Jewellery",
    brand: "Orra",
    colour: "Silver",
    description: "Lost a silver band ring in the common playground area.",
    distinguishingFeatures: "Engraved with initials 'NK'.",
    dateLost: "2026-07-13",
    timeLost: "17:00",
    lastSeenLocation: "Garden Playground",
    status: "Possible Match Found",
    images: [],
    additionalNotes: "Very sentimental.",
    portal: "society",
    communityCode: "SUN123",
    createdAt: new Date().toISOString()
  }
];

export const getPrepopulatedItemMatches = (): ItemMatch[] => [
  {
    id: "MT-001",
    lostReportId: "LR-002",
    foundItemId: "LF-002",
    status: "Suggested",
    verifiedBy: undefined,
    verificationDate: undefined,
    createdAt: new Date().toISOString()
  }
];

export const getPrepopulatedHelpers = (): Helper[] => [
  {
    "id": "HLP-101",
    "name": "Kamla Devi",
    "category": "Maid",
    "phone": "+91 98201 10101",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "08:00 AM",
    "expectedExit": "12:00 PM",
    "assignedFlats": [
      "101",
      "A-101",
      "A Wing 101"
    ],
    "assignedResidents": [
      "Nidhi Kumar"
    ],
    "residentIds": [
      "user-resident-2"
    ],
    "joinedAt": "2026-01-10",
    "portal": "society",
    "passId": "GP-1011",
    "passStatus": "active"
  },
  {
    "id": "HLP-102",
    "name": "Rekha Shinde",
    "category": "Maid",
    "phone": "+91 98201 10102",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "07:30 AM",
    "expectedExit": "11:30 AM",
    "assignedFlats": [
      "102",
      "A-102",
      "A Wing 102"
    ],
    "assignedResidents": [
      "Gaurav Sen"
    ],
    "residentIds": [
      "user-resident-10"
    ],
    "joinedAt": "2026-01-12",
    "portal": "society",
    "passId": "GP-1021",
    "passStatus": "active"
  },
  {
    "id": "HLP-103",
    "name": "Pooja Sharma",
    "category": "Cook",
    "phone": "+91 98201 10103",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "expectedArrival": "07:00 AM",
    "expectedExit": "10:00 AM",
    "assignedFlats": [
      "102",
      "A-102",
      "A Wing 102"
    ],
    "assignedResidents": [
      "Gaurav Sen"
    ],
    "residentIds": [
      "user-resident-10"
    ],
    "joinedAt": "2026-01-15",
    "portal": "society",
    "passId": "GP-1022",
    "passStatus": "active"
  },
  {
    "id": "HLP-104",
    "name": "Laxmi Bai",
    "category": "Maid",
    "phone": "+91 98201 10201",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "09:00 AM",
    "expectedExit": "01:00 PM",
    "assignedFlats": [
      "201",
      "A-201",
      "A Wing 201"
    ],
    "assignedResidents": [
      "Sunita Rao"
    ],
    "residentIds": [
      "user-resident-3"
    ],
    "joinedAt": "2026-01-18",
    "portal": "society",
    "passId": "GP-2011",
    "passStatus": "active"
  },
  {
    "id": "HLP-105",
    "name": "Sunita Patil",
    "category": "Maid",
    "phone": "+91 87654 32118",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "expectedArrival": "07:00 AM",
    "expectedExit": "01:00 PM",
    "assignedFlats": [
      "202",
      "A-202",
      "A Wing 202"
    ],
    "assignedResidents": [
      "Sara Shah"
    ],
    "residentIds": [
      "user-resident-1"
    ],
    "joinedAt": "2026-01-15",
    "portal": "society",
    "passId": "GP-2021",
    "passStatus": "active"
  },
  {
    "id": "HLP-106",
    "name": "Meena Sharma",
    "category": "Cook",
    "phone": "+91 98201 12345",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "07:00 AM",
    "expectedExit": "12:00 PM",
    "assignedFlats": [
      "202",
      "A-202",
      "A Wing 202"
    ],
    "assignedResidents": [
      "Sara Shah"
    ],
    "residentIds": [
      "user-resident-1"
    ],
    "joinedAt": "2026-02-01",
    "portal": "society",
    "passId": "GP-2022",
    "passStatus": "active"
  },
  {
    "id": "HLP-107",
    "name": "Geeta Maurya",
    "category": "Maid",
    "phone": "+91 98201 10301",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "08:30 AM",
    "expectedExit": "12:30 PM",
    "assignedFlats": [
      "301",
      "A-301",
      "A Wing 301"
    ],
    "assignedResidents": [
      "Rahul Verma (Secretary)"
    ],
    "residentIds": [
      "user-secretary-1"
    ],
    "joinedAt": "2026-01-20",
    "portal": "society",
    "passId": "GP-3011",
    "passStatus": "active"
  },
  {
    "id": "HLP-108",
    "name": "Anita Pawar",
    "category": "Maid",
    "phone": "+91 98201 10302",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "07:00 AM",
    "expectedExit": "11:00 AM",
    "assignedFlats": [
      "302",
      "A-302",
      "A Wing 302"
    ],
    "assignedResidents": [
      "Rahul Mehta"
    ],
    "residentIds": [
      "user-resident-6"
    ],
    "joinedAt": "2026-01-22",
    "portal": "society",
    "passId": "GP-3021",
    "passStatus": "active"
  },
  {
    "id": "HLP-109",
    "name": "Shanti Bai",
    "category": "Cook",
    "phone": "+91 98201 10303",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "expectedArrival": "06:30 PM",
    "expectedExit": "09:30 PM",
    "assignedFlats": [
      "302",
      "A-302",
      "A Wing 302"
    ],
    "assignedResidents": [
      "Rahul Mehta"
    ],
    "residentIds": [
      "user-resident-6"
    ],
    "joinedAt": "2026-01-25",
    "portal": "society",
    "passId": "GP-3022",
    "passStatus": "active"
  },
  {
    "id": "HLP-110",
    "name": "Radha Yadav",
    "category": "Maid",
    "phone": "+91 98201 20101",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "08:00 AM",
    "expectedExit": "12:00 PM",
    "assignedFlats": [
      "101",
      "B-101",
      "B Wing 101"
    ],
    "assignedResidents": [
      "Kishore Kumar"
    ],
    "residentIds": [
      "user-resident-4"
    ],
    "joinedAt": "2026-02-01",
    "portal": "society",
    "passId": "GP-4011",
    "passStatus": "active"
  },
  {
    "id": "HLP-111",
    "name": "Kavita Das",
    "category": "Maid",
    "phone": "+91 98201 20102",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "07:30 AM",
    "expectedExit": "11:30 AM",
    "assignedFlats": [
      "102",
      "B-102",
      "B Wing 102"
    ],
    "assignedResidents": [
      "Anjali Patil"
    ],
    "residentIds": [
      "user-resident-7"
    ],
    "joinedAt": "2026-02-03",
    "portal": "society",
    "passId": "GP-4021",
    "passStatus": "active"
  },
  {
    "id": "HLP-112",
    "name": "Vimla Devi",
    "category": "Cook",
    "phone": "+91 98201 20103",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "07:00 AM",
    "expectedExit": "10:30 AM",
    "assignedFlats": [
      "102",
      "B-102",
      "B Wing 102"
    ],
    "assignedResidents": [
      "Anjali Patil"
    ],
    "residentIds": [
      "user-resident-7"
    ],
    "joinedAt": "2026-02-05",
    "portal": "society",
    "passId": "GP-4022",
    "passStatus": "active"
  },
  {
    "id": "HLP-113",
    "name": "Suman Kumari",
    "category": "Maid",
    "phone": "+91 98201 20201",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "09:00 AM",
    "expectedExit": "01:00 PM",
    "assignedFlats": [
      "201",
      "B-201",
      "B Wing 201"
    ],
    "assignedResidents": [
      "Rohan Kulkarni"
    ],
    "residentIds": [
      "user-resident-8"
    ],
    "joinedAt": "2026-02-08",
    "portal": "society",
    "passId": "GP-5011",
    "passStatus": "active"
  },
  {
    "id": "HLP-114",
    "name": "Poonam Solanki",
    "category": "Maid",
    "phone": "+91 98201 20202",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "08:00 AM",
    "expectedExit": "12:00 PM",
    "assignedFlats": [
      "202",
      "B-202",
      "B Wing 202"
    ],
    "assignedResidents": [
      "Vikram Malhotra"
    ],
    "residentIds": [
      "user-resident-11"
    ],
    "joinedAt": "2026-02-10",
    "portal": "society",
    "passId": "GP-5021",
    "passStatus": "active"
  },
  {
    "id": "HLP-115",
    "name": "Asha Ben",
    "category": "Cook",
    "phone": "+91 98201 20203",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "expectedArrival": "06:00 PM",
    "expectedExit": "09:00 PM",
    "assignedFlats": [
      "202",
      "B-202",
      "B Wing 202"
    ],
    "assignedResidents": [
      "Vikram Malhotra"
    ],
    "residentIds": [
      "user-resident-11"
    ],
    "joinedAt": "2026-02-12",
    "portal": "society",
    "passId": "GP-5022",
    "passStatus": "active"
  },
  {
    "id": "HLP-116",
    "name": "Deepa Rao",
    "category": "Maid",
    "phone": "+91 98201 20301",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "08:30 AM",
    "expectedExit": "12:30 PM",
    "assignedFlats": [
      "301",
      "B-301",
      "B Wing 301"
    ],
    "assignedResidents": [
      "Sneha Reddy"
    ],
    "residentIds": [
      "user-resident-12"
    ],
    "joinedAt": "2026-02-15",
    "portal": "society",
    "passId": "GP-6011",
    "passStatus": "active"
  },
  {
    "id": "HLP-117",
    "name": "Sarita Verma",
    "category": "Maid",
    "phone": "+91 98201 20302",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "07:30 AM",
    "expectedExit": "11:30 AM",
    "assignedFlats": [
      "302",
      "B-302",
      "B Wing 302"
    ],
    "assignedResidents": [
      "Manish Sharma"
    ],
    "residentIds": [
      "user-resident-13"
    ],
    "joinedAt": "2026-02-18",
    "portal": "society",
    "passId": "GP-6021",
    "passStatus": "active"
  },
  {
    "id": "HLP-118",
    "name": "Kiran Joshi",
    "category": "Cook",
    "phone": "+91 98201 20303",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "07:00 AM",
    "expectedExit": "11:00 AM",
    "assignedFlats": [
      "302",
      "B-302",
      "B Wing 302"
    ],
    "assignedResidents": [
      "Manish Sharma"
    ],
    "residentIds": [
      "user-resident-13"
    ],
    "joinedAt": "2026-02-20",
    "portal": "society",
    "passId": "GP-6022",
    "passStatus": "active"
  },
  {
    "id": "HLP-119",
    "name": "Usha Rathod",
    "category": "Maid",
    "phone": "+91 98201 30101",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "08:00 AM",
    "expectedExit": "12:00 PM",
    "assignedFlats": [
      "101",
      "C-101",
      "C Wing 101"
    ],
    "assignedResidents": [
      "Amit Joshi"
    ],
    "residentIds": [
      "user-resident-5"
    ],
    "joinedAt": "2026-02-22",
    "portal": "society",
    "passId": "GP-7011",
    "passStatus": "active"
  },
  {
    "id": "HLP-120",
    "name": "Maya Patel",
    "category": "Cook",
    "phone": "+91 98201 30102",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "expectedArrival": "07:00 AM",
    "expectedExit": "10:30 AM",
    "assignedFlats": [
      "101",
      "C-101",
      "C Wing 101"
    ],
    "assignedResidents": [
      "Amit Joshi"
    ],
    "residentIds": [
      "user-resident-5"
    ],
    "joinedAt": "2026-02-25",
    "portal": "society",
    "passId": "GP-7012",
    "passStatus": "active"
  },
  {
    "id": "HLP-121",
    "name": "Mangala Bai",
    "category": "Maid",
    "phone": "+91 98201 30103",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "09:00 AM",
    "expectedExit": "01:00 PM",
    "assignedFlats": [
      "102",
      "C-102",
      "C Wing 102"
    ],
    "assignedResidents": [
      "Deepak Patel"
    ],
    "residentIds": [
      "user-resident-14"
    ],
    "joinedAt": "2026-03-01",
    "portal": "society",
    "passId": "GP-7021",
    "passStatus": "active"
  },
  {
    "id": "HLP-122",
    "name": "Tara Devi",
    "category": "Maid",
    "phone": "+91 98201 30201",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "07:30 AM",
    "expectedExit": "11:30 AM",
    "assignedFlats": [
      "201",
      "C-201",
      "C Wing 201"
    ],
    "assignedResidents": [
      "Priya Desai"
    ],
    "residentIds": [
      "user-resident-9"
    ],
    "joinedAt": "2026-03-03",
    "portal": "society",
    "passId": "GP-8011",
    "passStatus": "active"
  },
  {
    "id": "HLP-123",
    "name": "Indira Shinde",
    "category": "Cook",
    "phone": "+91 98201 30202",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "06:30 PM",
    "expectedExit": "09:30 PM",
    "assignedFlats": [
      "201",
      "C-201",
      "C Wing 201"
    ],
    "assignedResidents": [
      "Priya Desai"
    ],
    "residentIds": [
      "user-resident-9"
    ],
    "joinedAt": "2026-03-05",
    "portal": "society",
    "passId": "GP-8012",
    "passStatus": "active"
  },
  {
    "id": "HLP-124",
    "name": "Savita More",
    "category": "Maid",
    "phone": "+91 98201 30203",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "08:00 AM",
    "expectedExit": "12:00 PM",
    "assignedFlats": [
      "202",
      "C-202",
      "C Wing 202"
    ],
    "assignedResidents": [
      "Meera Iyer"
    ],
    "residentIds": [
      "user-resident-15"
    ],
    "joinedAt": "2026-03-08",
    "portal": "society",
    "passId": "GP-8021",
    "passStatus": "active"
  },
  {
    "id": "HLP-125",
    "name": "Manju Devi",
    "category": "Maid",
    "phone": "+91 98201 30301",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "expectedArrival": "07:00 AM",
    "expectedExit": "11:00 AM",
    "assignedFlats": [
      "301",
      "C-301",
      "C Wing 301"
    ],
    "assignedResidents": [
      "Suresh Nair"
    ],
    "residentIds": [
      "user-resident-16"
    ],
    "joinedAt": "2026-03-10",
    "portal": "society",
    "passId": "GP-9011",
    "passStatus": "active"
  },
  {
    "id": "HLP-126",
    "name": "Lakshmi Nair",
    "category": "Cook",
    "phone": "+91 98201 30302",
    "workingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "expectedArrival": "07:30 AM",
    "expectedExit": "11:00 AM",
    "assignedFlats": [
      "301",
      "C-301",
      "C Wing 301"
    ],
    "assignedResidents": [
      "Suresh Nair"
    ],
    "residentIds": [
      "user-resident-16"
    ],
    "joinedAt": "2026-03-12",
    "portal": "society",
    "passId": "GP-9012",
    "passStatus": "active"
  }
];

export const getPrepopulatedHelperAttendance = (): HelperAttendance[] => [
  {
    "id": "ATT-001",
    "workerId": "HLP-105",
    "workerName": "Sunita Patil",
    "workerCategory": "Maid",
    "date": "2026-11-10",
    "checkInTime": "2026-11-10T10:14:58.701Z",
    "entryGate": "Main Security Gate",
    "assignedFlats": [
      "202",
      "A-202"
    ],
    "status": "checked-in"
  },
  {
    "id": "ATT-002",
    "workerId": "HLP-106",
    "workerName": "Meena Sharma",
    "workerCategory": "Cook",
    "date": "2026-11-10",
    "checkInTime": "2026-11-10T09:14:58.701Z",
    "checkOutTime": "2026-11-10T12:14:58.701Z",
    "entryGate": "Main Security Gate",
    "assignedFlats": [
      "202",
      "A-202"
    ],
    "status": "checked-out"
  },
  {
    "id": "ATT-003",
    "workerId": "HLP-101",
    "workerName": "Kamla Devi",
    "workerCategory": "Maid",
    "date": "2026-11-10",
    "checkInTime": "2026-11-10T11:14:58.701Z",
    "entryGate": "Gate 1",
    "assignedFlats": [
      "101",
      "A-101"
    ],
    "status": "checked-in"
  },
  {
    "id": "ATT-004",
    "workerId": "HLP-103",
    "workerName": "Pooja Sharma",
    "workerCategory": "Cook",
    "date": "2026-11-10",
    "checkInTime": "2026-11-10T08:14:58.701Z",
    "checkOutTime": "2026-11-10T11:14:58.701Z",
    "entryGate": "Main Security Gate",
    "assignedFlats": [
      "102",
      "A-102"
    ],
    "status": "checked-out"
  },
  {
    "id": "ATT-005",
    "workerId": "HLP-110",
    "workerName": "Radha Yadav",
    "workerCategory": "Maid",
    "date": "2026-11-10",
    "checkInTime": "2026-11-10T12:14:58.701Z",
    "entryGate": "Gate 2",
    "assignedFlats": [
      "101",
      "B-101"
    ],
    "status": "checked-in"
  },
  {
    "id": "ATT-006",
    "workerId": "HLP-119",
    "workerName": "Usha Rathod",
    "workerCategory": "Maid",
    "date": "2026-11-10",
    "checkInTime": "2026-11-10T10:44:58.701Z",
    "entryGate": "Main Security Gate",
    "assignedFlats": [
      "101",
      "C-101"
    ],
    "status": "checked-in"
  }
];

export const getPrepopulatedFlatAttendance = (): any[] => [
  {
    "id": "FLA-ATT-001",
    "helperId": "HLP-105",
    "helperName": "Sunita Patil",
    "date": "2026-11-10",
    "residentId": "user-resident-1",
    "residentName": "Sara Shah",
    "flatNumber": "202",
    "checkInTime": "2026-11-10T10:14:58.701Z",
    "checkOutTime": "2026-11-10T11:44:58.701Z",
    "duration": 90,
    "servicePerformed": "Dusting & Cleaning",
    "status": "completed",
    "notes": "Living room and kitchen cleaned thoroughly"
  },
  {
    "id": "FLA-ATT-002",
    "helperId": "HLP-106",
    "helperName": "Meena Sharma",
    "date": "2026-11-10",
    "residentId": "user-resident-1",
    "residentName": "Sara Shah",
    "flatNumber": "202",
    "checkInTime": "2026-11-10T09:14:58.701Z",
    "checkOutTime": "2026-11-10T12:14:58.701Z",
    "duration": 180,
    "servicePerformed": "Cooking",
    "status": "completed",
    "notes": "Breakfast and lunch prepared"
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
  lostFoundItems: getPrepopulatedFoundItems(),
  lostReports: getPrepopulatedLostReports(),
  itemMatches: getPrepopulatedItemMatches(),
  claims: getPrepopulatedClaims(),
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
  rentRecords: getPrepopulatedRentRecords(),
  payments: getPrepopulatedPayments(),
  collections: getPrepopulatedCollections(),
  helpers: getPrepopulatedHelpers(),
  attendance: getPrepopulatedHelperAttendance(),
  flatAttendance: getPrepopulatedFlatAttendance()
});
