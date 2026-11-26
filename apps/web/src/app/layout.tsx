import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Taply — Soluciones digitales. Un solo toque.',
  description: 'Crea páginas digitales accesibles mediante etiquetas NFC y códigos QR.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <Script id="theme-preference" strategy="beforeInteractive">
        {`try {
          document.documentElement.dataset.theme = localStorage.getItem('taply_theme') === 'dark' ? 'dark' : 'light';
        } catch {
          document.documentElement.dataset.theme = 'light';
        }`}
      </Script>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
