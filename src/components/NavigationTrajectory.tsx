import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, Sparkles, Anchor as AnchorIcon } from "lucide-react";

interface Position {
  lat: number;
  lng: number;
}

interface Anchor {
  id: string;
  lat: number;
  lng: number;
  poi_name: string;
  ai_description: string;
  user_text?: string;
}

interface Props {
  trajectoryPath: Position[];
  anchors: Anchor[];
  onAnchorClick?: (anchor: Anchor) => void;
  isComplete?: boolean;
}

export function NavigationTrajectory({ trajectoryPath, anchors, onAnchorClick, isComplete = false }: Props) {
  const [visiblePathLength, setVisiblePathLength] = useState(1);
  const [currentAnchorIndex, setCurrentAnchorIndex] = useState(-1);
  const [showAnchorPopup, setShowAnchorPopup] = useState<Anchor | null>(null);
  const [userText, setUserText] = useState("");

  // 轨迹逐渐生成动画
  useEffect(() => {
    if (trajectoryPath.length <= 1) {
      setVisiblePathLength(1);
      return;
    }

    const totalPoints = trajectoryPath.length;
    const duration = isComplete ? 3000 : 1500; // 完整回放更快
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // 使用缓动函数让动画更自然
      const eased = 1 - Math.pow(1 - progress, 3);
      setVisiblePathLength(Math.max(1, Math.floor(1 + (totalPoints - 1) * eased)));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    return () => {};
  }, [trajectoryPath, isComplete]);

  // 锚点逐个出现
  useEffect(() => {
    if (anchors.length === 0) return;

    anchors.forEach((anchor, index) => {
      const anchorDelay = index * 800 + 500; // 每个锚点延迟出现
      setTimeout(() => {
        setCurrentAnchorIndex(index);
      }, anchorDelay);
    });
  }, [anchors]);

  const handleAnchorTap = (anchor: Anchor) => {
    setShowAnchorPopup(anchor);
    setUserText(anchor.user_text || "");
  };

  const currentPos = trajectoryPath[Math.min(visiblePathLength - 1, trajectoryPath.length - 1)];

  return (
    <div className="relative w-full h-full">
      {/* 轨迹路径 - 使用 SVG 绘制 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        <defs>
          <linearGradient id="trajectoryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* 轨迹线 - 已绘制部分 */}
        {trajectoryPath.length >= 2 && (
          <motion.path
            d={`M ${trajectoryPath.slice(0, visiblePathLength).map((p, i) => 
              `${i === 0 ? 'M' : 'L'} ${p.lng} ${p.lat}`
            ).join(' ')}`}
            fill="none"
            stroke="url(#trajectoryGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </svg>

      {/* 锚点标记 */}
      <AnimatePresence>
        {anchors.map((anchor, index) => (
          index <= currentAnchorIndex && (
            <motion.div
              key={anchor.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="absolute cursor-pointer z-[20]"
              style={{
                left: `${(anchor.lng - 121.45) * 10000}%`,
                top: `${(31.25 - anchor.lat) * 10000}%`,
              }}
              onClick={() => handleAnchorTap(anchor)}
            >
              <div className="relative">
                {/* 锚点外环光晕 */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-amber-400/30"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                {/* 锚点核心 */}
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-white">
                  <AnchorIcon size={14} className="text-white" />
                </div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* 当前位置指示器 */}
      {currentPos && (
        <motion.div
          className="absolute z-[25]"
          style={{
            left: `${(currentPos.lng - 121.45) * 10000}%`,
            top: `${(31.25 - currentPos.lat) * 10000}%`,
          }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            {/* 位置外圈脉冲 */}
            <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
            {/* 位置核心 */}
            <div className="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
          </div>
        </motion.div>
      )}

      {/* 锚点详情弹窗 */}
      <AnimatePresence>
        {showAnchorPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[50] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAnchorPopup(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-6 max-w-sm mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <MapPin size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-stone-800 text-lg font-medium">{showAnchorPopup.poi_name}</h3>
                  <div className="flex items-center gap-1 text-stone-400 text-xs">
                    <Clock size={10} />
                    <span>停留感知</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnchorPopup(null)}
                  className="ml-auto w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>

              {/* AI 描述 */}
              {showAnchorPopup.ai_description && (
                <div className="bg-amber-50/50 rounded-2xl p-4 mb-4 border border-amber-100/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-amber-500" />
                    <span className="text-amber-600 text-xs font-medium">AI 感知</span>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {showAnchorPopup.ai_description}
                  </p>
                </div>
              )}

              {/* 用户输入 */}
              <div className="mb-4">
                <label className="block text-stone-500 text-xs mb-2">你的感受</label>
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="记录下此刻的心情..."
                  className="w-full bg-stone-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
                  rows={3}
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAnchorPopup(null)}
                  className="flex-1 py-2.5 text-stone-500 text-sm hover:bg-stone-100 rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    // TODO: 保存用户文字
                    setShowAnchorPopup(null);
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  保存锚点
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 轨迹进度指示 */}
      <div className="absolute bottom-4 left-4 right-4 z-[30]">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-lg border border-white/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-stone-600 text-xs">正在记录轨迹</span>
            </div>
            <span className="text-stone-400 text-xs">
              {visiblePathLength} / {trajectoryPath.length} 点
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(visiblePathLength / trajectoryPath.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
