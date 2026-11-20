'use client';

import { cn } from '@/lib/utils';
import { Check, AlertCircle, Info, XCircle } from 'lucide-react';
import { type ReactNode } from 'react';

export type AlertVariant = 'success' | 'error' | 'info' | 'warning';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message?: string;
  children?: ReactNode;
  onClose?: () => void;
}

const variantConfig: Record<AlertVariant, {
  bg: string;
  border: string;
  icon: typeof Check;
  iconColor: string;
  text: string;
  titleText: string;
}> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: Check,
    iconColor: 'text-green-600',
    text: 'text-green-700',
    titleText: 'text-green-800',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600',
    text: 'text-red-700',
    titleText: 'text-red-800',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Info,
    iconColor: 'text-blue-600',
    text: 'text-blue-700',
    titleText: 'text-blue-800',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
    text: 'text-yellow-700',
    titleText: 'text-yellow-800',
  },
};

export function Alert({ variant = 'info', title, message, children, onClose }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-xl border p-4 flex items-start gap-3', config.bg, config.border)}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <p className={cn('text-sm font-semibold', config.titleText)}>{title}</p>}
        {message && <p className={cn('text-sm', config.text)}>{message}</p>}
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
