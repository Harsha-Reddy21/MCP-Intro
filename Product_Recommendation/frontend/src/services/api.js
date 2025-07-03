import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, username, password) => api.post('/auth/register', { email, username, password }),
};

export const productService = {
  getProducts: (category, skip = 0, limit = 50) => 
    api.get('/products', { params: { category, skip, limit } }),
  getProduct: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
};

export const interactionService = {
  trackInteraction: (productId, interactionType, rating = null) =>
    api.post('/interactions', {
      product_id: productId,
      interaction_type: interactionType,
      rating
    }),
};

export const recommendationService = {
  getRecommendations: (limit = 10) =>
    api.get('/recommendations', { params: { limit } }),
}; 