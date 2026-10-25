# 🎮 Bandhilki PS5 Gaming Zone

A premium, responsive, full-stack gaming lounge & console rental platform built with **React**, **JavaScript**, **HTML/CSS**, **Node.js**, **Express.js**, and **Firebase (Cloud Firestore & Authentication)**.

> **Promotional Offer:**  
> *“Start the New Year with the Ultimate PS5 Gaming Experience! High-fidelity graphics, premium RGB ambience, and lag-free gameplay. **Now offering PS5 Home Rentals!**”*

---

## 🌟 Key Features

### 1. 🖥️ Gaming Aesthetic & Design System
- **Dark navy blue & deep purple** backgrounds with neon cyan (`#00f0ff`), electric purple (`#8a2be2`), and neon pink (`#ff007f`) accents.
- Modern glassmorphism with subtle borders, glowing buttons, and micro-animations.
- High-fidelity typography powered by Google Fonts: **Orbitron** (display/headings), **Rajdhani** (tech accents), and **Inter** (clean readable body).
- Fully responsive across desktop, tablet, and mobile devices.

### 2. 🎮 4 Core Gaming Services
1. **PS5 Lounge Gaming:** Solo or 2–4 player couch co-op with 65" 4K 120Hz OLED gaming stations, low-latency HDMI 2.1, and DualSense haptics.
2. **VIP Cinema Theatre Room:** Private 4K laser Dolby Atmos screening room (up to 12 guests) for movies, gaming tournaments, and esports parties with gourmet snack packages.
3. **PS5 Console Home Rentals ⭐:** Doorstep delivery of PS5 Disc/Digital consoles across Vasai West, Mumbai, and Vasai-Virar with 3 free blockbuster games, extra controllers, and a 100% refundable security deposit.
4. **Neon Birthday & Esports Parties:** Tiered party packages (Silver, Gold, VIP Takeover) with custom gamer cakes, tournament leaderboards, and photographer add-ons.

### 3. 🕹️ Games Catalogue & Search
- Official PS5 catalogue featuring titles like *Marvel's Spider-Man 2*, *God of War Ragnarök*, *EA SPORTS FC 24*, *Gran Turismo 7*, *Tekken 8*, *Astro Bot*, *Horizon Forbidden West*, and *Cyberpunk 2077*.
- Real-time search by title, tags, and gameplay modes.
- Filter chips for **Solo**, **Multiplayer**, **Action**, **Adventure**, **Sports**, **Racing**, and **Fighting**.
- Detailed hardware specs modal and direct "⚡ Book This Game Now" action.

### 4. 🤖 Bandhilki AI Game Concierge
- Interactive questionnaire or natural chat mode asking for:
  - **Preferred Genre** (Action, Adventure, Racing, Sports, Fighting)
  - **Player Count** (Solo, 2P Co-op, 4P Party)
  - **Desired Mood** (Adrenaline Rush, Chilled & Story-Rich, Competitive Showdown, Family Fun)
  - **Budget Preference** (1 Hour Solo, 2 Hours Multi, VIP Half-Day)
- Powered by **Google Gemini API** (with an intelligent rule-based scoring engine fallback).
- Recommends matching games directly from the actual catalogue with tailored rationale and instant booking CTAs.

### 5. 📅 Booking System & Dynamic Pricing Engine
- Service-specific forms with live dynamic pricing calculations (`/api/pricing/calculate`).
- Real-time station conflict & double-allocation prevention (`/api/bookings/availability`) ensuring no overlapping bookings on the same station.
- Itemized price breakdown showing base hourly rate, extra players/controllers fee, hardware add-ons, taxes, and refundable security deposit before confirmation.
- Celebratory booking confirmation with confetti and generation of a unique reference ID (e.g. `BND-2026-XXXXX`).

### 6. 👤 Gamer & Admin Dashboards
- **User Dashboard:**
  - View upcoming, past, and cancelled sessions.
  - Digital **Lounge Entry QR Pass** for station check-in.
  - Itemized receipt inspection.
  - Self-service booking cancellation (for eligible upcoming bookings).
  - Loyalty Reward Points counter (earned automatically with every session).
- **Admin Operations Hub:**
  - Aggregated metrics: Total Revenue, Total Bookings, Active Stations, Registered Users.
  - Bookings Management: Search, date & status filters, with actions to **Confirm**, **Complete**, **Cancel**, and **Reject** bookings.
  - PS5 Games Vault CRUD: Add new games with cover images, player count, ratings, and tags, or edit/delete existing games.
  - Pricing & Services Configurator: Modify hourly rates, rental packages, and GST tax percentages live without redeploying code.
  - Stations & Pods Controller: Toggle stations between *Operational* and *Maintenance*.
  - User Directory: Inspect registered players and assign administrative permissions.

---

## 🏗️ Project Architecture

```
Gaming Zone/
├── client/                     # Frontend React (Vite) Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Navbar, Footer, etc.
│   │   ├── context/            # AuthContext (Firebase Auth + Demo Mode)
│   │   ├── firebase/           # Firebase Web SDK initialization
│   │   ├── pages/              # Home, Games, AI Assistant, Booking, Login, Dashboards
│   │   ├── services/           # API client service (fetch wrapper with JWT)
│   │   ├── App.jsx             # React Router routing & protected routes
│   │   ├── index.css           # Neon cyberpunk design tokens & styling
│   │   └── main.jsx            # Application entry point
│   ├── .env.example            # Frontend environment variables example
│   ├── index.html              # HTML shell with Google Fonts
│   └── package.json            # Client dependencies
│
├── server/                     # Backend Node.js & Express API
│   ├── src/
│   │   ├── config/             # Firebase Admin SDK & In-Memory Fallback Store
│   │   ├── middleware/         # Firebase ID token verification & admin guards
│   │   ├── routes/             # auth, games, pricing, bookings, admin, ai
│   │   ├── scripts/            # seed.js (populates Firestore catalogue & rates)
│   │   ├── utils/              # pricingCalculator.js (strict itemized pricing)
│   │   └── index.js            # Express server entry point
│   ├── .env.example            # Backend environment variables example
│   └── package.json            # Server dependencies
│
├── firestore.rules             # Production Firebase Firestore Security Rules
├── package.json                # Root package with concurrent dev scripts
└── README.md                   # Full documentation & setup guide
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Install All Dependencies
From the repository root, install dependencies for the root, client, and server:
```bash
npm run install:all
```
*(Or run `npm install` inside both `client/` and `server/` directories).*

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both folders:

**In `server/`:**
```bash
cp server/.env.example server/.env
```
*(See [Firebase Configuration](#-firebase-configuration-guide) below for credentials).*

**In `client/`:**
```bash
cp client/.env.example client/.env
```

### 3. Seed Database (Optional / Recommended)
To seed initial PS5 blockbuster games, lounge stations, default pricing rates, and sample accounts:
```bash
npm run seed
```

### 4. Run Development Servers
Start both the Express API (Port 5000) and React Vite Frontend (Port 5173) with a single command:
```bash
npm run dev
```

Visit **`http://localhost:5173/`** in your browser!

---

## 🔒 Firebase Configuration Guide

Bandhilki PS5 Gaming Zone uses:
1. **Firebase Authentication** for email/password and Google Sign-In.
2. **Cloud Firestore** for storing users, games, bookings, pricing rates, and station resources.
3. **Firebase Admin SDK** on the Node.js backend for server-side token validation and secure database operations.

> 💡 **Zero-Crash Development Mode**: The application includes a fallback in-memory store so you can explore all features immediately. To connect to live Google Cloud Firebase, follow the steps below:

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `bandhilki-ps5`.
3. Enable **Authentication**:
   - Go to **Build > Authentication > Sign-in method**.
   - Enable **Email/Password** and **Google**.
4. Enable **Cloud Firestore**:
   - Go to **Build > Firestore Database**.
   - Click **Create database** (Start in production mode or test mode).
   - In the **Rules** tab, paste the contents of [`firestore.rules`](file:///c:/Users/hp/Downloads/Gaming%20Zone/firestore.rules) from the project root.

### Step 2: Get Frontend Web App Keys
1. In Firebase Console, go to **Project settings > General**.
2. Under *Your apps*, click the **Web (</>)** icon.
3. Copy the configuration object and add it to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=bandhilki-ps5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bandhilki-ps5
VITE_FIREBASE_STORAGE_BUCKET=bandhilki-ps5.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### Step 3: Get Backend Service Account Credentials
1. In Firebase Console, go to **Project settings > Service accounts**.
2. Click **Generate new private key** and download the JSON file.
3. Configure `server/.env`:
   - Either place the downloaded JSON file in `server/config/serviceAccountKey.json` and set:
     ```env
     FIREBASE_SERVICE_ACCOUNT_KEY=./config/serviceAccountKey.json
     ```
   - OR set the individual environment variables:
     ```env
     FIREBASE_PROJECT_ID=bandhilki-ps5
     FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bandhilki-ps5.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
     ```

---

## 🤖 Google Gemini AI API Configuration

To enable live Google Gemini AI recommendations for the AI Game Assistant:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Add your key to `server/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
*(If no API key is set, the server seamlessly runs its built-in rule-based recommendation algorithm against the database catalogue).*

---

## 🗄️ Firestore Data Structure

### 1. `users` Collection
```json
{
  "id": "firebase_uid",
  "email": "gamer@bandhilki.com",
  "displayName": "Aditya Patil",
  "phone": "+91 98765 43210",
  "role": "user", // or "admin"
  "loyaltyPoints": 200,
  "createdAt": "2026-10-25T20:00:00.000Z"
}
```

### 2. `games` Collection
```json
{
  "id": "game-spider-man-2",
  "title": "Marvel's Spider-Man 2",
  "genre": "Action",
  "tags": ["action", "adventure", "superhero", "open-world"],
  "playerCount": "1 Player",
  "maxPlayers": 1,
  "rating": 4.9,
  "description": "Peter Parker and Miles Morales return in an exciting adventure...",
  "features": ["Ray Tracing", "DualSense Haptics", "3D Audio", "4K 60FPS"],
  "imageUrl": "https://images.unsplash.com/...",
  "available": true,
  "releaseYear": 2023
}
```

### 3. `bookings` Collection
```json
{
  "id": "BND-2026-89412",
  "userId": "firebase_uid",
  "userName": "Aditya Patil",
  "userEmail": "gamer@bandhilki.com",
  "service": "ps5_gaming",
  "serviceTitle": "PS5 Lounge Gaming",
  "date": "2026-10-26",
  "startTime": "16:00",
  "endTime": "18:00",
  "durationHours": 2,
  "resourceId": "station-1",
  "resourceName": "Station 01 (Cyber Blue OLED 65\")",
  "details": {
    "gameId": "game-spider-man-2",
    "gameTitle": "Marvel's Spider-Man 2",
    "playerCount": 2,
    "mode": "multiplayer"
  },
  "itemizedPrice": {
    "basePrice": 440,
    "extraPlayersFee": 0,
    "addOnsFee": 50,
    "securityDeposit": 0,
    "subtotal": 490,
    "taxRatePercent": 5,
    "taxes": 25,
    "total": 515,
    "lineItems": [...]
  },
  "totalPrice": 515,
  "status": "confirmed", // "pending" | "confirmed" | "completed" | "cancelled" | "rejected"
  "createdAt": "2026-10-25T20:00:00.000Z"
}
```

### 4. `pricing/current` Document
Defines base rates, hourly multipliers, extra player charges, and rental packages dynamically editable from the Admin Hub.

---

## ⚡ Instant Evaluation Logins

For immediate local testing without needing email verification:
- Click **Log In** on the navbar.
- Choose:
  - **Demo Gamer**: Pre-populated with active bookings, loyalty points, and station pass.
  - **Demo Admin**: Unlocks the full **Admin Operations Hub** with stats, booking approval actions, and price editing.

---

## 📄 License
MIT License. Built for **Bandhilki PS5 Gaming Zone**.
