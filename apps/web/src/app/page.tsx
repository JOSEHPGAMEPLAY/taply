import Image from 'next/image';
import Link from 'next/link';
import ContactForm from '@/components/contact-form';
import Footer from '@/components/footer';

/**
 * Página principal de Taply.
 * Landing page con brand kit integrado, formulario de contacto y footer actualizado.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/isotipo.svg"
            alt="Taply Logo"
            width={40}
            height={40}
            className="h-10 w-10"
            priority
          />
          <span className="text-white text-2xl font-bold">Taply</span>
        </Link>
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

      {/* Hero Section con fondo moderno */}
      <main className="relative flex flex-col items-center justify-center overflow-hidden px-6 pt-16 pb-32 md:pt-24">
        {/* Background: gradientes CSS modernos con glows y malla */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37, 99, 235, 0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(0, 212, 255, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 20% 60%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            linear-gradient(180deg, #0a0f3c 0%, #0a0a1a 100%)
          `
        }} />
        {/* Grid pattern sutil */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        {/* Glow central animado */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-1/4 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 max-w-4xl text-center">
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

          {/* Features con iconos del brand kit */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center mb-4">
                <Image
                  src="/brand/icon-nfc.png"
                  alt="Etiquetas NFC"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Etiquetas NFC</h3>
              <p className="text-blue-100/70 text-sm leading-relaxed">
                Programa etiquetas NFC que redirigen a la página de tu negocio con un solo toque.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-xl flex items-center justify-center mb-4">
                <Image
                  src="/brand/icon-qr.png"
                  alt="Códigos QR"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Códigos QR</h3>
              <p className="text-blue-100/70 text-sm leading-relaxed">
                Genera códigos QR como alternativa a NFC para compartir tu página digital.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center mb-4">
                <Image
                  src="/brand/icon-analytics.png"
                  alt="Analíticas"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Analíticas</h3>
              <p className="text-blue-100/70 text-sm leading-relaxed">
                Rastrea visitas, clics y escaneos para entender el comportamiento de tus clientes.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Formulario de Contacto */}
      <ContactForm />

      {/* Footer */}
      <Footer />
    </div>
  );
}
