"use client";

import { useEffect, useState } from 'react';
import {
  LayoutTemplate,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  Palette,
  Image as ImageIcon,
  Type,
  Monitor,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

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
 * Opciones de gradiente de fondo predefinidas.
 */
const bgGradients = [
  { name: 'Oscuro elegante', value: 'from-gray-900 via-slate-900 to-gray-900', preview: 'bg-gray-900' },
  { name: 'Azul profundo', value: 'from-blue-900 via-indigo-900 to-slate-900', preview: 'bg-blue-900' },
  { name: 'Púrpura noche', value: 'from-purple-900 via-indigo-900 to-slate-900', preview: 'bg-purple-900' },
  { name: 'Verde bosque', value: 'from-green-900 via-emerald-900 to-slate-900', preview: 'bg-green-900' },
  { name: 'Rojo atardecer', value: 'from-red-900 via-orange-900 to-slate-900', preview: 'bg-red-900' },
  { name: 'Claro minimalista', value: 'from-gray-50 via-white to-blue-50', preview: 'bg-gray-100' },
  { name: 'Cielo claro', value: 'from-blue-50 via-cyan-50 to-white', preview: 'bg-blue-50' },
  { name: 'Rosa suave', value: 'from-pink-50 via-rose-50 to-white', preview: 'bg-pink-50' },
];

/**
 * Estilos de botón predefinidos.
 */
const buttonStyles = [
  { name: 'Redondeado', value: 'rounded', class: 'rounded-2xl' },
  { name: 'Cuadrado', value: 'square', class: 'rounded-lg' },
  { name: 'Píldora', value: 'pill', class: 'rounded-full' },
];

/**
 * Página de gestión de templates con editor visual.
 * Permite crear templates con personalización completa: colores, formas, logo, fondo.
 */
export default function TemplatesPage() {
  const { user } = useAuth();
  const canManageTemplates = user?.role === 'ADMIN';
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
  });

  // Template config
  const [templateConfig, setTemplateConfig] = useState({
    bgGradient: 'from-gray-900 via-slate-900 to-gray-900',
    buttonStyle: 'rounded',
    logoUrl: '',
    primaryColor: '#3b82f6',
  });

  /**
   * Carga los templates desde la API.
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getTemplates().catch(() => []);
      setTemplates((Array.isArray(data) ? data : []) as Template[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({ name: '', description: '', version: '' });
    setTemplateConfig({
      bgGradient: 'from-gray-900 via-slate-900 to-gray-900',
      buttonStyle: 'rounded',
      logoUrl: '',
      primaryColor: '#3b82f6',
    });
    setShowModal(true);
  };

  const openEditModal = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      version: template.version,
    });
    const cfg = template.config?.template || {};
    setTemplateConfig({
      bgGradient: cfg.bgGradient || 'from-gray-900 via-slate-900 to-gray-900',
      buttonStyle: cfg.buttonStyle || 'rounded',
      logoUrl: cfg.logoUrl || '',
      primaryColor: cfg.primaryColor || '#3b82f6',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        version: formData.version.trim() || undefined,
        config: {
          template: {
            bgGradient: templateConfig.bgGradient,
            buttonStyle: templateConfig.buttonStyle,
            logoUrl: templateConfig.logoUrl || undefined,
            primaryColor: templateConfig.primaryColor,
          },
        },
      };

      if (editingTemplate) {
        await api.updateTemplate(editingTemplate.id, data);
        showSuccess('Template actualizado correctamente');
      } else {
        await api.createTemplate(data);
        showSuccess('Template creado correctamente');
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (template: Template) => {
    if (!confirm(`¿Estás seguro de eliminar "${template.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await api.deleteTemplate(template.id);
      showSuccess('Template eliminado correctamente');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el template');
    }
  };

  // Preview config from template
  const getPreviewConfig = (template: Template) => {
    const cfg = template.config?.template || {};
    return {
      bgGradient: cfg.bgGradient || 'from-gray-900 via-slate-900 to-gray-900',
      buttonStyle: cfg.buttonStyle || 'rounded',
      logoUrl: cfg.logoUrl || '',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Diseña templates personalizados para tus páginas digitales</p>
        </div>
        {canManageTemplates && (
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            Nuevo template
          </Button>
        )}
      </div>

      {/* Alerts */}
      {successMessage && (
        <Alert variant="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}
      {error && (
        <Alert variant="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Empty state */}
      {templates.length === 0 && (
        <EmptyState
          icon={<LayoutTemplate className="w-12 h-12" />}
          title="No tienes templates aún"
          description="Crea templates para personalizar el diseño de tus páginas digitales con colores, formas y logo."
          action={canManageTemplates ? { label: 'Crear primer template', onClick: openCreateModal } : undefined}
        />
      )}

      {/* Templates grid */}
      {templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const preview = getPreviewConfig(template);
            const shapeMap: Record<string, string> = {
              rounded: 'rounded-2xl',
              square: 'rounded-lg',
              pill: 'rounded-full',
            };
            const buttonShapeClass = shapeMap[preview.buttonStyle] || 'rounded-2xl';

            return (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Preview */}
                <div className={`h-40 bg-gradient-to-br ${preview.bgGradient} relative p-4`}>
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
                  </div>
                  <div className="relative h-full flex flex-col items-center justify-center">
                    {preview.logoUrl ? (
                      <img
                        src={preview.logoUrl}
                        alt={template.name}
                        className="w-10 h-10 rounded-lg object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border border-white/20">
                        <span className="text-white text-sm font-bold">
                          {template.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 w-full space-y-2">
                      <div className={`h-8 bg-white/10 border border-white/10 ${buttonShapeClass}`} />
                      <div className={`h-8 bg-white/10 border border-white/10 ${buttonShapeClass}`} />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{template.name}</h3>
                      {template.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{template.description}</p>
                      )}
                    </div>
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                      {template.version}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">
                      {new Date(template.createdAt).toLocaleDateString('es-ES')}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`/app/templates/${template.id}`}
                        className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-gray-100"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      {canManageTemplates && (
                        <>
                          <button
                            onClick={() => openEditModal(template)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(template)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal && canManageTemplates}
        onClose={() => setShowModal(false)}
        title={editingTemplate ? 'Editar template' : 'Nuevo template'}
        description="Personaliza el diseño de tu página digital"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Type className="w-4 h-4 inline mr-1" />
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mi template"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Versión</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="1.0.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción opcional del template"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Personalización visual
            </h3>

            {/* Background gradient */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Monitor className="w-4 h-4 inline mr-1" />
                Fondo
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bgGradients.map((gradient) => (
                  <button
                    key={gradient.value}
                    type="button"
                    onClick={() => setTemplateConfig({ ...templateConfig, bgGradient: gradient.value })}
                    className={`h-12 ${gradient.preview} rounded-lg border-2 transition-all ${
                      templateConfig.bgGradient === gradient.value
                        ? 'border-blue-500 ring-2 ring-blue-500/20 scale-105'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    title={gradient.name}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {bgGradients.find((g) => g.value === templateConfig.bgGradient)?.name || 'Selecciona un fondo'}
              </p>
            </div>

            {/* Button style */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forma de botones
              </label>
              <div className="flex gap-3">
                {buttonStyles.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setTemplateConfig({ ...templateConfig, buttonStyle: style.value })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                      templateConfig.buttonStyle === style.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className={`w-8 h-3 bg-current opacity-30 ${style.class}`} />
                    <span className="text-sm">{style.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                URL del logo
              </label>
              <input
                type="url"
                value={templateConfig.logoUrl}
                onChange={(e) => setTemplateConfig({ ...templateConfig, logoUrl: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL de la imagen del logo del negocio (opcional)
              </p>
              {templateConfig.logoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={templateConfig.logoUrl}
                    alt="Preview logo"
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="text-xs text-gray-500">Vista previa del logo</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Vista previa</h3>
            {(() => {
              const shapeMap: Record<string, string> = {
                rounded: 'rounded-2xl',
                square: 'rounded-lg',
                pill: 'rounded-full',
              };
              const previewShape = shapeMap[templateConfig.buttonStyle] || 'rounded-2xl';
              return (
                <div className={`h-48 bg-gradient-to-br ${templateConfig.bgGradient} rounded-xl relative overflow-hidden p-4`}>
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
                  </div>
                  <div className="relative h-full flex flex-col items-center justify-center">
                    {templateConfig.logoUrl ? (
                      <img
                        src={templateConfig.logoUrl}
                        alt="Logo preview"
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-white/20 shadow-lg">
                        <span className="text-white text-lg font-bold">
                          {formData.name?.charAt(0)?.toUpperCase() || 'T'}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 w-full max-w-[200px] space-y-2">
                      <div className={`h-8 bg-white/10 border border-white/10 ${previewShape} flex items-center px-3`}>
                        <span className="text-white text-xs">Botón de ejemplo</span>
                      </div>
                      <div className={`h-8 bg-white/10 border border-white/10 ${previewShape} flex items-center px-3`}>
                        <span className="text-white text-xs">Otro botón</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !formData.name.trim()}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </span>
              ) : editingTemplate ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
