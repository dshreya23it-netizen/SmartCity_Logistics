// frontend/src/hooks/useMongoDB.js
import { useState, useEffect } from 'react';
import { productAPI, dashboardAPI } from '../services/api';

export function useProducts(page = 1, limit = 20, filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await productAPI.getProducts(page, limit, filters);
      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination || {
          page,
          limit,
          total: response.data.length,
          totalPages: 1
        });
      }
    } catch (err) {
      setError('Failed to fetch products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, JSON.stringify(filters)]);

  return { products, loading, error, pagination, refetch: fetchProducts };
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSensors: 0,
    activeSensors: 0,
    lowStock: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
}