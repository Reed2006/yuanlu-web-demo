/**
 * API工具函数
 * 包含常用的API操作辅助函数
 */

/** 
 * API请求错误处理
 */
export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * 带重试机制的API请求
 */
export async function requestWithRetry<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
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

/**
 * 分页请求处理器
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  [key: string]: any;
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 统一的分页请求函数
 */
export async function fetchPaginated<T>(
  fetchFn: (params: PaginationParams) => Promise<PaginationResponse<T>>,
  params: Omit<PaginationParams, 'page' | 'pageSize'> & { page?: number; pageSize?: number }
): Promise<PaginationResponse<T>> {
  const { page = 1, pageSize = 10, ...otherParams } = params;
  
  return await fetchFn({
    page,
    pageSize,
    ...otherParams
  });
}

/**
 * 文件上传函数
 */
export async function uploadFile(file: File, uploadUrl: string, onProgress?: (progress: number) => void): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject(new ApiError('Upload failed', xhr.status));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new ApiError('Network error during upload', 0));
    });
    
    const formData = new FormData();
    formData.append('file', file);
    
    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
}

/**
 * 批量请求函数
 */
export async function batchRequests<T>(requests: (() => Promise<T>)[]): Promise<(T | Error)[]> {
  const results = await Promise.allSettled(requests.map(req => req()));
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : result.reason
  );
}