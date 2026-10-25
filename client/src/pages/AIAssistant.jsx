import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Gamepad2, 
  Send, 
  Users, 
  Star, 
  Flame, 
  DollarSign, 
  Smile, 
  ChevronRight, 
  RefreshCw,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard' | 'chat'
  
  // Wizard state
  const [genre, setGenre] = useState('Action');
  const [playerCount, setPlayerCount] = useState('Multiplayer (2 Players)');
  const [mood, setMood] = useState('Adrenaline Rush');
  const [budget, setBudget] = useState('Under ₹300');
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  
  // Results
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  const handleWizardSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.getAIRecommendation({
        genre,
        playerCount,
        mood,
        budget,
        customQuery: activeTab === 'chat' ? chatInput : ''
      });
      if (res.success) {
        setResults(res);
      }
    } catch (err) {
      console.error('AI assistant error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    handleWizardSubmit();
  };

  const genreOptions = ['Action', 'Adventure', 'Sports', 'Racing', 'Fighting', 'Any'];
  const playerOptions = ['Solo (1 Player)', 'Multiplayer (2 Players)', 'Party (3-4 Players)'];
  const moodOptions = [
    'Adrenaline Rush', 
    'Chilled & Story Rich', 
    'Competitive Rivalry', 
    'Family Fun'
  ];
  const budgetOptions = ['Under ₹200 (1 Hour Solo)', 'Under ₹450 (2 Hours Multi)', 'Unlimited VIP Time'];

  return (
    <div style={{ padding: '40px 0 80px', minHeight: '85vh' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }} className="badge-neon badge-pink">
            <Sparkles size={16} />
            Powered by Next-Gen AI Concierge
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', textTransform: 'uppercase', marginBottom: '14px' }}>
            Bandhilki AI Game Assistant
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem' }}>
            Not sure what to play? Tell our intelligent concierge your mood, player count, and style, and we'll scan our entire live PS5 vault to find your ideal match.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
          <button
            onClick={() => setActiveTab('wizard')}
            style={{
              padding: '10px 24px',
              borderRadius: '25px',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: activeTab === 'wizard' ? '1px solid var(--neon-cyan)' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'wizard' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(11, 18, 42, 0.6)',
              color: activeTab === 'wizard' ? 'var(--neon-cyan)' : 'var(--text-muted)',
              boxShadow: activeTab === 'wizard' ? '0 0 15px rgba(0, 240, 255, 0.35)' : 'none'
            }}
          >
            <Cpu size={18} />
            Guided Preference Matcher
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '10px 24px',
              borderRadius: '25px',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: activeTab === 'chat' ? '1px solid #ff007f' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'chat' ? 'rgba(255, 0, 127, 0.2)' : 'rgba(11, 18, 42, 0.6)',
              color: activeTab === 'chat' ? '#ff007f' : 'var(--text-muted)',
              boxShadow: activeTab === 'chat' ? '0 0 15px rgba(255, 0, 127, 0.35)' : 'none'
            }}
          >
            <Sparkles size={18} />
            Natural Chat Assistant
          </button>
        </div>

        {/* Interactive Assistant Panel */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {activeTab === 'wizard' ? (
            <div className="glass-panel" style={{ padding: '36px', marginBottom: '40px' }}>
              <form onSubmit={handleWizardSubmit}>
                
                {/* 1. Preferred Genre */}
                <div style={{ marginBottom: '28px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Gamepad2 size={18} color="var(--neon-cyan)" />
                    1. Preferred Genre
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {genreOptions.map(g => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setGenre(g)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: genre === g ? '1px solid var(--neon-cyan)' : '1px solid rgba(255,255,255,0.12)',
                          background: genre === g ? 'rgba(0, 240, 255, 0.2)' : 'rgba(11, 18, 42, 0.7)',
                          color: genre === g ? '#fff' : 'var(--text-muted)',
                          boxShadow: genre === g ? '0 0 12px rgba(0, 240, 255, 0.3)' : 'none'
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Player Count */}
                <div style={{ marginBottom: '28px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="#00ff88" />
                    2. Player Count
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {playerOptions.map(p => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPlayerCount(p)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: playerCount === p ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.12)',
                          background: playerCount === p ? 'rgba(0, 255, 136, 0.2)' : 'rgba(11, 18, 42, 0.7)',
                          color: playerCount === p ? '#fff' : 'var(--text-muted)',
                          boxShadow: playerCount === p ? '0 0 12px rgba(0, 255, 136, 0.3)' : 'none'
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Desired Mood */}
                <div style={{ marginBottom: '28px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Smile size={18} color="#ff007f" />
                    3. What mood are you in?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {moodOptions.map(m => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setMood(m)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: mood === m ? '1px solid #ff007f' : '1px solid rgba(255,255,255,0.12)',
                          background: mood === m ? 'rgba(255, 0, 127, 0.2)' : 'rgba(11, 18, 42, 0.7)',
                          color: mood === m ? '#fff' : 'var(--text-muted)',
                          boxShadow: mood === m ? '0 0 12px rgba(255, 0, 127, 0.3)' : 'none'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Budget Preference */}
                <div style={{ marginBottom: '32px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={18} color="var(--gold-accent)" />
                    4. Budget / Session Duration Preference
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {budgetOptions.map(b => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setBudget(b)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: budget === b ? '1px solid var(--gold-accent)' : '1px solid rgba(255,255,255,0.12)',
                          background: budget === b ? 'rgba(255, 190, 11, 0.2)' : 'rgba(11, 18, 42, 0.7)',
                          color: budget === b ? '#fff' : 'var(--text-muted)',
                          boxShadow: budget === b ? '0 0 12px rgba(255, 190, 11, 0.3)' : 'none'
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary" 
                  style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={20} className="animate-pulse-neon" />
                      Analyzing PS5 Catalogue...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Instant Recommendation
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '36px', marginBottom: '40px' }}>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '14px' }}>
                  Ask naturally! For example: <em>"I want a two-player fighting game where we can do quick high-adrenaline matches"</em> or <em>"Suggest an immersive solo RPG with beautiful visuals"</em>.
                </p>
                <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Describe what kind of game or feeling you want..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '1rem', padding: '14px 18px' }}
                  />
                  <button 
                    type="submit" 
                    disabled={loading || !chatInput.trim()} 
                    className="btn-primary"
                    style={{ padding: '14px 28px' }}
                  >
                    {loading ? <RefreshCw size={18} /> : <Send size={18} />}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* AI Recommendation Output */}
          {results && (
            <div style={{ marginTop: '20px' }}>
              
              {/* Summary Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(14, 22, 53, 0.85) 0%, rgba(27, 15, 56, 0.85) 100%)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '28px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <Sparkles size={20} color="var(--neon-cyan)" />
                  <span style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '0.9rem', letterSpacing: '1px' }}>
                    {results.mode === 'gemini_ai' ? 'GEMINI AI INTELLIGENCE' : 'BANDHILKI SMART MATCHER'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
                  {results.greeting || 'Top PS5 Recommendations For You:'}
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6 }}>
                  {results.summary}
                </p>
              </div>

              {/* Recommended Game Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {results.recommendations?.map((rec, index) => (
                  <div 
                    key={rec.id || index}
                    className="glass-panel"
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      overflow: 'hidden',
                      padding: '24px',
                      gap: '24px',
                      alignItems: 'center',
                      border: index === 0 ? '1px solid var(--neon-cyan)' : '1px solid rgba(255, 255, 255, 0.12)',
                      boxShadow: index === 0 ? '0 0 25px rgba(0, 240, 255, 0.2)' : 'none'
                    }}
                  >
                    {/* Poster */}
                    <img 
                      src={rec.imageUrl} 
                      alt={rec.title}
                      style={{
                        width: '140px',
                        height: '190px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
                      }}
                    />

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span className="badge-neon badge-cyan">
                          {rec.genre}
                        </span>
                        {index === 0 && (
                          <span className="badge-neon badge-pink">
                            ★ Top Match
                          </span>
                        )}
                        <span style={{ fontSize: '0.85rem', color: 'var(--neon-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={14} />
                          {rec.playerCount}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--gold-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={14} fill="var(--gold-accent)" />
                          {rec.rating}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '8px' }}>
                        {rec.title}
                      </h3>

                      {/* AI Match Explanation */}
                      <div style={{
                        background: 'rgba(0, 240, 255, 0.08)',
                        borderLeft: '3px solid var(--neon-cyan)',
                        padding: '10px 14px',
                        borderRadius: '4px 8px 8px 4px',
                        marginBottom: '14px',
                        fontSize: '0.92rem',
                        color: '#e2e8f0',
                        lineHeight: 1.5
                      }}>
                        <strong>Why it fits:</strong> {rec.explanation}
                      </div>

                      {/* Required "Book This Game" Button */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => navigate(`/booking?service=ps5_gaming&gameId=${rec.id}`)}
                          className="btn-primary"
                          style={{ padding: '12px 26px', fontSize: '0.9rem' }}
                        >
                          <Gamepad2 size={18} />
                          Book This Game Now
                        </button>
                        <button 
                          onClick={() => navigate(`/booking?service=home_rental&gameId=${rec.id}`)}
                          className="btn-rental-highlight"
                          style={{ padding: '12px 22px', fontSize: '0.88rem' }}
                        >
                          Rent PS5 With This Game
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
