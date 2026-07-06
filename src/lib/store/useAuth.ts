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

import { auth, db } from "@/lib/firebase/config";
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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

  login: async (email, password, role, portal) => {
    set({ isLoading: true });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, "users", uid));
      
      if (!userDoc.exists()) {
        await signOut(auth);
        set({ isLoading: false });
        throw new Error("User record not found in database.");
      }
      
      const profile = userDoc.data() as User & Record<string, any>;
      if (profile.role !== role || profile.portal !== portal) {
        await signOut(auth);
        set({ isLoading: false });
        throw new Error("Invalid portal or role for this account.");
      }
      
      if (profile.status === "pending") {
        await signOut(auth);
        set({ isLoading: false });
        throw new Error("Your account is pending Secretary approval.");
      }
      
      if (profile.status === "rejected" || profile.status === "deactivated") {
        await signOut(auth);
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
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, "users", uid));
      
      let profile: any;
      if (userDoc.exists()) {
        profile = userDoc.data();
        if (profile.role !== role || profile.portal !== portal) {
          await signOut(auth);
          set({ isLoading: false });
          throw new Error(`This Google account is already registered as ${profile.role.toUpperCase()} under ${profile.portal.toUpperCase()} portal.`);
        }
      } else {
        // Auto register
        const status = (role === "resident" || role === "worker") ? "pending" : "approved";
        profile = {
          id: uid,
          name: userCredential.user.displayName || "Google User",
          email: userCredential.user.email || "",
          phone: userCredential.user.phoneNumber || "+91 00000 00000",
          role: role,
          portal: portal,
          avatar: userCredential.user.photoURL || "",
          unit: "",
          building: "",
          joinedAt: new Date().toISOString().split("T")[0],
          status: status,
        };
        await setDoc(doc(db, "users", uid), profile);
      }

      if (profile.status === "pending") {
        await signOut(auth);
        set({ user: null, isAuthenticated: false, isLoading: false });
        return "pending";
      }

      if (profile.status === "rejected" || profile.status === "deactivated") {
        await signOut(auth);
        set({ isLoading: false });
        throw new Error(`Your account status is ${profile.status}.`);
      }

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
      const email = userData.email || "";
      const password = userData.password || "NewUser@123";
      const role = userData.role || "resident";
      const status = (role === "resident" || role === "worker") ? "pending" : "approved";

      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCredential.user.uid;

      const newUser: User & Record<string, any> = {
        id: uid,
        name: userData.name || "New User",
        email: email,
        phone: userData.phone || "+91 00000 00000",
        role: role,
        portal: userData.portal || "society",
        avatar: userData.avatar || "",
        unit: userData.unit || "",
        building: userData.building || "",
        joinedAt: new Date().toISOString().split("T")[0],
        status: status,
        ...userData,
      };

      await setDoc(doc(db, "users", uid), newUser);

      if (status === "approved") {
        if (typeof window !== "undefined") {
          localStorage.setItem("homeverse_auth", JSON.stringify(newUser));
        }
        set({ user: newUser, isAuthenticated: true, isLoading: false });
      } else {
        await signOut(auth);
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
      await signOut(auth);
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
        await updateDoc(doc(db, "users", user.id), details);
      } catch (e) {}
    }
  },
}));
