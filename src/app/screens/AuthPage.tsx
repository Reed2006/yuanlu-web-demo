import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Eye, EyeOff, Camera, Mic, Navigation, Shield, ChevronRight, Compass, Sparkles, Droplet, MessageCircle, BookOpen, Play } from "lucide-react";
import { PulseButton } from "../components/PulseButton";
import { useAppState } from "../contexts/AppStateContext";
import { disableDemoMode, enableDemoMode, ensureDemoSession, isDemoMode } from "../lib/demoMode";

type AuthMode = "login" | "register";

interface PermissionItem {
  id: string;
  icon: typeof Camera;
  title: string;
  description: string;
  required: boolean;
}

const permissions: PermissionItem[] = [
  {
    id: "location",
    icon: Navigation,
    title: "位置信息",
    description: "用于记录旅行轨迹、生成锚点、发现附近的时空胶囊和远洋瓶",
    required: true,
  },
  {
    id: "camera",
    icon: Camera,
    title: "相机权限",
    description: "用于拍摄旅途照片、AR寻找胶囊体验",
    required: true,
  },
  {
    id: "microphone",
    icon: Mic,
    title: "麦克风权限",
    description: "用于录制旅途语音备忘，AI 将自动转写为文字",
    required: false,
  },
];

export function AuthPage() {
  const navigate = useNavigate();
  const appState = useAppState();
  const { login, register: doRegister, apiBase } = appState;
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  // Permission states
  const [acceptedPermissions, setAcceptedPermissions] = useState<Set<string>>(new Set());
  const [allAccepted, setAllAccepted] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    setAuthError("");
    setSubmitting(true);
    try {
      const res = await login(username.trim(), password);
      localStorage.setItem("yuanlv_user", JSON.stringify({ username, userId: res.user_id, nickname: res.nickname, loggedIn: true }));
      const hasOnboarded = localStorage.getItem("yuanlv_onboarded");
      if (hasOnboarded) {
        navigate("/");
      } else {
        setShowOnboarding(true);
      }
    } catch (err: any) {
      setAuthError(err?.message || "登录失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) return;
    if (password.length < 4) return;
    setAuthError("");
    setSubmitting(true);
    try {
      const res = await doRegister(username.trim(), password, nickname || undefined);
      localStorage.setItem("yuanlv_user", JSON.stringify({ username, userId: res.user_id, nickname: res.nickname, loggedIn: true }));
      setShowOnboarding(true);
    } catch (err: any) {
      setAuthError(err?.message || "注册失败");
    } finally {
      setSubmitting(false);
    }
  };

  const requestRealPermission = async (id: string) => {
    try {
      if (id === "location") {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(() => resolve(), (err) => reject(err), { timeout: 10000 });
        });
      } else if (id === "camera") {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
      } else if (id === "microphone") {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
      return true;
    } catch {
      return false;
    }
  };

  const togglePermission = async (id: string) => {
    if (acceptedPermissions.has(id)) {
      setAcceptedPermissions((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }
    const granted = await requestRealPermission(id);
    if (granted) {
      setAcceptedPermissions((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  const handleAcceptAll = async () => {
    const results = new Set<string>();
    for (const perm of permissions) {
      const granted = await requestRealPermission(perm.id);
      if (granted) results.add(perm.id);
    }
    setAcceptedPermissions(results);
    setAllAccepted(results.size === permissions.length);
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem("yuanlv_onboarded", "true");
    localStorage.setItem("yuanlv_permissions", JSON.stringify(Array.from(acceptedPermissions)));
    setShowOnboarding(false);
    setShowGuide(true);
    setGuideStep(0);
  };

  const guidePages = [
    {
      icon: Compass,
      color: "from-orange-400 to-orange-500",
      title: "旅 · 一键记录旅行",
      desc: "长按「一键记录」按钮开启旅行模式，GPS 自动追踪轨迹，AI 感知周围场景并自动生成锚点。用右上角 + 号手动创建记忆锚点。",
    },
    {
      icon: Sparkles,
      color: "from-purple-400 to-pink-400",
      title: "缘 · 时空胶囊与远洋瓶",
      desc: "在「缘」页面埋下时空胶囊，或投放远洋瓶传递心意。靠近海边时可拾取他人的远洋瓶，发现来自远方的故事。",
    },
    {
      icon: MessageCircle,
      color: "from-cyan-400 to-blue-400",
      title: "社区 · 旅行树洞",
      desc: "浏览他人的匿名旅行故事，也可以将自己的旅行日记分享到社区树洞，与同行者产生共鸣。",
    },
    {
      icon: BookOpen,
      color: "from-amber-400 to-orange-400",
      title: "日记 · AI 合成旅记",
      desc: "结束旅行后，AI 会自动将你的轨迹、照片、语音合成为一篇精美的旅行日记，可导出分享。",
    },
  ];

  const requiredAccepted = permissions
    .filter((p) => p.required)
    .every((p) => acceptedPermissions.has(p.id));

  // Guide Screen — shown after onboarding permissions
  if (showGuide) {
    const page = guidePages[guideStep];
    const Icon = page.icon;
    const isLast = guideStep === guidePages.length - 1;

    return (
      <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
        {/* Skip */}
        <div className="flex justify-end px-6 pt-10">
          <button onClick={() => navigate("/")} className="text-xs text-[#b5a595]">跳过</button>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${page.color} flex items-center justify-center shadow-xl mb-8`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-lg text-[#3a2a1a] mb-3 text-center">{page.title}</h2>
          <p className="text-sm text-[#8a7a6a] leading-relaxed text-center max-w-[280px]">{page.desc}</p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {guidePages.map((_, i) => (
            <div key={i} className={`rounded-full transition-all ${i === guideStep ? "w-6 h-2 bg-orange-400" : "w-2 h-2 bg-[#d5d1cb]"}`} />
          ))}
        </div>

        {/* Buttons */}
        <div className="px-6 pb-8 space-y-3">
          <PulseButton
            onClick={() => {
              if (isLast) {
                navigate("/");
              } else {
                setGuideStep((s) => s + 1);
              }
            }}
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500"
          >
            {isLast ? "开始探索" : "下一步"}
            <ChevronRight className="w-4 h-4" />
          </PulseButton>
        </div>
      </div>
    );
  }

  // Onboarding / Privacy Notice Screen
  if (showOnboarding) {
    return (
      <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-orange-500" />
            <h1 className="text-xl text-[#3a2a1a]">隐私与权限</h1>
          </div>
          <p className="text-sm text-[#8a7a6a] leading-relaxed">
            欢迎来到缘旅！为了提供完整的旅行记忆体验，我们需要获取以下权限。授权后不再重复请求。
          </p>
        </div>

        {/* Permission Cards */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-3">
            {permissions.map((perm) => {
              const Icon = perm.icon;
              const isAccepted = acceptedPermissions.has(perm.id);
              
              return (
                <button
                  key={perm.id}
                  onClick={() => togglePermission(perm.id)}
                  className={`w-full text-left rounded-2xl p-4 transition-all border-2 ${
                    isAccepted
                      ? "bg-orange-50 border-orange-300"
                      : "bg-white border-[#e5e1db]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isAccepted ? "bg-orange-100" : "bg-[#f8f6f3]"
                    }`}>
                      <Icon className={`w-5 h-5 ${isAccepted ? "text-orange-500" : "text-[#8a7a6a]"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-[#3a2a1a] font-medium">{perm.title}</span>
                        {perm.required && (
                          <span className="text-[10px] text-red-400 bg-red-50 px-1.5 py-0.5 rounded">必要</span>
                        )}
                      </div>
                      <p className="text-xs text-[#8a7a6a] leading-relaxed">{perm.description}</p>
                    </div>
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isAccepted ? "bg-orange-500 border-orange-500" : "border-[#d5d1cb]"
                    }`}>
                      {isAccepted && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-xs text-blue-700 font-medium mb-2">隐私承诺</h3>
            <ul className="text-[11px] text-blue-600/80 space-y-1.5">
              <li>• 位置数据仅用于旅行记录功能，不会持续追踪</li>
              <li>• 照片仅在你主动拍摄时采集，不会后台访问相册</li>
              <li>• 语音数据仅用于转写文字，处理后即删除原始音频</li>
              <li>• 所有个人数据加密存储，不与第三方共享</li>
              <li>• 你可以随时在设置中修改权限或删除数据</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 space-y-3 border-t border-[#e5e1db]">
          {!allAccepted && (
            <button
              onClick={handleAcceptAll}
              className="w-full py-3 text-sm text-orange-500 font-medium"
            >
              一键全部授权
            </button>
          )}
          <PulseButton
            onClick={handleFinishOnboarding}
            disabled={!requiredAccepted}
            variant="primary"
            size="lg"
            className={`w-full ${
              requiredAccepted
                ? "bg-gradient-to-r from-orange-400 to-orange-500"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            开始旅程
            <ChevronRight className="w-4 h-4" />
          </PulseButton>
          <p className="text-[10px] text-[#b5a595] text-center">
            点击「开始旅程」即表示你同意《用户协议》和《隐私政策》
          </p>
        </div>
      </div>
    );
  }

  // Main Auth Screen
  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Top Visual */}
      <div className="relative h-[280px] bg-gradient-to-br from-orange-400 via-orange-300 to-amber-200 flex flex-col items-center justify-end pb-8">
        {/* Decorative elements */}
        <div className="absolute top-8 left-8 w-16 h-16 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-16 right-12 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-12 left-16 w-12 h-12 bg-white/15 rounded-full blur-lg" />
        
        {/* Logo & Title */}
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl text-white font-medium mb-1">缘旅</h1>
          <p className="text-sm text-white/80">让旅行更容易被记录，让旅行多一些连结</p>
        </div>

        {/* Curved bottom */}
        <div className="absolute -bottom-1 inset-x-0">
          <svg viewBox="0 0 390 30" fill="#f8f6f3" className="w-full">
            <path d="M0,30 Q195,0 390,30 L390,30 L0,30 Z" />
          </svg>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 overflow-y-auto px-6 pt-4">
        {/* Tab Switch */}
        <div className="flex items-center gap-1 bg-white rounded-full p-1 mb-6 shadow-sm">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 rounded-full text-sm transition-all ${
              mode === "login"
                ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md"
                : "text-[#8a7a6a]"
            }`}
          >
            登录
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2.5 rounded-full text-sm transition-all ${
              mode === "register"
                ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md"
                : "text-[#8a7a6a]"
            }`}
          >
            注册
          </button>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#8a7a6a] mb-1.5 block">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入用户名"
              className="w-full px-4 py-3 bg-white rounded-xl border border-[#e5e1db] text-sm text-[#3a2a1a] placeholder:text-[#b5a595] outline-none focus:border-orange-300 transition-colors"
              autoComplete="username"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="text-xs text-[#8a7a6a] mb-1.5 block">昵称（可选）</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="给自己取个旅途名字"
                className="w-full px-4 py-3 bg-white rounded-xl border border-[#e5e1db] text-sm text-[#3a2a1a] placeholder:text-[#b5a595] outline-none focus:border-orange-300 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-[#8a7a6a] mb-1.5 block">密码</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "设置密码（至少4位）" : "输入密码"}
                className="w-full px-4 py-3 bg-white rounded-xl border border-[#e5e1db] text-sm text-[#3a2a1a] placeholder:text-[#b5a595] outline-none focus:border-orange-300 transition-colors pr-12"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-[#8a7a6a]" />
                ) : (
                  <Eye className="w-4 h-4 text-[#8a7a6a]" />
                )}
              </button>
            </div>
            {mode === "register" && password.length > 0 && password.length < 4 && (
              <p className="text-[11px] text-red-400 mt-1">密码至少需要 4 个字符</p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {authError && (
          <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-xs text-red-500 text-center">{authError}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6">
          <PulseButton
            onClick={mode === "login" ? handleLogin : handleRegister}
            variant="primary"
            size="lg"
            className={`w-full ${
              username.trim() && password.trim() && (mode === "login" || password.length >= 4) && !submitting
                ? "bg-gradient-to-r from-orange-400 to-orange-500"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={!username.trim() || !password.trim() || (mode === "register" && password.length < 4) || submitting}
          >
            {submitting ? "请稍候…" : mode === "login" ? "登录" : "注册"}
          </PulseButton>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#e5e1db]" />
          <span className="text-xs text-[#b5a595]">或</span>
          <div className="flex-1 h-px bg-[#e5e1db]" />
        </div>

        {/* Anonymous Entry */}
        <button
          onClick={async () => {
            const anonUsername = `anon_${crypto.randomUUID().slice(0, 8)}`;
            const anonPassword = crypto.randomUUID().slice(0, 12);
            setSubmitting(true);
            setAuthError("");
            try {
              // Register anonymous user through the standard AppState register flow
              // This ensures userId is properly set in context
              const res = await doRegister(anonUsername, anonPassword, "匿名旅人");
              localStorage.setItem(
                "yuanlv_user",
                JSON.stringify({ userId: res.user_id, anonymous: true, loggedIn: true }),
              );
            } catch {
              // If registration fails (e.g. server unreachable), try login with fallback
              try {
                const res = await login(anonUsername, anonPassword);
                localStorage.setItem(
                  "yuanlv_user",
                  JSON.stringify({ userId: res.user_id, anonymous: true, loggedIn: true }),
                );
              } catch {
                // Final fallback: cannot use app without server
                setAuthError("无法连接服务器，请检查网络后重试");
                setSubmitting(false);
                return;
              }
            } finally {
              setSubmitting(false);
            }
            const hasOnboarded = localStorage.getItem("yuanlv_onboarded");
            if (hasOnboarded) {
              navigate("/");
            } else {
              setShowOnboarding(true);
            }
          }}
          disabled={submitting}
          className="w-full py-3 bg-white rounded-xl border border-[#e5e1db] text-sm text-[#5a4a3a] hover:bg-[#f8f6f3] transition-colors"
        >
          {submitting ? "请稍候…" : "匿名体验"}
        </button>

        <p className="text-[10px] text-[#b5a595] text-center mt-4 leading-relaxed">
          匿名用户的数据仅存储在本地，升级账号后可同步到云端
        </p>

        {/* Demo Mode Entry */}
        <div className="mt-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-[#e5e1db]" />
            <span className="text-xs text-[#b5a595]">演示</span>
            <div className="flex-1 h-px bg-[#e5e1db]" />
          </div>
          <button
            onClick={() => {
              enableDemoMode();
              ensureDemoSession();
              // Force full page reload to re-initialize state with demo data
              window.location.replace(`${window.location.pathname}${window.location.search}#/`);
            }}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-sm text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4" />
            进入演示模式
          </button>
          <p className="text-[10px] text-[#b5a595] text-center mt-2 leading-relaxed">
            无需后端服务，展示全部核心功能
          </p>
        </div>
      </div>
    </div>
  );
}
