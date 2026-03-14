import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, MapPin } from "lucide-react";
import MapGL, { Marker } from "react-map-gl/mapbox";
import { useAppState } from "../../contexts/AppStateContext";
import { getMapToken, getMapStyle } from "../../lib/map";
import "mapbox-gl/dist/mapbox-gl.css";

// Well-known Chinese city approximate coordinates for map display
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "北京": { lat: 39.9042, lng: 116.4074 },
  "上海": { lat: 31.2304, lng: 121.4737 },
  "广州": { lat: 23.1291, lng: 113.2644 },
  "深圳": { lat: 22.5431, lng: 114.0579 },
  "杭州": { lat: 30.2741, lng: 120.1551 },
  "成都": { lat: 30.5728, lng: 104.0668 },
  "重庆": { lat: 29.4316, lng: 106.9123 },
  "南京": { lat: 32.0603, lng: 118.7969 },
  "武汉": { lat: 30.5928, lng: 114.3055 },
  "西安": { lat: 34.3416, lng: 108.9398 },
  "苏州": { lat: 31.2990, lng: 120.5853 },
  "长沙": { lat: 28.2282, lng: 112.9388 },
  "天津": { lat: 39.3434, lng: 117.3616 },
  "厦门": { lat: 24.4798, lng: 118.0894 },
  "青岛": { lat: 36.0671, lng: 120.3826 },
  "大连": { lat: 38.9140, lng: 121.6147 },
  "昆明": { lat: 25.0389, lng: 102.7183 },
  "三亚": { lat: 18.2528, lng: 109.5120 },
  "丽江": { lat: 26.8721, lng: 100.2299 },
  "拉萨": { lat: 29.6500, lng: 91.1000 },
};

export function CityFootprint() {
  const navigate = useNavigate();
  const { travelHistory, mapClientConfig, loadTravelHistory } = useAppState();

  useEffect(() => {
    loadTravelHistory().catch(() => undefined);
  }, [loadTravelHistory]);

  // Extract unique cities with visit counts
  const cityData = useMemo(() => {
    const cityMap = new Map<string, number>();
    for (const t of travelHistory) {
      if (t.city) {
        cityMap.set(t.city, (cityMap.get(t.city) || 0) + 1);
      }
    }
    return Array.from(cityMap.entries()).map(([city, count]) => ({
      city,
      count,
      coords: CITY_COORDS[city] || null,
    }));
  }, [travelHistory]);

  const citiesWithCoords = cityData.filter((c) => c.coords);

  const centerLng =
    citiesWithCoords.length > 0
      ? citiesWithCoords.reduce((s, c) => s + c.coords!.lng, 0) / citiesWithCoords.length
      : 116.4;
  const centerLat =
    citiesWithCoords.length > 0
      ? citiesWithCoords.reduce((s, c) => s + c.coords!.lat, 0) / citiesWithCoords.length
      : 35.0;

  const token = getMapToken(mapClientConfig);

  const [viewState] = useState({
    longitude: centerLng,
    latitude: centerLat,
    zoom: citiesWithCoords.length <= 1 ? 10 : 4,
    pitch: 0,
    bearing: 0,
  });

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e1db]">
        <div className="flex items-center gap-3 px-5 py-4">
          <button onClick={() => navigate("/profile")}>
            <ChevronLeft className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <span className="text-base text-[#3a2a1a]">城市足迹</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-[#e5e1db] px-5 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-[#3a2a1a]">
              已到访 <span className="text-orange-500 font-semibold">{cityData.length}</span> 座城市
            </span>
          </div>
          <div className="text-xs text-[#8a7a6a]">
            共 {travelHistory.filter((t) => t.status === "ended" || t.status === "completed").length} 次旅行
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {token && citiesWithCoords.length > 0 ? (
          <MapGL
            {...viewState}
            mapStyle={getMapStyle(mapClientConfig)}
            mapboxAccessToken={token}
            style={{ width: "100%", height: "100%" }}
            interactive={true}
          >
            {citiesWithCoords.map((city) => (
              <Marker
                key={city.city}
                longitude={city.coords!.lng}
                latitude={city.coords!.lat}
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-xs text-white font-bold">{city.count}</span>
                  </div>
                  <div className="mt-1 bg-white/95 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[10px] text-[#3a2a1a] shadow-sm whitespace-nowrap">
                    {city.city}
                  </div>
                </div>
              </Marker>
            ))}
          </MapGL>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-orange-300 mx-auto mb-3" />
              <div className="text-sm text-[#8a7a6a]">
                {cityData.length === 0 ? "还没有旅行足迹" : "地图加载中..."}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* City List */}
      {cityData.length > 0 && (
        <div className="bg-white border-t border-[#e5e1db] max-h-[30vh] overflow-y-auto">
          <div className="px-5 py-3 text-xs text-[#8a7a6a] border-b border-[#f0ece6]">到访城市</div>
          {cityData.map((city) => (
            <div
              key={city.city}
              className="flex items-center justify-between px-5 py-3 border-b border-[#f0ece6] last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-sm text-[#3a2a1a]">{city.city}</span>
              </div>
              <span className="text-xs text-[#8a7a6a]">{city.count} 次旅行</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
