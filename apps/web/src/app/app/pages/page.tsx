"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  MousePointerClick,
  ChevronDown,
  Settings,
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
 * Tipos para los botones de una página.
 */
interface PageButton {
  key: string;
  label: string;
  url: string;
  icon?: string;
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
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ businessId: '', slug: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterBusinessId, setFilterBusinessId] = useState<string>('');
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [buttons, setButtons] = useState<PageButton[]>([]);
  const [newButton, setNewButton] = useState({ key: '', label: '', url: '', icon: '' });
  const [savingButtons, setSavingButtons] = useState(false);
  const [openStatusMenu, setOpenStatusMenu] = useState<{ pageId: string; rect: DOMRect } | null>(null);

  /**
   * Carga las páginas y negocios desde la API.
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const bizFilter = filterBusinessId || undefined;
      const [bizData, pagesData] = await Promise.all([
        api.getBusinesses().catch(() => []),
        api.getPages(bizFilter).catch(() => []),
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
      await api.createPage(formData.businessId, {
        slug: formData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      });
      showSuccess('Página creada correctamente');
      setShowModal(false);
      setFormData({ businessId: filterBusinessId, slug: '' });
      await loadData();
    } catch (err) {
      // Si es un error de slug duplicado, mostrar mensaje claro
      const message = err instanceof Error ? err.message : 'Error al crear la página';
      if (message.includes('slug') || message.includes('duplicado') || message.includes('ya existe')) {
        setError(`El slug "${formData.slug.trim().toLowerCase().replace(/\s+/g, '-')}" ya existe para este negocio. Elige otro nombre.`);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Cambia el estado de la página.
   */
  const changePageStatus = async (page: Page, newStatus: string) => {
    try {
      await api.updatePageStatus(page.id, page.businessId, newStatus);
      const statusLabels: Record<string, string> = {
        PUBLISHED: 'Publicada',
        DRAFT: 'Borrador',
        PAUSED: 'Pausada',
        ARCHIVED: 'Archivada',
      };
      showSuccess(`Página cambiada a ${statusLabels[newStatus] || newStatus}`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado');
    }
  };

  /**
   * Elimina una página después de confirmar.
   */
  const handleDelete = async (page: Page) => {
    if (!confirm(`¿Estás seguro de eliminar "${page.slug}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await api.deletePage(page.id, page.businessId);
      showSuccess('Página eliminada correctamente');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la página');
    }
  };

  /**
   * Abre el editor de botones para una página.
   */
  const openButtonEditor = async (page: Page) => {
    try {
      const pageData = await api.getPage(page.id, page.businessId);
      const p = pageData as any;
      const versions = p?.versions || [];
      const draftVersion = versions.find((v: any) => v.status === 'DRAFT');
      const publishedVersion = versions.find((v: any) => v.status === 'PUBLISHED');
      const currentButtons = (draftVersion?.buttons || publishedVersion?.buttons || []) as PageButton[];
      setButtons(Array.isArray(currentButtons) ? currentButtons : []);
      setEditingPage(page);
    } catch {
      setButtons([]);
      setEditingPage(page);
    }
  };

  /**
   * Agrega un botón a la lista.
   */
  const addButton = () => {
    if (!newButton.key.trim() || !newButton.label.trim() || !newButton.url.trim()) return;
    setButtons([...buttons, { ...newButton, key: newButton.key.trim().toLowerCase().replace(/\s+/g, '-') }]);
    setNewButton({ key: '', label: '', url: '', icon: '' });
  };

  /**
   * Elimina un botón de la lista.
   */
  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  /**
   * Guarda los botones actualizados.
   */
  const saveButtons = async () => {
    if (!editingPage) return;
    try {
      setSavingButtons(true);
      await api.updatePage(editingPage.id, editingPage.businessId, { buttons });
      showSuccess('Botones actualizados correctamente');
      setEditingPage(null);
      setButtons([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los botones');
    } finally {
      setSavingButtons(false);
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
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              if (openStatusMenu?.pageId === page.id) {
                                setOpenStatusMenu(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setOpenStatusMenu({ pageId: page.id, rect });
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Cambiar estado"
                          >
                            {statusBadge(page.status)}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => router.push(`/app/pages/${page.id}/buttons`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Gestionar botones"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(page)}
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

      {/* Button editor modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Editar botones</h2>
                <p className="text-sm text-gray-500 mt-0.5">{editingPage.slug}</p>
              </div>
              <button
                onClick={() => setEditingPage(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Existing buttons */}
              {buttons.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Botones actuales</p>
                  {buttons.map((btn, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <MousePointerClick className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{btn.label}</p>
                          <p className="text-xs text-gray-500">{btn.url}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeButton(index)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar botón"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new button */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Agregar botón</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Clave</label>
                    <input
                      type="text"
                      value={newButton.key}
                      onChange={(e) => setNewButton({ ...newButton, key: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="whatsapp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Etiqueta</label>
                    <input
                      type="text"
                      value={newButton.label}
                      onChange={(e) => setNewButton({ ...newButton, label: e.target.value })}
                      placeholder="WhatsApp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">URL</label>
                    <input
                      type="url"
                      value={newButton.url}
                      onChange={(e) => setNewButton({ ...newButton, url: e.target.value })}
                      placeholder="https://wa.me/1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Icono (opcional)</label>
                    <input
                      type="text"
                      value={newButton.icon}
                      onChange={(e) => setNewButton({ ...newButton, icon: e.target.value })}
                      placeholder="whatsapp, phone, mail, web..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={addButton}
                  disabled={!newButton.key.trim() || !newButton.label.trim() || !newButton.url.trim()}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Agregar botón
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setEditingPage(null)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveButtons}
                disabled={savingButtons}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {savingButtons ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </span>
                ) : 'Guardar botones'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status dropdown portal — rendered outside the table to avoid overflow clipping */}
      {openStatusMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpenStatusMenu(null)}
          />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]"
            style={{
              top: openStatusMenu.rect.bottom + window.scrollY + 4,
              left: openStatusMenu.rect.left + window.scrollX,
            }}
          >
            {[{ value: 'DRAFT', label: 'Borrador' }, { value: 'PUBLISHED', label: 'Publicada' }, { value: 'PAUSED', label: 'Pausada' }, { value: 'ARCHIVED', label: 'Archivada' }].map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  const page = pages.find((p) => p.id === openStatusMenu.pageId);
                  if (page) {
                    changePageStatus(page, s.value);
                  }
                  setOpenStatusMenu(null);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
