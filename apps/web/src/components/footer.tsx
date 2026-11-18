import Image from 'next/image';
import Link from 'next/link';
import { Mail } from 'lucide-react';

/**
 * Icono GitHub como SVG inline.
 */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Icono LinkedIn como SVG inline.
 */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        fill="currentColor"
      />
    </svg>
  );
}

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
            <div className="flex items-center gap-3">
              <Link
                href="https://github.com/JOSEHPGAMEPLAY/taply"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="GitHub"
              >
                <GitHubIcon className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/josehernandoverajaimes/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:jose.kj11@hotmail.com"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
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
