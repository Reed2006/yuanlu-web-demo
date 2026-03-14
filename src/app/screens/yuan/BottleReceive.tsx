import { useNavigate } from "react-router";
import Map, { Marker } from "react-map-gl/mapbox";
import { ArrowLeft, Droplet } from "lucide-react";
import { useAppState } from "../../contexts/AppStateContext";
import { getMapToken, getMapStyle } from "../../lib/map";
import "mapbox-gl/dist/mapbox-gl.css";

const floatingKeyframes = `
@keyframes floating {
  0%, 100% { transform: translateY(0px) rotate(-5deg); }
  50% { transform: translateY(-12px) rotate(5deg); }
}
@keyframes ripple {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}
`;

export function BottleReceive() {
  const navigate = useNavigate();
  const { bottleTrajectory, mapClientConfig, currentPosition } = useAppState();

  const lng =
    bottleTrajectory?.to?.lng ?? bottleTrajectory?.from?.lng ?? currentPosition.lng ?? 121.4737;
  const lat =
    bottleTrajectory?.to?.lat ?? bottleTrajectory?.from?.lat ?? currentPosition.lat ?? 31.2304;
  const city = bottleTrajectory?.to?.city || bottleTrajectory?.from?.city || "";

  const token = getMapToken(mapClientConfig);

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      <style>{floatingKeyframes}</style>

      {/* Header */}
      <div className="relative z-10 pt-6 pb-3 px-5">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <span className="text-base text-[#3a2a1a]">收到漂流瓶</span>
          <div className="w-5" />
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        {token ? (
          <Map
            longitude={lng}
            latitude={lat}
            zoom={13}
            mapStyle={getMapStyle(mapClientConfig)}
            mapboxAccessToken={token}
            style={{ width: "100%", height: "100%" }}
          >
            <Marker longitude={lng} latitude={lat}>
              <div className="flex flex-col items-center">
                <div
                  className="relative"
                  style={{
                    animation: "floating 3s ease-in-out infinite",
                  }}
                >
                  <div
                    className="absolute -inset-4 bg-cyan-400/20 rounded-full"
                    style={{ animation: "ripple 2s ease-out infinite" }}
                  />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
                    <Droplet className="w-6 h-6 text-white" />
                  </div>
                </div>
                {city && (
                  <div className="mt-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-lg shadow-lg">
                    <span className="text-xs text-cyan-600 font-medium">
                      {city}
                    </span>
                  </div>
                )}
              </div>
            </Marker>
          </Map>
        ) : (
          <div className="w-full h-full bg-[#e5e1db] flex items-center justify-center">
            <p className="text-sm text-[#8a7a6a]">地图加载中...</p>
          </div>
        )}

        {/* Info Card */}
        <div className="absolute bottom-6 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 text-center">
          <div className="text-2xl mb-2">🍶</div>
          <h3 className="text-base text-[#3a2a1a] mb-1">
            一个漂流瓶漂到了你面前
          </h3>
          <p className="text-xs text-[#8a7a6a] mb-4">它已在海面上漂流许久</p>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            打开漂流瓶
          </button>
        </div>
      </div>
    </div>
  );
}
