"use client";

import { useEffect, useState } from 'react';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-xl font-medium text-gray-900">Resolviendo etiqueta...</h2>
          <p className="mt-2 text-gray-500">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900">Etiqueta sin asignación</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <p className="mt-4 text-sm text-gray-500">
            Esta etiqueta aún no está asignada a un negocio.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
