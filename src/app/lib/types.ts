export interface LatLng {
  lat: number;
  lng: number;
}

export interface CurrentPosition {
  lat: number | null;
  lng: number | null;
  city?: string;
  label?: string;
  full_address?: string;
  poi_name?: string;
  poi_type?: string;
  is_seaside?: boolean;
  timestamp?: string;
}

export interface MapContextData {
  lat: number;
  lng: number;
  city?: string | null;
  label?: string;
  full_address?: string | null;
  poi_name?: string | null;
  poi_type?: string | null;
  is_seaside: boolean;
}

export interface MapClientConfig {
  provider: "mapbox" | string;
  public_token?: string | null;
  style_url: string;
}

export interface TravelLocation {
  id?: number;
  travel_id: number;
  lat: number;
  lng: number;
  speed?: number | null;
  timestamp: string;
}

export interface TravelAnchor {
  id: number;
  travel_id: number;
  user_id?: number;
  lat: number;
  lng: number;
  poi_name?: string | null;
  poi_type?: string | null;
  weather?: string | null;
  temperature?: number | null;
  motion_type?: string | null;
  ai_description?: string | null;
  user_text?: string | null;
  audio_url?: string | null;
  photo_url?: string | null;
  audio_transcript?: string | null;
  emotion_tags?: string[] | Record<string, unknown> | null;
  ui_theme?: Record<string, unknown> | null;
  is_manual?: boolean;
  agent_status?: 'processing' | 'ready';
  created_at?: string;
}

export interface TravelSummary {
  id: number;
  user_id: number;
  city?: string | null;
  status: string;
  start_time?: string;
  end_time?: string | null;
  total_distance?: number;
  weather_summary?: string | null;
  ui_theme?: Record<string, unknown> | null;
  anchor_count?: number;
  location_count?: number;
}

export interface TravelListItem extends TravelSummary {
  diary_status?: 'ready' | 'generating' | 'missing' | string;
  diary_updated_at?: string | null;
  diary_excerpt?: string;
}

export interface DiarySegment {
  source: 'ai' | 'user' | 'rag';
  text: string;
}

export interface DiaryData {
  status: 'ready' | 'generating';
  travel_id?: number;
  updated_at?: string;
  content_json?: {
    segments?: DiarySegment[];
    meta?: Record<string, unknown>;
  };
}

export interface CapsuleNearbyItem {
  id: number;
  lat: number;
  lng: number;
  city?: string | null;
  distance_m: number;
  status: string;
  time_lock_until?: string | null;
}

export interface CapsuleEcho {
  id: number;
  content: string;
  created_at?: string;
}

export interface CapsuleDetail {
  id: number;
  user_id: number;
  lat: number;
  lng: number;
  city?: string | null;
  status: string;
  is_locked: boolean;
  time_lock_until?: string | null;
  key_question: string;
  key_answer_hint?: string | null;
  weather_when_created?: string | null;
  created_at?: string;
  found_at?: string | null;
  found_by_user_id?: number | null;
  yuan_ji?: string | null;
  echoes: CapsuleEcho[];
}

export interface BottleReceiveResult {
  received: boolean;
  bottle_id?: number;
  content?: string;
  from?: {
    lat: number;
    lng: number;
    city?: string | null;
  };
}

export interface BottleTrajectory {
  bottle_id: number;
  status: string;
  from: {
    lat: number;
    lng: number;
    city?: string | null;
  };
  to?: {
    lat?: number | null;
    lng?: number | null;
    city?: string | null;
  } | null;
}

export interface BottleManagedItem {
  id: number;
  user_id: number;
  received_by?: number | null;
  role: 'sender' | 'receiver';
  status: string;
  content: string;
  content_preview?: string;
  from: {
    lat: number;
    lng: number;
    city?: string | null;
  };
  to?: {
    lat?: number | null;
    lng?: number | null;
    city?: string | null;
  } | null;
  created_at?: string;
  received_at?: string | null;
}

export interface CapsuleManagedItem {
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
  key_question: string;
  key_answer_hint?: string | null;
  yuan_ji_preview?: string;
  echo_count: number;
  created_at?: string;
  found_at?: string | null;
}

export interface CommunityPostSummary {
  id: number;
  title: string;
  excerpt: string;
  city?: string | null;
  emotion?: string | null;
  scene?: string | null;
  is_anonymous: boolean;
  views: number;
  likes: number;
  cover_image?: string | null;
  created_at?: string;
}

export interface CommunityPostDetail extends CommunityPostSummary {
  user_id: number;
  content: string;
  image_urls: string[];
  source_travel_id?: number | null;
  source_anchor_id?: number | null;
}

export interface CollectiveMemoryEmotion {
  name: string;
  count: number;
}

export interface CollectiveMemorySpot {
  id: number;
  name: string;
  lat: number;
  lng: number;
  city?: string | null;
  count: number;
  emotions: CollectiveMemoryEmotion[];
}

export interface CollectiveMemoryFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    intensity: number;
  };
}

export interface CollectiveMemoryData {
  features: CollectiveMemoryFeature[];
  spots: CollectiveMemorySpot[];
}

export interface AgentStatusItem {
  name: string;
  label: string;
  description: string;
  mode: 'real' | 'mock';
  status: 'ready' | 'degraded';
  configured: boolean;
  missing_env: string[];
  running_jobs: number;
  success_count: number;
  failure_count: number;
  last_run_at?: string | null;
  last_success_at?: string | null;
  last_duration_ms?: number | null;
  last_error?: string | null;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  content: string;
  travel_id?: number | null;
  is_read: boolean;
  created_at?: string;
}

export interface ExportTask {
  task_id: string;
  travel_id?: number;
  type?: string;
  status: string;
  result_url?: string | null;
  error?: string | null;
  created_at?: string;
  finished_at?: string;
}
