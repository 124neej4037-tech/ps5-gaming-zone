const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let activeToken = null;

export function setAuthToken(token) {
  activeToken = token;
}

export function getAuthToken() {
  return activeToken || localStorage.getItem('bandhilki_auth_token');
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  syncUser: (data) => request('/auth/sync', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/auth/profile'),
  setUserRole: (targetUserId, role) => request('/auth/set-role', { method: 'POST', body: JSON.stringify({ targetUserId, role }) }),

  // Games Catalogue
  getGames: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/games${query ? `?${query}` : ''}`);
  },
  getGame: (id) => request(`/games/${id}`),
  createGame: (gameData) => request('/games', { method: 'POST', body: JSON.stringify(gameData) }),
  updateGame: (id, updates) => request(`/games/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteGame: (id) => request(`/games/${id}`, { method: 'DELETE' }),

  // Pricing
  getPricing: () => request('/pricing'),
  calculatePrice: (service, options) => request('/pricing/calculate', { 
    method: 'POST', 
    body: JSON.stringify({ service, options }) 
  }),
  updatePricing: (rates) => request('/pricing', { method: 'PUT', body: JSON.stringify(rates) }),

  // Bookings
  checkAvailability: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bookings/availability?${query}`);
  },
  createBooking: (bookingData) => request('/bookings', { 
    method: 'POST', 
    body: JSON.stringify(bookingData) 
  }),
  getMyBookings: () => request('/bookings/my-bookings'),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PUT' }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/bookings${query ? `?${query}` : ''}`);
  },
  updateBookingStatus: (id, status, adminNotes = '') => request(`/admin/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, adminNotes })
  }),
  getResources: () => request('/admin/resources'),
  updateResource: (id, data) => request(`/admin/resources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getUsers: () => request('/admin/users'),

  // AI Assistant
  getAIRecommendation: (preferences) => request('/ai/recommend', {
    method: 'POST',
    body: JSON.stringify(preferences)
  })
};

export default api;
