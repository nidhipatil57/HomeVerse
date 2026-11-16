import type { Helper, User, GatePass } from "@/types";

export function isDomesticHelper(cat?: string): boolean {
  const c = (cat || "").toLowerCase();
  return (
    c.includes("maid") ||
    c.includes("cook") ||
    c.includes("housekeep") ||
    c.includes("cleaning") ||
    c.includes("nanny") ||
    c.includes("care") ||
    c.includes("laundry")
  );
}

export function isHelperAssignedToResident(
  helper: Helper,
  user: Partial<User> | null | undefined
): boolean {
  if (!user || !user.id) return false;

  // Domestic helper only
  if (!isDomesticHelper(helper.category)) return false;

  // 1. Direct ID match (Highest priority & definitive)
  if (helper.residentIds && Array.isArray(helper.residentIds)) {
    if (helper.residentIds.includes(user.id)) return true;
  }

  // 2. Exact Resident Name match
  const userName = (user.name || "").trim().toLowerCase();
  if (userName && helper.assignedResidents && Array.isArray(helper.assignedResidents)) {
    if (helper.assignedResidents.some((r) => r && r.trim().toLowerCase() === userName)) {
      return true;
    }
  }

  // 3. Strict Wing + Flat match
  const rawUnit = (user.unit || "").trim();
  const rawBuilding = (user.building || "").trim();

  // Extract wing letter (A, B, C)
  let userWing = "";
  const wingMatch = rawBuilding.match(/([ABC])/i) || rawUnit.match(/^([ABC])[-_\s]/i);
  if (wingMatch) {
    userWing = wingMatch[1].toUpperCase();
  }

  // Extract numeric flat number (e.g. 101, 102, 201)
  const numMatch = rawUnit.match(/\d+/);
  const userNum = numMatch ? numMatch[0] : "";

  if (userWing && userNum && helper.assignedFlats && Array.isArray(helper.assignedFlats)) {
    const canonicalUserFlat = `${userWing}-${userNum}`.toLowerCase();
    const matchesFlat = helper.assignedFlats.some((f) => {
      if (!f) return false;
      const fStr = f.trim().toLowerCase();
      // Extract wing and number from helper's assigned flat
      const fWingMatch = fStr.match(/([abc])/i);
      const fNumMatch = fStr.match(/\d+/);
      if (fWingMatch && fNumMatch) {
        return fWingMatch[1].toUpperCase() === userWing && fNumMatch[0] === userNum;
      }
      return fStr === canonicalUserFlat;
    });
    if (matchesFlat) return true;
  }

  return false;
}

export function getResidentHelperPass(
  helper: Helper,
  user: Partial<User> | null | undefined,
  existingPasses: GatePass[] = []
): GatePass {
  const existing = existingPasses.find(
    (gp) =>
      (helper.passId && gp.id === helper.passId) ||
      (gp.name && helper.name && gp.name.toLowerCase() === helper.name.toLowerCase())
  );

  if (existing) {
    return {
      ...existing,
      unit: existing.unit || user?.unit || "102",
      building: existing.building || user?.building || "A Wing",
      assignedResident: existing.assignedResident || user?.name || "Resident",
      status: (helper.passStatus || existing.status || "active") as any,
      passType: existing.passType || `${helper.category || "Maid"} Pass`,
      allowedTimings:
        existing.allowedTimings ||
        `${helper.expectedArrival || "08:00 AM"} - ${helper.expectedExit || "12:00 PM"}`,
      permittedDays:
        existing.permittedDays ||
        helper.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
  }

  return {
    id: helper.passId || `GP-${(helper.id || "101").replace("HLP-", "")}`,
    name: helper.name,
    phone: helper.phone || "+91 98000 00000",
    passType: `${helper.category || "Maid"} Pass`,
    purpose: `Daily Domestic Pass (${helper.category || "Helper"})`,
    unit: user?.unit || "102",
    building: user?.building || "A Wing",
    assignedResident: user?.name || "Resident",
    validFrom: helper.joinedAt || "2026-01-01",
    validTo: "Open",
    allowedTimings: `${helper.expectedArrival || "08:00 AM"} - ${helper.expectedExit || "12:00 PM"}`,
    permittedDays: helper.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    otp: "389201",
    qrCodeData: `HOMEVERSE-PASS-${helper.passId || helper.id}-389201`,
    status: (helper.passStatus || "active") as any,
    createdAt: helper.joinedAt || new Date().toISOString(),
  };
}

