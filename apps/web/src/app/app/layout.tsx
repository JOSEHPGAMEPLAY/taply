"use client";

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect } from 'react';
import {
  Home,
  Building2,
  FileText,
  Radio,
  BarChart3,
  LayoutTemplate,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useState } from 'react';

/**
 * Layout del dashboard con sidebar y header.
 * Diseño profesional con iconos y navegación clara.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Actualizar el title de la pestaña del navegador para el dashboard
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Taply Dashboard — Soluciones digitales. Un solo toque.';
    return () => {
      document.title = originalTitle;
    };
  }, []);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/app', label: 'Dashboard', icon: Home },
    { href: '/app/businesses', label: 'Negocios', icon: Building2 },
    { href: '/app/pages', label: 'Páginas', icon: FileText },
    { href: '/app/templates', label: 'Templates', icon: LayoutTemplate },
    { href: '/app/nfc-tags', label: 'NFC Tags', icon: Radio },
    { href: '/app/analytics', label: 'Analíticas', icon: BarChart3 },
    ...(user?.role === 'ADMIN' ? [{ href: '/app/admin/users', label: 'Usuarios', icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/brand/isotipo.svg" alt="Taply" width={36} height={36} className="w-9 h-9" />
              <span className="text-xl font-bold text-gray-900">Taply</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={logout}>
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
