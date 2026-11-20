"use client";

import { useAuth } from '@/lib/auth-context';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home,
  Building2,
  FileText,
  Radio,
  BarChart3,
  LayoutTemplate,
  Shield,
} from 'lucide-react';

/**
 * Layout del dashboard con sidebar y header componentizados.
 * El AuthProvider está en el root layout para persistir entre navegaciones.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hidratar usuario desde localStorage inmediatamente para evitar página en blanco
  // cuando login() redirige a /app antes de que el contexto propague el estado
  const [hydratedUser, setHydratedUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('taply_user');
      if (stored) {
        setHydratedUser(JSON.parse(stored));
      }
    } catch { /* ignore */ }
  }, []);

  // Usar el usuario del contexto si está disponible, sino usar el hidratado de localStorage
  const effectiveUser = user || hydratedUser;

  // Actualizar el title de la pestaña del navegador para el dashboard
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Taply Dashboard — Soluciones digitales. Un solo toque.';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // Verificar si hay token en localStorage (solo en cliente)
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken') !== null;

  // Redirigir al login solo si no hay usuario en contexto Y no hay token en localStorage
  useEffect(() => {
    if (!user && !hasToken) {
      router.push('/login');
    }
  }, [user, router, hasToken]);

  // Si no hay usuario ni en contexto ni en localStorage, mostrar loading mientras se verifica
  if (!effectiveUser && !hasToken) {
    return null;
  }

  const navItems = [
    { href: '/app', label: 'Dashboard', icon: Home },
    { href: '/app/businesses', label: 'Negocios', icon: Building2 },
    { href: '/app/pages', label: 'Páginas', icon: FileText },
    { href: '/app/templates', label: 'Templates', icon: LayoutTemplate },
    { href: '/app/nfc-tags', label: 'NFC Tags', icon: Radio },
    { href: '/app/analytics', label: 'Analíticas', icon: BarChart3 },
    ...(effectiveUser?.role === 'ADMIN' ? [{ href: '/app/admin/users', label: 'Usuarios', icon: Shield }] : []),
  ];

  const pageTitle = navItems.find((item) => item.href === pathname)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar
        navItems={navItems}
        user={{ name: effectiveUser?.name, email: effectiveUser?.email }}
        activePath={pathname}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <DashboardHeader
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
