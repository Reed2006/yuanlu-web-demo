import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import Map, { Marker, Source, Layer } from "react-map-gl/mapbox";
import type { LineLayer, CircleLayer } from "react-map-gl/mapbox";
import { ArrowLeft, Droplet, Play, RotateCcw } from "lucide-react";
import { useAppState } from "../../contexts/AppStateContext";
import { getMapToken, getMapStyle } from "../../lib/map";
import "mapbox-gl/dist/mapbox-gl.css";

function generateArc(
  from: readonly number[],
  to: readonly number[],
  numPoints = 80,
): number[][] {
  const points: number[][] = [];
  const midLng = (from[0] + to[0]) / 2;
  const midLat = (from[1] + to[1]) / 2;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const offset = Math.sqrt(dx * dx + dy * dy) * 0.3;
  const ctrl1Lng = midLng - dy * 0.3 - offset * 0.15;
  const ctrl1Lat = midLat + dx * 0.3 - offset * 0.1;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const u = 1 - t;
    const lng = u * u * from[0] + 2 * u * t * ctrl1Lng + t * t * to[0];
    const lat = u * u * from[1] + 2 * u * t * ctrl1Lat + t * t * to[1];
    points.push([lng, lat]);
  }
  return points;
}

const trajectoryLineLayer: LineLayer = {
  id: "trajectory-line",
  type: "line",
  paint: {
    "line-color": "#22d3ee",
    "line-width": 4,
    "line-opacity": 0.9,
  },
  layout: { "line-cap": "round", "line-join": "round" },
};

const trajectoryGlowLayer: LineLayer = {
  id: "trajectory-glow",
  type: "line",
  paint: {
    "line-color": "#67e8f9",
    "line-width": 14,
    "line-opacity": 0.25,
    "line-blur": 10,
  },
  layout: { "line-cap": "round", "line-join": "round" },
};

const trajectoryTrailLayer: LineLayer = {
  id: "trajectory-trail",
  type: "line",
  paint: {
    "line-color": "#06b6d4",
    "line-width": 6,
    "line-opacity": 0.5,
  },
  layout: { "line-cap": "round", "line-join": "round" },
};

const movingDotLayer: CircleLayer = {
  id: "moving-dot",
  type: "circle",
  paint: {
    "circle-radius": 8,
    "circle-color": "#22d3ee",
    "circle-opacity": 1,
    "circle-blur": 0.3,
  },
};

const movingDotGlowLayer: CircleLayer = {
  id: "moving-dot-glow",
  type: "circle",
  paint: {
    "circle-radius": 20,
    "circle-color": "#22d3ee",
    "circle-opacity": 0.3,
    "circle-blur": 1,
  },
};

export function BottleTrajectory() {
  const navigate = useNavigate();
  const { bottleTrajectory, loadBottleTrajectory, mapClientConfig, currentPosition } =
    useAppState();

  useEffect(() => {
    loadBottleTrajectory();
  }, []);

  const defaultLng = currentPosition.lng ?? 121.4737;
  const defaultLat = currentPosition.lat ?? 31.2304;
  const fromCoords: readonly [number, number] = bottleTrajectory
    ? [bottleTrajectory.from.lng, bottleTrajectory.from.lat]
    : [defaultLng, defaultLat];
  const toCoords: readonly [number, number] =
    bottleTrajectory?.to?.lng != null && bottleTrajectory?.to?.lat != null
      ? [bottleTrajectory.to.lng, bottleTrajectory.to.lat]
      : [defaultLng, defaultLat];

  const fromCity = bottleTrajectory?.from.city || "起点";
  const toCity = bottleTrajectory?.to?.city || "终点";

  const fullArcPoints = generateArc(fromCoords, toCoords);

  const centerLng = (fromCoords[0] + toCoords[0]) / 2;
  const centerLat = (fromCoords[1] + toCoords[1]) / 2;

  const [viewState] = useState({
    longitude: centerLng,
    latitude: centerLat,
    zoom: 5.5,
  });

  const [animProgress, setAnimProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const [animatedDistance, setAnimatedDistance] = useState(0);
  const [animatedDays, setAnimatedDays] = useState(0);

  // Estimate distance from coordinates
  const dx = toCoords[0] - fromCoords[0];
  const dy = toCoords[1] - fromCoords[1];
  const totalDistance = Math.round(
    Math.sqrt(dx * dx + dy * dy) * 111,
  ); // rough km
  const totalDays = Math.max(1, Math.round(totalDistance / 100));

  const startAnimation = useCallback(() => {
    setAnimProgress(0);
    setIsAnimating(true);
    setHasPlayed(true);
    setAnimatedDistance(0);
    setAnimatedDays(0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => startAnimation(), 800);
    return () => clearTimeout(timer);
  }, [startAnimation]);

  useEffect(() => {
    if (!isAnimating) return;
    const timer = setInterval(() => {
      setAnimProgress((prev) => {
        if (prev >= 1) {
          setIsAnimating(false);
          return 1;
        }
        return prev + 0.008;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [isAnimating]);

  useEffect(() => {
    setAnimatedDistance(Math.round(animProgress * totalDistance));
    setAnimatedDays(Math.round(animProgress * totalDays));
  }, [animProgress, totalDistance, totalDays]);

  const currentPointCount = Math.max(
    2,
    Math.floor(animProgress * fullArcPoints.length),
  );
  const visiblePoints = fullArcPoints.slice(0, currentPointCount);

  const trajectoryData = {
    type: "Feature" as const,
    geometry: {
      type: "LineString" as const,
      coordinates: visiblePoints,
    },
    properties: {},
  };

  const currentPos = visiblePoints[visiblePoints.length - 1];
  const movingDotData = {
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: currentPos,
    },
    properties: {},
  };

  const token = getMapToken(mapClientConfig);

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      <div className="flex-1 relative">
        {token ? (
          <Map
            {...viewState}
            mapStyle={getMapStyle(mapClientConfig)}
            mapboxAccessToken={token}
            style={{ width: "100%", height: "100%" }}
          >
            <Source
              id="trajectory-source"
              type="geojson"
              data={trajectoryData}
            >
              <Layer {...trajectoryGlowLayer} />
              <Layer {...trajectoryTrailLayer} />
              <Layer {...trajectoryLineLayer} />
            </Source>

            {isAnimating && (
              <Source id="dot-source" type="geojson" data={movingDotData}>
                <Layer {...movingDotGlowLayer} />
                <Layer {...movingDotLayer} />
              </Source>
            )}

            <Marker longitude={fromCoords[0]} latitude={fromCoords[1]}>
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-2 bg-cyan-400/30 rounded-full blur-lg animate-pulse" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="mt-2 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg shadow-lg">
                  <span className="text-[10px] text-cyan-600 font-medium">
                    {fromCity} · 投放
                  </span>
                </div>
              </div>
            </Marker>

            {animProgress >= 0.95 && (
              <Marker longitude={toCoords[0]} latitude={toCoords[1]}>
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-orange-400/30 rounded-full blur-lg animate-pulse" />
                    <div className="relative w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
                      <Droplet className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-2 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg shadow-lg">
                    <span className="text-[10px] text-orange-600 font-medium">
                      {toCity} · 拾取
                    </span>
                  </div>
                </div>
              </Marker>
            )}
          </Map>
        ) : (
          <div className="w-full h-full bg-[#e5e1db] flex items-center justify-center">
            <p className="text-sm text-[#8a7a6a]">地图加载中...</p>
          </div>
        )}

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#f8f6f3] to-transparent pt-6 pb-8 px-5">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
            </button>
            <span className="text-base text-[#3a2a1a]">漂流轨迹</span>
            <button
              onClick={startAnimation}
              className="p-1"
              disabled={isAnimating}
            >
              {isAnimating ? (
                <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <RotateCcw className="w-5 h-5 text-[#5a4a3a]" />
              )}
            </button>
          </div>
        </div>

        {/* Animated Info Card */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5">
          <div className="text-center mb-4">
            <h3 className="text-base text-[#3a2a1a] mb-1">
              它从这里漂到了这里
            </h3>
            <p className="text-xs text-[#8a7a6a]">
              {totalDistance > 500
                ? `跨越了${totalDistance}公里的海岸线`
                : totalDistance > 0
                ? `漂流了${totalDistance}公里`
                : "漂流轨迹加载中..."}
            </p>
          </div>

          <div className="mb-4">
            <div className="h-1.5 bg-cyan-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-100"
                style={{ width: `${animProgress * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-cyan-600">{fromCity}</span>
              <span className="text-[10px] text-orange-600">{toCity}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cyan-50 rounded-xl p-3 text-center">
              <div className="text-xl text-cyan-600 font-bold mb-0.5 tabular-nums">
                {animatedDistance.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#8a7a6a]">公里</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-xl text-blue-600 font-bold mb-0.5 tabular-nums">
                {animatedDays}
              </div>
              <div className="text-[10px] text-[#8a7a6a]">天</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-xl text-purple-600 font-bold mb-0.5 tabular-nums">
                {Math.round(animProgress * 100)}%
              </div>
              <div className="text-[10px] text-[#8a7a6a]">旅程</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#e5e1db]">
            <p className="text-xs text-center text-[#b5a595] leading-relaxed italic">
              {animProgress < 1
                ? "「瓶子正在海面上漂流……」"
                : "「命运让它在这片海边遇见了你」"}
            </p>
          </div>

          {!isAnimating && hasPlayed && animProgress >= 1 && (
            <button
              onClick={startAnimation}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-cyan-50 rounded-xl text-xs text-cyan-600 hover:bg-cyan-100 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              重新播放漂流动画
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
