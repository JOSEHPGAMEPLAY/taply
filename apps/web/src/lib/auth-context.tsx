"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

/**
 * Contexto de autenticación para el frontend.
 * Maneja el estado del usuario, login, logout y protección de rutas.
 */

interface AuthContextType {
  user: { id: string; email: string; name: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Proveedor del contexto de autenticación.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Verifica si hay un token válido al cargar la app.
   */
  useEffect(() => {
    api.getMe()
      .then((u) => {
        setUser(u);
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * Inicia sesión y almacena el token.
   */
  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login({ email, password });
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    setUser(result.user as { id: string; email: string; name: string });
  }, []);

  /**
   * Registra un nuevo usuario.
   */
  const register = useCallback(async (email: string, password: string, name: string) => {
    const result = await api.register({ email, password, name });
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    setUser(result.user as { id: string; email: string; name: string });
  }, []);

  /**
   * Cierra sesión y elimina los tokens.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticación.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
