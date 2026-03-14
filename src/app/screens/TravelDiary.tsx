import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Download, MapPin } from "lucide-react";
import { BackToHomeButton } from "../components/BackToHomeButton";
import { PulseButton } from "../components/PulseButton";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAppState } from "../contexts/AppStateContext";

interface AnchorChapter {
  id: number;
  anchorName: string;
  sections: DiarySection[];
  imageUrl: string;
}

interface DiarySection {
  id: number;
  type: "ai" | "user" | "memory";
  content: string;
  editable: boolean;
}

export function TravelDiary() {
  const navigate = useNavigate();
  const { travel, travelAnchors, diary, loadDiary } = useAppState();

  useEffect(() => {
    if (travel?.id) {
      loadDiary();
    }
  }, [travel?.id]);

  // Map diary segment source to section type
  const mapSourceToType = (source?: string): "ai" | "user" | "memory" => {
    if (source === "user") return "user";
    if (source === "rag" || source === "memory") return "memory";
    return "ai";
  };

  // Build chapters from real anchor data + diary segments
  const buildChapters = (): AnchorChapter[] => {
    const diarySegments = diary?.content_json?.segments as Array<{
      source?: string;
      type?: string;
      text?: string;
      content?: string;
      anchor_index?: number;
    }> | undefined;

    // If we have anchors, build chapters per anchor
    if (travelAnchors.length > 0) {
      // Track which segments have been assigned to an anchor
      const assignedSegments = new Set<number>();

      const chapters = travelAnchors.map((anchor, idx) => {
        const sections: DiarySection[] = [];
        let sectionId = idx * 100;

        // Add anchor-level AI description
        if (anchor.ai_description) {
          sections.push({
            id: sectionId++,
            type: "ai",
            content: anchor.ai_description,
            editable: false,
          });
        }
        // Add anchor-level user text
        if (anchor.user_text) {
          sections.push({
            id: sectionId++,
            type: "user",
            content: anchor.user_text,
            editable: false,
          });
        }

        // Add diary segments that match this anchor
        if (diarySegments) {
          for (let i = 0; i < diarySegments.length; i++) {
            const seg = diarySegments[i];
            if (seg.anchor_index === idx) {
              assignedSegments.add(i);
              const text = seg.text || seg.content || "";
              if (text) {
                sections.push({
                  id: sectionId++,
                  type: mapSourceToType(seg.source || seg.type),
                  content: text,
                  editable: false,
                });
              }
            }
          }
        }

        // Fallback: if no sections, add placeholder
        if (sections.length === 0) {
          sections.push({
            id: sectionId++,
            type: "ai",
            content: `到达了${anchor.poi_name || "这个地方"}，记录下了这一刻。`,
            editable: false,
          });
        }

        return {
          id: anchor.id || idx + 1,
          anchorName: anchor.poi_name || `锚点 ${idx + 1}`,
          imageUrl: anchor.photo_url || "",
          sections,
        };
      });

      // Add unassigned diary segments as a summary chapter
      if (diarySegments) {
        const unassigned = diarySegments.filter((_, i) => !assignedSegments.has(i));
        if (unassigned.length > 0) {
          const sections: DiarySection[] = [];
          let sectionId = 9000;
          for (const seg of unassigned) {
            const text = seg.text || seg.content || "";
            if (text) {
              sections.push({
                id: sectionId++,
                type: mapSourceToType(seg.source || seg.type),
                content: text,
                editable: false,
              });
            }
          }
          if (sections.length > 0) {
            chapters.push({
              id: 9999,
              anchorName: "旅行总结",
              imageUrl: "",
              sections,
            });
          }
        }
      }

      return chapters;
    }

    // If no anchors but we have diary segments, show them directly
    if (diarySegments && diarySegments.length > 0) {
      const sections: DiarySection[] = [];
      let sectionId = 0;
      for (const seg of diarySegments) {
        const text = seg.text || seg.content || "";
        if (text) {
          sections.push({
            id: sectionId++,
            type: mapSourceToType(seg.source || seg.type),
            content: text,
            editable: false,
          });
        }
      }
      if (sections.length > 0) {
        return [{
          id: 1,
          anchorName: travel?.city ? `${travel.city}之旅` : "旅行日记",
          imageUrl: "",
          sections,
        }];
      }
    }

    return [];
  };

  const [chapters, setChapters] = useState<AnchorChapter[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (travelAnchors.length > 0) {
      setChapters(buildChapters());
    }
  }, [travelAnchors, diary]);

  const handleEdit = (section: DiarySection) => {
    setEditingId(section.id);
    setEditContent(section.content);
  };

  const handleSave = (chapterId: number, sectionId: number) => {
    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              sections: chapter.sections.map((s) =>
                s.id === sectionId ? { ...s, content: editContent } : s,
              ),
            }
          : chapter,
      ),
    );
    setEditingId(null);
  };

  const handleDelete = (chapterId: number, sectionId: number) => {
    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              sections: chapter.sections.filter((s) => s.id !== sectionId),
            }
          : chapter,
      ),
    );
  };

  // Inline text color for continuous article style
  const getTextColor = (type: string) => {
    switch (type) {
      case "ai":
        return "text-blue-700";
      case "user":
        return "text-[#3a2a1a]";
      case "memory":
        return "text-purple-600";
      default:
        return "text-[#5a4a3a]";
    }
  };

  // Section number to Chinese numeral
  const toChinese = (n: number) => {
    const nums = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五"];
    return nums[n - 1] || String(n);
  };

  const title = travel?.city ? `${travel.city}旅记` : "旅行日记";
  const subtitle = travel?.city ? `${travel.city}之旅` : "旅行记录";
  const startDate = travel?.start_time
    ? new Date(travel.start_time)
    : null;
  const endDate = travel?.end_time
    ? new Date(travel.end_time)
    : null;
  const durationHours =
    startDate && endDate
      ? Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
        )
      : null;
  const dateStr = startDate
    ? startDate.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const statsStr = [
    dateStr,
    durationHours ? `${durationHours}小时` : null,
    `${travelAnchors.length}个锚点`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e1db]">
        <div className="flex items-center justify-between px-5 py-4">
          <BackToHomeButton />
          <span className="text-base text-[#3a2a1a]">{title}</span>
          <button onClick={() => navigate("/export")}>
            <Download className="w-5 h-5 text-orange-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl text-[#3a2a1a] mb-2">{subtitle}</h1>
          <div className="text-sm text-[#8a7a6a]">{statsStr}</div>
        </div>

        {/* Legend */}
        <div className="mb-6 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-[#8a7a6a]">AI文本</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#3a2a1a] rounded-full" />
            <span className="text-[#8a7a6a]">你的文本</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-[#8a7a6a]">历史记忆</span>
          </div>
        </div>

        {chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <MapPin className="w-12 h-12 text-orange-300 mb-4" />
            <p className="text-sm text-[#8a7a6a] text-center">
              还没有锚点记录，开始一段旅行吧
            </p>
          </div>
        ) : (
          <article className="mb-6 bg-white rounded-2xl shadow-sm border border-[#e5e1db] px-5 py-6">
            {chapters.map((chapter, chapterIdx) => (
              <section key={chapter.id} className={chapterIdx > 0 ? "mt-6" : ""}>
                {/* Section heading as inline article heading */}
                <h2
                  className="text-base text-[#3a2a1a] mb-3 cursor-pointer hover:text-orange-500 transition-colors"
                  onClick={() => chapter.id !== 9999 && navigate(`/anchor/${chapter.id}`)}
                >
                  <span className="text-orange-500 mr-1">{chapter.id === 9999 ? "" : `${toChinese(chapterIdx + 1)}、`}</span>
                  {chapter.anchorName}
                </h2>

                {/* Image */}
                {chapter.imageUrl && (
                  <div className="rounded-xl overflow-hidden shadow-sm mb-3">
                    <ImageWithFallback
                      src={chapter.imageUrl}
                      alt={chapter.anchorName}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}

                {/* Continuous paragraphs with different text colors */}
                {chapter.sections.map((section) => (
                  <div key={section.id} className="group relative mb-2">
                    {editingId === section.id ? (
                      <div className="relative">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full text-sm leading-[1.9] bg-yellow-50 border border-yellow-200 rounded-lg p-2 outline-none resize-none"
                          rows={4}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleSave(chapter.id, section.id)}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded-full"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-400 text-white text-xs rounded-full"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className={`text-sm leading-[1.9] ${getTextColor(section.type)} cursor-pointer`}
                        onClick={() => handleEdit(section)}
                      >
                        {section.content}
                      </p>
                    )}
                  </div>
                ))}
              </section>
            ))}
          </article>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#e5e1db] p-5 space-y-2">
        <PulseButton
          onClick={() => navigate("/export")}
          variant="primary"
          size="lg"
          className="w-full"
        >
          导出旅迹
        </PulseButton>
        <PulseButton
          onClick={() => {
            const firstSection = chapters[0]?.sections[0];
            if (firstSection) {
              handleEdit(firstSection);
            }
          }}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          继续编辑
        </PulseButton>
      </div>
    </div>
  );
}
