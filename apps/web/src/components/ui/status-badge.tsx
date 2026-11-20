'use client';

import { cn } from '@/lib/utils';

export type StatusBadgeVariant = 'published' | 'draft' | 'paused' | 'archived' | 'active' | 'suspended' | 'prospect' | 'closed' | 'default';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  PUBLISHED: { label: 'Publicada', classes: 'bg-green-100 text-green-700' },
  DRAFT: { label: 'Borrador', classes: 'bg-gray-100 text-gray-700' },
  PAUSED: { label: 'Pausada', classes: 'bg-yellow-100 text-yellow-700' },
  ARCHIVED: { label: 'Archivada', classes: 'bg-red-100 text-red-700' },
  ACTIVE: { label: 'Activo', classes: 'bg-green-100 text-green-700' },
  SUSPENDED: { label: 'Suspendido', classes: 'bg-red-100 text-red-700' },
  PROSPECT: { label: 'Prospecto', classes: 'bg-blue-100 text-blue-700' },
  CLOSED: { label: 'Cerrado', classes: 'bg-gray-100 text-gray-600' },
  INVENTORY: { label: 'Inventario', classes: 'bg-purple-100 text-purple-700' },
  PROGRAMMED: { label: 'Programado', classes: 'bg-blue-100 text-blue-700' },
  ACTIVE_TAG: { label: 'Activo', classes: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Inactivo', classes: 'bg-gray-100 text-gray-600' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toUpperCase()] || { label: status, classes: 'bg-gray-100 text-gray-700' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
