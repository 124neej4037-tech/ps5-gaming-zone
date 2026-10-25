import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  DollarSign, 
  Calendar, 
  Gamepad2, 
  Tv, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  Save, 
  AlertCircle, 
  CheckCircle,
  FileSpreadsheet,
  Printer,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();

  // Active Admin Section Tab
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'games' | 'pricing' | 'resources' | 'users'

  // Data states
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [games, setGames] = useState([]);
  const [resources, setResources] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [pricingRates, setPricingRates] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters for Bookings
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingDateFilter, setBookingDateFilter] = useState('');

  // Modals
  const [showGameModal, setShowGameModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [gameFormData, setGameFormData] = useState({
    title: '',
    genre: 'Action',
    playerCount: '1-2 Players',
    maxPlayers: 2,
    rating: 4.8,
    description: '',
    features: '4K 60FPS, DualSense Haptics',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    available: true,
    releaseYear: 2024
  });

  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [updatingPricing, setUpdatingPricing] = useState(false);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, gamesRes, resourcesRes, pricingRes, usersRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ success: false })),
        api.getAdminBookings().catch(() => ({ success: false })),
        api.getGames().catch(() => ({ success: false })),
        api.getResources().catch(() => ({ success: false })),
        api.getPricing().catch(() => ({ success: false })),
        api.getUsers().catch(() => ({ success: false }))
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (bookingsRes.success) setBookings(bookingsRes.bookings || []);
      if (gamesRes.success) setGames(gamesRes.games || []);
      if (resourcesRes.success) setResources(resourcesRes.resources || []);
      if (pricingRes.success) setPricingRates(pricingRes.rates || {});
      if (usersRes.success) setUsersList(usersRes.users || []);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [isAdmin]);

  // Status changer for bookings
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        setFeedback({ type: 'success', text: `Booking ${bookingId} updated to ${newStatus}.` });
        // Refresh bookings and stats
        const [bRes, sRes] = await Promise.all([
          api.getAdminBookings({ status: bookingStatusFilter !== 'all' ? bookingStatusFilter : '' }),
          api.getAdminStats()
        ]);
        if (bRes.success) setBookings(bRes.bookings);
        if (sRes.success) setStats(sRes.stats);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update booking status.' });
    }
  };

  // Toggle Resource Status (e.g. station maintenance)
  const handleToggleResource = async (resourceId, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'maintenance' : 'available';
    try {
      const res = await api.updateResource(resourceId, { status: newStatus });
      if (res.success) {
        setResources(prev => prev.map(r => r.id === resourceId ? { ...r, status: newStatus } : r));
        setFeedback({ type: 'success', text: `Station status changed to ${newStatus}.` });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update resource.' });
    }
  };

  // Save Pricing Form
  const handleSavePricing = async (e) => {
    e.preventDefault();
    setUpdatingPricing(true);
    try {
      const res = await api.updatePricing(pricingRates);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Pricing rates updated successfully!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update rates.' });
    } finally {
      setUpdatingPricing(false);
    }
  };

  // Open Game Modal for Add / Edit
  const openAddGameModal = () => {
    setEditingGame(null);
    setGameFormData({
      title: '',
      genre: 'Action',
      playerCount: '1-2 Players',
      maxPlayers: 2,
      rating: 4.8,
      description: '',
      features: '4K 60FPS, DualSense Haptics',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
      available: true,
      releaseYear: 2024
    });
    setShowGameModal(true);
  };

  const openEditGameModal = (game) => {
    setEditingGame(game);
    setGameFormData({
      title: game.title,
      genre: game.genre,
      playerCount: game.playerCount,
      maxPlayers: game.maxPlayers || 2,
      rating: game.rating || 4.8,
      description: game.description || '',
      features: Array.isArray(game.features) ? game.features.join(', ') : '',
      imageUrl: game.imageUrl,
      available: game.available !== false,
      releaseYear: game.releaseYear || 2024
    });
    setShowGameModal(true);
  };

  // Handle Game Form Submit
  const handleGameSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...gameFormData,
        features: gameFormData.features.split(',').map(s => s.trim())
      };

      if (editingGame) {
        const res = await api.updateGame(editingGame.id, payload);
        if (res.success) {
          setFeedback({ type: 'success', text: `Updated ${payload.title} in catalogue.` });
        }
      } else {
        const res = await api.createGame(payload);
        if (res.success) {
          setFeedback({ type: 'success', text: `Added ${payload.title} to catalogue.` });
        }
      }

      setShowGameModal(false);
      const gRes = await api.getGames();
      if (gRes.success) setGames(gRes.games);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save game.' });
    }
  };

  // Delete Game
  const handleDeleteGame = async (gameId, title) => {
    if (!window.confirm(`Are you sure you want to delete ${title} from catalogue?`)) return;
    try {
      const res = await api.deleteGame(gameId);
      if (res.success) {
        setGames(prev => prev.filter(g => g.id !== gameId));
        setFeedback({ type: 'success', text: `Removed ${title} from catalogue.` });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete game.' });
    }
  };

  // Filter Bookings locally
  const filteredBookings = bookings.filter(b => {
    if (bookingStatusFilter !== 'all' && b.status?.toLowerCase() !== bookingStatusFilter.toLowerCase()) {
      return false;
    }
    if (bookingDateFilter && b.date !== bookingDateFilter) {
      return false;
    }
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      return (
        b.id?.toLowerCase().includes(q) ||
        b.userName?.toLowerCase().includes(q) ||
        b.userEmail?.toLowerCase().includes(q) ||
        b.serviceTitle?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Build formatted Excel Workbook with custom column widths
  const createWorkbook = (records = filteredBookings) => {
    const data = records.map((b, idx) => ({
      'Sr No': idx + 1,
      'Booking ID': b.id,
      'Date': b.date,
      'Start Time': b.startTime,
      'End Time': b.endTime || '',
      'Duration (Hours)': b.durationHours || 1,
      'Service': b.serviceTitle || b.service,
      'Station / Suite': b.resourceName || b.resourceId || 'Station',
      'Customer Name': b.userName || 'Gamer',
      'Customer Email': b.userEmail || '',
      'Contact Phone': b.userPhone || '',
      'Total Amount (INR)': b.totalPrice || b.itemizedPrice?.total || 0,
      'Status': (b.status || 'pending').toUpperCase(),
      'Notes / Details': b.notes || b.details?.specialNotes || '',
      'Booked On': b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 6 },  // Sr No
      { wch: 18 }, // Booking ID
      { wch: 12 }, // Date
      { wch: 11 }, // Start Time
      { wch: 11 }, // End Time
      { wch: 16 }, // Duration
      { wch: 26 }, // Service
      { wch: 32 }, // Station / Suite
      { wch: 20 }, // Customer Name
      { wch: 26 }, // Customer Email
      { wch: 16 }, // Contact Phone
      { wch: 18 }, // Total Amount
      { wch: 14 }, // Status
      { wch: 32 }, // Notes
      { wch: 22 }  // Booked On
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings Register');
    return workbook;
  };

  // Export genuine native .xlsx Microsoft Excel workbook (shows Excel green icon & opens directly)
  const handleExportExcel = (records = filteredBookings) => {
    try {
      const workbook = createWorkbook(records);
      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Bandhilki_PS5_Bookings_${today}.xlsx`);
      setFeedback({ type: 'success', text: `Downloaded Bandhilki_PS5_Bookings_${today}.xlsx successfully!` });
    } catch (err) {
      console.error('Excel export error:', err);
      setFeedback({ type: 'error', text: 'Failed to generate Excel file.' });
    }
  };

  // Export .csv file natively
  const handleExportCSV = (records = filteredBookings) => {
    try {
      const workbook = createWorkbook(records);
      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Bandhilki_PS5_Bookings_${today}.csv`, { bookType: 'csv' });
      setFeedback({ type: 'success', text: `Downloaded Bandhilki_PS5_Bookings_${today}.csv successfully!` });
    } catch (err) {
      console.error('CSV export error:', err);
      setFeedback({ type: 'error', text: 'Failed to generate CSV file.' });
    }
  };

  const handlePrintExcelSheet = () => {
    window.print();
  };

  return (
    <div style={{ padding: '40px 0 80px', minHeight: '85vh' }}>
      <div className="container">
        
        {/* Admin Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }} className="badge-neon badge-pink">
              <ShieldAlert size={16} />
              Operations Control Center
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: '#fff', textTransform: 'uppercase' }}>
              Bandhilki Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Full management over bookings, catalogue, pricing rates, stations, and users.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={loadAllAdminData}
              disabled={loading}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: loading ? 0.7 : 1 }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Syncing...' : 'Sync Data'}
            </button>
            <button 
              onClick={openAddGameModal}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={18} />
              Add PS5 Game
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback.text && (
          <div style={{
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: feedback.type === 'success' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(239, 68, 68, 0.2)',
            border: feedback.type === 'success' ? '1px solid #00ff88' : '1px solid #ef4444',
            color: feedback.type === 'success' ? '#a7f3d0' : '#fca5a5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.text}</span>
            </div>
            <button 
              onClick={() => setFeedback({ type: '', text: '' })}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ================= AGGREGATED METRICS CARDS ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}>
          <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid var(--neon-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</span>
              <DollarSign size={20} color="var(--neon-cyan)" />
            </div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 800 }}>
              ₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '8,031'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neon-green)', marginTop: '4px' }}>
              ● Confirmed & Completed Bookings
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid #ff007f' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Bookings</span>
              <Calendar size={20} color="#ff007f" />
            </div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 800 }}>
              {stats?.totalBookings ?? bookings.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
              Across all 4 services
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid var(--electric-purple)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active PS5 Stations</span>
              <Tv size={20} color="var(--electric-purple)" />
            </div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 800 }}>
              {stats?.activeStations ?? 6} / {stats?.totalStations ?? 9}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neon-green)', marginTop: '4px' }}>
              ● Ready for Walk-ins & Bookings
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid var(--gold-accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>PS5 Catalogue</span>
              <Gamepad2 size={20} color="var(--gold-accent)" />
            </div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 800 }}>
              {games.length} Games
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
              Pre-installed on NVMe SSDs
            </div>
          </div>
        </div>

        {/* ================= ADMIN NAVIGATION TABS ================= */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '12px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'bookings', label: `Manage Bookings (${bookings.length})` },
            { id: 'games', label: `PS5 Games (${games.length})` },
            { id: 'pricing', label: 'Pricing & Packages' },
            { id: 'resources', label: `Stations & Pods (${resources.length})` },
            { id: 'users', label: `Registered Users (${usersList.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: activeTab === tab.id ? 'var(--neon-cyan)' : 'transparent',
                color: activeTab === tab.id ? '#050813' : 'var(--text-muted)',
                transition: 'all 0.2s',
                boxShadow: activeTab === tab.id ? '0 0 15px rgba(0, 240, 255, 0.4)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: BOOKINGS MANAGER ================= */}
        {activeTab === 'bookings' && (
          <div>
            {/* Filter Toolbar */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
              {/* Action Ribbon: Excel Sheet & Export Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={18} color="#00ff88" />
                  <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>
                    Bookings Register ({filteredBookings.length} records)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowExcelModal(true)}
                    className="btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 18px',
                      fontSize: '0.88rem',
                      background: 'linear-gradient(135deg, #107c41 0%, #185a30 100%)',
                      border: '1px solid #28a745',
                      boxShadow: '0 0 15px rgba(40, 167, 69, 0.35)'
                    }}
                  >
                    <FileSpreadsheet size={16} />
                    View Excel Sheet & Print
                  </button>

                  <button
                    onClick={() => handleExportExcel(filteredBookings)}
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      fontSize: '0.88rem',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      color: 'var(--neon-green)'
                    }}
                  >
                    <FileSpreadsheet size={15} />
                    Download Excel (.xlsx)
                  </button>

                  <button
                    onClick={() => handleExportCSV(filteredBookings)}
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      fontSize: '0.88rem'
                    }}
                  >
                    <Download size={15} />
                    Download CSV (.csv)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Search Booking ID / Gamer</label>
                  <input 
                    type="text"
                    placeholder="Search by ID, name, email..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Filter by Status</label>
                  <select 
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="form-control"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending Approval</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Filter by Date</label>
                  <input 
                    type="date"
                    value={bookingDateFilter}
                    onChange={(e) => setBookingDateFilter(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(0, 240, 255, 0.2)', color: 'var(--neon-cyan)' }}>
                    <th style={{ padding: '12px 14px' }}>Booking ID</th>
                    <th style={{ padding: '12px 14px' }}>Customer</th>
                    <th style={{ padding: '12px 14px' }}>Service</th>
                    <th style={{ padding: '12px 14px' }}>Date & Time</th>
                    <th style={{ padding: '12px 14px' }}>Resource</th>
                    <th style={{ padding: '12px 14px' }}>Total</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No bookings matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <td style={{ padding: '14px', fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontWeight: 600 }}>
                          {b.id}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{b.userName || 'Gamer'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{b.userEmail}</div>
                          {b.userPhone && <div style={{ fontSize: '0.78rem', color: '#ffbe0b' }}>{b.userPhone}</div>}
                        </td>
                        <td style={{ padding: '14px', color: '#cbd5e1' }}>
                          {b.serviceTitle}
                        </td>
                        <td style={{ padding: '14px', color: '#cbd5e1' }}>
                          <div>{b.date}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                            {b.startTime} - {b.endTime || 'End'} ({b.durationHours}h)
                          </div>
                        </td>
                        <td style={{ padding: '14px', color: 'var(--neon-green)', fontSize: '0.85rem' }}>
                          {b.resourceName}
                        </td>
                        <td style={{ padding: '14px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
                          ₹{b.totalPrice || b.itemizedPrice?.total || 0}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span className={`badge-neon ${
                            b.status === 'confirmed' ? 'badge-green' :
                            b.status === 'pending' ? 'badge-gold' :
                            b.status === 'completed' ? 'badge-cyan' : 'badge-pink'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {b.status !== 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                                title="Confirm Booking"
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  background: 'rgba(0, 255, 136, 0.15)',
                                  border: '1px solid #00ff88',
                                  color: 'var(--neon-green)',
                                  cursor: 'pointer'
                                }}
                              >
                                <Check size={14} />
                              </button>
                            )}

                            {b.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'completed')}
                                title="Mark Completed"
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  background: 'rgba(0, 240, 255, 0.15)',
                                  border: '1px solid var(--neon-cyan)',
                                  color: 'var(--neon-cyan)',
                                  cursor: 'pointer'
                                }}
                              >
                                Done
                              </button>
                            )}

                            {b.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                title="Cancel / Reject"
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid #ef4444',
                                  color: '#f87171',
                                  cursor: 'pointer'
                                }}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PS5 GAMES MANAGER ================= */}
        {activeTab === 'games' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>
                PS5 Games Vault ({games.length} titles)
              </h3>
              <button onClick={openAddGameModal} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
                <Plus size={16} />
                Add New Game
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {games.map(game => (
                <div key={game.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: '180px' }}>
                    <img src={game.imageUrl} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                      <span className="badge-neon badge-cyan">{game.genre}</span>
                      <span className="badge-neon badge-green">{game.playerCount}</span>
                    </div>
                  </div>

                  <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '6px' }}>{game.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '14px', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {game.description}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                      <button 
                        onClick={() => openEditGameModal(game)}
                        className="btn-secondary"
                        style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteGame(game.id, game.title)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid #ef4444',
                          color: '#f87171',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PRICING CONFIG MANAGER ================= */}
        {activeTab === 'pricing' && pricingRates && (
          <div className="glass-panel" style={{ padding: '36px', maxWidth: '850px' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '8px', borderLeft: '3px solid var(--neon-cyan)', paddingLeft: '10px' }}>
              Service Rates & Pricing Engine
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
              Update base hourly rates, rental packages, and taxes stored in Firestore. All frontend forms and server calculations update instantly.
            </p>

            <form onSubmit={handleSavePricing}>
              
              {/* PS5 Gaming Rates */}
              <div style={{ marginBottom: '26px' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--neon-cyan)', marginBottom: '14px' }}>
                  1. PS5 Lounge Gaming Rates (₹)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Solo Hourly Rate (₹)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={pricingRates.ps5Gaming?.baseHourlyRateSolo || 150}
                      onChange={(e) => setPricingRates({
                        ...pricingRates,
                        ps5Gaming: { ...pricingRates.ps5Gaming, baseHourlyRateSolo: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Multiplayer 2P Rate (₹)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={pricingRates.ps5Gaming?.baseHourlyRateMulti || 220}
                      onChange={(e) => setPricingRates({
                        ...pricingRates,
                        ps5Gaming: { ...pricingRates.ps5Gaming, baseHourlyRateMulti: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Extra Player Hourly (₹)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={pricingRates.ps5Gaming?.extraPlayerHourly || 60}
                      onChange={(e) => setPricingRates({
                        ...pricingRates,
                        ps5Gaming: { ...pricingRates.ps5Gaming, extraPlayerHourly: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Theatre Rates */}
              <div style={{ marginBottom: '26px' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--electric-purple)', marginBottom: '14px' }}>
                  2. VIP Cinema Theatre Rates (₹)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Theatre Hourly Rate (₹)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={pricingRates.movieTheatre?.baseHourlyRate || 750}
                      onChange={(e) => setPricingRates({
                        ...pricingRates,
                        movieTheatre: { ...pricingRates.movieTheatre, baseHourlyRate: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Regular Snack Combo (₹)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={pricingRates.movieTheatre?.snackPackages?.regular || 250}
                      onChange={(e) => setPricingRates({
                        ...pricingRates,
                        movieTheatre: {
                          ...pricingRates.movieTheatre,
                          snackPackages: { ...pricingRates.movieTheatre?.snackPackages, regular: Number(e.target.value) }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Home Rental Rates */}
              <div style={{ marginBottom: '26px' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#ff007f', marginBottom: '14px' }}>
                  3. PS5 Home Rental Rates (₹)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>1-Day Daily Rate (₹)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={pricingRates.homeRental?.dailyRate || 1199}
                      onChange={(e) => setPricingRates({
                        ...pricingRates,
                        homeRental: { ...pricingRates.homeRental, dailyRate: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Weekend 3-Day Blast (₹)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={pricingRates.homeRental?.weekend3DayRate || 2899}
                      onChange={(e) => setPricingRates({
                        ...pricingRates,
                        homeRental: { ...pricingRates.homeRental, weekend3DayRate: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Refundable Deposit (₹)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={pricingRates.homeRental?.securityDeposit || 4000}
                      onChange={(e) => setPricingRates({
                        ...pricingRates,
                        homeRental: { ...pricingRates.homeRental, securityDeposit: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Tax rate */}
              <div style={{ marginBottom: '30px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>GST / Service Tax Rate (%)</label>
                <input 
                  type="number"
                  style={{ maxWidth: '200px' }}
                  className="form-control"
                  value={pricingRates.taxRatePercent || 5}
                  onChange={(e) => setPricingRates({ ...pricingRates, taxRatePercent: Number(e.target.value) })}
                />
              </div>

              <button 
                type="submit" 
                disabled={updatingPricing}
                className="btn-primary"
                style={{ padding: '14px 32px' }}
              >
                <Save size={18} />
                {updatingPricing ? 'Saving to Firestore...' : 'Save Pricing Rates'}
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 4: STATIONS & RESOURCES ================= */}
        {activeTab === 'resources' && (
          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px' }}>
              Station Status & Resource Controller
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {resources.map(res => (
                <div key={res.id} className="glass-panel" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '0.85rem' }}>
                      {res.id}
                    </span>
                    <span className={`badge-neon ${res.status === 'available' ? 'badge-green' : 'badge-pink'}`}>
                      {res.status === 'available' ? '● Operational' : '▲ Maintenance'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>
                    {res.name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                    Type: {res.type}
                  </div>

                  <button
                    onClick={() => handleToggleResource(res.id, res.status)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: res.status === 'available' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(0, 255, 136, 0.4)',
                      background: res.status === 'available' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 255, 136, 0.15)',
                      color: res.status === 'available' ? '#f87171' : 'var(--neon-green)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    {res.status === 'available' ? 'Set to Maintenance' : 'Mark Available'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: USERS MANAGER ================= */}
        {activeTab === 'users' && (
          <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '18px' }}>
              Registered Gamers & Roles ({usersList.length})
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0, 240, 255, 0.2)', color: 'var(--neon-cyan)' }}>
                  <th style={{ padding: '12px' }}>Name / Tag</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Phone</th>
                  <th style={{ padding: '12px' }}>Loyalty Points</th>
                  <th style={{ padding: '12px' }}>Assigned Role</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <td style={{ padding: '14px', fontWeight: 600, color: '#fff' }}>
                      {u.displayName || 'Gamer'}
                    </td>
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '14px', color: '#cbd5e1' }}>
                      {u.phone || 'N/A'}
                    </td>
                    <td style={{ padding: '14px', color: 'var(--gold-accent)', fontWeight: 600 }}>
                      {u.loyaltyPoints || 100} pts
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={`badge-neon ${u.role === 'admin' ? 'badge-pink' : 'badge-cyan'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= ADD / EDIT GAME MODAL ================= */}
        {showGameModal && (
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
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '30px',
              position: 'relative'
            }}>
              <button 
                onClick={() => setShowGameModal(false)}
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
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '20px' }}>
                {editingGame ? 'Edit PS5 Game' : 'Add New PS5 Game'}
              </h2>

              <form onSubmit={handleGameSubmit}>
                <div className="form-group">
                  <label className="form-label">Game Title</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control"
                    value={gameFormData.title}
                    onChange={(e) => setGameFormData({ ...gameFormData, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">Genre</label>
                    <select 
                      className="form-control"
                      value={gameFormData.genre}
                      onChange={(e) => setGameFormData({ ...gameFormData, genre: e.target.value })}
                    >
                      <option value="Action">Action</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Sports">Sports</option>
                      <option value="Racing">Racing</option>
                      <option value="Fighting">Fighting</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Player Count</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. 1-4 Players"
                      value={gameFormData.playerCount}
                      onChange={(e) => setGameFormData({ ...gameFormData, playerCount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Image URL</label>
                  <input 
                    type="url" 
                    required 
                    className="form-control"
                    value={gameFormData.imageUrl}
                    onChange={(e) => setGameFormData({ ...gameFormData, imageUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hardware Features (comma-separated)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={gameFormData.features}
                    onChange={(e) => setGameFormData({ ...gameFormData, features: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    rows="3" 
                    className="form-control"
                    value={gameFormData.description}
                    onChange={(e) => setGameFormData({ ...gameFormData, description: e.target.value })}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    {editingGame ? 'Save Changes' : 'Add to Catalogue'}
                  </button>
                  <button type="button" onClick={() => setShowGameModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= EXCEL SHEET VIEW & PRINT MODAL ================= */}
        {showExcelModal && (
          <div 
            className="excel-modal-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 8, 19, 0.92)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              overflowY: 'auto'
            }}
          >
            <div 
              className="excel-modal-content glass-panel"
              style={{
                maxWidth: '1240px',
                width: '100%',
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                background: '#0d1527',
                border: '1px solid #107c41',
                boxShadow: '0 0 35px rgba(16, 124, 65, 0.35)',
                borderRadius: '14px',
                overflow: 'hidden'
              }}
            >
              {/* Printable Letterhead (Visible ONLY when printed) */}
              <div className="print-only" style={{ display: 'none', padding: '10px 0 16px', borderBottom: '2px solid #000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '18pt', fontWeight: 800, color: '#000', letterSpacing: '-0.5px' }}>
                      BANDHILKI PS5 GAMING ZONE
                    </h1>
                    <p style={{ margin: '3px 0', fontSize: '10.5pt', fontWeight: 700, color: '#222' }}>
                      Official Bookings Register & Reservation Report
                    </p>
                    <p style={{ margin: '2px 0', fontSize: '8.5pt', color: '#444' }}>
                      Shop no 01, Samer seth building, near Vartak College Road, opposite Union Bank, Navghar Manikpur, Vishal Nagar, Vasai West, Mumbai 401202
                    </p>
                    <p style={{ margin: '2px 0', fontSize: '8.5pt', color: '#444' }}>
                      Phone: +91 8180807208 | Email: Eliteps5rental@gmail.com
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#333' }}>
                    <div><strong>Report Date:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    <div><strong>Printed At:</strong> {new Date().toLocaleTimeString('en-IN')}</div>
                    <div><strong>Total Bookings:</strong> {filteredBookings.length}</div>
                  </div>
                </div>
              </div>

              {/* Excel Ribbon Toolbar (Hidden during print) */}
              <div className="no-print" style={{
                padding: '16px 20px',
                background: 'linear-gradient(90deg, #0f2719 0%, #104423 100%)',
                borderBottom: '1px solid #107c41',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: '#107c41',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                  }}>
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Bookings Register - Excel Spreadsheet View
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600 }}>
                        {filteredBookings.length} rows
                      </span>
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#a7f3d0' }}>
                      Official spreadsheet register formatted for printing or downloading into Microsoft Excel.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handlePrintExcelSheet}
                    className="btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 18px',
                      fontSize: '0.88rem',
                      background: '#107c41',
                      border: '1px solid #28a745'
                    }}
                  >
                    <Printer size={16} />
                    Print Sheet (Ctrl+P)
                  </button>

                  <button
                    onClick={() => handleExportExcel(filteredBookings)}
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 16px',
                      fontSize: '0.88rem',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      color: 'var(--neon-green)'
                    }}
                  >
                    <FileSpreadsheet size={15} />
                    Download .XLSX (Excel)
                  </button>

                  <button
                    onClick={() => handleExportCSV(filteredBookings)}
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 16px',
                      fontSize: '0.88rem'
                    }}
                  >
                    <Download size={15} />
                    Download .CSV
                  </button>

                  <button
                    onClick={() => setShowExcelModal(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '6px'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Spreadsheet Grid Table */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                <table className="excel-sheet-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    {/* Excel Column Letters Header */}
                    <tr className="no-print" style={{ background: '#131e3a', color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center' }}>
                      <th style={{ border: '1px solid #1e293b', width: '36px', padding: '4px' }}>#</th>
                      <th style={{ border: '1px solid #1e293b', padding: '4px' }}>A</th>
                      <th style={{ border: '1px solid #1e293b', padding: '4px' }}>B</th>
                      <th style={{ border: '1px solid #1e293b', padding: '4px' }}>C</th>
                      <th style={{ border: '1px solid #1e293b', padding: '4px' }}>D</th>
                      <th style={{ border: '1px solid #1e293b', padding: '4px' }}>E</th>
                      <th style={{ border: '1px solid #1e293b', padding: '4px' }}>F</th>
                      <th style={{ border: '1px solid #1e293b', padding: '4px' }}>G</th>
                      <th style={{ border: '1px solid #1e293b', padding: '4px' }}>H</th>
                      <th style={{ border: '1px solid #1e293b', padding: '4px' }}>I</th>
                    </tr>
                    {/* Spreadsheet Column Titles */}
                    <tr style={{ background: '#107c41', color: '#ffffff', fontWeight: 700 }}>
                      <th className="no-print" style={{ border: '1px solid #185a30', width: '36px', padding: '8px', textAlign: 'center' }}>Row</th>
                      <th style={{ border: '1px solid #185a30', padding: '8px 10px' }}>Booking ID</th>
                      <th style={{ border: '1px solid #185a30', padding: '8px 10px' }}>Date & Slot</th>
                      <th style={{ border: '1px solid #185a30', padding: '8px 10px' }}>Service</th>
                      <th style={{ border: '1px solid #185a30', padding: '8px 10px' }}>Assigned Station</th>
                      <th style={{ border: '1px solid #185a30', padding: '8px 10px' }}>Customer Name</th>
                      <th style={{ border: '1px solid #185a30', padding: '8px 10px' }}>Contact Phone</th>
                      <th style={{ border: '1px solid #185a30', padding: '8px 10px', textAlign: 'right' }}>Total (₹)</th>
                      <th style={{ border: '1px solid #185a30', padding: '8px 10px', textAlign: 'center' }}>Status</th>
                      <th style={{ border: '1px solid #185a30', padding: '8px 10px' }}>Notes / Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                          No booking records found to display.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b, idx) => (
                        <tr 
                          key={b.id} 
                          style={{ 
                            background: idx % 2 === 0 ? 'rgba(16, 26, 56, 0.6)' : 'rgba(11, 18, 42, 0.4)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                          }}
                        >
                          <td className="no-print" style={{ border: '1px solid #1e293b', textAlign: 'center', color: '#64748b', fontSize: '0.78rem', padding: '8px 4px' }}>
                            {idx + 1}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '8px 10px', fontWeight: 600, color: 'var(--neon-cyan)', fontFamily: 'monospace' }}>
                            {b.id}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '8px 10px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600 }}>{b.date}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.startTime} - {b.endTime || 'End'} ({b.durationHours}h)</div>
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '8px 10px' }}>
                            {b.serviceTitle || b.service}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '8px 10px', color: '#a7f3d0' }}>
                            {b.resourceName || b.resourceId || 'Station'}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '8px 10px' }}>
                            <div style={{ fontWeight: 600 }}>{b.userName || 'Gamer'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.userEmail}</div>
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '8px 10px', color: '#fde047' }}>
                            {b.userPhone || '—'}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                            ₹{(b.totalPrice || b.itemizedPrice?.total || 0).toLocaleString()}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '8px 10px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: b.status === 'confirmed' ? '#065f46' : b.status === 'completed' ? '#0369a1' : b.status === 'pending' ? '#854d0e' : '#991b1b',
                              color: '#fff'
                            }}>
                              {b.status}
                            </span>
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '8px 10px', fontSize: '0.78rem', color: '#cbd5e1', maxWidth: '180px' }}>
                            {b.notes || b.details?.specialNotes || '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    {/* Summary Totals Row */}
                    <tr style={{ background: '#131e3a', fontWeight: 700, borderTop: '2px solid #107c41' }}>
                      <td className="no-print" style={{ border: '1px solid #1e293b', textAlign: 'center', padding: '10px 4px', color: '#94a3b8' }}>Σ</td>
                      <td colSpan="6" style={{ border: '1px solid #1e293b', padding: '10px', textAlign: 'right', color: '#fff' }}>
                        Total Cumulative Revenue ({filteredBookings.length} records):
                      </td>
                      <td style={{ border: '1px solid #1e293b', padding: '10px', textAlign: 'right', color: 'var(--neon-green)', fontSize: '1rem', fontWeight: 800 }}>
                        ₹{filteredBookings.reduce((sum, b) => sum + (b.totalPrice || b.itemizedPrice?.total || 0), 0).toLocaleString()}
                      </td>
                      <td colSpan="2" style={{ border: '1px solid #1e293b', padding: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>
                        Confirmed: {filteredBookings.filter(b => b.status === 'confirmed').length} | Completed: {filteredBookings.filter(b => b.status === 'completed').length}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Printable Signatory Section (Visible ONLY when printed) */}
                <div className="print-only" style={{ display: 'none', marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #666' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', color: '#333' }}>
                    <div>
                      <div><strong>Generated by:</strong> Bandhilki Lounge Administrator</div>
                      <div>Bandhilki PS5 Gaming Zone & Home Rentals, Vasai West</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ borderBottom: '1px solid #000', width: '200px', height: '35px', marginBottom: '4px' }}></div>
                      <div>Authorized Signature & Official Stamp</div>
                    </div>
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
