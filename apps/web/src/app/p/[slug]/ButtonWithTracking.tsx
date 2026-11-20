'use client';

import { getIconByKey } from '@/lib/icon-map';
import { ArrowUpRight } from 'lucide-react';

/**
 * Botón con tracking de clicks para la página pública.
 * Registra un evento BUTTON_CLICK antes de redirigir al URL del botón.
 * Diseño moderno con glassmorphism y soporte para personalización.
 */
export default function ButtonWithTracking({
  buttonKey,
  label,
  url,
  icon,
  pageId,
  buttonShape,
}: {
  buttonKey: string;
  label: string;
  url: string;
  icon?: string;
  pageId: string;
  buttonShape?: string;
}) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!pageId) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Registrar el evento BUTTON_CLICK de forma asíncrona
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    fetch(`${apiUrl}/public/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageId,
        type: 'BUTTON_CLICK',
        buttonKey,
      }),
      keepalive: true,
    }).catch(() => {});

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Buscar el icono en el mapeo de lucide-react
  const iconInfo = icon ? getIconByKey(icon) : undefined;
  const IconComponent = iconInfo?.component;

  const shapeClass = buttonShape || 'rounded-2xl';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`block w-full bg-white/10 backdrop-blur-sm border border-white/10 p-4 text-left hover:bg-white/20 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group ${shapeClass}`}
    >
      <div className="flex items-center gap-3">
        {IconComponent ? (
          <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
            <IconComponent className="w-5 h-5 text-white" />
          </div>
        ) : icon ? (
          <span className="text-xl">{icon}</span>
        ) : (
          <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl">
            <ArrowUpRight className="w-5 h-5 text-white/60" />
          </div>
        )}
        <span className="flex-1 font-medium text-white group-hover:text-white transition-colors">
          {label}
        </span>
        <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
    </button>
  );
}
