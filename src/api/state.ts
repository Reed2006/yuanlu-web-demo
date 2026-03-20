/**
 * API状态管理器
 * 用于管理API请求的加载状态、错误状态等
 */

import { useState, useCallback } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  execute: () => Promise<void>;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Hook用于管理API状态
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  initialState: Partial<ApiState<T>> = {}
): UseApiResult<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    ...initialState,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({
        data: result,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        data: null,
      }));
      throw error;
    }
  }, [apiCall]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      loading: false,
      error: null,
      lastUpdated: data ? Date.now() : prev.lastUpdated,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      loading: false,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null,
    });
  }, []);

  return {
    ...state,
    execute,
    setData,
    setError,
    reset,
  };
}

/**
 * 批量API状态管理器
 */
export interface BatchApiState<T> {
  [key: string]: ApiState<T>;
}

export interface UseBatchApiResult<T> {
  states: BatchApiState<T>;
  execute: (key: string, apiCall: () => Promise<T>) => Promise<void>;
  setData: (key: string, data: T | null) => void;
  setError: (key: string, error: string | null) => void;
  reset: (key: string) => void;
  resetAll: () => void;
}

export function useBatchApi<T>(): UseBatchApiResult<T> {
  const [states, setStates] = useState<BatchApiState<T>>({});

  const execute = useCallback(async (key: string, apiCall: () => Promise<T>) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        data: prev[key]?.data || null,
        loading: true,
        error: null,
        lastUpdated: prev[key]?.lastUpdated || null,
      }
    }));

    try {
      const result = await apiCall();
      setStates(prev => ({
        ...prev,
        [key]: {
          data: result,
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setStates(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          loading: false,
          error: errorMessage,
          data: null,
        }
      }));
    }
  }, []);

  const setData = useCallback((key: string, data: T | null) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        data,
        loading: false,
        error: null,
        lastUpdated: data ? Date.now() : prev[key]?.lastUpdated || null,
      }
    }));
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        error,
        loading: false,
      }
    }));
  }, []);

  const reset = useCallback((key: string) => {
    setStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  const resetAll = useCallback(() => {
    setStates({});
  }, []);

  return {
    states,
    execute,
    setData,
    setError,
    reset,
    resetAll,
  };
}

/**
 * 带防抖的API调用
 */
export function useDebouncedApi<T>(
  apiCall: () => Promise<T>,
  delay: number = 300,
  initialState: Partial<ApiState<T>> = {}
): UseApiResult<T> {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const apiResult = useApi(apiCall, initialState);

  const debouncedExecute = useCallback(async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const id = setTimeout(() => {
      apiResult.execute();
      setTimeoutId(null);
    }, delay);

    setTimeoutId(id);
  }, [apiResult.execute, delay, timeoutId]);

  return {
    ...apiResult,
    execute: debouncedExecute,
  };
}

/**
 * API重试机制
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        break;
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // 指数退避
    }
  }

  throw lastError!;
}