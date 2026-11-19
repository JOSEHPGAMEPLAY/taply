"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { SessionExpiredError } from '@/lib/session-error';

/**
 * Contexto de autenticación para el frontend.
 * Maneja el estado del usuario, login, logout y protección de rutas.
 */

interface AuthContextType {
  user: { id: string; email: string; name: string; role: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  sessionExpired: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Proveedor del contexto de autenticación.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  /**
   * Limpia tokens y redirige al login con un breve mensaje de sesión expirada.
   * Evita el bucle infinito verificando si ya estamos en la página de login.
   */
  const handleSessionExpired = useCallback(() => {
    // Ya limpiamos los tokens
    // Mostrar mensaje al usuario antes de redirigir
    setSessionExpired(true);
    // Redirigir después de 1.5 segundos para que el usuario vea el mensaje
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  }, [router]);

  /**
   * Verifica si hay un token válido al cargar la app.
   */
  useEffect(() => {
    // Si ya estamos en la página de login, no intentamos validar el token
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      setLoading(false);
      return;
    }

    api.getMe()
      .then((u) => {
        setUser(u);
      })
      .catch((err) => {
        // Token inválido o expirado: limpiar tokens y notificar al usuario
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);

        // Si el error ya fue manejado por api.ts (redirección), no hacemos nada
        // De lo contrario, mostrar el mensaje de sesión expirada
        if (err instanceof SessionExpiredError) {
          // Ya se manejó en api.ts, solo limpiar
          return;
        }
        handleSessionExpired();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [handleSessionExpired]);

  /**
   * Inicia sesión y almacena el token.
   */
  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login({ email, password });
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    setUser(result.user as { id: string; email: string; name: string; role: string });
    setSessionExpired(false);
  }, []);

  /**
   * Registra un nuevo usuario.
   */
  const register = useCallback(async (email: string, password: string, name: string) => {
    const result = await api.register({ email, password, name });
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    setUser(result.user as { id: string; email: string; name: string; role: string });
  }, []);

  /**
   * Cierra sesión y elimina los tokens.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, sessionExpired }}>
      {children}
      {/* Modal de sesión expirada */}
      {sessionExpired && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sesión expirada</h3>
            <p className="text-sm text-gray-500 mb-4">Tu sesión ha vencido por inactividad. Serás redirigido al login.</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}
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
