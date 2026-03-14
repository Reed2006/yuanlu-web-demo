import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import Map, { Marker, Source, Layer } from "react-map-gl/mapbox";
import type { LineLayer } from "react-map-gl/mapbox";
import { Download, Share2, MapPin, Lock, FileText, Loader2, Check, Palette, X, AlertCircle } from "lucide-react";
import html2canvas from "html2canvas";
import { BackToHomeButton } from "../components/BackToHomeButton";
import { useAppState } from "../contexts/AppStateContext";
import { getMapToken, getMapStyle } from "../lib/map";
import "mapbox-gl/dist/mapbox-gl.css";

const lineLayer: LineLayer = {
  id: "route",
  type: "line",
  paint: {
    "line-color": "#fb923c",
    "line-width": 4,
    "line-opacity": 0.8,
  },
};

export function TravelExport() {
  const navigate = useNavigate();
  const { travel, travelAnchors, travelLocations, mapClientConfig, cartoonify, currentPosition, startExport, pollExportTask, apiBase } =
    useAppState();
  const [selectedExport, setSelectedExport] = useState<
    "map" | "journal" | null
  >(null);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Cartoonify state
  const [cartoonifyOpen, setCartoonifyOpen] = useState(false);
  const [cartoonifyStyle, setCartoonifyStyle] = useState("cartoon");
  const [cartoonifyingIdx, setCartoonifyingIdx] = useState<number | null>(null);
  const [cartoonResults, setCartoonResults] = useState<Record<number, string[]>>({});

  const photosWithAnchors = travelAnchors
    .map((a, idx) => ({ idx, anchor: a }))
    .filter((item) => item.anchor.photo_url);

  const handleCartoonify = async (anchorIdx: number, photoUrl: string) => {
    if (cartoonifyingIdx !== null) return;
    setCartoonifyingIdx(anchorIdx);
    try {
      const urls = await cartoonify(photoUrl, cartoonifyStyle);
      setCartoonResults((prev) => ({ ...prev, [anchorIdx]: urls }));
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "照片风格化失败，请稍后重试");
      setTimeout(() => setExportError(null), 4000);
    } finally {
      setCartoonifyingIdx(null);
    }
  };

  const mapCardRef = useRef<HTMLDivElement>(null);
  const journalCardRef = useRef<HTMLDivElement>(null);

  const getSelectedRef = () => {
    if (selectedExport === "map") return mapCardRef;
    if (selectedExport === "journal") return journalCardRef;
    return null;
  };

  const captureImage = useCallback(async (): Promise<Blob | null> => {
    const ref = getSelectedRef();
    if (!ref?.current) return null;
    const canvas = await html2canvas(ref.current, {
      useCORS: true,
      scale: 2,
      backgroundColor: "#f8f6f3",
    });
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }, [selectedExport]);

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    if (!selectedExport || exporting) return;
    setExporting(true);
    setExportError(null);
    const exportType = selectedExport === "journal" ? "notebook" : "map";
    try {
      // Try backend export API first
      const task = await startExport(exportType);
      if (task?.task_id) {
        // Poll until done (max 30s)
        let result = task;
        for (let i = 0; i < 15; i++) {
          if (result.status === "done" || result.status === "completed") break;
          if (result.status === "failed" || result.status === "error") throw new Error("导出任务失败");
          await new Promise((r) => setTimeout(r, 2000));
          const polled = await pollExportTask(result.task_id);
          if (polled) result = polled;
        }
        if (result.result_url) {
          const filename = `${title.replace(/\s/g, "_")}_${selectedExport}.png`;
          // Resolve the URL: relative paths need the API base prepended
          let downloadUrl = result.result_url;
          if (downloadUrl.startsWith("/")) {
            downloadUrl = `${apiBase.replace(/\/$/, "")}${downloadUrl}`;
          }
          if (downloadUrl.startsWith("data:")) {
            // Mock mode: data URI
            triggerDownload(downloadUrl, filename);
          } else {
            // Real URL: fetch as blob to trigger download
            try {
              const resp = await fetch(downloadUrl);
              const blob = await resp.blob();
              triggerDownload(URL.createObjectURL(blob), filename);
            } catch {
              // Fallback: open URL directly
              window.open(downloadUrl, "_blank");
            }
          }
          setExported(true);
          setTimeout(() => setExported(false), 2000);
          return;
        }
      }
      // Fallback: html2canvas
      throw new Error("fallback");
    } catch (err) {
      // Fallback to html2canvas
      try {
        const blob = await captureImage();
        if (!blob) throw new Error("截图失败");
        triggerDownload(URL.createObjectURL(blob), `${title.replace(/\s/g, "_")}_${selectedExport}.png`);
        setExported(true);
        setTimeout(() => setExported(false), 2000);
      } catch {
        const msg = err instanceof Error && err.message !== "fallback" ? err.message : "导出失败，请稍后重试";
        setExportError(msg);
        setTimeout(() => setExportError(null), 4000);
      }
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!selectedExport || exporting) return;
    setExporting(true);
    try {
      const blob = await captureImage();
      if (!blob) throw new Error("renders fail");
      const file = new File([blob], `${title}.png`, { type: "image/png" });
      if (navigator.share) {
        await navigator.share({
          title,
          text: `${title} - ${dateStr}`,
          files: [file],
        });
      } else {
        // Fallback: download the file
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      setExported(true);
      setTimeout(() => setExported(false), 2000);
    } catch {
      // user cancelled share or error
    } finally {
      setExporting(false);
    }
  };

  const defaultLng = currentPosition.lng ?? 121.4737;
  const defaultLat = currentPosition.lat ?? 31.2304;
  const coords = travelLocations.map((loc) => [loc.lng, loc.lat]);
  const routeData = {
    type: "Feature" as const,
    geometry: {
      type: "LineString" as const,
      coordinates: coords.length >= 2 ? coords : [[defaultLng, defaultLat]],
    },
    properties: {},
  };

  const centerLng =
    coords.length > 0
      ? coords.reduce((s, c) => s + c[0], 0) / coords.length
      : defaultLng;
  const centerLat =
    coords.length > 0
      ? coords.reduce((s, c) => s + c[1], 0) / coords.length
      : defaultLat;

  const [viewState] = useState({
    longitude: centerLng,
    latitude: centerLat,
    zoom: 12,
    pitch: 0,
    bearing: 0,
  });

  const title = travel?.city ? `${travel.city}之旅` : "旅行记录";
  const startDate = travel?.start_time
    ? new Date(travel.start_time)
    : null;
  const endDate = travel?.end_time ? new Date(travel.end_time) : null;
  const dateStr = startDate
    ? startDate.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const durationHours =
    startDate && endDate
      ? Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
        )
      : null;
  const locationCount = travelLocations.length;
  const photoCount = travelAnchors.filter((a) => a.photo_url).length;
  const token = getMapToken(mapClientConfig);

  const markers = travelAnchors.filter((a) => a.lat && a.lng);

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e1db]">
        <div className="flex items-center justify-between px-5 py-4">
          <BackToHomeButton />
          <span className="text-base text-[#3a2a1a]">导出旅迹</span>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-4">
          <div className="text-sm text-[#3a2a1a] mb-1">选择导出方式</div>
          <div className="text-xs text-[#8a7a6a]">
            将你的旅行记忆制作成精美作品
          </div>
        </div>

        {/* Export Option 1: Map Visualization */}
        <div
          ref={mapCardRef}
          onClick={() => setSelectedExport("map")}
          className={`mb-4 rounded-2xl overflow-hidden cursor-pointer transition-all ${
            selectedExport === "map"
              ? "ring-2 ring-orange-500 ring-offset-2"
              : ""
          }`}
        >
          <div className="relative aspect-[4/5] bg-white">
            {token ? (
              <Map
                {...viewState}
                mapStyle={getMapStyle(mapClientConfig)}
                mapboxAccessToken={token}
                style={{ width: "100%", height: "100%" }}
                interactive={false}
              >
                <>
                  {coords.length >= 2 && (
                    <Source id="route-source" type="geojson" data={routeData}>
                      <Layer {...lineLayer} />
                    </Source>
                  )}
                  {markers.slice(0, 5).map((anchor, idx) => (
                    <Marker
                      key={idx}
                      longitude={anchor.lng}
                      latitude={anchor.lat}
                    >
                      <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-lg" />
                    </Marker>
                  ))}
                </>
              </Map>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-orange-300" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="text-xl mb-2">{title}</div>
              <div className="text-sm text-white/80 mb-3">
                {dateStr}
                {durationHours ? ` · ${durationHours}小时旅程` : ""}
              </div>
              <div className="flex items-center gap-4 text-xs text-white/70">
                <span>{locationCount}个地点</span>
                <span>{photoCount}张照片</span>
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-xs">
              <div className="flex items-center gap-2 text-[#5a4a3a]">
                <MapPin className="w-3 h-3 text-orange-500" />
                <span>地图可视化</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 border-t border-[#e5e1db]">
            <div className="text-sm text-[#3a2a1a] mb-1">地图可视化</div>
            <div className="text-xs text-[#8a7a6a] leading-relaxed">
              生成带有路线轨迹、锚点标记和AI配文的精美地图图片，适合分享到社交平台
            </div>
          </div>
        </div>

        {/* Export Option 2: Digital Journal */}
        <div
          ref={journalCardRef}
          onClick={() => setSelectedExport("journal")}
          className={`mb-4 rounded-2xl overflow-hidden cursor-pointer transition-all ${
            selectedExport === "journal"
              ? "ring-2 ring-orange-500 ring-offset-2"
              : ""
          }`}
        >
          <div className="relative aspect-[4/5] bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="absolute inset-0 p-6 flex flex-col">
              <div className="text-center mb-6">
                <div className="text-xl text-[#3a2a1a] mb-2">{title}</div>
                <div className="text-xs text-[#8a7a6a]">
                  {startDate
                    ? startDate
                        .toLocaleDateString("zh-CN")
                        .replace(/\//g, ".")
                    : ""}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {travelAnchors.filter(a => a.photo_url).slice(0, 2).length > 0 ? (
                  travelAnchors.filter(a => a.photo_url).slice(0, 2).map((anchor, idx) => (
                    <img key={idx} src={anchor.photo_url!} alt={anchor.poi_name || "旅行照片"} className="aspect-square rounded-xl object-cover" />
                  ))
                ) : (
                  <>
                    <div className="aspect-square bg-gradient-to-br from-orange-200 to-orange-300 rounded-xl" />
                    <div className="aspect-square bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl" />
                  </>
                )}
              </div>
              <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl p-4">
                <div className="text-xs text-[#5a4a3a] leading-relaxed">
                  {travelAnchors[0]?.ai_description ||
                    "旅行的故事，等待被书写..."}
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-xs">
              <div className="flex items-center gap-2 text-[#5a4a3a]">
                <FileText className="w-3 h-3 text-orange-500" />
                <span>电子手账</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 border-t border-[#e5e1db]">
            <div className="text-sm text-[#3a2a1a] mb-1">电子手账</div>
            <div className="text-xs text-[#8a7a6a] leading-relaxed">
              精美排版的照片和文字组合，支持照片风格化处理，打造专属旅行手账
            </div>
          </div>
        </div>

        {/* Photo Stylization (Cartoonify) */}
        {photosWithAnchors.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setCartoonifyOpen(!cartoonifyOpen)}
              className={`w-full rounded-2xl overflow-hidden transition-all ${
                cartoonifyOpen ? "ring-2 ring-purple-400 ring-offset-2" : ""
              }`}
            >
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm text-[#3a2a1a] mb-0.5">照片风格化</div>
                  <div className="text-xs text-[#8a7a6a]">
                    将旅行照片转换为漫画/水彩/素描等风格
                  </div>
                </div>
              </div>
            </button>

            {cartoonifyOpen && (
              <div className="bg-white rounded-b-2xl border border-t-0 border-[#e5e1db] p-4 -mt-1">
                {/* Style selector */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                  {[
                    { value: "cartoon", label: "漫画" },
                    { value: "watercolor", label: "水彩" },
                    { value: "sketch", label: "素描" },
                    { value: "oil_painting", label: "油画" },
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setCartoonifyStyle(s.value)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors ${
                        cartoonifyStyle === s.value
                          ? "bg-purple-400 text-white"
                          : "bg-purple-50 text-purple-600 border border-purple-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Photo grid */}
                <div className="grid grid-cols-2 gap-3">
                  {photosWithAnchors.map(({ idx, anchor }) => (
                    <div key={idx} className="relative">
                      <img
                        src={anchor.photo_url!}
                        alt={anchor.poi_name || "旅行照片"}
                        className="w-full aspect-square object-cover rounded-xl"
                      />
                      {cartoonResults[idx] ? (
                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                          <span className="text-white text-xs bg-green-500 px-2 py-1 rounded-full">已生成</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCartoonify(idx, anchor.photo_url!)}
                          disabled={cartoonifyingIdx !== null}
                          className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-xs text-purple-600 shadow-sm disabled:opacity-50"
                        >
                          {cartoonifyingIdx === idx ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              处理中
                            </span>
                          ) : (
                            "风格化"
                          )}
                        </button>
                      )}
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                        {anchor.poi_name || `照片${idx + 1}`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show results */}
                {Object.keys(cartoonResults).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#e5e1db]">
                    <div className="text-xs text-[#8a7a6a] mb-2">风格化结果</div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(cartoonResults).flatMap(([, urls]) =>
                        urls.map((url, i) => (
                          <img
                            key={`result-${i}-${url}`}
                            src={url}
                            alt="风格化照片"
                            className="w-full aspect-square object-cover rounded-xl border border-purple-200"
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Export Option 3: Vlog Video (Future) */}
        <div className="mb-6 rounded-2xl overflow-hidden opacity-60">
          <div className="relative aspect-[4/5] bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <div className="text-sm text-purple-600">Vlog 短视频</div>
              <div className="text-xs text-purple-400 mt-1">敬请期待</div>
            </div>
          </div>
          <div className="bg-white p-4 border-t border-[#e5e1db]">
            <div className="text-sm text-[#8a7a6a] mb-1">
              Vlog 短视频（未来版本）
            </div>
            <div className="text-xs text-[#8a7a6a] leading-relaxed">
              自动生成带有路径动画、照片切换和配乐的旅行视频
            </div>
          </div>
        </div>

        {/* Memory Replay Hint */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-indigo-700 mb-1">Memory Replay</div>
              <div className="text-xs text-[#5a4a3a] leading-relaxed">
                每逢旅行周年纪念日，Memory OS
                会自动回放当年的路线动画与日记片段，并生成个性化周年文案
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {exportError && (
        <div className="absolute top-20 left-4 right-4 z-50 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 shadow-lg animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700 flex-1">{exportError}</span>
          <button onClick={() => setExportError(null)}>
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white border-t border-[#e5e1db] p-5 space-y-2">
        <button
          onClick={handleDownload}
          disabled={!selectedExport || exporting}
          className={`w-full py-3.5 rounded-full shadow-lg flex items-center justify-center gap-2 ${
            selectedExport && !exporting
              ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          {exporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : exported ? (
            <Check className="w-5 h-5" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span>{exporting ? "生成中..." : exported ? "已保存" : "导出到相册"}</span>
        </button>
        <button
          onClick={handleShare}
          disabled={!selectedExport || exporting}
          className={`w-full py-2.5 rounded-full border flex items-center justify-center gap-2 ${
            selectedExport && !exporting
              ? "bg-white text-[#5a4a3a] border-[#e5e1db]"
              : "bg-gray-100 text-gray-400 border-gray-200"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>分享到社交平台</span>
        </button>
      </div>
    </div>
  );
}
