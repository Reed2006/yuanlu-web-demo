import { isDemoMode } from './demoMode';
import { demoApiHandler } from './demoApi';

export const DEFAULT_API_BASE = (() => {
  const envBase = import.meta.env.VITE_API_BASE as string | undefined;
  if (envBase) return envBase;
  // In production (frontend served by the same FastAPI backend), use the current origin
  // so that mobile devices can reach the API correctly.
  // Only fall back to localhost during local development.
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return window.location.origin;
    }
  }
  return 'http://127.0.0.1:8000';
})();

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

export async function requestJson<T>(apiBase: string, path: string, options: RequestOptions = {}): Promise<T> {
  // In demo mode, intercept all API calls and return mock data
  if (isDemoMode()) {
    await new Promise(r => setTimeout(r, 100 + Math.random() * 150));
    return demoApiHandler<T>(path, options.method || 'GET', options.body);
  }

  const base = apiBase.replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      message = String(data.detail || data.error || message);
    } catch {
      // ignore invalid json
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
