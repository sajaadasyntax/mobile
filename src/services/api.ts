import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    return response.data;
  },
};

export const auditAPI = {
  getAuditLogs: async (params?: any) => {
    const response = await api.get('/accounting/audit-logs', { params });
    return response.data;
  },
};

export const reportingAPI = {
  getBalanceSummary: async () => {
    const response = await api.get('/accounting/balance/summary');
    return response.data;
  },
  
  getSalesInvoices: async (params?: any) => {
    const response = await api.get('/sales/invoices', { params });
    return response.data;
  },
  
  getProcurementOrders: async (params?: any) => {
    const response = await api.get('/procurement/orders', { params });
    return response.data;
  },
  
  getExpenses: async (params?: any) => {
    const response = await api.get('/accounting/expenses', { params });
    return response.data;
  },
  
  getInventories: async () => {
    const response = await api.get('/inventories');
    return response.data;
  },
  
  getItems: async (section?: string) => {
    const response = await api.get('/items', { params: { section } });
    return response.data;
  },
};

export default api;

