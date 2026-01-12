import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://etoiles-hore-koubi.up.railway.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Members API
export const membersAPI = {
  getAll: (filters = {}) => api.get('/members', { params: filters }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
};

// Contributions API
export const contributionsAPI = {
  getAll: (filters = {}) => api.get('/contributions', { params: filters }),
  getById: (id) => api.get(`/contributions/${id}`),
  getStats: (filters = {}) => api.get('/contributions/stats/summary', { params: filters }),
  getStatsByType: (filters = {}) => api.get('/contributions/stats/by-type', { params: filters }),
  getCelebrants: () => api.get('/contributions/celebrants'),
  create: (data) => api.post('/contributions', data),
  update: (id, data) => api.put(`/contributions/${id}`, data),
  delete: (id) => api.delete(`/contributions/${id}`),
};

// Reports API
export const reportsAPI = {
  monthly: (date_debut, date_fin) => {
    return api.get('/reports/monthly', {
      params: { date_debut, date_fin },
      responseType: 'blob',
    });
  },
  member: (memberId, filters = {}) => {
    return api.get(`/reports/member/${memberId}`, {
      params: filters,
      responseType: 'blob',
    });
  },
  event: (type, filters = {}) => {
    return api.get(`/reports/event/${type}`, {
      params: filters,
      responseType: 'blob',
    });
  },
  members: (filters = {}) => {
    return api.get('/reports/members', {
      params: filters,
      responseType: 'blob',
    });
  },
  contributions: (filters = {}) => {
    return api.get('/reports/contributions', {
      params: filters,
      responseType: 'blob',
    });
  },
};

export default api;

