import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Map, { Marker, Source, Layer } from "react-map-gl/mapbox";
import type { LineLayer } from "react-map-gl/mapbox";
import {
  MapPin,
  ArrowRight,
  Train,
  Bike,
  Footprints,
  Plane,
} from "lucide-react";
import { BackToHomeButton } from "../components/BackToHomeButton";
import { useAppState } from "../contexts/AppStateContext";
import { getMapToken, getMapStyle } from "../lib/map";
import "mapbox-gl/dist/mapbox-gl.css";

const lineLayer: LineLayer = {
  id: "route",
  type: "line",
  paint: {
    "line-color": "#fb923c",
    "line-width": 3,
    "line-opacity": 0.8,
  },
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
};

const transportIcons: Record<string, any> = {
  walk: Footprints,
  metro: Train,
  bike: Bike,
  plane: Plane,
};

const transportColors: Record<string, string> = {
  walk: "#10b981",
  metro: "#3b82f6",
  bike: "#f59e0b",
  plane: "#8b5cf6",
};

export function RecordingResults() {
  const navigate = useNavigate();
  const { travel, travelAnchors, travelLocations, mapClientConfig } =
    useAppState();

  const coords = travelLocations.map((loc) => [loc.lng, loc.lat]);
  const routeData = {
    type: "Feature" as const,
    geometry: {
      type: "LineString" as const,
      coordinates: coords.length >= 2 ? coords : [[121.475, 31.23]],
    },
    properties: {},
  };

  // Calculate center from locations
  const centerLng =
    coords.length > 0
      ? coords.reduce((s, c) => s + c[0], 0) / coords.length
      : 121.475;
  const centerLat =
    coords.length > 0
      ? coords.reduce((s, c) => s + c[1], 0) / coords.length
      : 31.23;

  const [viewState] = useState({
    longitude: centerLng,
    latitude: centerLat,
    zoom: 13,
    pitch: 45,
    bearing: -10,
  });

  const anchorCount = travelAnchors.length;
  const startTime = travel?.start_time
    ? new Date(travel.start_time)
    : null;
  const endTime = travel?.end_time ? new Date(travel.end_time) : null;
  const durationHours =
    startTime && endTime
      ? Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60),
        )
      : null;
  const photoCount = travelAnchors.filter((a) => a.photo_url).length;
  const token = getMapToken(mapClientConfig);

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative">
        {token ? (
          <Map
            {...viewState}
            mapStyle={getMapStyle(mapClientConfig)}
            mapboxAccessToken={token}
            style={{ width: "100%", height: "100%" }}
          >
            <>
              {coords.length >= 2 && (
                <Source id="route-source" type="geojson" data={routeData}>
                  <Layer {...lineLayer} />
                </Source>
              )}
              {travelAnchors.map((anchor, idx) => (
                <Marker
                  key={anchor.id || idx}
                  longitude={anchor.lng}
                  latitude={anchor.lat}
                >
                  <button
                    onClick={() => navigate(`/anchor/${anchor.id || idx + 1}`)}
                    className="relative group"
                  >
                    <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white shadow-lg" />
                  </button>
                </Marker>
              ))}
            </>
          </Map>
        ) : (
          <div className="w-full h-full bg-[#e5e1db] flex items-center justify-center">
            <p className="text-sm text-[#8a7a6a]">地图加载中...</p>
          </div>
        )}

        {/* Back to Home Button */}
        <div className="absolute top-6 left-5 z-10">
          <BackToHomeButton />
        </div>

        {/* Top Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-6">
          <div className="text-white text-center">
            <div className="text-lg mb-1">旅行已结束</div>
            <div className="text-sm text-white/80">查看你的原始记录</div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="absolute top-28 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-[#8a7a6a] mb-1">锚点</div>
              <div className="text-lg text-orange-500 font-medium">
                {anchorCount}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#8a7a6a] mb-1">时长</div>
              <div className="text-lg text-[#3a2a1a] font-medium">
                {durationHours ? `${durationHours}小时` : "--"}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#8a7a6a] mb-1">照片</div>
              <div className="text-lg text-[#3a2a1a] font-medium">
                {photoCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="bg-white border-t border-[#e5e1db] p-5">
        <div className="mb-4">
          <div className="text-sm text-[#3a2a1a] mb-2">原始记录已保存</div>
          <div className="text-xs text-[#8a7a6a] leading-relaxed">
            点击地图上的锚点查看详情，或使用 AI 一键归纳生成精美旅记
          </div>
        </div>
        <button
          onClick={() => navigate("/synthesis")}
          className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full shadow-lg flex items-center justify-center gap-2"
        >
          <span>一键归纳</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
