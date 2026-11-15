/**
 * Servicio HTTP para comunicación con la API de Taply.
 * Maneja tokens JWT, interceptores de error y serialización.
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
 */
export const api = {
  // Auth
  async register(data: { email: string; password: string; name: string }) {
    return apiRequest<{ user: object; accessToken: string; refreshToken: string }>(
      'POST',
      '/auth/register',
      data
    );
  },
  async login(data: { email: string; password: string }) {
    return apiRequest<{ user: object; accessToken: string; refreshToken: string }>(
      'POST',
      '/auth/login',
      data
    );
  },
  async getMe() {
    return apiRequest<{ id: string; email: string; name: string }>('GET', '/auth/me');
  },

  // Businesses
  async createBusiness(data: { name: string; description?: string }) {
    return apiRequest<unknown>('POST', '/businesses', data);
  },
  async getBusinesses() {
    return apiRequest<unknown[]>('GET', '/businesses');
  },
  async getBusiness(id: string) {
    return apiRequest<unknown>('GET', `/businesses/${id}`);
  },
  async updateBusiness(id: string, data: { name?: string; description?: string; status?: string }) {
    return apiRequest<unknown>('PATCH', `/businesses/${id}`, data);
  },
  async deleteBusiness(id: string) {
    return apiRequest<unknown>('DELETE', `/businesses/${id}`);
  },

  // Pages
  async createPage(data: { businessId: string; slug: string; templateId?: string }) {
    return apiRequest<unknown>('POST', '/pages', data);
  },
  async getPages(businessId: string) {
    return apiRequest<unknown[]>('GET', `/pages?businessId=${businessId}`);
  },
  async publishPage(id: string) {
    return apiRequest<unknown>('POST', `/pages/${id}/publish`);
  },

  // NFC Tags
  async createNfcTag(data: { businessId: string }) {
    return apiRequest<unknown>('POST', '/nfc-tags', data);
  },
  async getNfcTags(businessId: string) {
    return apiRequest<unknown[]>('GET', `/nfc-tags?businessId=${businessId}`);
  },
  async assignTag(tagId: string, pageId: string) {
    return apiRequest<unknown>('POST', `/nfc-tags/${tagId}/assign`, { pageId });
  },

  // Analytics
  async getStats(pageId: string, from?: string, to?: string) {
    const params = new URLSearchParams({ pageId });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return apiRequest<unknown>('GET', `/analytics/stats?${params}`);
  },

  // QR
  async generateQr(pageId: string) {
    return apiRequest<unknown>('POST', '/qr/generate', { pageId });
  },
  async getQr(pageId: string) {
    return apiRequest<unknown>('GET', `/qr/${pageId}`);
  },

  // Public
  async resolveNfc(token: string) {
    return apiRequest<unknown>('GET', `/public/nfc/${token}`);
  },
  async recordEvent(data: { type: string; pageId: string; tagId?: string; buttonKey?: string }) {
    return apiRequest<unknown>('POST', '/public/analytics/events', data);
  },
};
