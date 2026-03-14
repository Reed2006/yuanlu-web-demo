import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Droplet, Image as ImageIcon, Loader2, X } from "lucide-react";
import { PulseButton } from "../../components/PulseButton";
import { useAppState } from "../../contexts/AppStateContext";

export function BottleSend() {
  const navigate = useNavigate();
  const { currentPosition, throwBottle, uploadFile } = useAppState();
  const [content, setContent] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "bottle", file.name);
      setImageUrl(url);
    } catch {
      // error is surfaced via AppState.error
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const hasLocation = currentPosition.lat !== null && currentPosition.lng !== null;

  const locationLabel = currentPosition.full_address
    || currentPosition.poi_name
    || currentPosition.city
    || null;

  const handleThrow = async () => {
    if (!content.trim() || !hasLocation || submitting) return;
    setSubmitting(true);
    try {
      let body = content;
      if (note) body += `\n\n附言：${note}`;
      if (imageUrl) body += `\n\n[图片] ${imageUrl}`;
      await throwBottle({
        content: body,
        lat: currentPosition.lat!,
        lng: currentPosition.lng!,
      });
      navigate("/yuan");
    } catch {
      // error is surfaced via AppState.error; stay on page so user can retry
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-gradient-to-b from-cyan-50 to-blue-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-cyan-100">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => navigate("/yuan")}>
            <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <span className="text-base text-[#3a2a1a]">投放远洋瓶</span>
          <div className="w-5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Location */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-[#8a7a6a] mb-1">
            <MapPin className="w-4 h-4" />
            {hasLocation ? (
              <span>{locationLabel || `${currentPosition.lat}, ${currentPosition.lng}`}</span>
            ) : (
              <span className="text-amber-600">定位中...</span>
            )}
          </div>
          {currentPosition.is_seaside && (
            <p className="text-xs text-cyan-600 leading-relaxed ml-6 flex items-center gap-1">
              <Droplet className="w-3 h-3" />
              你正位于海边
            </p>
          )}
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
            <Droplet className="w-12 h-12 text-cyan-500" />
          </div>
        </div>

        {/* Description */}
        <div className="text-center mb-8">
          <h2 className="text-lg text-[#3a2a1a] mb-2">把一段话交给远方</h2>
          <p className="text-sm text-[#8a7a6a] leading-relaxed">
            也许它会在另一片海边被谁拾起
          </p>
        </div>

        {/* Content Input */}
        <div className="mb-4">
          <div className="text-xs text-[#8a7a6a] mb-2">正文</div>
          <textarea
            placeholder="写下你想对远方说的话..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-40 px-4 py-3 text-sm text-[#3a2a1a] placeholder:text-[#b5a595] bg-white/80 border border-cyan-200 rounded-xl outline-none resize-none focus:border-cyan-400"
          />
        </div>

        {/* Note Input */}
        <div className="mb-4">
          <div className="text-xs text-[#8a7a6a] mb-2">附言（可选）</div>
          <input
            type="text"
            placeholder="一句简短的附言..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 text-sm text-[#3a2a1a] placeholder:text-[#b5a595] bg-white/80 border border-cyan-200 rounded-xl outline-none focus:border-cyan-400"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <div className="text-xs text-[#8a7a6a] mb-2">添加图片（可选）</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}
            onChange={handleImageSelect}
          />
          {imageUrl ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-cyan-200">
              <img src={imageUrl} alt="已上传" className="w-full h-full object-cover" />
              <button
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full aspect-video border-2 border-dashed border-cyan-200 rounded-xl flex flex-col items-center justify-center gap-2 text-cyan-400 bg-white/50 hover:border-cyan-400 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs">上传中...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-xs">添加一张图片</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-cyan-100/50 border border-cyan-200 rounded-xl p-4">
          <p className="text-xs text-cyan-700 leading-relaxed text-center italic">
            「远洋瓶会随机漂向世界各地的海边，不知道它会在何时、何地被谁拾起」
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-cyan-100 p-5">
        <PulseButton
          onClick={handleThrow}
          variant="primary"
          size="lg"
          className="w-full bg-gradient-to-r from-cyan-400 to-blue-400"
          glowColor="34, 211, 238"
          disabled={content.trim().length === 0 || !hasLocation || submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              投放中...
            </span>
          ) : (
            "扔出远洋瓶"
          )}
        </PulseButton>
      </div>
    </div>
  );
}
