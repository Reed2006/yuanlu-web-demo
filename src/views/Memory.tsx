import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Image as ImageIcon,
  LogOut,
  Map,
  MessageCircleMore,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import {
  DEMO_PROFILE,
  DEMO_TIMELINE,
  DEMO_NOTIFICATIONS,
} from "../data/mockData";

export function Memory() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const joinYear = useMemo(() => {
    const raw = DEMO_PROFILE.joinDate || user?.createdAt;
    return raw ? new Date(raw).getFullYear() : new Date().getFullYear();
  }, [user?.createdAt]);

  const stats = DEMO_PROFILE.stats;
  const displayName = DEMO_PROFILE.name || user?.name || "旅人";

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setSearching(true);
    // 模拟RAG搜索
    setTimeout(() => {
      setSearchResults([
        {
          source_type: "diary",
          source_id: "1",
          travel_id: 1,
          location_name: "中山陵",
          summary: "站在392级台阶之上，俯瞰整个南京城，心中涌起一种庄严的感动。",
          score: 0.92,
          emotion_tags: ["庄严", "感动"],
        },
        {
          source_type: "anchor",
          source_id: "5",
          travel_id: 1,
          location_name: "夫子庙 · 秦淮河",
          summary: "华灯初上，秦淮河两岸的灯火倒映在水面上，恍若梦回秦淮。",
          score: 0.87,
          emotion_tags: ["梦幻", "温暖"],
        },
        {
          source_type: "diary",
          source_id: "2",
          travel_id: 2,
          location_name: "拙政园",
          summary: "拙政园的曲桥流水间，听到了属于江南的慢节奏。",
          score: 0.78,
          emotion_tags: ["宁静", "悠闲"],
        },
      ]);
      setSearching(false);
    }, 800);
  };

  return (
    <div className="min-h-full bg-[#FBF8F1] pb-32" style={{ fontFamily: "'Noto Serif SC', serif" }}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/60 via-rose-50/20 to-transparent" />

        <div className="relative px-5 pb-6 pt-12">
          <div className="mb-5 flex items-start justify-between">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="relative z-10 overflow-hidden rounded-full border-[3px] border-white/70 shadow-[0_6px_24px_rgba(180,140,100,0.15)]">
                <div className="flex h-[72px] w-[72px] items-center justify-center bg-gradient-to-br from-amber-100 to-rose-100 text-2xl font-medium text-amber-600">
                  {displayName.charAt(0)}
                </div>
              </div>
              <div className="absolute inset-0 rounded-full bg-amber-200 opacity-30 blur-2xl" />
            </motion.div>

            <div className="flex items-center gap-2">
              <button className="rounded-full border border-white/40 bg-white/50 p-2.5 text-stone-400 transition-colors hover:bg-white/70">
                <Settings size={18} className="stroke-[1.5]" />
              </button>
              <button
                onClick={() => alert("Demo模式：退出功能在正式版中可用")}
                className="rounded-full border border-white/40 bg-white/50 p-2.5 text-stone-400 transition-colors hover:bg-white/70"
                title="退出登录"
              >
                <LogOut size={18} className="stroke-[1.5]" />
              </button>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="mb-0.5 text-xl tracking-wider text-stone-800" style={{ fontWeight: 400 }}>
              {displayName}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-xs tracking-wide text-stone-400" style={{ fontWeight: 300 }}>
                漫游于 {joinYear} 至今
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-600" style={{ fontFamily: "sans-serif" }}>
                <Award size={10} />
                {DEMO_PROFILE.levelName}
              </span>
              <span className="text-[10px] text-stone-400" style={{ fontFamily: "sans-serif" }}>
                {DEMO_PROFILE.points} 分
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5 grid grid-cols-4 gap-3"
          >
            <StatBox icon={<Map size={16} />} value={String(stats.journeys)} label="旅途" />
            <StatBox icon={<Calendar size={16} />} value={String(stats.days)} label="日记" />
            <StatBox icon={<ImageIcon size={16} />} value={String(stats.memories)} label="记忆" />
            <StatBox icon={<MessageCircleMore size={16} />} value={String(DEMO_PROFILE.unreadNotifications)} label="通知" />
          </motion.div>
        </div>
      </div>

      <div className="space-y-6 px-5">
        {/* ===== 记忆检索 ===== */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg tracking-wider text-stone-800" style={{ fontWeight: 400 }}>
              记忆检索
            </h2>
            <span className="text-[10px] tracking-[0.2em] text-stone-400" style={{ fontFamily: "sans-serif" }}>RAG</span>
          </div>

          <div className="rounded-2xl border border-white/40 bg-white/60 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3">
              <Search size={14} className="text-stone-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                placeholder="搜索一句旧日心情、地点或片段"
                className="flex-1 bg-transparent text-sm text-stone-700 outline-none"
                style={{ fontFamily: "sans-serif" }}
              />
              <button
                onClick={handleSearch}
                disabled={searching || !searchInput.trim()}
                className="rounded-full bg-stone-800 px-3 py-1.5 text-[11px] text-white disabled:opacity-60"
                style={{ fontFamily: "sans-serif" }}
              >
                {searching ? "检索中…" : "搜索"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-3">
                {searchResults.map((item, index) => (
                  <motion.button
                    key={`${item.source_type}-${item.source_id}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => item.travel_id && navigate(`/travel/${item.travel_id}`)}
                    className="w-full rounded-2xl bg-stone-50/80 px-4 py-3 text-left"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm text-stone-700">{item.location_name || "旧日片段"}</span>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-600" style={{ fontFamily: "sans-serif" }}>
                        {item.source_type === "diary" ? "日记" : "锚点"}
                      </span>
                      <span className="text-[10px] text-stone-400" style={{ fontFamily: "sans-serif" }}>
                        匹配度 {(item.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-stone-600">{item.summary || "暂无摘要"}</p>
                    {item.emotion_tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.emotion_tags.map((tag: string) => (
                          <span key={`${item.source_id}-${tag}`} className="rounded-full bg-white px-2 py-1 text-[10px] text-stone-500" style={{ fontFamily: "sans-serif" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ===== 最新通知 ===== */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg tracking-wider text-stone-800" style={{ fontWeight: 400 }}>最新通知</h2>
            <span className="text-[10px] tracking-[0.2em] text-stone-400" style={{ fontFamily: "sans-serif" }}>REPLAY</span>
          </div>
          <div className="space-y-3">
            {DEMO_NOTIFICATIONS.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.04 }}
                onClick={() => item.travel_id && navigate(`/travel/${item.travel_id}`)}
                className="w-full rounded-2xl border border-white/40 bg-white/60 px-4 py-4 text-left backdrop-blur-xl"
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className={item.type === "memory_replay" ? "text-amber-500" : "text-rose-400"} />
                    <span className="text-sm text-stone-700">{item.title}</span>
                  </div>
                  {!item.is_read && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-rose-500" style={{ fontFamily: "sans-serif" }}>未读</span>
                  )}
                </div>
                <p className="text-sm leading-6 text-stone-500">{item.content}</p>
                <p className="mt-2 text-[11px] text-stone-400" style={{ fontFamily: "sans-serif" }}>
                  {new Date(item.created_at).toLocaleString("zh-CN")}
                </p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ===== 记忆轨迹 ===== */}
        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-lg tracking-wider text-stone-800" style={{ fontWeight: 400 }}>记忆轨迹</h2>
            <span className="text-[10px] tracking-[0.2em] text-stone-400" style={{ fontFamily: "sans-serif" }}>全部</span>
          </div>

          <div className="relative flex flex-col gap-4 border-l border-stone-200/50 pl-4">
            {DEMO_TIMELINE.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
              >
                <TimelineItem
                  item={item}
                  active={idx === 0}
                  onClick={() => {
                    if (item.travelId) navigate(`/travel/${item.travelId}`);
                  }}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatBox({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/40 bg-white/50 p-3.5 backdrop-blur-xl">
      <div className="mb-0.5 text-amber-600/60">{icon}</div>
      <span className="text-lg text-stone-700" style={{ fontWeight: 400 }}>{value}</span>
      <span className="text-[10px] tracking-widest text-stone-400" style={{ fontFamily: "sans-serif" }}>{label}</span>
    </div>
  );
}

function TimelineItem({ item, active, onClick }: { item: any; active?: boolean; onClick?: () => void }) {
  return (
    <div className="group relative cursor-pointer pl-5" onClick={onClick}>
      <div
        className={`absolute left-0 top-4 h-2.5 w-2.5 -translate-x-[calc(50%+0.5px)] rounded-full transition-all duration-300 ${
          active
            ? "bg-amber-400 ring-4 ring-amber-100/80"
            : "bg-stone-300 group-hover:bg-amber-300 group-hover:ring-4 group-hover:ring-amber-50"
        }`}
      />
      <div className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-[0_2px_12px_rgba(180,140,100,0.04)] transition-all duration-300 group-hover:shadow-[0_4px_20px_rgba(180,140,100,0.08)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="text-[11px] tracking-wide text-amber-600/70" style={{ fontFamily: "sans-serif" }}>{item.date}</span>
          {item.city && (
            <span className="rounded-full bg-stone-50 px-1.5 py-0.5 text-[9px] text-stone-400" style={{ fontFamily: "sans-serif" }}>{item.city}</span>
          )}
          {item.distance != null && item.distance > 0 && (
            <span className="text-[9px] text-stone-400" style={{ fontFamily: "sans-serif" }}>{item.distance.toFixed(1)}km</span>
          )}
          {item.replayAvailable && (
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] text-emerald-600" style={{ fontFamily: "sans-serif" }}>可回放</span>
          )}
        </div>
        <div className="mt-2 flex gap-3">
          <div className="flex-1">
            <h3 className="mb-1 text-base tracking-wide text-stone-700">{item.title}</h3>
            <p className="line-clamp-3 text-xs leading-relaxed text-stone-400">{item.desc}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-stone-300" style={{ fontFamily: "sans-serif" }}>
              {item.weatherSummary && <span>{item.weatherSummary}</span>}
              {item.anchorCount != null && <span>{item.anchorCount} 个锚点</span>}
              {item.locationCount != null && <span>{item.locationCount} 个轨迹点</span>}
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-stone-300 transition-colors group-hover:text-amber-500/60">
          <span className="text-[10px]" style={{ fontFamily: "sans-serif" }}>查看详情</span>
          <ChevronRight size={12} />
        </div>
      </div>
    </div>
  );
}
