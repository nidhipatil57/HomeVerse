# 🔥 HomeVerse Firebase & Firestore Setup Guide

This guide will take you step-by-step through setting up a real Firebase backend for the HomeVerse application.

---

## 📋 Prerequisites
- A Google Account
- [Node.js](https://nodejs.org/) installed
- HomeVerse repository open on your machine

---

## 🛠️ Step 1: Create a Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g., `HomeVerse-Production`).
4. (Optional) Enable Google Analytics for the project, then click **Continue**.
5. Wait for the project creation to complete and click **Continue**.

---

## 🔑 Step 2: Enable Firebase Authentication
1. In the left-hand sidebar, navigate to **Build** -> **Authentication**.
2. Click **Get started**.
3. Under the **Sign-in method** tab, select **Email/Password**.
4. Enable the **Email/Password** toggle (keep *Email link (passwordless sign-in)* disabled).
5. Click **Save**.

---

## 🗄️ Step 3: Enable Cloud Firestore Database
1. In the sidebar, navigate to **Build** -> **Firestore Database**.
2. Click **Create database**.
3. Select your database location (choose the one closest to your location) and click **Next**.
4. Choose **Start in production mode** (we will upload custom rules later).
5. Click **Create**.

---

## 📦 Step 4: Enable Firebase Cloud Storage
1. In the sidebar, navigate to **Build** -> **Storage**.
2. Click **Get started**.
3. Choose **Start in production mode** and click **Next**.
4. Select your Cloud Storage location and click **Done**.

---

## 💻 Step 5: Register Your Web App
1. Go to the project homepage by clicking **Project Overview** in the top left.
2. Click the Web icon (`</>`) to register a new web application.
3. Enter an app nickname (e.g., `HomeVerse Web`).
4. (Optional) Check *Also set up Firebase Hosting* if you wish to host later.
5. Click **Register app**.
6. Firebase will display your app configuration details. It will look like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "homeverse-xxxx.firebaseapp.com",
     projectId: "homeverse-xxxx",
     storageBucket: "homeverse-xxxx.firebasestorage.app",
     messagingSenderId: "1234567890",
     appId: "1:1234:web:abcd"
   };
   ```
7. Keep this window open, as you will copy these values into your environment variables in the next step.

---

## 🌐 Step 6: Create Your Local `.env` File
1. In the root of your HomeVerse folder, copy the `.env.example` file to a new file named `.env`:
   - *Windows Command:* `copy .env.example .env`
2. Open your new `.env` file and populate the client-side configuration parameters with the values you copied in the previous step:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_copied_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_copied_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_copied_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_copied_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_copied_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_copied_app_id
   ```

---

## ⚙️ Step 7: Obtain Firebase Admin Credentials (For Seeding)
To automatically seed your database collections and create all the demo login accounts:
1. In the Firebase Console, click the Gear icon (⚙️) next to **Project Overview** and select **Project settings**.
2. Go to the **Service accounts** tab.
3. Click the **Generate new private key** button at the bottom.
4. Click **Generate key** to download the configuration `.json` file containing your admin credentials.
5. Open this downloaded `.json` file and copy the values into the bottom section of your `.env` file:
   - Copy `project_id` to `FIREBASE_PROJECT_ID`
   - Copy `client_email` to `FIREBASE_CLIENT_EMAIL`
   - Copy `private_key` to `FIREBASE_PRIVATE_KEY`
     *Note: Copy the entire private key block (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` strings). If the private key spans multiple lines, replace actual line breaks with `\n` characters, or wrap the value in double quotes.*

---

## 🚀 Step 8: Run the Seeding Script
Now that your environment variables are configured, populate your Firestore database and Authentication catalog:
1. Run the seeding command in your terminal:
   ```bash
   npm run seed
   ```
2. The script will:
   - Register the 10 residents, secretary, security guard, 10 workers, 6 students, and 2 wardens in Firebase Auth.
   - Synchronize profiles in the Firestore `users` collection.
   - Populated all complaints, visitors, bills, bookings, and events into Firestore.

---

## ⚙️ Step 9: Deploy Firestore Security Rules
To apply the production rules in `firestore.rules` directly to your database:
1. Install Firebase CLI (if you haven't already):
   ```bash
   npm install -g firebase-tools
   ```
2. Log in to your Google Account:
   ```bash
   firebase login
   ```
3. Initialize the project in your directory:
   ```bash
   firebase init firestore
   ```
   - Select **Use an existing project** and select your project.
   - For *What file should be used for Firestore Rules?*, hit Enter to accept the default `firestore.rules` (which uses our custom rules file).
4. Deploy the rules to the cloud:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 🏃‍♂️ Step 10: Run the Project
Start your local dev server:
1. Run the start command:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000` in your browser.
3. You can now use the `/demo-credentials` page to log in as any role immediately with one click, backed completely by real Firebase Authentication and Firestore!
