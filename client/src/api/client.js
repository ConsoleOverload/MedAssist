// Clean and normalize API base URL
const getBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (!envUrl) {
    return '/api/v1';
  }
  // Strip trailing slashes
  let sanitized = envUrl.replace(/\/+$/, '');

  // If user provided origin only without API path (e.g. https://xyz.onrender.com),
  // automatically ensure it points to the API route prefix /api/v1
  if (!sanitized.endsWith('/api/v1') && !sanitized.endsWith('/api')) {
    sanitized = `${sanitized}/api/v1`;
  }
  return sanitized;
};

const BASE_URL = getBaseUrl();

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('medassist_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  // Ensure clean single slash join and collapse any duplicate slashes (preserving protocol https:// or http://)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${BASE_URL}${cleanEndpoint}`.replace(/([^:]\/)\/+/g, '$1');

  const response = await fetch(fullUrl, config);

  if (response.status === 401) {
    // If unauthorized, clear token and notify auth state
    localStorage.removeItem('medassist_token');
    localStorage.removeItem('medassist_user');
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login?expired=1';
    }
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = result.error || result.message || 'Request failed';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.details = result.details;
    throw err;
  }

  return result.data !== undefined ? result.data : result;
}

export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
