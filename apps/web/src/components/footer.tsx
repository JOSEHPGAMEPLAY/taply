import Image from 'next/image';
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';

/**
 * Footer de la landing page de Taply.
 * Incluye logo, links sociales, email de contacto y copyright.
 */
export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0a0a1a]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link href="/" className="block">
              <Image
                src="/brand/logo-horizontal.png"
                alt="Taply Logo"
                width={140}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <p className="text-sm text-gray-400">
              Conecta tu negocio al mundo digital con NFC y QR.
            </p>
          </div>

          {/* Links Sociales */}
          <div className="flex flex-col items-center gap-4 md:items-end">
            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/JOSEHPGAMEPLAY/taply"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/josehernandoverajaimes/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:jose.kj11@hotmail.com"
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              <Link
                href="mailto:jose.kj11@hotmail.com"
                className="transition-colors hover:text-cyan-400"
              >
                jose.kj11@hotmail.com
              </Link>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-gray-500">
            &copy; 2026 Taply. Todos los derechos reservados. Hecho con{' '}
            <span className="text-red-500">&hearts;</span> en Colombia.
          </p>
        </div>
      </div>
    </footer>
  );
}
