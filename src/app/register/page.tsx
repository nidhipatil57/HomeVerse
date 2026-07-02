"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, User, Mail, Phone, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, GraduationCap, Shield, Users, Check,
  Briefcase, UserCheck, School, Hash, BookOpen, Clock, FileText, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/store/useAuth";

const workerCategories = [
  "Electrician", "Plumber", "Housekeeping", "Security Guard",
  "Gardener", "Lift Technician", "Maintenance Staff", "Carpenter", "Cleaner"
];

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Flow State
  const [step, setStep] = useState(0); // 0: Ecosystem, 1: Role, 2: Basic Info, 3: Details, 4: Complete
  const [ecosystem, setEcosystem] = useState<"society" | "hostel" | null>(null);
  const [role, setRole] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profilePhoto: "",
    
    // Society Resident
    societyName: "",
    building: "",
    flatNumber: "",
    ownerOrTenant: "Owner",
    familyMembers: "",
    vehicleDetails: "",

    // Society Worker
    workerCategory: "Electrician",
    employeeId: "",
    workingShift: "Morning",

    // Hostel Student
    collegeName: "",
    hostelName: "",
    block: "",
    floor: "",
    roomNumber: "",
    rollNumber: "",
    course: "",
    year: "1st Year",

    // Hostel Warden
    assignedBlock: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
    if (!formData.email.trim() || !formData.email.includes("@")) return "A valid email is required";
    if (!formData.phone.trim()) return "Mobile number is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const validateDetails = () => {
    if (ecosystem === "society") {
      if (role === "resident") {
        if (!formData.societyName.trim()) return "Society name is required";
        if (!formData.building.trim()) return "Building / Wing is required";
        if (!formData.flatNumber.trim()) return "Flat number is mandatory";
      } else if (role === "worker") {
        if (!formData.societyName.trim()) return "Society name is required";
        if (!formData.employeeId.trim()) return "Employee ID is required";
      }
    } else if (ecosystem === "hostel") {
      if (role === "student") {
        if (!formData.collegeName.trim()) return "College name is required";
        if (!formData.hostelName.trim()) return "Hostel name is required";
        if (!formData.roomNumber.trim()) return "Room number is required";
        if (!formData.rollNumber.trim()) return "Roll number is required";
      } else if (role === "warden") {
        if (!formData.hostelName.trim()) return "Hostel name is required";
        if (!formData.employeeId.trim()) return "Employee ID is required";
        if (!formData.assignedBlock.trim()) return "Assigned Hostel Block is required";
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
      
      // Call Zustand Register
      try {
        const registrationData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: role as any,
          portal: ecosystem as any,
          avatar: formData.profilePhoto || undefined,
          unit: role === "resident" ? formData.flatNumber : role === "student" ? formData.roomNumber : undefined,
          building: role === "resident" ? formData.building : role === "student" ? formData.block : role === "warden" ? formData.assignedBlock : formData.building,
          
          // Additional custom fields
          societyName: formData.societyName,
          hostelName: formData.hostelName,
          collegeName: formData.collegeName,
          ownerOrTenant: formData.ownerOrTenant,
          familyMembers: formData.familyMembers ? parseInt(formData.familyMembers) : undefined,
          vehicleDetails: formData.vehicleDetails,
          workerCategory: role === "worker" ? formData.workerCategory : undefined,
          employeeId: (role === "worker" || role === "warden") ? formData.employeeId : undefined,
          workingShift: role === "worker" ? formData.workingShift : undefined,
          rollNumber: role === "student" ? formData.rollNumber : undefined,
          course: role === "student" ? formData.course : undefined,
          year: role === "student" ? formData.year : undefined,
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
                  const labels = ["Ecosystem", "Role", "Basic Info", "Details"];
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
            <div className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
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
                        Apartments, wings, residents, and electrician/plumber workers.
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
                        College hostels, student roommates, laundry, wardens.
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
                  <div className="grid grid-cols-2 gap-4 mt-2">
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
                          <p className="text-xs text-muted-foreground mt-1">Plumbers, Electricians, Security</p>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRoleSelect("student")}
                          className="p-5 rounded-2xl border border-border/50 bg-card hover:bg-secondary/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                            <GraduationCap className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-bold text-foreground">Student</p>
                          <p className="text-xs text-muted-foreground mt-1">College Roommates</p>
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
                          <p className="text-xs text-muted-foreground mt-1">Hostel Management</p>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: BASIC INFO */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">Create Your Profile</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Please provide your core credentials</p>

                  <div className="space-y-3 mt-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="e.g. Nidhi Kumar"
                          value={formData.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          className="pl-10 rounded-xl h-11"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="nidhi@example.com"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            className="pl-10 rounded-xl h-11"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Mobile Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="+91 99999 99999"
                            value={formData.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                            className="pl-10 rounded-xl h-11"
                          />
                        </div>
                      </div>
                    </div>

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
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">Community Details</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Customize your profile as a <span className="font-semibold text-primary capitalize">{role}</span></p>
                  </div>

                  <div className="space-y-3 mt-4">
                    {/* PROFILE PICTURE PLACEHOLDER */}
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
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Society Name</label>
                            <Input
                              placeholder="e.g. Harmony Heights"
                              value={formData.societyName}
                              onChange={(e) => updateField("societyName", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Building / Wing</label>
                            <Input
                              placeholder="e.g. Tower B"
                              value={formData.building}
                              onChange={(e) => updateField("building", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Flat Number <span className="text-red-500">*</span></label>
                            <Input
                              placeholder="e.g. B-402 (Mandatory)"
                              value={formData.flatNumber}
                              onChange={(e) => updateField("flatNumber", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Ownership Type</label>
                            <select
                              value={formData.ownerOrTenant}
                              onChange={(e) => updateField("ownerOrTenant", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="Owner">Owner</option>
                              <option value="Tenant">Tenant</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Family Members (Optional)</label>
                            <Input
                              type="number"
                              placeholder="e.g. 4"
                              value={formData.familyMembers}
                              onChange={(e) => updateField("familyMembers", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Vehicle Details (Optional)</label>
                            <Input
                              placeholder="e.g. MH-12-AB-1234"
                              value={formData.vehicleDetails}
                              onChange={(e) => updateField("vehicleDetails", e.target.value)}
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
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Society Name</label>
                            <Input
                              placeholder="e.g. Harmony Heights"
                              value={formData.societyName}
                              onChange={(e) => updateField("societyName", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Worker Category</label>
                            <select
                              value={formData.workerCategory}
                              onChange={(e) => updateField("workerCategory", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              {workerCategories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Employee ID</label>
                            <Input
                              placeholder="e.g. EMP-9304"
                              value={formData.employeeId}
                              onChange={(e) => updateField("employeeId", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Working Shift</label>
                            <select
                              value={formData.workingShift}
                              onChange={(e) => updateField("workingShift", e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                            >
                              <option value="Morning (9 AM - 5 PM)">Morning (9 AM - 5 PM)</option>
                              <option value="Evening (5 PM - 1 AM)">Evening (5 PM - 1 AM)</option>
                              <option value="Night (1 AM - 9 AM)">Night (1 AM - 9 AM)</option>
                              <option value="General Shift">General Shift</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 3. HOSTEL STUDENT */}
                    {role === "student" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">College Name</label>
                            <div className="relative">
                              <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="e.g. NIT Delhi"
                                value={formData.collegeName}
                                onChange={(e) => updateField("collegeName", e.target.value)}
                                className="pl-10 rounded-xl h-11"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Hostel Name</label>
                            <Input
                              placeholder="e.g. Vidya Bhawan"
                              value={formData.hostelName}
                              onChange={(e) => updateField("hostelName", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Block</label>
                            <Input
                              placeholder="e.g. A"
                              value={formData.block}
                              onChange={(e) => updateField("block", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Floor</label>
                            <Input
                              placeholder="e.g. 2"
                              value={formData.floor}
                              onChange={(e) => updateField("floor", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Room No.</label>
                            <Input
                              placeholder="e.g. 204"
                              value={formData.roomNumber}
                              onChange={(e) => updateField("roomNumber", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Roll / ID Number</label>
                            <div className="relative">
                              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="e.g. 2024-CSE-092"
                                value={formData.rollNumber}
                                onChange={(e) => updateField("rollNumber", e.target.value)}
                                className="pl-10 rounded-xl h-11"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Course / Branch</label>
                            <div className="relative">
                              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="e.g. Computer Science"
                                value={formData.course}
                                onChange={(e) => updateField("course", e.target.value)}
                                className="pl-10 rounded-xl h-11"
                              />
                            </div>
                          </div>
                        </div>

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
                            <option value="PostGraduate">PostGraduate / Research</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* 4. HOSTEL WARDEN */}
                    {role === "warden" && (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">Hostel Name</label>
                          <Input
                            placeholder="e.g. Vidya Bhawan Hostel"
                            value={formData.hostelName}
                            onChange={(e) => updateField("hostelName", e.target.value)}
                            className="rounded-xl h-11"
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Employee ID</label>
                            <Input
                              placeholder="e.g. WDN-1082"
                              value={formData.employeeId}
                              onChange={(e) => updateField("employeeId", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Assigned Block</label>
                            <Input
                              placeholder="e.g. Block A & B"
                              value={formData.assignedBlock}
                              onChange={(e) => updateField("assignedBlock", e.target.value)}
                              className="rounded-xl h-11"
                            />
                          </div>
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
                    <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]">You&apos;re all set!</h2>
                    <p className="text-sm text-muted-foreground">
                      Welcome to the HomeVerse family. Your account is ready.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-secondary/30 text-left text-xs space-y-2 border border-border/30">
                    <div className="flex justify-between"><span className="text-muted-foreground">Registered As:</span><span className="font-semibold text-foreground">{formData.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ecosystem:</span><span className="font-semibold text-foreground capitalize">{ecosystem} Portal</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Active Role:</span><span className="font-semibold text-foreground capitalize">{role}</span></div>
                    {formData.societyName && <div className="flex justify-between"><span className="text-muted-foreground">Society Name:</span><span className="font-semibold text-foreground">{formData.societyName}</span></div>}
                    {formData.hostelName && <div className="flex justify-between"><span className="text-muted-foreground">Hostel Name:</span><span className="font-semibold text-foreground">{formData.hostelName}</span></div>}
                    {formData.flatNumber && <div className="flex justify-between"><span className="text-muted-foreground">Flat Unit:</span><span className="font-semibold text-foreground">{formData.flatNumber}</span></div>}
                    {formData.roomNumber && <div className="flex justify-between"><span className="text-muted-foreground">Room Unit:</span><span className="font-semibold text-foreground">{formData.roomNumber}</span></div>}
                  </div>

                  <Link href={ecosystem === "society" ? "/society/dashboard" : "/hostel/dashboard"}>
                    <Button className="w-full h-12 rounded-xl gradient-primary text-white border-0 shadow-lg text-base font-semibold mt-4">
                      Enter HomeVerse
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
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
