import Link from 'next/link';

/**
 * Página principal de Taply.
 * Landing page con botones de login y registro.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">T</span>
          </div>
          <span className="text-white text-2xl font-bold">Taply</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-white/90 hover:text-white rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-semibold shadow-lg shadow-blue-900/30"
          >
            Crear cuenta
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 pt-16 pb-32 md:pt-24">
        <div className="max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Plataforma SaaS para negocios digitales
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
            Soluciones digitales.
            <br />
            <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              Un solo toque.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
            Crea páginas digitales para tu negocio y hazlas accesibles con etiquetas NFC y códigos QR.
            Gestiona clientes, servicios y analíticas desde un solo panel.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all text-base font-semibold shadow-xl shadow-blue-900/40 hover:shadow-2xl hover:-translate-y-0.5"
            >
              Comenzar gratis
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all text-base font-semibold border border-white/20"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Etiquetas NFC</h3>
              <p className="text-blue-100/70 text-sm leading-relaxed">
                Programa etiquetas NFC que redirigen a la página de tu negocio con un solo toque.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Códigos QR</h3>
              <p className="text-blue-100/70 text-sm leading-relaxed">
                Genera códigos QR como alternativa a NFC para compartir tu página digital.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Analíticas</h3>
              <p className="text-blue-100/70 text-sm leading-relaxed">
                Rastrea visitas, clics y escaneos para entender el comportamiento de tus clientes.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-blue-200/60">
          <p>© 2025 Taply. Todos los derechos reservados.</p>
          <p>Hecho con ❤️ en Colombia</p>
        </div>
      </footer>
    </div>
  );
}
