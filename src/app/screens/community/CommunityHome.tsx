import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, Users, MessageCircle, User, Eye, Heart, Plus } from "lucide-react";
import { useAppState } from "../../contexts/AppStateContext";
import { requestJson } from "../../lib/api";

type FilterCategory = "all" | "city" | "emotion" | "scene";

interface TagItem {
  name: string;
  category: string;
  count?: string;
}

export function CommunityHome() {
  const navigate = useNavigate();
  const { communityPosts, loadCommunityPosts, apiBase } = useAppState();
  const [activeTab] = useState("community");
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [popularTags, setPopularTags] = useState<TagItem[]>([]);
  const [searchedTags, setSearchedTags] = useState<TagItem[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState("");

  // Ref to track the debounce timer for search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tagSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load popular tags on mount
  useEffect(() => {
    requestJson<{ tags: TagItem[] }>(apiBase, "/community/tags/popular?limit=20")
      .then((res) => setPopularTags(res.tags || []))
      .catch(() => undefined);
  }, [apiBase]);

  // Debounced tag search
  useEffect(() => {
    if (tagSearchTimerRef.current) clearTimeout(tagSearchTimerRef.current);
    if (!tagSearchTerm.trim()) {
      setSearchedTags([]);
      return;
    }
    tagSearchTimerRef.current = setTimeout(() => {
      requestJson<{ tags: TagItem[] }>(apiBase, `/community/tags/search?query=${encodeURIComponent(tagSearchTerm)}`)
        .then((res) => setSearchedTags(res.tags || []))
        .catch(() => undefined);
    }, 300);
    return () => { if (tagSearchTimerRef.current) clearTimeout(tagSearchTimerRef.current); };
  }, [tagSearchTerm, apiBase]);

  // --- Build tag chips from popular tags + post-extracted tags ---
  const tagsByCategory = useMemo(() => {
    const cities = new Set<string>();
    const emotions = new Set<string>();
    const scenes = new Set<string>();

    // Add popular tags
    for (const tag of popularTags) {
      if (tag.category === "city") cities.add(tag.name);
      else if (tag.category === "emotion") emotions.add(tag.name);
      else if (tag.category === "scene") scenes.add(tag.name);
    }

    // Add searched tags
    for (const tag of searchedTags) {
      if (tag.category === "city") cities.add(tag.name);
      else if (tag.category === "emotion") emotions.add(tag.name);
      else if (tag.category === "scene") scenes.add(tag.name);
    }

    // Also extract from loaded posts as fallback
    for (const post of communityPosts ?? []) {
      if (post.city) cities.add(post.city);
      if (post.emotion) emotions.add(post.emotion);
      if (post.scene) scenes.add(post.scene);
    }

    return {
      city: Array.from(cities),
      emotion: Array.from(emotions),
      scene: Array.from(scenes),
    };
  }, [communityPosts, popularTags, searchedTags]);

  // The tag chips to display depend on the selected category
  const visibleTags = useMemo(() => {
    if (selectedCategory === "all") {
      // Show a combined set from all three categories, prefixed for clarity
      const all: { label: string; category: FilterCategory; value: string }[] = [];
      for (const city of tagsByCategory.city) {
        all.push({ label: city, category: "city", value: city });
      }
      for (const emotion of tagsByCategory.emotion) {
        all.push({ label: emotion, category: "emotion", value: emotion });
      }
      for (const scene of tagsByCategory.scene) {
        all.push({ label: scene, category: "scene", value: scene });
      }
      return all;
    }
    return tagsByCategory[selectedCategory].map((value) => ({
      label: value,
      category: selectedCategory,
      value,
    }));
  }, [selectedCategory, tagsByCategory]);

  // --- Build the API payload from current filter state ---
  const buildPayload = useCallback(
    (overrides?: { search?: string; tagCategory?: FilterCategory; tagValue?: string | null }) => {
      const search = overrides?.search ?? searchTerm;
      const category = overrides?.tagCategory ?? selectedCategory;
      const value = overrides?.tagValue !== undefined ? overrides.tagValue : selectedTag;

      const payload: {
        city?: string;
        emotion?: string;
        scene?: string;
        search?: string;
        presence?: "city" | "emotion" | "scene";
      } = {};

      if (search.trim()) {
        payload.search = search.trim();
      }

      if (value) {
        // A specific tag value is selected -- filter by exact value
        if (category === "city") payload.city = value;
        else if (category === "emotion") payload.emotion = value;
        else if (category === "scene") payload.scene = value;
      }

      return Object.keys(payload).length > 0 ? payload : undefined;
    },
    [searchTerm, selectedCategory, selectedTag],
  );

  // --- Initial load ---
  useEffect(() => {
    loadCommunityPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Debounced search ---
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      loadCommunityPosts(buildPayload({ search: searchTerm }));
    }, 300);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
    // We intentionally depend on searchTerm and buildPayload
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // --- Handle category tab change ---
  const handleCategoryChange = (category: FilterCategory) => {
    setSelectedCategory(category);
    setSelectedTag(null); // reset tag selection when switching category
    loadCommunityPosts(buildPayload({ tagCategory: category, tagValue: null }));
  };

  // --- Handle tag chip click ---
  const handleTagClick = (tagCategory: FilterCategory, tagValue: string) => {
    if (selectedTag === tagValue && selectedCategory === tagCategory) {
      // Deselect
      setSelectedTag(null);
      loadCommunityPosts(buildPayload({ tagCategory: selectedCategory, tagValue: null }));
    } else {
      setSelectedTag(tagValue);
      if (selectedCategory === "all") {
        // When in "all" mode, adopt the tag's own category for the API call
        setSelectedCategory(tagCategory);
      }
      loadCommunityPosts(buildPayload({ tagCategory: tagCategory, tagValue: tagValue }));
    }
  };

  const posts = communityPosts ?? [];

  // --- Tag chip color helpers ---
  const tagChipColors = (category: FilterCategory, isSelected: boolean) => {
    if (isSelected) {
      return "bg-orange-400 text-white";
    }
    switch (category) {
      case "city":
        return "bg-orange-50 text-orange-600 border border-orange-200";
      case "emotion":
        return "bg-purple-50 text-purple-600 border border-purple-200";
      case "scene":
        return "bg-cyan-50 text-cyan-600 border border-cyan-200";
      default:
        return "bg-white text-[#8a7a6a] border border-[#e5e1db]";
    }
  };

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e1db]">
        <div className="px-5 pt-4 pb-3">
          <h1 className="text-lg text-[#3a2a1a] mb-3 text-center">树洞</h1>

          {/* Search Bar - searches both content and tags */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setTagSearchTerm(e.target.value);
              }}
              placeholder="搜索旅行故事或标签..."
              className="w-full pl-10 pr-4 py-2.5 text-sm text-[#3a2a1a] placeholder:text-[#b5a595] bg-[#f8f6f3] rounded-full outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7a6a]" />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(["all", "city", "emotion", "scene"] as const).map((f) => (
              <button
                key={f}
                onClick={() => handleCategoryChange(f)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs transition-colors ${
                  selectedCategory === f
                    ? "bg-orange-400 text-white"
                    : "bg-white text-[#8a7a6a] border border-[#e5e1db]"
                }`}
              >
                {{ all: "全部", city: "城市", emotion: "情绪", scene: "场景" }[f]}
              </button>
            ))}
          </div>

          {/* Real tag value chips extracted from posts */}
          {visibleTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
              {visibleTags.map((tag) => {
                const isSelected = selectedTag === tag.value && (selectedCategory === tag.category || selectedCategory === "all");
                return (
                  <button
                    key={`${tag.category}-${tag.value}`}
                    onClick={() => handleTagClick(tag.category, tag.value)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-colors ${tagChipColors(tag.category, isSelected)}`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content Feed */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => navigate(`/community/post/${post.id}`)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              {/* Post Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-base text-[#3a2a1a] mb-1">{post.title}</h3>
                  <p className="text-sm text-[#8a7a6a] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="flex-shrink-0 w-20 h-20 object-cover rounded-xl"
                  />
                )}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-3">
                {post.city && (
                  <span className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded">
                    {post.city}
                  </span>
                )}
                {post.emotion && (
                  <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded">
                    {post.emotion}
                  </span>
                )}
                {post.scene && (
                  <span className="px-2 py-1 bg-cyan-50 text-cyan-600 text-xs rounded">
                    {post.scene}
                  </span>
                )}
                {post.is_anonymous && (
                  <span className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded">
                    匿名
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-[#b5a595]">
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{post.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{post.likes}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Create Post Button */}
      <button
        onClick={() => navigate("/community/share")}
        className="absolute bottom-24 right-5 z-20 w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      {/* Bottom Tab Bar */}
      <div className="bg-white border-t border-[#e5e1db] px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors"
        >
          <MapPin className="w-5 h-5 text-[#8a7a6a]" />
          <span className="text-xs text-[#8a7a6a]">旅</span>
        </button>
        <button
          onClick={() => navigate("/yuan")}
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors"
        >
          <Users className="w-5 h-5 text-[#8a7a6a]" />
          <span className="text-xs text-[#8a7a6a]">缘</span>
        </button>
        <button
          onClick={() => navigate("/community")}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            activeTab === "community" ? "bg-orange-50" : ""
          }`}
        >
          <MessageCircle className={`w-5 h-5 ${activeTab === "community" ? "text-orange-500" : "text-[#8a7a6a]"}`} />
          <span className={`text-xs ${activeTab === "community" ? "text-orange-500" : "text-[#8a7a6a]"}`}>社区</span>
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors"
        >
          <User className="w-5 h-5 text-[#8a7a6a]" />
          <span className="text-xs text-[#8a7a6a]">我的</span>
        </button>
      </div>
    </div>
  );
}
