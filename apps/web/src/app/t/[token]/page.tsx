"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

/**
 * Página de resolución NFC.
 * Redirige a la página pública y registra TAG_SCAN.
 */
export default function NfcResolvePage({ params }: { params: Promise<{ token: string }> }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const t = (await params).token;
      if (!mounted) return;

      try {
        const result: any = await api.resolveNfc(t);
        if (!mounted) return;
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        } else if (result.error) {
          setError(result.error);
        }
      } catch {
        if (mounted) setError('Etiqueta no encontrada');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-white">Resolviendo etiqueta...</h2>
          <p className="mt-2 text-blue-100/70">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Etiqueta sin asignación</h2>
          <p className="mt-3 text-blue-100/80">{error}</p>
          <p className="mt-2 text-sm text-blue-200/60">
            Esta etiqueta aún no está asignada a un negocio.
          </p>
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

  return null;
}
