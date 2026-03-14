import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Database, Sparkles, CheckCircle2, Pen, AlertCircle, RotateCcw } from "lucide-react";
import { BackToHomeButton } from "../components/BackToHomeButton";
import { useAppState } from "../contexts/AppStateContext";

const steps = [
  { id: 1, label: "正在整理旅行素材", icon: FileText, delay: 0 },
  { id: 2, label: "正在检索过往记忆", icon: Database, delay: 1.5 },
  { id: 3, label: "正在生成旅行日记", icon: Sparkles, delay: 3 },
  { id: 4, label: "正在润色与反思", icon: CheckCircle2, delay: 4.5 },
];

export function SynthesisProcess() {
  const navigate = useNavigate();
  const { loadDiary, diary, travel, travelAnchors } = useAppState();
  const [currentStep, setCurrentStep] = useState(0);
  const [agentFailed, setAgentFailed] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const previewText =
    diary?.content_json?.segments?.find((segment) => segment.text)?.text ||
    travelAnchors.find((item) => item.ai_description)?.ai_description ||
    travelAnchors.find((item) => item.user_text)?.user_text ||
    `${travel?.city || "这段旅行"}的实时素材已提交后端，正在生成旅记。`;

  const readyAnchors = useMemo(
    () => travelAnchors.filter((item) => item.agent_status === "ready" || item.ai_description).length,
    [travelAnchors],
  );

  useEffect(() => {
    if (agentFailed) return;
    const pollTimer = window.setInterval(async () => {
      const nextDiary = await loadDiary().catch(() => null);
      if (nextDiary?.status === "ready") {
        setCurrentStep(3);
        navigate("/diary");
        return;
      }
      if ((nextDiary as any)?.status === "failed") {
        setAgentFailed(true);
        return;
      }
      setCurrentStep(readyAnchors > 0 ? 2 : 1);
    }, 2000);
    return () => window.clearInterval(pollTimer);
  }, [agentFailed, loadDiary, navigate, readyAnchors]);

  useEffect(() => {
    if (diary?.status === "ready") {
      setCurrentStep(3);
      const timer = window.setTimeout(() => navigate("/diary"), 600);
      return () => window.clearTimeout(timer);
    }
    if ((diary as any)?.status === "failed") {
      setAgentFailed(true);
      return;
    }
    setCurrentStep(readyAnchors > 0 ? 2 : 1);
  }, [diary?.status, navigate, readyAnchors]);

  // Streaming text effect
  useEffect(() => {
    if (currentStep === 2) {
      setStreamingText("");
      setCurrentIndex(0);
      // Start streaming when generating diary
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < previewText.length) {
            setStreamingText(previewText.substring(0, prev + 1));
            return prev + 1;
          }
          return prev;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [currentStep, previewText]);

  return (
    <div className="relative w-full max-w-[430px] h-[100dvh] mx-auto bg-gradient-to-b from-[#f8f6f3] to-white overflow-hidden flex flex-col items-center justify-center px-8">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-5 z-10">
        <BackToHomeButton />
      </div>

      {/* Central Animation */}
      <div className="mb-8 relative">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-24 h-24 rounded-full border-4 border-orange-200 border-t-orange-500"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 blur-2xl"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-10 h-10 text-orange-500" />
          </motion.div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        {agentFailed ? (
          <>
            <AlertCircle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-lg text-[#3a2a1a] mb-2">日记生成遇到问题</div>
            <div className="text-xs text-[#8a7a6a] mb-4">Agent 处理超时或出错</div>
            <button
              onClick={() => { setAgentFailed(false); loadDiary().catch(() => null); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 重新生成
            </button>
          </>
        ) : (
          <>
            <div className="text-lg text-[#3a2a1a] mb-2">记忆正在被写下</div>
            <div className="text-xs text-[#8a7a6a]">AI 正在为你合成旅行日记</div>
          </>
        )}
      </div>

      {/* Streaming Text Preview - Only show when generating */}
      <AnimatePresence>
        {currentStep === 2 && streamingText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-orange-100"
          >
            <div className="flex items-start gap-2 mb-2">
              <Pen className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
              <div className="text-xs text-[#8a7a6a]">AI 正在书写</div>
            </div>
            <div className="text-sm text-[#3a2a1a] leading-relaxed">
              {streamingText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-0.5 h-4 bg-orange-500 ml-0.5"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps */}
      <div className="w-full space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: isActive || isCompleted ? 1 : 0.3,
                x: 0,
              }}
              transition={{ delay: step.delay }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive ? "bg-gradient-to-r from-orange-50 to-orange-100 shadow-sm" : "bg-white/50"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted
                    ? "bg-emerald-500 shadow-md"
                    : isActive
                    ? "bg-gradient-to-br from-orange-400 to-orange-500 shadow-md"
                    : "bg-gray-200"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                )}
              </div>
              <div className="flex-1">
                <div
                  className={`text-sm ${
                    isActive || isCompleted ? "text-[#3a2a1a]" : "text-[#b5a595]"
                  }`}
                >
                  {step.label}
                </div>
              </div>
              {isActive && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-orange-300 border-t-orange-500 rounded-full"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Hint */}
      <div className="mt-8 text-center">
        <div className="text-xs text-[#8a7a6a] leading-relaxed max-w-xs">
          使用 Agentic RAG 检索过往记忆，通过 Reflection 自我评估优化
        </div>
      </div>
    </div>
  );
}
