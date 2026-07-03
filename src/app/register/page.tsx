"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, User, Mail, Phone, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, GraduationCap, Shield, Users, Check,
  Briefcase, UserCheck, BookOpen, FileText, Image as ImageIcon,
  CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { MOCK_SOCIETIES, MOCK_HOSTELS, validateFlatNumber } from "@/data/mock-communities";

const workerCategories = [
  "Maid", "Cook", "Electrician", "Plumber", "Carpenter", "Security Guard",
  "Housekeeping", "Lift Technician", "Painter", "Gardener"
];

const maidSpecializations = [
  "House Cleaning", "Utensil Washing", "Cooking", "Laundry", "Ironing",
  "Baby Care", "Elder Care", "Deep Cleaning"
];

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, initialize } = useAuth();
  const users = useCommunityStore((state) => state.users);
  const initializeDb = useCommunityStore((state) => state.initializeDb);

  useEffect(() => {
    initialize();
    initializeDb();
  }, [initialize, initializeDb]);

  // Wizard Steps: 0 (Ecosystem), 1 (Role), 2 (Basic Info & Code Verification), 3 (Details), 4 (Complete)
  const [step, setStep] = useState(0);
  const [ecosystem, setEcosystem] = useState<"society" | "hostel" | null>(null);
  const [role, setRole] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Step 2 Verification state
  const [communityCode, setCommunityCode] = useState("");
  const [verifiedCommunity, setVerifiedCommunity] = useState<any>(null);
  const [generatedUsername, setGeneratedUsername] = useState("");

  // Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profilePhoto: "",
    
    // Resident specific
    building: "",
    flatNumber: "",
    ownerOrTenant: "Owner",
    familyMembers: "",
    vehicleDetails: "",

    // Secretary specific
    designation: "Secretary",
    committeeId: "",

    // Worker specific
    workerCategory: "Maid",
    selectedSpecializations: [] as string[],
    employeeId: "",
    workingShift: "Morning",

    // Student specific
    gender: "Male",
    course: "",
    year: "1st Year",
    branch: "",
    parentContact: "",
    hostelWing: "",
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Real-time Community Code verification
  useEffect(() => {
    setError("");
    const code = communityCode.trim().toUpperCase();
    if (!code) {
      setVerifiedCommunity(null);
      setGeneratedUsername("");
      return;
    }

    if (ecosystem === "society") {
      const match = MOCK_SOCIETIES.find((s) => s.code === code);
      if (match) {
        setVerifiedCommunity(match);
        // Set default building
        updateField("building", match.buildings[0]);
      } else {
        setVerifiedCommunity(null);
        setGeneratedUsername("");
      }
    } else {
      const match = MOCK_HOSTELS.find((h) => h.code === code);
      if (match) {
        setVerifiedCommunity(match);
        updateField("hostelWing", match.wings[0]);
      } else {
        setVerifiedCommunity(null);
        setGeneratedUsername("");
      }
    }
  }, [communityCode, ecosystem]);

  // Username auto-generation with duplicate checking
  useEffect(() => {
    if (!verifiedCommunity || !formData.name.trim()) {
      setGeneratedUsername("");
      return;
    }

    const domain = verifiedCommunity.domain;
    const nameClean = formData.name.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "");
    const parts = nameClean.split(" ");
    const firstName = parts[0] || "user";
    
    let baseName = firstName;
    // Special Warden format: warden@domain or rahul@domain (Rahul is warden)
    if (role === "warden") {
      baseName = firstName === "warden" ? "warden" : firstName;
    }

    let emailVal = `${baseName}@${domain}`;
    let counter = 2;

    // Resolve duplicates inside existing Zustand users list
    while (users.some((u) => u.email.toLowerCase() === emailVal.toLowerCase())) {
      if (role === "warden" && baseName === "warden") {
        emailVal = `warden${counter}@${domain}`;
      } else {
        // Appending a number intelligently
        const numStr = counter < 10 ? `0${counter}` : `${counter}`;
        emailVal = `${baseName}${numStr}@${domain}`;
      }
      counter++;
    }

    setGeneratedUsername(emailVal);
  }, [formData.name, verifiedCommunity, role, users]);

  const handleEcosystemSelect = (eco: "society" | "hostel") => {
    setEcosystem(eco);
    setRole("");
    setStep(1);
    setError("");
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setStep(2);
    setError("");
  };

  const validateBasicInfo = () => {
    if (!formData.name.trim()) return "Full name is required";
    if (!formData.phone.trim()) return "Mobile number is required";
    if (!communityCode.trim()) return "Community Code is required";
    if (!verifiedCommunity) {
      return `Invalid Community Code. Please contact your ${ecosystem === "society" ? "society" : "hostel"} administrator.`;
    }
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const validateDetails = () => {
    if (ecosystem === "society") {
      if (role === "resident" || role === "secretary") {
        if (!formData.building) return "Please select a building / wing";
        if (!formData.flatNumber.trim()) return "Flat number is mandatory";

        // Structured Wing & Flat boundary verification
        const flatStr = formData.flatNumber.trim();
        const valid = validateFlatNumber(flatStr, verifiedCommunity.floors, verifiedCommunity.flatsPerFloor);
        if (!valid) {
          const flatIndex = parseInt(flatStr, 10) % 100;
          const floor = Math.floor(parseInt(flatStr, 10) / 100);
          if (isNaN(floor) || floor < 1 || floor > verifiedCommunity.floors) {
            return `Flat number is invalid. ${verifiedCommunity.name} only has ${verifiedCommunity.floors} floors.`;
          }
          if (flatIndex < 1 || flatIndex > verifiedCommunity.flatsPerFloor) {
            return `Flat ${flatStr} is invalid. ${verifiedCommunity.name} only has ${verifiedCommunity.flatsPerFloor} flats per floor (e.g., flats ending in 01 to 0${verifiedCommunity.flatsPerFloor}).`;
          }
          return `Flat number is invalid. Please enter in [Floor][FlatIndex] format (e.g. 104, 1002).`;
        }
      } else if (role === "worker") {
        if (formData.workerCategory === "Maid" && formData.selectedSpecializations.length === 0) {
          return "Please choose at least one specialization for the Maid category.";
        }
      } else if (role === "security") {
        if (!formData.employeeId.trim()) return "Employee ID is required";
      }
    } else if (ecosystem === "hostel") {
      if (role === "student") {
        if (!formData.course.trim()) return "Course details are required";
        if (!formData.branch.trim()) return "Branch is required";
        if (!formData.parentContact.trim()) return "Parent contact number is required";
        if (!formData.hostelWing) return "Please choose an assigned hostel wing";
      } else if (role === "warden") {
        if (!formData.employeeId.trim()) return "Employee ID is required";
        if (!formData.hostelWing) return "Please choose an assigned hostel wing";
      }
    }
    return null;
  };

  const handleNext = async () => {
    setError("");
    if (step === 2) {
      const err = validateBasicInfo();
      if (err) {
        setError(err);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const err = validateDetails();
      if (err) {
        setError(err);
        return;
      }
      
      try {
        const generatedFloor = (role === "resident" || role === "secretary")
          ? Math.floor(parseInt(formData.flatNumber, 10) / 100) 
          : undefined;

        // Auto-assign student hostel based on gender
        let calculatedHostel = undefined;
        if (role === "student") {
          calculatedHostel = formData.gender === "Female" ? "Girls Hostel" : "Boys Hostel";
        } else if (role === "warden") {
          calculatedHostel = formData.gender === "Female" ? "Girls Hostel" : "Boys Hostel";
        }

        const registrationData = {
          name: formData.name,
          email: generatedUsername,
          phone: formData.phone,
          role: role as any,
          portal: ecosystem as any,
          avatar: formData.profilePhoto || "/avatars/avatar-default.jpg",
          
          // Structural references
          communityCode: communityCode.toUpperCase(),
          unit: (role === "resident" || role === "secretary") ? formData.flatNumber : undefined, // Student unit is allocated by Warden
          building: (role === "resident" || role === "secretary")
            ? formData.building 
            : role === "student" 
              ? formData.hostelWing 
              : role === "warden" 
                ? formData.hostelWing 
                : role === "security"
                  ? formData.building
                  : undefined,

          // Organization info
          societyName: ecosystem === "society" ? verifiedCommunity.name : undefined,
          collegeName: ecosystem === "hostel" ? verifiedCommunity.name : undefined,
          hostelName: calculatedHostel,
          ownerOrTenant: (role === "resident" || role === "secretary") ? formData.ownerOrTenant : undefined,
          floorNumber: generatedFloor,
          familyMembers: ((role === "resident" || role === "secretary") && formData.familyMembers) ? parseInt(formData.familyMembers) : undefined,
          vehicleDetails: (role === "resident" || role === "secretary") ? formData.vehicleDetails : undefined,

          // Secretary details
          designation: role === "secretary" ? formData.designation : undefined,
          committeeId: role === "secretary" ? formData.committeeId : undefined,

          // Worker / Security specializations
          workerCategory: role === "worker" ? formData.workerCategory : undefined,
          specializations: (role === "worker" && formData.workerCategory === "Maid") ? formData.selectedSpecializations : undefined,
          employeeId: (role === "worker" || role === "warden" || role === "security" || role === "secretary") ? formData.employeeId || formData.committeeId : undefined,
          workingShift: role === "security" ? formData.workingShift : undefined,
          
          // Student details
          gender: (role === "student" || role === "warden") ? formData.gender : undefined,
          course: role === "student" ? formData.course : undefined,
          year: role === "student" ? formData.year : undefined,
          branch: role === "student" ? formData.branch : undefined,
          parentContact: role === "student" ? formData.parentContact : undefined,
        };

        const success = await registerUser(registrationData);
        if (success) {
          setStep(4);
        } else {
          setError("Registration failed. Please try again.");
        }
      } catch (e) {
        setError("Something went wrong during registration.");
      }
    }
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(0, prev - 1));
  };

  const toggleSpecialization = (spec: string) => {
    const current = formData.selectedSpecializations;
    const updated = current.includes(spec)
      ? current.filter((s) => s !== spec)
      : [...current, spec];
    updateField("selectedSpecializations", updated);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-background">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold font-[family-name:var(--font-heading)]">
            Home<span className="text-gradient">Verse</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-card rounded-3xl border border-border/50 shadow-premium p-8">
          {/* Progress Tracker */}
          {step < 4 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                {[0, 1, 2, 3].map((sIndex) => {
                  const labels = ["Ecosystem", "Role", "Verification", "Details"];
                  return (
                    <div key={sIndex} className="flex items-center gap-1.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        sIndex <= step ? "gradient-primary text-white" : "bg-secondary text-muted-foreground"
                      }`}>
                        {sIndex < step ? <Check className="w-3.5 h-3.5" /> : sIndex + 1}
                      </div>
                      <span className={`hidden sm:inline text-xs font-medium ${sIndex === step ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                        {labels[sIndex]}
                      </span>
                      {sIndex < 3 && (
                        <div className={`hidden md:block w-8 h-[2px] rounded-full ${sIndex < step ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <Progress value={(step / 3) * 100} className="h-1.5 mt-3" />
            </div>
          )}

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* STEP 0: ECOSYSTEM */}
              {step === 0 && (
                <div className="space-y-5">
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">Choose your Community</h2>
                    <p className="text-sm text-muted-foreground">Select the ecosystem you want to register under</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => handleEcosystemSelect("society")}
                      className="p-5 rounded-2xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <p className="font-bold text-foreground">🏢 Society Portal</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Apartments, wings, residents, and local trade providers.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEcosystemSelect("hostel")}
                      className="p-5 rounded-2xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <p className="font-bold text-foreground">🏠 Hostel Portal</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        College accommodation, roommate search, laundry locks.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 1: ROLE */}
              {step === 1 && ecosystem && (
                <div className="space-y-5">
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">Select Your Role</h2>
                    <p className="text-sm text-muted-foreground">How will you participate in the community?</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                    {ecosystem === "society" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRoleSelect("resident")}
                          className="p-5 rounded-2xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-bold text-foreground">Resident</p>
                          <p className="text-xs text-muted-foreground mt-1">Flat Owners & Tenants</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRoleSelect("worker")}
                          className="p-5 rounded-2xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                            <Briefcase className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-bold text-foreground">Worker / Staff</p>
                          <p className="text-xs text-muted-foreground mt-1">Local Trades & Plumbers</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRoleSelect("security")}
                          className="p-5 rounded-2xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-bold text-foreground">Security</p>
                          <p className="text-xs text-muted-foreground mt-1">Guard & Gate Control</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRoleSelect("secretary")}
                          className="p-5 rounded-2xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                            <UserCheck className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-bold text-foreground">Secretary</p>
                          <p className="text-xs text-muted-foreground mt-1">Society Administrator</p>
                        </button>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 col-span-1 sm:col-span-3">
                        <button
                          type="button"
                          onClick={() => handleRoleSelect("student")}
                          className="p-5 rounded-2xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                            <GraduationCap className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-bold text-foreground">Student</p>
                          <p className="text-xs text-muted-foreground mt-1">Campus Residents</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRoleSelect("warden")}
                          className="p-5 rounded-2xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                            <UserCheck className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-bold text-foreground">Warden</p>
                          <p className="text-xs text-muted-foreground mt-1">Hostel Administrator</p>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: BASIC INFO & VERIFICATION */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">Create Profile & Verify Code</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Link your profile to a verified campus/residential group</p>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="e.g. Sara Shah"
                          value={formData.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          className="pl-10 rounded-xl h-11"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Community Code</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="e.g. SUN123 or VESIT26"
                            value={communityCode}
                            onChange={(e) => setCommunityCode(e.target.value)}
                            className="pl-10 rounded-xl h-11 uppercase font-semibold tracking-wider"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Mobile Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="+91 XXXXX XXXXX"
                            value={formData.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                            className="pl-10 rounded-xl h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Community Verification Status Alert */}
                    {communityCode && (
                      <div className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                        verifiedCommunity
                          ? "bg-green-500/10 border-green-500/20 text-green-500"
                          : "bg-destructive/10 border-destructive/20 text-destructive"
                      }`}>
                        {verifiedCommunity ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Community Verified: <strong>{verifiedCommunity.name}</strong></span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4" />
                            <span>Invalid Community Code. Please contact your administrator.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Auto Generated Username Display */}
                    {generatedUsername && (
                      <div className="p-3 bg-secondary/40 border border-border/30 rounded-xl space-y-1">
                        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Your Auto-Generated Username</span>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          <span className="font-bold text-foreground select-all text-sm">{generatedUsername}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Choose password"
                            value={formData.password}
                            onChange={(e) => updateField("password", e.target.value)}
                            className="pl-10 pr-10 rounded-xl h-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={(e) => updateField("confirmPassword", e.target.value)}
                            className="pl-10 pr-10 rounded-xl h-11"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: DETAILS */}
              {step === 3 && verifiedCommunity && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">Verification Details</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Customize registration profile for <span className="font-semibold text-primary capitalize">{role}</span></p>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Profile Photo (Optional)</label>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/70 hover:bg-secondary/20 cursor-pointer transition-colors relative">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Click to upload photo (JPEG, PNG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => updateField("profilePhoto", "/avatars/avatar-default.jpg")}
                        />
                      </div>
                    </div>

                    {/* DYNAMIC FORMS BY ROLE */}
                    {/* 1. SOCIETY RESIDENT */}
                    {role === "resident" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Building / Wing</label>
                            <select
                              value={formData.building}
                              onChange={(e) => updateField("building", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                            >
                              {verifiedCommunity.buildings.map((b: string) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Flat Number <span className="text-red-500">*</span></label>
                            <Input
                              placeholder="e.g. 302"
                              value={formData.flatNumber}
                              onChange={(e) => updateField("flatNumber", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Ownership Type</label>
                            <select
                              value={formData.ownerOrTenant}
                              onChange={(e) => updateField("ownerOrTenant", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                            >
                              <option value="Owner">Owner</option>
                              <option value="Tenant">Tenant</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Family Members Count</label>
                            <Input
                              type="number"
                              placeholder="e.g. 3"
                              value={formData.familyMembers}
                              onChange={(e) => updateField("familyMembers", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">Vehicle License Plate (Optional)</label>
                          <Input
                            placeholder="e.g. MH-12-PQ-9876"
                            value={formData.vehicleDetails}
                            onChange={(e) => updateField("vehicleDetails", e.target.value)}
                            className="rounded-xl h-11"
                          />
                        </div>
                      </>
                    )}

                    {/* 1.5 SOCIETY SECRETARY */}
                    {role === "secretary" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Building / Wing</label>
                            <select
                              value={formData.building}
                              onChange={(e) => updateField("building", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                            >
                              {verifiedCommunity.buildings.map((b: string) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Flat Number <span className="text-red-500">*</span></label>
                            <Input
                              placeholder="e.g. 302"
                              value={formData.flatNumber}
                              onChange={(e) => updateField("flatNumber", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Designation</label>
                            <select
                              value={formData.designation}
                              onChange={(e) => updateField("designation", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                            >
                              <option value="Secretary">Secretary</option>
                              <option value="Chairman">Chairman</option>
                              <option value="Treasurer">Treasurer</option>
                              <option value="Committee Member">Committee Member</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Committee / Employee ID (Optional)</label>
                            <Input
                              placeholder="e.g. SEC-COM-1"
                              value={formData.committeeId}
                              onChange={(e) => updateField("committeeId", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* 2. SOCIETY WORKER */}
                    {role === "worker" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Worker Category</label>
                            <select
                              value={formData.workerCategory}
                              onChange={(e) => updateField("workerCategory", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                            >
                              {workerCategories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Employee/ID Badge</label>
                            <Input
                              placeholder="e.g. EMP-9812"
                              value={formData.employeeId}
                              onChange={(e) => updateField("employeeId", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                        </div>

                        {/* Maid Specializations section */}
                        {formData.workerCategory === "Maid" && (
                          <div className="p-4 bg-secondary/20 rounded-2xl border border-border/30">
                            <label className="text-xs font-bold text-foreground block mb-2">Maid Specializations (Select all that apply) <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 gap-2">
                              {maidSpecializations.map((spec) => {
                                const selected = formData.selectedSpecializations.includes(spec);
                                return (
                                  <button
                                    key={spec}
                                    type="button"
                                    onClick={() => toggleSpecialization(spec)}
                                    className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all text-xs ${
                                      selected
                                        ? "bg-primary/10 border-primary text-foreground font-semibold"
                                        : "bg-card border-border hover:bg-secondary/40 text-muted-foreground"
                                    }`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                      selected ? "bg-primary border-primary text-white" : "border-muted-foreground/30 bg-transparent"
                                    }`}>
                                      {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                    <span>{spec}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* 2.5. SOCIETY SECURITY */}
                    {role === "security" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Employee ID Badge <span className="text-red-500">*</span></label>
                            <Input
                              placeholder="e.g. SEC-9040"
                              value={formData.employeeId}
                              onChange={(e) => updateField("employeeId", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Shift <span className="text-red-500">*</span></label>
                            <select
                              value={formData.workingShift}
                              onChange={(e) => updateField("workingShift", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                            >
                              <option value="Morning">Morning</option>
                              <option value="Afternoon">Afternoon</option>
                              <option value="Night">Night</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">Assigned Gate / Block (Optional)</label>
                          <Input
                            placeholder="e.g. Gate 1, Tower A"
                            value={formData.building}
                            onChange={(e) => updateField("building", e.target.value)}
                            className="rounded-xl h-11"
                          />
                        </div>
                      </>
                    )}

                    {/* 3. HOSTEL STUDENT */}
                    {role === "student" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Gender</label>
                            <select
                              value={formData.gender}
                              onChange={(e) => updateField("gender", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Hostel Wing</label>
                            <select
                              value={formData.hostelWing}
                              onChange={(e) => updateField("hostelWing", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                            >
                              {verifiedCommunity.wings.map((w: string) => (
                                <option key={w} value={w}>{w}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Academic Year</label>
                            <select
                              value={formData.year}
                              onChange={(e) => updateField("year", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                            >
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                              <option value="PostGraduate">PostGrad</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Branch / Major</label>
                            <Input
                              placeholder="e.g. Computer Science"
                              value={formData.branch}
                              onChange={(e) => updateField("branch", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Course Name</label>
                            <Input
                              placeholder="e.g. B.Tech / B.E."
                              value={formData.course}
                              onChange={(e) => updateField("course", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Parent Contact Number</label>
                            <Input
                              placeholder="e.g. +91 XXXXX XXXXX"
                              value={formData.parentContact}
                              onChange={(e) => updateField("parentContact", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* 4. HOSTEL WARDEN */}
                    {role === "warden" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Gender</label>
                            <select
                              value={formData.gender}
                              onChange={(e) => updateField("gender", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Assigned Hostel Wing</label>
                            <select
                              value={formData.hostelWing}
                              onChange={(e) => updateField("hostelWing", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                            >
                              {verifiedCommunity.wings.map((w: string) => (
                                <option key={w} value={w}>{w}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">Employee ID Badge</label>
                          <Input
                            placeholder="e.g. WDN-1082"
                            value={formData.employeeId}
                            onChange={(e) => updateField("employeeId", e.target.value)}
                            className="rounded-xl h-11"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: COMPLETE */}
              {step === 4 && (
                <div className="text-center space-y-5 py-4">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-lg">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                      {role === "resident" || role === "worker" ? "Application Submitted! ⏳" : "You're all set!"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {role === "resident" || role === "worker" 
                        ? "Your account is pending Secretary approval. Once approved, you can log in." 
                        : "Welcome to the HomeVerse family. Your account is ready."}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-secondary/30 text-left text-xs space-y-2 border border-border/30">
                    <div className="flex justify-between"><span className="text-muted-foreground">Registered As:</span><span className="font-semibold text-foreground">{formData.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Community:</span><span className="font-semibold text-foreground">{verifiedCommunity?.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Your Username:</span><span className="font-bold text-primary">{generatedUsername}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Active Role:</span><span className="font-semibold text-foreground capitalize">{role}</span></div>
                    {(role === "resident" || role === "secretary") && <div className="flex justify-between"><span className="text-muted-foreground">Flat Unit:</span><span className="font-semibold text-foreground">{formData.building} · {formData.flatNumber}</span></div>}
                    {role === "student" && <div className="flex justify-between"><span className="text-muted-foreground">Hostel Wing:</span><span className="font-semibold text-foreground">{formData.hostelWing} (Unallocated)</span></div>}
                  </div>

                  <Button
                    onClick={() => {
                      if (role === "resident" || role === "worker") {
                        router.replace("/login?portal=society");
                      } else {
                        router.replace(ecosystem === "society" ? "/society/dashboard" : "/hostel/dashboard");
                      }
                    }}
                    className="w-full h-12 rounded-xl gradient-primary text-white border-0 shadow-lg text-base font-semibold mt-4"
                  >
                    {role === "resident" || role === "worker" ? "Return to Login Portal" : "Enter HomeVerse"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {step < 4 && (
            <div className="flex gap-3 mt-8 pt-4 border-t border-border/30">
              {step > 0 && (
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              {step >= 2 && (
                <Button
                  className={`flex-1 rounded-xl h-11 gradient-primary text-white border-0 shadow-lg ${step === 2 ? "w-full" : ""}`}
                  onClick={handleNext}
                >
                  {step === 3 ? "Complete" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
