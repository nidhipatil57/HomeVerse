import { Complaint, Visitor, User, Announcement, EmergencyAlert, GatePass, VehicleLog, IncidentReport, SocietyExpense, FlatInfo, RentRecord } from "@/types";
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
    unit: "A-204",
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
    unit: "A-301",
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
    visitingUnit: "A-301",
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
    visitingUnit: "A-204",
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
    visitingUnit: "A-102",
    visitingResident: "Gaurav Sen",
    status: "denied",
    date: "2026-07-05",
    portal: "society",
    approvedBy: "Raj Singh (Security)"
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
    unit: "A-204",
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
    status: "Available for Claim",
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
    id: "BILL-001",
    residentId: "user-resident-2",
    residentName: "Nidhi Kumar",
    unit: "A-301",
    month: "July 2026",
    amount: 4500,
    dueDate: "2026-07-10",
    status: "pending"
  },
  {
    id: "BILL-002",
    residentId: "user-resident-1",
    residentName: "Sara Shah",
    unit: "A-204",
    month: "July 2026",
    amount: 4500,
    dueDate: "2026-07-10",
    status: "paid",
    paidOn: "2026-07-03"
  },
  {
    id: "BILL-003",
    residentId: "user-resident-3",
    residentName: "Sunita Rao",
    unit: "A-201",
    month: "June 2026",
    amount: 4500,
    dueDate: "2026-06-10",
    status: "overdue"
  },
  {
    id: "BILL-004",
    residentId: "user-resident-4",
    residentName: "Kishore Kumar",
    unit: "B-101",
    month: "July 2026",
    amount: 4000,
    dueDate: "2026-07-10",
    status: "pending"
  },
  {
    id: "BILL-005",
    residentId: "user-resident-5",
    residentName: "Amit Shah",
    unit: "101",
    month: "July 2026",
    amount: 4200,
    dueDate: "2026-07-10",
    status: "paid",
    paidOn: "2026-07-02"
  }
];

export const getPrepopulatedCommunityEvents = (): CommunityEvent[] => [
  {
    id: "EV-001",
    title: "Society Annual General Meeting (AGM)",
    description: "Annual meeting to discuss society audit, upcoming budgets, security guidelines and vendor contracts.",
    date: "2026-08-10",
    time: "10:00 AM - 01:00 PM",
    location: "Clubhouse Hall",
    organizer: "Society Committee",
    priority: "important",
    rsvps: []
  },
  {
    id: "EV-002",
    title: "Independence Day Cultural Fest",
    description: "Traditional music, dance events, flag hoisting ceremony and evening high tea at the main clubhouse lawn.",
    date: "2026-08-15",
    time: "09:00 AM - 07:00 PM",
    location: "Main Clubhouse Lawn",
    organizer: "Cultural Committee",
    priority: "urgent",
    rsvps: []
  },
  {
    id: "EV-003",
    title: "Weekend Yoga & Wellness Camp",
    description: "Guided meditation and yoga sessions by professional trainers. Open to all residents.",
    date: "2026-07-20",
    time: "06:00 AM - 08:00 AM",
    location: "Society Park",
    organizer: "Fitness Committee",
    priority: "normal",
    rsvps: []
  },
  {
    id: "EV-004",
    title: "VESIT Annual Hostel Coding Hackathon",
    description: "12-hour coding marathon. Teams of 2. Exciting cash prizes and certificates for all participants.",
    date: "2026-07-25",
    time: "09:00 AM - 09:00 PM",
    location: "Hostel Common Room",
    organizer: "Warden Office",
    priority: "normal",
    rsvps: []
  },
  {
    id: "EV-005",
    title: "Hostel Freshers Welcoming Meetup",
    description: "Welcome party for the first-year student batch. Dinner, music, and interactive sessions.",
    date: "2026-07-15",
    time: "06:00 PM - 09:00 PM",
    location: "Hostel Dining Hall",
    organizer: "Senior Students Committee",
    priority: "important",
    rsvps: []
  },
  {
    id: "EV-006",
    title: "Table Tennis & Chess Tournament",
    description: "Indoor sports tournament inside the hostel gaming zone. Registrations open now.",
    date: "2026-07-30",
    time: "10:00 AM - 05:00 PM",
    location: "Hostel Recreation Room",
    organizer: "Sports Committee",
    priority: "normal",
    rsvps: []
  }
];

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
    message: "You have been assigned to: Kitchen Pipe Water Leakage in Flat A-204.",
    type: "info",
    read: false,
    createdAt: "2026-07-03T10:15:00"
  },
  // Rahul Verma (Secretary)
  {
    id: "NTF-007",
    userId: "user-secretary-1",
    title: "Maintenance Bill Paid",
    message: "Resident Sara Shah (A-204) has paid the July maintenance bill.",
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
  // --- SECRETARY ---
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
  // --- RESIDENTS (10 unique flats) ---
  {
    id: "user-resident-1",
    name: "Sara Shah",
    email: "sara@sunshinecomplex.com",
    phone: "+91 98765 43210",
    role: "resident",
    portal: "society",
    unit: "204",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-01-10",
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
    joinedAt: "2026-01-12",
    status: "approved",
    password: "Rahul@123"
  },
  {
    id: "user-resident-7",
    name: "Anjali Patil",
    email: "anjali@sunshinecomplex.com",
    phone: "+91 98765 43212",
    role: "resident",
    portal: "society",
    unit: "105",
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
    unit: "503",
    building: "B Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-01-20",
    status: "approved",
    password: "Rohan@123"
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
    joinedAt: "2026-01-25",
    status: "approved",
    password: "Priya@123"
  },
  {
    id: "user-resident-5",
    name: "Amit Joshi",
    email: "amit.j@sunshinecomplex.com",
    phone: "+91 98765 43215",
    role: "resident",
    portal: "society",
    unit: "404",
    building: "C Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Tenant",
    joinedAt: "2026-02-05",
    status: "approved",
    password: "Amit@123"
  },
  {
    id: "user-resident-2",
    name: "Nidhi Kumar",
    email: "nidhi@sunshinecomplex.com",
    phone: "+91 98765 43216",
    role: "resident",
    portal: "society",
    unit: "301",
    building: "A Wing",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    ownerOrTenant: "Owner",
    joinedAt: "2026-01-10",
    status: "approved",
    password: "Nidhi@123"
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
    joinedAt: "2026-04-15",
    status: "approved",
    password: "Kishore@123"
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
    joinedAt: "2026-02-18",
    status: "approved",
    password: "Sunita@123"
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
    joinedAt: "2026-07-02",
    status: "approved",
    password: "Gaurav@123"
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
  { id: "FL-A101", building: "A Wing", wing: "A", floor: 1, flatNumber: "101", status: "occupied", residentId: "user-resident-5", residentName: "Amit Shah" },
  { id: "FL-A102", building: "A Wing", wing: "A", floor: 1, flatNumber: "102", status: "occupied", residentId: "user-resident-6", residentName: "Gaurav Sen" },
  { id: "FL-A201", building: "A Wing", wing: "A", floor: 2, flatNumber: "201", status: "occupied", residentId: "user-resident-3", residentName: "Sunita Rao" },
  { id: "FL-A204", building: "A Wing", wing: "A", floor: 2, flatNumber: "204", status: "occupied", residentId: "user-resident-1", residentName: "Sara Shah" },
  { id: "FL-A301", building: "A Wing", wing: "A", floor: 3, flatNumber: "301", status: "occupied", residentId: "user-resident-2", residentName: "Nidhi Kumar" },
  { id: "FL-A302", building: "A Wing", wing: "A", floor: 3, flatNumber: "302", status: "occupied", residentId: "user-secretary-1", residentName: "Rahul Verma" },
  { id: "FL-B101", building: "B Wing", wing: "B", floor: 1, flatNumber: "101", status: "occupied", residentId: "user-resident-4", residentName: "Kishore Kumar" },
  { id: "FL-C101", building: "C Wing", wing: "C", floor: 1, flatNumber: "101", status: "vacant" }
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
