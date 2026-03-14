import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, MessageCircle, User, ChevronRight, Map, Package, Mail, BookOpen, Star, LogOut } from "lucide-react";
import { useAppState } from "../contexts/AppStateContext";
import { isDemoMode, disableDemoMode } from "../lib/demoMode";

export function ProfileHome() {
  const navigate = useNavigate();
  const {
    travel,
    travelAnchors,
    travelHistory,
    myCapsules,
    myBottles,
    notifications,
    loadTravelHistory,
    loadMyCapsules,
    loadMyBottles,
    loadNotifications,
    logout,
  } = useAppState();
  const [activeTab, setActiveTab] = useState("me");

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      loadTravelHistory().catch(() => undefined),
      loadMyCapsules().catch(() => undefined),
      loadMyBottles().catch(() => undefined),
      loadNotifications().catch(() => undefined),
    ]).then(() => setDataLoaded(true));
  }, [loadMyBottles, loadMyCapsules, loadNotifications, loadTravelHistory]);

  // Calculate real user level from activity — must match UserLevel.tsx logic
  const completedTravels = travelHistory.filter(t => t.status === "ended" || t.status === "completed");
  const travelPoints = completedTravels.length * 20;
  const capsulePoints = myCapsules.length * 15;
  const bottlePoints = myBottles.length * 8;
  const echoCount = myCapsules.filter((c: any) => c.echo_count && c.echo_count > 0).reduce((sum: number, c: any) => sum + (c.echo_count || 0), 0);
  const echoPoints = echoCount * 10;
  const exportedCount = travelHistory.filter((t: any) => t.diary_status === "ready").length;
  const exportPoints = exportedCount * 12;
  const totalPoints = travelPoints + capsulePoints + bottlePoints + echoPoints + exportPoints;
  const levelThresholds = [
    { level: 1, name: "初行者", min: 0 },
    { level: 2, name: "留迹者", min: 100 },
    { level: 3, name: "记忆采集者", min: 300 },
    { level: 4, name: "记忆旅人", min: 600 },
    { level: 5, name: "时间见证者", min: 1000 },
  ];
  const currentLevelInfo = [...levelThresholds].reverse().find(l => totalPoints >= l.min) || levelThresholds[0];

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-b from-white to-[#f8f6f3] px-5 pt-4 pb-4">
          <h1 className="text-lg text-[#3a2a1a] mb-4">我的</h1>
          
          {/* User Profile Section */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full flex items-center justify-center text-2xl shadow-lg">
              👤
            </div>
            <div className="flex-1">
              <div className="text-base text-[#3a2a1a] mb-1">{currentLevelInfo.name}</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 bg-gradient-to-r from-orange-100 to-orange-50 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <span className="text-xs text-orange-600">
                    {`Lv.${currentLevelInfo.level}`}
                  </span>
                </div>
                <span className="text-xs text-[#8a7a6a]">
                  {currentLevelInfo.name}
                </span>
              </div>
              <div className="text-xs text-[#8a7a6a]">你已在 {new Set(travelHistory.map((item) => item.city).filter(Boolean)).size || 1} 座城市留下记忆</div>
            </div>
          </div>
        </div>

        {/* Memory Assets Overview */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => navigate("/profile/diary-management")} className="bg-white rounded-2xl p-4 shadow-sm text-left">
              <div className="text-2xl text-[#3a2a1a] mb-1">{travelHistory.length || (travel ? 1 : 0)}</div>
              <div className="text-xs text-[#8a7a6a]">我的旅记</div>
            </button>
            <button onClick={() => navigate("/profile/capsule-management")} className="bg-white rounded-2xl p-4 shadow-sm text-left">
              <div className="text-2xl text-[#3a2a1a] mb-1">{myCapsules.length}</div>
              <div className="text-xs text-[#8a7a6a]">时光胶囊</div>
            </button>
            <button onClick={() => navigate("/profile/ocean-bottle-management")} className="bg-white rounded-2xl p-4 shadow-sm text-left">
              <div className="text-2xl text-[#3a2a1a] mb-1">{myBottles.length}</div>
              <div className="text-xs text-[#8a7a6a]">远洋瓶</div>
            </button>
            <button onClick={() => navigate("/profile/city-footprint")} className="bg-white rounded-2xl p-4 shadow-sm text-left">
              <div className="text-2xl text-[#3a2a1a] mb-1">{new Set(travelHistory.map((item) => item.city).filter(Boolean)).size || 0}</div>
              <div className="text-xs text-[#8a7a6a]">城市足迹</div>
            </button>
          </div>

          {/* Function Entries */}
          <div className="space-y-3">
            {/* User Level */}
            <button
              onClick={() => navigate("/profile/user-level")}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm text-[#3a2a1a] mb-1">用户等级</div>
                <div className="text-xs text-[#8a7a6a]">查看成长进度与等级规则</div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#ccc5bb] flex-shrink-0" />
            </button>

            {/* Capsule Management */}
            <button
              onClick={() => navigate("/profile/capsule-management")}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm text-[#3a2a1a] mb-1">时光胶囊管理</div>
                <div className="text-xs text-[#8a7a6a]">
                  {myCapsules[0] ? `最新状态：${myCapsules[0].status}` : "暂无胶囊记录"}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#ccc5bb] flex-shrink-0" />
            </button>

            {/* Ocean Bottle Management */}
            <button
              onClick={() => navigate("/profile/ocean-bottle-management")}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-cyan-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm text-[#3a2a1a] mb-1">远洋瓶管理</div>
                <div className="text-xs text-[#8a7a6a]">
                  {myBottles[0] ? `状态：${myBottles[0].status}` : "还没有漂流记录"}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#ccc5bb] flex-shrink-0" />
            </button>

            {/* Diary Management */}
            <button
              onClick={() => navigate("/profile/diary-management")}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm text-[#3a2a1a] mb-1">日记管理</div>
                <div className="text-xs text-[#8a7a6a]">未读提醒 {notifications.length} 条</div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#ccc5bb] flex-shrink-0" />
            </button>
          </div>

          {/* Logout / Exit Demo Button */}
          {isDemoMode() ? (
            <button
              onClick={() => {
                disableDemoMode();
                logout();
                navigate("/auth", { replace: true });
              }}
              className="w-full mt-6 mb-4 py-3 flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-800 bg-purple-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>退出演示模式</span>
            </button>
          ) : (
            <button
              onClick={() => {
                logout();
                navigate("/auth");
              }}
              className="w-full mt-6 mb-4 py-3 flex items-center justify-center gap-2 text-sm text-[#8a7a6a] hover:text-[#5a4a3a] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>退出账号</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-white border-t border-[#e5e1db] px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => {
            setActiveTab("travel");
            navigate("/");
          }}
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors"
        >
          <MapPin className="w-5 h-5 text-[#8a7a6a]" />
          <span className="text-xs text-[#8a7a6a]">旅</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("yuan");
            navigate("/yuan");
          }}
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors"
        >
          <Users className="w-5 h-5 text-[#8a7a6a]" />
          <span className="text-xs text-[#8a7a6a]">缘</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("community");
            navigate("/community");
          }}
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-[#8a7a6a]" />
          <span className="text-xs text-[#8a7a6a]">社区</span>
        </button>
        <button
          onClick={() => setActiveTab("me")}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            activeTab === "me" ? "bg-orange-50" : ""
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === "me" ? "text-orange-500" : "text-[#8a7a6a]"}`} />
          <span className={`text-xs ${activeTab === "me" ? "text-orange-500" : "text-[#8a7a6a]"}`}>我的</span>
        </button>
      </div>
    </div>
  );
}
