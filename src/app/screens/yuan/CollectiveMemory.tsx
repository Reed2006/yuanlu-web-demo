import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Map, { Marker, Source, Layer } from "react-map-gl/mapbox";
import type { HeatmapLayer } from "react-map-gl/mapbox";
import { ArrowLeft, Users, Info } from "lucide-react";
import { useAppState } from "../../contexts/AppStateContext";
import { getMapToken, getMapStyle } from "../../lib/map";
import "mapbox-gl/dist/mapbox-gl.css";

const heatmapLayer: HeatmapLayer = {
  id: "heatmap",
  type: "heatmap",
  paint: {
    "heatmap-weight": ["get", "intensity"],
    "heatmap-intensity": 0.6,
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(251, 146, 60, 0)",
      0.2,
      "rgba(251, 191, 36, 0.3)",
      0.4,
      "rgba(251, 146, 60, 0.5)",
      0.6,
      "rgba(249, 115, 22, 0.7)",
      0.8,
      "rgba(234, 88, 12, 0.8)",
      1,
      "rgba(194, 65, 12, 0.9)",
    ],
    "heatmap-radius": 60,
    "heatmap-opacity": 0.7,
  },
};

export function CollectiveMemory() {
  const navigate = useNavigate();
  const { collectiveMemory, loadCollectiveMemory, mapClientConfig } =
    useAppState();
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [viewState, setViewState] = useState({
    longitude: 116,
    latitude: 35,
    zoom: 4,
  });

  useEffect(() => {
    loadCollectiveMemory();
  }, []);

  const heatmapData = {
    type: "FeatureCollection" as const,
    features: (collectiveMemory?.features || []).map((f) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]],
      },
      properties: { intensity: f.properties.intensity },
    })),
  };

  const spots = collectiveMemory?.spots || [];
  const token = getMapToken(mapClientConfig);

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
            <>
              {heatmapData.features.length > 0 && (
                <Source
                  id="heatmap-source"
                  type="geojson"
                  data={heatmapData}
                >
                  <Layer {...heatmapLayer} />
                </Source>
              )}

              {spots.map((spot) => (
                <Marker
                  key={spot.id}
                  longitude={spot.lng}
                  latitude={spot.lat}
                >
                  <button
                    onClick={() => setSelectedSpot(spot)}
                    className="w-6 h-6 bg-amber-500/80 rounded-full border-2 border-white shadow-lg"
                  />
                </Marker>
              ))}
            </>
          </Map>
        ) : (
          <div className="w-full h-full bg-[#e5e1db] flex items-center justify-center">
            <p className="text-sm text-[#8a7a6a]">地图加载中...</p>
          </div>
        )}

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#f8f6f3] to-transparent pt-6 pb-8 px-5">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => navigate("/yuan")}>
              <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
            </button>
            <span className="text-base text-[#3a2a1a]">集体记忆层</span>
            <div className="w-5" />
          </div>
          <p className="text-xs text-[#8a7a6a] text-center leading-relaxed">
            匿名聚合的城市情感热力，显示真正有人驻足过的地方
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="absolute top-24 left-4 right-4">
          <div className="bg-amber-50/95 backdrop-blur-sm border border-amber-200 rounded-xl p-3">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                样本量 ≥ 10 才显示统计 · 严格匿名 · 不关联个人身份
              </p>
            </div>
          </div>
        </div>

        {/* Selected Spot Card */}
        {selectedSpot && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-5">
            <button
              onClick={() => setSelectedSpot(null)}
              className="absolute top-3 right-3 w-6 h-6 bg-[#f8f6f3] rounded-full flex items-center justify-center"
            >
              <span className="text-xs text-[#8a7a6a]">×</span>
            </button>

            <div className="mb-4">
              <h3 className="text-base text-[#3a2a1a] mb-1">
                {selectedSpot.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-[#8a7a6a]">
                <Users className="w-3.5 h-3.5" />
                <span>
                  这个地方让 {selectedSpot.count} 人驻足超过 10 分钟
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-[#8a7a6a] mb-2">情绪分布</div>
              {selectedSpot.emotions.map(
                (emotion: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-[#3a2a1a]">
                      {emotion.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-[#f8f6f3] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                          style={{
                            width: `${(emotion.count / selectedSpot.count) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#8a7a6a] w-8 text-right">
                        {emotion.count}次
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
