import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_API_BASE, requestJson } from '../lib/api';
import { isDemoMode } from '../lib/demoMode';
import {
  DEMO_POSITION,
  DEMO_TRAVEL,
  DEMO_TRAVEL_LOCATIONS,
  DEMO_TRAVEL_ANCHORS,
  DEMO_DIARY,
  DEMO_TRAVEL_HISTORY,
  DEMO_NEARBY_CAPSULES,
  DEMO_MY_CAPSULES,
  DEMO_CAPSULE_DETAIL,
  DEMO_BOTTLE_RECEIVE,
  DEMO_MY_BOTTLES,
  DEMO_BOTTLE_TRAJECTORY,
  DEMO_COMMUNITY_POSTS,
  DEMO_COMMUNITY_POST_DETAIL,
  DEMO_COLLECTIVE_MEMORY,
  DEMO_AGENT_STATUSES,
  DEMO_NOTIFICATIONS,
  DEMO_MAP_CONFIG,
} from '../lib/demoData';
import type {
  AgentStatusItem,
  BottleManagedItem,
  BottleReceiveResult,
  BottleTrajectory,
  CapsuleDetail,
  CapsuleManagedItem,
  CapsuleNearbyItem,
  CollectiveMemoryData,
  CollectiveMemoryFeature,
  CollectiveMemorySpot,
  CommunityPostDetail,
  CommunityPostSummary,
  CurrentPosition,
  DiaryData,
  ExportTask,
  LatLng,
  MapClientConfig,
  MapContextData,
  NotificationItem,
  TravelAnchor,
  TravelListItem,
  TravelLocation,
  TravelSummary,
} from '../lib/types';

const STORAGE_KEY = 'yuanlu-react-state-v1';

interface PersistedState {
  apiBase: string;
  mapClientConfig: MapClientConfig | null;
  userId: number;
  currentPosition: CurrentPosition;
  travel: TravelSummary | null;
  travelLocations: TravelLocation[];
  travelAnchors: TravelAnchor[];
  diary: DiaryData | null;
  travelHistory: TravelListItem[];
  nearbyCapsules: CapsuleNearbyItem[];
  myCapsules: CapsuleManagedItem[];
  currentCapsule: CapsuleDetail | null;
  bottle: BottleReceiveResult | null;
  myBottles: BottleManagedItem[];
  bottleTrajectory: BottleTrajectory | null;
  communityPosts: CommunityPostSummary[];
  currentCommunityPost: CommunityPostDetail | null;
  collectiveMemory: CollectiveMemoryData | null;
  agentStatuses: AgentStatusItem[];
  notifications: NotificationItem[];
  communityHealth: string;
  exportTask: ExportTask | null;
}

interface AppStateValue extends PersistedState {
  loading: boolean;
  error: string | null;
  setApiBase: (apiBase: string) => void;
  loadMapClientConfig: () => Promise<MapClientConfig | null>;
  setCurrentPosition: (position: Partial<CurrentPosition>) => void;
  resolveLocationContext: (payload?: { lat?: number; lng?: number }) => Promise<MapContextData | null>;
  startTravel: (payload?: { city?: string }) => Promise<TravelSummary>;
  refreshTravel: () => Promise<void>;
  loadTravelById: (travelId: number) => Promise<void>;
  uploadLocation: (payload: { lat: number; lng: number; speed?: number; timestamp?: string }) => Promise<{ anchor_triggered: boolean }>;
  createManualAnchor: (payload: { lat: number; lng: number; user_text?: string; photo_url?: string }) => Promise<TravelAnchor>;
  endTravel: () => Promise<void>;
  loadDiary: () => Promise<DiaryData | null>;
  loadTravelHistory: (limit?: number) => Promise<TravelListItem[]>;
  createCapsule: (payload: {
    city?: string;
    lat: number;
    lng: number;
    yuan_ji: string;
    key_question: string;
    key_answer_hint?: string;
    time_lock_until?: string | null;
  }) => Promise<CapsuleDetail>;
  loadNearbyCapsules: (payload?: { lat?: number; lng?: number; radius?: number }) => Promise<CapsuleNearbyItem[]>;
  loadMyCapsules: (scope?: 'all' | 'created' | 'found') => Promise<CapsuleManagedItem[]>;
  loadCapsule: (capsuleId?: number) => Promise<CapsuleDetail | null>;
  verifyCapsule: (userAnswer: string, capsuleId?: number) => Promise<{ result: string; message?: string; poetic_line?: string }>;
  createCapsuleEcho: (content: string, capsuleId?: number) => Promise<void>;
  throwBottle: (payload: { content: string; lat: number; lng: number }) => Promise<Record<string, unknown>>;
  receiveBottle: (payload?: { lat?: number; lng?: number }) => Promise<BottleReceiveResult>;
  loadMyBottles: (scope?: 'all' | 'thrown' | 'received') => Promise<BottleManagedItem[]>;
  loadBottleTrajectory: (bottleId?: number) => Promise<BottleTrajectory | null>;
  loadNotifications: () => Promise<NotificationItem[]>;
  loadCommunityHealth: () => Promise<string>;
  loadAgentStatuses: () => Promise<AgentStatusItem[]>;
  loadCommunityPosts: (payload?: {
    city?: string;
    emotion?: string;
    scene?: string;
    search?: string;
    presence?: 'city' | 'emotion' | 'scene';
  }) => Promise<CommunityPostSummary[]>;
  loadCommunityPost: (postId: number) => Promise<CommunityPostDetail>;
  loadCollectiveMemory: (sampleLimit?: number) => Promise<CollectiveMemoryData>;
  createCommunityPost: (payload: {
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
  }) => Promise<number>;
  likeCommunityPost: (postId: number) => Promise<number>;
  startExport: (type: 'map' | 'notebook') => Promise<ExportTask | null>;
  pollExportTask: (taskId?: string) => Promise<ExportTask | null>;
  login: (username: string, password: string) => Promise<{ user_id: number; nickname?: string | null }>;
  register: (username: string, password: string, nickname?: string) => Promise<{ user_id: number; nickname?: string | null }>;
  logout: () => void;
  uploadFile: (file: Blob, category?: string, filename?: string) => Promise<string>;
  cartoonify: (imageUrl: string, style?: string) => Promise<string[]>;
  clearError: () => void;
}

const defaultPosition: CurrentPosition = {
  lat: null,
  lng: null,
};

const defaultState: PersistedState = {
  apiBase: DEFAULT_API_BASE,
  mapClientConfig: null,
  userId: 1,
  currentPosition: defaultPosition,
  travel: null,
  travelLocations: [],
  travelAnchors: [],
  diary: null,
  travelHistory: [],
  nearbyCapsules: [],
  myCapsules: [],
  currentCapsule: null,
  bottle: null,
  myBottles: [],
  bottleTrajectory: null,
  communityPosts: [],
  currentCommunityPost: null,
  collectiveMemory: null,
  agentStatuses: [],
  notifications: [],
  communityHealth: 'unknown',
  exportTask: null,
};

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

function resolveUserIdFromStorage(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem('yuanlv_user');
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Number(parsed.userId) || 0;
  } catch {
    return 0;
  }
}

function normalizeStoredState(): PersistedState {
  // In demo mode, return fully populated state immediately
  if (isDemoMode()) {
    return {
      ...defaultState,
      userId: 1,
      mapClientConfig: DEMO_MAP_CONFIG,
      currentPosition: DEMO_POSITION,
      travel: DEMO_TRAVEL,
      travelLocations: DEMO_TRAVEL_LOCATIONS,
      travelAnchors: DEMO_TRAVEL_ANCHORS,
      diary: DEMO_DIARY,
      travelHistory: DEMO_TRAVEL_HISTORY,
      nearbyCapsules: DEMO_NEARBY_CAPSULES,
      myCapsules: DEMO_MY_CAPSULES,
      currentCapsule: DEMO_CAPSULE_DETAIL,
      bottle: DEMO_BOTTLE_RECEIVE,
      myBottles: DEMO_MY_BOTTLES,
      bottleTrajectory: DEMO_BOTTLE_TRAJECTORY,
      communityPosts: DEMO_COMMUNITY_POSTS,
      currentCommunityPost: DEMO_COMMUNITY_POST_DETAIL,
      collectiveMemory: DEMO_COLLECTIVE_MEMORY,
      agentStatuses: DEMO_AGENT_STATUSES,
      notifications: DEMO_NOTIFICATIONS,
      communityHealth: 'healthy',
    };
  }

  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    // Always resolve userId from auth storage to prevent data leaks across users
    const resolvedUserId = resolveUserIdFromStorage();

    if (!raw) {
      return { ...defaultState, userId: resolvedUserId || defaultState.userId };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    // If the stored userId doesn't match the auth storage, reset data
    // This prevents anonymous users from seeing another user's data
    if (resolvedUserId && parsed.userId && parsed.userId !== resolvedUserId) {
      return { ...defaultState, userId: resolvedUserId };
    }

    const parsedPosition = parsed.currentPosition || {};
    const isLegacyShanghaiFallback =
      parsedPosition.lat === 31.2304 &&
      parsedPosition.lng === 121.4737 &&
      !parsedPosition.timestamp;
    return {
      ...defaultState,
      ...parsed,
      // Always use the env-configured API base so VITE_API_BASE takes effect
      // even when localStorage has a stale value from a previous session.
      apiBase: DEFAULT_API_BASE,
      userId: resolvedUserId || parsed.userId || defaultState.userId,
      currentPosition: isLegacyShanghaiFallback
        ? defaultPosition
        : {
            ...defaultPosition,
            ...parsedPosition,
          },
    };
  } catch {
    return defaultState;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(normalizeStoredState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const withLoading = useCallback(async <T,>(task: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await task();
    } catch (err) {
      const message = err instanceof Error ? err.message : '请求失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setApiBase = useCallback((apiBase: string) => {
    setState((prev) => ({ ...prev, apiBase: apiBase.replace(/\/$/, '') }));
  }, []);

  const loadMapClientConfig = useCallback(async () => {
    return withLoading(async () => {
      const data = await requestJson<MapClientConfig>(state.apiBase, '/map/client-config');
      setState((prev) => ({
        ...prev,
        mapClientConfig: data,
      }));
      return data;
    });
  }, [state.apiBase, withLoading]);

  const setCurrentPosition = useCallback((position: Partial<CurrentPosition>) => {
    setState((prev) => ({
      ...prev,
      currentPosition: {
        ...prev.currentPosition,
        ...position,
      },
    }));
  }, []);

  const resolveLocationContext = useCallback(async (payload?: { lat?: number; lng?: number }) => {
    return withLoading(async () => {
      const lat = payload?.lat ?? state.currentPosition.lat;
      const lng = payload?.lng ?? state.currentPosition.lng;
      if (lat === null || lng === null || lat === undefined || lng === undefined) {
        return null;
      }

      const search = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
      });
      const data = await requestJson<MapContextData>(state.apiBase, `/map/context?${search.toString()}`);
      setState((prev) => ({
        ...prev,
        currentPosition: {
          ...prev.currentPosition,
          lat,
          lng,
          city: data.city || undefined,
          label: data.label || undefined,
          full_address: data.full_address || undefined,
          poi_name: data.poi_name || undefined,
          poi_type: data.poi_type || undefined,
          is_seaside: data.is_seaside,
        },
      }));
      return data;
    });
  }, [state.apiBase, state.currentPosition.lat, state.currentPosition.lng, withLoading]);

  const refreshTravel = useCallback(async () => {
    if (!state.travel?.id) {
      return;
    }

    // Do NOT use withLoading here — refreshTravel is called every 3 seconds
    // during recording and should not trigger the global loading spinner or
    // block other operations.
    const travelId = state.travel!.id;
    try {
      const [travel, locations, anchors] = await Promise.all([
        requestJson<TravelSummary>(state.apiBase, `/travel/${travelId}`),
        requestJson<{ items: TravelLocation[] }>(state.apiBase, `/travel/${travelId}/locations`),
        requestJson<{ items: TravelAnchor[] }>(state.apiBase, `/travel/${travelId}/anchors`),
      ]);

      setState((prev) => ({
        ...prev,
        travel,
        travelLocations: locations.items,
        travelAnchors: anchors.items,
      }));
    } catch {
      // Silently ignore refresh failures — next cycle will retry
    }
  }, [state.apiBase, state.travel]);

  const loadTravelById = useCallback(async (travelId: number) => {
    await withLoading(async () => {
      const [travel, locations, anchors] = await Promise.all([
        requestJson<TravelSummary>(state.apiBase, `/travel/${travelId}`),
        requestJson<{ items: TravelLocation[] }>(state.apiBase, `/travel/${travelId}/locations`),
        requestJson<{ items: TravelAnchor[] }>(state.apiBase, `/travel/${travelId}/anchors`),
      ]);
      setState((prev) => ({
        ...prev,
        travel,
        travelLocations: locations.items,
        travelAnchors: anchors.items,
        diary: null,
      }));
    });
  }, [state.apiBase, withLoading]);

  const startTravel = useCallback(async (payload?: { city?: string }) => {
    return withLoading(async () => {
      const res = await requestJson<{ travel_id: number }>(state.apiBase, '/travel/start', {
        method: 'POST',
        body: {
          user_id: state.userId,
          city: payload?.city || state.currentPosition.city || '未定位',
        },
      });
      const travel = await requestJson<TravelSummary>(state.apiBase, `/travel/${res.travel_id}`);
      setState((prev) => ({
        ...prev,
        travel,
        travelLocations: [],
        travelAnchors: [],
        diary: null,
        exportTask: null,
      }));
      return travel;
    });
  }, [state.apiBase, state.currentPosition.city, state.userId, withLoading]);

  const uploadLocation = useCallback(async (payload: { lat: number; lng: number; speed?: number; timestamp?: string }) => {
    if (!state.travel?.id) {
      throw new Error('请先开启旅行');
    }

    // Do NOT use withLoading — location uploads happen frequently and
    // should not trigger the global loading spinner.
    const travelId = state.travel!.id;
    const timestamp = payload.timestamp || new Date().toISOString();
    const res = await requestJson<{ status: string; anchor_triggered: boolean }>(state.apiBase, '/travel/location', {
      method: 'POST',
      body: {
        travel_id: travelId,
        lat: payload.lat,
        lng: payload.lng,
        speed: payload.speed || 0,
        timestamp,
      },
    });

    setState((prev) => ({
      ...prev,
      currentPosition: {
        ...prev.currentPosition,
        lat: payload.lat,
        lng: payload.lng,
        timestamp,
      },
    }));

    if (res.anchor_triggered) {
      requestJson<{ items: TravelAnchor[] }>(state.apiBase, `/travel/${travelId}/anchors`)
        .then((anchors) => setState((prev) => ({ ...prev, travelAnchors: anchors.items })))
        .catch(() => undefined);
    }

    return { anchor_triggered: res.anchor_triggered };
  }, [state.apiBase, state.travel]);

  const createManualAnchor = useCallback(async (payload: { lat: number; lng: number; user_text?: string; photo_url?: string }) => {
    if (!state.travel?.id) {
      throw new Error('请先开启旅行');
    }

    return withLoading(async () => {
      const res = await requestJson<{ anchor_id: number }>(state.apiBase, '/travel/anchor/manual', {
        method: 'POST',
        body: {
          travel_id: state.travel!.id,
          lat: payload.lat,
          lng: payload.lng,
          user_text: payload.user_text,
          photo_url: payload.photo_url,
        },
      });

      const anchor = await requestJson<TravelAnchor>(state.apiBase, `/travel/anchor/${res.anchor_id}`);
      setState((prev) => ({
        ...prev,
        travelAnchors: prev.travelAnchors.concat(anchor),
      }));
      return anchor;
    });
  }, [state.apiBase, state.travel, withLoading]);

  const endTravel = useCallback(async () => {
    if (!state.travel?.id) {
      throw new Error('没有进行中的旅行');
    }

    // Optimistic: mark travel as ended immediately for fast UI response,
    // then fire the API call without blocking on withLoading spinner.
    const travelId = state.travel!.id;
    setState((prev) => ({
      ...prev,
      travel: prev.travel ? { ...prev.travel, status: 'ended' as const } : prev.travel,
    }));

    try {
      await requestJson(state.apiBase, '/travel/end', {
        method: 'POST',
        body: { travel_id: travelId },
      });
      // Refresh travel data in background (non-blocking)
      requestJson<TravelSummary>(state.apiBase, `/travel/${travelId}`)
        .then((travel) => setState((prev) => ({ ...prev, travel })))
        .catch(() => undefined);
    } catch (err) {
      // Revert optimistic update on failure
      setState((prev) => ({
        ...prev,
        travel: prev.travel ? { ...prev.travel, status: 'active' as const } : prev.travel,
      }));
      throw err;
    }
  }, [state.apiBase, state.travel]);

  const loadDiary = useCallback(async () => {
    if (!state.travel?.id) {
      return null;
    }

    return withLoading(async () => {
      const diary = await requestJson<DiaryData>(state.apiBase, `/travel/${state.travel!.id}/diary`);
      setState((prev) => ({ ...prev, diary }));
      return diary;
    });
  }, [state.apiBase, state.travel, withLoading]);

  const loadTravelHistory = useCallback(async (limit = 30) => {
    return withLoading(async () => {
      const res = await requestJson<{ items: TravelListItem[] }>(
        state.apiBase,
        `/travel/list?user_id=${state.userId}&limit=${limit}`,
      );
      setState((prev) => ({ ...prev, travelHistory: res.items }));
      return res.items;
    });
  }, [state.apiBase, state.userId, withLoading]);

  const loadCapsule = useCallback(async (capsuleId?: number) => {
    const targetId = capsuleId || state.currentCapsule?.id || state.nearbyCapsules[0]?.id;
    if (!targetId) {
      return null;
    }

    return withLoading(async () => {
      const capsule = await requestJson<CapsuleDetail>(state.apiBase, `/capsule/${targetId}`);
      setState((prev) => ({ ...prev, currentCapsule: capsule }));
      return capsule;
    });
  }, [state.apiBase, state.currentCapsule?.id, state.nearbyCapsules, withLoading]);

  const createCapsule = useCallback(async (payload: {
    city?: string;
    lat: number;
    lng: number;
    yuan_ji: string;
    key_question: string;
    key_answer_hint?: string;
    time_lock_until?: string | null;
  }) => {
    return withLoading(async () => {
      const res = await requestJson<{ capsule_id: number }>(state.apiBase, '/capsule/create', {
        method: 'POST',
        body: {
          user_id: state.userId,
          city: payload.city || state.currentPosition.city || '未定位',
          lat: payload.lat,
          lng: payload.lng,
          yuan_ji: payload.yuan_ji,
          key_question: payload.key_question,
          key_answer_hint: payload.key_answer_hint || null,
          time_lock_until: payload.time_lock_until || null,
        },
      });
      const capsule = await requestJson<CapsuleDetail>(state.apiBase, `/capsule/${res.capsule_id}`);
      setState((prev) => ({ ...prev, currentCapsule: capsule }));
      return capsule;
    });
  }, [state.apiBase, state.currentPosition.city, state.userId, withLoading]);

  const loadNearbyCapsules = useCallback(async (payload?: { lat?: number; lng?: number; radius?: number }) => {
    return withLoading(async () => {
      const lat = payload?.lat ?? state.currentPosition.lat;
      const lng = payload?.lng ?? state.currentPosition.lng;
      if (lat === null || lng === null) {
        throw new Error('请先授权定位');
      }
      const radius = payload?.radius ?? 2000;
      const search = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius: String(radius),
      });
      const res = await requestJson<{ items: CapsuleNearbyItem[] }>(state.apiBase, `/capsule/nearby?${search.toString()}`);
      setState((prev) => ({ ...prev, nearbyCapsules: res.items }));
      return res.items;
    });
  }, [state.apiBase, state.currentPosition.lat, state.currentPosition.lng, withLoading]);

  const loadMyCapsules = useCallback(async (scope: 'all' | 'created' | 'found' = 'all') => {
    return withLoading(async () => {
      const res = await requestJson<{ items: CapsuleManagedItem[] }>(
        state.apiBase,
        `/capsule/mine?user_id=${state.userId}&scope=${scope}`,
      );
      setState((prev) => ({ ...prev, myCapsules: res.items }));
      return res.items;
    });
  }, [state.apiBase, state.userId, withLoading]);

  const verifyCapsule = useCallback(async (userAnswer: string, capsuleId?: number) => {
    const targetId = capsuleId || state.currentCapsule?.id || state.nearbyCapsules[0]?.id;
    if (!targetId) {
      throw new Error('没有可打开的胶囊');
    }

    return withLoading(async () => {
      const res = await requestJson<{ result: string; message?: string; poetic_line?: string }>(state.apiBase, '/capsule/verify', {
        method: 'POST',
        body: {
          capsule_id: targetId,
          user_answer: userAnswer,
          finder_user_id: state.userId,
        },
      });
      if (res.result === 'pass') {
        await loadCapsule(targetId);
      }
      return res;
    });
  }, [loadCapsule, state.apiBase, state.currentCapsule?.id, state.nearbyCapsules, state.userId, withLoading]);

  const createCapsuleEcho = useCallback(async (content: string, capsuleId?: number) => {
    const targetId = capsuleId || state.currentCapsule?.id;
    if (!targetId) {
      throw new Error('没有可回响的胶囊');
    }

    await withLoading(async () => {
      await requestJson(state.apiBase, '/capsule/echo', {
        method: 'POST',
        body: {
          capsule_id: targetId,
          content,
        },
      });
      await loadCapsule(targetId);
    });
  }, [loadCapsule, state.apiBase, state.currentCapsule?.id, withLoading]);

  const throwBottle = useCallback(async (payload: { content: string; lat: number; lng: number }) => {
    return withLoading(async () => {
      const res = await requestJson<Record<string, unknown>>(state.apiBase, '/bottle/throw', {
        method: 'POST',
        body: {
          user_id: state.userId,
          content: payload.content,
          lat: payload.lat,
          lng: payload.lng,
        },
      });
      const bottleId = Number(res.bottle_id || 0);
      if (bottleId) {
        const trajectory = await requestJson<BottleTrajectory>(state.apiBase, `/bottle/trajectory/${bottleId}`);
        setState((prev) => ({
          ...prev,
          bottle: { received: false, bottle_id: bottleId },
          bottleTrajectory: trajectory,
        }));
      }
      return res;
    });
  }, [state.apiBase, state.userId, withLoading]);

  const receiveBottle = useCallback(async (payload?: { lat?: number; lng?: number }) => {
    return withLoading(async () => {
      const lat = payload?.lat ?? state.currentPosition.lat;
      const lng = payload?.lng ?? state.currentPosition.lng;
      if (lat === null || lng === null) {
        throw new Error('请先授权定位');
      }
      const res = await requestJson<BottleReceiveResult>(state.apiBase, '/bottle/receive', {
        method: 'POST',
        body: {
          user_id: state.userId,
          lat,
          lng,
        },
      });
      let trajectory: BottleTrajectory | null = null;
      if (res.bottle_id) {
        trajectory = await requestJson<BottleTrajectory>(state.apiBase, `/bottle/trajectory/${res.bottle_id}`);
      }
      setState((prev) => ({ ...prev, bottle: res, bottleTrajectory: trajectory }));
      return res;
    });
  }, [state.apiBase, state.currentPosition.lat, state.currentPosition.lng, state.userId, withLoading]);

  const loadBottleTrajectory = useCallback(async (bottleId?: number) => {
    const targetId = bottleId || state.bottle?.bottle_id || state.bottleTrajectory?.bottle_id;
    if (!targetId) {
      return null;
    }

    return withLoading(async () => {
      const trajectory = await requestJson<BottleTrajectory>(state.apiBase, `/bottle/trajectory/${targetId}`);
      setState((prev) => ({ ...prev, bottleTrajectory: trajectory }));
      return trajectory;
    });
  }, [state.apiBase, state.bottle?.bottle_id, state.bottleTrajectory?.bottle_id, withLoading]);

  const loadMyBottles = useCallback(async (scope: 'all' | 'thrown' | 'received' = 'all') => {
    return withLoading(async () => {
      const res = await requestJson<{ items: BottleManagedItem[] }>(
        state.apiBase,
        `/bottle/mine?user_id=${state.userId}&scope=${scope}`,
      );
      setState((prev) => ({ ...prev, myBottles: res.items }));
      return res.items;
    });
  }, [state.apiBase, state.userId, withLoading]);

  const loadNotifications = useCallback(async () => {
    return withLoading(async () => {
      const res = await requestJson<{ items: NotificationItem[] }>(state.apiBase, `/notifications/unread?user_id=${state.userId}`);
      setState((prev) => ({ ...prev, notifications: res.items }));
      return res.items;
    });
  }, [state.apiBase, state.userId, withLoading]);

  const loadCommunityHealth = useCallback(async () => {
    return withLoading(async () => {
      const res = await requestJson<{ status: string }>(state.apiBase, '/community/health');
      setState((prev) => ({ ...prev, communityHealth: res.status }));
      return res.status;
    });
  }, [state.apiBase, withLoading]);

  const loadAgentStatuses = useCallback(async () => {
    return withLoading(async () => {
      const res = await requestJson<{ agents: AgentStatusItem[] }>(state.apiBase, '/agent/status');
      const items = res.agents || [];
      setState((prev) => ({ ...prev, agentStatuses: items }));
      return items;
    });
  }, [state.apiBase, withLoading]);

  const loadCommunityPosts = useCallback(async (payload?: {
    city?: string;
    emotion?: string;
    scene?: string;
    search?: string;
    presence?: 'city' | 'emotion' | 'scene';
  }) => {
    return withLoading(async () => {
      const search = new URLSearchParams();
      if (payload?.city) {
        search.set('city', payload.city);
      }
      if (payload?.emotion) {
        search.set('emotion', payload.emotion);
      }
      if (payload?.scene) {
        search.set('scene', payload.scene);
      }
      if (payload?.search) {
        search.set('search', payload.search);
      }
      if (payload?.presence) {
        search.set('presence', payload.presence);
      }
      const query = search.toString();
      const res = await requestJson<{ items: CommunityPostSummary[] }>(
        state.apiBase,
        `/community/posts${query ? `?${query}` : ''}`,
      );
      setState((prev) => ({ ...prev, communityPosts: res.items }));
      return res.items;
    });
  }, [state.apiBase, withLoading]);

  const loadCommunityPost = useCallback(async (postId: number) => {
    return withLoading(async () => {
      const post = await requestJson<CommunityPostDetail>(state.apiBase, `/community/posts/${postId}`);
      setState((prev) => ({
        ...prev,
        currentCommunityPost: post,
        communityPosts: prev.communityPosts.map((item) =>
          item.id === post.id
            ? {
                ...item,
                views: post.views,
                likes: post.likes,
                title: post.title,
                excerpt: post.excerpt,
                cover_image: post.cover_image,
                city: post.city,
                emotion: post.emotion,
                scene: post.scene,
              }
            : item,
        ),
      }));
      return post;
    });
  }, [state.apiBase, withLoading]);

  const loadCollectiveMemory = useCallback(async (sampleLimit = 800) => {
    return withLoading(async () => {
      const res = await requestJson<{ features: CollectiveMemoryFeature[]; spots: CollectiveMemorySpot[] }>(
        state.apiBase,
        `/community/heatmap?sample_limit=${sampleLimit}`,
      );
      const data: CollectiveMemoryData = {
        features: res.features || [],
        spots: res.spots || [],
      };
      setState((prev) => ({ ...prev, collectiveMemory: data }));
      return data;
    });
  }, [state.apiBase, withLoading]);

  const createCommunityPost = useCallback(async (payload: {
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
  }) => {
    return withLoading(async () => {
      const res = await requestJson<{ post_id: number }>(state.apiBase, '/community/posts', {
        method: 'POST',
        body: {
          ...payload,
          user_id: state.userId,
          is_anonymous: payload.is_anonymous ?? true,
        },
      });
      await loadCommunityPosts();
      return res.post_id;
    });
  }, [loadCommunityPosts, state.apiBase, state.userId, withLoading]);

  const likeCommunityPost = useCallback(async (postId: number) => {
    return withLoading(async () => {
      const res = await requestJson<{ likes: number }>(state.apiBase, `/community/posts/${postId}/like`, {
        method: 'POST',
      });
      setState((prev) => ({
        ...prev,
        communityPosts: prev.communityPosts.map((item) =>
          item.id === postId ? { ...item, likes: res.likes } : item,
        ),
        currentCommunityPost:
          prev.currentCommunityPost && prev.currentCommunityPost.id === postId
            ? { ...prev.currentCommunityPost, likes: res.likes }
            : prev.currentCommunityPost,
      }));
      return res.likes;
    });
  }, [state.apiBase, withLoading]);

  const pollExportTask = useCallback(async (taskId?: string) => {
    const targetId = taskId || state.exportTask?.task_id;
    if (!targetId) {
      return null;
    }

    return withLoading(async () => {
      const task = await requestJson<ExportTask>(state.apiBase, `/export/status/${targetId}`);
      setState((prev) => ({ ...prev, exportTask: task }));
      return task;
    });
  }, [state.apiBase, state.exportTask?.task_id, withLoading]);

  const startExport = useCallback(async (type: 'map' | 'notebook') => {
    if (!state.travel?.id) {
      throw new Error('没有可导出的旅行');
    }

    return withLoading(async () => {
      const task = await requestJson<ExportTask>(state.apiBase, `/export/${type}`, {
        method: 'POST',
        body: {
          travel_id: state.travel!.id,
        },
      });
      setState((prev) => ({ ...prev, exportTask: task }));
      return task;
    });
  }, [state.apiBase, state.travel, withLoading]);

  const login = useCallback(async (username: string, password: string) => {
    return withLoading(async () => {
      const res = await requestJson<{ user_id: number; nickname?: string | null }>(state.apiBase, '/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      setState((prev) => ({ ...prev, userId: res.user_id }));
      return res;
    });
  }, [state.apiBase, withLoading]);

  const register = useCallback(async (username: string, password: string, nickname?: string) => {
    return withLoading(async () => {
      const res = await requestJson<{ user_id: number; nickname?: string | null }>(state.apiBase, '/auth/register', {
        method: 'POST',
        body: { username, password, nickname: nickname || undefined },
      });
      setState((prev) => ({ ...prev, userId: res.user_id }));
      return res;
    });
  }, [state.apiBase, withLoading]);

  const logout = useCallback(() => {
    setState((prev) => ({
      ...defaultState,
      apiBase: prev.apiBase,
      mapClientConfig: prev.mapClientConfig,
    }));
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem('yuanlv_user');
    window.localStorage.removeItem('yuanlv_onboarded');
    window.localStorage.removeItem('yuanlv_permissions');
  }, []);

  const uploadFile = useCallback(async (file: Blob, category = 'general', filename?: string) => {
    if (isDemoMode()) {
      await new Promise(r => setTimeout(r, 300));
      return 'https://placehold.co/400x300/F97316/white?text=Demo+Photo';
    }
    const base = state.apiBase.replace(/\/$/, '');
    const formData = new FormData();
    formData.append('file', file, filename || 'upload');
    const response = await fetch(`${base}/upload/file?category=${encodeURIComponent(category)}`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      let message = `${response.status} ${response.statusText}`;
      try { const d = await response.json(); message = String(d.detail || message); } catch { /* ignore */ }
      throw new Error(message);
    }
    const data = await response.json() as { url: string };
    // If the URL is relative (local fallback), prepend the API base
    if (data.url.startsWith('/')) {
      return `${base}${data.url}`;
    }
    return data.url;
  }, [state.apiBase]);

  const cartoonify = useCallback(async (imageUrl: string, style = 'cartoon') => {
    // Do NOT use withLoading — cartoonify takes 60-120s and should not block global UI
    const res = await requestJson<{ result_urls: string[] }>(state.apiBase, '/image/cartoonify', {
      method: 'POST',
      body: { image_url: imageUrl, style },
    });
    return res.result_urls;
  }, [state.apiBase]);

  useEffect(() => {
    if (!state.travel?.id) {
      return;
    }
    refreshTravel().catch(() => undefined);
  }, [refreshTravel, state.travel?.id]);

  useEffect(() => {
    // Re-fetch if config is missing or has no valid token
    if (state.mapClientConfig !== null && state.mapClientConfig.public_token) {
      return;
    }
    let retries = 0;
    const maxRetries = 3;
    const attempt = () => {
      loadMapClientConfig().catch(() => {
        retries += 1;
        if (retries < maxRetries) {
          setTimeout(attempt, 2000 * retries);
        }
      });
    };
    attempt();
  }, [loadMapClientConfig, state.mapClientConfig]);

  useEffect(() => {
    if (!state.currentCapsule?.id) {
      return;
    }
    loadCapsule(state.currentCapsule.id).catch(() => undefined);
  }, [loadCapsule, state.currentCapsule?.id]);

  useEffect(() => {
    if (!state.bottleTrajectory?.bottle_id && !state.bottle?.bottle_id) {
      return;
    }
    loadBottleTrajectory().catch(() => undefined);
  }, [loadBottleTrajectory, state.bottle?.bottle_id, state.bottleTrajectory?.bottle_id]);

  const value = useMemo<AppStateValue>(() => ({
    ...state,
    loading,
    error,
    setApiBase,
    loadMapClientConfig,
    setCurrentPosition,
    resolveLocationContext,
    startTravel,
    refreshTravel,
    loadTravelById,
    uploadLocation,
    createManualAnchor,
    endTravel,
    loadDiary,
    loadTravelHistory,
    createCapsule,
    loadNearbyCapsules,
    loadMyCapsules,
    loadCapsule,
    verifyCapsule,
    createCapsuleEcho,
    throwBottle,
    receiveBottle,
    loadMyBottles,
    loadBottleTrajectory,
    loadNotifications,
    loadCommunityHealth,
    loadAgentStatuses,
    loadCommunityPosts,
    loadCommunityPost,
    loadCollectiveMemory,
    createCommunityPost,
    likeCommunityPost,
    startExport,
    pollExportTask,
    login,
    register,
    logout,
    uploadFile,
    cartoonify,
    clearError: () => setError(null),
  }), [
    cartoonify,
    createCapsule,
    createCapsuleEcho,
    createCommunityPost,
    createManualAnchor,
    endTravel,
    error,
    loadBottleTrajectory,
    loadCommunityPost,
    loadCommunityPosts,
    loadMyBottles,
    loadMyCapsules,
    loadCapsule,
    loadAgentStatuses,
    loadCommunityHealth,
    loadCollectiveMemory,
    loadDiary,
    loadNearbyCapsules,
    loadNotifications,
    loadTravelHistory,
    loadTravelById,
    loading,
    likeCommunityPost,
    login,
    logout,
    pollExportTask,
    receiveBottle,
    refreshTravel,
    register,
    resolveLocationContext,
    setApiBase,
    loadMapClientConfig,
    setCurrentPosition,
    startExport,
    startTravel,
    state,
    throwBottle,
    uploadFile,
    uploadLocation,
    verifyCapsule,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}

export function toIsoLocal(datetimeLocal?: string | null) {
  if (!datetimeLocal) {
    return null;
  }
  const date = new Date(datetimeLocal);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function formatDistanceKm(points: Array<LatLng>) {
  if (points.length < 2) {
    return 0;
  }
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += haversineKm(points[i - 1], points[i]);
  }
  return Number(total.toFixed(2));
}

export function haversineKm(a: LatLng, b: LatLng) {
  const earthRadiusKm = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const value =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const arc = 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  return earthRadiusKm * arc;
}
