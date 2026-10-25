import express from 'express';
import { db, initialPricing } from '../config/firebase.js';
import { verifyFirebaseToken, requireAdmin } from '../middleware/auth.js';
import { calculateItemizedPrice } from '../utils/pricingCalculator.js';

const router = express.Router();

// Helper to fetch current pricing configuration from Firestore
export async function getPricingRates() {
  try {
    const doc = await db.collection('pricing').doc('current').get();
    if (doc.exists) {
      return doc.data();
    }
  } catch (err) {
    console.warn('Could not read pricing doc, falling back to defaults:', err.message);
  }
  return initialPricing;
}

/**
 * GET /api/pricing
 * Return all current rates, fees, packages, and tax configurations
 */
router.get('/', async (req, res) => {
  try {
    const rates = await getPricingRates();
    res.json({ success: true, rates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/pricing/calculate
 * Dynamically calculate itemized price for given service and options
 * Returns line items, subtotal, taxes, security deposit, and grand total
 */
router.post('/calculate', async (req, res) => {
  try {
    const { service, options } = req.body;
    if (!service) {
      return res.status(400).json({ success: false, message: 'Service type is required' });
    }

    const rates = await getPricingRates();
    const itemized = calculateItemizedPrice(service, options || {}, rates);

    res.json({ success: true, itemized });
  } catch (error) {
    console.error('Pricing calculation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/pricing
 * Admin-only: Update pricing rates and packages
 */
router.put('/', verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const updatedRates = req.body;
    if (!updatedRates || typeof updatedRates !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid pricing structure' });
    }

    await db.collection('pricing').doc('current').set({
      ...updatedRates,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.json({ success: true, message: 'Pricing rates updated successfully', rates: updatedRates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
