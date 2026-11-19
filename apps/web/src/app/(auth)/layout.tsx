"use client";

import { AuthProvider } from '@/lib/auth-context';

/**
 * Layout para las páginas de autenticación (login, register).
 * Envuelve el contenido con AuthProvider para que useAuth() funcione.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>{children}</AuthProvider>
  );
}
