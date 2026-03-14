import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, X, Sparkles, MessageCircle, AlertCircle } from "lucide-react";
import { PulseButton } from "../../components/PulseButton";
import { useAppState } from "../../contexts/AppStateContext";

export function CapsuleOpen() {
  const navigate = useNavigate();
  const { currentCapsule, verifyCapsule, loading } = useAppState();
  const [stage, setStage] = useState<"key" | "opening" | "opened">("key");
  const [answer, setAnswer] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleSubmitKey = async () => {
    if (answer.trim().length === 0) return;
    setVerifyError(null);
    try {
      const res = await verifyCapsule(answer);
      if (res.result === "pass") {
        setStage("opening");
        setTimeout(() => setStage("opened"), 2000);
      } else {
        setVerifyError(res.message || "答案不够接近，再想想");
      }
    } catch {
      setVerifyError("验证失败，请稍后重试");
    }
  };

  // Calculate days since capsule was created
  const daysSinceCreated = (() => {
    if (!currentCapsule?.created_at) return null;
    const created = new Date(currentCapsule.created_at);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  })();

  // Format creation date for display
  const formattedCreatedAt = (() => {
    if (!currentCapsule?.created_at) return "";
    const d = new Date(currentCapsule.created_at);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  })();

  if (stage === "key") {
    return (
      <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#e5e1db]">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
            </button>
            <span className="text-base text-[#3a2a1a]">时空胶囊</span>
            <div className="w-5" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-8 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-amber-500" />
          </div>

          <div className="w-full mb-8">
            <div className="text-sm text-[#8a7a6a] mb-2 text-center">这道钥是：</div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <p className="text-base text-[#3a2a1a] text-center leading-relaxed">
                {currentCapsule?.key_question || "加载中..."}
              </p>
            </div>
            {currentCapsule?.key_answer_hint && (
              <div className="text-xs text-[#b5a595] text-center mt-3">
                提示：{currentCapsule.key_answer_hint}
              </div>
            )}
          </div>

          <div className="w-full mb-4">
            <textarea
              placeholder="写下你的回答..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full h-32 px-4 py-3 text-sm text-[#3a2a1a] placeholder:text-[#b5a595] bg-white border border-[#e5e1db] rounded-xl outline-none resize-none focus:border-amber-300"
            />
          </div>

          {verifyError && (
            <div className="w-full mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-600">{verifyError}</p>
            </div>
          )}

          <p className="text-xs text-[#b5a595] text-center leading-relaxed mb-8">
            没有标准答案，只要你足够靠近它
          </p>

          <PulseButton
            onClick={handleSubmitKey}
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-amber-400 to-orange-400"
            glowColor="251, 146, 60"
            disabled={answer.trim().length === 0 || loading}
          >
            {loading ? "验证中..." : "提交答案"}
          </PulseButton>
        </div>
      </div>
    );
  }

  if (stage === "opening") {
    return (
      <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-gradient-to-b from-amber-900 via-orange-900 to-amber-900 overflow-hidden relative flex items-center justify-center">
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-400/40 via-orange-400/40 to-amber-400/40"
          style={{ animation: "soft-glow 2s ease-out forwards" }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-32 h-32 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full"
            style={{
              boxShadow:
                "0 0 120px rgba(251, 146, 60, 0.9), 0 0 240px rgba(234, 179, 8, 0.7), 0 0 360px rgba(251, 146, 60, 0.5)",
              animation: "burst 2s ease-out forwards",
            }}
          />

          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-64 h-64 border-2 border-amber-300/40 rounded-full"
              style={{ animation: `ripple 2s ease-out ${i * 0.3}s forwards` }}
            />
          ))}

          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-300 rounded-full"
              style={{
                left: "50%",
                top: "50%",
                animation: "particle-burst 2s ease-out forwards",
                animationDelay: `${i * 0.05}s`,
                transform: `rotate(${i * 12}deg) translateY(0)`,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes soft-glow {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes burst {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
          }
          @keyframes ripple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(5); opacity: 0; }
          }
          @keyframes particle-burst {
            0% { transform: rotate(var(--rotation)) translateY(0); opacity: 1; }
            100% { transform: rotate(var(--rotation)) translateY(-250px); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  // stage === "opened"
  const echoCount = currentCapsule?.echoes?.length ?? 0;

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-gradient-to-b from-amber-50 to-orange-50 overflow-hidden flex flex-col">
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-100">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <span className="text-base text-[#3a2a1a]">缘记</span>
          <div className="w-5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-3">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-amber-600">
              {currentCapsule?.city
                ? `来自${currentCapsule.city}的陌生人`
                : "来自远方的陌生人"}
            </span>
          </div>
          {currentCapsule?.city && (
            <div className="text-xs text-[#8a7a6a] mb-1">
              {currentCapsule.city}
              {formattedCreatedAt ? ` / ${formattedCreatedAt}` : ""}
            </div>
          )}
          {currentCapsule?.weather_when_created && (
            <div className="text-xs text-[#b5a595]">
              {currentCapsule.weather_when_created}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
          <p className="text-sm text-[#3a2a1a] leading-loose whitespace-pre-line">
            {currentCapsule?.yuan_ji || "（无内容）"}
          </p>
        </div>

        {echoCount > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-[#8a7a6a]">
              已有 {echoCount} 条回响
            </span>
          </div>
        )}

        <div className="text-center text-xs text-[#b5a595] mb-6">
          {daysSinceCreated !== null
            ? `这段缘记在这里等待了 ${daysSinceCreated} 天`
            : ""}
        </div>
      </div>

      <div className="bg-white border-t border-amber-100 p-5 space-y-3">
        <PulseButton
          onClick={() => navigate("/yuan/capsule-echo")}
          variant="primary"
          size="lg"
          className="w-full bg-gradient-to-r from-amber-400 to-orange-400"
          glowColor="251, 146, 60"
        >
          留下回响
        </PulseButton>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 text-sm text-[#8a7a6a] hover:text-[#5a4a3a] transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
