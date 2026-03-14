import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Layer, Marker, Source } from "react-map-gl/mapbox";
import type { FillExtrusionLayer, LineLayer, MapRef } from "react-map-gl/mapbox";
import { Camera, Home, MapPin, Navigation, Square, Mic } from "lucide-react";
import { MediaCapture } from "../components/MediaCapture";
import { formatDistanceKm, haversineKm, useAppState } from "../contexts/AppStateContext";
import { getMapStyle, getMapToken } from "../lib/map";
import "mapbox-gl/dist/mapbox-gl.css";

const routeLayer: LineLayer = {
  id: "route-line",
  type: "line",
  paint: {
    "line-color": "#3b82f6",
    "line-width": 6,
    "line-opacity": 0.9,
  },
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
};

const glowLayer: LineLayer = {
  id: "route-glow",
  type: "line",
  paint: {
    "line-color": "#60a5fa",
    "line-width": 14,
    "line-opacity": 0.28,
    "line-blur": 8,
  },
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
};

const buildingLayer: FillExtrusionLayer = {
  id: "3d-buildings",
  source: "composite",
  "source-layer": "building",
  filter: ["==", "extrude", "true"],
  type: "fill-extrusion",
  minzoom: 15,
  paint: {
    "fill-extrusion-color": "#cbd5e1",
    "fill-extrusion-height": ["get", "height"],
    "fill-extrusion-base": ["get", "min_height"],
    "fill-extrusion-opacity": 0.72,
  },
};

function parseServerDatetime(value?: string) {
  if (!value) {
    return null;
  }
  // Backend currently returns naive UTC datetime strings.
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }
  return new Date(`${value}Z`);
}

export function RecordingInProgress() {
  const navigate = useNavigate();
  const {
    mapClientConfig,
    currentPosition,
    error,
    setCurrentPosition,
    resolveLocationContext,
    refreshTravel,
    travel,
    travelAnchors,
    travelLocations,
    uploadLocation,
    endTravel,
    uploadFile,
  } = useAppState();

  const mapRef = useRef<MapRef | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastUploadedRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);
  const lastContextSyncRef = useRef<number>(0);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(true);
  const [isStopping, setIsStopping] = useState(false);
  const [showMediaCapture, setShowMediaCapture] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [capturedAudios, setCapturedAudios] = useState<Blob[]>([]);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [permissionHint, setPermissionHint] = useState("正在获取实时定位...");
  const [isPaused, setIsPaused] = useState(false);
  const geoRetryCountRef = useRef(0);

  const routePoints = useMemo(
    () => travelLocations.map((item) => ({ lat: item.lat, lng: item.lng })),
    [travelLocations],
  );

  const routeGeoJson = useMemo(
    () => ({
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: routePoints.map((point) => [point.lng, point.lat]),
      },
    }),
    [routePoints],
  );

  const totalDistanceKm = useMemo(() => formatDistanceKm(routePoints), [routePoints]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    if (!travel?.start_time) {
      setElapsedSeconds(0);
      return;
    }
    const startAt = parseServerDatetime(travel.start_time);
    if (!startAt || Number.isNaN(startAt.getTime())) {
      setElapsedSeconds(0);
      return;
    }
    const update = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startAt.getTime()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [travel?.start_time]);

  const currentAnchorName = travelAnchors[travelAnchors.length - 1]?.poi_name || "实时记录中";
  const hasPosition = currentPosition.lat !== null && currentPosition.lng !== null;

  // Only redirect to home if travel is explicitly ended / not active.
  // Use a short delay so that the state has time to settle after navigation from TravelTransition.
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (travel?.id && travel.status === "active") {
      // Travel is valid – clear any pending redirect
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
      return;
    }
    // Give the state 5 seconds to settle before redirecting.
    // The previous 2s was too aggressive and caused premature redirects when
    // the travel state hadn't propagated from TravelTransition yet.
    redirectTimerRef.current = setTimeout(() => {
      if (!travel?.id || travel.status !== "active") {
        navigate("/");
      }
    }, 5000);
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [navigate, travel?.id, travel?.status]);

  useEffect(() => {
    if (!travel?.id || travel.status !== "active" || isPaused) {
      return;
    }
    refreshTravel().catch(() => undefined);
    const timer = window.setInterval(() => {
      refreshTravel().catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [refreshTravel, travel?.id, travel?.status, isPaused]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPermissionHint("当前浏览器不支持定位。");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date(position.timestamp).toISOString(),
        };
        const nextSpeed = Math.max(0, (position.coords.speed || 0) * 3.6);
        const nextHeading = Number.isFinite(position.coords.heading) ? position.coords.heading || heading : heading;

        setPermissionHint("正在记录真实轨迹");
        setSpeed(nextSpeed);
        setHeading(nextHeading);
        setCurrentPosition(next);

        if (position.timestamp - lastContextSyncRef.current >= 20_000) {
          lastContextSyncRef.current = position.timestamp;
          resolveLocationContext({ lat: next.lat, lng: next.lng }).catch(() => undefined);
        }

        const last = lastUploadedRef.current;
        const movedEnough =
          !last || haversineKm(last, next) >= 0.008 || position.timestamp - last.timestamp >= 10_000;

        if (movedEnough) {
          lastUploadedRef.current = {
            lat: next.lat,
            lng: next.lng,
            timestamp: position.timestamp,
          };
          await uploadLocation({
            lat: next.lat,
            lng: next.lng,
            speed: nextSpeed,
            timestamp: next.timestamp,
          }).catch(() => undefined);
        }

        if (isFollowing && mapRef.current) {
          mapRef.current.easeTo({
            center: {
              lng: next.lng,
              lat: next.lat,
            },
            zoom: 17.2,
            pitch: 68,
            bearing: nextHeading || 0,
            offset: [0, 180],
            duration: 800,
            essential: true,
          });
        }
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setPermissionHint("定位权限被拒绝，请在浏览器地址栏允许定位。");
          return;
        }
        // On desktop browsers or simulators, CoreLocation often fails with
        // kCLErrorLocationUnknown. Use getCurrentPosition as fallback first,
        // then fall back to the last known AppState position so the user
        // can still record their trip without being blocked.
        geoRetryCountRef.current += 1;
        if (geoRetryCountRef.current <= 2) {
          setPermissionHint("正在尝试定位...");
          // Try a one-shot getCurrentPosition which sometimes succeeds
          // even when watchPosition keeps failing
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              geoRetryCountRef.current = 0;
              setPermissionHint("正在记录真实轨迹");
              setCurrentPosition({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                timestamp: new Date(pos.timestamp).toISOString(),
              });
            },
            () => { /* ignore, will retry via watchPosition */ },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
          );
        } else {
          setPermissionHint("使用近似定位记录中");
          // Use app-state position as fallback so the map isn't stuck
          if (currentPosition.lat && currentPosition.lng) {
            setCurrentPosition({
              lat: currentPosition.lat,
              lng: currentPosition.lng,
              timestamp: new Date().toISOString(),
            });
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 3_000,
      },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [heading, isFollowing, resolveLocationContext, setCurrentPosition, uploadLocation]);

  // Handle page visibility (background/foreground) to avoid crashes
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsPaused(true);
        setPermissionHint("应用已切换到后台，回来继续记录");
      } else {
        setIsPaused(false);
        setPermissionHint("正在记录真实轨迹");
        // Refresh travel state after coming back from background
        refreshTravel().catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [refreshTravel]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!hasPosition) {
    return (
      <div className="relative w-full max-w-[430px] h-[100dvh] mx-auto bg-[#0b1220] overflow-hidden flex items-center justify-center px-6 text-center text-white">
        <div className="space-y-4">
          <div className="text-base">等待定位授权</div>
          <div className="text-sm text-white/80">{permissionHint}</div>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-full bg-white/15 border border-white/20 text-sm"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[430px] h-[100dvh] mx-auto bg-[#0b1220] overflow-hidden">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: currentPosition.lng,
          latitude: currentPosition.lat,
          zoom: 16,
          pitch: 60,
          bearing: heading || 0,
        }}
        onMove={() => undefined}
        onDragStart={() => setIsFollowing(false)}
        onRotateStart={() => setIsFollowing(false)}
        onPitchStart={() => setIsFollowing(false)}
        mapStyle={getMapStyle(mapClientConfig)}
        mapboxAccessToken={getMapToken(mapClientConfig)}
        style={{ width: "100%", height: "100%" }}
        onLoad={() => setMapLoaded(true)}
      >
        {mapLoaded && routePoints.length >= 2 && (
          <Source id="travel-route" type="geojson" data={routeGeoJson}>
            <Layer {...glowLayer} />
            <Layer {...routeLayer} />
          </Source>
        )}

        {mapLoaded && <Layer {...buildingLayer} />}

        <Marker longitude={currentPosition.lng} latitude={currentPosition.lat} anchor="center">
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-12 w-12 rounded-full bg-blue-400/25 blur-xl animate-pulse" />
              <div className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-orange-500 shadow-xl" />
            </div>
            <div className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#1f2937] shadow-lg">
              你在这里
            </div>
          </div>
        </Marker>

        {travelAnchors.map((anchor) => (
          <Marker key={anchor.id} longitude={anchor.lng} latitude={anchor.lat} anchor="center">
            <button
              onClick={() => navigate(`/anchor/${anchor.id}`)}
              className="h-4 w-4 rounded-full border border-white bg-[#fb923c] shadow-lg"
            />
          </Marker>
        ))}
      </Map>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/45 to-transparent" />
      </div>

      <div className="absolute top-6 left-5 right-5 z-20">
        <div className="rounded-[20px] border border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[12px] font-semibold text-[#1f2937]">旅行记录中</span>
            </div>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold text-orange-600">
              {travel?.id ? `旅行 #${travel.id}` : "准备中"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 px-4 pb-3 text-center">
            <div className="rounded-2xl bg-slate-50 px-2 py-2">
              <div className="text-[10px] text-[#6b7280]">时长</div>
              <div className="text-[12px] font-bold text-[#111827]">{formatTime(elapsedSeconds)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-2 py-2">
              <div className="text-[10px] text-[#6b7280]">轨迹</div>
              <div className="text-[12px] font-bold text-[#111827]">{totalDistanceKm.toFixed(2)} km</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-2 py-2">
              <div className="text-[10px] text-[#6b7280]">速度</div>
              <div className="text-[12px] font-bold text-[#111827]">{speed.toFixed(1)} km/h</div>
            </div>
          </div>
          <div className="border-t border-slate-100 px-4 py-3 text-[11px] text-[#6b7280]">
            {permissionHint} · 当前锚点：{currentAnchorName}
          </div>
          {error && <div className="border-t border-red-100 px-4 py-3 text-[11px] text-red-600">接口异常：{error}</div>}
        </div>
      </div>

      <button
        onClick={() => setShowMediaCapture(!showMediaCapture)}
        className="absolute bottom-[108px] left-6 z-20 flex h-[58px] w-[58px] items-center justify-center rounded-full border border-white/40 bg-white/95 shadow-2xl backdrop-blur-md"
      >
        <Camera className="h-7 w-7 text-[#fb923c]" strokeWidth={2.2} />
        {capturedPhotos.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-white text-[10px] flex items-center justify-center">
            {capturedPhotos.length}
          </div>
        )}
      </button>

      {showMediaCapture && (
        <div className="absolute bottom-[170px] left-4 right-4 z-30">
          <MediaCapture
            onPhotoCapture={async (dataUrl) => {
              setCapturedPhotos((prev) => [...prev, dataUrl]);
              setShowMediaCapture(false);
              // Upload to backend
              try {
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                await uploadFile(blob, "photo", `photo_${Date.now()}.jpg`);
              } catch { /* upload silently fails */ }
            }}
            onAudioCapture={async (blob) => {
              setCapturedAudios((prev) => [...prev, blob]);
              setShowMediaCapture(false);
              // Upload to backend
              try {
                await uploadFile(blob, "audio", `audio_${Date.now()}.webm`);
              } catch { /* upload silently fails */ }
            }}
          />
        </div>
      )}

      {!isFollowing && (
        <button
          onClick={() => {
            setIsFollowing(true);
            mapRef.current?.easeTo({
              center: { lng: currentPosition.lng, lat: currentPosition.lat },
              zoom: 17.2,
              pitch: 68,
              bearing: heading || 0,
              offset: [0, 180],
              duration: 600,
              essential: true,
            });
          }}
          className="absolute bottom-[182px] left-6 z-20 flex h-[58px] w-[58px] items-center justify-center rounded-full border border-white/40 bg-blue-500/95 shadow-2xl backdrop-blur-md"
        >
          <Navigation className="h-7 w-7 text-white" strokeWidth={2.2} />
        </button>
      )}

      <div className="absolute bottom-[108px] right-6 z-20 rounded-2xl bg-white/95 px-4 py-3 text-right shadow-2xl backdrop-blur-md">
        <div className="text-[10px] text-[#6b7280]">实时坐标</div>
        <div className="text-[11px] font-semibold text-[#111827]">
          {currentPosition.lat.toFixed(5)}, {currentPosition.lng.toFixed(5)}
        </div>
      </div>

      {/* Back to home without ending travel */}
      <button
        onClick={() => navigate("/")}
        className="absolute bottom-6 left-6 z-20 flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/40 bg-white/95 shadow-2xl backdrop-blur-md"
      >
        <Home className="h-6 w-6 text-[#5a4a3a]" />
      </button>

      <button
        onClick={async () => {
          setIsStopping(true);
          // Stop the refresh interval immediately to prevent API contention
          setIsPaused(true);
          // Clear GPS watch to stop uploads
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          try {
            await endTravel();
            navigate("/results");
          } catch {
            setIsStopping(false);
            setIsPaused(false);
            if (window.confirm("结束旅行请求失败，是否强制返回？")) {
              navigate("/results");
            }
          }
        }}
        className="absolute bottom-6 left-1/2 z-20 flex h-[64px] w-[64px] -translate-x-1/2 items-center justify-center rounded-full border-2 border-white/30 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-2xl"
      >
        {isStopping ? (
          <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <Square className="h-7 w-7 fill-white" />
        )}
      </button>
    </div>
  );
}
