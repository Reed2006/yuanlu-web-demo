import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { MapPin } from "lucide-react";
import { useAppState } from "../contexts/AppStateContext";

export function TravelTransition() {
  const navigate = useNavigate();
  const { startTravel, travel } = useAppState();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // If travel is already active AND recent (within last minute), resume recording
    // instead of creating a new one. Otherwise start fresh — the backend will
    // auto-end any stale active travels.
    if (travel?.id && travel.status === "active") {
      navigate("/recording", { replace: true });
      return;
    }

    startTravel()
      .then(() => {
        navigate("/recording", { replace: true });
      })
      .catch(() => {
        setErrorMsg("启动旅行失败，请重试");
      });
  }, []);

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden relative flex items-center justify-center">
      <div className="text-center px-8">
        {errorMsg ? (
          <>
            <div className="text-base text-[#3a2a1a] mb-4">{errorMsg}</div>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 rounded-full bg-orange-400 text-white text-sm"
            >
              返回首页
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div className="text-base text-[#3a2a1a] mb-2">正在开启旅行...</div>
            <div className="text-sm text-[#8a7a6a]">准备记录你的精彩旅程</div>
          </>
        )}
      </div>
    </div>
  );
}
