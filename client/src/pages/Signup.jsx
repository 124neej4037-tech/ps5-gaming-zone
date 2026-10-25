import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gamepad2, Mail, Lock, User, Phone, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from 
    ? `${location.state.from.pathname || '/dashboard'}${location.state.from.search || ''}`
    : '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password should be at least 6 characters');
    }

    setLoading(true);
    try {
      await signup(email, password, displayName, phone);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create player account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
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
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
            Join Bandhilki
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Claim your 100 bonus loyalty points upon sign-up!
          </p>
        </div>

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

        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Full Name / Gamer Tag</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--neon-cyan)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                required 
                className="form-control"
                placeholder="e.g. Phoenix_Patil"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--neon-cyan)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                required 
                className="form-control"
                placeholder="gamer@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone / WhatsApp Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="var(--neon-cyan)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="tel" 
                className="form-control"
                placeholder="+91 8180807208"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--neon-cyan)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  required 
                  className="form-control"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Confirm</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--neon-cyan)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  required 
                  className="form-control"
                  placeholder="Repeat pass"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
          >
            <UserPlus size={18} />
            {loading ? 'Registering Player...' : 'Create Gamer Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already a Bandhilki player?{' '}
          <Link to="/login" state={location.state} style={{ color: 'var(--neon-cyan)', fontWeight: 600, textDecoration: 'none' }}>
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
}
