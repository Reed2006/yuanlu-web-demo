import { get, post } from './client';
import type {
  CommunityCommentData,
  CommunityHeatmapResponse,
  CommunityPostDetail,
  CommunityPostFeedItem,
  CommunityTagData,
  PostFeedParams,
} from './types';

export const communityApi = {
  /** 获取帖子列表 */
  getFeed: async (params?: PostFeedParams): Promise<CommunityPostFeedItem[]> => {
    const qs = new URLSearchParams();
    if (params?.tag && params.tag !== '热门') qs.set('tag', params.tag);
    if (params?.search) qs.set('search', params.search);
    if (params?.pageSize) qs.set('limit', String(params.pageSize));
    const query = qs.toString();
    const res = await get<{ items: CommunityPostFeedItem[] }>(
      `/community/posts${query ? `?${query}` : ''}`
    );
    return res.items || [];
  },

  /** 获取帖子详情 */
  getPostDetail: async (postId: number): Promise<CommunityPostDetail> => {
    return await get<CommunityPostDetail>(`/community/posts/${postId}`);
  },

  /** 点赞 */
  like: async (postId: number): Promise<{ likes: number }> => {
    return await post<{ likes: number }>(`/community/posts/${postId}/like`, {});
  },

  /** 取消点赞 */
  unlike: async (postId: number): Promise<{ likes: number }> => {
    return await post<{ likes: number }>(`/community/posts/${postId}/unlike`, {});
  },

  /** 点赞/取消点赞切换 */
  toggleLike: async (
    postId: number,
    isLiked: boolean
  ): Promise<{ liked: boolean; likes: number }> => {
    const res = isLiked ? await communityApi.unlike(postId) : await communityApi.like(postId);
    return { liked: !isLiked, likes: res.likes };
  },

  /** 发布帖子 */
  createPost: async (data: {
    user_id: number;
    title: string;
    content: string;
    city?: string;
    emotion?: string;
    scene?: string;
    is_anonymous?: boolean;
    cover_image?: string;
    image_urls?: string[];
    source_travel_id?: number;
    source_anchor_id?: number;
  }): Promise<{
    status: string;
    post_id: number;
    post: CommunityPostDetail;
    ai_tags: { city?: string | null; emotion?: string | null; scene?: string | null; summary?: string | null };
  }> => {
    return await post('/community/posts', data);
  },

  /** 获取热门标签 */
  getPopularTags: async (): Promise<CommunityTagData[]> => {
    const res = await get<{ tags: CommunityTagData[] }>('/community/tags/popular?limit=20');
    return res.tags || [];
  },

  /** 搜索标签 */
  searchTags: async (query: string): Promise<CommunityTagData[]> => {
    const res = await get<{ tags: CommunityTagData[] }>(
      `/community/tags/search?query=${encodeURIComponent(query)}`
    );
    return res.tags || [];
  },

  /** 获取评论 */
  getComments: async (postId: number): Promise<CommunityCommentData[]> => {
    const res = await get<{ items: CommunityCommentData[] }>(`/community/posts/${postId}/comments`);
    return res.items || [];
  },

  /** 发表评论 */
  addComment: async (
    postId: number,
    userId: number,
    content: string,
    parentId?: number
  ): Promise<CommunityCommentData> => {
    const res = await post<{ status: string; comment: CommunityCommentData }>(
      `/community/posts/${postId}/comments`,
      { user_id: userId, content, parent_id: parentId }
    );
    return res.comment;
  },

  /** 获取情感热力图数据 */
  getHeatmapData: async (): Promise<CommunityHeatmapResponse> => {
    return await get<CommunityHeatmapResponse>('/community/heatmap');
  },
};
