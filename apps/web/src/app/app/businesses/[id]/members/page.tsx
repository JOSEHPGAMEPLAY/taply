"use client";

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2, UserPlus, Users, X } from 'lucide-react';
import { api, type BusinessAccessRole, type BusinessMember, type BusinessMemberRole } from '@/lib/api';

interface BusinessSummary {
  id: string;
  name: string;
  accessRole: BusinessAccessRole;
}

const memberRoles: Array<{ value: BusinessMemberRole; label: string }> = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'ANALYST', label: 'Analista' },
  { value: 'VIEWER', label: 'Lector' },
];

const accessRoleLabels: Record<BusinessAccessRole, string> = {
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  ANALYST: 'Analista',
  VIEWER: 'Lector',
  GLOBAL_ADMIN: 'Administrador global',
};

export default function BusinessMembersPage() {
  const { id: businessId } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<BusinessSummary | null>(null);
  const [members, setMembers] = useState<BusinessMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<BusinessMemberRole>('EDITOR');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canManageMembers = business?.accessRole === 'OWNER' || business?.accessRole === 'GLOBAL_ADMIN';

  const loadMembers = useCallback(async () => {
    const data = await api.getBusinessMembers(businessId);
    setMembers(Array.isArray(data) ? data : []);
  }, [businessId]);

  const loadBusiness = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const businesses = await api.getBusinesses();
      const selectedBusiness = businesses.find((item) => item.id === businessId);
      if (!selectedBusiness) {
        setBusiness(null);
        setMembers([]);
        setError('No se encontró este negocio o no tienes acceso.');
        return;
      }

      setBusiness(selectedBusiness);
      if (selectedBusiness.accessRole === 'OWNER' || selectedBusiness.accessRole === 'GLOBAL_ADMIN') {
        await loadMembers();
      } else {
        setMembers([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la información del negocio');
    } finally {
      setLoading(false);
    }
  }, [businessId, loadMembers]);

  useEffect(() => {
    void loadBusiness();
  }, [loadBusiness]);

  const handleAddMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await api.addBusinessMember(businessId, { email: email.trim(), role });
      setEmail('');
      setSuccessMessage('Miembro agregado correctamente.');
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar el miembro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (member: BusinessMember, nextRole: BusinessMemberRole) => {
    try {
      setUpdatingUserId(member.userId);
      setError(null);
      await api.updateBusinessMemberRole(businessId, member.userId, nextRole);
      setSuccessMessage(`Rol de ${member.user.name || member.user.email} actualizado.`);
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el rol');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRemoveMember = async (member: BusinessMember) => {
    const memberName = member.user.name || member.user.email;
    if (!window.confirm(`¿Retirar el acceso de ${memberName} a este negocio?`)) return;

    try {
      setRemovingUserId(member.userId);
      setError(null);
      await api.removeBusinessMember(businessId, member.userId);
      setMembers((currentMembers) => currentMembers.filter((item) => item.userId !== member.userId));
      setSuccessMessage(`Acceso de ${memberName} retirado.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo retirar el acceso');
    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/app/businesses"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a negocios
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {business ? `Miembros de ${business.name}` : 'Miembros del negocio'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Administra quién puede acceder y qué puede hacer.</p>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div role="status" className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-green-700">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="p-1 text-green-700 hover:bg-green-100 rounded"
            aria-label="Cerrar mensaje"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {!loading && business && !canManageMembers && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Tu nivel de acceso</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{accessRoleLabels[business.accessRole]}</p>
          <p className="mt-2 text-sm text-gray-500">Solo el propietario o un administrador global puede gestionar miembros.</p>
        </section>
      )}

      {!loading && business && canManageMembers && (
        <>
          <form onSubmit={handleAddMember} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Dar acceso</h2>
              <p className="text-sm text-gray-500 mt-1">Agrega a alguien que ya tenga una cuenta en Taply.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end">
              <div>
                <label htmlFor="member-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="persona@empresa.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="member-role" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  id="member-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as BusinessMemberRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {memberRoles.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Agregar
              </button>
            </div>
          </form>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900">Personas con acceso</h2>
              </div>
              <span className="text-sm text-gray-500">{members.length}</span>
            </div>
            {members.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-gray-700">Todavía no hay miembros asignados</p>
                <p className="text-sm text-gray-500 mt-1">Agrega una cuenta para compartir el acceso a este negocio.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {members.map((member) => (
                  <li key={member.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{member.user.name || member.user.email}</p>
                      <p className="text-sm text-gray-500 truncate">{member.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      <label className="sr-only" htmlFor={`role-${member.userId}`}>Rol de {member.user.name || member.user.email}</label>
                      <select
                        id={`role-${member.userId}`}
                        value={member.role}
                        onChange={(event) => handleRoleChange(member, event.target.value as BusinessMemberRole)}
                        disabled={updatingUserId === member.userId || removingUserId === member.userId}
                        className="min-w-36 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                      >
                        {memberRoles.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member)}
                        disabled={updatingUserId === member.userId || removingUserId === member.userId}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        aria-label={`Retirar acceso de ${member.user.email}`}
                      >
                        {removingUserId === member.userId
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <X className="w-4 h-4" />}
                        <span className="hidden sm:inline">Retirar</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}