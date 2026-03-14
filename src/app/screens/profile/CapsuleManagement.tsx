import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Package, Lock, Eye, MessageCircle, Key } from "lucide-react";
import { useAppState } from "../../contexts/AppStateContext";

type CapsuleStatus = "all" | "locked" | "opened" | "undiscovered" | "replied";

export function CapsuleManagement() {
  const navigate = useNavigate();
  const { myCapsules, loadMyCapsules } = useAppState();
  const [selectedStatus, setSelectedStatus] = useState<CapsuleStatus>("all");

  useEffect(() => {
    loadMyCapsules();
  }, []);

  const capsules = myCapsules.map((item) => {
    const status = item.is_locked ? "locked" : item.status === "discovered" ? "opened" : "undiscovered";
    const fmtDate = item.created_at
      ? new Date(item.created_at).toLocaleDateString("zh-CN")
      : "";
    return {
      id: item.id,
      location: item.city || "未知地点",
      date: fmtDate,
      excerpt: item.yuan_ji_preview || "一段等待被发现的缘记...",
      status,
      unlockDate: item.time_lock_until
        ? new Date(item.time_lock_until).toLocaleDateString("zh-CN")
        : null,
      hasKey: Boolean(item.key_question),
      hasReply: item.echo_count > 0,
      replyCount: item.echo_count,
    };
  });

  const filteredCapsules = capsules.filter((capsule) => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "replied") return capsule.hasReply;
    return capsule.status === selectedStatus;
  });

  const getStatusLabel = (status: string) => {
    const labels = {
      locked: "时间锁中",
      opened: "已被打开",
      undiscovered: "尚未被发现",
    };
    return labels[status as keyof typeof labels] || "";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      locked: "bg-amber-100 text-amber-700",
      opened: "bg-emerald-100 text-emerald-700",
      undiscovered: "bg-slate-100 text-slate-600",
    };
    return colors[status as keyof typeof colors] || "";
  };

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e1db]">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/profile")} className="p-1">
              <ChevronLeft className="w-5 h-5 text-[#5a4a3a]" />
            </button>
            <h1 className="text-xl text-[#3a2a1a]">时光胶囊</h1>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(
              [
                { key: "all", label: "全部" },
                { key: "locked", label: "时间锁中" },
                { key: "opened", label: "已被打开" },
                { key: "undiscovered", label: "尚未被发现" },
                { key: "replied", label: "有回响" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs transition-colors ${
                  selectedStatus === tab.key
                    ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white"
                    : "bg-white text-[#8a7a6a] border border-[#e5e1db]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Capsule List */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {filteredCapsules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-50 rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-amber-400" />
            </div>
            <p className="text-sm text-[#8a7a6a] text-center mb-6 leading-relaxed">
              你还没有在任何地方留下写给未来的信
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-400 text-white text-sm rounded-full shadow-lg hover:shadow-xl transition-shadow">
              去留下第一枚胶囊
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCapsules.map((capsule) => (
              <button
                key={capsule.id}
                className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-50 to-transparent opacity-50 rounded-full blur-2xl" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-base text-[#3a2a1a] mb-1">
                        {capsule.location}
                      </h3>
                      <p className="text-xs text-[#8a7a6a]">{capsule.date}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {capsule.hasKey && (
                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                          <Key className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                      )}
                      {capsule.status === "locked" && (
                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                      )}
                      {capsule.status === "opened" && (
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-[#8a7a6a] line-clamp-2 leading-relaxed mb-3">
                    {capsule.excerpt}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full ${getStatusColor(capsule.status)}`}
                    >
                      {getStatusLabel(capsule.status)}
                    </span>
                    {capsule.unlockDate && (
                      <span className="px-2.5 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                        解锁于 {capsule.unlockDate}
                      </span>
                    )}
                    {capsule.hasReply && (
                      <span className="px-2.5 py-1 text-xs rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        有人留下了回响{" "}
                        {capsule.replyCount > 0 && `(${capsule.replyCount})`}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
