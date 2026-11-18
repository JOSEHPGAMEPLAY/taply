import Link from 'next/link';
import ButtonWithTracking from './ButtonWithTracking';

/**
 * Página pública de un negocio.
 * Carga datos reales de la API pública y muestra perfil, botones y registra PAGE_VIEW.
 * Cada click en un botón registra un evento BUTTON_CLICK antes de redirigir.
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
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Página no disponible</h2>
          <p className="mt-3 text-blue-100/80">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-colors text-sm font-semibold"
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
  const buttons: Array<{ key: string; label: string; url: string; icon?: string }> = Array.isArray(rawButtons) ? rawButtons : [];
  const initial = business?.name?.charAt(0)?.toUpperCase() || slug.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Taply</span>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">{initial}</span>
          </div>

          {/* Business info */}
          <h2 className="mt-6 text-2xl font-bold text-gray-900">{business?.name || slug}</h2>
          {business?.description && (
            <p className="mt-2 text-gray-500 max-w-md mx-auto">{business.description}</p>
          )}

          {/* Buttons */}
          <div className="mt-8 space-y-3">
            {buttons.length > 0 ? (
              buttons.map((btn) => (
                <ButtonWithTracking
                  key={btn.key}
                  label={btn.label}
                  url={btn.url}
                  icon={btn.icon}
                  pageId={pageId || ''}
                  buttonKey={btn.key}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <p className="text-sm text-gray-400">
                  Este negocio aún no ha configurado botones.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
          Powered by Taply
        </div>
      </footer>
    </div>
  );
}
