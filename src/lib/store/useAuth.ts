import { create } from "zustand";
import { User, UserRole, PortalType } from "@/types";

// Default Mock Users
export const MOCK_USERS: Record<string, User & Record<string, any>> = {
  resident: {
    id: "user-resident-1",
    name: "Nidhi Kumar",
    email: "nidhi@society.com",
    phone: "+91 98765 43210",
    role: "resident",
    portal: "society",
    unit: "A-301",
    building: "Tower A",
    societyName: "Harmony Heights",
    ownerOrTenant: "Owner",
    joinedAt: "2026-01-10",
  },
  worker: {
    id: "user-worker-1",
    name: "Ramesh Kumar",
    email: "ramesh@society.com",
    phone: "+91 87654 32109",
    role: "worker",
    portal: "society",
    building: "Tower A & B",
    societyName: "Harmony Heights",
    workerCategory: "Electrician",
    employeeId: "EMP-2940",
    workingShift: "Morning (9 AM - 5 PM)",
    joinedAt: "2026-02-15",
  },
  student: {
    id: "user-student-1",
    name: "Aarav Mehta",
    email: "aarav@hostel.com",
    phone: "+91 76543 21098",
    role: "student",
    portal: "hostel",
    unit: "204",
    building: "Block B",
    hostelName: "Vidya Bhawan Hostel",
    collegeName: "National Institute of Technology",
    rollNumber: "NIT-2024-089",
    course: "Computer Science",
    year: "3rd Year",
    joinedAt: "2026-07-01",
  },
  warden: {
    id: "user-warden-1",
    name: "Dr. K. S. Pillai",
    email: "pillai@hostel.com",
    phone: "+91 65432 10987",
    role: "warden",
    portal: "hostel",
    building: "Block A & B",
    hostelName: "Vidya Bhawan Hostel",
    employeeId: "WDN-1082",
    joinedAt: "2026-05-20",
  },
};

interface AuthState {
  user: (User & Record<string, any>) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: UserRole, portal: PortalType) => Promise<boolean>;
  loginAsMock: (role: UserRole) => void;
  registerUser: (userData: Partial<User & Record<string, any>>) => Promise<boolean>;
  logout: () => void;
  initialize: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("homeverse_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ user: parsed, isAuthenticated: true, isLoading: false });
      } else {
        // Default: Log in as resident (Nidhi Kumar) to maintain existing flow
        const defaultUser = MOCK_USERS.resident;
        localStorage.setItem("homeverse_auth", JSON.stringify(defaultUser));
        set({ user: defaultUser, isAuthenticated: true, isLoading: false });
      }
    } catch (e) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, role: UserRole, portal: PortalType) => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Try to match email with mock user, or create one
    const matchingMock = Object.values(MOCK_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    let loggedInUser: User & Record<string, any>;

    if (matchingMock && matchingMock.role === role) {
      loggedInUser = matchingMock;
    } else {
      // Create a fallback mock user with this email
      const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      loggedInUser = {
        id: `user-gen-${Date.now()}`,
        name: name,
        email: email,
        phone: "+91 99999 99999",
        role: role,
        portal: portal,
        joinedAt: new Date().toISOString().split("T")[0],
        ...(portal === "society"
          ? {
              societyName: "Harmony Heights",
              building: "Tower A",
              unit: role === "resident" ? "A-301" : undefined,
              workerCategory: role === "worker" ? "Electrician" : undefined,
              employeeId: role === "worker" ? `EMP-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
            }
          : {
              hostelName: "Vidya Bhawan Hostel",
              building: "Block A",
              unit: role === "student" ? "101" : undefined,
              employeeId: role === "warden" ? `WDN-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
            }),
      };
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("homeverse_auth", JSON.stringify(loggedInUser));
    }
    set({ user: loggedInUser, isAuthenticated: true, isLoading: false });
    return true;
  },

  loginAsMock: (role: UserRole) => {
    const mockUser = MOCK_USERS[role];
    if (mockUser) {
      if (typeof window !== "undefined") {
        localStorage.setItem("homeverse_auth", JSON.stringify(mockUser));
      }
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    }
  },

  registerUser: async (userData: Partial<User & Record<string, any>>) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newUser: User & Record<string, any> = {
      id: `user-${Date.now()}`,
      name: userData.name || "New User",
      email: userData.email || "new@example.com",
      phone: userData.phone || "+91 00000 00000",
      role: userData.role || "resident",
      portal: userData.portal || "society",
      avatar: userData.avatar,
      unit: userData.unit,
      building: userData.building,
      joinedAt: new Date().toISOString().split("T")[0],
      ...userData,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("homeverse_auth", JSON.stringify(newUser));
    }
    set({ user: newUser, isAuthenticated: true, isLoading: false });
    return true;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("homeverse_auth");
    }
    set({ user: null, isAuthenticated: false });
  },
}));
