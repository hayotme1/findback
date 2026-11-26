// Backend bilan ishlash uchun yordamchi funksiyalar
const Auth = {
  get token() { try { return localStorage.getItem('token'); } catch { return null; } },
  get user() { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } },
  save(token, user) {
    try { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); } catch { /* ignore */ }
  },
  clear() {
    try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch { /* ignore */ }
  },
  get loggedIn() { return !!this.token; },
};

class ApiError extends Error {
  constructor(code, status) { super(code); this.code = code; this.status = status; }
}

async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  if (Auth.token) headers.Authorization = `Bearer ${Auth.token}`;
  let payload;
  if (form) payload = form; // FormData (rasm bilan)
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError('network', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && Auth.loggedIn) Auth.clear();
    throw new ApiError(data.error || 'server_error', res.status);
  }
  return data;
}

function errorText(err) {
  return t(`err.${err.code || 'server_error'}`);
}
