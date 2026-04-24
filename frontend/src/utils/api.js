import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('ipl_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ipl_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const matchesAPI = {
  getAll: (params) => api.get('/matches', { params }),
  getById: (id) => api.get(`/matches/${id}`),
  seed: () => api.post('/matches/seed')
};

export const seatsAPI = {
  getByMatch: (matchId) => api.get(`/seats/${matchId}`),
  holdSeats: (matchId, seatIds) => api.post(`/seats/${matchId}/hold`, { seatIds }),
  releaseSeats: (matchId) => api.post(`/seats/${matchId}/release`),
  generateSeats: (matchId) => api.post(`/seats/${matchId}/generate`)
};

export const bookingsAPI = {
  getMyBookings: () => api.get('/bookings/my'),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings/create', data),
  confirm: (id, paymentIntentId) => api.post(`/bookings/${id}/confirm`, { paymentIntentId }),
  cancel: (id) => api.post(`/bookings/${id}/cancel`)
};

export const paymentsAPI = {
  createIntent: (bookingId) => api.post('/payments/create-intent', { bookingId }),
  verify: (paymentIntentId, bookingId) => api.post('/payments/verify', { paymentIntentId, bookingId })
};

export default api;
