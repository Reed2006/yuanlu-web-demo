// 前端API统一管理入口
export { authApi } from './auth';
export { journeyApi } from './journey';
export { communityApi } from './community';
export { memoryApi } from './memory';
export { userApi } from './user';
export { mapApi } from './map';
export { capsuleApi } from './capsule';
export { bottleApi } from './bottle';
export { diaryApi } from './diary';

// 工具函数
export { 
  ApiError, 
  requestWithRetry, 
  fetchPaginated, 
  uploadFile, 
  batchRequests 
} from './utils';

// 缓存管理
export { 
  apiCache, 
  requestWithCache, 
  cacheKeys, 
  cacheUtils 
} from './cache';

// 状态管理
export { 
  useApi, 
  useBatchApi, 
  useDebouncedApi, 
  retryApiCall,
  type ApiState,
  type UseApiResult,
  type BatchApiState,
  type UseBatchApiResult
} from './state';

// 拦截器
export { 
  interceptorManager, 
  requestWithInterceptors,
  authInterceptor,
  loggingInterceptor,
  errorHandlingInterceptor
} from './interceptors';

// API端点定义
export * from './endpoints';

// 类型定义
export * from './types';