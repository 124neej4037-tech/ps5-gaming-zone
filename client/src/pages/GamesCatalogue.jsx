import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Gamepad2, 
  Users, 
  Star, 
  Check, 
  X, 
  Info, 
  Sparkles,
  ChevronRight,
  Flame
} from 'lucide-react';
import { api } from '../services/api';

export default function GamesCatalogue() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedPlayerMode, setSelectedPlayerMode] = useState('all'); // all, solo, multiplayer
  const [selectedGameModal, setSelectedGameModal] = useState(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, [selectedGenre, selectedPlayerMode, onlyAvailable]);

  const fetchGames = async (overrideParams = {}) => {
    setLoading(true);
    try {
      const activeGenre = overrideParams.genre !== undefined ? overrideParams.genre : selectedGenre;
      const activeMode = overrideParams.playerMode !== undefined ? overrideParams.playerMode : selectedPlayerMode;
      const activeAvailable = overrideParams.onlyAvailable !== undefined ? overrideParams.onlyAvailable : onlyAvailable;
      const activeSearch = overrideParams.search !== undefined ? overrideParams.search : searchQuery;

      const params = {};
      if (activeGenre !== 'all') params.genre = activeGenre;
      if (activeMode !== 'all') params.playerCount = activeMode;
      if (activeAvailable) params.available = 'true';
      if (activeSearch && activeSearch.trim()) params.search = activeSearch.trim();

      const res = await api.getGames(params);
      if (res.success && res.games) {
        setGames(res.games);
      }
    } catch (err) {
      console.error('Error fetching games catalogue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGames();
  };

  // Genre Filter Tabs as requested: solo, multiplayer, sports, racing, action, adventure
  const genres = [
    { id: 'all', label: 'All Games' },
    { id: 'Action', label: 'Action' },
    { id: 'Adventure', label: 'Adventure' },
    { id: 'Sports', label: 'Sports' },
    { id: 'Racing', label: 'Racing' },
    { id: 'Fighting', label: 'Fighting' }
  ];

  return (
    <div style={{ padding: '40px 0 80px', minHeight: '80vh' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }} className="badge-neon badge-cyan">
            <Gamepad2 size={16} />
            Official PS5 Lounge Library
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', textTransform: 'uppercase', marginBottom: '14px' }}>
            Next-Gen Games Catalogue
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem' }}>
            Every title is permanently pre-installed and updated on our PS5 ultra-fast SSD stations with DualSense haptic feedback.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '36px' }}>
          {/* Search Row */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="var(--neon-cyan)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search games by title, genre, superhero, or multiplayer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '44px', fontSize: '1rem' }}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => { setSearchQuery(''); fetchGames({ search: '' }); }}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            {/* Genre Filter Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {genres.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenre(g.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: selectedGenre === g.id ? '1px solid var(--neon-cyan)' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: selectedGenre === g.id ? 'rgba(0, 240, 255, 0.18)' : 'rgba(11, 18, 42, 0.6)',
                    color: selectedGenre === g.id ? 'var(--neon-cyan)' : 'var(--text-muted)',
                    boxShadow: selectedGenre === g.id ? '0 0 12px rgba(0, 240, 255, 0.3)' : 'none'
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Solo / Multiplayer Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginRight: '4px' }}>
                Mode:
              </span>
              <button
                onClick={() => setSelectedPlayerMode(selectedPlayerMode === 'solo' ? 'all' : 'solo')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedPlayerMode === 'solo' ? '1px solid #ff007f' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: selectedPlayerMode === 'solo' ? 'rgba(255, 0, 127, 0.2)' : 'rgba(11, 18, 42, 0.6)',
                  color: selectedPlayerMode === 'solo' ? '#ff007f' : 'var(--text-muted)'
                }}
              >
                Solo 1P
              </button>
              <button
                onClick={() => setSelectedPlayerMode(selectedPlayerMode === 'multiplayer' ? 'all' : 'multiplayer')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedPlayerMode === 'multiplayer' ? '1px solid #00ff88' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: selectedPlayerMode === 'multiplayer' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(11, 18, 42, 0.6)',
                  color: selectedPlayerMode === 'multiplayer' ? '#00ff88' : 'var(--text-muted)'
                }}
              >
                Multiplayer 2-4P
              </button>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="animate-pulse-neon" style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '2px solid var(--neon-cyan)',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Gamepad2 size={30} color="var(--neon-cyan)" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
              Accessing Bandhilki PS5 Storage Vault...
            </p>
          </div>
        ) : games.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '16px' }}>
              No games found matching your current filter.
            </p>
            <button 
              onClick={() => { 
                setSelectedGenre('all'); 
                setSelectedPlayerMode('all'); 
                setSearchQuery(''); 
                setOnlyAvailable(false);
                fetchGames({ genre: 'all', playerMode: 'all', search: '', onlyAvailable: false }); 
              }}
              className="btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '26px'
          }}>
            {games.map(game => (
              <div 
                key={game.id}
                className="glass-card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'rgba(14, 22, 53, 0.75)'
                }}
              >
                {/* Image Cover */}
                <div style={{ position: 'relative', height: '260px', overflow: 'hidden', background: '#090e24' }}>
                  <img 
                    src={game.imageUrl} 
                    alt={game.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.07)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />

                  {/* Badges on cover */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                    <span className="badge-neon badge-cyan">
                      {game.genre}
                    </span>
                    {game.available !== false ? (
                      <span className="badge-neon badge-green">
                        Available
                      </span>
                    ) : (
                      <span className="badge-neon badge-pink">
                        In Use
                      </span>
                    )}
                  </div>

                  {/* Rating badge */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(5, 8, 19, 0.88)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    color: 'var(--gold-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid rgba(255, 190, 11, 0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}>
                    <Star size={14} fill="var(--gold-accent)" color="var(--gold-accent)" />
                    {game.rating}
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--neon-green)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <Users size={15} />
                      {game.playerCount}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Year: {game.releaseYear || 2024}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: '#fff', lineHeight: 1.25 }}>
                    {game.title}
                  </h3>

                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flexGrow: 1
                  }}>
                    {game.description}
                  </p>

                  {/* Features tags */}
                  {game.features && game.features.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                      {game.features.slice(0, 3).map((feat, i) => (
                        <span key={i} style={{
                          fontSize: '0.74rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: '#cbd5e1'
                        }}>
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <button
                      onClick={() => setSelectedGameModal(game)}
                      className="btn-secondary"
                      style={{ padding: '10px 14px', fontSize: '0.82rem' }}
                      title="View Game Specs"
                    >
                      <Info size={16} />
                    </button>
                    <button
                      onClick={() => navigate(`/booking?service=ps5_gaming&gameId=${game.id}`)}
                      className="btn-primary"
                      style={{ flex: 1, padding: '10px', fontSize: '0.82rem' }}
                    >
                      Book Station
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Game Specs */}
        {selectedGameModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}>
            <div className="glass-panel" style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              padding: '30px'
            }}>
              <button 
                onClick={() => setSelectedGameModal(null)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <img 
                  src={selectedGameModal.imageUrl} 
                  alt={selectedGameModal.title}
                  style={{ width: '150px', height: '200px', objectFit: 'cover', borderRadius: '12px' }}
                />
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <span className="badge-neon badge-cyan" style={{ marginBottom: '8px' }}>
                    {selectedGameModal.genre}
                  </span>
                  <h2 style={{ fontSize: '1.7rem', color: '#fff', marginBottom: '8px' }}>
                    {selectedGameModal.title}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--gold-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={16} fill="var(--gold-accent)" />
                      {selectedGameModal.rating} / 5.0
                    </span>
                    <span style={{ color: 'var(--neon-green)' }}>
                      {selectedGameModal.playerCount}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                    {selectedGameModal.description}
                  </p>
                </div>
              </div>

              {selectedGameModal.features && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '10px', textTransform: 'uppercase' }}>
                    PS5 Hardware Highlights
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedGameModal.features.map((feat, i) => (
                      <span key={i} className="badge-neon badge-purple" style={{ textTransform: 'none' }}>
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '14px' }}>
                <button 
                  onClick={() => {
                    navigate(`/booking?service=ps5_gaming&gameId=${selectedGameModal.id}`);
                    setSelectedGameModal(null);
                  }}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  <Gamepad2 size={18} />
                  Book Station For This Game
                </button>
                <button 
                  onClick={() => setSelectedGameModal(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
