/**
 * Servicio HTTP para comunicación con la API de Taply.
 * Maneja tokens JWT, interceptores de error y serialización.
 *
 * CONTRATOS DE LA API — Referencia rápida:
 * - Auth: POST /auth/register, POST /auth/login, POST /auth/refresh, GET /auth/me
 * - Businesses: POST /businesses, GET /businesses, GET /businesses/:id, PATCH /businesses/:id, DELETE /businesses/:id
 * - Pages: POST /pages?businessId=X, GET /pages?businessId=X, GET /pages/:id?businessId=X, PATCH /pages/:id?businessId=X, DELETE /pages/:id?businessId=X, POST /pages/:id/publish?businessId=X
 * - NFC Tags: POST /nfc-tags?businessId=X, GET /nfc-tags?businessId=X, GET /nfc-tags/:id?businessId=X, POST /nfc-tags/:id/assign?businessId=X, POST /nfc-tags/:id/scan
 * - Analytics: GET /analytics/stats?pageId=X&startDate=X&endDate=X
 * - QR: POST /qr/generate, GET /qr/:pageId
 * - Public: GET /public/nfc/:token, POST /public/analytics/events
 *
 * IMPORTANTE: Pages y NFC Tags requieren businessId como QUERY PARAM, no en el body.
 */

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
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
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
   * Response: Array de negocios del usuario
   */
  async getBusinesses() {
    return apiRequest<Array<{ id: string; name: string; slug: string; status: string; createdAt: string }>>('GET', '/businesses');
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
   * Body: { name?: string, description?: string }
   * Response: Negocio actualizado
   */
  async updateBusiness(id: string, data: { name?: string; description?: string }) {
    return apiRequest<unknown>('PATCH', `/businesses/${id}`, data);
  },

  /**
   * DELETE /businesses/:id (requiere JWT)
   * Response: { message: 'Negocio eliminado correctamente' }
   */
  async deleteBusiness(id: string) {
    return apiRequest<{ message: string }>('DELETE', `/businesses/${id}`);
  },

  // ==========================================
  // Pages — businessId como QUERY PARAM
  // ==========================================

  /**
   * POST /pages?businessId=<uuid> (requiere JWT)
   * Body: { slug: string, templateId?: string, description?: string }
   * NOTE: businessId va como query param, NO en el body
   * Response: { id, slug, status, businessId, ... }
   */
  async createPage(businessId: string, data: { slug: string; templateId?: string; description?: string }) {
    return apiRequest<unknown>('POST', `/pages?businessId=${businessId}`, data);
  },

  /**
   * GET /pages?businessId=<uuid> (requiere JWT)
   * Response: Array de páginas del negocio
   */
  async getPages(businessId?: string) {
    const query = businessId ? `?businessId=${businessId}` : '';
    return apiRequest<unknown[]>('GET', `/pages${query}`);
  },

  /**
   * GET /pages/:id?businessId=<uuid> (requiere JWT)
   * Response: Página con versión publicada
   */
  async getPage(id: string, businessId: string) {
    return apiRequest<unknown>('GET', `/pages/${id}?businessId=${businessId}`);
  },

  /**
   * PATCH /pages/:id?businessId=<uuid> (requiere JWT)
   * Body: { slug?: string, templateId?: string }
   * Response: Página actualizada
   */
  async updatePage(id: string, businessId: string, data: { slug?: string; templateId?: string; buttons?: Array<{ key: string; label: string; url: string; icon?: string }> }) {
    return apiRequest<unknown>('PATCH', `/pages/${id}?businessId=${businessId}`, data);
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
    return apiRequest<unknown>('POST', `/pages/${id}/publish?businessId=${businessId}`);
  },

  // ==========================================
  // NFC Tags — businessId como QUERY PARAM
  // ==========================================

  /**
   * POST /nfc-tags?businessId=<uuid> (requiere JWT)
   * Body: { token?: string } — token opcional, se genera si no se proporciona
   * NOTE: businessId va como query param, NO en el body
   * Response: { id, token, status, ... }
   */
  async createNfcTag(businessId: string, data?: { token?: string }) {
    return apiRequest<unknown>('POST', `/nfc-tags?businessId=${businessId}`, data);
  },

  /**
   * GET /nfc-tags?businessId=<uuid> (requiere JWT)
   * Response: Array de etiquetas del negocio
   */
  async getNfcTags(businessId?: string) {
    const query = businessId ? `?businessId=${businessId}` : '';
    return apiRequest<unknown[]>('GET', `/nfc-tags${query}`);
  },

  /**
   * GET /nfc-tags/:id?businessId=<uuid> (requiere JWT)
   * Response: Etiqueta con asignación activa
   */
  async getNfcTag(id: string, businessId: string) {
    return apiRequest<unknown>('GET', `/nfc-tags/${id}?businessId=${businessId}`);
  },

  /**
   * POST /nfc-tags/:id/assign?businessId=<uuid> (requiere JWT)
   * Body: { pageId: string }
   * NOTE: businessId va como query param
   * Response: Asignación creada
   */
  async assignTag(tagId: string, businessId: string, pageId: string) {
    return apiRequest<unknown>('POST', `/nfc-tags/${tagId}/assign?businessId=${businessId}`, { pageId });
  },

  /**
   * POST /nfc-tags/:id/scan (requiere JWT)
   * Response: Escaneo registrado
   */
  async scanTag(tagId: string) {
    return apiRequest<unknown>('POST', `/nfc-tags/${tagId}/scan`);
  },

  // ==========================================
  // Analytics — pageId requerido, fechas opcionales
  // ==========================================

  /**
   * GET /analytics/stats?pageId=<uuid>&startDate=<date>&endDate=<date> (requiere JWT)
   * NOTE: Los parámetros de fecha son startDate y endDate, NO from/to
   * Response: { totalViews, totalClicks, totalScans, viewsByDay, clicksByButton }
   */
  async getStats(pageId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams({ pageId });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return apiRequest<unknown>('GET', `/analytics/stats?${params}`);
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
   * POST /public/analytics/events (sin autenticación)
   * Body: { type: 'PAGE_VIEW'|'BUTTON_CLICK'|'TAG_SCAN', pageId: string, tagId?: string, buttonKey?: string, metadata?: object }
   * Response: { id, type, pageId, ... }
   */
  async recordEvent(data: { type: 'PAGE_VIEW' | 'BUTTON_CLICK' | 'TAG_SCAN'; pageId: string; tagId?: string; buttonKey?: string; metadata?: Record<string, unknown> }) {
    return apiRequest<unknown>('POST', '/public/analytics/events', data);
  },
};
