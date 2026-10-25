import express from 'express';
import { db } from '../config/firebase.js';
import { verifyFirebaseToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/games
 * List games with filters: genre, search, maxPlayers, available
 */
router.get('/', async (req, res) => {
  try {
    const { genre, search, playerCount, available } = req.query;

    const snapshot = await db.collection('games').get();
    let games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Apply filters
    if (genre && genre.toLowerCase() !== 'all') {
      const gLower = genre.toLowerCase();
      games = games.filter(g => 
        g.genre?.toLowerCase() === gLower ||
        (Array.isArray(g.tags) && g.tags.some(t => t.toLowerCase() === gLower))
      );
    }

    if (playerCount) {
      if (playerCount === 'solo') {
        games = games.filter(g => g.maxPlayers === 1 || g.playerCount?.toLowerCase().includes('1 player'));
      } else if (playerCount === 'multiplayer') {
        games = games.filter(g => g.maxPlayers > 1 || g.playerCount?.toLowerCase().includes('multi') || g.playerCount?.toLowerCase().includes('1-4') || g.playerCount?.toLowerCase().includes('1-2'));
      } else if (!isNaN(Number(playerCount))) {
        const count = Number(playerCount);
        games = games.filter(g => g.maxPlayers >= count);
      }
    }

    if (available === 'true') {
      games = games.filter(g => g.available !== false);
    }

    if (search) {
      const q = search.toLowerCase();
      games = games.filter(g => 
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        (Array.isArray(g.tags) && g.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    res.json({ success: true, count: games.length, games });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/games/:id
 * Retrieve a single game by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const docRef = db.collection('games').doc(req.params.id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    res.json({ success: true, game: { id: snap.id, ...snap.data() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/games
 * Admin-only: Add a new game to the PS5 catalogue
 */
router.post('/', verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      genre,
      tags,
      playerCount,
      maxPlayers,
      rating,
      description,
      features,
      imageUrl,
      available,
      releaseYear,
      highlight
    } = req.body;

    if (!title || !genre) {
      return res.status(400).json({ success: false, message: 'Title and genre are required' });
    }

    const newGame = {
      title: title.trim(),
      genre: genre.trim(),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(s => s.trim().toLowerCase()) : []),
      playerCount: playerCount || '1 Player',
      maxPlayers: Number(maxPlayers) || 1,
      rating: Number(rating) || 4.8,
      description: description || '',
      features: Array.isArray(features) ? features : (features ? features.split(',').map(s => s.trim()) : []),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
      available: available !== false,
      releaseYear: Number(releaseYear) || new Date().getFullYear(),
      highlight: highlight || '',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('games').add(newGame);
    res.status(201).json({ success: true, message: 'Game added successfully', game: { id: docRef.id, ...newGame } });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/games/:id
 * Admin-only: Update game in catalogue
 */
router.put('/:id', verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const docRef = db.collection('games').doc(req.params.id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    if (updates.maxPlayers) updates.maxPlayers = Number(updates.maxPlayers);
    if (updates.rating) updates.rating = Number(updates.rating);
    if (updates.releaseYear) updates.releaseYear = Number(updates.releaseYear);
    if (typeof updates.tags === 'string') updates.tags = updates.tags.split(',').map(s => s.trim().toLowerCase());
    if (typeof updates.features === 'string') updates.features = updates.features.split(',').map(s => s.trim());

    delete updates.id;

    await docRef.update(updates);
    res.json({ success: true, message: 'Game updated successfully', game: { id: req.params.id, ...snap.data(), ...updates } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/games/:id
 * Admin-only: Remove game from catalogue
 */
router.delete('/:id', verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const docRef = db.collection('games').doc(req.params.id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    await docRef.delete();
    res.json({ success: true, message: 'Game removed from catalogue' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
