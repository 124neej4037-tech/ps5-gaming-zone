import dotenv from 'dotenv';
import { db, initialGames, initialPricing, initialStations, initialBookings } from '../config/firebase.js';

dotenv.config();

async function runSeed() {
  console.log('🌱 Starting Bandhilki PS5 Firestore Data Seeding...');

  try {
    // 1. Seed Games
    console.log(`🎮 Seeding ${initialGames.length} PS5 games...`);
    for (const game of initialGames) {
      await db.collection('games').doc(game.id).set(game, { merge: true });
      console.log(`   + Seeded game: ${game.title}`);
    }

    // 2. Seed Pricing
    console.log('💰 Seeding pricing configuration document...');
    await db.collection('pricing').doc('current').set(initialPricing, { merge: true });
    console.log('   + Seeded pricing rates');

    // 3. Seed Stations / Resources
    console.log(`🕹️ Seeding ${initialStations.length} lounge resources & stations...`);
    for (const station of initialStations) {
      await db.collection('stations').doc(station.id).set(station, { merge: true });
      console.log(`   + Seeded station: ${station.name}`);
    }

    // 4. Seed Users
    console.log('👤 Seeding default users (Admin + Sample Gamer)...');
    const adminUser = {
      id: 'admin-demo-id',
      email: process.env.INITIAL_ADMIN_EMAIL || 'admin@bandhilki.com',
      displayName: 'Bandhilki Lounge Admin',
      phone: '+91 8180807208',
      role: 'admin',
      loyaltyPoints: 500,
      createdAt: new Date().toISOString()
    };
    await db.collection('users').doc(adminUser.id).set(adminUser, { merge: true });

    const sampleUser = {
      id: 'demo-user-1',
      email: 'gamer@bandhilki.com',
      displayName: 'Aditya Patil',
      phone: '+91 98765 43210',
      role: 'user',
      loyaltyPoints: 200,
      createdAt: new Date().toISOString()
    };
    await db.collection('users').doc(sampleUser.id).set(sampleUser, { merge: true });
    console.log('   + Seeded admin & gamer accounts');

    // 5. Seed Bookings
    console.log(`📅 Seeding ${initialBookings.length} initial bookings...`);
    for (const booking of initialBookings) {
      await db.collection('bookings').doc(booking.id).set(booking, { merge: true });
      console.log(`   + Seeded booking: ${booking.id} (${booking.serviceTitle})`);
    }

    console.log('✅ Bandhilki PS5 Firestore Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    process.exit(1);
  }
}

runSeed();
