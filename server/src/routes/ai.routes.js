import express from 'express';
import { db } from '../config/firebase.js';

const router = express.Router();

/**
 * Intelligent Rule-based scoring engine when Gemini API key is not configured
 */
function scoreGameMatch(game, { genre, playerCount, mood, budget, customQuery }) {
  let score = 0;
  const reasons = [];

  // Freeform query keyword scoring (for chat mode or direct requests)
  if (customQuery && typeof customQuery === 'string') {
    const q = customQuery.toLowerCase();
    const title = (game.title || '').toLowerCase();
    const desc = (game.description || '').toLowerCase();
    const gName = (game.genre || '').toLowerCase();
    const tags = Array.isArray(game.tags) ? game.tags.map(t => t.toLowerCase()) : [];

    if (title.includes(q) || q.includes(title)) {
      score += 60;
      reasons.push(`Direct match for your query "${customQuery}".`);
    } else {
      const tokens = q.split(/\s+/).filter(t => t.length > 2);
      let queryHits = 0;
      tokens.forEach(tok => {
        if (title.includes(tok)) { score += 25; queryHits++; }
        else if (gName.includes(tok)) { score += 20; queryHits++; }
        else if (tags.some(t => t.includes(tok))) { score += 15; queryHits++; }
        else if (desc.includes(tok)) { score += 10; queryHits++; }
      });
      if (queryHits > 0) {
        reasons.push(`Matches your search for "${customQuery}".`);
      }
    }
  }

  // Genre match
  if (genre && genre !== 'any') {
    const gLower = genre.toLowerCase();
    if (game.genre?.toLowerCase() === gLower) {
      score += 40;
      reasons.push(`Perfect match for your favorite ${game.genre} genre.`);
    } else if (Array.isArray(game.tags) && game.tags.some(t => t.toLowerCase() === gLower)) {
      score += 30;
      reasons.push(`Contains core elements of ${genre}.`);
    }
  } else {
    score += 15;
  }

  // Player count match
  if (playerCount) {
    const isSolo = playerCount.toLowerCase().includes('solo') || playerCount.includes('1');
    const isMulti = playerCount.toLowerCase().includes('multi') || playerCount.includes('2') || playerCount.includes('4');

    if (isSolo && game.maxPlayers === 1) {
      score += 25;
      reasons.push(`Designed specifically for deep single-player immersion.`);
    } else if (isMulti && game.maxPlayers > 1) {
      score += 30;
      reasons.push(`Supports split-screen and couch co-op for up to ${game.maxPlayers} players.`);
    } else if (game.maxPlayers >= 1) {
      score += 10;
    }
  }

  // Mood match
  if (mood) {
    const mLower = mood.toLowerCase();
    if (mLower.includes('adrenaline') || mLower.includes('action')) {
      if (['Action', 'Fighting', 'Racing'].includes(game.genre)) {
        score += 25;
        reasons.push(`High octane gameplay engineered to give you an adrenaline surge.`);
      }
    } else if (mLower.includes('competitive') || mLower.includes('rivalry')) {
      if (['Fighting', 'Sports', 'Racing'].includes(game.genre) || (game.tags && game.tags.includes('competitive'))) {
        score += 30;
        reasons.push(`Ultimate competitive showdown with lightning reflex mechanics.`);
      }
    } else if (mLower.includes('story') || mLower.includes('chill') || mLower.includes('adventure')) {
      if (['Adventure', 'Action'].includes(game.genre) && game.rating >= 4.8) {
        score += 25;
        reasons.push(`Captivating storyline, cinematic visuals, and world-class world building.`);
      }
    } else if (mLower.includes('fun') || mLower.includes('party')) {
      if (game.maxPlayers >= 2 || game.tags?.includes('fun') || game.tags?.includes('family')) {
        score += 25;
        reasons.push(`Pure, accessible gaming fun with instant smiles for everyone.`);
      }
    }
  }

  // High rating boost
  if (game.rating >= 4.9) {
    score += 10;
  }

  return {
    score,
    explanation: reasons.length > 0 
      ? reasons.join(' ') 
      : `${game.title} is an acclaimed PlayStation 5 hit with ${game.rating}★ rating on our lounge displays.`
  };
}

/**
 * POST /api/ai/recommend
 * Recommends games from the actual catalogue based on user input
 */
router.post('/recommend', async (req, res) => {
  try {
    const { genre, budget, playerCount, mood, customQuery } = req.body;

    // Fetch live catalogue
    const snapshot = await db.collection('games').get();
    const catalogue = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (catalogue.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No games currently found in catalogue. Please seed or add games.',
        recommendations: []
      });
    }

    // Try Google Gemini API if GEMINI_API_KEY is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `You are "Bandhilki AI Game Concierge", an expert gaming assistant for Bandhilki PS5 Gaming Zone lounge.
Here is the official PS5 catalogue available right now at Bandhilki:
${JSON.stringify(catalogue.map(g => ({ id: g.id, title: g.title, genre: g.genre, maxPlayers: g.maxPlayers, rating: g.rating, tags: g.tags, description: g.description })))}

User preferences:
- Preferred Genre: ${genre || 'Any'}
- Budget: ${budget || 'Flexible'}
- Player Count: ${playerCount || 'Flexible'}
- Desired Mood: ${mood || 'Excited'}
- Freeform query: ${customQuery || 'None'}

Task:
Select the top 2 or 3 best matching games ONLY from the provided catalogue.
Explain in an enthusiastic, cyberpunk gamer tone why each game fits their mood and player count.
Respond in JSON format matching this schema:
{
  "greeting": "Friendly cyberpunk welcome",
  "summary": "Brief summary of recommendations",
  "recommendations": [
    {
      "gameId": "id_from_catalogue",
      "reason": "Specific compelling reason why this matches their preferences",
      "tips": "PS5 feature tip like DualSense haptics or 3D audio"
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const parsed = JSON.parse(response.text);

        const enrichedRecommendations = (parsed.recommendations || []).map(rec => {
          const matchedGame = catalogue.find(g => g.id === rec.gameId) || catalogue[0];
          return {
            ...matchedGame,
            explanation: rec.reason,
            tip: rec.tips
          };
        });

        return res.json({
          success: true,
          mode: 'gemini_ai',
          greeting: parsed.greeting,
          summary: parsed.summary,
          recommendations: enrichedRecommendations
        });
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to smart rule engine:', geminiError.message);
      }
    }

    // Smart Rule-based Engine fallback
    const scoredGames = catalogue.map(game => {
      const { score, explanation } = scoreGameMatch(game, { genre, playerCount, mood, budget, customQuery });
      return {
        ...game,
        matchScore: score,
        explanation
      };
    });

    // Sort descending by match score
    scoredGames.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = scoredGames.slice(0, 3);

    const moodPhrases = {
      'Adrenaline Rush': 'high-octane thrills and pulse-pounding reflex action',
      'Chilled & Story Rich': 'deep cinematic storytelling and gorgeous 4K visual art',
      'Competitive Rivalry': 'head-to-head dominance and bragging rights',
      'Family Fun': 'cooperative joy and laughter across all ages'
    };

    const summaryText = customQuery
      ? `Based on your request "${customQuery}", here are the top matching titles ready to launch at Bandhilki PS5 Lounge:`
      : `Based on your desire for ${moodPhrases[mood] || 'an unforgettable PS5 session'} with ${playerCount || 'friends'}, here are the top picks loaded on our Bandhilki PS5 stations:`;

    res.json({
      success: true,
      mode: 'smart_rule_engine',
      greeting: "🎮 Welcome to Bandhilki AI Game Concierge! Let's get you locked onto the perfect game.",
      summary: summaryText,
      recommendations: topMatches
    });
  } catch (error) {
    console.error('AI assistant route error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
