import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Anchor as AnchorIcon,
  ArrowLeft,
  BookOpen,
  Clock,
  Download,
  Lock,
  MapPin,
  Navigation,
  Play,
  Plus,
  Sparkles,
  StopCircle,
  Wind,
} from "lucide-react";
import type { AnchorData, CapsuleData } from "../api/types";
import { HeroPhotoCarousel, type HeroPhotoCarouselItem } from "../components/HeroPhotoCarousel";
import { MapboxRomanceMap } from "../components/MapboxRomanceMap";
import { useAuth } from "../context/AuthContext";
import { useTravelContext } from "../context/TravelContext";
import { haversineDistance } from "../utils/trajectory";
import {
  DEMO_WEATHER,
  DEMO_DIARY,
  DEMO_RECENT_JOURNEYS,
  DEMO_CAPSULE_DETAILS,
} from "../data/mockData";

type JourneyState = "idle" | "traveling" | "generating" | "summary";

const LOADING_PHRASES = [
  "正在汇总本次旅途的数据…",
  "让记忆里的风、天气与停留编织在一起…",
  "AI 旅记正在生成中…",
];

export function Journey() {
  const travel = useTravelContext();
  const { user } = useAuth();

  const [journeyState, setJourneyState] = useState<JourneyState>("idle");
  const [pageError, setPageError] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [summaryData, setSummaryData] = useState<typeof DEMO_DIARY | null>(null);

  const [anchorModalOpen, setAnchorModalOpen] = useState(false);
  const [anchorText, setAnchorText] = useState("");
  const [anchorSubmitting, setAnchorSubmitting] = useState(false);

  const [selectedAnchor, setSelectedAnchor] = useState<AnchorData | null>(null);
  const [selectedAnchorText, setSelectedAnchorText] = useState("");
  const [selectedAnchorSaving, setSelectedAnchorSaving] = useState(false);
  const [activeCapsule, setActiveCapsule] = useState<CapsuleData | null>(null);
  const [activeCapsuleDetail, setActiveCapsuleDetail] = useState<any>(null);
  const [capsuleAnswer, setCapsuleAnswer] = useState("");
  const [capsuleMessage, setCapsuleMessage] = useState("");
  const [capsuleEcho, setCapsuleEcho] = useState("");

  const [capsuleModalOpen, setCapsuleModalOpen] = useState(false);
  const [capsuleYuanji, setCapsuleYuanji] = useState("");
  const [capsuleKeyQuestion, setCapsuleKeyQuestion] = useState("");
  const [capsuleKeyAnswer, setCapsuleKeyAnswer] = useState("");
  const [capsuleSubmitting, setCapsuleSubmitting] = useState(false);

  useEffect(() => {
    if (travel.isActive) {
      setJourneyState((current) => (current === "summary" ? current : "traveling"));
      return;
    }
    setActiveCapsule(null);
    setSelectedAnchor(null);
    setJourneyState((current) => (current === "generating" || current === "summary" ? current : "idle"));
  }, [travel.isActive]);

  useEffect(() => {
    if (journeyState !== "generating") return;
    const timer = window.setInterval(() => {
      setPhraseIndex((current) => (current + 1) % LOADING_PHRASES.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [journeyState]);

  const trajectoryPath = useMemo(
    () => travel.positions.map((point) => ({ lat: point.lat, lng: point.lng })),
    [travel.positions]
  );

  const displayAnchors = useMemo(() => {
    return travel.anchors.filter(anchor =>
      anchor.status === 'confirmed' || anchor.is_manual
    );
  }, [travel.anchors]);

  const visibleCapsules = useMemo(
    () => travel.capsules,
    [travel.capsules]
  );

  const mapCenter = useMemo(() => {
    if (travel.currentLat != null && travel.currentLng != null) {
      return { lat: travel.currentLat, lng: travel.currentLng };
    }
    return { lat: DEMO_WEATHER.lat, lng: DEMO_WEATHER.lng };
  }, [travel.currentLat, travel.currentLng]);

  useEffect(() => {
    setSelectedAnchorText(selectedAnchor?.user_text || "");
  }, [selectedAnchor]);

  useEffect(() => {
    if (!activeCapsule) {
      setActiveCapsuleDetail(null);
      setCapsuleAnswer("");
      setCapsuleMessage("");
      setCapsuleEcho("");
      return;
    }
    // 从Mock数据获取胶囊详情
    const detail = DEMO_CAPSULE_DETAILS[activeCapsule.id as number];
    if (detail) {
      setActiveCapsuleDetail(detail);
    } else {
      setActiveCapsuleDetail(null);
      setCapsuleMessage("这枚胶囊的详情暂未加载。");
    }
  }, [activeCapsule]);

  const heroItems = useMemo<HeroPhotoCarouselItem[]>(
    () =>
      DEMO_RECENT_JOURNEYS.map((item) => ({
        id: String(item.id),
        title: item.diary_title || item.city || "旅途回忆",
        subtitle: item.diary_excerpt || "这段旅途的细节已完整保存。",
        location: item.city || "未知城市",
        meta: `${new Date(item.start_time).getFullYear()}/${new Date(item.start_time).getMonth() + 1}/${new Date(item.start_time).getDate()} · ${item.total_distance.toFixed(1)} km`,
        imageSrc: item.cover_image || undefined,
      })),
    []
  );

  const handleStartJourney = async () => {
    setPageError("");
    try {
      await travel.startTravel("南京");
      setJourneyState("traveling");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "开启旅途失败。");
    }
  };

  const handleEndJourney = async () => {
    setPageError("");
    setPhraseIndex(0);
    setJourneyState("generating");

    try {
      await travel.endTravel();
      // 模拟AI生成旅记的等待时间（6秒）
      await new Promise(resolve => setTimeout(resolve, 6000));
      setSummaryData(DEMO_DIARY);
      setJourneyState("summary");
    } catch {
      setJourneyState("idle");
    }
  };

  const handleAddAnchor = async () => {
    if (!anchorText.trim() || anchorSubmitting) return;
    setAnchorSubmitting(true);
    try {
      await travel.addManualAnchor(anchorText.trim());
      setAnchorText("");
      setAnchorModalOpen(false);
    } catch {
      setPageError("添加锚点失败。");
    } finally {
      setAnchorSubmitting(false);
    }
  };

  const handleSaveSelectedAnchor = async () => {
    if (!selectedAnchor || selectedAnchorSaving) return;
    setSelectedAnchorSaving(true);
    try {
      const updated = await travel.updateAnchor(selectedAnchor.id, { user_text: selectedAnchorText.trim() });
      if (updated) setSelectedAnchor(updated);
    } catch {
      setPageError("保存锚点失败。");
    } finally {
      setSelectedAnchorSaving(false);
    }
  };

  const handleCapsuleMarkerClick = (capsule: CapsuleData) => {
    setActiveCapsule(capsule);
  };

  const handleUnlockCapsule = async () => {
    if (!activeCapsule || !capsuleAnswer.trim()) return;
    // Demo模式下直接"解锁"
    const detail = DEMO_CAPSULE_DETAILS[activeCapsule.id as number];
    if (detail) {
      setCapsuleMessage("胶囊已解锁！");
      setActiveCapsuleDetail({ ...detail, is_accessible: true });
    } else {
      setCapsuleMessage("暂未解锁成功，再试一次。");
    }
  };

  const handleCreateCapsule = async () => {
    if (!capsuleYuanji.trim() || !capsuleKeyQuestion.trim() || capsuleSubmitting) return;
    setCapsuleSubmitting(true);
    try {
      const result = await travel.createCapsule(
        capsuleYuanji.trim(),
        capsuleKeyQuestion.trim(),
        capsuleKeyAnswer.trim(),
        { city: "南京", weatherWhenCreated: DEMO_WEATHER.weather }
      );
      if (result.success) {
        setCapsuleYuanji("");
        setCapsuleKeyQuestion("");
        setCapsuleKeyAnswer("");
        setCapsuleModalOpen(false);
      }
    } catch {
      setPageError("创建胶囊失败。");
    } finally {
      setCapsuleSubmitting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remain = seconds % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${remain.toString().padStart(2, "0")}`;
    return `${minutes.toString().padStart(2, "0")}:${remain.toString().padStart(2, "0")}`;
  };

  const weatherText = DEMO_WEATHER.weather;
  const temperatureText = `${DEMO_WEATHER.temperature}°`;
  const locationText = DEMO_WEATHER.city;

  return (
    <div className="relative min-h-full w-full overflow-hidden bg-[#FBF8F1]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
      <AnimatePresence mode="wait">
        {journeyState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-full pb-28"
          >
            <div className="relative h-[58dvh] overflow-hidden">
              <HeroPhotoCarousel items={heroItems} />
            </div>

            <div className="relative -mt-6 space-y-4 px-5">
              {pageError && <InlineNotice message={pageError} />}

              <motion.button
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={travel.isActive ? () => setJourneyState("traveling") : handleStartJourney}
                className="w-full rounded-[1.8rem] border border-white/60 bg-white/80 p-5 text-left shadow-[0_8px_40px_rgba(180,140,100,0.1)] backdrop-blur-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-50 shadow-inner">
                      {travel.isActive ? (
                        <div className="relative h-3 w-3 rounded-full bg-rose-400">
                          <div className="absolute inset-0 rounded-full bg-rose-400 opacity-40 animate-ping" />
                        </div>
                      ) : (
                        <Play size={22} className="ml-0.5 text-amber-700" />
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg tracking-wide text-stone-800">
                      {travel.isActive ? "返回旅途中" : "开启缘旅"}
                    </h3>
                    <p className="mt-0.5 text-xs tracking-wide text-stone-400" style={{ fontFamily: "sans-serif" }}>
                      {travel.isActive
                        ? `${formatDuration(travel.duration)} · ${travel.distance.toFixed(2)} km · ${travel.anchors.length} 个锚点`
                        : "轨迹 · 锚点 · 胶囊 · 旅记"}
                    </p>
                  </div>
                </div>
              </motion.button>

              <InfoCard
                icon={<Wind size={15} className="text-stone-400" />}
                label="此刻的风"
                title={locationText}
                subtitle={weatherText}
                meta={temperatureText}
                extra={DEMO_WEATHER.wind}
              />

              {DEMO_RECENT_JOURNEYS[0] && (
                <InfoCard
                  icon={<BookOpen size={15} className="text-stone-400" />}
                  label="上次旅途"
                  title={DEMO_RECENT_JOURNEYS[0].diary_title || "最近一段旅程"}
                  subtitle={DEMO_RECENT_JOURNEYS[0].diary_excerpt || "已存入记忆页"}
                  meta={`${DEMO_RECENT_JOURNEYS[0].total_distance.toFixed(1)} km`}
                  extra={new Date(DEMO_RECENT_JOURNEYS[0].start_time).toLocaleDateString("zh-CN")}
                />
              )}
            </div>
          </motion.div>
        )}

        {journeyState === "traveling" && (
          <motion.div
            key="traveling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex h-full flex-col"
          >
            <div className="absolute inset-0">
              <MapboxRomanceMap
                center={mapCenter}
                trajectoryPath={trajectoryPath}
                anchors={displayAnchors}
                capsules={visibleCapsules}
                onAnchorClick={setSelectedAnchor}
                onCapsuleClick={handleCapsuleMarkerClick}
                lineColor="#e85d3a"
                lineWidth={8}
              />
            </div>

            <div className="relative z-30 px-4 pb-6 pt-12">
              <div className="rounded-[1.5rem] border border-white/60 bg-white/80 px-4 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl">
                <div className="mb-2 flex items-center justify-between">
                  <button
                    onClick={() => setJourneyState("idle")}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-600 shadow-md"
                    title="返回首页"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={handleEndJourney}
                    className="flex items-center gap-1.5 rounded-full bg-stone-800 px-4 py-2 text-xs text-white"
                    style={{ fontFamily: "sans-serif" }}
                  >
                    <StopCircle size={13} />
                    <span>结束旅途</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <TravelMetric icon={<Clock size={13} className="text-amber-600/70" />} text={formatDuration(travel.duration)} />
                  <TravelMetric icon={<Navigation size={13} className="text-amber-600/70" />} text={`${travel.distance.toFixed(2)} km`} />
                  <TravelMetric icon={<AnchorIcon size={13} className="text-amber-600/70" />} text={`${displayAnchors.length} 锚点`} />
                </div>
                {pageError && <p className="mt-2 text-[11px] text-rose-500">{pageError}</p>}
              </div>
            </div>

            <div className="relative z-30 mt-auto px-4 pb-8">
              <div className="flex gap-3">
                <button
                  onClick={() => { setAnchorText(""); setAnchorModalOpen(true); }}
                  className="flex flex-1 items-center gap-2.5 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-2xl"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    <Plus size={16} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs text-stone-700">添加锚点</h4>
                    <p className="text-[10px] text-stone-400" style={{ fontFamily: "sans-serif" }}>记录此刻的感受</p>
                  </div>
                </button>

                <button
                  onClick={() => { setCapsuleYuanji(""); setCapsuleKeyQuestion(""); setCapsuleKeyAnswer(""); setCapsuleModalOpen(true); }}
                  className="flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-2xl"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Lock size={16} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs text-stone-700">埋下胶囊</h4>
                    <p className="text-[10px] text-stone-400" style={{ fontFamily: "sans-serif" }}>在当前位置埋下时空胶囊</p>
                  </div>
                </button>

                <div className="flex items-center rounded-2xl border border-white/60 bg-white/80 px-4 text-xs text-stone-500 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-2xl">
                  <span style={{ fontFamily: "sans-serif" }}>胶囊 {visibleCapsules.length}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {journeyState === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[linear-gradient(135deg,#1a1714_0%,#2d2520_40%,#1e1b18_100%)] px-8 text-center"
          >
            <div className="relative mb-10 h-20 w-20">
              <motion.div
                className="absolute inset-0 rounded-full border border-amber-400/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-t border-amber-300/40"
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} className="text-amber-300/60" />
              </div>
            </div>
            <p className="text-lg tracking-[0.15em] text-amber-100/70">{LOADING_PHRASES[phraseIndex]}</p>
          </motion.div>
        )}

        {journeyState === "summary" && summaryData && (
          <motion.div
            key="summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40 overflow-y-auto bg-[linear-gradient(135deg,#ffecd2_0%,#fcb69f_100%)]"
          >
            <div className="pb-20">
              <div className="relative h-[34dvh] overflow-hidden">
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_40%),linear-gradient(135deg,_rgba(251,191,36,0.2),_rgba(251,146,60,0.35))]">
                  <BookOpen size={30} className="text-white/80" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/50 via-transparent to-transparent" />
              </div>

              <div className="relative -mt-14 mx-4 rounded-[2.5rem] border border-white/50 bg-white/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
                <h2 className="mb-3 text-center text-3xl tracking-wider text-orange-500" style={{ fontWeight: 600 }}>
                  {summaryData.title}
                </h2>
                <p className="mb-8 text-center text-xs tracking-[0.25em] text-orange-400" style={{ fontFamily: "sans-serif" }}>
                  {summaryData.date}
                </p>

                <div className="space-y-5">
                  {summaryData.content.map((paragraph, index) => {
                    const source = typeof paragraph === "string" ? "plain" : paragraph.source;
                    const text = typeof paragraph === "string" ? paragraph : paragraph.text;
                    return (
                      <motion.p
                        key={`${index}-${text.slice(0, 12)}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.3 }}
                        className={`text-sm leading-[1.9] tracking-wide ${
                          source === "ai"
                            ? "font-medium text-orange-600"
                            : source === "user"
                              ? "text-stone-800"
                              : source === "rag"
                                ? "italic text-pink-400"
                                : "text-stone-700"
                        }`}
                      >
                        {text}
                      </motion.p>
                    );
                  })}
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-stone-800 px-6 py-4 text-sm text-white"
                    style={{ fontFamily: "sans-serif" }}
                    onClick={() => alert("Demo模式：导出功能在正式版中可用")}
                  >
                    <Download size={18} />
                    <span>导出地图</span>
                  </button>
                  <button
                    onClick={() => {
                      setSummaryData(null);
                      setJourneyState("idle");
                    }}
                    className="rounded-full border-2 border-orange-200 bg-white px-6 py-4 font-medium text-orange-600"
                  >
                    完成
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 锚点弹窗 ===== */}
      <AnimatePresence>
        {anchorModalOpen && (
          <ModalShell title="添加锚点" onClose={() => setAnchorModalOpen(false)}>
            <textarea
              value={anchorText}
              onChange={(e) => setAnchorText(e.target.value)}
              placeholder="把这一刻写下来，让旅途记住你的感受。"
              className="min-h-28 w-full rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-700 outline-none"
            />
            <button
              onClick={handleAddAnchor}
              disabled={anchorSubmitting || !anchorText.trim()}
              className="mt-4 w-full rounded-2xl bg-stone-800 px-4 py-3 text-sm text-white disabled:opacity-60"
            >
              {anchorSubmitting ? "正在保存…" : "保存锚点"}
            </button>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== 胶囊创建弹窗 ===== */}
      <AnimatePresence>
        {capsuleModalOpen && (
          <ModalShell title="埋下时空胶囊" onClose={() => setCapsuleModalOpen(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">胶囊内容</label>
                <textarea
                  value={capsuleYuanji}
                  onChange={(e) => setCapsuleYuanji(e.target.value)}
                  placeholder="写下你想留给未来的文字..."
                  className="w-full min-h-20 rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-700 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">解锁问题</label>
                <input
                  type="text"
                  value={capsuleKeyQuestion}
                  onChange={(e) => setCapsuleKeyQuestion(e.target.value)}
                  placeholder="设置一个问题来保护你的胶囊"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-700 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">答案提示（可选）</label>
                <input
                  type="text"
                  value={capsuleKeyAnswer}
                  onChange={(e) => setCapsuleKeyAnswer(e.target.value)}
                  placeholder="提供一个模糊的答案提示"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-700 outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleCreateCapsule}
              disabled={capsuleSubmitting || !capsuleYuanji.trim() || !capsuleKeyQuestion.trim()}
              className="mt-4 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm text-white disabled:opacity-60"
            >
              {capsuleSubmitting ? "正在创建…" : "埋下胶囊"}
            </button>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== 锚点详情弹窗 ===== */}
      <AnimatePresence>
        {selectedAnchor && (
          <ModalShell title={selectedAnchor.poi_name || "锚点详情"} onClose={() => setSelectedAnchor(null)}>
            <div className="space-y-4 text-sm text-stone-600">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatusBadge label={selectedAnchor.status === "confirmed" ? "已确认" : selectedAnchor.status} tone={selectedAnchor.status} />
              </div>
              <div className="space-y-1 text-xs text-stone-400">
                <p>时间：{selectedAnchor.created_at ? new Date(selectedAnchor.created_at).toLocaleString("zh-CN") : "未知"}</p>
                {selectedAnchor.weather && <p>天气：{selectedAnchor.weather}{selectedAnchor.temperature != null ? ` · ${selectedAnchor.temperature}°C` : ""}</p>}
                {selectedAnchor.poi_type && <p>地点类型：{selectedAnchor.poi_type}</p>}
              </div>
              {selectedAnchor.ai_description && (
                <div className="rounded-2xl bg-amber-50/80 px-4 py-3">
                  <p className="mb-1 text-[11px] tracking-[0.2em] text-amber-600/70" style={{ fontFamily: "sans-serif" }}>AI 感知</p>
                  <p className="leading-7 text-stone-700">{selectedAnchor.ai_description}</p>
                </div>
              )}
              <div>
                <label className="mb-2 block text-xs tracking-[0.18em] text-stone-400" style={{ fontFamily: "sans-serif" }}>我的补写</label>
                <textarea
                  value={selectedAnchorText}
                  onChange={(e) => setSelectedAnchorText(e.target.value)}
                  placeholder="补写你在这里的感受。"
                  className="min-h-28 w-full rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-700 outline-none"
                />
              </div>
              {!!selectedAnchor.emotion_tags && Array.isArray(selectedAnchor.emotion_tags) && selectedAnchor.emotion_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedAnchor.emotion_tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-[11px] text-stone-500" style={{ fontFamily: "sans-serif" }}>{tag}</span>
                  ))}
                </div>
              )}
              <button
                onClick={handleSaveSelectedAnchor}
                disabled={selectedAnchorSaving}
                className="w-full rounded-2xl bg-stone-800 px-4 py-3 text-sm text-white disabled:opacity-60"
              >
                {selectedAnchorSaving ? "正在保存…" : "保存补写"}
              </button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== 胶囊详情弹窗 ===== */}
      <AnimatePresence>
        {activeCapsule && (
          <ModalShell title="时空胶囊" onClose={() => setActiveCapsule(null)}>
            <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
              <div className="mb-2 flex items-center gap-2">
                <Lock size={15} />
                <span>{activeCapsuleDetail?.key_question || activeCapsule.key_question || "回答问题后即可尝试解锁。"}</span>
              </div>
            </div>
            {activeCapsuleDetail?.is_accessible && activeCapsuleDetail.yuan_ji ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-stone-50/90 px-4 py-4">
                  <p className="mb-2 text-[11px] tracking-[0.2em] text-stone-400" style={{ fontFamily: "sans-serif" }}>胶囊内容</p>
                  <p className="text-sm leading-7 text-stone-700">{activeCapsuleDetail.yuan_ji}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-stone-400" style={{ fontFamily: "sans-serif" }}>
                    {activeCapsuleDetail.city && <span>{activeCapsuleDetail.city}</span>}
                    {activeCapsuleDetail.weather_when_created && <span>{activeCapsuleDetail.weather_when_created}</span>}
                  </div>
                </div>
                {activeCapsuleDetail.echoes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs tracking-[0.18em] text-stone-400" style={{ fontFamily: "sans-serif" }}>已有回响</p>
                    {activeCapsuleDetail.echoes.map((echo: any) => (
                      <div key={echo.id} className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                        <p className="text-sm leading-6 text-stone-700">{echo.content}</p>
                        <p className="mt-2 text-[11px] text-stone-400" style={{ fontFamily: "sans-serif" }}>
                          {new Date(echo.created_at).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <textarea
                  value={capsuleAnswer}
                  onChange={(e) => setCapsuleAnswer(e.target.value)}
                  placeholder="写下你的回答"
                  className="mt-4 min-h-28 w-full rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-700 outline-none"
                />
                <button
                  onClick={handleUnlockCapsule}
                  disabled={!capsuleAnswer.trim()}
                  className="mt-4 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm text-white disabled:opacity-60"
                >
                  提交答案
                </button>
              </>
            )}
            {capsuleMessage && <p className="mt-3 text-sm text-stone-500">{capsuleMessage}</p>}
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function TravelMetric({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex flex-1 items-center gap-1.5">
      {icon}
      <span className="text-xs text-stone-600" style={{ fontFamily: "sans-serif" }}>{text}</span>
    </div>
  );
}

function InfoCard({ icon, label, title, subtitle, meta, extra }: { icon: ReactNode; label: string; title: string; subtitle: string; meta: string; extra: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.8rem] border border-white/40 bg-white/50 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100">{icon}</div>
        <span className="text-xs tracking-widest text-stone-500" style={{ fontFamily: "sans-serif" }}>{label}</span>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <MapPin size={13} className="text-amber-500/70" />
            <span className="text-sm text-stone-700">{title}</span>
          </div>
          <p className="text-xs text-stone-400">{subtitle}</p>
          <p className="mt-1 text-[10px] text-stone-300">{extra}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl text-stone-600" style={{ fontWeight: 200 }}>{meta}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ModalShell({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-5 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        className="w-full max-w-sm max-h-[80vh] overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg text-stone-800">{title}</h3>
          <button onClick={onClose} className="text-sm text-stone-400">关闭</button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function InlineNotice({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-500">{message}</div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: string }) {
  const palette =
    tone === "confirmed" || tone === "ready"
      ? "bg-emerald-50 text-emerald-600"
      : tone === "candidate" || tone === "observation" || tone === "processing"
        ? "bg-amber-50 text-amber-600"
        : "bg-stone-100 text-stone-500";
  return (
    <span className={`rounded-full px-3 py-1 ${palette}`} style={{ fontFamily: "sans-serif" }}>{label}</span>
  );
}
