/**
 * Demo Mode - Hardcoded data for showcasing all features without backend.
 *
 * Scenario: User "旅行者小缘" has been traveling extensively.
 * Current location: Hangzhou West Lake area.
 * Active travel: A rich Hangzhou trip with many anchors, photos, AI text, user text, RAG memories.
 * Capsules: Nearby capsules that auto-approach and can be opened.
 * Bottles: Always receive a bottle on pickup.
 * Community: Rich posts in the tree hole.
 * Profile: High-level user with many diaries/capsules/bottles.
 */

import type {
  AgentStatusItem,
  BottleManagedItem,
  BottleReceiveResult,
  BottleTrajectory,
  CapsuleDetail,
  CapsuleManagedItem,
  CapsuleNearbyItem,
  CollectiveMemoryData,
  CommunityPostDetail,
  CommunityPostSummary,
  CurrentPosition,
  DiaryData,
  ExportTask,
  MapClientConfig,
  MapContextData,
  NotificationItem,
  TravelAnchor,
  TravelListItem,
  TravelLocation,
  TravelSummary,
} from './types';

// ─── Current Position: Hangzhou West Lake ────────────────────────────
export const DEMO_POSITION: CurrentPosition = {
  lat: 30.2590,
  lng: 120.1488,
  city: '杭州',
  label: '西湖风景名胜区',
  full_address: '浙江省杭州市西湖区西湖风景名胜区',
  poi_name: '断桥残雪',
  poi_type: '风景名胜',
  is_seaside: false,
  timestamp: new Date().toISOString(),
};

export const DEMO_MAP_CONTEXT: MapContextData = {
  lat: 30.2590,
  lng: 120.1488,
  city: '杭州',
  label: '西湖风景名胜区',
  full_address: '浙江省杭州市西湖区西湖风景名胜区',
  poi_name: '断桥残雪',
  poi_type: '风景名胜',
  is_seaside: false,
};

// ─── Map Config (hardcoded token for demo) ──────────────────────
export const DEMO_MAP_CONFIG: MapClientConfig = {
  provider: 'mapbox',
  public_token: '',
  style_url: 'mapbox://styles/mapbox/streets-v12',
};

// ─── Travel: Active Hangzhou Trip (status=ended for diary viewing) ───
const TRAVEL_ID = 1001;
const now = new Date();
const tripStart = new Date(now.getTime() - 6 * 3600 * 1000); // 6 hours ago

export const DEMO_TRAVEL: TravelSummary = {
  id: TRAVEL_ID,
  user_id: 1,
  city: '杭州',
  status: 'ended',
  start_time: tripStart.toISOString(),
  end_time: new Date(now.getTime() - 30 * 60000).toISOString(),
  total_distance: 8.72,
  weather_summary: '多云转晴 15-22°C',
  anchor_count: 6,
  location_count: 342,
};

// ─── Travel Locations: GPS trail around West Lake ────────────────────
function generateWestLakeTrail(): TravelLocation[] {
  const points: [number, number][] = [
    [30.2590, 120.1488], // Broken Bridge
    [30.2585, 120.1492],
    [30.2578, 120.1498],
    [30.2570, 120.1505],
    [30.2562, 120.1510], // Bai Causeway
    [30.2555, 120.1515],
    [30.2548, 120.1518],
    [30.2540, 120.1520],
    [30.2530, 120.1518],
    [30.2520, 120.1512], // Solitary Hill
    [30.2510, 120.1505],
    [30.2500, 120.1498],
    [30.2492, 120.1490],
    [30.2485, 120.1480], // Su Causeway
    [30.2478, 120.1470],
    [30.2472, 120.1460],
    [30.2468, 120.1448],
    [30.2465, 120.1435],
    [30.2462, 120.1420],
    [30.2458, 120.1408],
    [30.2452, 120.1395],
    [30.2445, 120.1388],
    [30.2438, 120.1382], // Leifeng Pagoda area
    [30.2432, 120.1378],
    [30.2425, 120.1375],
    [30.2418, 120.1380],
    [30.2410, 120.1388],
    [30.2405, 120.1395],
    [30.2400, 120.1405],
    [30.2398, 120.1418],
    [30.2395, 120.1430],
    [30.2390, 120.1445],
    [30.2385, 120.1460], // Nanshan Road
    [30.2382, 120.1475],
    [30.2380, 120.1490],
    [30.2378, 120.1505],
    [30.2375, 120.1518],
    [30.2372, 120.1530],
    [30.2375, 120.1540],
    [30.2380, 120.1548],
    [30.2388, 120.1555],
    [30.2395, 120.1560], // Hefang Street
    [30.2405, 120.1565],
    [30.2415, 120.1568],
    [30.2426, 120.1570],
  ];

  return points.map((p, i) => ({
    id: 10000 + i,
    travel_id: TRAVEL_ID,
    lat: p[0],
    lng: p[1],
    speed: 2.5 + Math.random() * 2,
    timestamp: new Date(tripStart.getTime() + i * (6 * 3600 * 1000 / points.length)).toISOString(),
  }));
}

export const DEMO_TRAVEL_LOCATIONS: TravelLocation[] = generateWestLakeTrail();

// ─── Travel Anchors: 6 rich anchors around West Lake ─────────────────
export const DEMO_TRAVEL_ANCHORS: TravelAnchor[] = [
  {
    id: 2001,
    travel_id: TRAVEL_ID,
    user_id: 1,
    lat: 30.2590,
    lng: 120.1488,
    poi_name: '断桥残雪',
    poi_type: '风景名胜',
    weather: '多云',
    temperature: 18,
    motion_type: 'stationary',
    ai_description: '从北山街拐进断桥，雨刚停。桥上还残留着湿漉漉的光，游客稀少，偶尔有人撑着伞慢慢走过。湖面笼着一层薄雾，对岸的山影若隐若现，像一幅还没干透的水墨画。空气中混着桂花和泥土的气息。',
    user_text: '在桥上站了很久，什么都没想，只是看着湖面发呆。雨后的西湖有一种被清空的感觉，好像整个世界只剩下水和雾。',
    photo_url: null,
    audio_url: null,
    audio_transcript: null,
    emotion_tags: ['宁静', '治愈', '孤独'],
    is_manual: false,
    agent_status: 'ready',
    created_at: new Date(tripStart.getTime() + 10 * 60000).toISOString(),
  },
  {
    id: 2002,
    travel_id: TRAVEL_ID,
    user_id: 1,
    lat: 30.2520,
    lng: 120.1512,
    poi_name: '孤山',
    poi_type: '景区',
    weather: '多云转晴',
    temperature: 19,
    motion_type: 'slow_walk',
    ai_description: '沿着白堤走到了孤山脚下。梅花虽然已经谢了，但枝干的姿态仍然像水墨的笔触。西泠印社的围墙上爬满了藤蔓，一只猫在石阶上晒太阳，对人类的到来毫不在意。',
    user_text: '路过西泠印社门口，里头传来刻章的声音，很轻，像在石头上写情书。',
    photo_url: null,
    audio_url: null,
    audio_transcript: null,
    emotion_tags: ['怀旧', '文艺', '惬意'],
    is_manual: false,
    agent_status: 'ready',
    created_at: new Date(tripStart.getTime() + 70 * 60000).toISOString(),
  },
  {
    id: 2003,
    travel_id: TRAVEL_ID,
    user_id: 1,
    lat: 30.2438,
    lng: 120.1382,
    poi_name: '雷峰塔',
    poi_type: '古迹',
    weather: '晴',
    temperature: 21,
    motion_type: 'stationary',
    ai_description: '站在雷峰塔下抬头望，夕阳把塔身镀成了金色。传说白娘子被压在这座塔下，如今年轻人在塔前举着手机自拍。塔影倒映在水面上，随波纹微微晃动，带着一种不属于这个时代的从容。',
    user_text: '夕阳下的雷峰塔真的很美。想起小时候看白蛇传，没想到有一天会站在这里。',
    photo_url: null,
    audio_url: null,
    audio_transcript: '风声和远处游船的汽笛声，偶尔有鸟叫。',
    emotion_tags: ['震撼', '感慨', '浪漫'],
    is_manual: false,
    agent_status: 'ready',
    created_at: new Date(tripStart.getTime() + 150 * 60000).toISOString(),
  },
  {
    id: 2004,
    travel_id: TRAVEL_ID,
    user_id: 1,
    lat: 30.2385,
    lng: 120.1460,
    poi_name: '南山路',
    poi_type: '街道',
    weather: '晴',
    temperature: 22,
    motion_type: 'walking',
    ai_description: '南山路两侧的梧桐树撑开一条绿色隧道，阳光透过叶缝洒下斑驳的光影。路边的咖啡馆飘出浓郁的香气，有人在户外座位上看书，有人对着湖面写生。这条路有一种让人自然慢下来的魔力。',
    user_text: null,
    photo_url: null,
    audio_url: null,
    audio_transcript: null,
    emotion_tags: ['悠闲', '文艺', '舒适'],
    is_manual: false,
    agent_status: 'ready',
    created_at: new Date(tripStart.getTime() + 210 * 60000).toISOString(),
  },
  {
    id: 2005,
    travel_id: TRAVEL_ID,
    user_id: 1,
    lat: 30.2395,
    lng: 120.1560,
    poi_name: '河坊街',
    poi_type: '历史街区',
    weather: '晴',
    temperature: 22,
    motion_type: 'slow_walk',
    ai_description: '走进河坊街，人渐渐多了起来。空气中混着糖炒栗子、桂花糕和中药的味道。老字号的招牌在头顶重叠，手工艺人在摊位前专注地忙碌着。时间在这里仿佛有两种速度：游客匆匆而过，而店铺里的人不紧不慢。',
    user_text: '在胡庆余堂门口买了杯龟苓膏，味道苦苦的，但是很清凉。旁边大爷说这个配方两百年没变过。',
    photo_url: null,
    audio_url: null,
    audio_transcript: null,
    emotion_tags: ['热闹', '新奇', '烟火气'],
    is_manual: false,
    agent_status: 'ready',
    created_at: new Date(tripStart.getTime() + 280 * 60000).toISOString(),
  },
  {
    id: 2006,
    travel_id: TRAVEL_ID,
    user_id: 1,
    lat: 30.2426,
    lng: 120.1570,
    poi_name: '吴山广场',
    poi_type: '广场',
    weather: '晴',
    temperature: 20,
    motion_type: 'stationary',
    ai_description: '暮色降临，吴山广场上有人在跳广场舞，有人在遛狗，有孩子在追泡泡。城隍阁在山顶亮起了灯，像一座漂浮在空中的宫殿。从这个角度回望西湖，那条走了一整天的路线变成了一个完整的弧形。',
    user_text: '一天就这么走完了。脚很酸，但心里很满。杭州是那种让你走着走着就忘了时间的城市。',
    photo_url: null,
    audio_url: null,
    audio_transcript: null,
    emotion_tags: ['满足', '疲惫', '感恩'],
    is_manual: true,
    agent_status: 'ready',
    created_at: new Date(tripStart.getTime() + 340 * 60000).toISOString(),
  },
];

// ─── Diary: AI + User + RAG segments ────────────────────────────────
export const DEMO_DIARY: DiaryData = {
  status: 'ready',
  travel_id: TRAVEL_ID,
  updated_at: now.toISOString(),
  content_json: {
    segments: [
      // Anchor 1: Broken Bridge
      {
        source: 'ai',
        text: '从北山街拐进断桥时，雨刚刚停。桥面还残留着雨水的光泽，游客稀少，偶尔有人撑着透明雨伞慢慢走过。西湖被薄雾笼着，对岸的宝石山若隐若现，像一幅尚未干透的水墨画。空气里弥漫着桂花与泥土混合的气息，是杭州特有的温润。',
      },
      {
        source: 'user',
        text: '在桥上站了很久，什么都没想，只是看着湖面发呆。雨后的西湖有一种被清空的感觉，好像整个世界只剩下水和雾。',
      },
      {
        source: 'rag',
        text: '两年前的秋天你也来过这里。那次你写道：「西湖的雨是软的，不像北方的雨那么急，它像是空气里多了一层水汽，不知不觉就湿了头发。」时隔两年重返断桥，雨依旧是软的，而你已经是不一样的人了。',
      },
      // Anchor 2: Solitary Hill
      {
        source: 'ai',
        text: '沿白堤向西，一路杨柳拂岸。走到孤山脚下时，梅花虽已谢过，但虬曲的枝干仍保留着冬天的骨感。西泠印社的红墙上爬满了老藤，一只橘猫慵懒地卧在石阶上，从容地审视每一个路过的人。',
      },
      {
        source: 'user',
        text: '路过西泠印社门口，里头传来刻章的声音，很轻，像在石头上写情书。',
      },
      // Anchor 3: Leifeng Pagoda
      {
        source: 'ai',
        text: '下午的阳光把雷峰塔镀成了金色。塔影映在水面上随涟漪微微摇晃，像是一件不属于这个时代的事物，从容而庄重地矗立在那里。远处传来游船的汽笛声，和风声、鸟鸣混在一起，构成了西湖黄昏的背景音。',
      },
      {
        source: 'user',
        text: '夕阳下的雷峰塔真的很美。想起小时候看白蛇传，没想到有一天会站在这里。',
      },
      {
        source: 'rag',
        text: '你的旅行记忆库中记录着一个关于「塔」的记忆碎片：去年冬天在西安大雁塔下，你写道「所有的塔都是通向某个时空的天线」。今天的雷峰塔接收到了什么信号呢？',
      },
      // Anchor 4: Nanshan Road
      {
        source: 'ai',
        text: '南山路的梧桐树撑开一条翠绿的隧道，日光穿过叶隙洒下碎金般的光斑。路边的咖啡馆传出bossa nova的旋律，有人在户外长椅上翻着书，有人对着湖面支起了画架。这条路有一种悄然放慢时间的力量。',
      },
      // Anchor 5: Hefang Street
      {
        source: 'ai',
        text: '转入河坊街，烟火气扑面而来。糖炒栗子、桂花糕、龙井茶的香味交织在一起。老字号的金字招牌在青石路上空重叠，手工艺人在摊位前专注地忙着各自的手艺。时间在这里分叉成两条河流：游客匆匆地流过，而铺子里的人不紧不慢地守着自己的节奏。',
      },
      {
        source: 'user',
        text: '在胡庆余堂门口买了杯龟苓膏，味道苦苦的，但是很清凉。旁边大爷说这个配方两百年没变过。',
      },
      // Anchor 6: Wushan
      {
        source: 'ai',
        text: '暮色里的吴山广场很热闹。有人跳舞，有人遛狗，孩子在追着泡泡跑。山顶的城隍阁亮起了灯，从这个角度回望西湖，今天走过的那条路线在暮光中连成一道柔和的弧线，像是一个完整的句号。',
      },
      {
        source: 'user',
        text: '一天就这么走完了。脚很酸，但心里很满。杭州是那种让你走着走着就忘了时间的城市。',
      },
      // Final RAG memory
      {
        source: 'rag',
        text: '记忆索引显示，这是你第三次来杭州。第一次是2022年夏天，你在灵隐寺许了一个愿；第二次是2024年秋天，你在断桥写下了那句「西湖的雨是软的」。每一次来，你都变得更安静了一点。Memory OS 已将今天的旅行存入你的个人记忆库，未来某一天，当你再次路过这片湖水时，这些文字会被重新唤起。',
      },
    ],
    meta: {
      generated_by: 'Qwen2.5-14B',
      rag_hits: 3,
      total_anchors: 6,
      word_count: 1200,
    },
  },
};

// ─── Travel History: Multiple past trips ─────────────────────────────
export const DEMO_TRAVEL_HISTORY: TravelListItem[] = [
  {
    id: TRAVEL_ID,
    user_id: 1,
    city: '杭州',
    status: 'ended',
    start_time: tripStart.toISOString(),
    end_time: new Date(now.getTime() - 30 * 60000).toISOString(),
    total_distance: 8.72,
    anchor_count: 6,
    location_count: 342,
    diary_status: 'ready',
    diary_excerpt: '从北山街拐进断桥时，雨刚刚停。桥面还残留着雨水的光泽……',
  },
  {
    id: 1000,
    user_id: 1,
    city: '上海',
    status: 'ended',
    start_time: new Date(now.getTime() - 7 * 86400000).toISOString(),
    end_time: new Date(now.getTime() - 7 * 86400000 + 5 * 3600000).toISOString(),
    total_distance: 6.3,
    anchor_count: 4,
    location_count: 210,
    diary_status: 'ready',
    diary_excerpt: '外滩的风总是比预想的大。黄浦江对岸的天际线在夜色中亮成一片金色的屏障……',
  },
  {
    id: 999,
    user_id: 1,
    city: '南京',
    status: 'ended',
    start_time: new Date(now.getTime() - 14 * 86400000).toISOString(),
    end_time: new Date(now.getTime() - 14 * 86400000 + 4 * 3600000).toISOString(),
    total_distance: 5.1,
    anchor_count: 3,
    location_count: 165,
    diary_status: 'ready',
    diary_excerpt: '沿着中山陵的台阶一级一级往上走，两旁的梧桐高大而沉默……',
  },
  {
    id: 998,
    user_id: 1,
    city: '西安',
    status: 'ended',
    start_time: new Date(now.getTime() - 30 * 86400000).toISOString(),
    end_time: new Date(now.getTime() - 30 * 86400000 + 7 * 3600000).toISOString(),
    total_distance: 12.5,
    anchor_count: 8,
    location_count: 485,
    diary_status: 'ready',
    diary_excerpt: '城墙上的风把头发吹得很乱，脚下是六百年的青砖。骑着自行车环城一圈……',
  },
  {
    id: 997,
    user_id: 1,
    city: '成都',
    status: 'ended',
    start_time: new Date(now.getTime() - 45 * 86400000).toISOString(),
    end_time: new Date(now.getTime() - 45 * 86400000 + 6 * 3600000).toISOString(),
    total_distance: 7.8,
    anchor_count: 5,
    location_count: 290,
    diary_status: 'ready',
    diary_excerpt: '宽窄巷子的下午，阳光从竹帘缝隙里漏进来，茶馆老板不紧不慢地冲着盖碗茶……',
  },
  {
    id: 996,
    user_id: 1,
    city: '厦门',
    status: 'ended',
    start_time: new Date(now.getTime() - 60 * 86400000).toISOString(),
    end_time: new Date(now.getTime() - 60 * 86400000 + 5 * 3600000).toISOString(),
    total_distance: 4.5,
    anchor_count: 4,
    location_count: 180,
    diary_status: 'ready',
    diary_excerpt: '鼓浪屿的巷子窄得只能容两人并行，墙上的三角梅开得热烈而不管不顾……',
  },
];

// ─── All User Anchors (for map markers) ──────────────────────────────
export const DEMO_ALL_ANCHORS = [
  ...DEMO_TRAVEL_ANCHORS.map(a => ({ id: a.id, lat: a.lat, lng: a.lng, poi_name: a.poi_name, travel_id: a.travel_id })),
  // Shanghai anchors
  { id: 3001, lat: 31.2400, lng: 121.4900, poi_name: '外滩', travel_id: 1000 },
  { id: 3002, lat: 31.2310, lng: 121.4743, poi_name: '南京东路', travel_id: 1000 },
  { id: 3003, lat: 31.2270, lng: 121.4578, poi_name: '人民广场', travel_id: 1000 },
  // Nanjing anchors
  { id: 3004, lat: 32.0570, lng: 118.8500, poi_name: '中山陵', travel_id: 999 },
  { id: 3005, lat: 32.0450, lng: 118.7820, poi_name: '夫子庙', travel_id: 999 },
  // Xi'an anchors
  { id: 3006, lat: 34.2620, lng: 108.9420, poi_name: '城墙', travel_id: 998 },
  { id: 3007, lat: 34.2580, lng: 108.9480, poi_name: '回民街', travel_id: 998 },
  { id: 3008, lat: 34.3845, lng: 109.2785, poi_name: '兵马俑', travel_id: 998 },
  // Chengdu anchors
  { id: 3009, lat: 30.6720, lng: 104.0470, poi_name: '宽窄巷子', travel_id: 997 },
  { id: 3010, lat: 30.6565, lng: 104.0586, poi_name: '春熙路', travel_id: 997 },
  // Xiamen anchors
  { id: 3011, lat: 24.4470, lng: 118.0700, poi_name: '鼓浪屿', travel_id: 996 },
  { id: 3012, lat: 24.4600, lng: 118.0900, poi_name: '南普陀寺', travel_id: 996 },
];

// ─── Nearby Capsules: Very close so they "auto-approach" ─────────────
export const DEMO_NEARBY_CAPSULES: CapsuleNearbyItem[] = [
  {
    id: 5001,
    lat: 30.2592,
    lng: 120.1490,
    city: '杭州',
    distance_m: 25,
    status: 'active',
    time_lock_until: null,
  },
  {
    id: 5002,
    lat: 30.2588,
    lng: 120.1485,
    city: '杭州',
    distance_m: 35,
    status: 'active',
    time_lock_until: null,
  },
  {
    id: 5003,
    lat: 30.2595,
    lng: 120.1492,
    city: '杭州',
    distance_m: 60,
    status: 'locked',
    time_lock_until: '2026-12-25T00:00:00Z',
  },
];

// ─── Capsule Detail: Rich content for successful open ────────────────
export const DEMO_CAPSULE_DETAIL: CapsuleDetail = {
  id: 5001,
  user_id: 42,
  lat: 30.2592,
  lng: 120.1490,
  city: '杭州',
  status: 'opened',
  is_locked: false,
  time_lock_until: null,
  key_question: '站在断桥上，你看到了什么颜色的天空？',
  key_answer_hint: '与天气有关',
  weather_when_created: '小雨',
  created_at: new Date(now.getTime() - 90 * 86400000).toISOString(),
  found_at: now.toISOString(),
  found_by_user_id: 1,
  yuan_ji: '三个月前的一个雨天，我一个人走到断桥上。那天游客很少，整座桥好像只属于我。雨打在湖面上，每一滴都像是一个小小的句号。我想，如果我现在把一个句号丢进湖里，它会不会漂到另一个故事里去。\n\n如果你也在雨天来到这里，希望你也能感受到这种安静。不必等到雪来，断桥在雨里一样美。\n\n—— 一个喜欢在雨天散步的人',
  echoes: [
    {
      id: 6001,
      content: '我是在一个晴天找到你的胶囊的。虽然没有雨，但你说的安静我感受到了。站在桥上的时候风很轻，湖水比天空还蓝。谢谢你留下这些文字。',
      created_at: new Date(now.getTime() - 30 * 86400000).toISOString(),
    },
    {
      id: 6002,
      content: '「每一滴都像一个小小的句号」——这句话我会记很久。也许旅行就是不断地写句号，然后再开始新的句子。',
      created_at: new Date(now.getTime() - 15 * 86400000).toISOString(),
    },
  ],
};

// ─── My Capsules (profile management) ────────────────────────────────
export const DEMO_MY_CAPSULES: CapsuleManagedItem[] = [
  {
    id: 5010,
    user_id: 1,
    role: 'creator',
    city: '杭州',
    lat: 30.2520,
    lng: 120.1512,
    status: 'active',
    is_locked: false,
    key_question: '孤山上最安静的地方在哪里？',
    key_answer_hint: '和印章有关',
    yuan_ji_preview: '在西泠印社的后院找到了一个没有人的角落……',
    echo_count: 1,
    created_at: new Date(now.getTime() - 60 * 86400000).toISOString(),
  },
  {
    id: 5011,
    user_id: 1,
    role: 'creator',
    city: '上海',
    lat: 31.2400,
    lng: 121.4900,
    status: 'active',
    is_locked: true,
    time_lock_until: '2027-01-01T00:00:00Z',
    key_question: '外滩的风是什么味道的？',
    key_answer_hint: '与海有关',
    yuan_ji_preview: '写给2027年站在外滩的你……',
    echo_count: 0,
    created_at: new Date(now.getTime() - 7 * 86400000).toISOString(),
  },
  {
    id: 5001,
    user_id: 42,
    found_by_user_id: 1,
    role: 'finder',
    city: '杭州',
    lat: 30.2592,
    lng: 120.1490,
    status: 'opened',
    is_locked: false,
    key_question: '站在断桥上，你看到了什么颜色的天空？',
    yuan_ji_preview: '三个月前的一个雨天……',
    echo_count: 2,
    created_at: new Date(now.getTime() - 90 * 86400000).toISOString(),
    found_at: now.toISOString(),
  },
  {
    id: 5012,
    user_id: 1,
    role: 'creator',
    city: '西安',
    lat: 34.2620,
    lng: 108.9420,
    status: 'active',
    is_locked: false,
    key_question: '城墙上骑车一圈需要多长时间？',
    yuan_ji_preview: '六百年的青砖，每一块都有自己的故事……',
    echo_count: 3,
    created_at: new Date(now.getTime() - 30 * 86400000).toISOString(),
  },
];

// ─── Bottle: Always receive successfully ─────────────────────────────
export const DEMO_BOTTLE_RECEIVE: BottleReceiveResult = {
  received: true,
  bottle_id: 7001,
  content: '此刻我坐在鼓浪屿的海边，脚下是温热的沙子，远处是模糊的大陆轮廓。海风把我的笔记本翻了好几页，我懒得去按住它。\n\n如果你收到这个瓶子，希望你的附近也有一片海。如果没有，就闭上眼睛听听风声，也许风是从海上来的。\n\n—— 写于落日时分的厦门',
  from: {
    lat: 24.4470,
    lng: 118.0700,
    city: '厦门',
  },
};

export const DEMO_BOTTLE_TRAJECTORY: BottleTrajectory = {
  bottle_id: 7001,
  status: 'received',
  from: {
    lat: 24.4470,
    lng: 118.0700,
    city: '厦门',
  },
  to: {
    lat: 30.2590,
    lng: 120.1488,
    city: '杭州',
  },
};

// ─── My Bottles (profile management) ─────────────────────────────────
export const DEMO_MY_BOTTLES: BottleManagedItem[] = [
  {
    id: 7001,
    user_id: 88,
    received_by: 1,
    role: 'receiver',
    status: 'received',
    content: '此刻我坐在鼓浪屿的海边……',
    content_preview: '此刻我坐在鼓浪屿的海边……',
    from: { lat: 24.4470, lng: 118.0700, city: '厦门' },
    to: { lat: 30.2590, lng: 120.1488, city: '杭州' },
    created_at: new Date(now.getTime() - 20 * 86400000).toISOString(),
    received_at: now.toISOString(),
  },
  {
    id: 7010,
    user_id: 1,
    role: 'sender',
    status: 'drifting',
    content: '站在上海的某个渡口，对面是浦东的灯火。把这个瓶子扔向黄浦江，虽然它不通大海，但也许它有自己的归处……',
    content_preview: '站在上海的某个渡口……',
    from: { lat: 31.2400, lng: 121.4900, city: '上海' },
    to: null,
    created_at: new Date(now.getTime() - 5 * 86400000).toISOString(),
  },
  {
    id: 7011,
    user_id: 1,
    received_by: 55,
    role: 'sender',
    status: 'received',
    content: '在青岛的栈桥上，海浪不停地拍过来又退回去，像一个永远下不了决心的人……',
    content_preview: '在青岛的栈桥上……',
    from: { lat: 36.0622, lng: 120.3179, city: '青岛' },
    to: { lat: 22.5431, lng: 114.0579, city: '深圳' },
    created_at: new Date(now.getTime() - 40 * 86400000).toISOString(),
    received_at: new Date(now.getTime() - 25 * 86400000).toISOString(),
  },
];

// ─── Community Posts ─────────────────────────────────────────────────
export const DEMO_COMMUNITY_POSTS: CommunityPostSummary[] = [
  {
    id: 8001,
    title: '雨天的断桥，比雪天更美',
    excerpt: '所有人都在等断桥残雪，但我觉得雨天的断桥才是西湖最好的样子……',
    city: '杭州',
    emotion: '宁静',
    scene: '风景',
    is_anonymous: true,
    views: 2847,
    likes: 342,
    created_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
  },
  {
    id: 8002,
    title: '在城墙上骑了两个小时',
    excerpt: '六百年的青砖，每一块都记录着不同的脚步……',
    city: '西安',
    emotion: '震撼',
    scene: '古迹',
    is_anonymous: false,
    views: 1523,
    likes: 198,
    created_at: new Date(now.getTime() - 5 * 86400000).toISOString(),
  },
  {
    id: 8003,
    title: '成都的下午三点',
    excerpt: '宽窄巷子的茶馆里，时间好像停了下来。老板说，喝茶不赶时间……',
    city: '成都',
    emotion: '惬意',
    scene: '美食',
    is_anonymous: true,
    views: 3102,
    likes: 456,
    created_at: new Date(now.getTime() - 8 * 86400000).toISOString(),
  },
  {
    id: 8004,
    title: '一个人的鼓浪屿',
    excerpt: '巷子窄得只能容两人并行，三角梅从围墙上探出来，像在跟路过的人打招呼……',
    city: '厦门',
    emotion: '治愈',
    scene: '海岛',
    is_anonymous: true,
    views: 1876,
    likes: 267,
    created_at: new Date(now.getTime() - 12 * 86400000).toISOString(),
  },
  {
    id: 8005,
    title: '凌晨四点的外滩',
    excerpt: '没有游客，只有清洁工和江风。黄浦江的水在灯光下像流动的黑丝绒……',
    city: '上海',
    emotion: '孤独',
    scene: '城市',
    is_anonymous: false,
    views: 4521,
    likes: 678,
    created_at: new Date(now.getTime() - 15 * 86400000).toISOString(),
  },
  {
    id: 8006,
    title: '我在南京找到了一枚时空胶囊',
    excerpt: '中山陵的台阶上，手机提示附近有胶囊。打开后看到一段文字，写的人已经不知道在哪里了……',
    city: '南京',
    emotion: '感动',
    scene: '缘分',
    is_anonymous: true,
    views: 5678,
    likes: 890,
    created_at: new Date(now.getTime() - 20 * 86400000).toISOString(),
  },
  {
    id: 8007,
    title: '远洋瓶从三亚漂到了大连',
    excerpt: '这个瓶子跨越了3000公里的海岸线，从南海到渤海，用了42天……',
    city: '大连',
    emotion: '惊喜',
    scene: '奇遇',
    is_anonymous: false,
    views: 8934,
    likes: 1234,
    created_at: new Date(now.getTime() - 25 * 86400000).toISOString(),
  },
];

export const DEMO_COMMUNITY_POST_DETAIL: CommunityPostDetail = {
  id: 8001,
  user_id: 42,
  title: '雨天的断桥，比雪天更美',
  excerpt: '所有人都在等断桥残雪，但我觉得雨天的断桥才是西湖最好的样子……',
  content: '所有人都在等断桥残雪，但我觉得雨天的断桥才是西湖最好的样子。\n\n那天下着小雨，桥上几乎没有人。湖面被雨丝织成了一层灰色的绒布，对岸的山影像水墨画里刚落下的一笔。\n\n我在桥中间站了大概半个小时。没有拍照，没有发朋友圈，只是看着雨一滴一滴落进湖里。每一滴都会激起一个小小的圆圈，然后消失，然后又有新的圆圈出现。我想这大概就是生活本身的样子——不停地出现，不停地消失，但湖水始终在那里。\n\n后来风大了，雨也大了，我躲到桥边的亭子里。亭子里还有一个人，我们对视了一下，都笑了。那种笑不是社交性的，而是一种「我们都选择了在雨天来断桥」的默契。\n\n回去的路上经过白堤，杨柳在雨里更绿了。鞋子湿透了，但心情很好。\n\n断桥不需要雪。它只需要一个愿意在雨天走过来的人。',
  city: '杭州',
  emotion: '宁静',
  scene: '风景',
  is_anonymous: true,
  views: 2847,
  likes: 342,
  image_urls: [],
  source_travel_id: null,
  created_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
};

// ─── Collective Memory Heatmap ───────────────────────────────────────
export const DEMO_COLLECTIVE_MEMORY: CollectiveMemoryData = {
  features: [
    // West Lake area - dense
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1488, 30.2590] }, properties: { intensity: 0.95 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1490, 30.2585] }, properties: { intensity: 0.88 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1512, 30.2520] }, properties: { intensity: 0.72 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1382, 30.2438] }, properties: { intensity: 0.85 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1460, 30.2385] }, properties: { intensity: 0.65 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1560, 30.2395] }, properties: { intensity: 0.78 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1570, 30.2426] }, properties: { intensity: 0.70 } },
    // More scattered points
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1500, 30.2550] }, properties: { intensity: 0.55 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1420, 30.2480] }, properties: { intensity: 0.48 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1350, 30.2450] }, properties: { intensity: 0.42 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1600, 30.2400] }, properties: { intensity: 0.38 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1450, 30.2350] }, properties: { intensity: 0.35 } },
  ],
  spots: [
    {
      id: 9001,
      name: '断桥',
      lat: 30.2590,
      lng: 120.1488,
      city: '杭州',
      count: 1247,
      emotions: [
        { name: '宁静', count: 423 },
        { name: '浪漫', count: 312 },
        { name: '孤独', count: 198 },
      ],
    },
    {
      id: 9002,
      name: '雷峰塔',
      lat: 30.2438,
      lng: 120.1382,
      city: '杭州',
      count: 856,
      emotions: [
        { name: '震撼', count: 298 },
        { name: '怀旧', count: 245 },
        { name: '感慨', count: 187 },
      ],
    },
    {
      id: 9003,
      name: '河坊街',
      lat: 30.2395,
      lng: 120.1560,
      city: '杭州',
      count: 634,
      emotions: [
        { name: '热闹', count: 256 },
        { name: '新奇', count: 198 },
        { name: '怀旧', count: 112 },
      ],
    },
    {
      id: 9004,
      name: '孤山',
      lat: 30.2520,
      lng: 120.1512,
      city: '杭州',
      count: 412,
      emotions: [
        { name: '惬意', count: 178 },
        { name: '文艺', count: 145 },
        { name: '宁静', count: 89 },
      ],
    },
  ],
};

// ─── Agent Statuses ──────────────────────────────────────────────────
export const DEMO_AGENT_STATUSES: AgentStatusItem[] = [
  {
    name: 'content_gen',
    label: '旅行感知 Agent',
    description: '基于GPS轨迹和环境数据生成锚点描述',
    mode: 'real',
    status: 'ready',
    configured: true,
    missing_env: [],
    running_jobs: 0,
    success_count: 156,
    failure_count: 2,
  },
  {
    name: 'visual',
    label: '视觉处理 Agent',
    description: '照片风格化和卡通化处理',
    mode: 'real',
    status: 'ready',
    configured: true,
    missing_env: [],
    running_jobs: 0,
    success_count: 89,
    failure_count: 1,
  },
  {
    name: 'rag',
    label: 'RAG 记忆检索',
    description: '从用户历史旅行中检索相关记忆',
    mode: 'real',
    status: 'ready',
    configured: true,
    missing_env: [],
    running_jobs: 0,
    success_count: 234,
    failure_count: 0,
  },
  {
    name: 'key_verify',
    label: 'Key 语义判定',
    description: '胶囊钥匙答案的语义相似度判定',
    mode: 'real',
    status: 'ready',
    configured: true,
    missing_env: [],
    running_jobs: 0,
    success_count: 67,
    failure_count: 0,
  },
];

// ─── Notifications ───────────────────────────────────────────────────
export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 11001,
    user_id: 1,
    type: 'capsule_echo',
    content: '你在断桥留下的胶囊收到了一条新回响',
    travel_id: null,
    is_read: false,
    created_at: new Date(now.getTime() - 2 * 3600000).toISOString(),
  },
  {
    id: 11002,
    user_id: 1,
    type: 'bottle_received',
    content: '你扔出的远洋瓶已被人在深圳捡到',
    travel_id: null,
    is_read: false,
    created_at: new Date(now.getTime() - 12 * 3600000).toISOString(),
  },
  {
    id: 11003,
    user_id: 1,
    type: 'memory_replay',
    content: '一年前的今天，你在西安的城墙上骑了两个小时',
    travel_id: 998,
    is_read: false,
    created_at: new Date(now.getTime() - 24 * 3600000).toISOString(),
  },
  {
    id: 11004,
    user_id: 1,
    type: 'diary_ready',
    content: '你的杭州旅行日记已生成完毕',
    travel_id: TRAVEL_ID,
    is_read: true,
    created_at: new Date(now.getTime() - 1 * 3600000).toISOString(),
  },
];

// ─── Export Task (completed) ─────────────────────────────────────────
export const DEMO_EXPORT_TASK: ExportTask = {
  task_id: 'demo-export-001',
  travel_id: TRAVEL_ID,
  type: 'notebook',
  status: 'completed',
  result_url: null,
  created_at: now.toISOString(),
  finished_at: now.toISOString(),
};

// ─── Community Health ────────────────────────────────────────────────
export const DEMO_COMMUNITY_HEALTH = 'healthy';

// ─── Popular Tags ────────────────────────────────────────────────────
export const DEMO_POPULAR_TAGS = [
  { tag: '杭州', count: 156 },
  { tag: '西湖', count: 132 },
  { tag: '宁静', count: 98 },
  { tag: 'City Walk', count: 87 },
  { tag: '治愈', count: 76 },
  { tag: '上海', count: 72 },
  { tag: '美食', count: 68 },
  { tag: '古迹', count: 55 },
  { tag: '海边', count: 48 },
  { tag: '孤独', count: 42 },
];
