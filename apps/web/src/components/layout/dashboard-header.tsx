'use client';

import { Menu } from 'lucide-react';
import { type ReactNode } from 'react';

export interface DashboardHeaderProps {
  title: string;
  onMenuClick: () => void;
  rightContent?: ReactNode;
}

export function DashboardHeader({ title, onMenuClick, rightContent }: DashboardHeaderProps) {
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
        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
}
