import { create } from "zustand";
import { User, UserRole, PortalType } from "@/types";

// Default Mock Users
export const MOCK_USERS: Record<string, User & Record<string, any>> = {
  resident: {
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
  },
  worker: {
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
  },
  student: {
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
    rollNumber: "NIT-2024-089",
    course: "Computer Science",
    year: "3rd Year",
    joinedAt: "2026-07-01",
  },
  warden: {
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
  },
  security: {
    id: "user-security-1",
    name: "Rahul Sharma",
    email: "rahul@sunshinecomplex.com",
    phone: "+91 99887 76655",
    role: "security",
    portal: "society",
    societyName: "Sunshine Complex",
    communityCode: "SUN123",
    employeeId: "SEC-9040",
    workingShift: "Morning",
    gate: "Gate 1",
    joinedAt: "2026-03-01",
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
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, role: UserRole, portal: PortalType) => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Try to match email with registered users in useCommunityStore
    const { useCommunityStore } = require("./useCommunityStore");
    const existingUsers = useCommunityStore.getState().users || [];

    let loggedInUser = existingUsers.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.role === role && u.portal === portal
    );

    if (!loggedInUser) {
      // Fallback: check static mock users list
      const matchingMock = Object.values(MOCK_USERS).find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role && u.portal === portal
      );
      if (matchingMock) {
        loggedInUser = matchingMock;
        // Seed into community store database so they are linked
        useCommunityStore.getState().addRegisteredUser(matchingMock);
      }
    }

    if (!loggedInUser) {
      set({ isLoading: false });
      return false;
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
      const { useCommunityStore } = require("./useCommunityStore");
      useCommunityStore.getState().addRegisteredUser(mockUser);
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

    const { useCommunityStore } = require("./useCommunityStore");
    useCommunityStore.getState().addRegisteredUser(newUser);

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
