/**
 * Demo API Handler
 *
 * Routes all requestJson calls to hardcoded demo data when demo mode is on.
 * Covers every endpoint used by the frontend.
 */
import {
  DEMO_AGENT_STATUSES,
  DEMO_ALL_ANCHORS,
  DEMO_BOTTLE_RECEIVE,
  DEMO_BOTTLE_TRAJECTORY,
  DEMO_CAPSULE_DETAIL,
  DEMO_COLLECTIVE_MEMORY,
  DEMO_COMMUNITY_HEALTH,
  DEMO_COMMUNITY_POST_DETAIL,
  DEMO_COMMUNITY_POSTS,
  DEMO_DIARY,
  DEMO_EXPORT_TASK,
  DEMO_MAP_CONTEXT,
  DEMO_MY_BOTTLES,
  DEMO_MY_CAPSULES,
  DEMO_NEARBY_CAPSULES,
  DEMO_NOTIFICATIONS,
  DEMO_POPULAR_TAGS,
  DEMO_POSITION,
  DEMO_TRAVEL,
  DEMO_TRAVEL_ANCHORS,
  DEMO_TRAVEL_HISTORY,
  DEMO_TRAVEL_LOCATIONS,
} from './demoData';

// Keep incrementing counter so IDs stay unique across demo session
let _nextId = 90000;
function nextId() { return _nextId++; }

/**
 * Main router - matches path patterns and returns demo data.
 */
export function demoApiHandler<T>(path: string, method: string, body?: unknown): T {
  const p = path.split('?')[0]; // strip query string
  const bodyObj = (body || {}) as Record<string, unknown>;

  // ── Auth ────────────────────────────────────────────────────────
  if (p === '/auth/login') {
    return { user_id: 1, nickname: '旅行者小缘' } as T;
  }
  if (p === '/auth/register') {
    return { user_id: 1, nickname: bodyObj.nickname || '旅行者小缘' } as T;
  }

  // ── Map ─────────────────────────────────────────────────────────
  if (p === '/map/client-config') {
    // Try multiple sources for the Mapbox token
    const envToken = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAPBOX_TOKEN) || '';
    let storedToken = '';
    try {
      const raw = localStorage.getItem('yuanlu-react-state-v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        storedToken = parsed?.mapClientConfig?.public_token || '';
      }
    } catch { /* ignore */ }
    return {
      provider: 'mapbox',
      public_token: envToken || storedToken || '',
      style_url: 'mapbox://styles/mapbox/streets-v12',
    } as T;
  }
  if (p.startsWith('/map/context')) {
    return DEMO_MAP_CONTEXT as T;
  }

  // ── Travel ──────────────────────────────────────────────────────
  if (p === '/travel/start' && method === 'POST') {
    return { travel_id: DEMO_TRAVEL.id } as T;
  }
  if (p.match(/^\/travel\/\d+$/) && method === 'GET') {
    return DEMO_TRAVEL as T;
  }
  if (p.match(/^\/travel\/\d+\/locations$/)) {
    return { items: DEMO_TRAVEL_LOCATIONS } as T;
  }
  if (p.match(/^\/travel\/\d+\/anchors$/)) {
    return { items: DEMO_TRAVEL_ANCHORS } as T;
  }
  if (p === '/travel/location' && method === 'POST') {
    return { status: 'ok', anchor_triggered: false } as T;
  }
  if (p === '/travel/anchor/manual' && method === 'POST') {
    const newId = nextId();
    return { anchor_id: newId } as T;
  }
  if (p.match(/^\/travel\/anchor\/\d+$/)) {
    const anchorId = Number(p.split('/').pop());
    if (method === 'PATCH') {
      // Update user_text - return the updated anchor
      const existing = DEMO_TRAVEL_ANCHORS.find(a => a.id === anchorId);
      if (existing) {
        return { ...existing, user_text: bodyObj.user_text || existing.user_text } as T;
      }
    }
    const found = DEMO_TRAVEL_ANCHORS.find(a => a.id === anchorId);
    if (found) return found as T;
    // Return a generic anchor for unknown IDs
    return {
      id: anchorId,
      travel_id: DEMO_TRAVEL.id,
      lat: DEMO_POSITION.lat,
      lng: DEMO_POSITION.lng,
      poi_name: '记忆锚点',
      weather: '晴',
      temperature: 20,
      motion_type: 'stationary',
      ai_description: '一个值得停留的地方。',
      agent_status: 'ready',
      created_at: new Date().toISOString(),
    } as T;
  }
  if (p === '/travel/end' && method === 'POST') {
    return { status: 'ok' } as T;
  }
  if (p.match(/^\/travel\/\d+\/diary$/)) {
    return DEMO_DIARY as T;
  }
  if (p.startsWith('/travel/list')) {
    return { items: DEMO_TRAVEL_HISTORY } as T;
  }
  if (p.startsWith('/travel/anchors/user')) {
    return { items: DEMO_ALL_ANCHORS } as T;
  }

  // ── Capsule ─────────────────────────────────────────────────────
  if (p === '/capsule/create' && method === 'POST') {
    return { capsule_id: nextId() } as T;
  }
  if (p.match(/^\/capsule\/\d+$/)) {
    const capsuleId = Number(p.split('/').pop());
    if (capsuleId === 5001) return DEMO_CAPSULE_DETAIL as T;
    // Return the detail for any capsule
    return {
      ...DEMO_CAPSULE_DETAIL,
      id: capsuleId,
      status: 'active',
      is_locked: false,
      echoes: [],
    } as T;
  }
  if (p.startsWith('/capsule/nearby')) {
    return { items: DEMO_NEARBY_CAPSULES } as T;
  }
  if (p.startsWith('/capsule/mine')) {
    return { items: DEMO_MY_CAPSULES } as T;
  }
  if (p === '/capsule/verify' && method === 'POST') {
    // Always pass in demo mode
    return {
      result: 'pass',
      message: '答案正确！胶囊已为你打开。',
      poetic_line: '在同一片天空下，不同时间的旅人终于相遇了。',
    } as T;
  }
  if (p === '/capsule/echo' && method === 'POST') {
    return { status: 'ok' } as T;
  }

  // ── Bottle ──────────────────────────────────────────────────────
  if (p === '/bottle/throw' && method === 'POST') {
    return { bottle_id: nextId(), status: 'drifting' } as T;
  }
  if (p === '/bottle/receive' && method === 'POST') {
    // Always receive in demo mode
    return DEMO_BOTTLE_RECEIVE as T;
  }
  if (p.match(/^\/bottle\/trajectory\/\d+$/)) {
    return DEMO_BOTTLE_TRAJECTORY as T;
  }
  if (p.startsWith('/bottle/mine')) {
    return { items: DEMO_MY_BOTTLES } as T;
  }

  // ── Community ───────────────────────────────────────────────────
  if (p === '/community/posts' && method === 'GET') {
    return { items: DEMO_COMMUNITY_POSTS } as T;
  }
  if (p === '/community/posts' && method === 'POST') {
    return { post_id: nextId() } as T;
  }
  if (p.match(/^\/community\/posts\/\d+$/)) {
    const postId = Number(p.split('/').pop());
    if (postId === DEMO_COMMUNITY_POST_DETAIL.id) {
      return DEMO_COMMUNITY_POST_DETAIL as T;
    }
    const summary = DEMO_COMMUNITY_POSTS.find(pp => pp.id === postId);
    return {
      ...DEMO_COMMUNITY_POST_DETAIL,
      ...(summary || {}),
      id: postId,
    } as T;
  }
  if (p.match(/^\/community\/posts\/\d+\/like$/)) {
    const postId = Number(p.split('/')[3]);
    const post = DEMO_COMMUNITY_POSTS.find(pp => pp.id === postId);
    return { likes: (post?.likes || 0) + 1 } as T;
  }
  if (p.startsWith('/community/heatmap')) {
    return DEMO_COLLECTIVE_MEMORY as T;
  }
  if (p === '/community/health') {
    return { status: DEMO_COMMUNITY_HEALTH } as T;
  }
  if (p.startsWith('/community/tags/popular')) {
    return {
      tags: DEMO_POPULAR_TAGS.map(t => ({ name: t.tag, category: 'city', count: String(t.count) })),
    } as T;
  }
  if (p.startsWith('/community/tags/search')) {
    const query = new URLSearchParams(path.split('?')[1] || '').get('query') || '';
    const matched = DEMO_POPULAR_TAGS
      .filter(t => t.tag.toLowerCase().includes(query.toLowerCase()))
      .map(t => ({ name: t.tag, category: 'city', count: String(t.count) }));
    return { tags: matched } as T;
  }

  // ── Tags ────────────────────────────────────────────────────────
  if (p === '/tags/auto' && method === 'POST') {
    return { tags: ['宁静', '风景', '记忆'] } as T;
  }

  // ── Export ──────────────────────────────────────────────────────
  if (p.match(/^\/export\/(map|notebook)$/) && method === 'POST') {
    return {
      ...DEMO_EXPORT_TASK,
      task_id: `demo-export-${nextId()}`,
      type: p.split('/').pop(),
    } as T;
  }
  if (p.startsWith('/export/status/')) {
    return { ...DEMO_EXPORT_TASK, status: 'completed' } as T;
  }

  // ── Upload ─────────────────────────────────────────────────────
  if (p.startsWith('/upload/file')) {
    return { url: 'https://placehold.co/400x300/F97316/white?text=Demo+Photo' } as T;
  }

  // ── Image (cartoonify) ─────────────────────────────────────────
  if (p === '/image/cartoonify' && method === 'POST') {
    return { result_urls: ['https://placehold.co/400x300/8B5CF6/white?text=Cartoon+Style'] } as T;
  }

  // ── System ─────────────────────────────────────────────────────
  if (p === '/agent/status') {
    return { agents: DEMO_AGENT_STATUSES } as T;
  }
  if (p.startsWith('/notifications/unread')) {
    return { items: DEMO_NOTIFICATIONS } as T;
  }

  // ── Fallback ───────────────────────────────────────────────────
  console.warn(`[Demo Mode] Unhandled API path: ${method} ${path}`);
  return {} as T;
}
