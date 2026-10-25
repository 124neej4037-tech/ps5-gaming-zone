import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Gamepad2, 
  Sparkles, 
  Calendar, 
  Grid, 
  User, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X, 
  Flame, 
  Coins,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, userProfile, isAdmin, logout, loginAsDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--neon-cyan)' : 'var(--text-muted)',
    borderBottom: isActive ? '2px solid var(--neon-cyan)' : '2px solid transparent',
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 600,
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    textShadow: isActive ? '0 0 10px rgba(0, 240, 255, 0.5)' : 'none'
  });

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(5, 8, 19, 0.88)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00f0ff 0%, #8a2be2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)'
          }}>
            <Gamepad2 size={26} color="#050813" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              lineHeight: 1.1,
              background: 'linear-gradient(90deg, #ffffff 0%, #00f0ff 70%, #ff007f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              BANDHILKI
            </div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8rem',
              color: 'var(--neon-cyan)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontWeight: 600
            }}>
              PS5 Gaming Zone
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '8px'
        }} className="desktop-nav">
          <NavLink to="/" style={navLinkStyle}>
            Home
          </NavLink>
          <NavLink to="/games" style={navLinkStyle}>
            <Grid size={17} />
            Games Catalogue
          </NavLink>
          <NavLink to="/ai-assistant" style={navLinkStyle}>
            <Sparkles size={17} color="#ff007f" />
            AI Assistant
          </NavLink>
          <NavLink to="/booking" style={navLinkStyle}>
            <Calendar size={17} color="#00ff88" />
            Book Now
          </NavLink>
        </nav>

        {/* User Actions / Quick Access */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(14, 22, 51, 0.8)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  padding: '6px 14px',
                  borderRadius: '25px',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isAdmin ? 'linear-gradient(135deg, #ff007f, #8a2be2)' : 'linear-gradient(135deg, #00f0ff, #0077fe)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'G'}
                </div>
                <div style={{ textAlign: 'left', display: 'none' }} className="user-name-text">
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.2 }}>
                    {userProfile?.displayName || 'Gamer'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: isAdmin ? '#ff007f' : 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isAdmin ? <ShieldAlert size={12} /> : <Coins size={12} />}
                    {isAdmin ? 'Admin Zone' : `${userProfile?.loyaltyPoints || 100} pts`}
                  </div>
                </div>
                <ChevronDown size={16} color="var(--text-muted)" />
              </button>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '230px',
                  background: '#0b1129',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(0, 240, 255, 0.2)',
                  padding: '8px 0',
                  zIndex: 110
                }}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                      {userProfile?.displayName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {userProfile?.email}
                    </div>
                  </div>

                  <Link 
                    to="/dashboard" 
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 16px',
                      color: 'var(--text-main)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={16} color="var(--neon-cyan)" />
                    My Bookings & Pass
                  </Link>

                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        color: '#ff4da6',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 0, 127, 0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <ShieldAlert size={16} color="#ff007f" />
                      Admin Control Hub
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }}></div>

                  <button 
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 16px',
                      color: '#f87171',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link 
                to="/login"
                style={{
                  color: 'var(--text-main)',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  padding: '8px 16px'
                }}
              >
                Log In
              </Link>
              <Link 
                to="/signup"
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Join Zone
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px',
              color: 'var(--neon-cyan)',
              cursor: 'pointer'
            }}
            className="mobile-toggle"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: 'rgba(5, 8, 19, 0.98)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
          padding: '16px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#fff', textDecoration: 'none', padding: '10px 0', fontSize: '1.05rem', fontWeight: 600 }}
          >
            Home
          </Link>
          <Link 
            to="/games" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#fff', textDecoration: 'none', padding: '10px 0', fontSize: '1.05rem', fontWeight: 600 }}
          >
            Games Catalogue
          </Link>
          <Link 
            to="/ai-assistant" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#ff007f', textDecoration: 'none', padding: '10px 0', fontSize: '1.05rem', fontWeight: 600 }}
          >
            AI Game Assistant
          </Link>
          <Link 
            to="/booking" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#00ff88', textDecoration: 'none', padding: '10px 0', fontSize: '1.05rem', fontWeight: 600 }}
          >
            Book PS5 / Theatre / Rental
          </Link>

          {currentUser ? (
            <>
              <Link 
                to="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: 'var(--neon-cyan)', textDecoration: 'none', padding: '10px 0', fontSize: '1.05rem', fontWeight: 600 }}
              >
                User Dashboard
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: '#ff007f', textDecoration: 'none', padding: '10px 0', fontSize: '1.05rem', fontWeight: 600 }}
                >
                  Admin Hub
                </Link>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary"
                style={{ fontSize: '0.9rem', flex: 1, padding: '10px', textAlign: 'center' }}
              >
                Log In
              </Link>
              <Link 
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary"
                style={{ fontSize: '0.9rem', flex: 1, padding: '10px', textAlign: 'center' }}
              >
                Join Zone
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Embedded CSS for responsive navbar queries */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
          .user-name-text {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
