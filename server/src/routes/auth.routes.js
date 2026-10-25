import express from 'express';
import { db } from '../config/firebase.js';
import { verifyFirebaseToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/sync
 * Called after Firebase client sign-in to ensure user document exists in Firestore with role
 */
router.post('/sync', verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;
    const { phone, preferredName } = req.body;

    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();

    let userData = snap.exists ? snap.data() : null;

    if (!userData) {
      const isInitialAdmin = email?.toLowerCase() === 'admin@gmail.com' ||
                             email === process.env.INITIAL_ADMIN_EMAIL ||
                             email?.toLowerCase().includes('admin@bandhilki.com');

      userData = {
        id: uid,
        email: email || '',
        displayName: preferredName || name || (isInitialAdmin ? 'Bandhilki Administrator' : (email?.split('@')[0] || 'PS5 Gamer')),
        phone: phone || '',
        role: isInitialAdmin ? 'admin' : 'user',
        loyaltyPoints: 100, // Welcome bonus points!
        createdAt: new Date().toISOString()
      };
      await userRef.set(userData);
    } else {
      // Ensure admin email always retains admin role
      const isInitialAdmin = email?.toLowerCase() === 'admin@gmail.com' ||
                             email === process.env.INITIAL_ADMIN_EMAIL;
      const updates = {};
      if (isInitialAdmin && userData.role !== 'admin') {
        updates.role = 'admin';
      }
      if (phone && phone !== userData.phone) updates.phone = phone;
      if (preferredName && preferredName !== userData.displayName) updates.displayName = preferredName;
      if (Object.keys(updates).length > 0) {
        await userRef.update(updates);
        userData = { ...userData, ...updates };
      }
    }

    res.json({ success: true, user: userData });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/auth/profile
 * Get current authenticated user profile and permissions
 */
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/auth/set-role
 * Admin-only: Promote or modify user role
 */
router.post('/set-role', verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const { targetUserId, role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const userRef = db.collection('users').doc(targetUserId);
    const snap = await userRef.get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'User not found in Firestore' });
    }

    await userRef.update({ role });
    res.json({ success: true, message: `User role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
