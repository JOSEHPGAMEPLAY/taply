"use client";

import { AuthProvider } from '@/lib/auth-context';

/**
 * Client providers wrapper para el root layout.
 * Envuelve toda la app con AuthProvider para que el estado
 * del usuario persista entre navegaciones sin re-montar.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
