import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PulseButton } from "../../components/PulseButton";
import { useAppState } from "../../contexts/AppStateContext";

export function CapsuleEcho() {
  const navigate = useNavigate();
  const { currentCapsule, createCapsuleEcho, loading } = useAppState();
  const [echo, setEcho] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (echo.trim().length === 0 || submitting) return;
    setSubmitting(true);
    try {
      await createCapsuleEcho(echo.trim());
      navigate(-1);
    } catch {
      setSubmitting(false);
    }
  };

  const isSubmitting = submitting || loading;

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e1db]">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <span className="text-base text-[#3a2a1a]">留下回响</span>
          <div className="w-5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Original Content Summary */}
        <div className="mb-6">
          <div className="text-xs text-[#8a7a6a] mb-2">你刚刚读到的缘记</div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-sm text-[#3a2a1a] leading-relaxed line-clamp-3">
              {currentCapsule?.yuan_ji || "（无内容）"}
            </p>
          </div>
        </div>

        {/* Echo Input */}
        <div className="mb-6">
          <div className="text-xs text-[#8a7a6a] mb-2">留下你的回响</div>
          <textarea
            placeholder="写下你想对这位陌生人说的话..."
            value={echo}
            onChange={(e) => setEcho(e.target.value)}
            className="w-full h-48 px-4 py-3 text-sm text-[#3a2a1a] placeholder:text-[#b5a595] bg-white border border-[#e5e1db] rounded-xl outline-none resize-none focus:border-amber-300"
            disabled={isSubmitting}
          />
          <div className="flex justify-end mt-2">
            <span className="text-xs text-[#b5a595]">{echo.length} / 500</span>
          </div>
        </div>

        {/* Anonymous Notice */}
        <div className="bg-white border border-[#e5e1db] rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-[#3a2a1a] mb-1">双向匿名</h3>
              <p className="text-xs text-[#8a7a6a] leading-relaxed">
                你不会知道对方是谁，对方也不会知道你是谁。当原主下次回到该地点附近时，会收到「有人在这里留下了回响」的通知。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#e5e1db] p-5 space-y-3">
        <PulseButton
          onClick={handleSubmit}
          variant="primary"
          size="lg"
          className="w-full bg-gradient-to-r from-amber-400 to-orange-400"
          glowColor="251, 146, 60"
          disabled={echo.trim().length === 0 || isSubmitting}
        >
          {isSubmitting ? "发送中..." : "发送回响"}
        </PulseButton>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 text-sm text-[#8a7a6a] hover:text-[#5a4a3a] transition-colors"
          disabled={isSubmitting}
        >
          放弃
        </button>
      </div>
    </div>
  );
}
