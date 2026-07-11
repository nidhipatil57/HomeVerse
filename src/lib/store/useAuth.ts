import { create } from "zustand";
import { User, UserRole, PortalType } from "@/types";

// Default Mock Users
export const MOCK_USERS: Record<string, User & Record<string, any>> = {
  resident: {
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
    password: "Sara@123",
  },
  worker: {
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
    joinedAt: "2026-02-20",
    status: "approved",
    password: "Amit@123",
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
    course: "Computer Science",
    year: "FY",
    branch: "EXTC",
    gender: "Male",
    joinedAt: "2026-07-01",
    status: "approved",
    password: "Aarav@123",
  },
  warden: {
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
    password: "Pillai@123",
  },
  security: {
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
    password: "Raj@123",
  },
  secretary: {
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
    designation: "Secretary",
    committeeId: "SEC-COM-1",
    status: "approved",
    joinedAt: "2026-03-15",
    password: "Rahul@123",
  },
};

interface AuthState {
  user: (User & Record<string, any>) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole, portal: PortalType) => Promise<boolean>;
  loginWithGoogle: (role: UserRole, portal: PortalType) => Promise<"success" | "pending">;
  loginAsMock: (role: UserRole) => Promise<void> | void;
  registerUser: (userData: Partial<User & Record<string, any>>) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => void;
  updateProfile: (details: Partial<User & Record<string, any>>) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("homeverse_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ user: parsed, isAuthenticated: true, isLoading: false });
        
        // Fetch fresh copy from backend if online
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              localStorage.setItem("homeverse_auth", JSON.stringify(data.user));
              set({ user: data.user, isAuthenticated: true });
            }
          } else {
            localStorage.removeItem("homeverse_auth");
            set({ user: null, isAuthenticated: false });
          }
        } catch (e) {}
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password, role, portal) => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false });
        throw new Error(data.error || "Login failed");
      }
      
      const profile = data.user;
      if (profile.role !== role || profile.portal !== portal) {
        await fetch("/api/auth/logout", { method: "POST" });
        set({ isLoading: false });
        throw new Error("Invalid portal or role for this account.");
      }
      
      if (profile.status === "pending") {
        await fetch("/api/auth/logout", { method: "POST" });
        set({ isLoading: false });
        throw new Error("Your account is pending Secretary approval.");
      }
      
      if (profile.status === "rejected" || profile.status === "deactivated") {
        await fetch("/api/auth/logout", { method: "POST" });
        set({ isLoading: false });
        throw new Error(`Your account status is ${profile.status}.`);
      }
      
      if (typeof window !== "undefined") {
        localStorage.setItem("homeverse_auth", JSON.stringify(profile));
      }
      set({ user: profile, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  loginWithGoogle: async (role, portal) => {
    set({ isLoading: true });
    try {
      // Simulate Google Sign-In with mock accounts
      const defaultEmail = portal === "society" 
        ? (role === "secretary" ? "rahul@sunshinecomplex.com" : "sara@sunshinecomplex.com")
        : (role === "warden" ? "pillai@vesit.edu" : "aarav@vesit.edu");
      
      const defaultPassword = portal === "society"
        ? (role === "secretary" ? "Rahul@123" : "Sara@123")
        : (role === "warden" ? "Pillai@123" : "Aarav@123");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: defaultEmail, password: defaultPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false });
        throw new Error(data.error || "Google login simulation failed");
      }

      const profile = data.user;
      if (typeof window !== "undefined") {
        localStorage.setItem("homeverse_auth", JSON.stringify(profile));
      }
      set({ user: profile, isAuthenticated: true, isLoading: false });
      return "success";
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  loginAsMock: async (role) => {
    const mockUser = MOCK_USERS[role];
    if (mockUser) {
      await get().login(mockUser.email, mockUser.password || "Sara@123", mockUser.role, mockUser.portal);
    }
  },

  registerUser: async (userData) => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false });
        throw new Error(data.error || "Registration failed");
      }

      const newUser = data.user;
      if (newUser.status === "approved") {
        if (typeof window !== "undefined") {
          localStorage.setItem("homeverse_auth", JSON.stringify(newUser));
        }
        set({ user: newUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
      return true;
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("homeverse_auth");
    }
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (details) => {
    const user = get().user;
    if (user) {
      const updated = { ...user, ...details };
      set({ user: updated });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("homeverse_auth", JSON.stringify(updated));
        } catch (e) {}
      }
      try {
        await fetch("/api/auth/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(details)
        });
      } catch (e) {}
    }
  },
}));
