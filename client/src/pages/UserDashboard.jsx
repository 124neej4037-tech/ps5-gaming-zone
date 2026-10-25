import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Gamepad2, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Receipt, 
  Coins, 
  Plus, 
  RefreshCw, 
  QrCode, 
  X,
  FileText,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function UserDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'cancelled' | 'all'
  const [selectedBookingModal, setSelectedBookingModal] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelFeedback, setCancelFeedback] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchMyBookings();
  }, [currentUser]);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getMyBookings();
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.error('Error fetching user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${bookingId}?`)) {
      return;
    }
    setCancellingId(bookingId);
    setCancelFeedback('');
    try {
      const res = await api.cancelBooking(bookingId);
      if (res.success) {
        setCancelFeedback(`Booking ${bookingId} has been successfully cancelled.`);
        await fetchMyBookings();
        if (selectedBookingModal?.id === bookingId) {
          setSelectedBookingModal(prev => ({ ...prev, status: 'cancelled' }));
        }
      }
    } catch (err) {
      setCancelFeedback(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  // Filter bookings for tabs
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredBookings = bookings.filter(b => {
    const isCancelled = b.status === 'cancelled' || b.status === 'rejected';
    const isCompleted = b.status === 'completed';
    const isDatePast = b.date ? b.date < todayStr : false;

    if (activeTab === 'cancelled') {
      return isCancelled;
    }

    if (activeTab === 'past') {
      return isCompleted || (!isCancelled && isDatePast);
    }

    if (activeTab === 'upcoming') {
      return !isCancelled && !isCompleted && !isDatePast;
    }

    return true; // 'all'
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <span className="badge-neon badge-green">Confirmed</span>;
      case 'pending':
        return <span className="badge-neon badge-gold">Pending Approval</span>;
      case 'completed':
        return <span className="badge-neon badge-cyan">Completed</span>;
      case 'cancelled':
        return <span className="badge-neon badge-pink">Cancelled</span>;
      case 'rejected':
        return <span className="badge-neon badge-pink">Rejected</span>;
      default:
        return <span className="badge-neon badge-purple">{status}</span>;
    }
  };

  return (
    <div style={{ padding: '40px 0 80px', minHeight: '85vh' }}>
      <div className="container">

        {/* Access Denied / Admin Guard Alert */}
        {location.state?.accessDeniedMessage && (
          <div style={{
            padding: '16px 20px',
            marginBottom: '24px',
            background: 'rgba(255, 0, 127, 0.15)',
            border: '1px solid #ff007f',
            borderRadius: '12px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} color="#ff007f" />
              <span>{location.state.accessDeniedMessage}</span>
            </div>
          </div>
        )}

        {/* Cancellation / Action Feedback Banner */}
        {cancelFeedback && (
          <div style={{
            padding: '14px 20px',
            marginBottom: '24px',
            background: cancelFeedback.includes('successfully') ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 0, 127, 0.15)',
            border: `1px solid ${cancelFeedback.includes('successfully') ? '#00ff88' : '#ff007f'}`,
            borderRadius: '12px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {cancelFeedback.includes('successfully') ? <CheckCircle size={20} color="#00ff88" /> : <AlertCircle size={20} color="#ff007f" />}
              <span>{cancelFeedback}</span>
            </div>
            <button 
              type="button"
              onClick={() => setCancelFeedback('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* Welcome Header */}
        <div className="glass-panel" style={{
          padding: '30px',
          marginBottom: '36px',
          background: 'linear-gradient(135deg, rgba(14, 22, 53, 0.85) 0%, rgba(27, 15, 56, 0.8) 100%)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00f0ff, #8a2be2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                color: '#050813'
              }}>
                {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'G'}
              </div>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#fff', textTransform: 'uppercase' }}>
                  {userProfile?.displayName || 'Gamer Hub'}
                </h1>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {userProfile?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(5, 8, 19, 0.7)',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 190, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Coins size={28} color="var(--gold-accent)" />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Reward Points
                </div>
                <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', color: 'var(--gold-accent)', fontWeight: 700 }}>
                  {userProfile?.loyaltyPoints || 100} pts
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(5, 8, 19, 0.7)',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Gamepad2 size={28} color="var(--neon-cyan)" />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Total Sessions
                </div>
                <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontWeight: 700 }}>
                  {bookings.length}
                </div>
              </div>
            </div>

            <Link to="/booking" className="btn-primary" style={{ padding: '12px 22px' }}>
              <Plus size={18} />
              New Booking
            </Link>
          </div>
        </div>

        {location.state?.accessDeniedMessage && (
          <div style={{
            padding: '14px 20px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldCheck size={20} color="#f87171" />
            <span>{location.state.accessDeniedMessage}</span>
          </div>
        )}

        {cancelFeedback && (
          <div style={{
            padding: '14px 20px',
            borderRadius: '10px',
            background: 'rgba(0, 240, 255, 0.12)',
            border: '1px solid var(--neon-cyan)',
            color: '#fff',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle size={18} color="var(--neon-cyan)" />
            <span>{cancelFeedback}</span>
          </div>
        )}

        {/* Tab Filters */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '12px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'upcoming', label: `Upcoming (${bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed').length})` },
            { id: 'past', label: `Past Sessions (${bookings.filter(b => b.status === 'completed').length})` },
            { id: 'cancelled', label: `Cancelled (${bookings.filter(b => b.status === 'cancelled').length})` },
            { id: 'all', label: `All Bookings (${bookings.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: activeTab === tab.id ? 'var(--neon-cyan)' : 'transparent',
                color: activeTab === tab.id ? '#050813' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <RefreshCw size={28} className="animate-pulse-neon" color="var(--neon-cyan)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Retrieving your booking records from Firestore...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Gamepad2 size={44} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
              No {activeTab} bookings found.
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Book a PS5 station, movie theatre room, or home rental to get in the game!
            </p>
            <Link to="/booking" className="btn-primary">
              Book a PS5 Session
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {filteredBookings.map(b => {
              const canCancel = b.status !== 'cancelled' && b.status !== 'completed';
              return (
                <div 
                  key={b.id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px',
                    border: b.status === 'confirmed' ? '1px solid rgba(0, 255, 136, 0.3)' : undefined
                  }}
                >
                  {/* Left: Info */}
                  <div style={{ flex: '1 1 340px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '0.95rem', fontWeight: 700 }}>
                        {b.id}
                      </span>
                      {getStatusBadge(b.status)}
                    </div>

                    <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '8px' }}>
                      {b.serviceTitle || 'PS5 Gaming Experience'}
                    </h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={15} color="var(--neon-cyan)" />
                        <span>{b.date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={15} color="var(--neon-cyan)" />
                        <span>{b.startTime} - {b.endTime || 'End'} ({b.durationHours} hrs)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={15} color="#ff007f" />
                        <span>{b.resourceName}</span>
                      </div>
                    </div>

                    {b.details?.gameTitle && (
                      <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                        🎮 Primary Game: <strong>{b.details.gameTitle}</strong> ({b.details.mode || 'Solo'})
                      </div>
                    )}
                  </div>

                  {/* Center: Price */}
                  <div style={{ textAlign: 'right', paddingRight: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      Total Amount
                    </div>
                    <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontWeight: 800 }}>
                      ₹{b.totalPrice || b.itemizedPrice?.total || 0}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => setSelectedBookingModal(b)}
                      className="btn-secondary"
                      style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                    >
                      <Receipt size={16} />
                      Invoice & Pass
                    </button>

                    {canCancel && (
                      <button 
                        onClick={() => handleCancelBooking(b.id)}
                        disabled={cancellingId === b.id}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '8px',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#f87171',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <XCircle size={16} />
                        {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Booking & QR Entry Pass Modal */}
        {selectedBookingModal && (
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
              padding: '32px',
              position: 'relative'
            }}>
              <button 
                onClick={() => setSelectedBookingModal(null)}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="badge-neon badge-cyan">
                  {selectedBookingModal.id}
                </span>
                {getStatusBadge(selectedBookingModal.status)}
              </div>

              <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '16px' }}>
                {selectedBookingModal.serviceTitle}
              </h2>

              {/* Station Check-In QR Pass Simulation */}
              <div style={{
                background: 'rgba(5, 8, 19, 0.8)',
                border: '1px dashed var(--neon-cyan)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '110px',
                  height: '110px',
                  background: '#fff',
                  borderRadius: '8px',
                  margin: '0 auto 12px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Stylized QR placeholder */}
                  <QrCode size={94} color="#050813" />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--neon-cyan)', letterSpacing: '1px' }}>
                  LOUNGE ENTRY QR PASS
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Show this QR code at Station <strong>{selectedBookingModal.resourceName}</strong> on arrival
                </div>
              </div>

              {/* Itemized Invoice */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '12px', borderLeft: '3px solid var(--neon-cyan)', paddingLeft: '8px' }}>
                  Itemized Bill Breakdown
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                  {selectedBookingModal.itemizedPrice?.lineItems ? (
                    selectedBookingModal.itemizedPrice.lineItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                        <span>{item.label}</span>
                        <span style={{ fontWeight: 600 }}>₹{item.amount}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span>Base Session Fee</span>
                      <span>₹{selectedBookingModal.totalPrice}</span>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '10px 0' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                    <span>Total Paid / Payable</span>
                    <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)' }}>
                      ₹{selectedBookingModal.totalPrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {selectedBookingModal.status !== 'cancelled' && selectedBookingModal.status !== 'completed' && (
                  <button 
                    onClick={() => handleCancelBooking(selectedBookingModal.id)}
                    className="btn-secondary"
                    style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  >
                    Cancel Booking
                  </button>
                )}
                <button 
                  onClick={() => setSelectedBookingModal(null)}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Close Pass
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
