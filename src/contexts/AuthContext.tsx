import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const data = await authAPI.login(username, password);
      
      // Check if user is AUDITOR
      if (data.user.role !== 'AUDITOR') {
        throw new Error('هذا التطبيق مخصص للمراجعين فقط');
      }
      
      await AsyncStorage.setItem('authToken', data.token || '');
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'فشل تسجيل الدخول');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

