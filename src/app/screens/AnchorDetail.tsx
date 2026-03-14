import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, MapPin, Clock, Cloud, Volume2, Edit3, Wand2, Loader2 } from "lucide-react";
import { BackToHomeButton } from "../components/BackToHomeButton";
import { useAppState } from "../contexts/AppStateContext";
import { requestJson } from "../lib/api";
import type { TravelAnchor } from "../lib/types";

export function AnchorDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { apiBase, travelAnchors, cartoonify } = useAppState();
  const [anchor, setAnchor] = useState<TravelAnchor | null>(null);
  const [userText, setUserText] = useState("");
  const [cartoonifyState, setCartoonifyState] = useState<"idle" | "processing" | "done">("idle");
  const [cartoonifiedUrl, setCartoonifiedUrl] = useState<string | null>(null);

  const handleCartoonify = async () => {
    if (cartoonifyState !== "idle" || !anchor?.photo_url) return;
    setCartoonifyState("processing");
    try {
      const urls = await cartoonify(anchor.photo_url);
      if (urls.length > 0) {
        setCartoonifiedUrl(urls[0]);
      }
      setCartoonifyState("done");
    } catch {
      setCartoonifyState("idle");
    }
  };

  const fetchAnchor = useCallback(async () => {
    if (!id) {
      return;
    }
    const data = await requestJson<TravelAnchor>(apiBase, `/travel/anchor/${id}`);
    setAnchor(data);
    setUserText((prev) => (prev ? prev : data.user_text || ""));
  }, [apiBase, id]);

  useEffect(() => {
    if (!id) {
      return;
    }
    const existing = travelAnchors.find((item) => String(item.id) === id);
    if (existing) {
      setAnchor(existing);
      setUserText(existing.user_text || "");
      return;
    }
    fetchAnchor().catch(() => undefined);
  }, [fetchAnchor, id, travelAnchors]);

  useEffect(() => {
    if (!anchor?.id || anchor.agent_status !== "processing") {
      return;
    }
    const timer = window.setInterval(() => {
      fetchAnchor().catch(() => undefined);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [anchor?.agent_status, anchor?.id, fetchAnchor]);

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden relative">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f8f6f3]" />

      {/* Back to Home Button */}
      <div className="absolute top-6 left-5 z-20">
        <BackToHomeButton />
      </div>

      {/* Float Card */}
      <div className="absolute inset-x-4 top-20 bottom-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e1db]">
          <button onClick={() => navigate(-1)} className="p-1">
            <X className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <span className="text-sm text-[#3a2a1a]">锚点详情</span>
          <button className="p-1">
            <Edit3 className="w-4 h-4 text-orange-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Location & Time */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-[#8a7a6a] mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{anchor?.poi_name || "未知地点"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8a7a6a]">
              <Clock className="w-3.5 h-3.5" />
              <span>{anchor?.created_at ? new Date(anchor.created_at).toLocaleString("zh-CN") : "未知时间"}</span>
            </div>
          </div>

          {/* AI Perception */}
          <div className="mb-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
            <div className="flex items-start gap-2 mb-2">
              <div className="text-xs text-blue-600 font-medium">AI 感知描述</div>
              <button className="ml-auto text-xs text-blue-500" onClick={() => fetchAnchor().catch(() => undefined)}>
                刷新
              </button>
            </div>
            <p className="text-sm text-blue-700 leading-relaxed">
              {anchor?.ai_description || "AI 正在感知这个地方，请稍候..."}
            </p>
          </div>

          {/* User Text Input */}
          <div className="mb-4">
            <div className="text-xs text-[#8a7a6a] mb-2">你的补写</div>
            <textarea
              placeholder="记录此刻的想法..."
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              className="w-full h-28 text-sm text-[#3a2a1a] placeholder:text-[#b5a595] bg-[#f8f6f3] border border-[#e5e1db] rounded-xl p-3 outline-none resize-none"
            />
          </div>

          {/* Photos */}
          <div className="mb-4">
            <div className="text-xs text-[#8a7a6a] mb-2">照片</div>
            {anchor?.photo_url ? (
              <div className="relative">
                <img src={cartoonifiedUrl || anchor.photo_url} alt={anchor.poi_name || "锚点照片"} className="w-full rounded-2xl aspect-video object-cover" />
                {/* Cartoonify button - always visible on mobile */}
                <div className="absolute bottom-3 right-3 flex gap-2">
                  {cartoonifyState === "done" && cartoonifiedUrl && (
                    <button
                      onClick={() => { setCartoonifiedUrl(null); setCartoonifyState("idle"); }}
                      className="px-3 py-2 rounded-full text-xs font-medium bg-white/90 text-[#3a2a1a] shadow-lg backdrop-blur-sm"
                    >
                      查看原图
                    </button>
                  )}
                  <button
                    onClick={handleCartoonify}
                    disabled={cartoonifyState === "processing"}
                    className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm ${
                      cartoonifyState === "done"
                        ? "bg-green-500 text-white"
                        : cartoonifyState === "processing"
                          ? "bg-white/90 text-[#3a2a1a]"
                          : "bg-white/90 text-[#3a2a1a]"
                    }`}
                  >
                    {cartoonifyState === "processing" ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" />漫画化中...</>
                    ) : cartoonifyState === "done" ? (
                      <>✓ 已漫画化</>
                    ) : (
                      <><Wand2 className="w-3.5 h-3.5" />漫画化</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-video border-2 border-dashed border-[#e5e1db] rounded-xl flex items-center justify-center text-sm text-[#b5a595]">
                暂无照片，后续上传后这里会实时显示
              </div>
            )}
          </div>

          {/* Audio Recording */}
          <div className="mb-4">
            <div className="text-xs text-[#8a7a6a] mb-2">声音录制 (45秒)</div>
            {anchor?.audio_url ? (
              <div className="bg-[#f8f6f3] rounded-xl p-4">
                <audio controls className="w-full">
                  <source src={anchor.audio_url} />
                </audio>
              </div>
            ) : (
              <div className="bg-[#f8f6f3] rounded-xl p-4 text-sm text-[#8a7a6a]">
                暂无音频，上传后会在这里展示并参与后续日记生成。
              </div>
            )}
          </div>

          {/* Whisper Transcription */}
          <div className="mb-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-3.5 h-3.5 text-purple-500" />
              <div className="text-xs text-purple-600 font-medium">Whisper 转写</div>
            </div>
            <p className="text-sm text-purple-700 leading-relaxed">
              {anchor?.audio_transcript || "暂无语音转写内容"}
            </p>
          </div>

          {/* Environment Data */}
          <div className="mb-4">
            <div className="text-xs text-[#8a7a6a] mb-2">环境数据</div>
            <div className="flex items-center gap-4 text-xs text-[#8a7a6a]">
              <div className="flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5" />
                <span>{anchor?.weather || "未知"} · {anchor?.temperature ?? "--"}°C</span>
              </div>
              <div>
                <span>POI: {anchor?.poi_name || "未知"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="px-5 py-4 border-t border-[#e5e1db]">
          <button
            onClick={async () => {
              if (anchor?.id) {
                await requestJson(apiBase, `/travel/anchor/${anchor.id}`, {
                  method: "PATCH",
                  body: {
                    user_text: userText,
                  },
                }).catch(() => undefined);
              }
              navigate(-1);
            }}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full shadow-lg"
          >
            保存并返回
          </button>
        </div>
      </div>
    </div>
  );
}
