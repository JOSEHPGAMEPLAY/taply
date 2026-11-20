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
  dismissSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Proveedor del contexto de autenticación.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // Hydratar usuario desde localStorage inmediatamente para evitar parpadeo
  const savedUser = typeof window !== 'undefined' 
    ? (() => {
        try {
          const token = localStorage.getItem('accessToken');
          const storedUser = localStorage.getItem('taply_user');
          if (token && storedUser) {
            return JSON.parse(storedUser);
          }
        } catch {}
        return null;
      })()
    : null;
  
  const [user, setUser] = useState<{ id: string; email: string; name: string; role: string } | null>(savedUser);
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  let autoRedirectTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Limpia tokens y muestra modal de sesión expirada.
   * Solo se muestra en rutas protegidas (/app/*), nunca en login/register.
   */
  const handleSessionExpired = useCallback(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // No mostrar modal en login o register
    if (pathname === '/login' || pathname === '/register') {
      return;
    }
    
    setSessionExpired(true);
    autoRedirectTimer = setTimeout(() => {
      router.push('/login');
    }, 5000);
  }, [router]);

  /**
   * Cierra el modal de sesión expirada y redirige al login inmediatamente.
   */
  const dismissSessionExpired = useCallback(() => {
    if (autoRedirectTimer !== null) {
      clearTimeout(autoRedirectTimer);
      autoRedirectTimer = null;
    }
    setSessionExpired(false);
    router.push('/login');
  }, [router]);

  /**
   * Verifica si hay un token válido al cargar la app.
   * Solo se ejecuta una vez al montar el componente (no en cada navegación).
   * Las páginas públicas (/, /p/[slug], /t/[token]) no validan token.
   * No usa loading state para evitar parpadeos al navegar.
   */
  useEffect(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    // Rutas protegidas que requieren autenticación
    const isProtectedRoute = pathname.startsWith('/app') || pathname === '/login' || pathname === '/register';

    // Si no es una ruta protegida, no validamos token
    if (!isProtectedRoute) {
      return;
    }

    // Si estamos en login o register y ya hay un usuario válido, redirigir al dashboard
    if ((pathname === '/login' || pathname === '/register') && localStorage.getItem('accessToken')) {
      api.getMe()
        .then((u) => {
          setUser(u);
          localStorage.setItem('taply_user', JSON.stringify(u));
          router.push('/app');
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('taply_user');
          setUser(null);
        });
      return;
    }

    api.getMe()
      .then((u) => {
        setUser(u);
        localStorage.setItem('taply_user', JSON.stringify(u));
      })
      .catch((err) => {
        // Token inválido o expirado: limpiar tokens y notificar al usuario
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('taply_user');
        setUser(null);

        // Si el error ya fue manejado por api.ts, solo limpiar
        if (err instanceof SessionExpiredError) {
          return;
        }
        handleSessionExpired();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Inicia sesión y almacena el token.
   */
  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login({ email, password });
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    const u = result.user as { id: string; email: string; name: string; role: string };
    localStorage.setItem('taply_user', JSON.stringify(u));
    setUser(u);
    setSessionExpired(false);
    router.push('/app');
  }, [router]);

  /**
   * Registra un nuevo usuario.
   */
  const register = useCallback(async (email: string, password: string, name: string) => {
    const result = await api.register({ email, password, name });
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    const u = result.user as { id: string; email: string; name: string; role: string };
    localStorage.setItem('taply_user', JSON.stringify(u));
    setUser(u);
    router.push('/app');
  }, [router]);

  /**
   * Cierra sesión y elimina los tokens.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('taply_user');
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, sessionExpired, dismissSessionExpired }}>
      {children}
      {/* Modal de sesión expirada - solo en rutas protegidas */}
      {sessionExpired && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sesión expirada</h3>
            <p className="text-sm text-gray-500 mb-6">Tu sesión ha vencido por inactividad. Inicia sesión nuevamente para continuar.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={dismissSessionExpired}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Ir al Login
              </button>
              <button
                onClick={() => {
                  if (autoRedirectTimer !== null) {
                    clearTimeout(autoRedirectTimer);
                    autoRedirectTimer = null;
                  }
                  setSessionExpired(false);
                }}
                className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cerrar
              </button>
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
