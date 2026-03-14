import { useNavigate } from "react-router";
import { ArrowLeft, Droplet, MapPin } from "lucide-react";
import { PulseButton } from "../../components/PulseButton";
import { useAppState } from "../../contexts/AppStateContext";

export function BottleContent() {
  const navigate = useNavigate();
  const { bottle, bottleTrajectory } = useAppState();

  // Derive bottle content from state
  const content = bottle?.content || bottleTrajectory?.from?.city || null;
  const fromCity = bottle?.from?.city || bottleTrajectory?.from?.city || null;
  const toCity = bottleTrajectory?.to?.city || null;

  // Compute distance/duration from trajectory if available
  const distanceInfo = (() => {
    if (!bottleTrajectory?.from || !bottleTrajectory?.to?.lat || !bottleTrajectory?.to?.lng) return null;
    const R = 6371; // km
    const dLat = ((bottleTrajectory.to.lat - bottleTrajectory.from.lat) * Math.PI) / 180;
    const dLng = ((bottleTrajectory.to.lng - bottleTrajectory.from.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((bottleTrajectory.from.lat * Math.PI) / 180) *
        Math.cos((bottleTrajectory.to.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  })();

  // Extract note from content (looks for "附言：" pattern)
  const { body, note, imageUrl } = (() => {
    if (!content) return { body: null, note: null, imageUrl: null };
    let mainBody = content;
    let extractedNote: string | null = null;
    let extractedImage: string | null = null;

    const noteMatch = mainBody.match(/\n\n附言：(.+)/);
    if (noteMatch) {
      extractedNote = noteMatch[1];
      mainBody = mainBody.replace(noteMatch[0], "");
    }

    const imageMatch = mainBody.match(/\n\n\[图片\]\s*(\S+)/);
    if (imageMatch) {
      extractedImage = imageMatch[1];
      mainBody = mainBody.replace(imageMatch[0], "");
    }

    return { body: mainBody, note: extractedNote, imageUrl: extractedImage };
  })();

  const locationLabel = (() => {
    const parts: string[] = [];
    if (fromCity) parts.push(fromCity);
    if (!fromCity) parts.push("未知来源");
    return `投放于：${parts.join(" / ")}`;
  })();

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-gradient-to-b from-cyan-50 to-blue-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-cyan-100">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <span className="text-base text-[#3a2a1a]">远洋瓶</span>
          <div className="w-5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Header Info */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 rounded-full mb-3">
            <Droplet className="w-4 h-4 text-cyan-600" />
            <span className="text-xs text-cyan-600">来自远方的陌生人</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-[#8a7a6a]">
            <MapPin className="w-3 h-3" />
            <span>{locationLabel}</span>
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
            <Droplet className="w-10 h-10 text-cyan-500" />
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
          {body ? (
            <p className="text-sm text-[#3a2a1a] leading-loose whitespace-pre-line">
              {body}
            </p>
          ) : (
            <p className="text-sm text-[#b5a595] italic text-center">
              这个瓶子里是空的…也许沉默也是一种表达
            </p>
          )}
        </div>

        {/* Note */}
        {note && (
          <div className="bg-cyan-100/50 border border-cyan-200 rounded-xl p-4 mb-4">
            <div className="text-xs text-cyan-600 mb-1">附言</div>
            <p className="text-sm text-cyan-700 italic">{note}</p>
          </div>
        )}

        {/* Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="远洋瓶附图"
            className="w-full rounded-2xl aspect-video object-cover mb-4"
          />
        ) : null}

        {/* Journey Info */}
        <div className="text-center">
          <button
            onClick={() => navigate("/yuan/bottle-trajectory")}
            className="text-xs text-cyan-600 hover:text-cyan-700 underline"
          >
            查看漂流轨迹
          </button>
          {distanceInfo !== null && (
            <p className="text-xs text-[#b5a595] mt-2">
              这个瓶子漂流了约 {distanceInfo.toLocaleString()} 公里
              {toCity ? ` · 到达${toCity}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-cyan-100 p-5">
        <PulseButton
          onClick={() => navigate("/yuan")}
          variant="primary"
          size="lg"
          className="w-full bg-gradient-to-r from-cyan-400 to-blue-400"
          glowColor="34, 211, 238"
        >
          返回缘界
        </PulseButton>
      </div>
    </div>
  );
}
