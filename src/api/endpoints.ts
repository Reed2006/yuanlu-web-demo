/**
 * 缘旅（YuanLv）API文档
 * 
 * 本文件记录了所有可用的API端点及其用途
 */

/**
 * 认证相关 API
 */
export const AUTH_APIS = {
  REGISTER: '/auth/register',           // 注册用户
  LOGIN: '/auth/login',                 // 用户登录
  LOGOUT: '/auth/logout',               // 用户登出
  ME: '/auth/me',                       // 获取当前用户信息
  REFRESH: '/auth/refresh',             // 刷新令牌
} as const;

/**
 * 用户相关 API
 */
export const USER_APIS = {
  PROFILE: '/user/profile',             // 获取/更新用户资料
  STATS: '/user/stats',                 // 获取用户统计数据
  LEVEL: '/user/level',                 // 获取用户等级信息
  SETTINGS: '/user/settings',           // 获取/更新用户设置
} as const;

/**
 * 旅途相关 API
 */
export const TRAVEL_APIS = {
  START: '/travel/start',               // 开始旅途
  LOCATION: '/travel/location',         // 上传位置信息
  END: '/travel/end',                   // 结束旅途
  LIST: '/travel/list',                 // 获取旅行列表
  DETAILS: (id: string) => `/travel/${id}`, // 获取旅行详情
  ANCHORS: (id: string) => `/travel/${id}/anchors`, // 获取旅行锚点
  LOCATIONS: (id: string) => `/travel/${id}/locations`, // 获取旅行位置点
  DIARY: (id: string) => `/travel/${id}/diary`, // 获取旅行日记
  GENERATE_DIARY: (id: string) => `/travel/${id}/generate-diary`, // 生成旅行日记
} as const;

/**
 * 锚点相关 API
 */
export const ANCHOR_APIS = {
  CREATE_MANUAL: '/travel/anchor/manual', // 手动创建锚点
  DETAILS: (id: string) => `/travel/anchor/${id}`, // 获取锚点详情
  UPDATE: (id: string) => `/travel/anchor/${id}`, // 更新锚点
} as const;

/**
 * 时空胶囊相关 API
 */
export const CAPSULE_APIS = {
  CREATE: '/capsule/create',            // 创建胶囊
  NEARBY: '/capsule/nearby',            // 获取附近胶囊
  VERIFY: '/capsule/verify',            // 验证胶囊
  ECHO: '/capsule/echo',                // 添加回响
  MINE: '/capsule/mine',                // 获取我的胶囊
  DETAILS: (id: string) => `/capsule/${id}`, // 获取胶囊详情
} as const;

/**
 * 远洋瓶相关 API
 */
export const BOTTLE_APIS = {
  THROW: '/bottle/throw',               // 扔远洋瓶
  RECEIVE: '/bottle/receive',           // 捡远洋瓶
  MINE: '/bottle/mine',                 // 获取我的瓶子
  TRAJECTORY: (id: string) => `/bottle/trajectory/${id}`, // 获取瓶子轨迹
} as const;

/**
 * 社区相关 API
 */
export const COMMUNITY_APIS = {
  POSTS: '/community/posts',            // 获取帖子列表
  POST_DETAIL: (id: string) => `/community/posts/${id}`, // 获取帖子详情
  CREATE_POST: '/community/posts',      // 创建帖子
  LIKE_POST: (id: string) => `/community/posts/${id}/like`, // 点赞帖子
  UNLIKE_POST: (id: string) => `/community/posts/${id}/unlike`, // 取消点赞
  COMMENTS: (id: string) => `/community/posts/${id}/comments`, // 获取/添加评论
  POPULAR_TAGS: '/community/tags/popular', // 获取热门标签
  HEATMAP: '/community/heatmap',        // 获取情感热力图
} as const;

/**
 * 地图相关 API
 */
export const MAP_APIS = {
  CLIENT_CONFIG: '/map/client-config',  // 获取地图客户端配置
  CONTEXT: '/map/context',              // 获取位置上下文信息
  WEATHER: '/map/weather',              // 获取天气信息
} as const;

/**
 * 日记相关 API
 */
export const DIARY_APIS = {
  GET: (id: string) => `/travel/${id}/diary`, // 获取日记
  EXPORT: '/diary/export',              // 导出日记
  LIST: '/diary/list',                  // 获取日记列表
} as const;

/**
 * 通知相关 API
 */
export const NOTIFICATION_APIS = {
  LIST: '/notifications',               // 获取通知列表
  UNREAD: '/notifications/unread',      // 获取未读通知
  MARK_READ: (id: string) => `/notifications/${id}/read`, // 标记通知为已读
  DELETE: (id: string) => `/notifications/${id}`, // 删除通知
} as const;

/**
 * AI代理相关 API
 */
export const AGENT_APIS = {
  STATUS: '/agent/status',              // 获取AI代理状态
  TRAVEL_SENSE: '/agent/travel-sense',  // 旅行感知代理
  CONTENT_GEN: '/agent/content-gen',    // 内生成代理
  KEY_JUDGE: '/agent/key-judge',        // 钥题判定代理
} as const;

/**
 * 文件上传相关 API
 */
export const UPLOAD_APIS = {
  IMAGE: '/upload/image',               // 图片上传
  AUDIO: '/upload/audio',               // 音频上传
  FILE: '/upload/file',                 // 通用文件上传
} as const;

/**
 * 通用API工具函数
 */
export const API_UTILS = {
  /**
   * 构造带查询参数的URL
   */
  buildQueryUrl: (baseUrl: string, params?: Record<string, any>): string => {
    if (!params) return baseUrl;
    
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
    );
    
    const searchParams = new URLSearchParams(filteredParams);
    return `${baseUrl}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  },

  /**
   * 构造路径参数
   */
  buildPath: (template: string, params: Record<string, string | number>): string => {
    let result = template;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }
    return result;
  },
};

/**
 * API响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp?: string;
  requestId?: string;
}

/**
 * API错误响应格式
 */
export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

/**
 * 分页响应格式
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}