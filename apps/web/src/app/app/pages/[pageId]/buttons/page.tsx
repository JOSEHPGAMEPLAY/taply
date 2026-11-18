'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  MousePointerClick,
  Eye,
  Save,
} from 'lucide-react';
import { api } from '@/lib/api';
import IconSelector from '@/components/icon-selector';
import { getIconByKey } from '@/lib/icon-map';

/**
 * Tipos para los botones de una página.
 */
interface PageButton {
  key: string;
  label: string;
  url: string;
  icon?: string;
}

interface PageData {
  id: string;
  slug: string;
  status: string;
  businessId: string;
}

/**
 * Página dedicada para gestionar los botones de una página.
 * Permite agregar, editar, eliminar y previsualizar botones con selector de iconos.
 */
export default function ButtonsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const router = useRouter();
  const [page, setPage] = useState<PageData | null>(null);
  const [buttons, setButtons] = useState<PageButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form para agregar/editar botón
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formButton, setFormButton] = useState({ key: '', label: '', url: '', icon: '' });

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        // Unwrap params promise (Next.js 15+)
        const { pageId } = await params;
        const pageData = await api.getPage(pageId, '');
        const p = pageData as any;

        // Buscar businessId en la página
        const businessId = p?.businessId || '';
        setPage({
          id: p?.id || pageId,
          slug: p?.slug || '',
          status: p?.status || '',
          businessId,
        });

        // Cargar botones de la versión draft o published
        const versions = p?.versions || [];
        const draftVersion = versions.find((v: any) => v.status === 'DRAFT');
        const publishedVersion = versions.find((v: any) => v.status === 'PUBLISHED');
        const currentButtons = (draftVersion?.buttons || publishedVersion?.buttons || []) as PageButton[];
        setButtons(Array.isArray(currentButtons) ? currentButtons : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la página');
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [params]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const startAdd = () => {
    setEditingIndex(null);
    setFormButton({ key: '', label: '', url: '', icon: '' });
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    const btn = buttons[index]!;
    setFormButton({
      key: btn.key || '',
      label: btn.label || '',
      url: btn.url || '',
      icon: btn.icon || '',
    });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setFormButton({ key: '', label: '', url: '', icon: '' });
  };

  const saveButton = () => {
    if (!formButton.key.trim() || !formButton.label.trim() || !formButton.url.trim()) return;

    const normalized = {
      ...formButton,
      key: formButton.key.trim().toLowerCase().replace(/\s+/g, '-'),
    };

    if (editingIndex !== null) {
      // Editar existente
      const updated = [...buttons];
      updated[editingIndex] = normalized;
      setButtons(updated);
    } else {
      // Agregar nuevo
      setButtons([...buttons, normalized]);
    }
    cancelEdit();
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    if (!page) return;
    try {
      setSaving(true);
      await api.updatePage(page.id, page.businessId, { buttons });
      showSuccess('Botones guardados correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los botones');
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/app/pages')}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Volver a páginas"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Gestionar botones</h1>
          {page && (
            <p className="text-sm text-gray-500 mt-1">
              Página: <span className="font-medium text-gray-700">{page.slug}</span>
              {' '}— {statusBadge(page.status)}
            </p>
          )}
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar cambios
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de botones */}
        <div className="lg:col-span-2 space-y-4">
          {/* Existing buttons */}
          {buttons.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Botones actuales ({buttons.length})</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {buttons.map((btn, index) => {
                  const iconInfo = btn.icon ? getIconByKey(btn.icon) : undefined;
                  const IconComponent = iconInfo?.component;
                  return (
                    <div key={index} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {IconComponent ? (
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                            <IconComponent className="w-4 h-4 text-blue-600" />
                          </div>
                        ) : (
                          <MousePointerClick className="w-4 h-4 text-gray-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{btn.label}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{btn.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(index)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeButton(index)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add/Edit form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              {editingIndex !== null ? 'Editar botón' : 'Agregar botón'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Clave</label>
                  <input
                    type="text"
                    value={formButton.key}
                    onChange={(e) => setFormButton({ ...formButton, key: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="whatsapp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Etiqueta</label>
                  <input
                    type="text"
                    value={formButton.label}
                    onChange={(e) => setFormButton({ ...formButton, label: e.target.value })}
                    placeholder="WhatsApp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">URL</label>
                <input
                  type="url"
                  value={formButton.url}
                  onChange={(e) => setFormButton({ ...formButton, url: e.target.value })}
                  placeholder="https://wa.me/1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Icono</label>
                <IconSelector
                  selectedKey={formButton.icon}
                  onSelect={(key) => setFormButton({ ...formButton, icon: key })}
                  placeholder="Buscar icono..."
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={saveButton}
                  disabled={!formButton.key.trim() || !formButton.label.trim() || !formButton.url.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {editingIndex !== null ? 'Actualizar' : <><Plus className="w-4 h-4" /> Agregar</>}
                </button>
                {editingIndex !== null && (
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview en vivo */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Vista previa</h2>
            </div>

            {/* Mockup de teléfono */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
              {/* Barra de estado del teléfono */}
              <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                </div>
                <div className="text-[10px] text-gray-400">12:00</div>
              </div>

              {/* Contenido del teléfono */}
              <div className="p-4 space-y-3 bg-white min-h-[300px]">
                {/* Header de la página */}
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto"></div>
                </div>

                {/* Botones */}
                {buttons.length > 0 ? (
                  <div className="space-y-2">
                    {buttons.map((btn, index) => {
                      const iconInfo = btn.icon ? getIconByKey(btn.icon) : undefined;
                      const IconComponent = iconInfo?.component;
                      return (
                        <button
                          key={index}
                          className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium"
                        >
                          {IconComponent ? (
                            <IconComponent className="w-4 h-4" />
                          ) : (
                            <MousePointerClick className="w-4 h-4" />
                          )}
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MousePointerClick className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Agrega botones para verlos aquí</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
