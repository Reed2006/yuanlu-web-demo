import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, MessageCircle, Calendar, Droplet, Sparkles, Check } from "lucide-react";
import { useAppState } from "../contexts/AppStateContext";
import type { NotificationItem as BackendNotification } from "../lib/types";

type NotificationType = "all" | "echo" | "memory" | "bottle";

function inferNotificationType(type: string): "echo_received" | "memory_replay" | "bottle_received" | "travel_ready" {
  if (type.includes("echo")) return "echo_received";
  if (type.includes("memory") || type.includes("replay")) return "memory_replay";
  if (type.includes("bottle")) return "bottle_received";
  if (type.includes("travel") || type.includes("diary")) return "travel_ready";
  return "travel_ready";
}

function inferTitle(type: string): string {
  const t = inferNotificationType(type);
  if (t === "echo_received") return "收到新的回响";
  if (t === "memory_replay") return "记忆回放";
  if (t === "bottle_received") return "远洋瓶动态";
  return "旅行通知";
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)} 天前`;
  return d.toLocaleDateString("zh-CN");
}

const typeConfig: Record<string, { icon: typeof Bell; color: string; bgColor: string }> = {
  echo_received: { icon: MessageCircle, color: "text-purple-500", bgColor: "bg-purple-50" },
  memory_replay: { icon: Calendar, color: "text-amber-500", bgColor: "bg-amber-50" },
  bottle_received: { icon: Droplet, color: "text-cyan-500", bgColor: "bg-cyan-50" },
  travel_ready: { icon: Sparkles, color: "text-orange-500", bgColor: "bg-orange-50" },
};

const filterTabs: { key: NotificationType; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "echo", label: "回响" },
  { key: "memory", label: "年度回忆" },
  { key: "bottle", label: "远洋瓶" },
];

export function NotificationCenter() {
  const navigate = useNavigate();
  const { notifications, loadNotifications } = useAppState();
  const [activeFilter, setActiveFilter] = useState<NotificationType>("all");

  useEffect(() => {
    loadNotifications().catch(() => undefined);
  }, [loadNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    const nType = inferNotificationType(n.type);
    if (activeFilter === "all") return true;
    if (activeFilter === "echo") return nType === "echo_received";
    if (activeFilter === "memory") return nType === "memory_replay";
    if (activeFilter === "bottle") return nType === "bottle_received";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = (notification: BackendNotification) => {
    const nType = inferNotificationType(notification.type);
    if (nType === "echo_received") {
      navigate("/yuan/capsule-echo");
    } else if (nType === "memory_replay" && notification.travel_id) {
      navigate("/diary");
    } else if (nType === "bottle_received") {
      navigate("/yuan/bottle-trajectory");
    } else if (nType === "travel_ready" && notification.travel_id) {
      navigate("/diary");
    }
  };

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#e5e1db]">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#3a2a1a]" />
            <span className="text-base text-[#3a2a1a]">通知中心</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="w-4" />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 px-5 pb-3">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                activeFilter === tab.key
                  ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md"
                  : "bg-white text-[#8a7a6a] border border-[#e5e1db]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#8a7a6a]">
            <Bell className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">暂无通知</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredNotifications.map((notification) => {
              const nType = inferNotificationType(notification.type);
              const config = typeConfig[nType] || typeConfig.travel_ready;
              const Icon = config.icon;
              const title = inferTitle(notification.type);

              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left rounded-2xl p-4 transition-all ${
                    notification.is_read
                      ? "bg-white/60"
                      : "bg-white shadow-md border border-orange-100"
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm ${notification.is_read ? "text-[#5a4a3a]" : "text-[#3a2a1a] font-medium"}`}>
                          {title}
                        </span>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#8a7a6a] leading-relaxed line-clamp-2">
                        {notification.content}
                      </p>
                      <span className="text-[10px] text-[#b5a595] mt-1.5 block">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
