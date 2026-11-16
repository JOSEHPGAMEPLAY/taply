"use client";

import { useEffect, useState } from 'react';
import {
  BarChart3,
  Eye,
  MousePointerClick,
  Radio,
  AlertCircle,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';

/**
 * Tipos para las estadísticas de analíticas.
 */
interface Stats {
  totalViews: number;
  totalClicks: number;
  totalScans: number;
  viewsByDay: { date: string; count: number }[];
  clicksByButton: { button: string; count: number }[];
}

/**
 * Tipos para las páginas disponibles.
 */
interface Page {
  id: string;
  slug: string;
}

/**
 * Página de analíticas con métricas y gráficos simples.
 * Muestra visitas, clics en botones y escaneos NFC por página.
 */
export default function AnalyticsPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga las páginas disponibles al montar el componente.
   */
  useEffect(() => {
    const loadPages = async () => {
      try {
        const data = await api.getPages('').catch(() => []);
        const pagesList = (Array.isArray(data) ? data : []) as Page[];
        setPages(pagesList);
        if (pagesList.length > 0 && pagesList[0]) {
          setSelectedPageId(pagesList[0].id);
        }
      } catch {
        setError('No se pudieron cargar las páginas');
      }
    };
    loadPages();
  }, []);

  /**
   * Carga las estadísticas cuando se selecciona una página.
   */
  useEffect(() => {
    if (!selectedPageId) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await api.getStats(selectedPageId);

        // Parse the API response
        const statsData: Stats = {
          totalViews: (data as any).totalViews || 0,
          totalClicks: (data as any).totalClicks || 0,
          totalScans: (data as any).totalScans || 0,
          viewsByDay: (data as any).viewsByDay || [],
          clicksByButton: (data as any).clicksByButton || [],
        };
        setStats(statsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las estadísticas');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedPageId]);

  /**
   * Calcula el valor máximo para escalar las barras del gráfico.
   */
  const getMaxValue = () => {
    if (!stats || stats.viewsByDay.length === 0) return 1;
    return Math.max(...stats.viewsByDay.map((d) => d.count), 1);
  };

  /**
   * Formatea la fecha para mostrarla de forma corta.
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analíticas</h1>
        <p className="text-sm text-gray-500 mt-1">Visualiza las métricas de tus páginas</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Page selector */}
      {!loading && pages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar página</label>
          <select
            value={selectedPageId}
            onChange={(e) => setSelectedPageId(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {pages.map((page) => (
              <option key={page.id} value={page.id}>{page.slug}</option>
            ))}
          </select>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && pages.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No hay páginas para analizar</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Crea y publica una página para comenzar a ver las métricas de visitas y clics.
          </p>
        </div>
      )}

      {/* Stats content */}
      {!loading && stats && (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Visitas totales</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalViews}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>Visitas PAGE_VIEW</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Clics en botones</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalClicks}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <MousePointerClick className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>Clics BUTTON_CLICK</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Escaneos NFC</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalScans}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Radio className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>Escaneos TAG_SCAN</span>
              </div>
            </div>
          </div>

          {/* Visits by day chart */}
          {stats.viewsByDay.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitas por día</h3>
              <div className="flex items-end gap-2 h-48">
                {stats.viewsByDay.slice(-14).map((day, i) => {
                  const height = (day.count / getMaxValue()) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500">{day.count}</span>
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600 min-h-[4px]"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${day.count} visitas`}
                      />
                      <span className="text-xs text-gray-400 truncate w-full text-center">
                        {formatDate(day.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clicks by button */}
          {stats.clicksByButton.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clics por botón</h3>
              <div className="space-y-3">
                {stats.clicksByButton.map((item, i) => {
                  const maxClicks = Math.max(...stats.clicksByButton.map((b) => b.count), 1);
                  const percentage = (item.count / maxClicks) * 100;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.button}</span>
                        <span className="text-sm text-gray-500">{item.count} clics</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No data message */}
          {stats.viewsByDay.length === 0 && stats.clicksByButton.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Sin datos aún</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                Las métricas aparecerán cuando las personas comiencen a visitar tu página.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
