"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Users,
  Store,
  FileText,
  Tag,
  Eye,
  MousePointerClick,
  QrCode,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

/**
 * Dashboard de analíticas globales del panel admin.
 * Solo accesible por usuarios con rol ADMIN.
 * Muestra métricas de toda la plataforma: usuarios, negocios, páginas, etiquetas y eventos.
 */
export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{
    users: { total: number; active: number; last30Days: number };
    businesses: { total: number; active: number; last30Days: number };
    pages: { total: number; published: number };
    tags: { total: number; active: number };
    events: { total: number; pageViews: number; buttonClicks: number; tagScans: number; last30Days: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Protección: redirigir si no es admin
    if (user?.role !== 'ADMIN') {
      router.push('/app');
      return;
    }

    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminAnalyticsOverview();
      setData(response);
    } catch {
      setError('No se pudieron cargar las analíticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando analíticas...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <p className="text-gray-600">{error || 'Datos no disponibles'}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Analíticas Globales</h1>
      </div>

      {/* Métricas principales */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Métricas Principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Usuarios */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Usuarios</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.users.total}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              {data.users.active} activos
            </span>
          </div>

          {/* Negocios */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Negocios</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.businesses.total}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              {data.businesses.active} activos
            </span>
          </div>

          {/* Páginas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Páginas</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.pages.total}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
              {data.pages.published} publicadas
            </span>
          </div>

          {/* Etiquetas NFC */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Etiquetas NFC</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.tags.total}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              {data.tags.active} activas
            </span>
          </div>
        </div>
      </div>

      {/* Eventos */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Eventos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Page Views */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Page Views</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.events.pageViews}</p>
          </div>

          {/* Button Clicks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Button Clicks</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.events.buttonClicks}</p>
          </div>

          {/* Tag Scans */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Tag Scans</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.events.tagScans}</p>
          </div>
        </div>
      </div>

      {/* Crecimiento últimos 30 días */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Crecimiento (últimos 30 días)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Usuarios nuevos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Usuarios nuevos</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.users.last30Days}</p>
          </div>

          {/* Negocios nuevos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Negocios nuevos</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.businesses.last30Days}</p>
          </div>

          {/* Eventos recientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Eventos recientes</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.events.last30Days}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
