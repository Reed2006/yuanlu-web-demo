import { useEffect } from "react";
import { useNavigate } from "react-router";
import Map, { Marker } from "react-map-gl/mapbox";
import { Sparkles } from "lucide-react";
import { PulseButton } from "../../components/PulseButton";
import { useAppState } from "../../contexts/AppStateContext";
import { getMapToken, getMapStyle } from "../../lib/map";
import "mapbox-gl/dist/mapbox-gl.css";

export function CapsuleDiscovery() {
  const navigate = useNavigate();
  const { nearbyCapsules, loadNearbyCapsules, mapClientConfig, currentPosition } =
    useAppState();

  useEffect(() => {
    if (nearbyCapsules.length === 0) loadNearbyCapsules();
  }, []);

  const capsule = nearbyCapsules[0];
  const lng = capsule?.lng ?? currentPosition.lng ?? 121.4737;
  const lat = capsule?.lat ?? currentPosition.lat ?? 31.2304;
  const distance = capsule ? Math.round(capsule.distance_m) : null;
  const token = getMapToken(mapClientConfig);

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden relative">
      {/* Map Background */}
      {token ? (
        <Map
          longitude={lng}
          latitude={lat}
          zoom={14}
          mapStyle={getMapStyle(mapClientConfig)}
          mapboxAccessToken={token}
          style={{ width: "100%", height: "100%" }}
        >
          <Marker longitude={lng} latitude={lat}>
            <div className="relative">
              <div
                className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full animate-pulse"
                style={{
                  boxShadow:
                    "0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(251, 146, 60, 0.4)",
                }}
              />
              <div className="absolute inset-0 bg-amber-300/30 rounded-full blur-lg animate-pulse" />
            </div>
          </Marker>
        </Map>
      ) : (
        <div className="w-full h-full bg-[#e5e1db] flex items-center justify-center">
          <p className="text-sm text-[#8a7a6a]">地图加载中...</p>
        </div>
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f8f6f3]/80 pointer-events-none" />

      {/* Discovery Card */}
      <div className="absolute inset-x-4 bottom-4 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-amber-500" />
          </div>

          <h2 className="text-lg text-[#3a2a1a] mb-2">发现时空胶囊</h2>

          <p className="text-sm text-[#8a7a6a] leading-relaxed mb-1">
            在这附近，有人留下了一段缘记
          </p>
          <p className="text-xs text-[#b5a595] leading-relaxed mb-6">
            {distance != null ? (
              <>
                距离约{" "}
                <span className="text-amber-500 font-medium">
                  {distance}米
                </span>
              </>
            ) : (
              "距离计算中..."
            )}
          </p>

          <div className="w-full space-y-3">
            <PulseButton
              onClick={() => navigate("/yuan/capsule-ar-search")}
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-amber-400 to-orange-400"
              glowColor="251, 146, 60"
            >
              去寻找
            </PulseButton>
            <button
              onClick={() => navigate("/yuan")}
              className="w-full py-3 text-sm text-[#8a7a6a] hover:text-[#5a4a3a] transition-colors"
            >
              稍后再看
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
