import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { PulseButton } from "../../components/PulseButton";
import { useAppState } from "../../contexts/AppStateContext";
import { requestJson } from "../../lib/api";

export function ShareToCommunity() {
  const navigate = useNavigate();
  const {
    travel,
    diary,
    travelAnchors,
    currentPosition,
    loading,
    createCommunityPost,
    apiBase,
  } = useAppState();

  const [shareType, setShareType] = useState<"full" | "single">("full");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Derive city from travel or current position
  const derivedCity =
    travel?.city || currentPosition.city || "";

  // Build content title from travel data
  const contentTitle = travel?.city
    ? `${travel.city}旅记`
    : diary?.travel_id
      ? `旅行日记`
      : "我的旅记";

  // Build content body from diary segments or anchor descriptions
  const contentBody = (() => {
    // First try diary content_json segments
    const segments = diary?.content_json?.segments;
    if (segments && segments.length > 0) {
      return segments.map((seg) => seg.text).join("\n\n");
    }

    // Fallback: build from anchor descriptions
    if (travelAnchors.length > 0) {
      const parts = travelAnchors.map((anchor) => {
        const name = anchor.poi_name || "未知地点";
        const desc =
          anchor.ai_description || anchor.user_text || "到过这里。";
        return `[${name}] ${desc}`;
      });
      return parts.join("\n\n");
    }

    return "";
  })();

  // Build a preview excerpt (truncated for display)
  const previewExcerpt = contentBody
    ? contentBody.length > 200
      ? contentBody.slice(0, 200) + "..."
      : contentBody
    : "还没有旅行内容，先去旅行吧";

  // Derive emotion from anchors' emotion_tags if available
  const derivedEmotion = (() => {
    for (const anchor of travelAnchors) {
      if (anchor.emotion_tags) {
        if (Array.isArray(anchor.emotion_tags) && anchor.emotion_tags.length > 0) {
          return String(anchor.emotion_tags[0]);
        }
      }
    }
    return "";
  })();

  // Derive scene from anchor poi_type if available
  const derivedScene = (() => {
    for (const anchor of travelAnchors) {
      if (anchor.poi_type) {
        return anchor.poi_type;
      }
    }
    return "";
  })();

  const [tags, setTags] = useState({
    city: "",
    emotion: "",
    scene: "",
  });
  const [aiTagLoading, setAiTagLoading] = useState(false);

  // AI auto-tag generation
  const generateAiTags = async () => {
    if (!contentBody || aiTagLoading) return;
    setAiTagLoading(true);
    try {
      const res = await requestJson<{ tags: string[] }>(apiBase, "/tags/auto", {
        method: "POST",
        body: {
          title: contentTitle,
          content: contentBody.slice(0, 500),
          city: tags.city || derivedCity,
        },
      });
      const aiTags = res.tags || [];
      // Map AI tags intelligently: first = emotion, second = scene (if available)
      setTags((prev) => ({
        city: prev.city || derivedCity,
        emotion: aiTags[0] || prev.emotion,
        scene: aiTags[1] || prev.scene,
      }));
    } catch {
      // AI tags failed silently, user can still manually type
    } finally {
      setAiTagLoading(false);
    }
  };

  // Initialize tags from real data once available
  useEffect(() => {
    setTags((prev) => ({
      city: prev.city || derivedCity,
      emotion: prev.emotion || derivedEmotion,
      scene: prev.scene || derivedScene,
    }));
  }, [derivedCity, derivedEmotion, derivedScene]);

  // Auto-generate AI tags when content is available
  useEffect(() => {
    if (contentBody && !tags.emotion && !tags.scene) {
      generateAiTags();
    }
  }, [contentBody]);

  const handleSubmit = async () => {
    if (!contentBody) {
      setSubmitError("没有可分享的内容，请先完成一段旅行");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createCommunityPost({
        title: contentTitle,
        content: contentBody,
        city: tags.city || undefined,
        emotion: tags.emotion || undefined,
        scene: tags.scene || undefined,
        is_anonymous: isAnonymous,
        source_travel_id: travel?.id,
      });
      navigate("/community");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "发布失败，请稍后重试";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled = submitting || loading || !contentBody;

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e1db]">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <span className="text-base text-[#3a2a1a]">分享到树洞</span>
          <div className="w-5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Share Type Selection */}
        <div className="mb-6">
          <div className="text-xs text-[#8a7a6a] mb-3">分享内容</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShareType("full")}
              className={`p-4 rounded-xl border-2 transition-all ${
                shareType === "full"
                  ? "border-orange-400 bg-orange-50"
                  : "border-[#e5e1db] bg-white"
              }`}
            >
              <div className="text-sm text-[#3a2a1a] mb-1">整篇旅记</div>
              <div className="text-xs text-[#8a7a6a]">分享完整的旅行日记</div>
            </button>
            <button
              onClick={() => setShareType("single")}
              className={`p-4 rounded-xl border-2 transition-all ${
                shareType === "single"
                  ? "border-orange-400 bg-orange-50"
                  : "border-[#e5e1db] bg-white"
              }`}
            >
              <div className="text-sm text-[#3a2a1a] mb-1">单条锚点</div>
              <div className="text-xs text-[#8a7a6a]">只分享某个地点</div>
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-6">
          <div className="text-xs text-[#8a7a6a] mb-3">内容预览</div>
          <div className="bg-white rounded-2xl p-4 border border-[#e5e1db]">
            <h3 className="text-base text-[#3a2a1a] mb-2">{contentTitle}</h3>
            {contentBody ? (
              <p className="text-sm text-[#8a7a6a] line-clamp-4 leading-relaxed whitespace-pre-wrap">
                {previewExcerpt}
              </p>
            ) : (
              <p className="text-sm text-[#b0a090] italic">
                还没有旅行内容，先去旅行吧
              </p>
            )}
            {travelAnchors.length > 0 && (
              <div className="mt-2 text-xs text-[#b0a090]">
                共 {travelAnchors.length} 个锚点
              </div>
            )}
          </div>
        </div>

        {/* Anonymous Toggle */}
        <div className="mb-6">
          <div className="text-xs text-[#8a7a6a] mb-3">隐私设置</div>
          <button
            onClick={() => setIsAnonymous(!isAnonymous)}
            className="w-full bg-white border border-[#e5e1db] rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg">
                👤
              </div>
              <div className="text-left">
                <div className="text-sm text-[#3a2a1a]">
                  {isAnonymous ? "匿名发布" : "实名发布"}
                </div>
                <div className="text-xs text-[#8a7a6a]">
                  {isAnonymous ? "不显示你的身份" : "显示你的昵称"}
                </div>
              </div>
            </div>
            <div
              className={`w-12 h-6 rounded-full transition-colors ${isAnonymous ? "bg-orange-400" : "bg-[#e5e1db]"}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${isAnonymous ? "translate-x-6" : "translate-x-0.5"}`}
              />
            </div>
          </button>
        </div>

        {/* AI Tags */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <div className="text-xs text-[#8a7a6a]">AI 自动标签</div>
            </div>
            <button
              onClick={generateAiTags}
              disabled={aiTagLoading || !contentBody}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors disabled:opacity-50"
            >
              {aiTagLoading ? (
                <><Loader2 className="w-3 h-3 animate-spin" />生成中...</>
              ) : (
                <><RefreshCw className="w-3 h-3" />AI 生成标签</>
              )}
            </button>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4">
            {/* City Tag */}
            <div className="mb-3">
              <div className="text-xs text-[#8a7a6a] mb-2">城市</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tags.city}
                  onChange={(e) => setTags({ ...tags, city: e.target.value })}
                  placeholder="自动识别城市"
                  className="flex-1 px-3 py-2 text-sm text-[#3a2a1a] bg-white border border-orange-200 rounded-lg outline-none focus:border-orange-400"
                />
              </div>
            </div>

            {/* Emotion Tag */}
            <div className="mb-3">
              <div className="text-xs text-[#8a7a6a] mb-2">情绪</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tags.emotion}
                  onChange={(e) =>
                    setTags({ ...tags, emotion: e.target.value })
                  }
                  placeholder="旅途中的情绪"
                  className="flex-1 px-3 py-2 text-sm text-[#3a2a1a] bg-white border border-orange-200 rounded-lg outline-none focus:border-orange-400"
                />
              </div>
            </div>

            {/* Scene Tag */}
            <div>
              <div className="text-xs text-[#8a7a6a] mb-2">场景</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tags.scene}
                  onChange={(e) => setTags({ ...tags, scene: e.target.value })}
                  placeholder="旅行的场景类型"
                  className="flex-1 px-3 py-2 text-sm text-[#3a2a1a] bg-white border border-orange-200 rounded-lg outline-none focus:border-orange-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tag Preview */}
        <div className="mb-4">
          <div className="text-xs text-[#8a7a6a] mb-2">标签预览</div>
          <div className="flex items-center gap-2 flex-wrap">
            {tags.city && (
              <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs rounded-full">
                {tags.city}
              </span>
            )}
            {tags.emotion && (
              <span className="px-3 py-1.5 bg-purple-50 text-purple-600 text-xs rounded-full">
                {tags.emotion}
              </span>
            )}
            {tags.scene && (
              <span className="px-3 py-1.5 bg-cyan-50 text-cyan-600 text-xs rounded-full">
                {tags.scene}
              </span>
            )}
            {isAnonymous && (
              <span className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs rounded-full">
                匿名
              </span>
            )}
            {!tags.city && !tags.emotion && !tags.scene && (
              <span className="text-xs text-[#b0a090]">
                填写标签后会显示在这里
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#e5e1db] p-5 space-y-3">
        <PulseButton
          onClick={handleSubmit}
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isSubmitDisabled}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              发布中...
            </span>
          ) : (
            "发布到树洞"
          )}
        </PulseButton>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 text-sm text-[#8a7a6a] hover:text-[#5a4a3a] transition-colors"
          disabled={submitting}
        >
          取消
        </button>
      </div>
    </div>
  );
}
