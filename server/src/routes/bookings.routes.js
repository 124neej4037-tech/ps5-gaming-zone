import express from 'express';
import { db } from '../config/firebase.js';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { getPricingRates } from './pricing.routes.js';
import { calculateItemizedPrice } from '../utils/pricingCalculator.js';

const router = express.Router();

/**
 * Helper to compute end time string from startTime (HH:MM) and duration in hours
 */
function computeEndTime(startTimeStr, durationHours) {
  const [hours, minutes] = startTimeStr.split(':').map(Number);
  const totalMinutes = (hours * 60) + minutes + Math.round(durationHours * 60);
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

/**
 * Checks if two time intervals on the same day overlap
 * Handles sessions that cross midnight and multi-hour slots accurately
 */
function isTimeOverlapping(startA, endA, startB, endB, durationA = null, durationB = null) {
  const toMins = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const aStart = toMins(startA);
  let aEnd = durationA !== null ? aStart + Math.round(Number(durationA) * 60) : toMins(endA);
  if (aEnd <= aStart) aEnd += 1440;

  const bStart = toMins(startB);
  let bEnd = durationB !== null ? bStart + Math.round(Number(durationB) * 60) : toMins(endB);
  if (bEnd <= bStart) bEnd += 1440;

  return (aStart < bEnd) && (aEnd > bStart);
}

/**
 * GET /api/bookings/availability
 * Query params: service, date, startTime, durationHours, resourceId
 * Checks if the given station / room is available for the given window
 */
router.get('/availability', async (req, res) => {
  try {
    const { date, startTime, durationHours, resourceId } = req.query;

    if (!date || !startTime || !durationHours || !resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required query parameters: date, startTime, durationHours, resourceId'
      });
    }

    const duration = Number(durationHours);
    const endTime = computeEndTime(startTime, duration);

    // Fetch existing bookings for this resource on this date
    const snapshot = await db.collection('bookings')
      .where('date', '==', date)
      .where('resourceId', '==', resourceId)
      .get();

    const conflicts = [];
    snapshot.docs.forEach(doc => {
      const b = doc.data();
      // Skip cancelled or rejected bookings
      if (b.status === 'cancelled' || b.status === 'rejected') return;

      if (isTimeOverlapping(startTime, endTime, b.startTime, b.endTime, duration, b.durationHours)) {
        conflicts.push({
          bookingId: doc.id,
          startTime: b.startTime,
          endTime: b.endTime,
          service: b.service
        });
      }
    });

    const isAvailable = conflicts.length === 0;

    res.json({
      success: true,
      isAvailable,
      requested: { date, startTime, endTime, durationHours: duration, resourceId },
      conflicts: isAvailable ? [] : conflicts
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/bookings
 * Create a new booking with dynamic pricing and atomic collision check
 */
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const {
      service,
      date,
      startTime,
      durationHours,
      resourceId,
      resourceName,
      details,
      notes,
      contactPhone,
      contactName
    } = req.body;

    // Validate fundamental fields
    if (!service || !date || !startTime || !durationHours) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete booking details: service, date, startTime, and durationHours are required.'
      });
    }

    const duration = Number(durationHours);
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid duration specified.' });
    }

    const endTime = computeEndTime(startTime, duration);

    // Default resource assignment if not explicitly chosen
    let assignedResourceId = resourceId;
    let assignedResourceName = resourceName;

    if (!assignedResourceId) {
      if (service === 'ps5_gaming') {
        assignedResourceId = 'station-1';
        assignedResourceName = 'Station 01 (Cyber Blue OLED 65")';
      } else if (service === 'movie_theatre') {
        assignedResourceId = 'theatre-1';
        assignedResourceName = 'Bandhilki VIP Dolby Cinema Suite';
      } else if (service === 'home_rental') {
        assignedResourceId = 'rental-console-1';
        assignedResourceName = 'PS5 Disc Edition Console Bundle A';
      } else if (service === 'birthday_party') {
        assignedResourceId = 'lounge-party-area';
        assignedResourceName = 'Bandhilki Neon VIP Arena';
      }
    }

    // Server-side overlap check
    const existingSnap = await db.collection('bookings')
      .where('date', '==', date)
      .where('resourceId', '==', assignedResourceId)
      .get();

    for (const doc of existingSnap.docs) {
      const b = doc.data();
      if (b.status === 'cancelled' || b.status === 'rejected') continue;

      if (isTimeOverlapping(startTime, endTime, b.startTime, b.endTime, duration, b.durationHours)) {
        return res.status(409).json({
          success: false,
          message: `Slot Conflict: ${assignedResourceName || 'This station'} is already booked on ${date} between ${b.startTime} and ${b.endTime}. Please choose another time or station.`
        });
      }
    }

    // Dynamic price calculation strictly based on active server pricing rules
    const pricingRates = await getPricingRates();
    const itemizedPrice = calculateItemizedPrice(service, {
      durationHours: duration,
      ...(details || {})
    }, pricingRates);

    // Map service to title
    const serviceTitles = {
      ps5_gaming: 'PS5 Lounge Gaming',
      movie_theatre: 'VIP Cinema Theatre Room',
      home_rental: 'PS5 Console Home Rental',
      birthday_party: 'Neon Birthday & Gaming Bash'
    };

    const bookingRefId = `BND-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking = {
      id: bookingRefId,
      userId: req.user.uid,
      userEmail: req.user.email,
      userName: contactName || req.user.displayName || req.user.name || 'Gamer',
      userPhone: contactPhone || req.user.phone || '',
      service,
      serviceTitle: serviceTitles[service] || 'PS5 Gaming Experience',
      date,
      startTime,
      endTime,
      durationHours: duration,
      resourceId: assignedResourceId,
      resourceName: assignedResourceName || 'PS5 Dedicated Station',
      details: details || {},
      itemizedPrice,
      totalPrice: itemizedPrice.total,
      status: 'confirmed', // Confirmed booking
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    await db.collection('bookings').doc(bookingRefId).set(newBooking);

    // Award loyalty reward points (10% of subtotal)
    try {
      const bonusPoints = Math.round(itemizedPrice.subtotal * 0.1);
      const userRef = db.collection('users').doc(req.user.uid);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const curPoints = userDoc.data().loyaltyPoints || 0;
        await userRef.update({ loyaltyPoints: curPoints + bonusPoints });
      }
    } catch (e) {
      console.warn('Could not increment loyalty points:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: newBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/bookings/my-bookings
 * Get all bookings for the authenticated user, sorted by date
 */
router.get('/my-bookings', verifyFirebaseToken, async (req, res) => {
  try {
    const snapshot = await db.collection('bookings')
      .where('userId', '==', req.user.uid)
      .get();

    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort descending by creation date or booking date
    bookings.sort((a, b) => new Date(b.date + ' ' + (b.startTime || '00:00')) - new Date(a.date + ' ' + (a.startTime || '00:00')));

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/bookings/:id/cancel
 * Cancel a user's upcoming booking
 */
router.put('/:id/cancel', verifyFirebaseToken, async (req, res) => {
  try {
    const bookingRef = db.collection('bookings').doc(req.params.id);
    const snap = await bookingRef.get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = snap.data();

    // Verify ownership or admin
    if (booking.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Past completed bookings cannot be cancelled' });
    }

    await bookingRef.update({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelledBy: req.user.email
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Any advance payments or deposits will be refunded.',
      bookingId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
