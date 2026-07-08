import axios from 'axios';
import { useOfflineStore } from './store';
import * as mock from './mockData';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return '/api';
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
// MOCK RESOLVER — only used when isOffline=true (set by health check only)
// ---------------------------------------------------------------------------

function handleMockSearch(urlStr: string) {
  const queryPart = urlStr.split('?')[1] || '';
  const searchParams = new URLSearchParams(queryPart);
  const query = searchParams.get('query')?.toLowerCase() || '';
  const category = searchParams.get('category') || '';

  let results = [...mock.MOCK_LISTINGS];
  if (query) {
    results = results.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    );
  }
  if (category) {
    results = results.filter(item => item.category === category);
  }
  return { listings: results };
}

function resolveMockResponse(config: any) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  let data: any = null;
  console.warn(`[DEMO MODE] Serving mock data for: ${method.toUpperCase()} ${url}`);

  if (url.includes('/api/auth/login')) {
    data = { access_token: 'demo-token-readonly' };
  } else if (url.includes('/api/auth/register')) {
    data = { message: 'Demo mode: Registration not available. Backend is offline.' };
  } else if (url.includes('/api/auth/me')) {
    data = mock.MOCK_USER;
  } else if (url.includes('/api/listings/')) {
    const id = parseInt(url.split('/').pop() || '1');
    data = mock.MOCK_LISTINGS.find(item => item.id === id) || mock.MOCK_LISTINGS[0];
  } else if (url.includes('/api/listings')) {
    if (method === 'get') {
      data = mock.MOCK_LISTINGS;
    } else {
      data = {
        ...(config.data ? JSON.parse(config.data) : {}),
        id: Math.floor(Math.random() * 1000) + 10,
        created_at: new Date().toISOString(),
        fraud_score: 10,
        fraud_level: 'LOW',
      };
    }
  } else if (url.includes('/api/recommendations/trending')) {
    data = mock.MOCK_TRENDING_LISTINGS;
  } else if (url.includes('/api/wishlist')) {
    data = mock.MOCK_WISHLIST;
  } else if (url.includes('/api/offers/')) {
    data = { message: 'Offer updated (demo mode)' };
  } else if (url.includes('/api/offers')) {
    if (method === 'get') {
      data = mock.MOCK_OFFERS;
    } else {
      data = {
        ...(config.data ? JSON.parse(config.data) : {}),
        id: Math.floor(Math.random() * 1000) + 10,
        created_at: new Date().toISOString(),
        status: 'PENDING',
      };
    }
  } else if (url.includes('/api/search')) {
    data = handleMockSearch(url);
  } else if (url.includes('/api/ai/copilot')) {
    data = mock.MOCK_AI_RESPONSE;
  } else if (url.includes('/api/ai/description')) {
    data = { description: 'Clean, high-performance product in pristine working condition.' };
  } else if (url.includes('/api/ai/category')) {
    data = { category: 'Electronics' };
  } else if (url.includes('/api/ai/price')) {
    data = { suggested_price: 12500, min_price: 11000, max_price: 14000 };
  } else if (url.includes('/api/ai/fraud')) {
    data = { fraud_score: 12, fraud_level: 'LOW', reasons: ['Demo mode — no AI analysis.'] };
  } else if (url.includes('/api/seller/trust-score/')) {
    data = mock.MOCK_SELLER_TRUST_SCORE;
  } else if (url.includes('/api/ai/buyer-agent')) {
    data = { response: 'Demo mode: Negotiation advice unavailable.' };
  } else if (url.includes('/api/v2/chat/conversations/')) {
    const parts = url.split('/');
    if (url.endsWith('/messages')) {
      const convId = parseInt(parts[parts.length - 2]);
      data = mock.MOCK_MESSAGES[convId] || [];
    } else if (url.endsWith('/media')) {
      data = {
        id: Math.floor(Math.random() * 1000) + 10,
        sender_id: mock.MOCK_USER.id,
        message_type: 'image',
        media_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=60',
        is_delivered: true,
        is_read: true,
        created_at: new Date().toISOString(),
      };
    } else {
      data = { message: 'Action completed (demo mode)' };
    }
  } else if (url.includes('/api/v2/chat/conversations')) {
    if (method === 'get') {
      data = mock.MOCK_CONVERSATIONS;
    } else {
      data = mock.MOCK_CONVERSATIONS[0];
    }
  } else if (url.includes('/api/analytics/overview')) {
    data = mock.MOCK_ANALYTICS_OVERVIEW;
  } else if (url.includes('/api/analytics/insights')) {
    data = mock.MOCK_ANALYTICS_INSIGHTS;
  } else if (url.includes('/api/admin/overview')) {
    data = mock.MOCK_ADMIN_OVERVIEW;
  } else if (url.includes('/api/admin/users')) {
    data = mock.MOCK_ADMIN_USERS;
  } else if (url.includes('/api/admin/listings')) {
    data = mock.MOCK_ADMIN_LISTINGS;
  } else if (url.includes('/api/admin/reports')) {
    data = mock.MOCK_ADMIN_REPORTS;
  } else if (url.includes('/api/admin/verifications')) {
    data = mock.MOCK_ADMIN_VERIFICATIONS;
  } else if (url.includes('/api/admin/settings')) {
    data = mock.MOCK_ADMIN_SETTINGS;
  } else if (url.includes('/api/admin/audit-logs')) {
    data = mock.MOCK_ADMIN_AUDIT_LOGS;
  } else {
    data = {};
  }

  return {
    data,
    status: 200,
    statusText: 'OK (Demo)',
    headers: {},
    config,
  };
}

// ---------------------------------------------------------------------------
// REQUEST INTERCEPTOR
// Attaches auth token. If explicitly offline (health check failed), serves mock.
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    // Only use mock if isOffline was explicitly set by health check
    if (useOfflineStore.getState().isOffline) {
      return Promise.reject({
        __is_offline_shortcut__: true,
        config,
      });
    }

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
// - Offline shortcut → mock response
// - 401 → clear auth and redirect to login
// - Network errors → propagate normally (DO NOT set offline mode here)
//   The health check in SessionProvider is the ONLY place that sets offline mode.
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle demo/offline shortcut (set by health check)
    if (error && error.__is_offline_shortcut__) {
      return Promise.resolve(resolveMockResponse(error.config));
    }

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
