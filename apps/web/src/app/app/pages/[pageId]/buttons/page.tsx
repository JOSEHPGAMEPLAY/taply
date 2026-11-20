'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  Loader2,
  MousePointerClick,
  Eye,
  EyeOff,
  Save,
  GripVertical,
  Pencil,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import IconSelector from '@/components/icon-selector';
import { getIconByKey } from '@/lib/icon-map';
import { Modal } from '@/components/ui/modal';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';

/**
 * Tipos para los botones de una página.
 */
interface PageButton {
  key: string;
  label: string;
  url: string;
  icon?: string;
  hidden?: boolean;
}

interface PageData {
  id: string;
  slug: string;
  status: string;
  businessId: string;
}

/**
 * Página dedicada para gestionar los botones de una página.
 * Permite agregar, editar, eliminar, reordenar y previsualizar botones con selector de iconos.
 * Usa modales para crear/editar y confirmación antes de eliminar.
 */
export default function ButtonsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState<PageData | null>(null);
  const [buttons, setButtons] = useState<PageButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal de crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formButton, setFormButton] = useState({ key: '', label: '', url: '', icon: '', hidden: false });

  // Modal de confirmación de eliminación
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  // IDs únicos para botones (para drag & drop estable)
  const [buttonIds] = useState(() => new Map<number, string>());

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      const { pageId } = await params;
      const businessId = searchParams.get('businessId') || '';
      if (!businessId) {
        setError('Falta el ID del negocio. Accede desde la lista de páginas.');
        setLoading(false);
        return;
      }
      const pageData = await api.getPage(pageId, businessId);
      const p = pageData as any;

      setPage({
        id: p?.id || pageId,
        slug: p?.slug || '',
        status: p?.status || '',
        businessId,
      });

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
  }, [params, searchParams]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Abrir modal para agregar
  const openAddModal = () => {
    setEditingIndex(null);
    setFormButton({ key: '', label: '', url: '', icon: '', hidden: false });
    setModalOpen(true);
  };

  // Abrir modal para editar
  const openEditModal = (index: number) => {
    setEditingIndex(index);
    const btn = buttons[index]!;
    setFormButton({
      key: btn.key || '',
      label: btn.label || '',
      url: btn.url || '',
      icon: btn.icon || '',
      hidden: btn.hidden || false,
    });
    setModalOpen(true);
  };

  // Guardar botón desde el modal
  const saveButtonFromModal = () => {
    if (!formButton.key.trim() || !formButton.label.trim() || !formButton.url.trim()) return;

    const normalized = {
      ...formButton,
      key: formButton.key.trim().toLowerCase().replace(/\s+/g, '-'),
    };

    if (editingIndex !== null) {
      const updated = [...buttons];
      updated[editingIndex] = normalized;
      setButtons(updated);
    } else {
      setButtons([...buttons, normalized]);
    }
    setModalOpen(false);
    setEditingIndex(null);
    setFormButton({ key: '', label: '', url: '', icon: '', hidden: false });
  };

  // Toggle visibilidad de un botón
  const toggleHidden = (index: number) => {
    const updated = [...buttons];
    updated[index] = { ...updated[index]!, hidden: !updated[index]!.hidden };
    setButtons(updated);
  };

  // Eliminar botón con confirmación
  const confirmDelete = (index: number) => {
    setDeleteConfirmIndex(index);
  };

  const deleteButton = () => {
    if (deleteConfirmIndex === null) return;
    setButtons(buttons.filter((_, i) => i !== deleteConfirmIndex));
    setDeleteConfirmIndex(null);
  };

  // Mover botón arriba/abajo
  const moveButton = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === buttons.length - 1) return;
    const newButtons = [...buttons];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newButtons[index]!;
    newButtons[index] = newButtons[swapIndex]!;
    newButtons[swapIndex] = temp;
    setButtons(newButtons);
  };

  // Guardar todos los botones en la API
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

  // Validación del formulario
  const isFormValid = formButton.key.trim() && formButton.label.trim() && formButton.url.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          onClick={() => router.push('/app/pages')}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors self-start"
          title="Volver a páginas"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Gestionar botones</h1>
          {page && (
            <p className="text-sm text-gray-500 mt-1">
              Página: <span className="font-medium text-gray-700">{page.slug}</span>
              {' '}— <StatusBadge status={page.status} />
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Agregar botón
          </button>
          <button
            onClick={saveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar cambios
          </button>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <Alert variant="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      {/* Error message */}
      {error && (
        <Alert variant="error" message={error} onClose={() => setError(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de botones */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="mt-3 text-sm text-gray-500">Cargando botones...</p>
              </div>
            </div>
          ) : buttons.length === 0 ? (
            <EmptyState
              icon={<MousePointerClick className="w-12 h-12" />}
              title="No hay botones aún"
              description="Agrega botones para que los visitantes puedan interactuar con tu página. Cada botón puede tener un icono, etiqueta y URL personalizada."
              action={{ label: 'Agregar primer botón', onClick: openAddModal }}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">
                  Botones ({buttons.length})
                </h2>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {buttons.map((btn, index) => {
                  const iconInfo = btn.icon ? getIconByKey(btn.icon) : undefined;
                  const IconComponent = iconInfo?.component;
                  const isHidden = btn.hidden === true;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group ${
                        isHidden ? 'opacity-50 bg-gray-50' : ''
                      }`}
                    >
                      {/* Drag handle / orden */}
                      <div className="flex flex-col items-center gap-1 text-gray-300">
                        <button
                          onClick={() => moveButton(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Mover arriba"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <GripVertical className="w-4 h-4" />
                        <button
                          onClick={() => moveButton(index, 'down')}
                          disabled={index === buttons.length - 1}
                          className="p-1 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Mover abajo"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Icono del botón */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${
                        isHidden ? 'bg-gray-100' : 'bg-blue-50'
                      }`}>
                        {IconComponent ? (
                          <IconComponent className={`w-5 h-5 ${isHidden ? 'text-gray-400' : 'text-blue-600'}`} />
                        ) : (
                          <MousePointerClick className={`w-5 h-5 ${isHidden ? 'text-gray-400' : 'text-gray-400'}`} />
                        )}
                      </div>

                      {/* Info del botón */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold ${isHidden ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {btn.label}
                          </p>
                          {isHidden && (
                            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                              Oculto
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                            {btn.key}
                          </span>
                          <span className="text-xs text-gray-400 truncate max-w-[200px]">{btn.url}</span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleHidden(index)}
                          className={`p-2 rounded-lg transition-colors ${
                            isHidden
                              ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                          }`}
                          title={isHidden ? 'Mostrar botón' : 'Ocultar botón'}
                        >
                          {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(index)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        </div>

        {/* Preview en vivo */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Vista previa en móvil</h2>
            </div>

            {/* Mockup de teléfono */}
            <div className="border-2 border-gray-200 rounded-3xl overflow-hidden bg-gray-50 shadow-lg">
              {/* Notch del teléfono */}
              <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-5 bg-gray-800 rounded-full"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-2.5 border border-gray-600 rounded-sm"></div>
                </div>
              </div>

              {/* Barra de estado */}
              <div className="bg-gray-900 px-4 py-1.5 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-medium">9:41</span>
                <div className="flex gap-1">
                  <div className="w-3 h-2 bg-gray-600 rounded-sm"></div>
                  <div className="w-3 h-2 bg-gray-600 rounded-sm"></div>
                  <div className="w-3 h-2 bg-gray-600 rounded-sm"></div>
                </div>
              </div>

              {/* Contenido del teléfono */}
              <div className="p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white min-h-[350px]">
                {/* Header de la página */}
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mx-auto mb-3 shadow-md"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded-lg w-1/2 mx-auto"></div>
                </div>

                {/* Botones (solo visibles) */}
                {buttons.filter(b => !b.hidden).length > 0 ? (
                  <div className="space-y-2.5">
                    {buttons.filter(b => !b.hidden).map((btn, index) => {
                      const iconInfo = btn.icon ? getIconByKey(btn.icon) : undefined;
                      const IconComponent = iconInfo?.component;
                      return (
                        <button
                          key={index}
                          className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                        >
                          {IconComponent ? (
                            <IconComponent className="w-4 h-4" />
                          ) : (
                            <MousePointerClick className="w-4 h-4" />
                          )}
                          <span className="flex-1 text-left">{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MousePointerClick className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-xs text-gray-400 font-medium">Agrega botones para verlos aquí</p>
                  </div>
                )}
              </div>

              {/* Home indicator */}
              <div className="bg-white px-4 py-2 flex justify-center">
                <div className="w-24 h-1 bg-gray-300 rounded-full"></div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-700">
                <strong>Tip:</strong> Usa los botones ↑↓ para reordenar. Los cambios se reflejan en tiempo real aquí.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Crear / Editar botón */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingIndex(null);
          setFormButton({ key: '', label: '', url: '', icon: '', hidden: false });
        }}
        title={editingIndex !== null ? 'Editar botón' : 'Agregar botón'}
        description={editingIndex !== null ? 'Modifica los datos del botón' : 'Agrega un nuevo botón a tu página'}
        size="lg"
      >
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Clave <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formButton.key}
                onChange={(e) => setFormButton({ ...formButton, key: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="whatsapp"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="mt-1 text-xs text-gray-400">Identificador único (sin espacios)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Etiqueta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formButton.label}
                onChange={(e) => setFormButton({ ...formButton, label: e.target.value })}
                placeholder="WhatsApp"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="mt-1 text-xs text-gray-400">Texto visible en el botón</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formButton.url}
              onChange={(e) => setFormButton({ ...formButton, url: e.target.value })}
              placeholder="https://wa.me/1234567890"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <p className="mt-1 text-xs text-gray-400">Enlace al que redirige el botón</p>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Icono</label>
            <IconSelector
              selectedKey={formButton.icon}
              onSelect={(key) => setFormButton({ ...formButton, icon: key })}
              placeholder="Buscar icono..."
            />
            <p className="mt-1 text-xs text-gray-400">Selecciona un icono para el botón (opcional)</p>
          </div>

          {/* Preview del botón en el modal */}
          {/* Checkbox: Ocultar botón */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <button
              type="button"
              onClick={() => setFormButton({ ...formButton, hidden: !formButton.hidden })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                formButton.hidden ? 'bg-amber-500' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={formButton.hidden}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formButton.hidden ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                {formButton.hidden ? 'Botón oculto' : 'Botón visible'}
              </p>
              <p className="text-xs text-gray-500">
                {formButton.hidden
                  ? 'Este botón no se mostrará en la página pública'
                  : 'Este botón se mostrará en la página pública'}
              </p>
            </div>
            {formButton.hidden ? (
              <EyeOff className="w-4 h-4 text-amber-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400" />
            )}
          </div>

          {/* Preview del botón en el modal */}
          {(formButton.label || formButton.icon) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vista previa del botón</label>
              <div className="bg-gray-50 rounded-xl p-4">
                {(() => {
                  const iconInfo = formButton.icon ? getIconByKey(formButton.icon) : undefined;
                  const IconComponent = iconInfo?.component;
                  return (
                    <button
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium shadow-sm transition-opacity ${
                        formButton.hidden
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      }`}
                    >
                      {IconComponent ? (
                        <IconComponent className="w-4 h-4" />
                      ) : (
                        <MousePointerClick className="w-4 h-4" />
                      )}
                      <span className="flex-1 text-left">
                        {formButton.label || 'Texto del botón'}
                      </span>
                      {formButton.hidden && (
                        <EyeOff className="w-4 h-4 opacity-50" />
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveButtonFromModal}
              disabled={!isFormValid}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {editingIndex !== null ? (
                <>
                  <Check className="w-4 h-4" />
                  Guardar cambios
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Agregar botón
                </>
              )}
            </button>
            <button
              onClick={() => {
                setModalOpen(false);
                setEditingIndex(null);
                setFormButton({ key: '', label: '', url: '', icon: '', hidden: false });
              }}
              className="px-4 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Confirmar eliminación */}
      <Modal
        isOpen={deleteConfirmIndex !== null}
        onClose={() => setDeleteConfirmIndex(null)}
        title="Eliminar botón"
        description="¿Estás seguro de que quieres eliminar este botón? Esta acción no se puede deshacer."
        size="sm"
      >
        <div className="p-6">
          {deleteConfirmIndex !== null && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm font-medium text-red-800">
                {buttons[deleteConfirmIndex]?.label}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {buttons[deleteConfirmIndex]?.url}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={deleteButton}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar botón
            </button>
            <button
              onClick={() => setDeleteConfirmIndex(null)}
              className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
