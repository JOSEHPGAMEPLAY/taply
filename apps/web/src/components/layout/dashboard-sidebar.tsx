'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import Link from 'next/link';
import { type ComponentType } from 'react';

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

export interface DashboardSidebarProps {
  navItems: NavItem[];
  user: { name?: string; email?: string };
  activePath: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({
  navItems,
  user,
  activePath,
  onLogout,
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-200',
          'lg:z-40 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <div className="flex items-center gap-2">
              <img src="/brand/isotipo.svg" alt="Taply" className="w-9 h-9" />
              <span className="text-xl font-bold text-gray-900">Taply</span>
            </div>
            {/* Close button - mobile only */}
            <button
              onClick={onClose}
              aria-label="Cerrar menú"
              className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav aria-label="Navegación principal" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
