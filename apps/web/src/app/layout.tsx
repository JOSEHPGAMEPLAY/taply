import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Taply — Soluciones digitales. Un solo toque.',
  description: 'Crea páginas digitales accesibles mediante etiquetas NFC y códigos QR.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
