import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import Map, { Marker } from "react-map-gl/mapbox";
import { MapPin, Image as ImageIcon, Sparkles, Wand2, Calendar, ChevronRight, Loader2, X } from "lucide-react";
import { BackToHomeButton } from "../components/BackToHomeButton";
import { useAppState } from "../contexts/AppStateContext";
import { getMapStyle, getMapToken } from "../lib/map";
import "mapbox-gl/dist/mapbox-gl.css";

export function ManualCreation() {
  const navigate = useNavigate();
  const {
    mapClientConfig,
    currentPosition,
    travel,
    createManualAnchor,
    uploadFile,
    cartoonify,
  } = useAppState();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [shareToPublic, setShareToPublic] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [cartoonifying, setCartoonifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lng = currentPosition.lng ?? 121.4737;
  const lat = currentPosition.lat ?? 31.2304;
  const locationLabel = currentPosition.poi_name || currentPosition.label || currentPosition.city || "当前位置";

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPhotos((prev) => [...prev, dataUrl]);
      // Upload
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const url = await uploadFile(blob, "anchor_photo", `anchor_${Date.now()}.jpg`);
        setPhotoUrl(url);
      } catch { /* ignore */ }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleGenerateTags = async () => {
    if (!content.trim() && !title.trim()) return;
    setAiLoading(true);
    try {
      // Use content for AI insight; in real implementation this would call the tag agent
      setAiInsight(`在${locationLabel}附近，${content.slice(0, 20) || title}……这一刻值得被记住。`);
      if (!tags.trim()) {
        setTags(`#${locationLabel} #旅行记忆`);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!travel?.id) {
      // If no active travel, just navigate home
      navigate("/");
      return;
    }
    setSaving(true);
    try {
      const anchor = await createManualAnchor({
        lat,
        lng,
        user_text: `${title ? title + "\n" : ""}${content}`,
        photo_url: photoUrl || undefined,
      });
      navigate(`/anchor/${anchor.id}`);
    } catch {
      navigate("/");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto relative overflow-hidden">
      {/* Background Map (blurred) */}
      <div className="absolute inset-0">
        <Map
          longitude={lng}
          latitude={lat}
          zoom={12}
          mapStyle={getMapStyle(mapClientConfig)}
          mapboxAccessToken={getMapToken(mapClientConfig)}
          style={{ width: "100%", height: "100%", filter: "blur(8px)" }}
          interactive={false}
        >
          <Marker longitude={lng} latitude={lat}>
            <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
          </Marker>
        </Map>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Float Panel */}
      <div className="absolute inset-x-4 top-16 bottom-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e1db]">
          <BackToHomeButton />
          <span className="text-sm text-[#3a2a1a]">创建记忆</span>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-xs text-[#8a7a6a] mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>{locationLabel}</span>
          </div>

          {/* Title Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="为这一段记忆命名"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base text-[#3a2a1a] placeholder:text-[#b5a595] bg-transparent border-none outline-none"
            />
          </div>

          {/* Content Input */}
          <div className="mb-4">
            <textarea
              placeholder="写下此刻的感受..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 text-sm text-[#5a4a3a] placeholder:text-[#b5a595] bg-transparent border border-[#e5e1db] rounded-xl p-3 outline-none resize-none"
            />
          </div>

          {/* Image Upload Area */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            {photos.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {photos.map((p, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-[#e5e1db] rounded-xl flex items-center justify-center"
                >
                  <ImageIcon className="w-6 h-6 text-[#b5a595]" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#e5e1db] rounded-xl p-6 flex flex-col items-center gap-2"
              >
                <ImageIcon className="w-8 h-8 text-[#b5a595]" />
                <span className="text-xs text-[#8a7a6a]">点击添加照片</span>
              </button>
            )}
            {/* AI Comic Button */}
            {photos.length > 0 && photoUrl && (
              <button
                onClick={async () => {
                  if (cartoonifying) return;
                  setCartoonifying(true);
                  try {
                    const urls = await cartoonify(photoUrl);
                    if (urls && urls.length > 0) {
                      setPhotos((prev) => [...prev, ...urls]);
                    }
                  } catch { /* ignore */ }
                  finally { setCartoonifying(false); }
                }}
                disabled={cartoonifying}
                className="w-full mt-2 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 rounded-xl flex items-center justify-center gap-2 text-xs disabled:opacity-50"
              >
                {cartoonifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI转漫画中，请稍候…</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>一键AI转漫画</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* AI Insight Card */}
          <div className="mb-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <button
                  onClick={handleGenerateTags}
                  className="text-xs text-blue-700 mb-1 flex items-center gap-1"
                  disabled={aiLoading}
                >
                  AI 灵感感知
                  {aiLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                </button>
                <div className="text-xs text-[#5a4a3a] leading-relaxed">
                  {aiInsight || "输入文字后点击此处，AI 将根据内容自动生成标签和描述"}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-xs text-[#8a7a6a] mb-2">标签</label>
            <input
              type="text"
              placeholder="# 添加标签"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full text-sm text-[#5a4a3a] placeholder:text-[#b5a595] bg-[#f8f6f3] border border-[#e5e1db] rounded-xl px-3 py-2 outline-none"
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <button className="flex items-center gap-2 text-sm text-[#5a4a3a]">
              <Calendar className="w-4 h-4 text-[#8a7a6a]" />
              <span>{new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span>
              <ChevronRight className="w-4 h-4 text-[#b5a595]" />
            </button>
          </div>

          {/* Share Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between py-3 px-4 bg-[#f8f6f3] rounded-xl">
              <span className="text-sm text-[#5a4a3a]">同步公开到社区（树洞）</span>
              <input
                type="checkbox"
                checked={shareToPublic}
                onChange={(e) => setShareToPublic(e.target.checked)}
                className="w-10 h-6 rounded-full appearance-none bg-gray-300 checked:bg-orange-500 relative cursor-pointer transition-colors
                  before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                  checked:before:translate-x-4"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-5 py-4 border-t border-[#e5e1db] space-y-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full shadow-lg disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存锚点"}
          </button>
        </div>
      </div>
    </div>
  );
}