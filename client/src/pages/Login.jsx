import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gamepad2, Mail, Lock, LogIn, ShieldAlert, Sparkles, AlertCircle, Info, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const from = location.state?.from 
    ? `${location.state.from.pathname || '/dashboard'}${location.state.from.search || ''}`
    : '/dashboard';
  const redirectMessage = location.state?.message || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Google sign-in was cancelled or encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@gmail.com');
    setPassword('admin123');
    setError('');
  };

  const fillGamerCredentials = () => {
    setEmail('gamer@gmail.com');
    setPassword('gamer123');
    setError('');
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '36px',
        position: 'relative'
      }}>
        {/* Brand Icon */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #00f0ff 0%, #8a2be2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.5)'
          }}>
            <Gamepad2 size={32} color="#050813" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#fff', textTransform: 'uppercase' }}>
            Zone Login
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Sign in to book PS5 stations, manage bookings, or access admin hub
          </p>
        </div>

        {/* Redirect Notice (e.g. from booking page) */}
        {redirectMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(0, 240, 255, 0.12)',
            border: '1px solid var(--neon-cyan)',
            color: '#fff',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            <Info size={20} color="var(--neon-cyan)" style={{ flexShrink: 0 }} />
            <span>{redirectMessage}</span>
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            marginBottom: '20px',
            fontSize: '0.88rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Credentials Quick Box */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: 'rgba(138, 43, 226, 0.12)',
          border: '1px solid rgba(255, 0, 127, 0.35)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', color: '#ff4da6', fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} />
              ADMIN CREDENTIALS
            </span>
            <button
              type="button"
              onClick={fillAdminCredentials}
              style={{
                background: 'rgba(255, 0, 127, 0.2)',
                border: '1px solid #ff007f',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer'
              }}
            >
              Auto-Fill
            </button>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            ID: <strong style={{ color: '#fff' }}>admin@gmail.com</strong> | Password: <strong style={{ color: '#fff' }}>admin123</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--neon-cyan)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                required 
                className="form-control"
                placeholder="admin@gmail.com or gamer@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--neon-cyan)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                required 
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ width: '100%', padding: '14px', marginTop: '16px', fontSize: '0.95rem' }}
          >
            <LogIn size={18} />
            {loading ? 'Authenticating...' : 'Sign In to Zone'}
          </button>
        </form>

        {/* Quick Testing Shortcuts */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
          <button
            type="button"
            onClick={fillGamerCredentials}
            className="btn-secondary"
            style={{ flex: 1, padding: '9px', fontSize: '0.82rem' }}
          >
            Fill Gamer Login
          </button>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="btn-rental-highlight"
            style={{ flex: 1, padding: '9px', fontSize: '0.82rem' }}
          >
            Fill Admin Login
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" state={location.state} style={{ color: 'var(--neon-cyan)', fontWeight: 600, textDecoration: 'none' }}>
            Register as Gamer
          </Link>
        </div>

      </div>
    </div>
  );
}
