/**
 * Demo Mode Controller
 *
 * Toggle demo mode on/off. When enabled, AppStateContext intercepts all
 * API calls and returns hardcoded data from demoData.ts instead.
 */

const DEMO_KEY = 'yuanlu_demo_mode';
const DEFAULT_DEMO_MODE = import.meta.env.VITE_DEFAULT_DEMO_MODE === '1';

function getStoredDemoMode(): '1' | '0' | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(DEMO_KEY);
  return value === '1' || value === '0' ? value : null;
}

export function isDemoMode(): boolean {
  const stored = getStoredDemoMode();
  if (stored === '1') return true;
  if (stored === '0') return false;
  return DEFAULT_DEMO_MODE;
}

export function enableDemoMode(): void {
  window.localStorage.setItem(DEMO_KEY, '1');
}

export function disableDemoMode(): void {
  if (DEFAULT_DEMO_MODE) {
    window.localStorage.setItem(DEMO_KEY, '0');
    return;
  }
  window.localStorage.removeItem(DEMO_KEY);
}

export function toggleDemoMode(): boolean {
  if (isDemoMode()) {
    disableDemoMode();
    return false;
  }
  enableDemoMode();
  return true;
}

export function ensureDemoSession(): void {
  if (typeof window === 'undefined' || !isDemoMode()) return;

  if (!window.localStorage.getItem('yuanlv_user')) {
    window.localStorage.setItem(
      'yuanlv_user',
      JSON.stringify({
        username: 'demo',
        userId: 1,
        nickname: '旅行者小缘',
        loggedIn: true,
      }),
    );
  }

  if (!window.localStorage.getItem('yuanlv_onboarded')) {
    window.localStorage.setItem('yuanlv_onboarded', 'true');
  }
}
