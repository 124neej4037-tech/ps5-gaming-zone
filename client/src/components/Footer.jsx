import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#040711',
      borderTop: '1px solid rgba(0, 240, 255, 0.15)',
      paddingTop: '60px',
      paddingBottom: '30px',
      marginTop: '60px',
      position: 'relative'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00f0ff 0%, #8a2be2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Gamepad2 size={24} color="#050813" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff' }}>
                  BANDHILKI
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', letterSpacing: '1px' }}>
                  PS5 GAMING ZONE
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
              Start the New Year with the Ultimate PS5 Gaming Experience! High-fidelity graphics, premium RGB ambience, and lag-free gameplay. Now offering PS5 Home Rentals!
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              fontSize: '0.78rem',
              color: 'var(--neon-green)',
              fontWeight: 600
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--neon-green)',
                boxShadow: '0 0 8px var(--neon-green)'
              }}></span>
              Station Network Live & Operational
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              color: '#fff',
              marginBottom: '18px',
              borderLeft: '3px solid var(--neon-cyan)',
              paddingLeft: '10px'
            }}>
              Services & Experiences
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/booking?service=ps5_gaming" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  PS5 Lounge Gaming (Solo & Multi)
                </Link>
              </li>
              <li>
                <Link to="/booking?service=movie_theatre" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  VIP 4K Dolby Atmos Cinema
                </Link>
              </li>
              <li>
                <Link to="/booking?service=home_rental" style={{ color: '#ff4da6', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                  PS5 Console Home Rentals ⭐
                </Link>
              </li>
              <li>
                <Link to="/booking?service=birthday_party" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Neon Birthday & Esports Parties
                </Link>
              </li>
              <li>
                <Link to="/games" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Official 50+ Game Catalogue
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              color: '#fff',
              marginBottom: '18px',
              borderLeft: '3px solid var(--neon-pink)',
              paddingLeft: '10px'
            }}>
              Smart Gaming Tools
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/ai-assistant" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#ff007f" />
                  Bandhilki AI Game Concierge
                </Link>
              </li>
              <li>
                <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Gamer Booking Portal & QR Pass
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Player Login / Register
                </Link>
              </li>
              <li>
                <Link to="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Admin Operations Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              color: '#fff',
              marginBottom: '18px',
              borderLeft: '3px solid var(--electric-purple)',
              paddingLeft: '10px'
            }}>
              Lounge Location & Hours
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={20} color="var(--neon-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <a 
                    href="https://share.google/1EvXJIaIxuIjNQmRL" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#cbd5e1', 
                      textDecoration: 'none', 
                      lineHeight: 1.5,
                      display: 'inline-block',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--neon-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                  >
                    Shop no 01, Samer seth bilding, near Vartak College Road, opposite union Bank, Navghar Manikpur, Vishal Nagar, Vasai West, Mumbai, Vasai-Virar, Maharashtra 401202
                  </a>
                  <div style={{ marginTop: '6px' }}>
                    <a 
                      href="https://share.google/1EvXJIaIxuIjNQmRL" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="badge-neon badge-cyan"
                      style={{ 
                        textDecoration: 'none', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        fontSize: '0.75rem',
                        padding: '3px 10px',
                        cursor: 'pointer'
                      }}
                    >
                      <MapPin size={12} /> View on Google Maps
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} color="var(--neon-green)" style={{ flexShrink: 0 }} />
                <span>Mon – Sun: 10:00 AM – 12:00 Midnight</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={18} color="#ff007f" style={{ flexShrink: 0 }} />
                <a 
                  href="tel:8180807208"
                  style={{ 
                    color: 'var(--text-muted)', 
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ff007f'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  +91 8180807208
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} color="var(--gold-accent)" style={{ flexShrink: 0 }} />
                <a 
                  href="mailto:Eliteps5rental@gmail.com"
                  style={{ 
                    color: 'var(--text-muted)', 
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                    wordBreak: 'break-all'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  Eliteps5rental@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '25px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-dim)'
        }}>
          <div>
            © {new Date().getFullYear()} Bandhilki PS5 Gaming Zone. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Powered by React, Node.js & Firebase Firestore</span>
            <span>Zero-Lag 120 FPS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
