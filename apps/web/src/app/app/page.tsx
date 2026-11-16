"use client";

import { useEffect, useState } from 'react';
import { Building2, FileText, Radio, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

/**
 * Dashboard principal con resumen de negocios, páginas y etiquetas.
 * Carga datos reales desde la API y muestra skeleton loaders mientras carga.
 */
export default function DashboardPage() {
  const [stats, setStats] = useState<{ businesses: number; pages: number; tags: number }>({
    businesses: 0,
    pages: 0,
    tags: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga las estadísticas desde la API al montar el componente.
   */
  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const [businesses, pages, tags] = await Promise.all([
          api.getBusinesses().catch(() => []),
          api.getPages('').catch(() => []),
          api.getNfcTags('').catch(() => []),
        ]);

        if (!cancelled) {
          setStats({
            businesses: Array.isArray(businesses) ? businesses.length : 0,
            pages: Array.isArray(pages) ? pages.length : 0,
            tags: Array.isArray(tags) ? tags.length : 0,
          });
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('No se pudieron cargar los datos. Verifica tu conexión.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Skeleton loader para las tarjetas de estadísticas.
   */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white animate-pulse">
          <div className="h-8 bg-white/20 rounded-lg w-64" />
          <div className="h-4 bg-white/20 rounded w-96 mt-3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-12 mt-2" />
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold">Bienvenido a Taply</h1>
        <p className="mt-2 text-blue-100 max-w-2xl">
          Gestiona tus negocios, páginas digitales y etiquetas NFC desde un solo lugar.
        </p>
        {stats.businesses === 0 && (
          <Link
            href="/app/businesses"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-semibold"
          >
            Crear primer negocio
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Negocios</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stats.businesses}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <Link href="/app/businesses" className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Ver negocios <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Páginas</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stats.pages}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <Link href="/app/pages" className="mt-4 inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium">
            Ver páginas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">NFC Tags</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stats.tags}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Radio className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <Link href="/app/nfc-tags" className="mt-4 inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium">
            Ver etiquetas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Getting started - only show if no businesses */}
      {stats.businesses === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Primeros pasos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Crea un negocio</p>
                <p className="text-xs text-gray-500 mt-0.5">Registra tu negocio con nombre y descripción</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Crea una página</p>
                <p className="text-xs text-gray-500 mt-0.5">Diseña la página digital con botones</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Asigna etiquetas</p>
                <p className="text-xs text-gray-500 mt-0.5">Programa NFC o genera códigos QR</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
