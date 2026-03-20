import { get, post } from './client';
import type { DiaryResponse } from './types';

export const diaryApi = {
  /** 获取旅行日记 */
  getDiary: async (travelId: string): Promise<DiaryResponse> => {
    return await get<DiaryResponse>(`/travel/${travelId}/diary`);
  },

  /** 生成旅行日记 */
  generateDiary: async (travelId: string) => {
    return await post(`/travel/${travelId}/generate-diary`, {});
  },

  /** 获取日记列表 */
  getList: async (userId: string, limit = 20) => {
    return await get(`/diary/list?user_id=${userId}&limit=${limit}`);
  },

  /** 导出日记 */
  exportDiary: async (travelId: string, exportType: 'notebook' | 'map') => {
    return await post(`/diary/export`, {
      travel_id: Number(travelId),
      export_type: exportType,
    });
  },
};