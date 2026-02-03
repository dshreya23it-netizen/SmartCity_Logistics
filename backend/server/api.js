// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get Firebase token
const getAuthToken = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.accessToken || '';
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Product API calls
export const productAPI = {
  // Get all products
  getAll: async (params = {}) => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  // Get single product
  getById: async (id) => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },

  // Create product
  create: async (productData) => {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },

  // Update product
  update: async (id, productData) => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  delete: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Get category statistics
  getCategoryStats: async () => {
    const response = await api.get('/admin/products/stats/category');
    return response.data;
  },

  // Search products
  search: async (query) => {
    const response = await api.get(`/admin/products/search/${query}`);
    return response.data;
  },

  // Bulk update stock
  bulkUpdateStock: async (updates) => {
    const response = await api.post('/admin/products/bulk/update-stock', { updates });
    return response.data;
  }
};

// User API calls
export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Get all users (admin only)
  getAll: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  }
};

// Order API calls
export const orderAPI = {
  // Create order
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get user orders
  getUserOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Get all orders (admin)
  getAll: async (params) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  }
};

export default api;