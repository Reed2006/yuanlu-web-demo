import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { PulseButton } from "../../components/PulseButton";

export function CapsuleTimeLock() {
  const navigate = useNavigate();
  const [unlockDate, setUnlockDate] = useState("2027-03-09");
  const [isEnabled, setIsEnabled] = useState(true);

  const calculateYearsFromNow = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    const years = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.max(0, years).toFixed(1);
  };

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e1db]">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <span className="text-base text-[#3a2a1a]">时间锁设置</span>
          <div className="w-5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-slate-600" />
          </div>
        </div>

        {/* Description */}
        <div className="text-center mb-8">
          <h2 className="text-lg text-[#3a2a1a] mb-2">写给未来的信</h2>
          <p className="text-sm text-[#8a7a6a] leading-relaxed">
            设置时间锁后，这个胶囊将在未来的某一天才能被打开
          </p>
        </div>

        {/* Toggle */}
        <div className="mb-8">
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className="w-full bg-white border border-[#e5e1db] rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8a7a6a]" />
              <span className="text-sm text-[#3a2a1a]">启用时间锁</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${isEnabled ? "bg-slate-600" : "bg-[#e5e1db]"}`}>
              <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${isEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </div>
          </button>
        </div>

        {isEnabled && (
          <>
            {/* Date Picker */}
            <div className="mb-6">
              <div className="text-xs text-[#8a7a6a] mb-2">解锁日期</div>
              <div className="relative">
                <input
                  type="date"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  min={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  max={new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full px-4 py-3 pl-12 text-sm text-[#3a2a1a] bg-white border border-[#e5e1db] rounded-xl outline-none focus:border-slate-400"
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7a6a] pointer-events-none" />
              </div>
              <p className="text-xs text-[#b5a595] mt-2">
                最短 1 个月，最长 10 年
              </p>
            </div>

            {/* Preview Card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-light text-slate-700 mb-2">
                  {calculateYearsFromNow(unlockDate)}
                </div>
                <div className="text-xs text-slate-600 mb-4">年后</div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  {parseFloat(calculateYearsFromNow(unlockDate)) >= 3 
                    ? "三年后如果有人经过这里，希望你还好"
                    : parseFloat(calculateYearsFromNow(unlockDate)) >= 1
                    ? "一年后，愿这里的风景依然温柔"
                    : "几个月后，希望有人能读到这段话"
                  }
                </p>
              </div>
            </div>

            {/* Information */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs">
                  i
                </div>
                <div className="flex-1">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    在到达解锁日期之前，地图上仅显示为暗色光点，其他人无法打开这个胶囊
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#e5e1db] p-5">
        <PulseButton
          onClick={() => navigate(-1)}
          variant="primary"
          size="lg"
          className="w-full bg-gradient-to-r from-slate-500 to-slate-600"
          glowColor="100, 116, 139"
        >
          确认设置
        </PulseButton>
      </div>
    </div>
  );
}
