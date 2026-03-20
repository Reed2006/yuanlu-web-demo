import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Key, ScanLine } from "lucide-react";
import type { CapsuleData } from "../api/types";

interface Props {
  capsule: CapsuleData;
  onUnlock: () => void;
  onClose: () => void;
}

export function ARCapsuleOverlay({ capsule, onUnlock, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [approachProgress, setApproachProgress] = useState(0);
  const [showKeyHole, setShowKeyHole] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // 启动后置摄像头
  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // 后置摄像头
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        
        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        console.error('AR camera error:', err);
        if (mounted) {
          setCameraError('无法访问摄像头，请检查权限设置');
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 模拟靠近胶囊的动画
  useEffect(() => {
    const timer = setInterval(() => {
      setApproachProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setShowKeyHole(true), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  // 显示钥匙孔后，自动显示解锁按钮
  useEffect(() => {
    if (showKeyHole) {
      const timer = setTimeout(() => {
        setUnlocked(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showKeyHole]);

  // 解锁后显示消息
  useEffect(() => {
    if (unlocked) {
      const timer = setTimeout(() => {
        setShowMessage(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [unlocked]);

  const handleUnlock = () => {
    onUnlock();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black"
    >
      {/* 摄像头画面 */}
      {cameraError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-indigo-900/40">
          <div className="text-center px-6">
            <ScanLine size={48} className="mx-auto mb-4 text-white/40" />
            <p className="text-white/60 text-sm">{cameraError}</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-white/10 rounded-full text-white/80 text-sm hover:bg-white/20 transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* 暗色遮罩 */}
          <div className="absolute inset-0 bg-black/20" />

          {/* 顶部关闭按钮 */}
          <div className="absolute top-12 left-0 right-0 flex justify-center z-[80]">
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors"
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* AR 胶囊 3D 效果 */}
          <div className="absolute inset-0 flex items-center justify-center z-[75]">
            <div className="relative">
              {/* 胶囊外环光晕 */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  width: 200,
                  height: 200,
                  left: -100,
                  top: -100,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-r from-indigo-400/30 via-purple-400/30 to-indigo-400/30 blur-xl" />
              </motion.div>

              {/* 胶囊核心 */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-indigo-500 shadow-[0_0_60px_rgba(129,140,248,0.6)] flex items-center justify-center"
              >
                {/* 胶囊内部光芒 */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                
                {/* 胶囊图标 */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="relative z-10"
                >
                  <Sparkles size={40} className="text-white/90" />
                </motion.div>

                {/* 钥匙孔（靠近后显示） */}
                <AnimatePresence>
                  {showKeyHole && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(251, 146, 60, 0.8)',
                            '0 0 40px rgba(251, 146, 60, 0.4)',
                            '0 0 20px rgba(251, 146, 60, 0.8)',
                          ],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
                      >
                        <Key size={28} className="text-white" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* 解锁按钮（钥匙孔出现后） */}
              <AnimatePresence>
                {unlocked && !showMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-full mt-8 left-1/2 -translate-x-1/2"
                  >
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUnlock}
                      className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-medium shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_30px_rgba(245,158,11,0.5)] transition-shadow flex items-center gap-2"
                    >
                      <Key size={18} />
                      <span>开启胶囊</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 距离指示器 */}
          {!showKeyHole && (
            <div className="absolute bottom-32 left-0 right-0 flex flex-col items-center z-[80]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/80 text-sm mb-2"
              >
                正在靠近时空胶囊...
              </motion.div>
              <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                  style={{ width: `${approachProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* AR 扫描线效果 */}
          <motion.div
            className="absolute inset-0 z-[76] pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, transparent 45%, rgba(129, 140, 248, 0.1) 50%, transparent 55%)',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '0% 100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* 解锁后的字迹显示 */}
          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[85] flex items-center justify-center bg-black/60 backdrop-blur-md"
                onClick={onClose}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white/95 rounded-3xl p-8 max-w-sm mx-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                      <Sparkles size={24} className="text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-center text-stone-800 text-lg mb-2">胶囊已开启</h3>
                  <p className="text-center text-stone-500 text-sm mb-6">来自 {capsule.city} 的时空留言</p>
                  
                  <div className="bg-indigo-50/50 rounded-2xl p-5 mb-6 border border-indigo-100/50">
                    <p className="text-stone-700 text-sm leading-relaxed italic text-center">
                      "{capsule.key_question}"
                    </p>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl py-3 font-medium shadow-lg hover:shadow-xl transition-shadow"
                  >
                    收藏这份回忆
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
