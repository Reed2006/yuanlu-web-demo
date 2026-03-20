import { get, post } from './client';
import type { UserProfile } from './types';

export const userApi = {
  /** 获取用户信息 */
  getProfile: async (userId: string): Promise<UserProfile> => {
    return await get<UserProfile>(`/user/profile?user_id=${userId}`);
  },

  /** 更新用户信息 */
  updateProfile: async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    return await post<UserProfile>('/user/profile', { user_id: Number(userId), ...data });
  },

  /** 获取用户统计数据 */
  getUserStats: async (userId: string) => {
    return await get(`/user/stats?user_id=${userId}`);
  },
};