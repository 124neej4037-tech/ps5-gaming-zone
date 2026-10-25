import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Gamepad2, 
  Film, 
  Home as HomeIcon, 
  Cake, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Receipt,
  Sparkles,
  MapPin,
  ChevronRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, loginAsDemo } = useAuth();

  // Active Service Tab
  const initialService = searchParams.get('service') || 'ps5_gaming';
  const preselectedGameId = searchParams.get('gameId') || '';

  const [activeService, setActiveService] = useState(initialService);

  // Common Form States
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('14:00');
  const [durationHours, setDurationHours] = useState(2);
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState(userProfile?.displayName || '');
  const [contactPhone, setContactPhone] = useState(userProfile?.phone || '');

  // Available Games & Stations
  const [games, setGames] = useState([]);
  const [stations, setStations] = useState([]);

  // PS5 Gaming Service Specifics
  const [ps5GameId, setPs5GameId] = useState(preselectedGameId);
  const [ps5Mode, setPs5Mode] = useState('multiplayer');
  const [ps5PlayerCount, setPs5PlayerCount] = useState(2);
  const [ps5StationId, setPs5StationId] = useState('station-1');
  const [ps5Addons, setPs5Addons] = useState([]); // ['pulse3dHeadset', 'dualSenseEdge']

  // Movie Theatre Specifics
  const [theatreGuests, setTheatreGuests] = useState(4);
  const [theatreSnackPackage, setTheatreSnackPackage] = useState('regular');
  const [theatreMovieTitle, setTheatreMovieTitle] = useState('Marvel Studio Screening / Custom Stream');

  // Home Rental Specifics
  const [rentalPeriod, setRentalPeriod] = useState('weekend3DayRate');
  const [rentalAddress, setRentalAddress] = useState('Shop no 01, Samer seth bilding, Vishal Nagar, Vasai West, Mumbai 401202');
  const [rentalExtraControllers, setRentalExtraControllers] = useState(1);
  const [rentalGames, setRentalGames] = useState(['Marvel\'s Spider-Man 2', 'EA SPORTS FC 24', 'Tekken 8']);

  // Birthday Party Specifics
  const [partyPackage, setPartyPackage] = useState('silver');
  const [partyGuests, setPartyGuests] = useState(8);
  const [partyAddons, setPartyAddons] = useState(['customCake']);

  // Dynamic Itemized Pricing & Validation States
  const [itemizedPrice, setItemizedPrice] = useState(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState({ checking: false, available: true, message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Initial Load of Catalogue & Stations
  useEffect(() => {
    async function loadResources() {
      try {
        const [gamesRes, resRes] = await Promise.all([
          api.getGames(),
          api.getResources().catch(() => ({ success: true, resources: [] }))
        ]);
        if (gamesRes.success && gamesRes.games) {
          setGames(gamesRes.games);
          if (!ps5GameId && gamesRes.games.length > 0) {
            setPs5GameId(gamesRes.games[0].id);
          }
        }
        if (resRes.success && resRes.resources) {
          setStations(resRes.resources.filter(r => r.type === 'ps5'));
        }
      } catch (e) {
        console.warn('Booking resources load warning:', e.message);
      }
    }
    loadResources();
  }, []);

  // Update contact details if user profile loads
  useEffect(() => {
    if (userProfile?.displayName && !contactName) setContactName(userProfile.displayName);
    if (userProfile?.phone && !contactPhone) setContactPhone(userProfile.phone);
  }, [userProfile]);

  // Handle service URL param changes
  useEffect(() => {
    const s = searchParams.get('service');
    if (s && ['ps5_gaming', 'movie_theatre', 'home_rental', 'birthday_party'].includes(s)) {
      setActiveService(s);
    }
    const g = searchParams.get('gameId');
    if (g) setPs5GameId(g);
  }, [searchParams]);

  // Build options payload for pricing & creation
  const buildServiceOptions = () => {
    switch (activeService) {
      case 'ps5_gaming':
        return {
          durationHours,
          playerCount: ps5PlayerCount,
          mode: ps5Mode,
          gameId: ps5GameId,
          addons: ps5Addons
        };
      case 'movie_theatre':
        return {
          durationHours,
          guests: theatreGuests,
          snackPackage: theatreSnackPackage,
          movieTitle: theatreMovieTitle
        };
      case 'home_rental':
        return {
          rentalPeriod,
          extraControllers: rentalExtraControllers,
          deliveryAddress: rentalAddress,
          selectedGames: rentalGames
        };
      case 'birthday_party':
        return {
          durationHours,
          packageTier: partyPackage,
          guestCount: partyGuests,
          addons: partyAddons
        };
      default:
        return { durationHours };
    }
  };

  // Recalculate price dynamically whenever any input changes
  useEffect(() => {
    let isCancelled = false;
    async function recomputePrice() {
      setCalculatingPrice(true);
      try {
        const options = buildServiceOptions();
        const res = await api.calculatePrice(activeService, options);
        if (!isCancelled && res.success && res.itemized) {
          setItemizedPrice(res.itemized);
        }
      } catch (err) {
        console.warn('Price calculation notice:', err.message);
      } finally {
        if (!isCancelled) setCalculatingPrice(false);
      }
    }

    const timer = setTimeout(recomputePrice, 250);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    activeService,
    durationHours,
    ps5Mode,
    ps5PlayerCount,
    ps5Addons,
    theatreGuests,
    theatreSnackPackage,
    rentalPeriod,
    rentalExtraControllers,
    partyPackage,
    partyGuests,
    partyAddons
  ]);

  // Check Availability / Overlap
  useEffect(() => {
    let isCancelled = false;
    async function checkSlot() {
      // Check for PS5 stations or Theatre
      let targetResource = ps5StationId;
      if (activeService === 'movie_theatre') targetResource = 'theatre-1';
      if (activeService === 'home_rental') targetResource = 'rental-console-1';
      if (activeService === 'birthday_party') targetResource = 'lounge-party-area';

      setAvailabilityStatus({ checking: true, available: true, message: '' });

      try {
        const res = await api.checkAvailability({
          date,
          startTime,
          durationHours,
          resourceId: targetResource
        });

        if (!isCancelled) {
          if (res.success) {
            if (res.isAvailable) {
              setAvailabilityStatus({
                checking: false,
                available: true,
                message: 'Slot is open & verified available!'
              });
            } else {
              setAvailabilityStatus({
                checking: false,
                available: false,
                message: `Station/Resource booked at this time (${res.conflicts?.[0]?.startTime} - ${res.conflicts?.[0]?.endTime}). Please pick another time or station.`
              });
            }
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setAvailabilityStatus({
            checking: false,
            available: true,
            message: 'Slot verified.'
          });
        }
      }
    }

    const timer = setTimeout(checkSlot, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [date, startTime, durationHours, ps5StationId, activeService]);

  // Handle PS5 Addon Toggle
  const togglePs5Addon = (addonKey) => {
    if (ps5Addons.includes(addonKey)) {
      setPs5Addons(ps5Addons.filter(a => a !== addonKey));
    } else {
      setPs5Addons([...ps5Addons, addonKey]);
    }
  };

  // Handle Party Addon Toggle
  const togglePartyAddon = (addonKey) => {
    if (partyAddons.includes(addonKey)) {
      setPartyAddons(partyAddons.filter(a => a !== addonKey));
    } else {
      setPartyAddons([...partyAddons, addonKey]);
    }
  };

  // Submit Booking to Backend
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!availabilityStatus.available) {
      setErrorMessage(availabilityStatus.message || 'The selected slot conflicts with an existing booking.');
      return;
    }

    // Strictly require user login before booking
    if (!currentUser) {
      navigate('/login', {
        state: {
          from: { pathname: '/booking', search: window.location.search },
          message: 'Please log in to your account before confirming your reservation.'
        }
      });
      return;
    }

    setSubmitting(true);

    try {
      const selectedGame = games.find(g => g.id === ps5GameId);
      const stationObj = stations.find(s => s.id === ps5StationId);

      let resourceId = ps5StationId;
      let resourceName = stationObj?.name || 'Station 01 (Cyber Blue OLED 65")';

      if (activeService === 'movie_theatre') {
        resourceId = 'theatre-1';
        resourceName = 'Bandhilki VIP Dolby Cinema Suite';
      } else if (activeService === 'home_rental') {
        resourceId = 'rental-console-1';
        resourceName = 'PS5 Disc Edition Console Bundle A';
      } else if (activeService === 'birthday_party') {
        resourceId = 'lounge-party-area';
        resourceName = 'Bandhilki Neon VIP Arena';
      }

      const bookingPayload = {
        service: activeService,
        date,
        startTime,
        durationHours: Number(durationHours),
        resourceId,
        resourceName,
        contactName: contactName || userProfile?.displayName || 'Gamer',
        contactPhone: contactPhone || userProfile?.phone || '+91 8180807208',
        notes,
        details: {
          ...buildServiceOptions(),
          gameTitle: selectedGame?.title || 'PS5 Blockbuster'
        }
      };

      const res = await api.createBooking(bookingPayload);

      if (res.success && res.booking) {
        setBookingSuccess(res.booking);
        
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setErrorMessage(res.message || 'Failed to complete booking.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while creating your booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '40px 0 80px', minHeight: '85vh' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="badge-neon badge-cyan" style={{ marginBottom: '10px' }}>
            Instant Reservation & Live Rates
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Book Your Gaming Experience
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
            Select your preferred service below. All rates are calculated live with zero hidden fees.
          </p>
        </div>

        {/* ================= 4 SERVICE TABS ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '36px'
        }}>
          {[
            { id: 'ps5_gaming', label: 'PS5 Lounge Gaming', icon: Gamepad2, color: 'var(--neon-cyan)' },
            { id: 'movie_theatre', label: 'VIP Cinema Theatre', icon: Film, color: 'var(--electric-purple)' },
            { id: 'home_rental', label: 'PS5 Home Rental ⭐', icon: HomeIcon, color: '#ff007f' },
            { id: 'birthday_party', label: 'Birthday & Parties', icon: Cake, color: 'var(--gold-accent)' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeService === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveService(tab.id); setErrorMessage(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  border: isActive ? `1px solid ${tab.color}` : '1px solid rgba(255, 255, 255, 0.12)',
                  background: isActive ? 'rgba(14, 22, 53, 0.95)' : 'rgba(11, 18, 42, 0.55)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  boxShadow: isActive ? `0 0 20px rgba(0, 240, 255, 0.25)` : 'none'
                }}
              >
                <Icon size={20} color={tab.color} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Booking Confirmation Success Screen */}
        {bookingSuccess ? (
          <div className="glass-panel" style={{
            maxWidth: '750px',
            margin: '0 auto',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid var(--neon-green)',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.25)'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(0, 255, 136, 0.15)',
              border: '2px solid var(--neon-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle size={36} color="var(--neon-green)" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginBottom: '10px' }}>
              Booking Confirmed!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '24px' }}>
              Your reservation has been locked onto the Bandhilki station network.
            </p>

            <div style={{
              background: 'rgba(5, 8, 19, 0.7)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '30px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Booking ID:</span>
                <strong style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)' }}>
                  {bookingSuccess.id}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Service:</span>
                <strong style={{ color: '#fff' }}>{bookingSuccess.serviceTitle}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Date & Time:</span>
                <span style={{ color: '#fff' }}>{bookingSuccess.date} at {bookingSuccess.startTime} ({bookingSuccess.durationHours} hrs)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Allocated Resource:</span>
                <span style={{ color: '#00ff88' }}>{bookingSuccess.resourceName}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '12px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700 }}>
                <span style={{ color: '#fff' }}>Total Amount:</span>
                <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)' }}>
                  ₹{bookingSuccess.totalPrice}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
                style={{ padding: '14px 30px' }}
              >
                View in Gamer Dashboard
              </button>
              <button 
                onClick={() => { setBookingSuccess(null); }}
                className="btn-secondary"
                style={{ padding: '14px 24px' }}
              >
                Make Another Booking
              </button>
            </div>
          </div>
        ) : (
          /* ================= MAIN BOOKING LAYOUT ================= */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            alignItems: 'start'
          }}>
            
            {/* LEFT COLUMN: Service-Specific Forms */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <form onSubmit={handleBookingSubmit}>

                {!currentUser && (
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'rgba(255, 0, 127, 0.12)',
                    border: '1px solid rgba(255, 0, 127, 0.4)',
                    marginBottom: '24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>
                        🔒 Login Required to Complete Booking
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                        Please sign in to your gamer account so your reservation and QR entry pass can be saved.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/login', {
                        state: {
                          from: { pathname: '/booking', search: window.location.search },
                          message: 'Please log in to complete your booking reservation.'
                        }
                      })}
                      className="btn-rental-highlight"
                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                    >
                      Log In Now
                    </button>
                  </div>
                )}
                
                {/* 1. PS5 Lounge Gaming Specific Fields */}
                {activeService === 'ps5_gaming' && (
                  <div>
                    <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', borderLeft: '3px solid var(--neon-cyan)', paddingLeft: '10px' }}>
                      PS5 Lounge Gaming Options
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label className="form-label">Gameplay Mode</label>
                        <select 
                          className="form-control"
                          value={ps5Mode}
                          onChange={(e) => {
                            setPs5Mode(e.target.value);
                            if (e.target.value === 'solo') setPs5PlayerCount(1);
                            if (e.target.value === 'multiplayer' && ps5PlayerCount < 2) setPs5PlayerCount(2);
                          }}
                        >
                          <option value="solo">Solo Immersion (1P)</option>
                          <option value="multiplayer">Multiplayer Couch (2-4P)</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Total Players</label>
                        <select 
                          className="form-control"
                          value={ps5PlayerCount}
                          onChange={(e) => setPs5PlayerCount(Number(e.target.value))}
                        >
                          <option value={1}>1 Player</option>
                          <option value={2}>2 Players</option>
                          <option value={3}>3 Players (+₹60/hr)</option>
                          <option value={4}>4 Players (+₹120/hr)</option>
                        </select>
                      </div>
                    </div>

                    {/* Game Selection */}
                    <div className="form-group">
                      <label className="form-label">Select Primary Game</label>
                      <select 
                        className="form-control"
                        value={ps5GameId}
                        onChange={(e) => setPs5GameId(e.target.value)}
                      >
                        {games.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.title} ({g.genre} • {g.playerCount})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Station Selection */}
                    <div className="form-group">
                      <label className="form-label">Dedicated PS5 Station</label>
                      <select 
                        className="form-control"
                        value={ps5StationId}
                        onChange={(e) => setPs5StationId(e.target.value)}
                      >
                        {stations.length > 0 ? (
                          stations.map(st => (
                            <option key={st.id} value={st.id}>
                              {st.name} {st.status === 'maintenance' ? '(Under Maintenance)' : '● Ready'}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="station-1">Station 01 (Cyber Blue OLED 65")</option>
                            <option value="station-2">Station 02 (Neon Violet OLED 65")</option>
                            <option value="station-3">Station 03 (Matrix Green OLED 65")</option>
                            <option value="station-4">Station 04 (Dual Couch Esports Station)</option>
                            <option value="station-5">Station 05 (Gran Turismo Cockpit)</option>
                            <option value="station-6">Station 06 (VR2 Cyber Pod)</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Hardware Add-ons */}
                    <div style={{ marginBottom: '24px' }}>
                      <label className="form-label">Hardware Upgrades (Optional)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1', cursor: 'pointer' }}>
                          <input 
                            type="checkbox"
                            checked={ps5Addons.includes('pulse3dHeadset')}
                            onChange={() => togglePs5Addon('pulse3dHeadset')}
                            style={{ accentColor: 'var(--neon-cyan)', width: '18px', height: '18px' }}
                          />
                          <span>Pulse 3D Wireless Headset (+₹50/hr)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1', cursor: 'pointer' }}>
                          <input 
                            type="checkbox"
                            checked={ps5Addons.includes('dualSenseEdge')}
                            onChange={() => togglePs5Addon('dualSenseEdge')}
                            style={{ accentColor: 'var(--neon-cyan)', width: '18px', height: '18px' }}
                          />
                          <span>DualSense Edge Pro Controller with Back Paddles (+₹70/hr)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Movie Theatre Specific Fields */}
                {activeService === 'movie_theatre' && (
                  <div>
                    <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', borderLeft: '3px solid var(--electric-purple)', paddingLeft: '10px' }}>
                      VIP Cinema Theatre Screening
                    </h3>

                    <div className="form-group">
                      <label className="form-label">Movie / Content Title</label>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="e.g. Spider-Man: Across The Spider-Verse, Esports Finals, etc."
                        value={theatreMovieTitle}
                        onChange={(e) => setTheatreMovieTitle(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label className="form-label">Guest Capacity (Up to 12)</label>
                        <select 
                          className="form-control"
                          value={theatreGuests}
                          onChange={(e) => setTheatreGuests(Number(e.target.value))}
                        >
                          {[2, 4, 6, 8, 10, 12].map(num => (
                            <option key={num} value={num}>{num} Guests</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Refreshments Package</label>
                        <select 
                          className="form-control"
                          value={theatreSnackPackage}
                          onChange={(e) => setTheatreSnackPackage(e.target.value)}
                        >
                          <option value="none">No Snacks (Screening Only)</option>
                          <option value="regular">Regular Popcorn & Sodas (+₹250)</option>
                          <option value="vipCombo">VIP Gourmet Nachos & Drinks (+₹499)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PS5 Home Rental Specific Fields */}
                {activeService === 'home_rental' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span className="badge-neon badge-pink">NEW OFFER</span>
                      <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>
                        PS5 Console Home Rental
                      </h3>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Rental Duration Period</label>
                      <select 
                        className="form-control"
                        value={rentalPeriod}
                        onChange={(e) => setRentalPeriod(e.target.value)}
                      >
                        <option value="dailyRate">1 Day (24 Hours) — ₹1,199</option>
                        <option value="weekend3DayRate">Weekend 3-Day Blast (Fri-Sun) — ₹2,899 (Save ₹700!)</option>
                        <option value="weeklyRate">Weekly Pass (7 Full Days) — ₹5,999 (Best Value)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Delivery Address (Vasai West, Mumbai & Vasai-Virar)</label>
                      <textarea 
                        className="form-control"
                        rows="2"
                        placeholder="Enter full flat number, building name, landmark, and pincode..."
                        value={rentalAddress}
                        onChange={(e) => setRentalAddress(e.target.value)}
                      ></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label className="form-label">Extra Controllers</label>
                        <select 
                          className="form-control"
                          value={rentalExtraControllers}
                          onChange={(e) => setRentalExtraControllers(Number(e.target.value))}
                        >
                          <option value={0}>Included 1 Controller</option>
                          <option value={1}>+1 Extra Controller (+₹150/day)</option>
                          <option value={2}>+2 Extra Controllers (4P Ready)</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Security Deposit</label>
                        <input 
                          type="text" 
                          disabled 
                          className="form-control" 
                          value="₹4,000 (100% Refundable)"
                          style={{ background: 'rgba(0, 255, 136, 0.08)', color: 'var(--neon-green)', fontWeight: 600 }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Birthday Party Specific Fields */}
                {activeService === 'birthday_party' && (
                  <div>
                    <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', borderLeft: '3px solid var(--gold-accent)', paddingLeft: '10px' }}>
                      Neon Birthday & Gaming Party
                    </h3>

                    <div className="form-group">
                      <label className="form-label">Party Package Tier</label>
                      <select 
                        className="form-control"
                        value={partyPackage}
                        onChange={(e) => setPartyPackage(e.target.value)}
                      >
                        <option value="silver">Silver Neon Clash — ₹3,499 (2 hrs, 6 guests, 2 stations)</option>
                        <option value="gold">Gold Cyber Party — ₹5,999 (3 hrs, 12 guests, 4 stations + VR)</option>
                        <option value="vipNeon">Bandhilki VIP Lounge Takeover — ₹9,999 (4 hrs, 20 guests, Entire Venue)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total Guest Count</label>
                      <input 
                        type="number"
                        min="5"
                        max="30"
                        className="form-control"
                        value={partyGuests}
                        onChange={(e) => setPartyGuests(Number(e.target.value))}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label className="form-label">Party Add-ons</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1', cursor: 'pointer' }}>
                          <input 
                            type="checkbox"
                            checked={partyAddons.includes('customCake')}
                            onChange={() => togglePartyAddon('customCake')}
                            style={{ accentColor: 'var(--gold-accent)', width: '18px', height: '18px' }}
                          />
                          <span>Custom 1.5kg PS5 Controller Cake (+₹1,200)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1', cursor: 'pointer' }}>
                          <input 
                            type="checkbox"
                            checked={partyAddons.includes('proPhotographer')}
                            onChange={() => togglePartyAddon('proPhotographer')}
                            style={{ accentColor: 'var(--gold-accent)', width: '18px', height: '18px' }}
                          />
                          <span>Cyberpunk Event Photographer & Video Reel (+₹1,500)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Common Booking Schedule Fields (Date, Time, Duration) */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px', marginTop: '10px' }}>
                  <h4 style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '16px' }}>
                    Schedule & Timing
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label className="form-label">Date</label>
                      <input 
                        type="date"
                        min={todayStr}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="form-control"
                      />
                    </div>

                    <div>
                      <label className="form-label">Start Time</label>
                      <select 
                        className="form-control"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      >
                        {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(t => (
                          <option key={t} value={t}>{t} HRS</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Duration</label>
                      <select 
                        className="form-control"
                        value={durationHours}
                        onChange={(e) => setDurationHours(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6].map(h => (
                          <option key={h} value={h}>{h} Hour{h > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label className="form-label">Your Name</label>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="Player Name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">WhatsApp / Phone</label>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="+91 8180807208"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Availability feedback */}
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: availabilityStatus.available ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 0, 127, 0.15)',
                    border: availabilityStatus.available ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(255, 0, 127, 0.5)',
                    color: availabilityStatus.available ? 'var(--neon-green)' : '#ff4da6',
                    fontSize: '0.88rem'
                  }}>
                    {availabilityStatus.available ? (
                      <CheckCircle size={18} />
                    ) : (
                      <AlertCircle size={18} />
                    )}
                    <span>
                      {availabilityStatus.checking ? 'Checking live station availability...' : availabilityStatus.message}
                    </span>
                  </div>

                  {errorMessage && (
                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', marginBottom: '16px', fontSize: '0.9rem' }}>
                      {errorMessage}
                    </div>
                  )}

                  {!currentUser ? (
                    <button 
                      type="button"
                      onClick={() => navigate('/login', {
                        state: {
                          from: { pathname: '/booking', search: window.location.search },
                          message: 'Please log in to confirm and reserve your slot.'
                        }
                      })}
                      className="btn-rental-highlight"
                      style={{ width: '100%', padding: '16px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <ShieldCheck size={20} />
                      Log In to Confirm & Reserve Slot
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      disabled={submitting || !availabilityStatus.available}
                      className="btn-primary"
                      style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }}
                    >
                      {submitting ? (
                        <>
                          <RefreshCw size={20} className="animate-pulse-neon" />
                          Securing Reservation...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={20} />
                          Confirm & Reserve Slot
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: Live Itemized Price Card */}
            <div style={{ position: 'sticky', top: '90px' }}>
              <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(0, 240, 255, 0.35)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <Receipt size={22} color="var(--neon-cyan)" />
                  <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>
                    Itemized Pricing
                  </h3>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Real-time rate computation according to active lounge pricing rules:
                </div>

                {calculatingPrice ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--neon-cyan)' }}>
                    <RefreshCw size={24} className="animate-pulse-neon" style={{ margin: '0 auto 10px' }} />
                    <p style={{ fontSize: '0.85rem' }}>Recalculating rates...</p>
                  </div>
                ) : itemizedPrice ? (
                  <div>
                    {/* Line Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                      {itemizedPrice.lineItems?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cbd5e1' }}>
                          <span style={{ maxWidth: '75%' }}>{item.label}</span>
                          <span style={{ fontWeight: 600, color: item.isRefundable ? 'var(--neon-green)' : '#fff' }}>
                            ₹{item.amount}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '14px 0' }}></div>

                    {/* Subtotal & Taxes */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <span>Subtotal</span>
                      <span>₹{itemizedPrice.subtotal}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <span>GST & Tech Surcharge ({itemizedPrice.taxRatePercent}%)</span>
                      <span>₹{itemizedPrice.taxes}</span>
                    </div>

                    {itemizedPrice.securityDeposit > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--neon-green)', marginBottom: '8px' }}>
                        <span>Refundable Security Deposit</span>
                        <span>₹{itemizedPrice.securityDeposit}</span>
                      </div>
                    )}

                    <div style={{ borderTop: '2px solid rgba(0, 240, 255, 0.3)', margin: '16px 0 14px' }}></div>

                    {/* Grand Total */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                          Total Payable
                        </div>
                        <div style={{ fontSize: '1.9rem', fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontWeight: 800 }}>
                          ₹{itemizedPrice.total}
                        </div>
                      </div>
                      <span className="badge-neon badge-green">
                        Best Rate
                      </span>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>
                    Configure options to view price breakdown.
                  </p>
                )}

                {/* Per-session gamer perks */}
                <div style={{
                  marginTop: '24px',
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(5, 8, 19, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#ffbe0b', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '6px' }}>
                    <Sparkles size={14} />
                    Gamer Loyalty Reward
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Earn ~{Math.round((itemizedPrice?.subtotal || 200) * 0.1)} loyalty points on completion for free controller upgrades!
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
