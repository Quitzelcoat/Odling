const API_BASE = (() => {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  return '';
})();

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = options.headers || {};

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  headers['Content-Type'] = headers['Content-Type'] || 'application/json';

  const resp = await fetch(url, { ...options, headers });

  const text = await resp.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = text;
    console.log('Failed to parse JSON response', e);
  }
  if (!resp.ok) {
    const error = (data && data.error) || resp.statusText || 'API error';
    const err = new Error(error);
    err.status = resp.status;
    err.body = data;
    throw err;
  }
  return data;
}
