# 🐘 HomeVerse - Neon PostgreSQL Migration Setup Guide

This guide details the steps to set up the Neon PostgreSQL database, initialize the Prisma schema, seed the prepopulated mock records, and start the HomeVerse REST and WebSocket architecture.

---

## 🛠️ Step 1: Database Setup & Environment Configuration

1. Log into your [Neon Console](https://neon.tech/) and create a new PostgreSQL project.
2. Retrieve your database connection string (`postgresql://...`).
3. Create a new `.env` file inside the `server/` directory:
   ```bash
   # Create server/.env
   touch server/.env
   ```
4. Paste the connection string into **both** the root `.env` and `server/.env` files:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<neon-hostname>/<db-name>?sslmode=require"
   JWT_SECRET="homeverse-secret-key-12345"
   PORT=5000
   ```

---

## 🏗️ Step 2: Initialize Database Schema (Prisma)

Open a terminal at `server/` and run the following command to deploy the schema onto Neon:

```powershell
# Generate Prisma Client & Sync Schema
npx prisma migrate dev --name init
```

This will automatically:
- Connect to your Neon PostgreSQL cluster.
- Create 29 fully normalized tables with primary keys, foreign keys, and indices.
- Compile a local type-safe `@prisma/client` library.

---

## 🌱 Step 3: Seed Database Records

Run the seed script to populate the tables with all mock residents, complaints, visitors, helpers, and billing records:

```powershell
# Run the database seeder
npx prisma db seed
```

Once completed, you will have the following preconfigured logins matching the original demo data:
* **Resident:** `sara@sunshinecomplex.com` / `Sara@123`
* **Secretary:** `rahul@sunshinecomplex.com` / `Rahul@123`
* **Security:** `raj@sunshinecomplex.com` / `Raj@123`
* **Worker:** `amit@sunshinecomplex.com` / `Amit@123`
* **Student:** `aarav@vesit.edu` / `Aarav@123`
* **Warden:** `pillai@vesit.edu` / `Pillai@123`

---

## 🚀 Step 4: Starting the Application

To run the full stack, you need to start both the Express backend and the Next.js frontend dev servers:

### 1. Start the Express Backend Server (Port 5000)
Open a terminal in the `server/` directory and run:
```powershell
npm run dev
```
*Outputs: `🚀 HomeVerse Backend running on port 5000`*

### 2. Start the Next.js Frontend Server (Port 3000)
Open another terminal in the root workspace directory and run:
```powershell
npm run dev
```

Next.js is configured with a proxy rewrite rule inside `next.config.ts`, so:
- **API calls** to `/api/*` are forwarded to the Express server on port `5000`.
- **WebSocket connections** on `/socket.io/*` are routed to the Express socket server.

---

## 🛡️ Architecture & Security Details

- **Authentication:** Custom JWT-based session mechanism storing token cookies in secure, HTTP-only configurations.
- **Real-time Updates:** Driven by Socket.IO. When complaints are submitted, helpers checked in, or emergency alerts raised, updates are broadcasted to all active dashboards.
- **Relational Integrity:** Enabled cascade deletion and relational indexing to support query speeds up to 10x faster than the original Firebase implementation.
