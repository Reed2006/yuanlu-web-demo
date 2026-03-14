import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Map, { Marker } from "react-map-gl/mapbox";
import {
  Sparkles,
  Droplet,
  Users as UsersIcon,
  MapPin,
  User,
  MessageCircle,
  Plus,
  Bell,
} from "lucide-react";
import { PulseButton } from "../../components/PulseButton";
import { useAppState } from "../../contexts/AppStateContext";
import { getMapToken, getMapStyle } from "../../lib/map";
import "mapbox-gl/dist/mapbox-gl.css";

export function YuanHome() {
  const navigate = useNavigate();
  const { nearbyCapsules, loadNearbyCapsules, mapClientConfig, loadMapClientConfig, currentPosition } =
    useAppState();
  const [activeMode, setActiveMode] = useState<
    "capsule" | "bottle" | "memory"
  >("capsule");
  const [activeTab, setActiveTab] = useState("yuan");
  const [viewState, setViewState] = useState({
    longitude: currentPosition.lng ?? 116,
    latitude: currentPosition.lat ?? 35,
    zoom: currentPosition.lng ? 12 : 4,
  });

  useEffect(() => {
    loadNearbyCapsules();
  }, []);

  // Auto-center map when GPS position becomes available
  useEffect(() => {
    if (currentPosition.lat && currentPosition.lng) {
      setViewState((prev) => ({
        ...prev,
        longitude: currentPosition.lng!,
        latitude: currentPosition.lat!,
        zoom: Math.max(prev.zoom, 12),
      }));
    }
  }, [currentPosition.lat, currentPosition.lng]);

  const token = getMapToken(mapClientConfig);

  // Distance to nearest capsule
  const nearestDistance =
    nearbyCapsules.length > 0
      ? Math.round(nearbyCapsules[0].distance_m)
      : null;

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative">
        {token ? (
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle={getMapStyle(mapClientConfig)}
            mapboxAccessToken={token}
            style={{ width: "100%", height: "100%" }}
          >
            {activeMode === "capsule" &&
              nearbyCapsules.map((capsule) => (
                <Marker
                  key={capsule.id}
                  longitude={capsule.lng}
                  latitude={capsule.lat}
                >
                  <div
                    className="relative cursor-pointer"
                    onClick={() => navigate("/yuan/capsule-discovery")}
                  >
                    {capsule.status !== "locked" ? (
                      <div className="relative">
                        <div
                          className="w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full animate-pulse"
                          style={{
                            boxShadow:
                              "0 0 15px rgba(251, 146, 60, 0.6), 0 0 30px rgba(251, 146, 60, 0.3)",
                          }}
                        />
                        <div className="absolute inset-0 bg-amber-300/30 rounded-full blur-md" />
                      </div>
                    ) : (
                      <div className="relative">
                        <div
                          className="w-5 h-5 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full opacity-60"
                          style={{
                            boxShadow: "0 0 10px rgba(71, 85, 105, 0.4)",
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-500/20 rounded-full blur-md" />
                      </div>
                    )}
                  </div>
                </Marker>
              ))}
          </Map>
        ) : (
          <div className="w-full h-full bg-[#e5e1db] flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-[#8a7a6a]">地图加载中...</p>
            <button
              onClick={() => loadMapClientConfig().catch(() => undefined)}
              className="px-4 py-2 text-xs text-white bg-orange-400 rounded-full"
            >
              重新加载
            </button>
          </div>
        )}

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#f8f6f3] to-transparent pt-4 pb-3 px-5">
          <div className="relative text-center mb-1">
            <h1 className="text-lg text-[#3a2a1a]">缘</h1>
            <p className="text-xs text-[#8a7a6a]">
              在同一地点，与陌生人的时间相遇
            </p>
            <button
              onClick={() => navigate("/notifications")}
              className="absolute right-0 top-0 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
            >
              <div className="relative">
                <Bell className="w-4 h-4 text-[#5a4a3a]" />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
              </div>
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setActiveMode("capsule")}
              className={`flex-1 px-4 py-2 rounded-full text-xs transition-all ${
                activeMode === "capsule"
                  ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg"
                  : "bg-white/80 backdrop-blur-sm text-[#8a7a6a]"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>胶囊</span>
              </div>
            </button>
            <button
              onClick={() => setActiveMode("bottle")}
              className={`flex-1 px-4 py-2 rounded-full text-xs transition-all ${
                activeMode === "bottle"
                  ? "bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-lg"
                  : "bg-white/80 backdrop-blur-sm text-[#8a7a6a]"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Droplet className="w-3.5 h-3.5" />
                <span>远洋瓶</span>
              </div>
            </button>
            <button
              onClick={() => setActiveMode("memory")}
              className={`flex-1 px-4 py-2 rounded-full text-xs transition-all ${
                activeMode === "memory"
                  ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg"
                  : "bg-white/80 backdrop-blur-sm text-[#8a7a6a]"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <UsersIcon className="w-3.5 h-3.5" />
                <span>集体记忆</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Info Card */}
        {activeMode === "capsule" && (
          <div className="absolute bottom-20 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-[#3a2a1a]">
                  {nearbyCapsules.length > 0
                    ? "附近有时空胶囊"
                    : "暂无附近胶囊"}
                </span>
              </div>
              {nearestDistance != null && (
                <span className="text-xs text-[#8a7a6a]">
                  约 {nearestDistance}m
                </span>
              )}
            </div>
            <PulseButton
              onClick={() => navigate("/yuan/capsule-discovery")}
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-amber-400 to-orange-400"
              glowColor="251, 146, 60"
            >
              去寻找
            </PulseButton>
          </div>
        )}

        {activeMode === "bottle" && (
          <div className="absolute bottom-20 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Droplet className="w-4 h-4 text-cyan-500" />
              <span className="text-sm text-[#3a2a1a]">你位于海边</span>
            </div>
            <div className="flex gap-3">
              <PulseButton
                onClick={() => navigate("/yuan/bottle-send")}
                variant="primary"
                size="lg"
                className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-400"
                glowColor="34, 211, 238"
              >
                投放远洋瓶
              </PulseButton>
              <PulseButton
                onClick={() => navigate("/yuan/bottle-pickup")}
                variant="primary"
                size="lg"
                className="flex-1 bg-gradient-to-r from-teal-400 to-cyan-400"
                glowColor="45, 212, 191"
              >
                拾取远洋瓶
              </PulseButton>
            </div>
          </div>
        )}

        {activeMode === "memory" && (
          <div className="absolute bottom-20 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-[#3a2a1a]">集体记忆层</span>
            </div>
            <p className="text-xs text-[#8a7a6a] leading-relaxed mb-3">
              匿名聚合的城市情感热力，显示真正有人驻足过的地方
            </p>
            <PulseButton
              onClick={() => navigate("/yuan/collective-memory")}
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-amber-400 to-orange-400"
              glowColor="251, 146, 60"
            >
              查看集体记忆层
            </PulseButton>
          </div>
        )}

        {/* Floating Create Button */}
        {activeMode === "capsule" && (
          <div className="absolute top-6 right-4">
            <PulseButton
              onClick={() => navigate("/yuan/capsule-create")}
              variant="icon"
              size="md"
              glowColor="251, 146, 60"
            >
              <Plus className="w-5 h-5 text-orange-500" />
            </PulseButton>
          </div>
        )}
      </div>

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
          onClick={() => setActiveTab("yuan")}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            activeTab === "yuan" ? "bg-orange-50" : ""
          }`}
        >
          <Sparkles
            className={`w-5 h-5 ${activeTab === "yuan" ? "text-orange-500" : "text-[#8a7a6a]"}`}
          />
          <span
            className={`text-xs ${activeTab === "yuan" ? "text-orange-500" : "text-[#8a7a6a]"}`}
          >
            缘
          </span>
        </button>
        <button
          onClick={() => navigate("/community")}
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-[#8a7a6a]" />
          <span className="text-xs text-[#8a7a6a]">社区</span>
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
