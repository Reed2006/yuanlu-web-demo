import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  Mail,
  MapPin,
  Navigation,
} from "lucide-react";
import { useAppState } from "../../contexts/AppStateContext";

type BottleStatus = "all" | "drifting" | "received";

export function OceanBottleManagement() {
  const navigate = useNavigate();
  const { myBottles, loadMyBottles } = useAppState();
  const [selectedStatus, setSelectedStatus] = useState<BottleStatus>("all");

  useEffect(() => {
    loadMyBottles();
  }, []);

  const bottles = myBottles.map((item) => {
    const fmtDate = item.created_at
      ? new Date(item.created_at).toLocaleDateString("zh-CN")
      : "";
    const status =
      item.status === "delivered" || item.status === "received"
        ? "received"
        : "drifting";
    return {
      id: item.id,
      location: item.from.city || "未知海域",
      date: fmtDate,
      excerpt: item.content_preview || item.content || "一封漂流中的信...",
      status,
      fromCity: item.from.city || "未知",
      toCity: item.to?.city || null,
    };
  });

  const filteredBottles = bottles.filter((bottle) => {
    if (selectedStatus === "all") return true;
    return bottle.status === selectedStatus;
  });

  const getStatusColor = (status: string) => {
    return status === "drifting"
      ? "bg-cyan-100 text-cyan-700"
      : "bg-emerald-100 text-emerald-700";
  };

  const getStatusLabel = (status: string) => {
    return status === "drifting" ? "漂流中" : "已被收到";
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
            <h1 className="text-xl text-[#3a2a1a]">远洋瓶</h1>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2">
            {(
              [
                { key: "all", label: "全部" },
                { key: "drifting", label: "漂流中" },
                { key: "received", label: "已被收到" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`flex-1 px-4 py-1.5 rounded-full text-xs transition-colors ${
                  selectedStatus === tab.key
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-white"
                    : "bg-white text-[#8a7a6a] border border-[#e5e1db]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottle List */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {filteredBottles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-12 h-12 text-cyan-400" />
            </div>
            <p className="text-sm text-[#8a7a6a] text-center mb-6 leading-relaxed">
              你还没有把任何一句话交给远方
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white text-sm rounded-full shadow-lg hover:shadow-xl transition-shadow">
              去海边扔出第一只远洋瓶
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBottles.map((bottle) => (
              <button
                key={bottle.id}
                className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-50 to-transparent opacity-60 rounded-full blur-3xl" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-base text-[#3a2a1a] mb-1">
                        {bottle.location}
                      </h3>
                      <p className="text-xs text-[#8a7a6a]">{bottle.date}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5 text-cyan-600" />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#8a7a6a] line-clamp-2 leading-relaxed mb-3">
                    {bottle.excerpt}
                  </p>

                  {bottle.status === "received" && bottle.toCity && (
                    <div className="mb-3 p-2.5 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-cyan-700">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{bottle.fromCity}</span>
                        </div>
                        <div className="flex-1 mx-2 border-t border-dashed border-cyan-300 relative">
                          <Navigation className="w-3 h-3 text-cyan-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-700">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{bottle.toCity}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full ${getStatusColor(bottle.status)}`}
                    >
                      {getStatusLabel(bottle.status)}
                    </span>
                    {bottle.status === "received" && bottle.toCity && (
                      <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                        从{bottle.fromCity}漂到了{bottle.toCity}
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
