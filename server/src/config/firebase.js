import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let dbInstance = null;
let authInstance = null;
let isRealFirebase = false;

// Sample initial data for both seed and memory store
export const initialGames = [
  {
    id: "game-spider-man-2",
    title: "Marvel's Spider-Man 2",
    genre: "Action",
    tags: ["action", "adventure", "superhero", "open-world", "singleplayer"],
    playerCount: "1 Player",
    maxPlayers: 1,
    rating: 4.9,
    description: "Peter Parker and Miles Morales return in an exciting adventure. Swing, jump, and utilize the new Web Wings across Marvel's New York with near-instant fast travel.",
    features: ["Ray Tracing", "DualSense Haptics", "3D Audio", "4K 60FPS"],
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    available: true,
    releaseYear: 2023,
    highlight: "Popular"
  },
  {
    id: "game-god-of-war-ragnarok",
    title: "God of War Ragnarök",
    genre: "Action",
    tags: ["action", "mythology", "story-rich", "singleplayer", "combat"],
    playerCount: "1 Player",
    maxPlayers: 1,
    rating: 4.95,
    description: "Kratos and Atreus embark on a mythic journey for answers before Ragnarök arrives across each of the Nine Realms in breathtaking PS5 visual fidelity.",
    features: ["Native 4K", "Ultra-fast Loading", "Adaptive Triggers", "Haptic Combat"],
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    available: true,
    releaseYear: 2022,
    highlight: "Masterpiece"
  },
  {
    id: "game-ea-sports-fc-24",
    title: "EA SPORTS FC 24",
    genre: "Sports",
    tags: ["sports", "football", "multiplayer", "pvp", "competitive"],
    playerCount: "1-4 Players",
    maxPlayers: 4,
    rating: 4.7,
    description: "The next chapter in the world's game. Powered by HyperMotionV, PlayStyles optimized by Opta, and a revolutionized Frostbite Engine for high-octane 4-player couch play.",
    features: ["HyperMotionV", "Couch Multiplayer 4P", "DualSense Ball Physics", "4K HDR"],
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    available: true,
    releaseYear: 2023,
    highlight: "Co-op Favorite"
  },
  {
    id: "game-gran-turismo-7",
    title: "Gran Turismo 7",
    genre: "Racing",
    tags: ["racing", "simulation", "cars", "multiplayer", "psvr2"],
    playerCount: "1-2 Players",
    maxPlayers: 2,
    rating: 4.8,
    description: "Whether you're a competitive racer, collector, fine-tuning builder or photographer, find your line with over 400 cars on legendary circuits with realistic weather and handling.",
    features: ["DualSense Haptic Feedback", "Ray Traced Reflections", "Split-Screen 2P", "3D Spatial Audio"],
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80",
    available: true,
    releaseYear: 2022,
    highlight: "Pro Sim"
  },
  {
    id: "game-tekken-8",
    title: "Tekken 8",
    genre: "Fighting",
    tags: ["fighting", "multiplayer", "competitive", "pvp", "arcade"],
    playerCount: "1-2 Players",
    maxPlayers: 2,
    rating: 4.85,
    description: "Fist Meets Fate in the brand-new chapter of the legendary fighting game franchise. Unreal Engine 5 brings bone-crushing hits and intense 2-player battles.",
    features: ["Unreal Engine 5", "Heat System", "Destructive Arenas", "Ultra-low Input Lag"],
    imageUrl: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=800&auto=format&fit=crop&q=80",
    available: true,
    releaseYear: 2024,
    highlight: "Trending"
  },
  {
    id: "game-mortal-kombat-1",
    title: "Mortal Kombat 1",
    genre: "Fighting",
    tags: ["fighting", "multiplayer", "gore", "pvp", "action"],
    playerCount: "1-2 Players",
    maxPlayers: 2,
    rating: 4.75,
    description: "Discover a reborn Mortal Kombat Universe created by the Fire God Liu Kang. Features an all-new fighting system, game modes, and fatal Kameo Fighters.",
    features: ["Kameo Fighters", "4K 60FPS", "Cinematic Fatalities", "DualSense Rumble"],
    imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80",
    available: true,
    releaseYear: 2023,
    highlight: "Tournament Ready"
  },
  {
    id: "game-horizon-forbidden-west",
    title: "Horizon Forbidden West",
    genre: "Adventure",
    tags: ["adventure", "open-world", "sci-fi", "singleplayer", "rpg"],
    playerCount: "1 Player",
    maxPlayers: 1,
    rating: 4.9,
    description: "Join Aloy as she braves the Forbidden West – a majestic but dangerous frontier that conceals mysterious new robotic machine threats and ancient secrets.",
    features: ["Stunning Decima Engine", "Underwater Exploration", "Adaptive Bow Tension", "3D Tempest Audio"],
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    available: true,
    releaseYear: 2022,
    highlight: "Visual Stunner"
  },
  {
    id: "game-ratchet-clank-rift-apart",
    title: "Ratchet & Clank: Rift Apart",
    genre: "Adventure",
    tags: ["adventure", "family", "action", "platformer", "singleplayer"],
    playerCount: "1 Player",
    maxPlayers: 1,
    rating: 4.88,
    description: "Blast your way through an interdimensional adventure with Ratchet and Rivet. Instantaneous portal jumps showcase the unmatched power of the PS5 SSD.",
    features: ["Zero Loading Portals", "Pixar-level Graphics", "DualSense Weapon Resistance", "HDR 4K"],
    imageUrl: "https://images.unsplash.com/photo-1612287233215-d419ef02b1c6?w=800&auto=format&fit=crop&q=80",
    available: true,
    releaseYear: 2021,
    highlight: "All Ages"
  },
  {
    id: "game-hogwarts-legacy",
    title: "Hogwarts Legacy",
    genre: "Adventure",
    tags: ["adventure", "magic", "open-world", "rpg", "singleplayer"],
    playerCount: "1 Player",
    maxPlayers: 1,
    rating: 4.82,
    description: "Experience the wizarding world in the 1800s. Your character is a student who holds the key to an ancient secret that threatens to tear the magical world apart.",
    features: ["Wand Haptics", "Hogwarts Castle Exploration", "Ray Traced Reflections", "4K HDR"],
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    available: true,
    releaseYear: 2023,
    highlight: "Top RPG"
  },
  {
    id: "game-astro-bot",
    title: "Astro Bot (2024)",
    genre: "Adventure",
    tags: ["adventure", "platformer", "solo", "fun", "exclusive"],
    playerCount: "1 Player",
    maxPlayers: 1,
    rating: 4.98,
    description: "The critically acclaimed masterpiece celebrating PlayStation history! Over 50 planets to explore, featuring the most inventive use of the DualSense controller ever created.",
    features: ["DualSense Haptic Wizardry", "Silky 60FPS", "PlayStation Cameos", "Pure Fun"],
    imageUrl: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&auto=format&fit=crop&q=80",
    available: true,
    releaseYear: 2024,
    highlight: "GOTY Contender"
  },
  {
    id: "game-cyberpunk-2077",
    title: "Cyberpunk 2077: Phantom Liberty",
    genre: "Action",
    tags: ["action", "sci-fi", "rpg", "open-world", "story-rich"],
    playerCount: "1 Player",
    maxPlayers: 1,
    rating: 4.87,
    description: "Step into Night City with the next-gen PS5 upgrade and Phantom Liberty spy-thriller. Dynamic neon lighting, overhaul police AI, and thrilling vehicle combat.",
    features: ["Ray Tracing Mode", "Performance 60FPS", "DualSense Haptics", "Spatial Sound"],
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&auto=format&fit=crop&q=80",
    available: true,
    releaseYear: 2023,
    highlight: "Neon Cyberpunk"
  },
  {
    id: "game-gta-v-ps5",
    title: "Grand Theft Auto V Next-Gen",
    genre: "Action",
    tags: ["action", "open-world", "multiplayer", "crime", "cars"],
    playerCount: "1-4 Players",
    maxPlayers: 4,
    rating: 4.9,
    description: "Experience Los Santos and Blaine County in greater detail than ever before with up to 4K resolution, 60 FPS, HDR options, ray tracing, and immersive 3D audio.",
    features: ["Fidelity & Performance RT", "Faster Load Times", "Adaptive Triggers", "GTA Online 4P"],
    imageUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80",
    available: true,
    releaseYear: 2022,
    highlight: "Blockbuster"
  }
];

export const initialPricing = {
  ps5Gaming: {
    baseHourlyRateSolo: 150, // ₹150 / hour
    baseHourlyRateMulti: 220, // ₹220 / hour
    extraPlayerHourly: 60, // per extra player beyond 2
    controllerAddons: {
      pulse3dHeadset: 50,
      dualSenseEdge: 70
    }
  },
  movieTheatre: {
    baseHourlyRate: 750, // ₹750 / hour for private cinema room
    minDurationHours: 2,
    maxCapacity: 12,
    snackPackages: {
      none: 0,
      regular: 250, // Popcorn bucket + 2 soft drinks
      vipCombo: 499 // Gourmet nachos, artisan popcorn, 4 beverages
    }
  },
  homeRental: {
    dailyRate: 1199, // ₹1,199 / day
    weekend3DayRate: 2899, // ₹2,899 for Friday-Sunday
    weeklyRate: 5999, // ₹5,999 for 7 days
    securityDeposit: 4000, // Refundable deposit
    extraControllerDaily: 150,
    freeBundledGamesCount: 3
  },
  birthdayParty: {
    packages: {
      silver: {
        name: "Silver Neon Clash",
        price: 3499,
        durationHours: 2,
        includedGuests: 6,
        stations: 2,
        description: "2 PS5 Stations, welcome soft drinks, tournament leaderboard setup."
      },
      gold: {
        name: "Gold Cyber Party",
        price: 5999,
        durationHours: 3,
        includedGuests: 12,
        stations: 4,
        description: "4 PS5 Stations, VR Beat Saber zone, pizza & beverages combo, trophy for winner."
      },
      vipNeon: {
        name: "Bandhilki VIP Lounge Takeover",
        price: 9999,
        durationHours: 4,
        includedGuests: 20,
        stations: 6,
        description: "Full venue exclusivity: all 6 PS5 stations + 4K Cinema theatre, custom gamer cake, host & photographer."
      }
    },
    extraGuestFee: 250
  },
  taxRatePercent: 5 // 5% GST/Service tax
};

export const initialStations = [
  { id: "station-1", name: "Station 01 (Cyber Blue OLED 65\")", type: "ps5", status: "available" },
  { id: "station-2", name: "Station 02 (Neon Violet OLED 65\")", type: "ps5", status: "available" },
  { id: "station-3", name: "Station 03 (Matrix Green OLED 65\")", type: "ps5", status: "available" },
  { id: "station-4", name: "Station 04 (Dual Couch Esports Station)", type: "ps5", status: "available" },
  { id: "station-5", name: "Station 05 (Gran Turismo Racing Cockpit)", type: "ps5", status: "available" },
  { id: "station-6", name: "Station 06 (VR2 Cyber Pod)", type: "ps5", status: "available" },
  { id: "theatre-1", name: "Bandhilki VIP Dolby Cinema Suite", type: "theatre", status: "available" },
  { id: "rental-console-1", name: "PS5 Disc Edition Console Bundle A", type: "home_rental", status: "available" },
  { id: "rental-console-2", name: "PS5 Digital Edition Console Bundle B", type: "home_rental", status: "available" }
];

export const initialBookings = [
  {
    id: "BND-2026-00101",
    userId: "demo-user-1",
    userEmail: "gamer@bandhilki.com",
    userName: "Aditya Patil",
    userPhone: "+91 98765 43210",
    service: "ps5_gaming",
    serviceTitle: "PS5 Lounge Gaming",
    date: "2026-10-26",
    startTime: "16:00",
    endTime: "18:00",
    durationHours: 2,
    resourceId: "station-1",
    resourceName: "Station 01 (Cyber Blue OLED 65\")",
    details: {
      gameId: "game-spider-man-2",
      gameTitle: "Marvel's Spider-Man 2",
      playerCount: 2,
      mode: "multiplayer",
      addons: ["pulse3dHeadset"]
    },
    itemizedPrice: {
      basePrice: 440,
      extraPlayersFee: 0,
      addOnsFee: 50,
      securityDeposit: 0,
      subtotal: 490,
      taxes: 25,
      total: 515
    },
    status: "confirmed",
    notes: "Birthday practice session",
    createdAt: new Date().toISOString()
  },
  {
    id: "BND-2026-00102",
    userId: "demo-user-2",
    userEmail: "shreya.k@gmail.com",
    userName: "Shreya Kadam",
    userPhone: "+91 99887 66554",
    service: "home_rental",
    serviceTitle: "PS5 Console Home Rental",
    date: "2026-10-28",
    startTime: "10:00",
    endTime: "10:00",
    durationHours: 72,
    resourceId: "rental-console-1",
    resourceName: "PS5 Disc Edition Console Bundle A",
    details: {
      rentalPeriod: "weekend3DayRate",
      deliveryAddress: "Flat 402, Samer seth bilding, Vishal Nagar, Vasai West, Mumbai 401202",
      extraControllers: 1,
      selectedGames: ["Marvel's Spider-Man 2", "EA SPORTS FC 24", "Tekken 8"]
    },
    itemizedPrice: {
      basePrice: 2899,
      extraPlayersFee: 450,
      addOnsFee: 0,
      securityDeposit: 4000,
      subtotal: 7349,
      taxes: 167,
      total: 7516
    },
    status: "pending",
    notes: "Please deliver before Friday 2 PM",
    createdAt: new Date().toISOString()
  }
];

// In-Memory Database Fallback implementation
class MemoryCollection {
  constructor(name, initialItems = []) {
    this.name = name;
    this.data = new Map();
    initialItems.forEach(item => {
      const docId = item.id || `doc_${Math.random().toString(36).substr(2, 9)}`;
      this.data.set(docId, { ...item, id: docId });
    });
  }

  doc(id) {
    const self = this;
    const docId = id || `doc_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: docId,
      async get() {
        const item = self.data.get(docId);
        return {
          exists: !!item,
          id: docId,
          data: () => (item ? { ...item } : null)
        };
      },
      async set(data, options = {}) {
        const existing = self.data.get(docId) || {};
        const merged = options.merge ? { ...existing, ...data } : { ...data };
        merged.id = docId;
        self.data.set(docId, merged);
        return merged;
      },
      async update(data) {
        const existing = self.data.get(docId);
        if (!existing) throw new Error(`Document ${docId} does not exist`);
        const updated = { ...existing, ...data, id: docId };
        self.data.set(docId, updated);
        return updated;
      },
      async delete() {
        self.data.delete(docId);
        return true;
      }
    };
  }

  async add(data) {
    const id = data.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const full = { ...data, id };
    this.data.set(id, full);
    return { id, data: () => full };
  }

  where(field, operator, value) {
    return new MemoryQuery(this).where(field, operator, value);
  }

  orderBy(field, direction) {
    return new MemoryQuery(this).orderBy(field, direction);
  }

  limit(count) {
    return new MemoryQuery(this).limit(count);
  }

  async get() {
    return new MemoryQuery(this).get();
  }
}

class MemoryQuery {
  constructor(collection, filters = [], order = null, limitCount = null) {
    this.collection = collection;
    this.filters = filters;
    this.order = order;
    this.limitCount = limitCount;
  }

  where(field, operator, value) {
    return new MemoryQuery(
      this.collection,
      [...this.filters, { field, operator, value }],
      this.order,
      this.limitCount
    );
  }

  orderBy(field, direction = 'asc') {
    return new MemoryQuery(this.collection, this.filters, { field, direction }, this.limitCount);
  }

  limit(count) {
    return new MemoryQuery(this.collection, this.filters, this.order, count);
  }

  async get() {
    let items = Array.from(this.collection.data.values());

    for (const { field, operator, value } of this.filters) {
      items = items.filter(item => {
        const itemVal = item[field];
        if (operator === '==' || operator === '===') return itemVal === value;
        if (operator === '!=') return itemVal !== value;
        if (operator === '>=') return itemVal >= value;
        if (operator === '<=') return itemVal <= value;
        if (operator === '>') return itemVal > value;
        if (operator === '<') return itemVal < value;
        if (operator === 'in') return Array.isArray(value) && value.includes(itemVal);
        if (operator === 'array-contains') return Array.isArray(itemVal) && itemVal.includes(value);
        return false;
      });
    }

    if (this.order) {
      const { field, direction } = this.order;
      items.sort((a, b) => {
        if (a[field] < b[field]) return direction === 'desc' ? 1 : -1;
        if (a[field] > b[field]) return direction === 'desc' ? -1 : 1;
        return 0;
      });
    }

    if (typeof this.limitCount === 'number') {
      items = items.slice(0, this.limitCount);
    }

    const docs = items.map(item => ({
      id: item.id,
      exists: true,
      data: () => ({ ...item })
    }));

    return {
      empty: docs.length === 0,
      size: docs.length,
      docs
    };
  }
}

class MemoryFirestore {
  constructor() {
    this.collections = new Map();
    this.collections.set('games', new MemoryCollection('games', initialGames));
    this.collections.set('pricing', new MemoryCollection('pricing', [{ id: 'current', ...initialPricing }]));
    this.collections.set('stations', new MemoryCollection('stations', initialStations));
    this.collections.set('bookings', new MemoryCollection('bookings', initialBookings));
    this.collections.set('users', new MemoryCollection('users', [
      {
        id: "admin-demo-id",
        email: "admin@gmail.com",
        displayName: "Bandhilki Administrator (Boss)",
        role: "admin",
        createdAt: new Date().toISOString()
      },
      {
        id: "demo-user-1",
        email: "gamer@gmail.com",
        displayName: "Aditya Patil",
        role: "user",
        createdAt: new Date().toISOString()
      }
    ]));
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MemoryCollection(name, []));
    }
    return this.collections.get(name);
  }

  async runTransaction(updateFunction) {
    const transaction = {
      async get(docRef) {
        return docRef.get();
      },
      set(docRef, data, options) {
        return docRef.set(data, options);
      },
      update(docRef, data) {
        return docRef.update(data);
      },
      delete(docRef) {
        return docRef.delete();
      }
    };
    return updateFunction(transaction);
  }
}

// Memory Auth Mock
const memoryAuth = {
  async verifyIdToken(token) {
    if (token === "demo-admin-token") {
      return {
        uid: "admin-demo-id",
        email: "admin@gmail.com",
        name: "Bandhilki Administrator",
        role: "admin"
      };
    }
    if (token && token.startsWith("demo-token-")) {
      const uid = token.replace("demo-token-", "");
      const isAdm = uid === 'admin-demo-id' || uid === 'admin';
      return {
        uid: uid,
        email: isAdm ? 'admin@gmail.com' : `${uid}@gmail.com`,
        name: isAdm ? 'Bandhilki Administrator' : `Gamer ${uid}`,
        role: isAdm ? "admin" : "user"
      };
    }
    return {
      uid: "demo-user-1",
      email: "gamer@gmail.com",
      name: "Aditya Patil",
      role: "user"
    };
  },
  async getUser(uid) {
    return {
      uid,
      email: uid === 'admin-demo-id' ? 'admin@gmail.com' : 'gamer@gmail.com',
      displayName: uid === 'admin-demo-id' ? 'Bandhilki Administrator' : 'Aditya Patil'
    };
  }
};

export function initFirebase() {
  if (dbInstance && authInstance) {
    return { db: dbInstance, auth: authInstance, isReal: isRealFirebase };
  }

  try {
    let credential = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) {
      const serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'utf8'));
      credential = admin.credential.cert(serviceAccount);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      });
    }

    if (credential) {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential,
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }
      dbInstance = admin.firestore();
      authInstance = admin.auth();
      isRealFirebase = true;
      console.log('⚡ [Firebase] Successfully connected to live Firebase Cloud Firestore & Auth!');
      return { db: dbInstance, auth: authInstance, isReal: true };
    }
  } catch (error) {
    console.warn('⚠️ [Firebase] Could not initialize real Firebase Admin SDK:', error.message);
  }

  console.log('🎮 [Bandhilki Backend] Running in Local Memory Mode. Pre-seeded with PS5 catalogue, stations, and demo users.');
  console.log('ℹ️ [Notice] To connect live Firebase, set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in server/.env');
  dbInstance = new MemoryFirestore();
  authInstance = memoryAuth;
  isRealFirebase = false;

  return { db: dbInstance, auth: authInstance, isReal: false };
}

export const { db, auth } = initFirebase();
