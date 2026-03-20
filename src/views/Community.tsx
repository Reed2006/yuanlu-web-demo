import { useMemo, useState, type ReactNode } from "react";
import {
  ChevronLeft,
  Clock,
  Compass,
  Feather,
  Flame,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Share2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import {
  DEMO_COMMUNITY_POSTS,
  DEMO_POPULAR_TAGS,
  DEMO_HOTSPOTS,
  DEMO_COMMENTS,
} from "../data/mockData";

interface TagOption {
  label: string;
  icon?: ReactNode;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.max(1, Math.floor(diff / 60000));
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  return `${Math.floor(days / 30)} 个月前`;
}

export function Community() {
  const { user } = useAuth();

  const [activeTag, setActiveTag] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<Record<number, Array<{ id: number; user_name: string; content: string; created_at: string }>>>({ ...DEMO_COMMENTS });

  const tagOptions: TagOption[] = [
    { label: "热门", icon: <Flame size={13} className="text-rose-400" /> },
    ...DEMO_POPULAR_TAGS.slice(0, 8).map((tag) => ({ label: tag.name })),
  ];

  const filteredPosts = useMemo(() => {
    let posts = [...DEMO_COMMUNITY_POSTS];
    const activeLabel = tagOptions[activeTag]?.label || "热门";
    if (activeLabel !== "热门") {
      posts = posts.filter(p => p.tags.some(t => t.includes(activeLabel)) || p.city?.includes(activeLabel));
    }
    if (searchKeyword) {
      posts = posts.filter(p =>
        p.title.includes(searchKeyword) ||
        p.content.includes(searchKeyword) ||
        p.city?.includes(searchKeyword) ||
        p.tags.some(t => t.includes(searchKeyword))
      );
    }
    return posts;
  }, [activeTag, searchKeyword]);

  const selectedPost = useMemo(
    () => DEMO_COMMUNITY_POSTS.find(p => p.id === selectedPostId) || null,
    [selectedPostId]
  );

  const toggleLike = (id: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmitComment = () => {
    if (!selectedPostId || !commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      user_name: user?.name || "旅人小缘",
      content: commentText.trim(),
      created_at: new Date().toISOString(),
    };
    setLocalComments(prev => ({
      ...prev,
      [selectedPostId]: [...(prev[selectedPostId] || []), newComment],
    }));
    setCommentText("");
  };

  return (
    <div className="min-h-full bg-[#FBF8F1] pb-32" style={{ fontFamily: "'Noto Serif SC', serif" }}>
      <div className="px-5 pb-2 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-1 flex items-end justify-between"
        >
          <div>
            <p className="mb-1 text-[10px] tracking-[0.3em] text-stone-400" style={{ fontFamily: "sans-serif" }}>DISCOVER</p>
            <h1 className="text-2xl tracking-wider text-stone-800" style={{ fontWeight: 400 }}>社区</h1>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/60 text-stone-400 backdrop-blur-xl"
            title="发布社区内容"
            onClick={() => alert("Demo模式：发帖功能在正式版中可用")}
          >
            <Feather size={16} />
          </button>
        </motion.div>
        <p className="text-xs tracking-wide text-stone-400" style={{ fontWeight: 300 }}>
          来自远方旅人的温柔碎片
        </p>
      </div>

      <div className="px-5">
        <div className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-[0_4px_20px_rgba(180,140,100,0.05)] backdrop-blur-xl">
          <Search size={14} className="text-stone-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setSearchKeyword(searchInput.trim()); }}
            placeholder="搜索地点、情绪、故事片段"
            className="flex-1 bg-transparent text-sm text-stone-700 outline-none"
            style={{ fontFamily: "sans-serif" }}
          />
          <button
            onClick={() => setSearchKeyword(searchInput.trim())}
            className="rounded-full bg-stone-800 px-3 py-1.5 text-[11px] text-white"
            style={{ fontFamily: "sans-serif" }}
          >
            搜索
          </button>
        </div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-4">
        {tagOptions.map((tag, index) => (
          <button
            key={tag.label}
            onClick={() => setActiveTag(index)}
            className={`flex whitespace-nowrap rounded-full px-4 py-2 text-xs transition-all duration-300 ${
              activeTag === index
                ? "bg-stone-800 text-white shadow-md shadow-stone-800/15"
                : "border border-white/30 bg-white/60 text-stone-500 backdrop-blur-md hover:bg-white/80"
            }`}
            style={{ fontFamily: "sans-serif" }}
          >
            <span className="mr-1.5">{tag.icon}</span>
            {tag.label}
          </button>
        ))}
      </div>

      {DEMO_POPULAR_TAGS.length > 0 && (
        <div className="px-5 pb-2">
          <div className="rounded-2xl border border-white/40 bg-white/60 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              <h3 className="text-sm text-stone-700">热门标签</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {DEMO_POPULAR_TAGS.slice(0, 10).map((tag) => (
                <button
                  key={`${tag.category}-${tag.name}`}
                  onClick={() => { setSearchInput(tag.name); setSearchKeyword(tag.name); }}
                  className="rounded-full bg-amber-50 px-3 py-1 text-[11px] text-amber-600"
                  style={{ fontFamily: "sans-serif" }}
                >
                  #{tag.name} · {tag.count}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {DEMO_HOTSPOTS.length > 0 && (
        <div className="px-5 pb-3">
          <div className="mb-3 flex items-center gap-2">
            <Compass size={14} className="text-stone-400" />
            <h3 className="text-sm text-stone-700">城市热区</h3>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {DEMO_HOTSPOTS.map((spot) => (
              <button
                key={spot.id}
                onClick={() => { setSearchInput(spot.city); setSearchKeyword(spot.city); }}
                className="min-w-[180px] rounded-2xl border border-white/40 bg-white/70 p-4 text-left backdrop-blur-xl"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-stone-700">{spot.name}</span>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-rose-500" style={{ fontFamily: "sans-serif" }}>
                    热度 {spot.count}
                  </span>
                </div>
                <p className="text-xs text-stone-400">{spot.city}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {spot.emotions.slice(0, 3).map((emotion) => (
                    <span key={emotion.name} className="rounded-full bg-stone-100 px-2 py-1 text-[10px] text-stone-500" style={{ fontFamily: "sans-serif" }}>
                      {emotion.name} · {emotion.count}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-1 grid grid-cols-2 gap-2.5 px-5">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => setSelectedPostId(post.id)}
            className="cursor-pointer overflow-hidden rounded-xl border border-white/40 bg-white/70 shadow-[0_2px_12px_rgba(180,140,100,0.05)] transition-shadow hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-rose-50">
                <MapPin size={20} className="text-amber-300" />
              </div>
              <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={`${post.id}-${tag}`} className="rounded-full bg-black/50 px-1.5 py-0.5 text-[8px] text-white backdrop-blur-sm" style={{ fontFamily: "sans-serif" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-2">
              <div className="mb-1 flex items-center gap-1">
                <MapPin size={8} className="text-amber-500/70" />
                <span className="truncate text-[9px] text-stone-500" style={{ fontFamily: "sans-serif" }}>{post.city || "未知地点"}</span>
              </div>
              <p className="mb-1 text-[11px] text-stone-700">{post.title}</p>
              <p className="mb-1.5 line-clamp-2 text-[10px] leading-snug text-stone-500">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Heart size={10} className={`stroke-[1.5] ${likedPosts.has(post.id) ? "fill-rose-400 text-rose-400" : "text-stone-400"}`} />
                  <span className="text-[8px] text-stone-400" style={{ fontFamily: "sans-serif" }}>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={10} className="stroke-[1.5] text-stone-400" />
                  <span className="text-[8px] text-stone-400" style={{ fontFamily: "sans-serif" }}>{post.comment_count}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
          <Compass size={28} className="mb-3 text-stone-300" />
          <p className="text-sm text-stone-500">没有找到匹配的内容</p>
          <p className="mt-1 text-xs text-stone-400">试试其他关键词吧。</p>
        </div>
      )}

      {/* ===== 帖子详情弹窗 ===== */}
      <AnimatePresence>
        {selectedPostId != null && selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedPostId(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="mx-4 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl">
                <div className="h-full w-full bg-gradient-to-br from-amber-50 to-rose-50" />
                <button
                  onClick={() => setSelectedPostId(null)}
                  className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xl"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
              <div className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-amber-100 to-rose-100 text-sm font-medium text-amber-600 shadow-md">
                    {selectedPost.author_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-medium text-stone-800">{selectedPost.author_name}</h4>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <Clock size={10} />
                      <span>{timeAgo(selectedPost.created_at)}</span>
                      <span>· {selectedPost.views} 阅读</span>
                    </div>
                  </div>
                  {selectedPost.city && (
                    <div className="flex items-center gap-1 rounded-full bg-stone-50 px-3 py-1.5">
                      <MapPin size={11} className="text-amber-500/70" />
                      <span className="text-xs text-stone-600" style={{ fontFamily: "sans-serif" }}>{selectedPost.city}</span>
                    </div>
                  )}
                </div>

                <h3 className="mb-3 text-xl text-stone-800">{selectedPost.title}</h3>

                {selectedPost.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag) => (
                      <span key={`${selectedPost.id}-${tag}`} className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-600" style={{ fontFamily: "sans-serif" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mb-5 text-sm leading-relaxed text-stone-600">{selectedPost.content}</p>

                <div className="mb-5 flex items-center gap-3 border-t border-stone-100 pt-4">
                  <button
                    onClick={() => toggleLike(selectedPost.id)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                      likedPosts.has(selectedPost.id) ? "bg-rose-50 text-rose-500" : "bg-stone-50 text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    <Heart size={16} className={`stroke-[1.5] ${likedPosts.has(selectedPost.id) ? "fill-rose-400" : ""}`} />
                    <span className="text-xs" style={{ fontFamily: "sans-serif" }}>{selectedPost.likes + (likedPosts.has(selectedPost.id) ? 1 : 0)}</span>
                  </button>
                  <div className="flex items-center gap-2 rounded-full bg-stone-50 px-4 py-2 text-stone-500">
                    <MessageCircle size={16} className="stroke-[1.5]" />
                    <span className="text-xs" style={{ fontFamily: "sans-serif" }}>{(localComments[selectedPost.id] || []).length} 评论</span>
                  </div>
                  <button className="ml-auto flex items-center gap-2 rounded-full bg-stone-50 px-4 py-2 text-stone-500 hover:bg-stone-100">
                    <Share2 size={16} className="stroke-[1.5]" />
                    <span className="text-xs" style={{ fontFamily: "sans-serif" }}>分享</span>
                  </button>
                </div>

                <div className="mb-4">
                  <p className="mb-3 text-xs tracking-[0.18em] text-stone-400" style={{ fontFamily: "sans-serif" }}>评论</p>
                  <div className="space-y-3">
                    {(localComments[selectedPost.id] || []).map((comment) => (
                      <div key={comment.id} className="rounded-2xl bg-stone-50/80 px-4 py-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-medium text-stone-700">{comment.user_name}</span>
                          <span className="text-[10px] text-stone-400" style={{ fontFamily: "sans-serif" }}>{timeAgo(comment.created_at)}</span>
                        </div>
                        <p className="text-sm leading-6 text-stone-600">{comment.content}</p>
                      </div>
                    ))}
                    {(localComments[selectedPost.id] || []).length === 0 && (
                      <p className="text-xs text-stone-400">还没有评论，写下第一条吧。</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSubmitComment(); }}
                    placeholder="写下你的感受…"
                    className="flex-1 rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-700 outline-none"
                    style={{ fontFamily: "sans-serif" }}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-white disabled:opacity-60"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
