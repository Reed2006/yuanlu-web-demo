import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Marker } from "react-map-gl/mapbox";
import { Droplet, MapPin, Waves, Anchor } from "lucide-react";
import { PulseButton } from "../../components/PulseButton";
import { useAppState } from "../../contexts/AppStateContext";
import { getMapStyle, getMapToken } from "../../lib/map";
import "mapbox-gl/dist/mapbox-gl.css";

type PickupStage = "scanning" | "found" | "picking" | "opened" | "empty";

export function BottlePickup() {
  const navigate = useNavigate();
  const { mapClientConfig, currentPosition, bottle, receiveBottle } = useAppState();
  const [stage, setStage] = useState<PickupStage>("scanning");
  const [scanProgress, setScanProgress] = useState(0);
  const [bottleOffset, setBottleOffset] = useState(0);
  const [pickupError, setPickupError] = useState("");

  const lng = currentPosition.lng ?? 121.4737;
  const lat = currentPosition.lat ?? 31.2304;

  // 扫描海面 → 调用后端 receiveBottle
  useEffect(() => {
    if (stage !== "scanning") return;
    const timer = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Call real backend
          receiveBottle({ lat, lng }).then((res) => {
            if (res.received && res.bottle_id) {
              setStage("found");
            } else {
              setStage("empty");
            }
          }).catch((err) => {
            setPickupError(err?.message || "拾取失败");
            setStage("empty");
          });
          return 100;
        }
        return prev + 2;
      });
    }, 80);
    return () => clearInterval(timer);
  }, [stage, lat, lng, receiveBottle]);

  // 瓶子漂浮动画
  useEffect(() => {
    if (stage !== "found" && stage !== "picking") return;
    const timer = setInterval(() => {
      setBottleOffset((prev) => prev + 0.05);
    }, 50);
    return () => clearInterval(timer);
  }, [stage]);

  const handlePickup = () => {
    setStage("picking");
    setTimeout(() => {
      setStage("opened");
    }, 1500);
  };

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden relative">
      {/* Map Background - Ocean View */}
      <Map
        longitude={lng}
        latitude={lat}
        zoom={14}
        mapStyle={getMapStyle(mapClientConfig)}
        mapboxAccessToken={getMapToken(mapClientConfig)}
        style={{ width: "100%", height: "100%" }}
      >
        {/* 当前位置标记 */}
        <Marker longitude={lng} latitude={lat}>
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
        </Marker>
      </Map>

      {/* Ocean Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-transparent to-cyan-900/40 pointer-events-none" />

      {/* Scanning Phase */}
      {stage === "scanning" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Scanning Ring */}
          <div className="relative w-48 h-48 mb-8">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100" cy="100" r="90"
                fill="none"
                stroke="rgba(34, 211, 238, 0.2)"
                strokeWidth="4"
              />
              <circle
                cx="100" cy="100" r="90"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${scanProgress * 5.65} 565`}
                style={{ transition: "stroke-dasharray 0.1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Waves className="w-8 h-8 text-cyan-400 mb-2 animate-pulse" />
              <span className="text-sm text-white/90">扫描海面中</span>
              <span className="text-2xl text-cyan-300 font-bold mt-1">{scanProgress}%</span>
            </div>
          </div>

          <p className="text-xs text-white/60 text-center px-8">
            正在寻找附近海域漂流的远洋瓶…
          </p>
        </div>
      )}

      {/* Found Phase - Bottle Floating */}
      {stage === "found" && (
        <>
          {/* Floating Bottle */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="relative"
              style={{
                transform: `translateY(${Math.sin(bottleOffset) * 15}px) rotate(${Math.sin(bottleOffset * 0.7) * 8}deg)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* Glow */}
              <div className="absolute -inset-6 bg-cyan-400/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -inset-3 bg-cyan-300/30 rounded-full blur-xl" />

              {/* Bottle Icon */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-200/90 to-blue-300/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-2 border-white/40">
                <Droplet className="w-12 h-12 text-cyan-600" />
              </div>

              {/* Sparkles */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-cyan-200 rounded-full animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.3s" }} />
            </div>
          </div>

          {/* Discovery Card */}
          <div className="absolute inset-x-4 bottom-4 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-100 rounded-full mb-3">
                <Anchor className="w-3.5 h-3.5 text-cyan-600" />
                <span className="text-xs text-cyan-700 font-medium">发现远洋瓶！</span>
              </div>

              <h2 className="text-lg text-[#3a2a1a] mb-1">海面上漂来了一个瓶子</h2>

              <div className="flex items-center gap-1 text-xs text-[#8a7a6a] mb-2">
                <MapPin className="w-3 h-3" />
                <span>{bottle?.from?.city || currentPosition.city || "当前海域"}</span>
              </div>

              <p className="text-xs text-[#8a7a6a] leading-relaxed mb-5">
                这个瓶子从远方漂流而来，里面也许藏着一个陌生人的故事
              </p>

              <div className="w-full space-y-3">
                <PulseButton
                  onClick={handlePickup}
                  variant="primary"
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-400"
                  glowColor="34, 211, 238"
                >
                  <Droplet className="w-4 h-4" />
                  拾起远洋瓶
                </PulseButton>
                <button
                  onClick={() => navigate("/yuan")}
                  className="w-full py-3 text-sm text-[#8a7a6a] hover:text-[#5a4a3a] transition-colors"
                >
                  让它继续漂流
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Picking Animation */}
      {stage === "picking" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            {/* Rising bottle animation */}
            <div
              className="relative animate-bounce"
              style={{ animationDuration: "1s" }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full flex items-center justify-center shadow-2xl">
                <Droplet className="w-10 h-10 text-white" />
              </div>
            </div>
            <p className="text-sm text-white/90 mt-6 animate-pulse">正在拾取…</p>
          </div>
        </div>
      )}

      {/* Opened Phase */}
      {stage === "opened" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
          {/* Success Animation */}
          <div className="relative mb-8">
            <div className="absolute -inset-8 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/60">
              <Droplet className="w-12 h-12 text-cyan-500" />
            </div>
          </div>

          <h2 className="text-xl text-white mb-2">远洋瓶已拾取</h2>
          <p className="text-sm text-white/70 mb-8 text-center px-8">
            {bottle?.from?.city
              ? `这个瓶子从${bottle.from.city}漂流而来`
              : "这个瓶子从远方漂流而来"}
          </p>

          {bottle?.content && (
            <div className="mx-6 mb-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 max-h-40 overflow-y-auto">
              <p className="text-sm text-[#3a2a1a] leading-relaxed italic">「{bottle.content}」</p>
            </div>
          )}

          <div className="w-full px-6 space-y-3">
            <PulseButton
              onClick={() => navigate("/yuan/bottle-trajectory")}
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-400"
              glowColor="34, 211, 238"
            >
              查看漂流轨迹
            </PulseButton>
            <button
              onClick={() => navigate("/yuan")}
              className="w-full py-3 text-sm text-white/70 hover:text-white transition-colors underline"
            >
              返回
            </button>
          </div>
        </div>
      )}

      {/* Empty Phase - no bottle found */}
      {stage === "empty" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/60">
              <Waves className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          <h2 className="text-xl text-white mb-2">海面空空</h2>
          <p className="text-sm text-white/70 mb-2 text-center px-8">
            {pickupError || "此刻没有远洋瓶漂流到这里，换个时间或地方试试吧"}
          </p>
          <p className="text-xs text-white/50 mb-8 text-center px-8">
            提示：在海边更容易捡到远洋瓶哦
          </p>

          <div className="w-full px-6 space-y-3">
            <PulseButton
              onClick={() => { setStage("scanning"); setScanProgress(0); setPickupError(""); }}
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-400"
              glowColor="34, 211, 238"
            >
              再扫描一次
            </PulseButton>
            <button
              onClick={() => navigate("/yuan")}
              className="w-full py-3 text-sm text-white/70 hover:text-white transition-colors underline"
            >
              返回
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
