/**
 * 旅途相关 API
 */

import { get, post, request } from './client';
import { cacheUtils } from './cache';
import type {
  JourneySummary,
  CapsuleUnlockResult,
  LocationPoint,
  AnchorData,
  DiaryResponse,
  TravelStartResult,
  CapsuleVerifyResult,
  TravelDetail,
  TravelLocation,
} from './types';

export const journeyApi = {
  /** 开始旅途 */
  start: async (userId: string, city?: string): Promise<TravelStartResult> =>
    post<TravelStartResult>('/travel/start', { user_id: Number(userId), city }),

  /** 批量上传位置 */
  uploadLocations: async (travelId: string | number, points: LocationPoint[]): Promise<void> => {
    try {
      await post('/travel/location', {
        travel_id: Number(travelId),
        points: points.map((point) => ({
          ...point,
          timestamp: new Date(point.timestamp).toISOString(),
        })),
      });
    } catch {
      // Silently fail — GPS data is best-effort
    }
  },

  /** 手动添加锚点 */
  addManualAnchor: async (
    travelId: string | number,
    lat: number,
    lng: number,
    userText: string
  ): Promise<AnchorData> =>
    post<AnchorData>('/travel/anchor/manual', {
      travel_id: Number(travelId),
      lat,
      lng,
      user_text: userText,
    }),

  /** 更新锚点补写内容 */
  updateAnchor: async (
    anchorId: string | number,
    payload: { user_text?: string; audio_url?: string; photo_url?: string }
  ): Promise<AnchorData> =>
    requestAnchorPatch(anchorId, payload),

  /** 结束旅途 */
  end: async (travelId: string | number): Promise<{ status: string }> => {
    const response = await post<{ status: string }>('/travel/end', { travel_id: Number(travelId) });
    cacheUtils.clearTravelCache(String(travelId));
    return response;
  },

  /** 获取锚点列表 */
  getAnchors: async (travelId: string | number): Promise<AnchorData[]> => {
    const res = await get<{ items: AnchorData[] }>(`/travel/${travelId}/anchors`);
    return res.items || [];
  },

  /** 获取用户全部锚点 */
  getUserAnchors: async (userId: string | number, limit = 200): Promise<AnchorData[]> => {
    const res = await get<{ items: AnchorData[] }>(`/travel/anchors/user?user_id=${userId}&limit=${limit}`);
    return res.items || [];
  },

  /** 获取旅途日记 */
  getDiary: async (travelId: string | number): Promise<DiaryResponse> => {
    try {
      return await get<DiaryResponse>(`/travel/${travelId}/diary`, false);
    } catch {
      return { status: 'pending' };
    }
  },

  /** AI 判定胶囊解锁（调用后端 verify 接口） */
  unlockCapsule: async (answer: string, capsuleId?: string): Promise<CapsuleUnlockResult> => {
    if (!capsuleId) {
      return { success: false, message: '缺少胶囊标识。' };
    }
    // 使用capsuleApi进行验证
    const { capsuleApi } = await import('./capsule');
    const res = await capsuleApi.verify(capsuleId, answer);
    return {
      success: res.result === 'pass',
      message: res.content || res.poetic_line || res.message || '胶囊已解锁',
    };
  },

  /** AI 生成旅途散文 — 轮询后端 diary 接口 */
  generateSummary: async (travelId?: string | number): Promise<JourneySummary | null> => {
    if (!travelId) {
      return null;
    }
    cacheUtils.clearTravelCache(String(travelId));
    // Poll diary endpoint aggressively for the first-screen generation experience.
    for (let i = 0; i < 8; i++) {
      try {
        const diary = await get<DiaryResponse>(`/travel/${travelId}/diary`, false);
        if (diary.status === 'ready' && diary.content_json) {
          const cj = diary.content_json;
          return {
            title: cj.title || '旅途回忆',
            date: cj.date || new Date().toLocaleDateString('zh-CN'),
            image: cj.image || '',
            content: (cj.segments || []).map((seg) => ({
              text: seg.text,
              source: seg.source || 'ai',
            })),
          };
        }
        if (diary.status === 'failed') break;
      } catch {
        // Backend unreachable, wait and retry
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    return null;
  },

  /** 获取用户旅行列表 */
  getTravelList: async (userId: string, limit = 20): Promise<unknown[]> => {
    try {
      const res = await get<{ items: unknown[] }>(`/travel/list?user_id=${userId}&limit=${limit}`);
      return res.items || [];
    } catch {
      return [];
    }
  },

  /** 获取未读通知 */
  getNotifications: async (userId: string) => {
    try {
      return await get<unknown[]>(`/notifications/unread?user_id=${userId}`);
    } catch {
      return [];
    }
  },

  /** 获取旅行详情 */
  getTravelDetail: async (travelId: string | number): Promise<TravelDetail> => {
    return await get<TravelDetail>(`/travel/${travelId}`);
  },

  /** 获取旅行位置列表 */
  getTravelLocations: async (travelId: string | number): Promise<TravelLocation[]> => {
    const res = await get<{ items: TravelLocation[] }>(`/travel/${travelId}/locations`);
    return res.items || [];
  },

  /** 获取旅行日记详情 */
  getTravelDiary: async (travelId: string | number): Promise<DiaryResponse> => {
    try {
      return await get<DiaryResponse>(`/travel/${travelId}/diary`, false);
    } catch {
      return { status: 'pending' };
    }
  },
};

async function requestAnchorPatch(
  anchorId: string | number,
  payload: { user_text?: string; audio_url?: string; photo_url?: string }
): Promise<AnchorData> {
  return request<AnchorData>(`/travel/anchor/${anchorId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
