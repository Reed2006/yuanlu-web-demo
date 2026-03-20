/**
 * 纯前端Demo演示用Mock数据 - 南京旅游路线
 * 路线: 中山陵 → 明孝陵 → 美龄宫 → 南京博物院 → 夫子庙 → 秦淮河
 */

import cityNightPhoto from "../assets/demo-photos/city-night.jpg";
import coastlineDuskPhoto from "../assets/demo-photos/coastline-dusk.jpg";
import fieldSunsetPhoto from "../assets/demo-photos/field-sunset.jpg";
import mountainMorningPhoto from "../assets/demo-photos/mountain-morning.jpg";

// ==================== 用户数据 ====================
export const DEMO_USER = {
  id: '1',
  name: '旅人小缘',
  email: 'demo@yuanlv.app',
  createdAt: '2025-06-15T08:00:00Z',
  onboardingCompleted: true,
};

// ==================== 天气数据 ====================
export const DEMO_WEATHER = {
  city: '南京',
  poi_name: '中山陵景区',
  weather: '晴',
  temperature: 26,
  wind: '东南风 2级',
  lat: 32.0617,
  lng: 118.8488,
  label: '中山陵景区',
  poi_type: '5A级风景区',
  full_address: '江苏省南京市玄武区石象路7号',
  is_seaside: false,
};

// ==================== 轨迹数据 - 南京旅游路线 ====================
// 中山陵 → 明孝陵 → 美龄宫 → 南京博物院 → 夫子庙 → 秦淮河
export const DEMO_TRAJECTORY = (() => {
  const baseTime = Date.now() - 3600 * 1000 * 3; // 3小时前开始
  const points = [
    // 中山陵区域（起点）
    { lat: 32.0617, lng: 118.8488 },
    { lat: 32.0615, lng: 118.8485 },
    { lat: 32.0612, lng: 118.8480 },
    { lat: 32.0608, lng: 118.8475 },
    { lat: 32.0605, lng: 118.8470 },
    { lat: 32.0600, lng: 118.8463 },
    // 前往明孝陵方向
    { lat: 32.0595, lng: 118.8455 },
    { lat: 32.0588, lng: 118.8448 },
    { lat: 32.0580, lng: 118.8440 },
    { lat: 32.0572, lng: 118.8432 },
    { lat: 32.0565, lng: 118.8425 },
    // 明孝陵区域
    { lat: 32.0558, lng: 118.8418 },
    { lat: 32.0550, lng: 118.8410 },
    { lat: 32.0545, lng: 118.8405 },
    { lat: 32.0540, lng: 118.8398 },
    { lat: 32.0535, lng: 118.8390 },
    // 前往美龄宫方向
    { lat: 32.0540, lng: 118.8380 },
    { lat: 32.0548, lng: 118.8370 },
    { lat: 32.0555, lng: 118.8360 },
    { lat: 32.0560, lng: 118.8350 },
    { lat: 32.0565, lng: 118.8340 },
    // 美龄宫附近
    { lat: 32.0570, lng: 118.8330 },
    { lat: 32.0568, lng: 118.8315 },
    { lat: 32.0565, lng: 118.8300 },
    // 前往南京博物院方向
    { lat: 32.0560, lng: 118.8280 },
    { lat: 32.0555, lng: 118.8260 },
    { lat: 32.0548, lng: 118.8240 },
    { lat: 32.0540, lng: 118.8220 },
    { lat: 32.0530, lng: 118.8200 },
    { lat: 32.0520, lng: 118.8180 },
    { lat: 32.0508, lng: 118.8160 },
    // 南京博物院附近
    { lat: 32.0497, lng: 118.8140 },
    { lat: 32.0488, lng: 118.8120 },
    { lat: 32.0480, lng: 118.8105 },
    // 前往夫子庙方向
    { lat: 32.0470, lng: 118.8088 },
    { lat: 32.0455, lng: 118.8070 },
    { lat: 32.0440, lng: 118.8050 },
    { lat: 32.0420, lng: 118.8030 },
    { lat: 32.0400, lng: 118.8010 },
    { lat: 32.0380, lng: 118.7990 },
    { lat: 32.0360, lng: 118.7970 },
    { lat: 32.0340, lng: 118.7950 },
    { lat: 32.0320, lng: 118.7930 },
    // 夫子庙 & 秦淮河区域（终点）
    { lat: 32.0195, lng: 118.7876 },
    { lat: 32.0190, lng: 118.7870 },
    { lat: 32.0185, lng: 118.7865 },
    { lat: 32.0180, lng: 118.7860 },
    { lat: 32.0176, lng: 118.7855 },
  ];

  return points.map((p, i) => ({
    lat: p.lat,
    lng: p.lng,
    speed: 1.2 + Math.random() * 0.8,
    timestamp: baseTime + i * 4500, // 约每4.5秒一个点
  }));
})();

// ==================== 锚点数据 - 南京旅游景点 ====================
export const DEMO_ANCHORS = [
  {
    id: 1,
    travel_id: 1,
    lat: 32.0617,
    lng: 118.8488,
    poi_name: '中山陵',
    user_text: '站在392级台阶之上，俯瞰整个南京城，心中涌起一种庄严的感动。孙中山先生"天下为公"四个大字在阳光下格外耀眼。',
    ai_description: '旅人在中山陵的最高处停留了约15分钟，此时天气晴朗，视野开阔。这是一次被历史与自然共同打动的停留。',
    weather: '晴',
    temperature: 26,
    poi_type: '历史文化遗址',
    status: 'confirmed',
    agent_status: 'ready',
    is_manual: false,
    emotion_tags: ['庄严', '感动', '开阔'],
    created_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
  },
  {
    id: 2,
    travel_id: 1,
    lat: 32.0540,
    lng: 118.8398,
    poi_name: '明孝陵',
    user_text: '走在神道上，两旁的石象路古朴而静谧。600年的梧桐树见证了无数旅人的来来往往。',
    ai_description: '旅人沿着石象路漫步，在石兽前驻足拍照。明孝陵的历史厚重感与秋日阳光形成了温暖的对比。',
    weather: '晴',
    temperature: 27,
    poi_type: '世界文化遗产',
    status: 'confirmed',
    agent_status: 'ready',
    is_manual: false,
    emotion_tags: ['宁静', '历史', '温暖'],
    created_at: new Date(Date.now() - 3600 * 1000 * 2.5).toISOString(),
  },
  {
    id: 3,
    travel_id: 1,
    lat: 32.0568,
    lng: 118.8315,
    poi_name: '美龄宫',
    user_text: '从高处俯瞰，美龄宫如同一颗镶嵌在翡翠项链上的蓝宝石。民国的浪漫故事仿佛穿越时空而来。',
    ai_description: '旅人被美龄宫的建筑之美所吸引，在不同角度进行了多次拍摄。目光主要停留在琉璃瓦屋顶和法国梧桐构成的项链形状上。',
    weather: '晴',
    temperature: 27,
    poi_type: '历史建筑',
    status: 'confirmed',
    agent_status: 'ready',
    is_manual: true,
    emotion_tags: ['浪漫', '优雅', '怀旧'],
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 4,
    travel_id: 1,
    lat: 32.0480,
    lng: 118.8105,
    poi_name: '南京博物院',
    user_text: '在民国馆里走了很久，仿佛回到了那个纷繁而璀璨的时代。一杯盖碗茶消了走了一上午的疲惫。',
    ai_description: '旅人在南京博物院的民国馆中度过了较长时间，对历史场景的还原表现出浓厚兴趣。随后在茶室小憩。',
    weather: '晴',
    temperature: 28,
    poi_type: '博物馆',
    status: 'confirmed',
    agent_status: 'ready',
    is_manual: true,
    emotion_tags: ['沉浸', '好奇', '放松'],
    created_at: new Date(Date.now() - 3600 * 1000 * 1.5).toISOString(),
  },
  {
    id: 5,
    travel_id: 1,
    lat: 32.0195,
    lng: 118.7876,
    poi_name: '夫子庙 · 秦淮河',
    user_text: '华灯初上，秦淮河两岸的灯火倒映在水面上，恍若梦回秦淮。一碗鸭血粉丝汤暖了整个傍晚。',
    ai_description: '旅人在傍晚时分到达夫子庙景区，沿秦淮河畔漫步。灯光渐亮，河面上画舫穿行，旅人在此品尝了南京特色小吃。',
    weather: '晴转多云',
    temperature: 24,
    poi_type: '历史文化街区',
    status: 'confirmed',
    agent_status: 'ready',
    is_manual: false,
    emotion_tags: ['梦幻', '满足', '温暖'],
    created_at: new Date(Date.now() - 3600 * 1000 * 0.5).toISOString(),
  },
];

// ==================== 胶囊数据 ====================
export const DEMO_CAPSULES = [
  {
    id: 101,
    lat: 32.0600,
    lng: 118.8463,
    city: '南京',
    key_question: '中山陵一共有多少级台阶？',
    distance_m: 120,
    status: 'active',
    is_locked: false,
    time_lock_until: null,
  },
  {
    id: 102,
    lat: 32.0550,
    lng: 118.8410,
    city: '南京',
    key_question: '明孝陵的主人是谁？',
    distance_m: 350,
    status: 'active',
    is_locked: false,
    time_lock_until: null,
  },
  {
    id: 103,
    lat: 32.0185,
    lng: 118.7865,
    city: '南京',
    key_question: '秦淮河畔最有名的诗句是哪首？',
    distance_m: 80,
    status: 'active',
    is_locked: true,
    time_lock_until: new Date(Date.now() + 86400 * 1000 * 30).toISOString(),
  },
];

// ==================== 旅记（日记）数据 ====================
export const DEMO_DIARY = {
  title: '金陵一日漫记',
  date: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`,
  image: '',
  content: [
    {
      text: '清晨的阳光洒在中山陵的台阶上，392级台阶像是一条通往天际的路。每走一步，都觉得离那个伟大的时代更近了一些。',
      source: 'ai',
    },
    {
      text: '站在392级台阶之上，俯瞰整个南京城，心中涌起一种庄严的感动。',
      source: 'user',
    },
    {
      text: '走下中山陵，沿着被梧桐树庇护的小路向明孝陵走去。石象路上，明代的石兽依然默默守望着六百年的光阴。阳光穿过树叶的缝隙，在地面上留下斑驳的影子。',
      source: 'ai',
    },
    {
      text: '走在神道上，两旁的石象路古朴而静谧。600年的梧桐树见证了无数旅人的来来往往。',
      source: 'user',
    },
    {
      text: '从钟山景区出来，转道去看传说中的「最美项链」——美龄宫。琉璃瓦在阳光下折射出宝石般的光泽，法国梧桐编织的链条在视线中延伸。民国的浪漫，在这座城市里从未走远。',
      source: 'ai',
    },
    {
      text: '在南京博物院的民国馆里，时光仿佛倒流。老式的邮局、照相馆、茶楼……每一个角落都在诉说属于那个年代的故事。一杯盖碗茶，消解了一上午的疲惫。',
      source: 'ai',
    },
    {
      text: '在民国馆里走了很久，仿佛回到了那个纷繁而璀璨的时代。',
      source: 'user',
    },
    {
      text: '傍晚时分来到夫子庙，秦淮河的华灯初上。灯火映在水面上，画舫穿行其间，恍若《桃花扇》里的旧梦重温。一碗鸭血粉丝汤，暖了整个傍晚，也暖了这一天的旅途。',
      source: 'ai',
    },
    {
      text: '「烟笼寒水月笼沙，夜泊秦淮近酒家。」一千多年前的诗句，此刻就在眼前化作了真实的画面。',
      source: 'rag',
    },
    {
      text: '这一天，走过了从历史到现代的南京，从庄严的中山陵到温柔的秦淮河。每一个停留都像是一枚锚点，把记忆牢牢固定在这座六朝古都的土壤里。',
      source: 'ai',
    },
  ],
};

// ==================== 最近旅途列表 ====================
export const DEMO_RECENT_JOURNEYS = [
  {
    id: 1,
    city: '南京',
    total_distance: 12.8,
    start_time: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    diary_title: '金陵一日漫记',
    diary_excerpt: '走过了从历史到现代的南京，从庄严的中山陵到温柔的秦淮河。',
    cover_image: cityNightPhoto,
  },
  {
    id: 2,
    city: '苏州',
    total_distance: 8.2,
    start_time: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
    diary_title: '姑苏城外寒山寺',
    diary_excerpt: '拙政园的曲桥流水间，听到了属于江南的慢节奏。',
    cover_image: fieldSunsetPhoto,
  },
  {
    id: 3,
    city: '杭州',
    total_distance: 15.3,
    start_time: new Date(Date.now() - 86400 * 1000 * 7).toISOString(),
    diary_title: '西子湖畔的半日闲',
    diary_excerpt: '断桥不断，白堤如练。在雷峰塔下看了一场日落。',
    cover_image: mountainMorningPhoto,
  },
  {
    id: 4,
    city: '青岛',
    total_distance: 9.6,
    start_time: new Date(Date.now() - 86400 * 1000 * 12).toISOString(),
    diary_title: '海风路过栈桥的时候',
    diary_excerpt: '傍晚的海平面像被晚霞轻轻抚平，步子也慢了下来。',
    cover_image: coastlineDuskPhoto,
  },
];

// ==================== 社区帖子数据 ====================
export const DEMO_COMMUNITY_POSTS = [
  {
    id: 201,
    title: '秦淮河的夜色让人忘了时间',
    content: '今晚在秦淮河畔走了很久，灯火映在水面上，画舫穿行，仿佛穿越了千年。鸭血粉丝汤果然是南京的灵魂所在。',
    excerpt: '今晚在秦淮河畔走了很久，灯火映在水面上，画舫穿行...',
    city: '南京',
    cover_image: '',
    tags: ['夜景', '秦淮河', '南京美食'],
    likes: 128,
    comment_count: 23,
    author_name: '匿名旅人',
    author_avatar_url: '',
    created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    views: 456,
    is_anonymous: true,
    image_urls: [],
    source: null,
  },
  {
    id: 202,
    title: '中山陵的392级台阶',
    content: '终于登上了中山陵的最高处，回头俯瞰整个南京城，那一刻的壮阔无法用言语形容。392级台阶的攀登，就像是对历史的一次致敬。',
    excerpt: '终于登上了中山陵的最高处，回头俯瞰整个南京城...',
    city: '南京',
    cover_image: '',
    tags: ['中山陵', '历史', '登高'],
    likes: 89,
    comment_count: 15,
    author_name: '小缘',
    author_avatar_url: '',
    created_at: new Date(Date.now() - 86400 * 1000 * 1).toISOString(),
    views: 321,
    is_anonymous: false,
    image_urls: [],
    source: null,
  },
  {
    id: 203,
    title: '在南京博物院遇到了民国的时光',
    content: '民国馆太惊艳了！走在复原的街道上，每一家店铺都在诉说那个年代的故事。在老茶馆点了一杯盖碗茶，时间好像真的慢了下来。',
    excerpt: '民国馆太惊艳了！走在复原的街道上...',
    city: '南京',
    cover_image: '',
    tags: ['博物馆', '民国', '文化'],
    likes: 156,
    comment_count: 31,
    author_name: '匿名旅人',
    author_avatar_url: '',
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    views: 567,
    is_anonymous: true,
    image_urls: [],
    source: null,
  },
  {
    id: 204,
    title: '明孝陵的石象路 · 秋天最美',
    content: '终于在秋天来到了石象路。金色的梧桐叶铺满了整条路，两旁的石兽矗立了六百年，依然不改当年风姿。这大概是南京最美的一段路。',
    excerpt: '终于在秋天来到了石象路。金色的梧桐叶铺满了整条路...',
    city: '南京',
    cover_image: '',
    tags: ['石象路', '秋景', '世界遗产'],
    likes: 203,
    comment_count: 42,
    author_name: '找路的风',
    author_avatar_url: '',
    created_at: new Date(Date.now() - 86400 * 1000 * 4).toISOString(),
    views: 890,
    is_anonymous: false,
    image_urls: [],
    source: null,
  },
];

// ==================== 社区热门标签 ====================
export const DEMO_POPULAR_TAGS = [
  { name: '秦淮河', category: '地点', count: 234 },
  { name: '中山陵', category: '地点', count: 198 },
  { name: '夜景', category: '场景', count: 156 },
  { name: '南京美食', category: '主题', count: 145 },
  { name: '历史', category: '情绪', count: 132 },
  { name: '博物馆', category: '场景', count: 98 },
  { name: '秋景', category: '场景', count: 87 },
  { name: '城市漫步', category: '方式', count: 76 },
];

// ==================== 城市热区 ====================
export const DEMO_HOTSPOTS = [
  {
    id: 'h1',
    name: '夫子庙 · 秦淮河',
    city: '南京',
    count: 1256,
    emotions: [
      { name: '浪漫', count: 342 },
      { name: '怀旧', count: 289 },
      { name: '温暖', count: 234 },
    ],
  },
  {
    id: 'h2',
    name: '钟山风景区',
    city: '南京',
    count: 987,
    emotions: [
      { name: '壮阔', count: 456 },
      { name: '庄严', count: 321 },
      { name: '宁静', count: 198 },
    ],
  },
  {
    id: 'h3',
    name: '玄武湖',
    city: '南京',
    count: 756,
    emotions: [
      { name: '惬意', count: 345 },
      { name: '悠闲', count: 267 },
      { name: '开阔', count: 189 },
    ],
  },
];

// ==================== 记忆页用户资料 ====================
export const DEMO_PROFILE = {
  name: '旅人小缘',
  avatar: '',
  joinDate: '2025-06-15',
  levelName: '漫游者',
  points: 2680,
  stats: {
    journeys: 12,
    days: 36,
    memories: 89,
  },
  unreadNotifications: 3,
};

// ==================== 记忆时间线 ====================
export const DEMO_TIMELINE = [
  {
    id: 't1',
    travelId: 1,
    date: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`,
    city: '南京',
    title: '金陵一日漫记',
    desc: '从中山陵到秦淮河，走过了南京最经典的一条旅游路线。每一个停留都像是一枚锚点，把记忆固定在六朝古都的土壤里。',
    distance: 12.8,
    image: '',
    weatherSummary: '晴 26°',
    anchorCount: 5,
    locationCount: 47,
    replayAvailable: true,
  },
  {
    id: 't2',
    travelId: 2,
    date: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate() - 3}`,
    city: '苏州',
    title: '姑苏城外寒山寺',
    desc: '拙政园的曲桥流水间，听到了属于江南的慢节奏。山塘街的灯火像是另一个版本的秦淮河。',
    distance: 8.2,
    image: '',
    weatherSummary: '多云 24°',
    anchorCount: 3,
    locationCount: 32,
    replayAvailable: true,
  },
  {
    id: 't3',
    travelId: 3,
    date: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate() - 7}`,
    city: '杭州',
    title: '西子湖畔的半日闲',
    desc: '断桥不断，白堤如练。在雷峰塔下看了一场日落，金色的光铺满了整个西湖。',
    distance: 15.3,
    image: '',
    weatherSummary: '晴 28°',
    anchorCount: 6,
    locationCount: 58,
    replayAvailable: true,
  },
];

// ==================== 通知数据 ====================
export const DEMO_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'memory_replay',
    title: '你在南京留下的记忆',
    content: '一个月前的今天，你在秦淮河畔留下了一段文字。点击这里重温那个傍晚的灯火。',
    travel_id: 1,
    is_read: false,
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'n2',
    type: 'capsule_echo',
    title: '有人在你的胶囊旁留下了回响',
    content: '一位旅人在中山陵附近发现了你埋下的时空胶囊，并写下了一段匿名回响。',
    travel_id: 1,
    is_read: false,
    created_at: new Date(Date.now() - 86400 * 1000 * 1).toISOString(),
  },
  {
    id: 'n3',
    type: 'community_like',
    title: '你的帖子收到了新的喜欢',
    content: '你发布的「中山陵的392级台阶」获得了12个新的喜欢。',
    travel_id: null,
    is_read: true,
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
];

// ==================== 社区评论数据 ====================
export const DEMO_COMMENTS: Record<number, Array<{
  id: number;
  user_name: string;
  content: string;
  created_at: string;
}>> = {
  201: [
    { id: 301, user_name: '秦淮客', content: '秦淮河的夜色真的太美了，每次去都有不一样的感受。', created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString() },
    { id: 302, user_name: '匿名旅人', content: '鸭血粉丝汤推荐去老门东那边吃，更地道！', created_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString() },
  ],
  202: [
    { id: 303, user_name: '历史爱好者', content: '每次爬完都觉得值得，那种从高处俯瞰的感觉无与伦比。', created_at: new Date(Date.now() - 86400 * 1000 * 0.5).toISOString() },
  ],
  203: [
    { id: 304, user_name: '博物馆迷', content: '民国馆是南博最惊艳的部分，每次都要在那里待很久。', created_at: new Date(Date.now() - 86400 * 1000 * 1.5).toISOString() },
    { id: 305, user_name: '匿名旅人', content: '盖碗茶太有味道了，仿佛真的回到了民国。', created_at: new Date(Date.now() - 86400 * 1000 * 1).toISOString() },
  ],
  204: [
    { id: 306, user_name: '摄影师阿明', content: '秋天的石象路是南京最值得去的地方之一，金色梧桐太美了。', created_at: new Date(Date.now() - 86400 * 1000 * 3).toISOString() },
  ],
};

// ==================== 胶囊详情 ====================
export const DEMO_CAPSULE_DETAILS: Record<number, {
  yuan_ji: string;
  is_accessible: boolean;
  key_question: string;
  city: string;
  weather_when_created: string;
  found_at: string | null;
  can_echo: boolean;
  echoes: Array<{ id: number; content: string; created_at: string }>;
}> = {
  101: {
    yuan_ji: '站在中山陵的台阶上，感觉自己走进了历史的画卷。392级台阶，每一级都承载着一段故事。留下这枚胶囊，送给下一位登上来的旅人。',
    is_accessible: true,
    key_question: '中山陵一共有多少级台阶？',
    city: '南京',
    weather_when_created: '晴 26°',
    found_at: new Date(Date.now() - 3600 * 1000).toISOString(),
    can_echo: true,
    echoes: [
      { id: 401, content: '我也刚到这里！台阶确实很壮观，谢谢你的胶囊。', created_at: new Date(Date.now() - 1800 * 1000).toISOString() },
    ],
  },
  102: {
    yuan_ji: '明孝陵的石象路，是我见过最美的秋天。六百年的时光在这里凝固，化作了金色的梧桐叶和沉默的石兽。',
    is_accessible: false,
    key_question: '明孝陵的主人是谁？',
    city: '南京',
    weather_when_created: '晴 27°',
    found_at: null,
    can_echo: false,
    echoes: [],
  },
  103: {
    yuan_ji: '在秦淮河畔写下这段文字的时候，华灯初上，画舫穿行。希望打开这枚胶囊的你，也能感受到此刻的温柔。',
    is_accessible: false,
    key_question: '秦淮河畔最有名的诗句是哪首？',
    city: '南京',
    weather_when_created: '晴转多云 24°',
    found_at: null,
    can_echo: false,
    echoes: [],
  },
};

// ==================== 轨迹动画参数 ====================
export const DEMO_ANIMATION_CONFIG = {
  // 动画总时长（毫秒): 8秒
  durationMs: 8000,
  // 每帧步进的轨迹点数
  pointsPerFrame: 1,
  // 总距离（km）
  totalDistance: 12.8,
  // 总时长（模拟秒数）
  totalDuration: 10800, // 3小时
};
