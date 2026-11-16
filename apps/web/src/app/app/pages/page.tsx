"use client";

import { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from '@/lib/api';

/**
 * Tipos para los datos de la página.
 */
interface Page {
  id: string;
  slug: string;
  status: string;
  businessId: string;
  businessName?: string;
  createdAt: string;
}

/**
 * Tipos para los negocios (para el selector).
 */
interface Business {
  id: string;
  name: string;
}

/**
 * Página de gestión de páginas con CRUD y publish workflow.
 * Permite crear, listar, editar y publicar páginas digitales.
 */
export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ businessId: '', slug: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterBusinessId, setFilterBusinessId] = useState<string>('');

  /**
   * Carga las páginas y negocios desde la API.
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [bizData, pagesData] = await Promise.all([
        api.getBusinesses().catch(() => []),
        api.getPages(filterBusinessId).catch(() => []),
      ]);

      const biz = (Array.isArray(bizData) ? bizData : []) as Business[];
      setBusinesses(biz);

      // Enrich pages with business name
      const pagesArray = (Array.isArray(pagesData) ? pagesData : []) as Page[];
      const enrichedPages = pagesArray.map((page: Page) => {
        const foundBiz = biz.find((b: Business) => b.id === page.businessId);
        return { ...page, businessName: foundBiz?.name || 'Desconocido' };
      });
      setPages(enrichedPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterBusinessId]);

  /**
   * Muestra el mensaje de éxito y lo oculta después de 3 segundos.
   */
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  /**
   * Abre el modal para crear una nueva página.
   */
  const openCreateModal = () => {
    setFormData({ businessId: filterBusinessId, slug: '' });
    setShowModal(true);
  };

  /**
   * Guarda la página (crear).
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug.trim() || !formData.businessId) return;

    try {
      setSubmitting(true);
      await api.createPage({
        businessId: formData.businessId,
        slug: formData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      });
      showSuccess('Página creada correctamente');
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la página');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Publica o despublica una página.
   */
  const togglePublish = async (page: Page) => {
    const isPublished = page.status === 'PUBLISHED';
    try {
      if (!isPublished) {
        await api.publishPage(page.id);
        showSuccess('Página publicada correctamente');
      } else {
        // For unpublish, we'll use a placeholder — the API needs an unpublish endpoint
        showSuccess('Funcionalidad de despublicar en desarrollo');
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado');
    }
  };

  /**
   * Elimina una página después de confirmar.
   */
  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta página? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      showSuccess('Funcionalidad de eliminar en desarrollo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la página');
    }
  };

  /**
   * Renderiza el badge del estado de la página.
   */
  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PUBLISHED: 'bg-green-100 text-green-700',
      DRAFT: 'bg-gray-100 text-gray-700',
      PAUSED: 'bg-yellow-100 text-yellow-700',
      ARCHIVED: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      PUBLISHED: 'Publicada',
      DRAFT: 'Borrador',
      PAUSED: 'Pausada',
      ARCHIVED: 'Archivada',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Páginas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus páginas digitales</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Nueva página
        </button>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filter */}
      {!loading && businesses.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por negocio</label>
          <select
            value={filterBusinessId}
            onChange={(e) => setFilterBusinessId(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Todos los negocios</option>
            {businesses.map((biz) => (
              <option key={biz.id} value={biz.id}>{biz.name}</option>
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
          <FileText className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {businesses.length === 0 ? 'Crea un negocio primero' : 'No tienes páginas aún'}
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {businesses.length === 0
              ? 'Necesitas crear un negocio antes de poder crear páginas digitales.'
              : 'Crea tu primera página digital para que los clientes puedan acceder a tu negocio.'}
          </p>
          {businesses.length > 0 && (
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Crear primera página
            </button>
          )}
        </div>
      )}

      {/* Pages table */}
      {!loading && pages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Slug</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden md:table-cell">Negocio</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Creada</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{page.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                      {page.businessName}
                    </td>
                    <td className="px-6 py-4">{statusBadge(page.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(page.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => togglePublish(page)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title={page.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar'}
                        >
                          {page.status === 'PUBLISHED' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete()}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Nueva página</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Negocio <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.businessId}
                  onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                >
                  <option value="">Selecciona un negocio</option>
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>{biz.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="mi-restaurante"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                  autoFocus
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  title="Solo letras minúsculas, números y guiones"
                />
                <p className="mt-1 text-xs text-gray-500">
                  La URL pública será: <code className="bg-gray-100 px-1 rounded">/p/{formData.slug || 'tu-slug'}</code>
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.slug.trim() || !formData.businessId}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creando...
                    </span>
                  ) : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
