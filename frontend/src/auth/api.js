// src/auth/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function isPlainObject(v) {
  return v && typeof v === 'object' && v.constructor === Object;
}

async function request(path, { method = 'GET', body, token } = {}) {
  if (!path.startsWith('/')) path = '/' + path;

  const headers = {};
  let payload;

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    payload = body;
  } else if (
    typeof URLSearchParams !== 'undefined' &&
    body instanceof URLSearchParams
  ) {
    payload = body;
  } else if (isPlainObject(body)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  } else if (body !== undefined) {
    payload = body;
  } else {
    payload = undefined;
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: payload,
    credentials: 'include',
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

export default { request };
