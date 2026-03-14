import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  BookOpen,
  MapPin,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useAppState } from "../../contexts/AppStateContext";

type DiaryStatus = "all" | "draft" | "completed" | "shared";

export function DiaryManagement() {
  const navigate = useNavigate();
  const { travel, travelHistory, loadTravelHistory, loadTravelById, loading } = useAppState();
  const [selectedStatus, setSelectedStatus] = useState<DiaryStatus>("all");

  useEffect(() => {
    loadTravelHistory();
  }, []);

  const diaries = travelHistory.map((item) => {
    const startDate = item.start_time ? new Date(item.start_time) : null;
    const endDate = item.end_time ? new Date(item.end_time) : null;
    const fmt = (d: Date) =>
      d
        .toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, ".");
    const dateRange =
      startDate && endDate
        ? `${fmt(startDate)} - ${fmt(endDate)}`
        : startDate
          ? fmt(startDate)
          : "";
    const status = item.diary_status === "ready" ? "completed" : "draft";
    return {
      id: item.id,
      title: item.city ? `${item.city}旅记` : `旅行 #${item.id}`,
      dateRange,
      city: item.city || "未知",
      status,
      excerpt: item.diary_excerpt || "还未整理的旅行...",
      anchorCount: item.anchor_count || 0,
      isAIGenerated: item.diary_status === "ready",
      isCurrentTravel: travel?.id === item.id,
      diaryStatus: item.diary_status,
    };
  });

  const filteredDiaries = diaries.filter((diary) => {
    if (selectedStatus === "all") return true;
    return diary.status === selectedStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-slate-100 text-slate-600",
      completed: "bg-emerald-100 text-emerald-700",
      shared: "bg-orange-100 text-orange-700",
    };
    return colors[status] || "";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "草稿",
      completed: "已完成",
      shared: "已分享",
    };
    return labels[status] || "";
  };

  const handleDiaryClick = async (diary: (typeof diaries)[number]) => {
    try {
      await loadTravelById(diary.id);
      navigate("/diary");
    } catch {
      // If loading fails, still try navigating
      navigate("/diary");
    }
  };

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e1db]">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/profile")} className="p-1">
              <ChevronLeft className="w-5 h-5 text-[#5a4a3a]" />
            </button>
            <h1 className="text-xl text-[#3a2a1a]">日记管理</h1>
          </div>
          <div className="flex items-center gap-2">
            {(["all", "draft", "completed", "shared"] as DiaryStatus[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`flex-1 px-4 py-1.5 rounded-full text-xs transition-colors ${
                    selectedStatus === s
                      ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white"
                      : "bg-white text-[#8a7a6a] border border-[#e5e1db]"
                  }`}
                >
                  {
                    {
                      all: "全部",
                      draft: "草稿",
                      completed: "已完成",
                      shared: "已分享",
                    }[s]
                  }
                </button>
              ),
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading && diaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-[#8a7a6a]">加载中...</p>
          </div>
        ) : filteredDiaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-orange-400" />
            </div>
            <p className="text-sm text-[#8a7a6a] text-center mb-6 leading-relaxed">
              你的旅行还没有被写成故事
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDiaries.map((diary) => (
              <div
                key={diary.id}
                className="w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => handleDiaryClick(diary)}
                  className="w-full text-left"
                >
                  <div className="p-4">
                    <div className="mb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base text-[#3a2a1a] mb-1">
                          {diary.title}
                        </h3>
                        {diary.isCurrentTravel ? (
                          <ExternalLink className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        ) : (
                          <ExternalLink className="w-4 h-4 text-[#8a7a6a] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#8a7a6a]">
                        {diary.dateRange}
                      </p>
                    </div>
                    <p className="text-sm text-[#8a7a6a] line-clamp-2 leading-relaxed mb-3">
                      {diary.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mb-3 text-xs text-[#8a7a6a]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{diary.anchorCount} 个锚点</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs rounded-full">
                        {diary.city}
                      </span>
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full ${getStatusColor(diary.status)}`}
                      >
                        {getStatusLabel(diary.status)}
                      </span>
                      {diary.isCurrentTravel && (
                        <span className="px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-700">
                          当前旅行
                        </span>
                      )}
                      {diary.isAIGenerated && (
                        <span className="px-2.5 py-1 text-xs rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI归纳
                        </span>
                      )}
                    </div>
                  </div>
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
