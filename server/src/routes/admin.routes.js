import express from 'express';
import { db } from '../config/firebase.js';
import { verifyFirebaseToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(verifyFirebaseToken, requireAdmin);

/**
 * GET /api/admin/stats
 * Aggregates live statistics for bookings, revenue, stations, games, and users
 */
router.get('/stats', async (req, res) => {
  try {
    const [bookingsSnap, gamesSnap, usersSnap, stationsSnap] = await Promise.all([
      db.collection('bookings').get(),
      db.collection('games').get(),
      db.collection('users').get(),
      db.collection('stations').get()
    ]);

    const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const games = gamesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const stations = stationsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Calculate revenue (confirmed and completed bookings)
    const validBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const totalRevenue = validBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || Number(b.itemizedPrice?.total) || 0), 0);

    // Breakdown by service
    const serviceBreakdown = {
      ps5_gaming: bookings.filter(b => b.service === 'ps5_gaming').length,
      movie_theatre: bookings.filter(b => b.service === 'movie_theatre').length,
      home_rental: bookings.filter(b => b.service === 'home_rental').length,
      birthday_party: bookings.filter(b => b.service === 'birthday_party').length
    };

    // Status breakdown
    const statusBreakdown = {
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      rejected: bookings.filter(b => b.status === 'rejected').length
    };

    const activeStations = stations.filter(s => s.status !== 'maintenance').length;

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalBookings: bookings.length,
        totalGames: games.length,
        totalUsers: users.length,
        activeStations,
        totalStations: stations.length,
        serviceBreakdown,
        statusBreakdown,
        recentBookings: bookings
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/bookings
 * Query parameters: status, date, search
 */
router.get('/bookings', async (req, res) => {
  try {
    const { status, date, search } = req.query;

    const snap = await db.collection('bookings').get();
    let bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (status && status !== 'all') {
      bookings = bookings.filter(b => b.status?.toLowerCase() === status.toLowerCase());
    }

    if (date) {
      bookings = bookings.filter(b => b.date === date);
    }

    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter(b =>
        b.id?.toLowerCase().includes(q) ||
        b.userName?.toLowerCase().includes(q) ||
        b.userEmail?.toLowerCase().includes(q) ||
        b.serviceTitle?.toLowerCase().includes(q) ||
        b.resourceName?.toLowerCase().includes(q)
      );
    }

    // Sort descending by date and time
    bookings.sort((a, b) => new Date(b.date + ' ' + (b.startTime || '00:00')) - new Date(a.date + ' ' + (a.startTime || '00:00')));

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/admin/bookings/:id/status
 * Change booking status: 'confirmed', 'rejected', 'cancelled', 'completed'
 */
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const validStatuses = ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const docRef = db.collection('bookings').doc(req.params.id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const updates = {
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.email
    };
    if (adminNotes) updates.adminNotes = adminNotes;

    await docRef.update(updates);

    res.json({
      success: true,
      message: `Booking ${req.params.id} status updated to ${status}`,
      booking: { id: req.params.id, ...snap.data(), ...updates }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/resources
 * List all gaming stations, VR pods, and cinema theatre rooms
 */
router.get('/resources', async (req, res) => {
  try {
    const snap = await db.collection('stations').get();
    const stations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, resources: stations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/admin/resources/:id
 * Toggle station status or update details
 */
router.put('/resources/:id', async (req, res) => {
  try {
    const { status, name, notes } = req.body;
    const docRef = db.collection('stations').doc(req.params.id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (name) updates.name = name;
    if (notes !== undefined) updates.notes = notes;

    await docRef.update(updates);
    res.json({ success: true, message: 'Resource updated successfully', resource: { id: req.params.id, ...snap.data(), ...updates } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/users
 * Manage registered users
 */
router.get('/users', async (req, res) => {
  try {
    const snap = await db.collection('users').get();
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
