"use client";

import { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';

/**
 * Tipos para los datos del negocio.
 */
interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  createdAt: string;
}

/**
 * Página de gestión de negocios con CRUD completo.
 * Permite crear, listar, editar y eliminar negocios del usuario.
 */
export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Carga la lista de negocios desde la API.
   */
  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await api.getBusinesses();
      setBusinesses((Array.isArray(data) ? data : []) as Business[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los negocios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  /**
   * Muestra el mensaje de éxito y lo oculta después de 3 segundos.
   */
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  /**
   * Abre el modal para crear un nuevo negocio.
   */
  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  /**
   * Abre el modal para editar un negocio existente.
   */
  const openEditModal = (biz: Business) => {
    setEditingId(biz.id);
    setFormData({ name: biz.name, description: biz.description || '' });
    setShowModal(true);
  };

  /**
   * Guarda el negocio (crear o actualizar).
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      if (editingId) {
        await api.updateBusiness(editingId, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
        showSuccess('Negocio actualizado correctamente');
      } else {
        await api.createBusiness({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
        showSuccess('Negocio creado correctamente');
      }
      setShowModal(false);
      await loadBusinesses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el negocio');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Elimina un negocio después de confirmar.
   */
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este negocio? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      await api.deleteBusiness(id);
      showSuccess('Negocio eliminado correctamente');
      await loadBusinesses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el negocio');
    }
  };

  /**
   * Cambia el estado del negocio (activo/pausado).
   */
  const toggleStatus = async (biz: Business) => {
    const newStatus = biz.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.updateBusiness(biz.id, { status: newStatus });
      showSuccess(`Negocio ${newStatus === 'ACTIVE' ? 'activado' : 'pausado'}`);
      await loadBusinesses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado');
    }
  };

  /**
   * Renderiza el badge del estado del negocio.
   */
  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      PAUSED: 'bg-yellow-100 text-yellow-700',
      SUSPENDED: 'bg-red-100 text-red-700',
      PROSPECT: 'bg-blue-100 text-blue-700',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Activo',
      PAUSED: 'Pausado',
      SUSPENDED: 'Suspendido',
      PROSPECT: 'Prospecto',
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
          <h1 className="text-2xl font-bold text-gray-900">Negocios</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus negocios y configuraciones</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Nuevo negocio
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

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && businesses.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No tienes negocios aún</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Crea tu primer negocio para comenzar a gestionar páginas y etiquetas NFC.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Crear primer negocio
          </button>
        </div>
      )}

      {/* Businesses table */}
      {!loading && businesses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Nombre</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden md:table-cell">Slug</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Creado</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((biz) => (
                  <tr key={biz.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{biz.name}</p>
                      <p className="text-xs text-gray-500 md:hidden">{biz.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">{biz.slug}</td>
                    <td className="px-6 py-4">{statusBadge(biz.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(biz.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(biz)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title={biz.status === 'ACTIVE' ? 'Pausar' : 'Activar'}
                        >
                          {biz.status === 'ACTIVE' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(biz)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(biz.id)}
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

      {/* Create/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Editar negocio' : 'Nuevo negocio'}
              </h2>
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
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Mi negocio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe tu negocio brevemente"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                />
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
                  disabled={submitting || !formData.name.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </span>
                  ) : editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
