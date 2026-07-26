function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // In production/cloud deployment (non-localhost hostname), use relative /api path
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return '/api';
  }
  return 'http://localhost:5000/api';
}

const API_BASE_URL = getApiBaseUrl();

function getToken() {
  return localStorage.getItem('foodshare_token');
}

/**
 * Generic fetch wrapper.
 * - Automatically attaches JWT bearer token when present.
 * - Automatically sets JSON headers unless a FormData body is passed.
 * - Throws a normalized Error with `.status` and `.data` on failure.
 */
async function request(path, { method = 'GET', body, isFormData = false, headers = {} } = {}) {
  const token = getToken();

  const finalHeaders = { ...headers };
  if (!isFormData) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts = {}) => request(path, { method: 'PUT', body, ...opts }),
  patch: (path, body, opts = {}) => request(path, { method: 'PATCH', body, ...opts }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export { getToken };

