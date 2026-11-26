'use client';

import { Menu, Moon, Sun } from 'lucide-react';
import { type ReactNode } from 'react';

export interface DashboardHeaderProps {
  title: string;
  onMenuClick: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  rightContent?: ReactNode;
}

export function DashboardHeader({ title, onMenuClick, theme, onThemeToggle, rightContent }: DashboardHeaderProps) {
  const isDark = theme === 'dark';

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {rightContent}
          <button
            type="button"
            onClick={onThemeToggle}
            aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
            aria-pressed={isDark}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {isDark ? <Sun aria-hidden="true" className="h-5 w-5" /> : <Moon aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
