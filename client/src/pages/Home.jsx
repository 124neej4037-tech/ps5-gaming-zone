import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Gamepad2, 
  Film, 
  Home as HomeIcon, 
  Cake, 
  Sparkles, 
  Flame, 
  Star, 
  Users, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Headphones, 
  Zap, 
  Award,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export default function Home() {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [pricingRates, setPricingRates] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [gamesRes, pricingRes] = await Promise.all([
          api.getGames(),
          api.getPricing()
        ]);
        if (gamesRes.success && gamesRes.games) {
          setFeaturedGames(gamesRes.games.slice(0, 6));
        }
        if (pricingRes.success && pricingRes.rates) {
          setPricingRates(pricingRes.rates);
        }
      } catch (err) {
        console.warn('Home data load notice:', err.message);
      } finally {
        setLoadingGames(false);
      }
    }
    loadData();
  }, []);

  const services = [
    {
      id: 'ps5_gaming',
      title: 'PS5 Lounge Gaming',
      badge: 'Popular',
      badgeClass: 'badge-cyan',
      icon: Gamepad2,
      tagline: 'Solo & Multiplayer Couch Battles',
      description: 'Step into our RGB futuristic lounge stations equipped with 65" 4K OLED displays, low-latency HDMI 2.1, and DualSense haptic controllers.',
      startingRate: `₹${pricingRates?.ps5Gaming?.baseHourlyRateSolo || 150} / hour`,
      features: ['65" 4K 120Hz OLED Displays', 'DualSense Haptic & Pulse 3D', '50+ Blockbuster Games', '1 to 4 Players Couch Co-op'],
      gradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(138, 43, 226, 0.2) 100%)',
      borderColor: 'rgba(0, 240, 255, 0.4)',
      ctaText: 'Book PS5 Station'
    },
    {
      id: 'movie_theatre',
      title: 'VIP Cinema Theatre',
      badge: 'Immersive',
      badgeClass: 'badge-purple',
      icon: Film,
      tagline: 'Private 4K Dolby Atmos Screening',
      description: 'Host private movie screenings, watch live esports tournaments, or stream Netflix/OTT on our 150" crystal-clear laser screen with recliner seating.',
      startingRate: `₹${pricingRates?.movieTheatre?.baseHourlyRate || 750} / hour`,
      features: ['150" 4K Laser Projection', '7.1.4 Dolby Atmos Surround', 'Up to 12 Recliner Seats', 'Gourmet Popcorn & Soda Combos'],
      gradient: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(21, 10, 48, 0.3) 100%)',
      borderColor: 'rgba(138, 43, 226, 0.4)',
      ctaText: 'Reserve Cinema Suite'
    },
    {
      id: 'home_rental',
      title: 'PS5 Home Rentals',
      badge: '⭐ Special Offer',
      badgeClass: 'badge-pink',
      highlighted: true,
      icon: HomeIcon,
      tagline: 'Console Delivered to Your Doorstep',
      description: 'Take the PlayStation 5 home for the weekend! Delivered with pre-installed games, extra DualSense controllers, and seamless plug-and-play setup.',
      startingRate: `From ₹${pricingRates?.homeRental?.dailyRate || 1199} / day`,
      features: ['PS5 Disc/Digital Edition Console', '3 Free Blockbuster Games Included', 'Doorstep Delivery & Sanitized Gear', 'Weekend 3-Day Blast Discount'],
      gradient: 'linear-gradient(135deg, rgba(255, 0, 127, 0.22) 0%, rgba(138, 43, 226, 0.25) 100%)',
      borderColor: 'rgba(255, 0, 127, 0.65)',
      ctaText: 'Rent PS5 for Home'
    },
    {
      id: 'birthday_party',
      title: 'Birthday & Gaming Parties',
      badge: 'Events',
      badgeClass: 'badge-gold',
      icon: Cake,
      tagline: 'Unforgettable Esports Celebrations',
      description: 'Celebrate your birthday or special milestone with exclusive lounge access, competitive tournaments, custom gamer cakes, and VR setups.',
      startingRate: `Packages from ₹${pricingRates?.birthdayParty?.packages?.silver?.price || 3499}`,
      features: ['Multi-Station Tournament Setup', 'Gamer Cake & Refreshment Combos', 'Host & Tournament Leaderboards', 'VR Beatsaber Experience Pods'],
      gradient: 'linear-gradient(135deg, rgba(255, 190, 11, 0.15) 0%, rgba(138, 43, 226, 0.2) 100%)',
      borderColor: 'rgba(255, 190, 11, 0.4)',
      ctaText: 'Plan Your Party'
    }
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* ================= HERO SECTION ================= */}
      <section style={{
        position: 'relative',
        padding: '100px 0 80px',
        background: 'radial-gradient(circle at 50% 20%, rgba(138, 43, 226, 0.25) 0%, rgba(5, 8, 19, 0) 70%)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.1)'
      }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          
          {/* Top Live Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '30px',
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            marginBottom: '24px',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)'
          }}>
            <Flame size={18} color="var(--neon-cyan)" />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '1px',
              color: 'var(--neon-cyan)',
              textTransform: 'uppercase'
            }}>
              Next-Gen PlayStation 5 Lounge & Rentals
            </span>
          </div>

          {/* REQUIRED PROMINENT MAIN HEADING */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4.8rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-1px',
            marginBottom: '20px',
            textTransform: 'uppercase'
          }}>
            <span className="gradient-text-cyan-purple text-glow-cyan">
              Bandhilki PS5 Gaming Zone
            </span>
          </h1>

          {/* PROMOTIONAL TEXT DIRECTLY BELOW HEADING */}
          <div 
            className="animate-float"
            style={{
              maxWidth: '780px',
              margin: '0 auto 36px',
              padding: '0 16px'
            }}
          >
            <p style={{
              fontSize: 'clamp(0.92rem, 1.55vw, 1.15rem)',
              lineHeight: 1.65,
              color: '#cbd5e1',
              fontWeight: 400,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(138, 43, 226, 0.25)'
            }}>
              Start the New Year with the Ultimate PS5 Gaming Experience! High-fidelity graphics, premium RGB ambience, and lag-free gameplay.{' '}
              <span style={{
                color: '#ff007f',
                fontWeight: 700,
                textShadow: '0 0 14px rgba(255, 0, 127, 0.8), 0 0 28px rgba(255, 0, 127, 0.4)'
              }}>
                Now offering PS5 Home Rentals!
              </span>
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
            marginBottom: '50px'
          }}>
            <Link to="/booking" className="btn-primary" style={{ padding: '14px 34px', fontSize: '1rem' }}>
              <Gamepad2 size={20} />
              Book PS5 Station Now
            </Link>

            <Link to="/booking?service=home_rental" className="btn-rental-highlight" style={{ padding: '14px 30px', fontSize: '1rem' }}>
              <HomeIcon size={20} />
              PS5 Home Rentals (from ₹1,199)
            </Link>

            <Link to="/ai-assistant" className="btn-secondary" style={{ padding: '14px 26px', fontSize: '1rem' }}>
              <Sparkles size={20} color="#ff007f" />
              Ask AI Game Assistant
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div className="glass-panel" style={{ padding: '18px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: 'var(--neon-cyan)', fontWeight: 800 }}>
                6 STATIONS
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                4K 120Hz OLED Pods
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '18px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: '#ff007f', fontWeight: 800 }}>
                50+ GAMES
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Latest PS5 Blockbusters
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '18px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: '#00ff88', fontWeight: 800 }}>
                4K CINEMA
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Dolby Atmos Private Suite
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '18px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: 'var(--gold-accent)', fontWeight: 800 }}>
                4.95 ★
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                500+ Gamer Reviews
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4 CORE SERVICES SHOWCASE ================= */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge-neon badge-cyan" style={{ marginBottom: '12px' }}>
              Our 4 Premium Services
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', textTransform: 'uppercase', marginBottom: '12px' }}>
              Choose Your Gaming Experience
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
              From high-octane 4-player couch co-op in our futuristic lounge to private cinema screenings and doorstep PS5 rentals.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <div 
                  key={svc.id}
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '30px 24px',
                    position: 'relative',
                    background: svc.gradient,
                    border: `1px solid ${svc.borderColor}`,
                    boxShadow: svc.highlighted ? '0 10px 40px rgba(255, 0, 127, 0.25)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      background: svc.highlighted ? 'linear-gradient(135deg, #ff007f, #8a2be2)' : 'linear-gradient(135deg, #00f0ff, #0077fe)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: svc.highlighted ? '0 0 20px rgba(255, 0, 127, 0.5)' : '0 0 15px rgba(0, 240, 255, 0.4)'
                    }}>
                      <Icon size={28} color="#fff" />
                    </div>
                    <span className={`badge-neon ${svc.badgeClass}`}>
                      {svc.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.5rem', marginBottom: '6px', color: '#fff' }}>
                    {svc.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: svc.highlighted ? '#ff4da6' : 'var(--neon-cyan)', fontWeight: 600, marginBottom: '14px' }}>
                    {svc.tagline}
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px', flexGrow: 1 }}>
                    {svc.description}
                  </p>

                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(5, 8, 19, 0.6)',
                    marginBottom: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      Transparent Pricing
                    </div>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: svc.highlighted ? '#ff007f' : '#00f0ff' }}>
                      {svc.startingRate}
                    </div>
                  </div>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    {svc.features.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        <CheckCircle size={15} color={svc.highlighted ? '#ff007f' : 'var(--neon-cyan)'} />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => navigate(`/booking?service=${svc.id}`)}
                    className={svc.highlighted ? "btn-rental-highlight" : "btn-primary"}
                    style={{ width: '100%' }}
                  >
                    {svc.ctaText}
                    <ChevronRight size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FEATURED PS5 GAMES CAROUSEL / GRID ================= */}
      <section className="section-padding" style={{
        background: 'linear-gradient(180deg, rgba(7, 12, 29, 0.8) 0%, rgba(13, 21, 51, 0.6) 100%)',
        borderTop: '1px solid rgba(0, 240, 255, 0.1)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.1)'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '40px',
            gap: '16px'
          }}>
            <div>
              <span className="badge-neon badge-pink" style={{ marginBottom: '10px' }}>
                Loaded on Every Station
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', textTransform: 'uppercase' }}>
                Featured PS5 Blockbusters
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>
                Zero waiting: every station is updated with high-speed SSD game storage.
              </p>
            </div>

            <Link to="/games" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              View All 50+ Games
              <ArrowRight size={18} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {featuredGames.map(game => (
              <div 
                key={game.id}
                className="glass-card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: '16px',
                  position: 'relative'
                }}
              >
                {/* Game Cover Poster */}
                <div style={{
                  position: 'relative',
                  height: '240px',
                  overflow: 'hidden',
                  background: '#090e24'
                }}>
                  <img 
                    src={game.imageUrl} 
                    alt={game.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    gap: '6px'
                  }}>
                    <span className="badge-neon badge-cyan">
                      {game.genre}
                    </span>
                    {game.highlight && (
                      <span className="badge-neon badge-pink">
                        {game.highlight}
                      </span>
                    )}
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '12px',
                    background: 'rgba(5, 8, 19, 0.85)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    color: 'var(--gold-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid rgba(255, 190, 11, 0.4)'
                  }}>
                    <Star size={14} fill="var(--gold-accent)" color="var(--gold-accent)" />
                    {game.rating}
                  </div>
                </div>

                {/* Game Card Body */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--neon-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} />
                      {game.playerCount}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      PS5 Enhanced
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff', lineHeight: 1.3 }}>
                    {game.title}
                  </h3>

                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
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

                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <button 
                      onClick={() => navigate(`/booking?service=ps5_gaming&gameId=${game.id}`)}
                      className="btn-primary"
                      style={{ flex: 1, padding: '10px', fontSize: '0.82rem' }}
                    >
                      Book Game Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY BANDHILKI PS5 ZONE ================= */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge-neon badge-purple" style={{ marginBottom: '10px' }}>
              The Bandhilki Standard
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', textTransform: 'uppercase' }}>
              Engineered For Serious Gamers
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            <div className="glass-panel" style={{ padding: '26px' }}>
              <Zap size={32} color="var(--neon-cyan)" style={{ marginBottom: '16px' }} />
              <h4 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
                Zero Input Lag & 120 FPS
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Every station is equipped with HDMI 2.1 VRR gaming displays for ultra-smooth 120Hz frame rates and lightning reflex competitive play.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '26px' }}>
              <Headphones size={32} color="#ff007f" style={{ marginBottom: '16px' }} />
              <h4 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
                3D Spatial Audio & Pulse 3D
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Experience pinpoint soundscapes where every footsteps, reload sound, and engine roar surrounds you with breathtaking clarity.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '26px' }}>
              <Award size={32} color="var(--gold-accent)" style={{ marginBottom: '16px' }} />
              <h4 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
                Elite DualSense Edge Controllers
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Play with pro-grade back paddles, customizable trigger stops, and sanitized haptic controllers ready for competitive tournaments.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '26px' }}>
              <ShieldCheck size={32} color="var(--neon-green)" style={{ marginBottom: '16px' }} />
              <h4 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
                Doorstep PS5 Home Deliveries
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Want to game from your couch? Our console home rentals come sanitized, boxed with games, cables, and 100% refundable security deposit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA STRIP ================= */}
      <section style={{
        background: 'linear-gradient(135deg, #1b0f38 0%, #080d24 50%, #002244 100%)',
        borderTop: '1px solid rgba(0, 240, 255, 0.25)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
        padding: '70px 0',
        position: 'relative'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', textTransform: 'uppercase', marginBottom: '16px' }}>
            Ready to Level Up Your New Year?
          </h2>
          <p style={{ color: '#cbd5e1', maxWidth: '680px', margin: '0 auto 30px', fontSize: '1.15rem' }}>
            Lock in your favorite PS5 station, private theatre suite, or weekend console rental right now with live instant availability.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/booking" className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.05rem' }}>
              Launch Your Booking
            </Link>
            <Link to="/ai-assistant" className="btn-secondary" style={{ padding: '16px 30px', fontSize: '1.05rem' }}>
              <Sparkles size={20} color="#ff007f" />
              Get Game Recommendation
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
