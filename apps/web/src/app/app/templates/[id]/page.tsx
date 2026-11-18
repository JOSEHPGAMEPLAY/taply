"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

/**
 * Tipos para los templates.
 */
interface Template {
  id: string;
  name: string;
  description?: string;
  config?: Record<string, any>;
  version: string;
  createdAt: string;
}

/**
 * Página de preview de una template.
 * Muestra cómo se vería una página pública con esa template aplicada,
 * replicando el diseño de /p/[slug] pero con datos de la template.
 */
export default function TemplatePreviewPage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getTemplate(params.id)
      .then((data) => {
        setTemplate(data as Template);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la template');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  // Extraer configuración de la template
  const config = template?.config || {};
  const theme = config.theme || 'default';
  const buttons = config.buttons || [];
  const initial = template?.name?.charAt(0)?.toUpperCase() || 'T';

  // Colores según el tema
  const themeColors: Record<string, { gradient: string; avatar: string; button: string }> = {
    default: {
      gradient: 'from-gray-50 to-blue-50',
      avatar: 'from-blue-500 to-indigo-600',
      button: 'bg-white hover:bg-gray-50 border-gray-200',
    },
    dark: {
      gradient: 'from-gray-900 to-gray-800',
      avatar: 'from-gray-600 to-gray-700',
      button: 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white',
    },
    warm: {
      gradient: 'from-orange-50 to-amber-50',
      avatar: 'from-orange-500 to-amber-600',
      button: 'bg-white hover:bg-orange-50 border-orange-200',
    },
    cool: {
      gradient: 'from-cyan-50 to-blue-50',
      avatar: 'from-cyan-500 to-blue-600',
      button: 'bg-white hover:bg-cyan-50 border-cyan-200',
    },
  };

  const colors = themeColors[theme] ?? themeColors.default;
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subtextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Cargando preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Error al cargar</h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <Link
            href="/app/templates"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/app/templates"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a templates
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-900">{template?.name}</span>
          </div>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            Preview
          </span>
        </div>
      </div>

      {/* Preview Container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          {/* Phone Mockup */}
          <div className="w-[375px] h-[700px] bg-white rounded-3xl shadow-2xl border-4 border-gray-800 overflow-hidden relative">
            {/* Status bar */}
            <div className="bg-gray-800 px-6 py-2 flex items-center justify-between">
              <span className="text-white text-xs">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 border border-white rounded-sm">
                  <div className="w-2 h-full bg-green-400 rounded-sm"></div>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className={`h-full overflow-y-auto bg-gradient-to-br ${colors!.gradient}`}>
              {/* Header */}
              <header className={`bg-white/80 backdrop-blur-sm border-b ${theme === 'dark' ? 'border-gray-700' : ''}`}>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">T</span>
                    </div>
                    <span className={`text-xs font-medium ${subtextColor}`}>Taply</span>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="px-4 py-8">
                <div className="text-center">
                  {/* Avatar */}
                  <div className={`w-20 h-20 bg-gradient-to-br ${colors!.avatar} rounded-full mx-auto flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-2xl font-bold">{initial}</span>
                  </div>

                  {/* Business info */}
                  <h2 className={`mt-4 text-xl font-bold ${textColor}`}>{template?.name || 'Negocio'}</h2>
                  {template?.description && (
                    <p className={`mt-2 text-sm ${subtextColor} max-w-xs mx-auto`}>{template.description}</p>
                  )}

                  {/* Buttons */}
                  <div className="mt-6 space-y-2">
                    {buttons.length > 0 ? (
                      buttons.map((btn: any, index: number) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colors!.button} transition-colors cursor-pointer`}
                        >
                          {btn.icon && (
                            <span className="text-lg">{btn.icon}</span>
                          )}
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                            {btn.label || 'Botón'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className={`rounded-xl border p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <p className={`text-xs ${subtextColor}`}>
                          Sin botones configurados
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </main>

              {/* Footer */}
              <footer className={`border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'bg-white/50'}`}>
                <div className="px-4 py-3 text-center">
                  <p className={`text-xs ${subtextColor}`}>Powered by Taply</p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
