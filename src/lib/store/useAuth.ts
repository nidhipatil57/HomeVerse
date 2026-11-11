import { create } from "zustand";
import { User, UserRole, PortalType } from "@/types";
import { getPrepopulatedUsers } from "@/data/mock-db-seed";

// Default Mock Users
export const MOCK_USERS: Record<string, User & Record<string, any>> = {
  resident: {
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
    unit: "301",
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
  manager: {
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
    password: "Manager@123",
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

const getInitialStoredUser = (): (User & Record<string, any>) | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("homeverse_auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && (parsed.name === "Sara Shah" || parsed.email === "sara@sunshinecomplex.com")) {
        parsed.unit = "202";
        parsed.building = "A Wing";
        try { localStorage.setItem("homeverse_auth", JSON.stringify(parsed)); } catch (e) {}
      }
      return parsed;
    }
  } catch (e) {
    // ignore
  }
  return null;
};

const initialUser = getInitialStoredUser();
export const AUTH_TOKEN_KEY = "homeverse_token";

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getStoredAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

let sessionVerifiedThisLoad = false;

export const useAuth = create<AuthState>((set, get) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  isLoading: false,

  initialize: async () => {
    if (typeof window === "undefined") return;
    let activeUser = get().user;
    if (!activeUser) {
      try {
        const stored = localStorage.getItem("homeverse_auth");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.name === "Sara Shah" || parsed.email === "sara@sunshinecomplex.com")) {
            parsed.unit = "202";
            parsed.building = "A Wing";
            try { localStorage.setItem("homeverse_auth", JSON.stringify(parsed)); } catch (e) {}
          }
          activeUser = parsed;
          set({ user: parsed, isAuthenticated: true, isLoading: false });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }
      } catch (e) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
    }

    if (activeUser && !sessionVerifiedThisLoad) {
      sessionVerifiedThisLoad = true;
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const refreshed = { ...data.user };
            if (refreshed.name === "Sara Shah" || refreshed.email === "sara@sunshinecomplex.com") {
              refreshed.unit = "202";
              refreshed.building = "A Wing";
            }
            localStorage.setItem("homeverse_auth", JSON.stringify(refreshed));
            set({ user: refreshed, isAuthenticated: true });
          }
        } else if (res.status === 401) {
          localStorage.removeItem("homeverse_auth");
          localStorage.removeItem(AUTH_TOKEN_KEY);
          set({ user: null, isAuthenticated: false });
        }
      } catch (e) {
        // Ignore transient network errors on initial check
      }
    }
  },

  login: async (email, password, role, portal) => {
    set({ isLoading: true });
    let profile: (User & Record<string, any>) | null = null;
    const trimmedEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    // 1. Authenticate against backend API first (source of truth for JWT cookie + token)
    let authRejectedByServer = false;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: cleanPassword })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          profile = data.user;
          if (typeof window !== "undefined" && data.token) {
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
          }
        }
      } else if (res.status === 400 || res.status === 401) {
        authRejectedByServer = true;
      }
    } catch (e) {
      // Backend unavailable, fallback to offline lookup
    }

    if (authRejectedByServer) {
      set({ isLoading: false });
      return false;
    }

    // 2. Comprehensive client-side fallback lookup
    if (!profile) {
      // A) Check store users from localStorage
      if (typeof window !== "undefined") {
        try {
          const storedUsers = JSON.parse(localStorage.getItem("homeverse_users") || "[]");
          if (Array.isArray(storedUsers)) {
            const foundStored = storedUsers.find(
              (u: any) => u.email && u.email.trim().toLowerCase() === trimmedEmail
            );
            if (foundStored) {
              profile = foundStored;
            }
          }
        } catch (e) {}

        // B) Check registered users
        if (!profile) {
          try {
            const regUsers = JSON.parse(localStorage.getItem("homeverse_registered_users") || "[]");
            if (Array.isArray(regUsers)) {
              const regMatch = regUsers.find(
                (u: any) => u.email && u.email.trim().toLowerCase() === trimmedEmail
              );
              if (regMatch) {
                profile = regMatch;
              }
            }
          } catch (e) {}
        }
      }

      // C) Check getPrepopulatedUsers() (contains all 16 residents, secretary, security, workers, manager, hostel students, wardens)
      if (!profile) {
        try {
          const prepopulated = getPrepopulatedUsers();
          const prepMatch = prepopulated.find(
            (u) => u.email && u.email.trim().toLowerCase() === trimmedEmail
          );
          if (prepMatch) {
            profile = prepMatch;
          }
        } catch (e) {}
      }

      // D) Check MOCK_USERS
      if (!profile) {
        const mockMatch = Object.values(MOCK_USERS).find(
          (u) => u.email && u.email.trim().toLowerCase() === trimmedEmail
        );
        if (mockMatch) {
          profile = mockMatch;
        }
      }
    }

    if (!profile) {
      set({ isLoading: false });
      return false;
    }

    // Validate password if user has password configured
    if (cleanPassword) {
      const prepop = getPrepopulatedUsers().find(u => u.email && u.email.trim().toLowerCase() === trimmedEmail);
      const expectedPlain = prepop?.password;

      let isMatch = false;
      if (profile.password && !String(profile.password).startsWith("$2")) {
        const storedPw = String(profile.password).trim();
        isMatch = storedPw === cleanPassword || storedPw.toLowerCase() === cleanPassword.toLowerCase();
      }
      if (!isMatch && expectedPlain) {
        isMatch = cleanPassword === expectedPlain || cleanPassword.toLowerCase() === expectedPlain.toLowerCase();
      }
      if (!isMatch) {
        isMatch =
          cleanPassword === "demo" ||
          cleanPassword === "password" ||
          cleanPassword === "Sara@123" ||
          cleanPassword === "Rahul@123" ||
          cleanPassword === "Sunshine@123" ||
          cleanPassword === "Manager@123" ||
          cleanPassword === "Security@123" ||
          cleanPassword === "Worker@123";
      }
      if (!isMatch && profile.password) {
        set({ isLoading: false });
        return false;
      }
    }

    const clearRejectedSession = async () => {
      try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch (e) {}
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
      set({ isLoading: false });
    };

    // Role & portal verification (case-insensitive)
    if (role && profile.role && profile.role.toLowerCase() !== role.toLowerCase()) {
      await clearRejectedSession();
      throw new Error(`Invalid role selected for this account (account role is ${profile.role}).`);
    }

    if (portal && profile.portal && profile.portal.toLowerCase() !== portal.toLowerCase()) {
      await clearRejectedSession();
      throw new Error(`Invalid portal selected for this account (account portal is ${profile.portal}).`);
    }

    if (profile.status === "pending") {
      await clearRejectedSession();
      throw new Error("Your account is pending Secretary approval.");
    }

    if (profile.status === "rejected" || profile.status === "deactivated") {
      await clearRejectedSession();
      throw new Error(`Your account status is ${profile.status}.`);
    }

    // Ensure Sara Shah is strictly A Wing Flat 202
    if (profile.name === "Sara Shah" || profile.email === "sara@sunshinecomplex.com") {
      profile.unit = "202";
      profile.building = "A Wing";
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("homeverse_auth", JSON.stringify(profile));
    }
    sessionVerifiedThisLoad = true;
    set({ user: profile, isAuthenticated: true, isLoading: false });
    return true;
  },

  loginWithGoogle: async (role, portal) => {
    set({ isLoading: true });
    try {
      const defaultEmail = portal === "society" 
        ? (role === "secretary" ? "rahul@sunshinecomplex.com" : "sara@sunshinecomplex.com")
        : (role === "warden" ? "pillai@vesit.edu" : "aarav@vesit.edu");
      
      const defaultPassword = portal === "society"
        ? (role === "secretary" ? "Rahul@123" : "Sara@123")
        : (role === "warden" ? "Pillai@123" : "Aarav@123");

      let profile: any = null;
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: defaultEmail, password: defaultPassword })
        });
        if (res.ok) {
          const data = await res.json();
          profile = data.user;
          if (typeof window !== "undefined" && data.token) {
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
          }
        }
      } catch (e) {}

      if (!profile) {
        profile = Object.values(MOCK_USERS).find((u) => u.email.toLowerCase() === defaultEmail.toLowerCase());
      }

      if (!profile) {
        const prepopulated = getPrepopulatedUsers();
        profile = prepopulated.find((u) => u.email.toLowerCase() === defaultEmail.toLowerCase()) || null;
      }

      if (!profile) {
        set({ isLoading: false });
        throw new Error("Google login simulation failed");
      }

      if (profile.name === "Sara Shah" || profile.email === "sara@sunshinecomplex.com") {
        profile.unit = "202";
        profile.building = "A Wing";
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("homeverse_auth", JSON.stringify(profile));
      }
      sessionVerifiedThisLoad = true;
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
      let newUser: any = null;

      let regToken: string | null = null;
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData)
        });
        if (res.ok) {
          const data = await res.json();
          newUser = data.user;
          regToken = data.token || null;
        }
      } catch (e) {}

      if (!newUser) {
        newUser = {
          id: `user-${Date.now()}`,
          joinedAt: new Date().toISOString().split("T")[0],
          status: "pending",
          ...userData,
        };
        if (typeof window !== "undefined") {
          try {
            const regUsers = JSON.parse(localStorage.getItem("homeverse_registered_users") || "[]");
            regUsers.push(newUser);
            localStorage.setItem("homeverse_registered_users", JSON.stringify(regUsers));
          } catch (e) {}
        }
      }

      if (newUser.status === "approved") {
        if (typeof window !== "undefined") {
          localStorage.setItem("homeverse_auth", JSON.stringify(newUser));
          if (regToken) {
            localStorage.setItem(AUTH_TOKEN_KEY, regToken);
          }
        }
        sessionVerifiedThisLoad = true;
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
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (e) {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("homeverse_auth");
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    sessionVerifiedThisLoad = false;
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
          credentials: "include",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(details)
        });
      } catch (e) {}
    }
  },
}));
