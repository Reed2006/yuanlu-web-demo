import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Image as ImageIcon, Clock, Sparkles } from "lucide-react";
import { PulseButton } from "../../components/PulseButton";
import { useAppState } from "../../contexts/AppStateContext";

export function CapsuleCreate() {
  const navigate = useNavigate();
  const { currentPosition, createCapsule, loading } = useAppState();
  const [content, setContent] = useState("");
  const [keyQuestion, setKeyQuestion] = useState("");
  const [keyAnswerHint, setKeyAnswerHint] = useState("");
  const [enableTimeLock, setEnableTimeLock] = useState(false);
  const [timeLockDate, setTimeLockDate] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const locationLabel = (() => {
    const parts: string[] = [];
    if (currentPosition.city) parts.push(currentPosition.city);
    if (currentPosition.poi_name) parts.push(currentPosition.poi_name);
    else if (currentPosition.label) parts.push(currentPosition.label);
    return parts.join(" / ") || currentPosition.full_address || "定位中...";
  })();

  const canSubmit =
    content.trim().length > 0 &&
    keyQuestion.trim().length > 0 &&
    currentPosition.lat !== null &&
    currentPosition.lng !== null &&
    !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitError(null);
    try {
      await createCapsule({
        lat: currentPosition.lat!,
        lng: currentPosition.lng!,
        city: currentPosition.city,
        yuan_ji: content,
        key_question: keyQuestion,
        key_answer_hint: keyAnswerHint || undefined,
        time_lock_until: enableTimeLock && timeLockDate ? new Date(timeLockDate).toISOString() : null,
      });
      navigate("/yuan");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "创建失败，请重试");
    }
  };

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e1db]">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <span className="text-base text-[#3a2a1a]">留下时空胶囊</span>
          <div className="w-5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Location */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-[#8a7a6a] mb-1">
            <MapPin className="w-4 h-4" />
            <span>{locationLabel}</span>
          </div>
          <p className="text-xs text-[#b5a595] leading-relaxed ml-6">
            在这里留下一段缘记，等待未来的陌生人发现
          </p>
        </div>

        {/* Content Input */}
        <div className="mb-4">
          <div className="text-xs text-[#8a7a6a] mb-2">缘记正文</div>
          <textarea
            placeholder="写下你想对未来陌生人说的话..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-40 px-4 py-3 text-sm text-[#3a2a1a] placeholder:text-[#b5a595] bg-white border border-[#e5e1db] rounded-xl outline-none resize-none focus:border-amber-300"
          />
        </div>

        {/* Key Question */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <div className="text-xs text-[#8a7a6a]">设置一道"钥"</div>
          </div>
          <input
            type="text"
            placeholder="例如：你最想对过去的自己说什么？"
            value={keyQuestion}
            onChange={(e) => setKeyQuestion(e.target.value)}
            className="w-full px-4 py-3 text-sm text-[#3a2a1a] placeholder:text-[#b5a595] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl outline-none focus:border-amber-300"
          />
          <p className="text-xs text-[#b5a595] mt-2 leading-relaxed">
            这是一个开放式问题，只有回答足够靠近本质的人，才能打开胶囊
          </p>
        </div>

        {/* Key Answer Hint */}
        <div className="mb-4">
          <div className="text-xs text-[#8a7a6a] mb-2">答案提示（可选）</div>
          <input
            type="text"
            placeholder="给未来的发现者一点提示..."
            value={keyAnswerHint}
            onChange={(e) => setKeyAnswerHint(e.target.value)}
            className="w-full px-4 py-3 text-sm text-[#3a2a1a] placeholder:text-[#b5a595] bg-white border border-[#e5e1db] rounded-xl outline-none focus:border-amber-300"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <div className="text-xs text-[#8a7a6a] mb-2">添加图片（可选）</div>
          <button className="w-full aspect-video border-2 border-dashed border-[#e5e1db] rounded-xl flex flex-col items-center justify-center gap-2 text-[#b5a595] hover:border-amber-300 transition-colors">
            <ImageIcon className="w-6 h-6" />
            <span className="text-xs">添加一张图片</span>
          </button>
        </div>

        {/* Time Lock Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setEnableTimeLock(!enableTimeLock)}
            className="w-full bg-white border border-[#e5e1db] rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8a7a6a]" />
              <span className="text-sm text-[#3a2a1a]">设置时间锁</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${enableTimeLock ? "bg-amber-400" : "bg-[#e5e1db]"}`}>
              <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${enableTimeLock ? "translate-x-6" : "translate-x-0.5"}`} />
            </div>
          </button>
          {enableTimeLock && (
            <div className="mt-2">
              <input
                type="datetime-local"
                value={timeLockDate}
                onChange={(e) => setTimeLockDate(e.target.value)}
                className="w-full px-4 py-3 text-sm text-[#3a2a1a] bg-white border border-amber-200 rounded-xl outline-none focus:border-amber-300"
              />
              <p className="text-xs text-amber-600 mt-2 leading-relaxed">
                这个胶囊将在设定时间后才能被打开
              </p>
            </div>
          )}
        </div>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-600">{submitError}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#e5e1db] p-5">
        <PulseButton
          onClick={handleSubmit}
          variant="primary"
          size="lg"
          className="w-full bg-gradient-to-r from-amber-400 to-orange-400"
          glowColor="251, 146, 60"
          disabled={!canSubmit}
        >
          {loading ? "创建中..." : "留下胶囊"}
        </PulseButton>
      </div>
    </div>
  );
}
