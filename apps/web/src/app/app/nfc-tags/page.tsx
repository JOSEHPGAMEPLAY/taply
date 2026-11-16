"use client";

import { useEffect, useState } from 'react';
import {
  Radio,
  Plus,
  X,
  Check,
  AlertCircle,
  Loader2,
  Link,
  QrCode,
  Copy,
} from 'lucide-react';
import { api } from '@/lib/api';

/**
 * Tipos para los datos de la etiqueta NFC.
 */
interface NfcTag {
  id: string;
  token: string;
  status: string;
  businessId: string;
  programmedUrl: string | null;
  createdAt: string;
}

/**
 * Tipos para los negocios y páginas (para los selectores).
 */
interface Business {
  id: string;
  name: string;
}

interface Page {
  id: string;
  slug: string;
  businessId: string;
}

/**
 * Página de gestión de etiquetas NFC con CRUD y asignación.
 * Permite crear, listar, asignar a páginas y generar QR.
 */
export default function NfcTagsPage() {
  const [tags, setTags] = useState<NfcTag[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<NfcTag | null>(null);
  const [formData, setFormData] = useState({ businessId: '' });
  const [assignData, setAssignData] = useState({ pageId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [filterBusinessId, setFilterBusinessId] = useState<string>('');

  /**
   * Carga las etiquetas, negocios y páginas desde la API.
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [bizData, tagsData, pagesData] = await Promise.all([
        api.getBusinesses().catch(() => []),
        api.getNfcTags(filterBusinessId).catch(() => []),
        api.getPages('').catch(() => []),
      ]);

      setBusinesses((Array.isArray(bizData) ? bizData : []) as Business[]);
      setTags((Array.isArray(tagsData) ? tagsData : []) as NfcTag[]);
      setPages((Array.isArray(pagesData) ? pagesData : []) as Page[]);
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
   * Abre el modal para crear una nueva etiqueta.
   */
  const openCreateModal = () => {
    setFormData({ businessId: filterBusinessId });
    setShowModal(true);
  };

  /**
   * Crea una nueva etiqueta NFC.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessId) return;

    try {
      setSubmitting(true);
      await api.createNfcTag(formData.businessId);
      showSuccess('Etiqueta NFC creada correctamente');
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la etiqueta');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Abre el modal para asignar una etiqueta a una página.
   */
  const openAssignModal = (tag: NfcTag) => {
    setSelectedTag(tag);
    setAssignData({ pageId: '' });
    setShowAssignModal(true);
  };

  /**
   * Asigna una etiqueta a una página.
   */
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTag || !assignData.pageId) return;

    try {
      setSubmitting(true);
      await api.assignTag(selectedTag.id, selectedTag.businessId, assignData.pageId);
      showSuccess('Etiqueta asignada correctamente');
      setShowAssignModal(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar la etiqueta');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Genera un código QR para la página asignada a la etiqueta.
   */
  const handleGenerateQr = async (tag: NfcTag) => {
    setSelectedTag(tag);
    setQrDataUrl(null);
    setShowQrModal(true);

    try {
      // Find the page assigned to this tag
      const assignedPage = pages.find((p) => p.businessId === tag.businessId);
      if (assignedPage) {
        const result = await api.generateQr(assignedPage.id);
        // Assuming the API returns { dataUrl: 'data:image/...' }
        if (result && typeof result === 'object' && 'dataUrl' in result) {
          setQrDataUrl(result.dataUrl as string);
        }
      } else {
        setError('Asigna una página a la etiqueta antes de generar el QR');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el QR');
    }
  };

  /**
   * Copia el token al portapapeles.
   */
  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token).then(() => {
      showSuccess('Token copiado al portapapeles');
    });
  };

  /**
   * Renderiza el badge del estado de la etiqueta.
   */
  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      PROGRAMMED: 'bg-blue-100 text-blue-700',
      INACTIVE: 'bg-gray-100 text-gray-700',
      PENDING_PROGRAMMING: 'bg-yellow-100 text-yellow-700',
      LOST: 'bg-red-100 text-red-700',
      DAMAGED: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Activa',
      PROGRAMMED: 'Programada',
      INACTIVE: 'Inactiva',
      PENDING_PROGRAMMING: 'Pendiente',
      LOST: 'Perdida',
      DAMAGED: 'Dañada',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Filter pages by selected tag's business
  const getPagesForTag = (tag: NfcTag) => {
    return pages.filter((p) => p.businessId === tag.businessId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etiquetas NFC</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus etiquetas NFC y códigos QR</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Nueva etiqueta
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
      {!loading && tags.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Radio className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No tienes etiquetas aún</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Crea etiquetas NFC para que los clientes puedan acceder a tus páginas digitales con un solo toque.
          </p>
          {businesses.length > 0 && (
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Crear primera etiqueta
            </button>
          )}
        </div>
      )}

      {/* Tags table */}
      {!loading && tags.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Token</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Creada</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag) => (
                  <tr key={tag.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-medium text-gray-900">{tag.token}</p>
                        <button
                          onClick={() => copyToken(tag.token)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Copiar token"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">{statusBadge(tag.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(tag.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openAssignModal(tag)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Asignar a página"
                        >
                          <Link className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleGenerateQr(tag)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Generar QR"
                        >
                          <QrCode className="w-4 h-4" />
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
              <h2 className="text-lg font-semibold text-gray-900">Nueva etiqueta NFC</h2>
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
                  onChange={(e) => setFormData({ businessId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                >
                  <option value="">Selecciona un negocio</option>
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>{biz.name}</option>
                  ))}
                </select>
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
                  disabled={submitting || !formData.businessId}
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

      {/* Assign modal */}
      {showAssignModal && selectedTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Asignar etiqueta</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssign} className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Token: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">{selectedTag.token}</code>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Página <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignData.pageId}
                  onChange={(e) => setAssignData({ pageId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                >
                  <option value="">Selecciona una página</option>
                  {getPagesForTag(selectedTag).map((page) => (
                    <option key={page.id} value={page.id}>{page.slug}</option>
                  ))}
                </select>
                {getPagesForTag(selectedTag).length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No hay páginas para este negocio. Crea una página primero.
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !assignData.pageId || getPagesForTag(selectedTag).length === 0}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Asignando...
                    </span>
                  ) : 'Asignar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Código QR</h2>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              {qrDataUrl ? (
                <div>
                  <img src={qrDataUrl} alt="QR Code" className="mx-auto w-48 h-48" />
                  <p className="mt-4 text-sm text-gray-500">
                    Escanea este código QR para acceder a la página.
                  </p>
                </div>
              ) : (
                <div className="py-8">
                  <QrCode className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="mt-3 text-sm text-gray-500">
                    No se pudo generar el QR. Asegúrate de que la etiqueta tiene una página asignada.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
