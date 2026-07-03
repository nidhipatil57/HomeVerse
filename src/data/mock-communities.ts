export interface MockSociety {
  name: string;
  code: string;
  domain: string;
  buildings: string[];
  floors: number;
  flatsPerFloor: number;
}

export interface MockHostel {
  name: string; // College Name
  code: string;
  domain: string;
  hostels: string[]; // e.g. ["Girls Hostel", "Boys Hostel"]
  wings: string[]; // e.g. ["Wing A", "Wing B"]
  floors: number;
  roomsPerFloor: number;
  capacityPerRoom: number;
}

export const MOCK_SOCIETIES: MockSociety[] = [
  {
    name: "Sunshine Complex",
    code: "SUN123",
    domain: "sunshinecomplex.com",
    buildings: ["A Wing", "B Wing", "C Wing"],
    floors: 10,
    flatsPerFloor: 4,
  },
  {
    name: "Green Heights",
    code: "GRN456",
    domain: "greenheights.com",
    buildings: ["Tower A", "Tower B", "Tower C", "Tower D"],
    floors: 15,
    flatsPerFloor: 6,
  },
  {
    name: "Maple Residency",
    code: "MAP789",
    domain: "mapleresidency.com",
    buildings: ["East Wing", "West Wing"],
    floors: 12,
    flatsPerFloor: 8,
  },
];

export const MOCK_HOSTELS: MockHostel[] = [
  {
    name: "Vivekanand Education Society Institute of Technology",
    code: "VESIT26",
    domain: "vesit.edu",
    hostels: ["Girls Hostel", "Boys Hostel"],
    wings: ["Wing A", "Wing B"],
    floors: 5,
    roomsPerFloor: 20,
    capacityPerRoom: 2,
  },
  {
    name: "Indian Institute of Technology Madras",
    code: "IITM01",
    domain: "iitmhostel.edu",
    hostels: ["Hostel 1", "Hostel 2", "Hostel 3"],
    wings: ["Wing A", "Wing B"],
    floors: 8,
    roomsPerFloor: 30,
    capacityPerRoom: 3,
  },
  {
    name: "Sardar Patel Institute of Technology",
    code: "SPIT22",
    domain: "spit.edu",
    hostels: ["Girls Hostel", "Boys Hostel"],
    wings: ["Wing A", "Wing B"],
    floors: 6,
    roomsPerFloor: 24,
    capacityPerRoom: 2,
  },
];

export const validateFlatNumber = (flatStr: string, floors: number, flatsPerFloor: number) => {
  const val = parseInt(flatStr, 10);
  if (isNaN(val) || val <= 0) return false;

  const floor = Math.floor(val / 100);
  const flatIndex = val % 100;

  if (floor < 1 || floor > floors) return false;
  if (flatIndex < 1 || flatIndex > flatsPerFloor) return false;
  return true;
};
