"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Store, CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';

/**
 * Panel de administración de negocios.
 * Solo accesible por usuarios con rol ADMIN.
 */
export default function AdminBusinessesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    status: string;
    ownerId: string;
    owner?: { email: string; name: string };
    createdAt: string;
    updatedAt: string;
  }>>([]);
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    prospect: number;
    suspended: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const statusOptions = ['ACTIVE', 'PROSPECT', 'SUSPENDED', 'PAUSED', 'CLOSED'];

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
      const businessesData = await api.getAdminBusinesses();
      setBusinesses(businessesData);
      setStats({
        total: businessesData.length,
        active: businessesData.filter((b) => b.status === 'ACTIVE').length,
        prospect: businessesData.filter((b) => b.status === 'PROSPECT').length,
        suspended: businessesData.filter((b) => b.status === 'SUSPENDED').length,
      });
    } catch {
      setError('No se pudieron cargar los negocios');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (businessId: string, newStatus: string) => {
    try {
      await api.updateBusinessStatus(businessId, newStatus);
      setBusinesses((prev) =>
        prev.map((b) => (b.id === businessId ? { ...b, status: newStatus } : b))
      );
      setSuccessMessage(`Estado actualizado a ${newStatus}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      loadData();
    } catch {
      setError('No se pudo cambiar el estado');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      PROSPECT: 'bg-yellow-100 text-yellow-800',
      SUSPENDED: 'bg-red-100 text-red-800',
      PAUSED: 'bg-orange-100 text-orange-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Activo',
      PROSPECT: 'Prospecto',
      SUSPENDED: 'Suspendido',
      PAUSED: 'Pausado',
      CLOSED: 'Cerrado',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando negocios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Store className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Negocios</h1>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Negocios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Prospectos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.prospect}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Suspendidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          ✅ {successMessage}
        </div>
      )}

      {/* Businesses table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Negocio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {businesses.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{b.name}</span>
                      <span className="block text-xs text-gray-500">{b.slug}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {b.owner?.email || 'Sin owner'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(b.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(b.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(b.id, status)}
                          disabled={b.status === status}
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            b.status === status
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:opacity-80 cursor-pointer'
                          } ${
                            status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : status === 'PROSPECT'
                              ? 'bg-yellow-100 text-yellow-700'
                              : status === 'SUSPENDED'
                              ? 'bg-red-100 text-red-700'
                              : status === 'PAUSED'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                          title={`Cambiar a ${status}`}
                        >
                          {status === 'ACTIVE'
                            ? 'Activo'
                            : status === 'PROSPECT'
                            ? 'Prospecto'
                            : status === 'SUSPENDED'
                            ? 'Suspendido'
                            : status === 'PAUSED'
                            ? 'Pausado'
                            : 'Cerrado'}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {businesses.length === 0 && (
          <div className="text-center py-12 text-gray-500">No hay negocios registrados</div>
        )}
      </div>
    </div>
  );
}
