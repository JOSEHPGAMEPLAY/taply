/**
 * Servicio HTTP para comunicación con la API de Taply.
 * Maneja tokens JWT, interceptores de error y serialización.
 *
 * CONTRATOS DE LA API — Referencia rápida:
 * - Auth: POST /auth/register, POST /auth/login, POST /auth/refresh, GET /auth/me
 * - Dashboard: GET /dashboard/summary
 * - Businesses: POST /businesses, GET /businesses, GET /businesses/:id, PATCH /businesses/:id, DELETE /businesses/:id
 * - Pages: POST /pages?businessId=X, GET /pages?businessId=X, GET /pages/:id?businessId=X, PATCH /pages/:id?businessId=X, DELETE /pages/:id?businessId=X, POST /pages/:id/publish?businessId=X
 * - NFC Tags: POST /nfc-tags?businessId=X, GET /nfc-tags?businessId=X, GET /nfc-tags/:id?businessId=X, POST /nfc-tags/:id/assign?businessId=X, POST /nfc-tags/:id/scan
 * - Analytics: GET /analytics/stats?pageId=X&startDate=X&endDate=X
 * - QR: POST /qr/generate, GET /qr/:pageId
 * - Public: GET /public/nfc/:token, POST /public/analytics/events
 *
 * IMPORTANTE: Pages y NFC Tags requieren businessId como QUERY PARAM, no en el body.
 */

import { SessionExpiredError } from '@/lib/session-error';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Obtiene el token de acceso del localStorage.
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Headers comunes para las requests.
 */
function getHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Realiza una request a la API y parsea la respuesta JSON.
 */
async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${API_URL}${path}`;
  const response = await fetch(url, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    // Si el token es inválido (401) y estamos en una ruta protegida, limpiar tokens y lanzar SessionExpiredError
    // para que el auth-context maneje la redirección con mensaje al usuario
    if (response.status === 401 && typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const isProtectedRoute = pathname.startsWith('/app');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (isProtectedRoute) {
        throw new SessionExpiredError();
      }
    }
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export interface DashboardSummary {
  businesses: number;
  pages: number;
  nfcTags: number;
}

export type BusinessAccessRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'ANALYST' | 'VIEWER' | 'GLOBAL_ADMIN';
export type BusinessMemberRole = 'ADMIN' | 'EDITOR' | 'ANALYST' | 'VIEWER';

export interface BusinessMember {
  id: string;
  userId: string;
  role: BusinessMemberRole;
  createdAt: string;
  user: { name: string; email: string };
}

/**
 * API client con métodos para cada módulo.
 * Cada método sigue el contrato exacto definido en Swagger/OpenAPI.
 */
export const api = {
  // ==========================================
  // Auth — Sin businessId, sin query params
  // ==========================================

  /**
   * GET /dashboard/summary (requiere JWT)
   * Response: { businesses: number, pages: number, nfcTags: number }
   */
  async getDashboardSummary() {
    return apiRequest<DashboardSummary>('GET', '/dashboard/summary');
  },

  /**
   * POST /auth/register
   * Body: { email: string, password: string, name?: string }
   * Password: min 8 chars, mayúscula, minúscula, número
   * Response: { user: { id, email, name }, accessToken, refreshToken }
   */
  async register(data: { email: string; password: string; name?: string }) {
    return apiRequest<{ user: { id: string; email: string; name: string }; accessToken: string; refreshToken: string }>(
      'POST',
      '/auth/register',
      data
    );
  },

  /**
   * POST /auth/login
   * Body: { email: string, password: string }
   * Response: { user: { id, email, name }, accessToken, refreshToken }
   */
  async login(data: { email: string; password: string }) {
    return apiRequest<{ user: { id: string; email: string; name: string }; accessToken: string; refreshToken: string }>(
      'POST',
      '/auth/login',
      data
    );
  },

  /**
   * POST /auth/refresh
   * Body: { refreshToken: string }
   * Response: { accessToken: string }
   */
  async refreshTokens(refreshToken: string) {
    return apiRequest<{ accessToken: string }>('POST', '/auth/refresh', { refreshToken });
  },

  /**
   * GET /auth/me (requiere JWT)
   * Response: { id, email, name, role }
   */
  async getMe() {
    return apiRequest<{ id: string; email: string; name: string; role: string }>('GET', '/auth/me');
  },

  // ==========================================
  // Businesses — Sin businessId en params
  // ==========================================

  /**
   * POST /businesses (requiere JWT)
   * Body: { name: string, description?: string }
   * Response: { id, name, slug, description, status, ownerId, createdAt, updatedAt }
   */
  async createBusiness(data: { name: string; description?: string }) {
    return apiRequest<{ id: string; name: string; slug: string; description?: string; status: string; ownerId: string; createdAt: string; updatedAt: string }>(
      'POST',
      '/businesses',
      data
    );
  },

  /**
   * GET /businesses (requiere JWT)
   * Response: Array de negocios del usuario con su acceso y propietario
   */
  async getBusinesses() {
    return apiRequest<Array<{
      id: string;
      name: string;
      slug: string;
      status: string;
      ownerId: string;
      accessRole: BusinessAccessRole;
      createdAt: string;
    }>>('GET', '/businesses');
  },

  /**
   * GET /businesses/:id (requiere JWT)
   * Response: Negocio si pertenece al usuario
   */
  async getBusiness(id: string) {
    return apiRequest<{ id: string; name: string; slug: string; description?: string; status: string; ownerId: string }>('GET', `/businesses/${id}`);
  },

  /**
   * PATCH /businesses/:id (requiere JWT)
   * Body: { name?: string, description?: string, status?: string }
   * Response: Negocio actualizado
   */
  async updateBusiness(id: string, data: { name?: string; description?: string; status?: string }) {
    return apiRequest<{ id: string; name: string; slug: string; description?: string; status: string; ownerId: string; createdAt: string; updatedAt: string }>(
      'PATCH',
      `/businesses/${id}`,
      data
    );
  },

  /**
   * DELETE /businesses/:id (requiere JWT)
   * Response: { message: 'Negocio eliminado correctamente' }
   */
  async deleteBusiness(id: string) {
    return apiRequest<{ message: string }>('DELETE', `/businesses/${id}`);
  },

  /**
   * GET /businesses/:id/members (requiere JWT)
   */
  async getBusinessMembers(id: string) {
    return apiRequest<BusinessMember[]>('GET', `/businesses/${encodeURIComponent(id)}/members`);
  },

  /**
   * POST /businesses/:id/members (requiere JWT)
   * Body: { email: string, role: BusinessMemberRole }
   */
  async addBusinessMember(id: string, data: { email: string; role: BusinessMemberRole }) {
    return apiRequest<BusinessMember>('POST', `/businesses/${encodeURIComponent(id)}/members`, data);
  },

  /**
   * PATCH /businesses/:id/members/:userId (requiere JWT)
   * Body: { role: BusinessMemberRole }
   */
  async updateBusinessMemberRole(id: string, userId: string, role: BusinessMemberRole) {
    return apiRequest<BusinessMember>(
      'PATCH',
      `/businesses/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}`,
      { role }
    );
  },

  /**
   * DELETE /businesses/:id/members/:userId (requiere JWT)
   */
  async removeBusinessMember(id: string, userId: string) {
    return apiRequest<{ message: string }>(
      'DELETE',
      `/businesses/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}`
    );
  },

  // ==========================================
  // Pages — businessId como QUERY PARAM
  // ==========================================

  /**
   * POST /pages?businessId=<uuid> (requiere JWT)
   * Body: { slug: string, templateId?: string, description?: string }
   * NOTE: businessId va como query param, NO en el body
   * Response: { id, slug, status, businessId, templateId, publishedVersionId, createdAt, updatedAt }
   */
  async createPage(businessId: string, data: { slug: string; templateId?: string; description?: string }) {
    return apiRequest<{ id: string; slug: string; status: string; businessId: string; templateId?: string; publishedVersionId: string | null; createdAt: string; updatedAt: string }>(
      'POST',
      `/pages?businessId=${businessId}`,
      data
    );
  },

  /**
   * GET /pages?businessId=<uuid> (requiere JWT)
   * Response: Array de páginas del negocio
   */
  async getPages(businessId?: string) {
    const query = businessId ? `?businessId=${businessId}` : '';
    return apiRequest<Array<{ id: string; slug: string; status: string; businessId: string; templateId?: string; publishedVersionId: string | null; createdAt: string; updatedAt: string; versions?: Array<{ id: string; status: string; config: Record<string, unknown>; buttons: Array<{ key: string; label: string; url: string; icon?: string }> }> }>>(
      'GET',
      `/pages${query}`
    );
  },

  /**
   * GET /pages/:id?businessId=<uuid> (requiere JWT)
   * Response: Página con versión publicada
   */
  async getPage(id: string, businessId: string) {
    return apiRequest<{ id: string; slug: string; status: string; businessId: string; templateId?: string; publishedVersionId: string | null; createdAt: string; updatedAt: string; versions: Array<{ id: string; status: string; config: Record<string, unknown>; buttons: Array<{ key: string; label: string; url: string; icon?: string }> }> }>(
      'GET',
      `/pages/${id}?businessId=${businessId}`
    );
  },

  /**
   * PATCH /pages/:id?businessId=<uuid> (requiere JWT)
   * Body: { slug?: string, templateId?: string, buttons?: Array<...> }
   * Response: Página actualizada
   */
  async updatePage(id: string, businessId: string, data: { slug?: string; templateId?: string | null; buttons?: Array<{ key: string; label: string; url: string; icon?: string }> }) {
    return apiRequest<{ id: string; slug: string; status: string; businessId: string; templateId?: string; publishedVersionId: string | null; createdAt: string; updatedAt: string }>(
      'PATCH',
      `/pages/${id}?businessId=${businessId}`,
      data
    );
  },

  /**
   * GET /pages/slug/:slug/check?businessId=<uuid> (requiere JWT)
   * Response: { available: boolean }
   */
  async checkSlugAvailable(businessId: string, slug: string) {
    return apiRequest<{ available: boolean }>('GET', `/pages/slug/${slug}/check?businessId=${businessId}`);
  },

  /**
   * DELETE /pages/:id?businessId=<uuid> (requiere JWT)
   * Response: { message: 'Página eliminada' }
   */
  async deletePage(id: string, businessId: string) {
    return apiRequest<{ message: string }>('DELETE', `/pages/${id}?businessId=${businessId}`);
  },

  /**
   * POST /pages/:id/publish?businessId=<uuid> (requiere JWT)
   * NOTE: businessId va como query param
   * Response: Página publicada
   */
  async publishPage(id: string, businessId: string) {
    return apiRequest<{ id: string; slug: string; status: string; businessId: string; publishedVersionId: string; createdAt: string; updatedAt: string }>(
      'POST',
      `/pages/${id}/publish?businessId=${businessId}`
    );
  },

  /**
   * POST /pages/:id/unpublish?businessId=<uuid> (requiere JWT)
   * NOTE: businessId va como query param
   * Response: Página despublicada (status DRAFT, publishedVersionId null)
   */
  async unpublishPage(id: string, businessId: string) {
    return apiRequest<{ id: string; slug: string; status: string; businessId: string; publishedVersionId: string | null; createdAt: string; updatedAt: string }>(
      'POST',
      `/pages/${id}/unpublish?businessId=${businessId}`
    );
  },

  /**
   * PATCH /pages/:id/status?businessId=<uuid> (requiere JWT)
   * Body: { status: 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'ARCHIVED' }
   * NOTE: businessId va como query param
   * Response: Página con estado actualizado
   */
  async updatePageStatus(id: string, businessId: string, status: string) {
    return apiRequest<{ id: string; slug: string; status: string; businessId: string; publishedVersionId: string | null; createdAt: string; updatedAt: string }>(
      'PATCH',
      `/pages/${id}/status?businessId=${businessId}`,
      { status }
    );
  },

  // ==========================================
  // NFC Tags — businessId como QUERY PARAM
  // ==========================================

  /**
   * POST /nfc-tags?businessId=<uuid> (requiere JWT)
   * Body: { token?: string } — token opcional, se genera si no se proporciona
   * NOTE: businessId va como query param, NO en el body
   * Response: { id, token, status, businessId, assignedPageId, createdAt, updatedAt }
   */
  async createNfcTag(businessId: string, data?: { token?: string }) {
    return apiRequest<{ id: string; token: string; status: string; businessId: string; assignedPageId: string | null; createdAt: string; updatedAt: string }>(
      'POST',
      `/nfc-tags?businessId=${businessId}`,
      data
    );
  },

  /**
   * GET /nfc-tags?businessId=<uuid> (requiere JWT)
   * Response: Array de etiquetas del negocio
   */
  async getNfcTags(businessId?: string) {
    const query = businessId ? `?businessId=${businessId}` : '';
    return apiRequest<Array<{ id: string; token: string; status: string; businessId: string; assignedPageId: string | null; createdAt: string; updatedAt: string; assignment?: { pageId: string; pageSlug: string } }>>(
      'GET',
      `/nfc-tags${query}`
    );
  },

  /**
   * GET /nfc-tags/:id?businessId=<uuid> (requiere JWT)
   * Response: Etiqueta con asignación activa
   */
  async getNfcTag(id: string, businessId: string) {
    return apiRequest<{ id: string; token: string; status: string; businessId: string; assignedPageId: string | null; createdAt: string; updatedAt: string; assignment?: { pageId: string; pageSlug: string } }>(
      'GET',
      `/nfc-tags/${id}?businessId=${businessId}`
    );
  },

  /**
   * POST /nfc-tags/:id/assign?businessId=<uuid> (requiere JWT)
   * Body: { pageId: string }
   * NOTE: businessId va como query param
   * Response: Asignación creada
   */
  async assignTag(tagId: string, businessId: string, pageId: string) {
    return apiRequest<{ id: string; tagId: string; pageId: string; createdAt: string }>(
      'POST',
      `/nfc-tags/${tagId}/assign?businessId=${businessId}`,
      { pageId }
    );
  },

  /**
   * POST /nfc-tags/:id/unassign?businessId=<uuid> (requiere JWT)
   * Devuelve la etiqueta al inventario y finaliza su asignación activa.
   */
  async unassignTag(tagId: string, businessId: string) {
    return apiRequest<{ id: string; token: string; status: string; businessId: string }>(
      'POST',
      `/nfc-tags/${tagId}/unassign?businessId=${businessId}`
    );
  },

  /**
   * DELETE /nfc-tags/:id?businessId=<uuid> (requiere JWT)
   */
  async deleteNfcTag(tagId: string, businessId: string) {
    return apiRequest<{ message: string }>('DELETE', `/nfc-tags/${tagId}?businessId=${businessId}`);
  },

  /**
   * POST /nfc-tags/:id/scan (requiere JWT)
   * Response: Escaneo registrado
   */
  async scanTag(tagId: string) {
    return apiRequest<{ id: string; tagId: string; scannedAt: string }>('POST', `/nfc-tags/${tagId}/scan`);
  },

  // ==========================================
  // Analytics — pageId requerido, fechas opcionales
  // ==========================================

  /**
   * GET /analytics/stats?pageId=<uuid>&startDate=<date>&endDate=<date> (requiere JWT)
   * NOTE: Los parámetros de fecha son startDate y endDate, NO from/to
   * Response: { totalViews, totalClicks, totalScans, viewsByDay, clicksByButton }
   */
  async getStats(pageId: string, startDate?: string, endDate?: string, rangeDays?: number) {
    const params = new URLSearchParams({ pageId });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (rangeDays !== undefined) params.set('rangeDays', String(rangeDays));
    return apiRequest<{
      totalViews: number;
      totalClicks: number;
      totalScans: number;
      viewsByDay: Array<{ date: string; count: number }>;
      clicksByButton: Array<{ button: string; count: number }>;
    }>('GET', `/analytics/stats?${params}`);
  },

  async exportAnalyticsCsv(pageId: string, rangeDays = 30): Promise<Blob> {
    const params = new URLSearchParams({ pageId, rangeDays: String(rangeDays) });
    const response = await fetch(`${API_URL}/analytics/export?${params}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        const isProtectedRoute = window.location.pathname.startsWith('/app');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (isProtectedRoute) throw new SessionExpiredError();
      }
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    return response.blob();
  },

  // ==========================================
  // QR — Requiere JWT
  // ==========================================

  /**
   * POST /qr/generate (requiere JWT)
   * Body: { pageId: string }
   * Response: { id, pageId, dataUrl, publicUrl, createdAt }
   */
  async generateQr(pageId: string) {
    return apiRequest<{ id: string; pageId: string; dataUrl: string; publicUrl: string; createdAt: string }>('POST', '/qr/generate', { pageId });
  },

  /**
   * GET /qr/:pageId (requiere JWT)
   * Response: { id, pageId, dataUrl, publicUrl, page: { slug, businessName }, createdAt }
   */
  async getQr(pageId: string) {
    return apiRequest<{ id: string; pageId: string; dataUrl: string; publicUrl: string; page: { slug: string; businessName: string }; createdAt: string }>('GET', `/qr/${pageId}`);
  },

  // ==========================================
  // Public — Sin autenticación
  // ==========================================

  /**
   * GET /public/nfc/:token (sin autenticación)
   * Response: { redirectUrl, page: { slug }, business: { name } }
   * Error 404 si la etiqueta no tiene asignación
   */
  async resolveNfc(token: string) {
    return apiRequest<{ redirectUrl: string; page: { slug: string }; business: { name: string } }>('GET', `/public/nfc/${token}`);
  },

  /**
   * Obtiene los datos públicos de una página por slug (sin autenticación).
   */
  async getPublicPage(slug: string) {
    return apiRequest<{
      page: { id: string; slug: string };
      business: { id: string; name: string; description: string };
      publishedVersion: { config: any; buttons: Array<{ key: string; label: string; url: string; icon?: string }> };
    }>('GET', `/public/pages/${slug}`);
  },

  /**
   * POST /public/analytics/events (sin autenticación)
   * Body: { type: 'PAGE_VIEW'|'BUTTON_CLICK'|'TAG_SCAN', pageId: string, tagId?: string, buttonKey?: string, metadata?: object }
   * Response: { id, type, pageId, ... }
   */
  async recordEvent(data: { type: 'PAGE_VIEW' | 'BUTTON_CLICK' | 'TAG_SCAN'; pageId: string; tagId?: string; buttonKey?: string; metadata?: Record<string, unknown> }) {
    return apiRequest<{ id: string; type: string; pageId: string; tagId?: string; buttonKey?: string; createdAt: string }>('POST', '/public/analytics/events', data);
  },

  // ==========================================
  // Admin — Solo accesible con rol ADMIN
  // ==========================================

  /**
   * GET /admin/users (requiere JWT + rol ADMIN)
   * Response: Array de usuarios
   */
  async getAdminUsers() {
    return apiRequest<Array<{ id: string; email: string; name: string; role: string; createdAt: string }>>('GET', '/admin/users');
  },

  /**
   * PATCH /admin/users/:id/role (requiere JWT + rol ADMIN)
   * Body: { role: 'ADMIN' | 'USER' }
   */
  async updateUserRole(id: string, role: string) {
    return apiRequest<{ id: string; email: string; name: string; role: string; createdAt: string }>(
      'PATCH',
      `/admin/users/${id}/role`,
      { role }
    );
  },

  /**
   * DELETE /admin/users/:id (requiere JWT + rol ADMIN)
   */
  async deleteUser(id: string) {
    return apiRequest<{ message: string }>('DELETE', `/admin/users/${id}`);
  },

  /**
   * GET /admin/users/stats (requiere JWT + rol ADMIN)
   */
  async getAdminStats() {
    return apiRequest<{ total: number; admins: number; users: number; latestUserAt: string | null }>('GET', '/admin/users/stats');
  },

  /**
   * GET /admin/businesses (requiere JWT + rol ADMIN)
   * Response: Array de todos los negocios con info del owner
   */
  async getAdminBusinesses() {
    return apiRequest<Array<{
      id: string;
      name: string;
      slug: string;
      description?: string;
      status: string;
      ownerId: string;
      owner?: { email: string; name: string };
      createdAt: string;
      updatedAt: string;
    }>>('GET', '/admin/businesses');
  },

  /**
   * PATCH /admin/businesses/:id/status (requiere JWT + rol ADMIN)
   * Body: { status: 'ACTIVE' | 'PROSPECT' | 'SUSPENDED' | 'PAUSED' | 'CLOSED' }
   */
  async updateBusinessStatus(id: string, status: string) {
    return apiRequest<{
      id: string;
      name: string;
      slug: string;
      description?: string;
      status: string;
      ownerId: string;
      createdAt: string;
      updatedAt: string;
    }>('PATCH', `/admin/businesses/${id}/status`, { status });
  },

  /**
   * GET /admin/analytics/overview (requiere JWT + rol ADMIN)
   * Response: Métricas globales de la plataforma
   */
  async getAdminAnalyticsOverview() {
    return apiRequest<{
      users: { total: number; active: number; last30Days: number };
      businesses: { total: number; active: number; last30Days: number };
      pages: { total: number; published: number };
      tags: { total: number; active: number };
      events: { total: number; pageViews: number; buttonClicks: number; tagScans: number; last30Days: number };
    }>('GET', '/admin/analytics/overview');
  },

  // ==========================================
  // Templates — Requiere JWT, sin businessId
  // ==========================================

  /**
   * GET /templates (requiere JWT)
   * Response: Array de templates globales
   */
  async getTemplates() {
    return apiRequest<Array<{ id: string; name: string; description?: string; config?: Record<string, any>; version: string; createdAt: string }>>('GET', '/templates');
  },

  /**
   * GET /templates/:id (requiere JWT)
   * Response: Template individual
   */
  async getTemplate(id: string) {
    return apiRequest<{ id: string; name: string; description?: string; config?: Record<string, any>; version: string; createdAt: string }>('GET', `/templates/${id}`);
  },

  /**
   * POST /templates (requiere JWT)
   * Body: { name: string, description?: string, config?: object, version?: string }
   * Response: Template creado
   */
  async createTemplate(data: { name: string; description?: string; config?: Record<string, any>; version?: string }) {
    return apiRequest<{ id: string; name: string; description?: string; config?: Record<string, any>; version: string }>('POST', '/templates', data);
  },

  /**
   * PATCH /templates/:id (requiere JWT)
   * Body: { name?: string, description?: string, config?: object, version?: string }
   * Response: Template actualizado
   */
  async updateTemplate(id: string, data: { name?: string; description?: string; config?: Record<string, any>; version?: string }) {
    return apiRequest<{ id: string; name: string; description?: string; config?: Record<string, any>; version: string }>('PATCH', `/templates/${id}`, data);
  },

  /**
   * DELETE /templates/:id (requiere JWT)
   * Response: { message: 'Template eliminado correctamente' }
   */
  async deleteTemplate(id: string) {
    return apiRequest<{ message: string }>('DELETE', `/templates/${id}`);
  },
};
