import axios from 'axios';
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return '';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ---------------------------------------------------------------------------
// REQUEST INTERCEPTOR
// Attaches auth token.
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sb_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// RESPONSE INTERCEPTOR
// - 401 → clear auth and redirect to login
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {

    const { response } = error;

    // Standard 401 — clear auth and redirect to login
    if (response && response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb_auth_token');
        localStorage.removeItem('sb_auth_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // NOTE: We do NOT call setIsOffline(true) here.
    // Individual request failures (network errors, 5xx) are surfaced to the
    // calling page so it can display an appropriate error message.
    // Only the periodic health check in SessionProvider triggers demo mode.

    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Error formatter utility
// ---------------------------------------------------------------------------
export function formatError(err: any): string {
  if (!err) return '';
  if (typeof err === 'string') return err;

  const detail = err.response?.data?.detail;
  if (detail) {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((e: any) => {
          if (e && typeof e === 'object') {
            const locStr = Array.isArray(e.loc)
              ? e.loc.filter((l: any) => l !== 'body' && l !== 'query').join('.')
              : '';
            return `${locStr ? locStr + ': ' : ''}${e.msg || JSON.stringify(e)}`;
          }
          return String(e);
        })
        .join(', ');
    }
    if (typeof detail === 'object') {
      if (detail.msg) return detail.msg;
      return JSON.stringify(detail);
    }
  }

  const message = err.response?.data?.message || err.response?.data?.msg;
  if (message && typeof message === 'string') return message;
  if (err.message && typeof err.message === 'string') return err.message;

  try {
    return JSON.stringify(err);
  } catch (e) {
    return String(err);
  }
}

export default api;
