// ─── 通用响应结构 ─────────────────────────────────────────
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ─── 通用分页响应结构 ─────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── 旅途 Journey ─────────────────────────────────────────
export interface Journey {
  id: string;
  status: 'tracking' | 'completed';
  startTime: string;
  endTime?: string;
  distance?: number;
}

export interface TravelDetail {
  id: number;
  user_id: number;
  city: string | null;
  status: 'active' | 'ended';
  start_time: string;
  end_time: string | null;
  total_distance: number;
  weather_summary: string | null;
  anchor_count: number;
  location_count: number;
  diary_status?: 'generating' | 'ready' | 'failed' | 'missing';
  diary_title?: string | null;
  diary_excerpt?: string | null;
}

export interface TravelLocation {
  id: number;
  travel_id: number;
  lat: number;
  lng: number;
  speed: number | null;
  timestamp: string;
}

export interface Anchor {
  id: string;
  location: string;
  content: string;
  timestamp: string;
  lat?: number;
  lng?: number;
}

/** AI 生成的旅途散文总结 */
export interface JourneySummary {
  title: string;
  date: string;
  image: string;
  content: (string | { text: string; source: 'ai' | 'user' | 'rag' })[]; // 散文段落数组，支持区分来源
}

/** AI 判定时空胶囊解锁结果 */
export interface CapsuleUnlockResult {
  success: boolean;
  message?: string; // 解锁成功后返回的胶囊内容
}

// ─── 旅途实时追踪 ─────────────────────────────────────────
export interface LocationPoint {
  lat: number;
  lng: number;
  speed?: number;
  timestamp: number;
}

export interface AnchorData {
  id: number | string;
  travel_id: number | string;
  lat: number;
  lng: number;
  poi_name?: string | null;
  poi_type?: string | null;
  weather?: string | null;
  temperature?: number | null;
  motion_type?: string | null;
  ai_description?: string | null;
  user_text?: string;
  audio_url?: string | null;
  photo_url?: string | null;
  audio_transcript?: string | null;
  emotion_tags?: string[] | Record<string, unknown> | null;
  ui_theme?: Record<string, unknown> | null;
  is_manual: boolean;
  status: string; // candidate, observation, confirmed, rejected
  anchor_start_time?: string | null;
  anchor_end_time?: string | null;
  agent_status: string;
  created_at: string;
}

export interface CapsuleData {
  id: number | string;
  lat: number;
  lng: number;
  city?: string | null;
  distance_m?: number;
  status: string;
  key_question?: string | null;
  time_lock_until?: string | null;
  is_locked?: boolean;
}

export interface CapsuleEchoData {
  id: number;
  content: string;
  created_at: string;
}

export interface CapsuleDetailData {
  id: number | string;
  user_id: number;
  lat: number;
  lng: number;
  city?: string | null;
  status: string;
  is_locked: boolean;
  time_lock_until?: string | null;
  key_question?: string | null;
  key_answer_hint?: string | null;
  weather_when_created?: string | null;
  created_at: string;
  found_at?: string | null;
  found_by_user_id?: number | null;
  is_accessible: boolean;
  can_echo: boolean;
  echo_count: number;
  yuan_ji?: string | null;
  echoes: CapsuleEchoData[];
}

export interface CapsuleMineItem {
  id: number;
  user_id: number;
  found_by_user_id?: number | null;
  role: 'creator' | 'finder';
  city?: string | null;
  lat: number;
  lng: number;
  status: string;
  is_locked: boolean;
  time_lock_until?: string | null;
  key_question?: string | null;
  key_answer_hint?: string | null;
  yuan_ji_preview?: string | null;
  echo_count: number;
  created_at: string;
  found_at?: string | null;
}

export interface CapsuleVerifyResponse {
  result: 'pass' | 'close' | 'fail';
  score?: number;
  message?: string;
  content?: string;
  poetic_line?: string;
  capsule_id: number;
  capsule_status: string;
  is_opened: boolean;
  opened_now: boolean;
  can_echo: boolean;
  found_at?: string | null;
}

export interface DiaryResponse {
  status: 'pending' | 'generating' | 'ready' | 'failed';
  content_json?: {
    title?: string;
    date?: string;
    image?: string;
    segments: Array<{ type?: string; text: string; source?: 'ai' | 'user' | 'rag' }>;
  };
  message?: string;
}

export interface TravelStartResult {
  travel_id: number | string;
  status?: string;
}

export interface CapsuleVerifyResult {
  success: boolean;
  message?: string;
  content?: string;
}

// ─── 社区 Community ───────────────────────────────────────
export interface Post {
  id: number;
  userId: string;
  user: string;
  avatar: string;
  image: string;
  text: string;
  location: string;
  likes: number;
  comments: number;
  time: string;
  tags?: string[];
}

export interface PostFeedParams {
  tag?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CommunitySourceInfo {
  travel_id?: number | null;
  travel_city?: string | null;
  anchor_id?: number | null;
  anchor_name?: string | null;
  anchor_type?: string | null;
}

export interface CommunityPostFeedItem {
  id: number;
  user_id: number;
  author_name: string;
  author_avatar_url?: string | null;
  title: string;
  excerpt: string;
  city?: string | null;
  emotion?: string | null;
  scene?: string | null;
  tags: string[];
  is_anonymous: boolean;
  views: number;
  likes: number;
  comment_count: number;
  cover_image?: string | null;
  image_urls: string[];
  source_travel_id?: number | null;
  source_anchor_id?: number | null;
  source?: CommunitySourceInfo | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityPostDetail extends CommunityPostFeedItem {
  content: string;
}

export interface CommunityCommentData {
  id: number;
  post_id: number;
  user_id: number;
  nickname: string;
  avatar_url?: string | null;
  content: string;
  parent_id?: number | null;
  created_at: string;
}

export interface CommunityTagData {
  name: string;
  category: string;
  count?: number;
}

export interface CommunityHeatEmotion {
  name: string;
  count: number;
}

export interface CommunityHeatSpot {
  id: number;
  name: string;
  lat: number;
  lng: number;
  city?: string | null;
  count: number;
  emotions: CommunityHeatEmotion[];
}

export interface CommunityHeatmapResponse {
  features: Array<{
    type: string;
    geometry: { type: string; coordinates: [number, number] };
    properties: { intensity: number };
  }>;
  spots: CommunityHeatSpot[];
}

// ─── 记忆 Memory ──────────────────────────────────────────
export interface MemoryRecord {
  id: string;
  travelId?: number;
  date: string;
  title: string;
  desc: string;
  image: string;
  distance?: number;
  city?: string;
  status?: string;
  diaryStatus?: string;
  weatherSummary?: string;
  anchorCount?: number;
  locationCount?: number;
  replayAvailable?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  joinDate: string;
  stats: {
    journeys: number;
    days: number;
    memories: number;
  };
  level?: number;
  levelName?: string;
  points?: number;
  bio?: string;
  unreadNotifications?: number;
}

export interface MemoryNotification {
  id: number;
  type: string;
  title: string;
  content: string;
  travel_id?: number | null;
  is_read: boolean;
  created_at: string;
}

export interface MemorySearchResult {
  source_id: number;
  source_type: 'diary' | 'anchor';
  travel_id?: number | null;
  location_name?: string | null;
  city?: string | null;
  summary?: string | null;
  emotion_tags: string[];
  travel_date?: string | null;
  season?: string | null;
  score: number;
}

export interface MemoryOverviewResponse {
  profile: {
    user_id: number;
    username?: string | null;
    nickname?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    created_at: string;
    points: number;
    level: number;
    level_name: string;
    next_level_points: number;
    stats: {
      travels: number;
      capsules: number;
      bottles: number;
      diaries: number;
      anchors: number;
      cities: number;
      city_names: string[];
      unread_notifications: number;
    };
  };
  timeline: Array<{
    id: string;
    travel_id: number;
    city?: string | null;
    start_time: string;
    end_time?: string | null;
    total_distance: number;
    status: string;
    weather_summary?: string | null;
    ui_theme?: Record<string, unknown> | null;
    anchor_count: number;
    location_count: number;
    diary_status: string;
    diary_title?: string | null;
    diary_excerpt: string;
    replay_available: boolean;
    created_at: string;
  }>;
  notifications: MemoryNotification[];
  history_ready: boolean;
}

export interface MapClientConfig {
  provider: 'mapbox';
  access_token?: string | null;
  map_style?: string | null;
  geo_radius?: number;
}

// ─── 通知 Notification ──────────────────────────────────
export interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  related_id?: number;
}

// ─── 用户设置 User Settings ──────────────────────────────
export interface UserSettings {
  id: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    enabled: boolean;
    travel_reminders: boolean;
    community_updates: boolean;
  };
  privacy: {
    profile_visible: boolean;
    location_sharing: boolean;
  };
}

// ─── 远洋瓶 Bottle ───────────────────────────────────────
export interface BottleData {
  id: number;
  user_id: number;
  content: string;
  from_lat: number;
  from_lng: number;
  from_city: string;
  to_lat?: number;
  to_lng?: number;
  to_city?: string;
  status: 'drifting' | 'received' | 'expired';
  created_at: string;
  received_at?: string;
  received_by?: number;
}

// ─── 评论 Comment ───────────────────────────────────────
export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
  likes: number;
}

// ─── 标签 Tag ───────────────────────────────────────────
export interface Tag {
  name: string;
  category: string;
  count: number;
}

// ─── 热力图数据 Heatmap Data ─────────────────────────────
export interface HeatmapData {
  lat: number;
  lng: number;
  intensity: number;
  emotion: string;
  city: string;
}
