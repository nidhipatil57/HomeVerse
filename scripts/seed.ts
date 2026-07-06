import { loadEnvConfig } from "@next/env";
import { initializeApp, cert, getApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getInitialDb } from "../src/data/mock-db-seed";

// Load Next.js environment variables
loadEnvConfig(process.cwd());

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ ERROR: Missing Firebase Admin SDK environment variables in .env!");
  console.error("Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.");
  process.exit(1);
}

// Initialize Admin SDK
const app = getApps().length > 0 ? getApp() : initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  })
});

const firestore = getFirestore(app);
const auth = getAuth(app);

async function seed() {
  console.log("🚀 Starting Firebase Production Seeding...");
  const initialDb = getInitialDb();

  // 1. Seed Users and Auth Accounts
  console.log("\n🔑 Seeding users and registering Auth credentials...");
  const users = initialDb.users;
  for (const user of users) {
    // Register in Firebase Auth
    try {
      await auth.getUserByEmail(user.email);
      console.log(`- Auth user already exists: ${user.email}`);
    } catch (e) {
      try {
        await auth.createUser({
          uid: user.id, // Stable UID matching our database references
          email: user.email,
          password: user.password || "Password@123",
          displayName: user.name,
        });
        console.log(`- Created Auth credentials: ${user.email} (UID: ${user.id})`);
      } catch (err: any) {
        console.error(`❌ Failed to create Auth user: ${user.email}. Error:`, err.message);
      }
    }

    // Save profile document in Firestore
    try {
      await firestore.collection("users").doc(user.id).set(user);
      console.log(`  - Saved user profile: ${user.name}`);
    } catch (err: any) {
      console.error(`❌ Failed to save user doc for: ${user.id}. Error:`, err.message);
    }
  }

  // 2. Seed other collections
  const collectionsToSeed = [
    { key: "complaints", name: "complaints" },
    { key: "leaveRequests", name: "leaveRequests" },
    { key: "visitors", name: "visitors" },
    { key: "laundrySlots", name: "laundrySlots" },
    { key: "parcels", name: "parcels" },
    { key: "facilityBookings", name: "facilityBookings" },
    { key: "marketplaceItems", name: "marketplaceItems" },
    { key: "lostFoundItems", name: "lostFoundItems" },
    { key: "roomChangeRequests", name: "roomChangeRequests" },
    { key: "maintenanceBills", name: "maintenanceBills" },
    { key: "communityEvents", name: "communityEvents" },
    { key: "notifications", name: "notifications" },
    { key: "emergencies", name: "emergencies" },
    { key: "gatePasses", name: "gatePasses" },
    { key: "vehicleLogs", name: "vehicleLogs" },
    { key: "incidents", name: "incidents" },
    { key: "announcements", name: "announcements" },
    { key: "expenses", name: "expenses" },
    { key: "flats", name: "flats" },
    { key: "rentRecords", name: "rentRecords" }
  ];

  for (const { key, name } of collectionsToSeed) {
    const list = (initialDb as any)[key] || [];
    console.log(`\n📦 Seeding collection "${name}" (${list.length} records)...`);
    for (const item of list) {
      if (item && item.id) {
        try {
          await firestore.collection(name).doc(item.id).set(item);
        } catch (err: any) {
          console.error(`❌ Failed to save doc "${item.id}" in "${name}". Error:`, err.message);
        }
      }
    }
    console.log(`  - Completed "${name}"`);
  }

  console.log("\n✅ Firebase Database Seeding successfully completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Fatal Seeding Error:", err);
  process.exit(1);
});
