// Thin fetch wrapper around the CMS API.
const BASE_URL = '/api/v1';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options,
  });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error?.message || `request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),

  // portfolio
  fetchPortfolio: () => api.get('/portfolio'),
  // admin
  login: (username, password) => api.post('/admin/auth/login', { username, password }),
  logout: () => api.post('/admin/auth/logout'),
  me: () => api.get('/admin/me'),
  upload: async (file, folder = 'misc') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const res = await fetch(`${BASE_URL}/admin/upload`, {
      method: 'POST',
      credentials: 'include',
      body: fd,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.error?.message || 'upload failed');
    return body;
  },
};