import Link from 'next/link';
import ButtonWithTracking from './ButtonWithTracking';

/**
 * Página pública de un negocio — Rediseñada con UX/UI moderna.
 * Carga datos reales de la API pública y muestra perfil, botones y registra PAGE_VIEW.
 * Cada click en un botón registra un evento BUTTON_CLICK antes de redirigir.
 * Soporta personalización mediante templates (colores, fondo, logo, forma de botones).
 */
export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Server Component: usa API_INTERNAL_URL (Docker) o NEXT_PUBLIC_API_URL (dev local)
  const apiUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  let data: any = null;
  let error: string | null = null;

  try {
    const res = await fetch(`${apiUrl}/public/pages/${slug}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      data = await res.json();
    } else {
      const err = await res.json().catch(() => null);
      error = err?.error || 'Error al cargar la página';
    }
  } catch {
    error = 'No se pudo conectar con el servidor';
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white/5 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-white/10">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Página no disponible</h2>
          <p className="mt-3 text-gray-400">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm font-semibold border border-white/10"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const business = data?.business;
  const pageId = data?.page?.id;
  const rawButtons = data?.publishedVersion?.buttons;
  const allButtons: Array<{ key: string; label: string; url: string; icon?: string; hidden?: boolean }> = Array.isArray(rawButtons) ? rawButtons : [];
  // Filtrar botones ocultos: solo mostrar los visibles en la página pública
  const buttons = allButtons.filter(btn => !btn.hidden);
  const pageConfig = data?.publishedVersion?.config || {};
  const initial = business?.name?.charAt(0)?.toUpperCase() || slug.charAt(0).toUpperCase();

  // Template configuration
  const template = pageConfig.template || {};
  const bgColor = typeof template.bgColor === 'string' && /^#[0-9a-f]{6}$/i.test(template.bgColor)
    ? template.bgColor
    : '#0f172a';
  const hasCustomBackgroundColor = bgColor !== '#0f172a' && !template.bgGradient;
  const bgGradient = template.bgGradient || (hasCustomBackgroundColor ? '' : 'from-gray-900 via-slate-900 to-gray-900');
  const colorChannels = bgColor.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  const isLightBackground = Boolean(
    (colorChannels && (parseInt(colorChannels[1], 16) * 299 + parseInt(colorChannels[2], 16) * 587 + parseInt(colorChannels[3], 16) * 114) / 1000 > 160)
    || /(?:from|via|to)-(?:gray-50|blue-50|cyan-50|pink-50|rose-50|white)/.test(bgGradient),
  );
  const primaryColor = typeof template.primaryColor === 'string' && /^#[0-9a-f]{6}$/i.test(template.primaryColor)
    ? template.primaryColor
    : '#3b82f6';
  const buttonStyle = template.buttonStyle || 'rounded'; // rounded, square, pill
  const shapeMap: Record<string, string> = {
    rounded: 'rounded-2xl',
    square: 'rounded-lg',
    pill: 'rounded-full',
  };
  const buttonShapeClass = shapeMap[buttonStyle] || 'rounded-2xl';

  return (
    <div
      className={`min-h-screen ${bgGradient ? `bg-gradient-to-br ${bgGradient}` : ''} relative overflow-hidden`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <main className="relative max-w-lg mx-auto px-4 py-8 sm:py-12">
        {/* Profile section */}
        <div className="text-center mb-8">
          {/* Logo / Avatar */}
          {template.logoUrl ? (
            <img
              src={template.logoUrl}
              alt={business?.name || slug}
              className="w-24 h-24 rounded-2xl mx-auto object-cover shadow-2xl border-2 border-white/10"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center shadow-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white/10">
              <span className="text-white text-3xl font-bold">{initial}</span>
            </div>
          )}

          {/* Business info */}
          <h1 className={`mt-6 text-2xl sm:text-3xl font-bold tracking-tight ${isLightBackground ? 'text-gray-900' : 'text-white'}`}>
            {business?.name || slug}
          </h1>
          {business?.description && (
            <p className={`mt-2 max-w-sm mx-auto text-sm leading-relaxed ${isLightBackground ? 'text-gray-600' : 'text-gray-400'}`}>
              {business.description}
            </p>
          )}
        </div>

        {/* Buttons section */}
        <div className="space-y-3">
          {buttons.length > 0 ? (
            buttons.map((btn) => (
              <ButtonWithTracking
                key={btn.key}
                label={btn.label}
                url={btn.url}
                icon={btn.icon}
                pageId={pageId || ''}
                buttonKey={btn.key}
                buttonShape={buttonShapeClass}
                isLightBackground={isLightBackground}
                primaryColor={primaryColor}
              />
            ))
          ) : (
            <div className={`${isLightBackground ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'} backdrop-blur-sm rounded-2xl border p-8 text-center`}>
              <div className={`w-12 h-12 ${isLightBackground ? 'bg-black/5' : 'bg-white/5'} rounded-xl mx-auto flex items-center justify-center mb-3`}>
                <span className="text-2xl">👋</span>
              </div>
              <p className={`text-sm ${isLightBackground ? 'text-gray-600' : 'text-gray-400'}`}>
                Este negocio pronto tendrá contenido disponible.
              </p>
            </div>
          )}
        </div>

        {/* Powered by */}
        <div className="mt-12 text-center">
          <Link href="/" className={`inline-flex items-center gap-2 text-xs transition-colors ${isLightBackground ? 'text-gray-600 hover:text-gray-800' : 'text-gray-500 hover:text-gray-400'}`}>
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">T</span>
            </div>
            Powered by Taply
          </Link>
        </div>
      </main>
    </div>
  );
}
