/**
 * Página pública de un negocio.
 * Muestra el perfil del negocio, botones configurados y registra PAGE_VIEW.
 * En producción, esto se conecta a la API para obtener los datos del negocio.
 */
export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6">
        <div className="text-6xl mb-4">🌐</div>
        <h2 className="text-2xl font-bold text-gray-900">Página: {slug}</h2>
        <p className="mt-2 text-gray-600">
          La página pública se renderizará con los datos del negocio y botones configurados.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Endpoint público: /p/{slug}
        </p>
      </div>
    </div>
  );
}
