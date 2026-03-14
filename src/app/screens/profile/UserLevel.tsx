import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Star, MapPin, Package, Mail, MessageCircle, BookOpen, Award, TrendingUp } from "lucide-react";
import { useAppState } from "../../contexts/AppStateContext";

const growthSources = [
  {
    id: 1,
    icon: MapPin,
    title: "完成一段旅行记录",
    value: "+20 成长值",
    color: "orange",
  },
  {
    id: 2,
    icon: Package,
    title: "留下一枚时空胶囊",
    value: "+15 成长值",
    color: "purple",
  },
  {
    id: 3,
    icon: MessageCircle,
    title: "收到一段匿名回响",
    value: "+10 成长值",
    color: "pink",
  },
  {
    id: 4,
    icon: BookOpen,
    title: "导出一篇旅记",
    value: "+12 成长值",
    color: "amber",
  },
  {
    id: 5,
    icon: Mail,
    title: "打开一个远洋瓶",
    value: "+8 成长值",
    color: "cyan",
  },
];

const levelStages = [
  {
    level: 1,
    name: "初行者",
    minPoints: 0,
    maxPoints: 100,
  },
  {
    level: 2,
    name: "留迹者",
    minPoints: 100,
    maxPoints: 300,
  },
  {
    level: 3,
    name: "记忆采集者",
    minPoints: 300,
    maxPoints: 600,
  },
  {
    level: 4,
    name: "记忆旅人",
    minPoints: 600,
    maxPoints: 1000,
  },
  {
    level: 5,
    name: "时间见证者",
    minPoints: 1000,
    maxPoints: 9999,
  },
];

export function UserLevel() {
  const navigate = useNavigate();
  const { travelHistory, myCapsules, myBottles, loadTravelHistory, loadMyCapsules, loadMyBottles } = useAppState();

  useEffect(() => {
    loadTravelHistory().catch(() => undefined);
    loadMyCapsules().catch(() => undefined);
    loadMyBottles().catch(() => undefined);
  }, [loadTravelHistory, loadMyCapsules, loadMyBottles]);

  const { currentLevel, currentPoints, pointsToNext, progress, currentStage, nextStage, cityCount } = useMemo(() => {
    const completedTravels = travelHistory.filter((t) => t.status === "ended" || t.status === "completed");
    const travelPoints = completedTravels.length * 20;
    const capsulePoints = myCapsules.length * 15;
    const bottlePoints = myBottles.length * 8;
    // Count echoes received (capsules with echoes)
    const echoCount = myCapsules.filter((c) => c.echo_count && c.echo_count > 0).reduce((sum, c) => sum + (c.echo_count || 0), 0);
    const echoPoints = echoCount * 10;
    // Count exported travels (travels with diary ready = likely exported)
    const exportedCount = travelHistory.filter((t) => t.diary_status === "ready").length;
    const exportPoints = exportedCount * 12;
    const totalPoints = travelPoints + capsulePoints + bottlePoints + echoPoints + exportPoints;

    // Determine level from totalPoints using levelStages thresholds
    let stage = levelStages[0];
    for (const s of levelStages) {
      if (totalPoints >= s.minPoints) {
        stage = s;
      }
    }

    const nextIdx = levelStages.findIndex((s) => s.level === stage.level) + 1;
    const next = nextIdx < levelStages.length ? levelStages[nextIdx] : null;
    const toNext = next ? next.minPoints - totalPoints : 0;

    const range = stage.maxPoints - stage.minPoints;
    const progressPct = range > 0 ? Math.min(((totalPoints - stage.minPoints) / range) * 100, 100) : 100;

    // Count unique cities from travel history
    const cities = new Set(
      travelHistory
        .map((t) => t.city)
        .filter((c): c is string => !!c),
    );

    return {
      currentLevel: stage.level,
      currentPoints: totalPoints,
      pointsToNext: toNext,
      progress: progressPct,
      currentStage: stage,
      nextStage: next,
      cityCount: cities.size,
    };
  }, [travelHistory, myCapsules, myBottles]);

  const getIconColor = (color: string) => {
    const colors = {
      orange: "bg-orange-100 text-orange-600",
      purple: "bg-purple-100 text-purple-600",
      pink: "bg-pink-100 text-pink-600",
      amber: "bg-amber-100 text-amber-600",
      cyan: "bg-cyan-100 text-cyan-600",
    };
    return colors[color as keyof typeof colors] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e1db] px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/profile")} className="p-1">
            <ChevronLeft className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <h1 className="text-xl text-[#3a2a1a]">用户等级</h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Current Level Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-50 to-transparent opacity-60 rounded-full blur-2xl" />
          
          <div className="relative">
            {/* Avatar and Badge */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full flex items-center justify-center text-2xl shadow-lg">
                👤
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                  <span className="text-lg text-[#3a2a1a]">Lv.{currentLevel} {currentStage.name}</span>
                </div>
                <p className="text-sm text-[#8a7a6a]">你已在 {cityCount} 座城市留下记忆</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#8a7a6a]">当前成长值 {currentPoints}</span>
                <span className="text-xs text-[#8a7a6a]">距离下一级还差 {pointsToNext}</span>
              </div>
              <div className="h-2 bg-[#e5e1db] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Next level indicator */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8a7a6a]">Lv.{currentLevel} {currentStage.name}</span>
              <span className="text-[#8a7a6a]">{nextStage ? `Lv.${nextStage.level} ${nextStage.name}` : "已满级"}</span>
            </div>
          </div>
        </div>

        {/* Growth Sources Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#8a7a6a]" />
            <h2 className="text-sm text-[#3a2a1a]">成长值来源</h2>
          </div>
          
          <div className="space-y-2">
            {growthSources.map((source) => {
              const Icon = source.icon;
              return (
                <div 
                  key={source.id}
                  className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(source.color)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#3a2a1a]">{source.title}</p>
                  </div>
                  <span className="text-xs text-orange-600 font-medium">{source.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level Stages Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-[#8a7a6a]" />
            <h2 className="text-sm text-[#3a2a1a]">等级阶段</h2>
          </div>

          <div className="space-y-3">
            {levelStages.map((stage) => {
              const isCurrent = stage.level === currentLevel;
              const isPassed = stage.level < currentLevel;
              
              return (
                <div 
                  key={stage.level}
                  className={`relative bg-white rounded-xl p-4 shadow-sm transition-all ${
                    isCurrent ? "ring-2 ring-orange-400 ring-offset-2" : ""
                  }`}
                >
                  {/* Timeline connector */}
                  {stage.level < levelStages.length && (
                    <div className="absolute left-8 top-full w-0.5 h-3 bg-[#e5e1db]" />
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCurrent 
                        ? "bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-lg" 
                        : isPassed
                        ? "bg-gradient-to-br from-orange-200 to-orange-100 text-orange-600"
                        : "bg-[#e5e1db] text-[#8a7a6a]"
                    }`}>
                      <span className="text-lg font-medium">Lv.{stage.level}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm mb-1 ${
                        isCurrent ? "text-orange-600 font-medium" : "text-[#3a2a1a]"
                      }`}>
                        {stage.name}
                      </h3>
                      <p className="text-xs text-[#8a7a6a]">
                        {stage.minPoints} - {stage.maxPoints === 9999 ? "∞" : stage.maxPoints} 成长值
                      </p>
                    </div>
                    {isCurrent && (
                      <div className="flex-shrink-0">
                        <div className="px-3 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                          当前
                        </div>
                      </div>
                    )}
                    {isPassed && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <p className="text-xs text-[#8a7a6a] text-center leading-relaxed">
            等级仅用于记录你的旅行足迹与记忆积累，不影响功能使用
          </p>
        </div>
      </div>
    </div>
  );
}
