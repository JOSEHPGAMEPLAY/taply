import Link from 'next/link';

/**
 * Página pública de un negocio.
 * Muestra el perfil del negocio, botones configurados y registra PAGE_VIEW.
 */
export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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
            <span className="text-white text-3xl font-bold">{slug.charAt(0).toUpperCase()}</span>
          </div>

          {/* Business info */}
          <h2 className="mt-6 text-2xl font-bold text-gray-900">{slug}</h2>
          <p className="mt-2 text-gray-500">Página pública de Taply</p>

          {/* Buttons placeholder */}
          <div className="mt-8 space-y-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm text-gray-400">Los botones de la página aparecerán aquí cuando se configuren.</p>
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">
              Esta página es accesible públicamente mediante etiquetas NFC y códigos QR.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Slug: {slug}
            </p>
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
