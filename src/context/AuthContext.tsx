import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { DEMO_USER } from '../data/mockData';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  onboardingCompleted: boolean;
}

interface AuthActionResult {
  ok: boolean;
  message?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  register: (name: string, email: string, password: string) => Promise<AuthActionResult>;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Demo版AuthProvider - 自动以Demo用户身份登录
 * 无需后端，完全前端写死
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const user: AuthUser = {
    id: DEMO_USER.id,
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    createdAt: DEMO_USER.createdAt,
    onboardingCompleted: DEMO_USER.onboardingCompleted,
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: true,
      needsOnboarding: false,
      isHydrating: false,
      login: async () => ({ ok: true }),
      register: async () => ({ ok: true }),
      logout: () => { /* Demo模式不需要退出 */ },
      completeOnboarding: () => { /* 已完成 */ },
    }),
    []
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
