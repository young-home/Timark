import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi } from '../api';

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ token: string; user: User }>;
  register: (email: string, password: string, displayName: string) => Promise<{ token: string; user: User }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children, onLogoutCallback }: { children: ReactNode; onLogoutCallback?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.userId,
          email: payload.email,
          displayName: payload.displayName || payload.email.split('@')[0],
        });
      } catch {
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);

    // 监听其他标签页的登出事件
    const handler = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (email: string, password: string, displayName: string) => {
    const data = await authApi.register(email, password, displayName);
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    if (onLogoutCallback) {
      onLogoutCallback();
    }
  }, [onLogoutCallback]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
