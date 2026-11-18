'use client';

/**
 * Botón con tracking de clicks para la página pública.
 * Registra un evento BUTTON_CLICK antes de redirigir al URL del botón.
 */
export default function ButtonWithTracking({
  buttonKey,
  label,
  url,
  icon,
  pageId,
}: {
  buttonKey: string;
  label: string;
  url: string;
  icon?: string;
  pageId: string;
}) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!pageId) {
      // Sin pageId, solo redirigir
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
      // keepAlive asegura que la petición se complete aunque la navegación empiece
      keepalive: true,
    }).catch(() => {
      // Silenciar errores: no queremos bloquear la redirección
    });

    // Redirigir al URL del botón
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="block w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-left hover:shadow-md hover:border-blue-200 transition-all group"
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {label}
        </span>
        <span className="ml-auto text-gray-400 group-hover:text-blue-500">→</span>
      </div>
    </button>
  );
}
