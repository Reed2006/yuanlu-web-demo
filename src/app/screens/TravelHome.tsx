import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Map, { Marker } from "react-map-gl/mapbox";
import {
  Plus,
  MapPin,
  Locate,
  Users,
  MessageCircle,
  User,
  Bell,
  Radio,
} from "lucide-react";
import { PulseButton } from "../components/PulseButton";
import { useAppState } from "../contexts/AppStateContext";
import { requestJson } from "../lib/api";
import { isDemoMode } from "../lib/demoMode";
import { getMapToken, getMapStyle } from "../lib/map";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapAnchor {
  id: number;
  lat: number;
  lng: number;
  poi_name?: string;
  travel_id?: number;
}

export function TravelHome() {
  const navigate = useNavigate();
  const {
    travelHistory,
    loadTravelHistory,
    currentPosition,
    setCurrentPosition,
    resolveLocationContext,
    mapClientConfig,
    loadMapClientConfig,
    travel,
    travelAnchors,
    apiBase,
    userId,
    refreshTravel,
  } = useAppState();
  const [allAnchors, setAllAnchors] = useState<MapAnchor[]>([]);
  const [activeTab, setActiveTab] = useState("travel");
  const [viewState, setViewState] = useState({
    longitude: currentPosition.lng ?? 110,
    latitude: currentPosition.lat ?? 35,
    zoom: currentPosition.lat ? 12 : 3,
  });

  // Center map when position first becomes available
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

  useEffect(() => {
    loadTravelHistory();
    // Load all user anchors for map display
    if (userId) {
      requestJson<{ items: MapAnchor[] }>(apiBase, `/travel/anchors/user?user_id=${userId}`)
        .then((res) => setAllAnchors(res.items || []))
        .catch(() => undefined);
    }
    // Verify active travel state with backend to prevent stale "return to recording" button
    if (travel?.id && travel.status === "active") {
      refreshTravel().catch(() => undefined);
    }
  }, [userId, apiBase]);

  // Redirect to auth if not logged in
  useEffect(() => {
    const raw = localStorage.getItem("yuanlv_user");
    if (!raw) {
      navigate("/auth", { replace: true });
      return;
    }
    try {
      const user = JSON.parse(raw);
      if (!user.loggedIn) navigate("/auth", { replace: true });
    } catch {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  // Request GPS position on mount and resolve location context
  useEffect(() => {
    // In demo mode, skip GPS — demo position is already set
    if (isDemoMode()) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: new Date().toISOString(),
        });
        resolveLocationContext({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }).catch(() => undefined);
      },
      () => {
        // High accuracy failed (e.g. desktop browser), retry with lower accuracy
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCurrentPosition({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              timestamp: new Date().toISOString(),
            });
            resolveLocationContext({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }).catch(() => undefined);
          },
          () => { /* silently ignore — map will show default view */ },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 },
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  // Build map markers from all anchors (current travel + historical)
  const cityMarkers = (() => {
    const markers: { name: string; lat: number; lng: number; id?: number }[] = [];
    const seen = new Set<string>();

    // Current travel anchors first (higher priority)
    for (const anchor of travelAnchors) {
      const key = `${anchor.lat.toFixed(3)},${anchor.lng.toFixed(3)}`;
      if (!seen.has(key)) {
        seen.add(key);
        markers.push({
          name: anchor.poi_name || "锚点",
          lat: anchor.lat,
          lng: anchor.lng,
          id: anchor.id,
        });
      }
    }

    // All historical anchors
    for (const anchor of allAnchors) {
      const key = `${anchor.lat.toFixed(3)},${anchor.lng.toFixed(3)}`;
      if (!seen.has(key)) {
        seen.add(key);
        markers.push({
          name: anchor.poi_name || "锚点",
          lat: anchor.lat,
          lng: anchor.lng,
          id: anchor.id,
        });
      }
    }

    return markers;
  })();

  // Check for active travel
  const hasActiveTravel = travel?.id && travel.status === "active";

  const token = getMapToken(mapClientConfig);
  const locationLabel = (() => {
    if (!currentPosition.lat) return "定位中...";
    const parts: string[] = [];
    if (currentPosition.city) parts.push(currentPosition.city);
    if (currentPosition.poi_name) parts.push(currentPosition.poi_name);
    else if (currentPosition.label) parts.push(currentPosition.label);
    if (parts.length === 0 && currentPosition.full_address) return currentPosition.full_address;
    return parts.join(" · ") || "已定位";
  })();

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
            {cityMarkers.map((city, idx) => (
              <Marker key={idx} longitude={city.lng} latitude={city.lat}>
                <button
                  onClick={() => city.id && navigate(`/anchor/${city.id}`)}
                  className="relative group cursor-pointer"
                >
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full border-2 border-white shadow-lg" />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs text-[#5a4a3a]">
                    {city.name}
                  </div>
                </button>
              </Marker>
            ))}
            {/* Current position marker */}
            {currentPosition.lat && currentPosition.lng && (
              <Marker longitude={currentPosition.lng} latitude={currentPosition.lat}>
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-8 w-8 rounded-full bg-blue-400/30 animate-pulse" />
                  <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
                </div>
              </Marker>
            )}
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

        {/* Top Center Button - Start Travel / Return to Recording */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          {hasActiveTravel ? (
            <button
              onClick={() => navigate("/recording")}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-lg flex items-center gap-2"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span className="text-sm">旅行中 · 返回记录</span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/transition")}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-full shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm">开始旅行</span>
            </button>
          )}
        </div>

        {/* Left Top - Location */}
        <div className="absolute top-6 left-4">
          <PulseButton
            variant="icon"
            size="md"
            onClick={() => {
              if (!navigator.geolocation) return;
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setCurrentPosition({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    timestamp: new Date().toISOString(),
                  });
                  resolveLocationContext({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                  }).catch(() => undefined);
                  setViewState((prev) => ({
                    ...prev,
                    longitude: pos.coords.longitude,
                    latitude: pos.coords.latitude,
                    zoom: 14,
                  }));
                },
                () => {},
                { enableHighAccuracy: true, timeout: 10000 },
              );
            }}
          >
            <Locate className="w-5 h-5 text-[#5a4a3a]" />
          </PulseButton>
        </div>

        {/* Right Top - Notification + Manual Creation */}
        <div className="absolute top-6 right-4 flex items-center gap-2">
          <PulseButton
            onClick={() => navigate("/notifications")}
            variant="icon"
            size="md"
          >
            <div className="relative">
              <Bell className="w-5 h-5 text-[#5a4a3a]" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
            </div>
          </PulseButton>
          <PulseButton
            onClick={() => navigate("/manual")}
            variant="icon"
            size="md"
          >
            <Plus className="w-5 h-5 text-orange-500" />
          </PulseButton>
        </div>

        {/* Bottom Info Card */}
        <div className="absolute bottom-20 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm p-4 border border-white/50">
          {isDemoMode() && (
            <div className="mb-2 px-2 py-1 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-[10px] text-purple-600">演示模式 · 数据为预设展示内容</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#8a7a6a] mb-1">当前位置</div>
              <div className="text-sm text-[#3a2a1a]">{locationLabel}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-white border-t border-[#e5e1db] px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => {
            setActiveTab("travel");
            navigate("/");
          }}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            activeTab === "travel" ? "bg-orange-50" : ""
          }`}
        >
          <MapPin
            className={`w-5 h-5 ${activeTab === "travel" ? "text-orange-500" : "text-[#8a7a6a]"}`}
          />
          <span
            className={`text-xs ${activeTab === "travel" ? "text-orange-500" : "text-[#8a7a6a]"}`}
          >
            旅
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("yuan");
            navigate("/yuan");
          }}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            activeTab === "yuan" ? "bg-orange-50" : ""
          }`}
        >
          <Users
            className={`w-5 h-5 ${activeTab === "yuan" ? "text-orange-500" : "text-[#8a7a6a]"}`}
          />
          <span
            className={`text-xs ${activeTab === "yuan" ? "text-orange-500" : "text-[#8a7a6a]"}`}
          >
            缘
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("community");
            navigate("/community");
          }}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            activeTab === "community" ? "bg-orange-50" : ""
          }`}
        >
          <MessageCircle
            className={`w-5 h-5 ${activeTab === "community" ? "text-orange-500" : "text-[#8a7a6a]"}`}
          />
          <span
            className={`text-xs ${activeTab === "community" ? "text-orange-500" : "text-[#8a7a6a]"}`}
          >
            社区
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("me");
            navigate("/profile");
          }}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            activeTab === "me" ? "bg-orange-50" : ""
          }`}
        >
          <User
            className={`w-5 h-5 ${activeTab === "me" ? "text-orange-500" : "text-[#8a7a6a]"}`}
          />
          <span
            className={`text-xs ${activeTab === "me" ? "text-orange-500" : "text-[#8a7a6a]"}`}
          >
            我的
          </span>
        </button>
      </div>
    </div>
  );
}
