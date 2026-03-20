import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { LocationPoint, AnchorData, CapsuleData } from '../api/types';
import {
  DEMO_TRAJECTORY,
  DEMO_ANCHORS,
  DEMO_CAPSULES,
  DEMO_ANIMATION_CONFIG,
} from '../data/mockData';

interface TravelState {
  isActive: boolean;
  travelId: number | string | null;
  positions: LocationPoint[];
  anchors: AnchorData[];
  capsules: CapsuleData[];
  duration: number;
  distance: number;
  currentLat: number | null;
  currentLng: number | null;
}

interface TravelContextValue extends TravelState {
  startTravel: (city?: string) => Promise<void>;
  endTravel: () => Promise<void>;
  addManualAnchor: (userText: string) => Promise<AnchorData | null>;
  updateAnchor: (anchorId: string | number, payload: { user_text?: string; audio_url?: string; photo_url?: string }) => Promise<AnchorData | null>;
  createCapsule: (
    yuanJi: string,
    keyQuestion: string,
    keyAnswerHint?: string,
    options?: { city?: string; timeLockUntil?: string; weatherWhenCreated?: string }
  ) => Promise<{ success: boolean; capsuleId?: number; error?: string }>;
}

const TravelContext = createContext<TravelContextValue | null>(null);

export function useTravelContext() {
  const ctx = useContext(TravelContext);
  if (!ctx) throw new Error('useTravelContext must be used within TravelProvider');
  return ctx;
}

/**
 * Demo版TravelProvider - 使用完全硬编码的南京旅游轨迹数据
 * 开始旅途后会播放轨迹动画（约8秒），逐步展示锚点
 */
export function TravelProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [travelId, setTravelId] = useState<number | string | null>(null);
  const [positions, setPositions] = useState<LocationPoint[]>([]);
  const [anchors, setAnchors] = useState<AnchorData[]>([]);
  const [capsules, setCapsules] = useState<CapsuleData[]>([]);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationStartRef = useRef<number>(0);

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  const startTravel = useCallback(async () => {
    stopAnimation();
    
    setTravelId(1);
    setPositions([]);
    setAnchors([]);
    setCapsules(DEMO_CAPSULES as CapsuleData[]);
    setDuration(0);
    setDistance(0);
    setCurrentLat(DEMO_TRAJECTORY[0].lat);
    setCurrentLng(DEMO_TRAJECTORY[0].lng);
    setIsActive(true);

    const totalPoints = DEMO_TRAJECTORY.length;
    const { durationMs, totalDistance, totalDuration } = DEMO_ANIMATION_CONFIG;
    
    // 锚点对应的轨迹进度百分比
    const anchorProgressMap = [
      { index: 0, progress: 0 },       // 中山陵 - 起点
      { index: 1, progress: 0.25 },     // 明孝陵
      { index: 2, progress: 0.4 },      // 美龄宫
      { index: 3, progress: 0.65 },     // 南京博物院
      { index: 4, progress: 0.95 },     // 夫子庙
    ];
    
    let addedAnchorCount = 0;
    animationStartRef.current = performance.now();

    // 时长计时器 - 模拟3小时行程在8秒内完成
    durationTimerRef.current = setInterval(() => {
      setDuration(prev => prev + Math.floor(totalDuration / (durationMs / 100)));
    }, 100);

    const animate = () => {
      const elapsed = performance.now() - animationStartRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const currentIndex = Math.min(Math.floor(progress * totalPoints), totalPoints - 1);

      // 更新轨迹位置
      const currentPoints = DEMO_TRAJECTORY.slice(0, currentIndex + 1);
      setPositions(currentPoints);
      setCurrentLat(DEMO_TRAJECTORY[currentIndex].lat);
      setCurrentLng(DEMO_TRAJECTORY[currentIndex].lng);
      setDistance(progress * totalDistance);

      // 逐步添加锚点
      while (addedAnchorCount < anchorProgressMap.length && progress >= anchorProgressMap[addedAnchorCount].progress) {
        const anchorIndex = anchorProgressMap[addedAnchorCount].index;
        const newAnchor = DEMO_ANCHORS[anchorIndex];
        if (newAnchor) {
          setAnchors(prev => {
            if (prev.find(a => a.id === newAnchor.id)) return prev;
            return [...prev, newAnchor as AnchorData];
          });
        }
        addedAnchorCount++;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // 动画完成
        setPositions([...DEMO_TRAJECTORY]);
        setAnchors([...DEMO_ANCHORS] as AnchorData[]);
        setDuration(totalDuration);
        setDistance(totalDistance);
        stopAnimation();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [stopAnimation]);

  const endTravel = useCallback(async () => {
    stopAnimation();
    setIsActive(false);
  }, [stopAnimation]);

  const addManualAnchor = useCallback(
    async (userText: string): Promise<AnchorData | null> => {
      if (!currentLat || !currentLng) return null;
      const newAnchor: AnchorData = {
        id: Date.now(),
        travel_id: 1,
        lat: currentLat,
        lng: currentLng,
        poi_name: '手动锚点',
        user_text: userText,
        ai_description: '用户在此处手动标记了一个停留。',
        weather: '晴',
        temperature: 26,
        poi_type: '自定义标记',
        status: 'confirmed',
        agent_status: 'ready',
        is_manual: true,
        emotion_tags: ['记录'],
        created_at: new Date().toISOString(),
      } as AnchorData;
      setAnchors(prev => [...prev, newAnchor]);
      return newAnchor;
    },
    [currentLat, currentLng]
  );

  const updateAnchor = useCallback(
    async (
      anchorId: string | number,
      payload: { user_text?: string; audio_url?: string; photo_url?: string }
    ): Promise<AnchorData | null> => {
      let updated: AnchorData | null = null;
      setAnchors(prev =>
        prev.map(anchor => {
          if (String(anchor.id) === String(anchorId)) {
            updated = { ...anchor, ...payload } as AnchorData;
            return updated;
          }
          return anchor;
        })
      );
      return updated;
    },
    []
  );

  const createCapsule = useCallback(
    async (
      yuanJi: string,
      keyQuestion: string,
      _keyAnswerHint?: string,
      options?: { city?: string; timeLockUntil?: string; weatherWhenCreated?: string }
    ): Promise<{ success: boolean; capsuleId?: number; error?: string }> => {
      if (!currentLat || !currentLng) {
        return { success: false, error: '无法获取当前位置' };
      }
      const newId = Date.now();
      const newCapsule: CapsuleData = {
        id: newId,
        lat: currentLat,
        lng: currentLng,
        city: options?.city ?? '南京',
        key_question: keyQuestion,
        distance_m: 0,
        status: 'active',
        is_locked: false,
        time_lock_until: options?.timeLockUntil ?? null,
      } as CapsuleData;
      setCapsules(prev => [...prev, newCapsule]);
      return { success: true, capsuleId: newId };
    },
    [currentLat, currentLng]
  );

  useEffect(() => {
    return () => { stopAnimation(); };
  }, [stopAnimation]);

  return (
    <TravelContext.Provider
      value={{
        isActive,
        travelId,
        positions,
        anchors,
        capsules,
        duration,
        distance,
        currentLat,
        currentLng,
        startTravel,
        endTravel,
        addManualAnchor,
        updateAnchor,
        createCapsule,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
}
