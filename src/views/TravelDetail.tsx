import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Clock, Navigation, Anchor, BookOpen, Wind, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { MapboxRomanceMap } from '../components/MapboxRomanceMap';
import { TimelineController } from '../components/TimelineController';
import { interpolateTrajectory, getPositionAtProgress, calculateTrajectoryLength, formatDistance, formatDuration as formatTrajectoryDuration } from '../utils/trajectory';
import type { AnchorData, TravelLocation } from '../api/types';
import {
  DEMO_TRAJECTORY,
  DEMO_ANCHORS,
  DEMO_DIARY,
  DEMO_RECENT_JOURNEYS,
} from '../data/mockData';

/**
 * Demo版TravelDetail - 使用硬编码的南京旅游数据
 */
export function TravelDetail() {
  const { travelId } = useParams<{ travelId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'map' | 'diary' | 'anchors'>('map');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // 从mock数据中获取对应的旅途
  const travel = DEMO_RECENT_JOURNEYS.find(j => String(j.id) === travelId) || DEMO_RECENT_JOURNEYS[0];

  // 构造TravelLocation格式的轨迹数据
  const locations: TravelLocation[] = useMemo(() =>
    DEMO_TRAJECTORY.map((p, i) => ({
      id: i,
      travel_id: 1,
      lat: p.lat,
      lng: p.lng,
      speed: p.speed,
      timestamp: new Date(p.timestamp).toISOString(),
    })),
    []
  );

  const interpolatedLocations = useMemo(
    () => interpolateTrajectory(locations, 20),
    [locations]
  );

  const trajectoryPath = useMemo(
    () => locations.map((loc) => ({ lat: loc.lat, lng: loc.lng })),
    [locations]
  );

  const playbackPosition = useMemo(() => {
    if (interpolatedLocations.length === 0) return null;
    const pos = getPositionAtProgress(interpolatedLocations, playbackProgress / 100);
    return { lat: pos.lat, lng: pos.lng };
  }, [interpolatedLocations, playbackProgress]);

  const mapCenter = useMemo(() => {
    if (isPlaying || playbackProgress > 0) {
      return playbackPosition;
    }
    if (locations.length > 0) {
      const last = locations[locations.length - 1];
      return { lat: last.lat, lng: last.lng };
    }
    return null;
  }, [locations, playbackPosition, isPlaying, playbackProgress]);

  const anchorMarkers = useMemo(
    () =>
      DEMO_ANCHORS
        .filter(anchor => anchor.status === 'confirmed' || anchor.is_manual)
        .map((anchor) => ({
          ...anchor,
          id: String(anchor.id),
          travel_id: String(anchor.travel_id),
        })),
    []
  );

  const trajectoryDuration = useMemo(() => {
    if (interpolatedLocations.length < 2) return 0;
    const firstTime = new Date(interpolatedLocations[0].timestamp).getTime();
    const lastTime = new Date(interpolatedLocations[interpolatedLocations.length - 1].timestamp).getTime();
    return lastTime - firstTime;
  }, [interpolatedLocations]);

  const currentDistance = useMemo(() => {
    if (interpolatedLocations.length === 0) return 0;
    const partialLocations = interpolatedLocations.slice(
      0,
      Math.max(1, Math.floor((playbackProgress / 100) * interpolatedLocations.length))
    );
    return calculateTrajectoryLength(partialLocations);
  }, [interpolatedLocations, playbackProgress]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-full pb-32 bg-[#FBF8F1]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
      <div className="relative bg-gradient-to-b from-amber-50/80 via-rose-50/10 to-transparent pb-4">
        <div className="relative px-5 pt-12 pb-4">
          <button
            onClick={() => navigate('/memory')}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">返回记忆</span>
          </button>
          <h1 className="text-2xl text-stone-800 tracking-wider mb-2" style={{ fontWeight: 400 }}>
            {travel?.diary_title || travel?.city || '旅途回忆'}
          </h1>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <CalendarIcon size={12} />
              {formatDate(travel?.start_time || new Date().toISOString())}
            </span>
            {travel && travel.total_distance > 0 && (
              <span className="flex items-center gap-1">
                <Navigation size={12} />
                {travel.total_distance.toFixed(1)} km
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 mt-4">
        <div className="flex gap-2 border-b border-stone-200/50">
          <TabButton label="轨迹" icon={<MapPin size={14} />} active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
          <TabButton label="日记" icon={<BookOpen size={14} />} active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} />
          <TabButton label="锚点" icon={<Anchor size={14} />} active={activeTab === 'anchors'} onClick={() => setActiveTab('anchors')} />
        </div>
      </div>

      <div className="px-5 mt-4">
        {activeTab === 'map' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="h-[45vh] rounded-2xl overflow-hidden border border-white/40 shadow-[0_4px_20px_rgba(180,140,100,0.08)]">
              <MapboxRomanceMap
                center={mapCenter}
                trajectoryPath={trajectoryPath}
                anchors={anchorMarkers as AnchorData[]}
                capsules={[]}
                passive={false}
                lineColor="#e85d3a"
                lineWidth={6}
              />
            </div>
            {interpolatedLocations.length > 1 && (
              <TimelineController
                duration={trajectoryDuration}
                isPlaying={isPlaying}
                onPlayChange={setIsPlaying}
                onProgressChange={setPlaybackProgress}
                currentProgress={playbackProgress}
              />
            )}
            {(isPlaying || playbackProgress > 0) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-3 border border-white/40">
                  <div className="flex items-center gap-2 text-stone-500 text-xs"><Navigation size={12} /><span>已行走</span></div>
                  <p className="text-lg text-stone-700 mt-1">{formatDistance(currentDistance)}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-3 border border-white/40">
                  <div className="flex items-center gap-2 text-stone-500 text-xs"><Clock size={12} /><span>用时</span></div>
                  <p className="text-lg text-stone-700 mt-1">{formatTrajectoryDuration((playbackProgress / 100) * trajectoryDuration)}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'diary' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40"
          >
            <h2 className="text-xl text-amber-700 mb-2 tracking-wider">{DEMO_DIARY.title}</h2>
            <p className="text-xs text-stone-400 mb-6 tracking-[0.2em]" style={{ fontFamily: 'sans-serif' }}>{DEMO_DIARY.date}</p>
            <div className="space-y-4">
              {DEMO_DIARY.content.map((paragraph, idx) => {
                const source = typeof paragraph === 'string' ? 'plain' : paragraph.source;
                const text = typeof paragraph === 'string' ? paragraph : paragraph.text;
                return (
                  <p
                    key={idx}
                    className={`text-sm leading-relaxed ${
                      source === 'user' ? 'text-stone-800' :
                      source === 'rag' ? 'text-pink-400 italic' :
                      source === 'ai' ? 'font-medium text-orange-600' :
                      'text-stone-600'
                    }`}
                  >
                    {text}
                  </p>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'anchors' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
            {DEMO_ANCHORS.map((anchor, idx) => <AnchorCard key={anchor.id} anchor={anchor as AnchorData} index={idx} />)}
          </motion.div>
        )}
      </div>

      <div className="px-5 mt-6">
        <div className="grid grid-cols-3 gap-3">
          <StatBox icon={<Clock size={16} />} value="3小时" label="时长" />
          <StatBox icon={<Navigation size={16} />} value={travel?.total_distance.toFixed(1) || '12.8'} label="公里" />
          <StatBox icon={<Anchor size={16} />} value={String(DEMO_ANCHORS.length)} label="锚点" />
        </div>
        {interpolatedLocations.length > 1 && (
          <button
            onClick={() => { setActiveTab('map'); setIsPlaying(true); }}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-2xl transition-colors shadow-md"
            style={{ fontFamily: 'sans-serif' }}
          >
            <Play size={18} className="ml-0.5" />
            <span>开始轨迹回放</span>
          </button>
        )}
      </div>
    </div>
  );
}

function TabButton({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-lg text-sm transition-all ${
        active ? 'bg-white/80 text-amber-700 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-700'
      }`}
      style={{ fontFamily: 'sans-serif' }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatBox({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-3.5 flex flex-col items-center justify-center gap-1 border border-white/40">
      <div className="text-amber-600/60 mb-0.5">{icon}</div>
      <span className="text-lg text-stone-700" style={{ fontWeight: 400 }}>{value}</span>
      <span className="text-[10px] text-stone-400 tracking-widest" style={{ fontFamily: 'sans-serif' }}>{label}</span>
    </div>
  );
}

function AnchorCard({ anchor, index }: { anchor: AnchorData; index: number }) {
  const statusLabel = anchor.status === 'confirmed' ? '已确认' : anchor.is_manual ? '手动' : anchor.status;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/40"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Anchor size={16} className="text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-stone-700 font-medium">{anchor.poi_name || '未命名锚点'}</h3>
            <span className="rounded-full px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-600" style={{ fontFamily: 'sans-serif' }}>{statusLabel}</span>
          </div>
          {anchor.user_text ? (
            <p className="text-stone-600 text-sm leading-relaxed">{anchor.user_text}</p>
          ) : anchor.ai_description ? (
            <p className="text-stone-500 text-sm leading-relaxed">{anchor.ai_description}</p>
          ) : (
            <p className="text-stone-400 text-sm">无描述</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-stone-400">
            {anchor.weather && <span className="flex items-center gap-1"><Wind size={10} />{anchor.weather}</span>}
            {anchor.temperature && <span>{anchor.temperature}°C</span>}
            {anchor.created_at && <span>{new Date(anchor.created_at).toLocaleString('zh-CN')}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CalendarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
