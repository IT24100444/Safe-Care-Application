import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safecare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid or expired - clear local storage if on a protected route
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        // can redirect or clear
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  getDemoAccounts: () => api.get('/auth/demo-accounts')
};

export const facilityAPI = {
  getAll: (params) => api.get('/facilities', { params }),
  getById: (id) => api.get(`/facilities/${id}`),
  create: (data) => api.post('/facilities', data),
  update: (id, data) => api.put(`/facilities/${id}`, data),
  delete: (id) => api.delete(`/facilities/${id}`)
};

export const serviceAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`)
};

export const statusAPI = {
  getAll: (params) => api.get('/statuses', { params }),
  getByFacilityId: (facilityId) => api.get(`/statuses/facility/${facilityId}`),
  update: (data) => api.post('/statuses', data),
  delete: (id) => api.delete(`/statuses/${id}`)
};

export const careRequestAPI = {
  getAll: (params) => api.get('/care-requests', { params }),
  getById: (id) => api.get(`/care-requests/${id}`),
  create: (data) => api.post('/care-requests', data),
  update: (id, data) => api.put(`/care-requests/${id}`, data),
  delete: (id) => api.delete(`/care-requests/${id}`),
  previewRecommendations: (data) => api.post('/care-requests/preview-recommendations', data)
};

export default api;
