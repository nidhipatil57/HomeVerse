import { loadEnvConfig } from "@next/env";
import { initializeApp, cert, getApp, getApps } from "firebase-admin/app";
import { getSecurityRules } from "firebase-admin/security-rules";
import * as fs from 'fs';
import * as path from 'path';

loadEnvConfig(process.cwd());

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ ERROR: Missing Firebase Admin SDK environment variables in .env!");
  process.exit(1);
}

const app = getApps().length > 0 ? getApp() : initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  })
});

async function deployRules() {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  console.log('Reading rules from:', rulesPath);
  
  if (!fs.existsSync(rulesPath)) {
    console.error('Error: firestore.rules file not found.');
    return;
  }

  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  
  try {
    const rules = getSecurityRules(app);
    console.log('Deploying and releasing firestore ruleset...');
    await rules.releaseFirestoreRulesetFromSource(rulesContent);
    console.log('Rules deployed successfully!');
  } catch (error) {
    console.error('Error deploying rules:', error);
  }
}

deployRules();
