import { Outlet, NavLink, useLocation } from "react-router";
import { Compass, Sparkles, BookHeart } from "lucide-react";
import { motion } from "motion/react";
import { TravelProvider } from "../context/TravelContext";

export function Layout() {
  return (
    <TravelProvider>
      <LayoutInner />
    </TravelProvider>
  );
}

function LayoutInner() {
  const location = useLocation();
  const appFrameStyle = {
    width: "min(390px, 100vw)",
    height: "min(844px, 100dvh)",
  } as const;

  const navShellStyle = {
    paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
  } as const;

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-stone-100/50 p-0 sm:p-4">
      {/* Mobile App Container */}
      <div
        className="relative flex w-full max-w-full flex-col overflow-hidden bg-[#FBF8F1] shadow-[0_0_60px_rgba(0,0,0,0.06)] sm:rounded-[2.5rem] sm:border-[6px] sm:border-white/80"
        style={appFrameStyle}
      >
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <Outlet />
        </main>

        {/* Bottom Navigation — always present; traveling full-screen map covers it via z-index */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 z-[15] w-full bg-gradient-to-t from-[#FBF8F1] via-[#FBF8F1]/95 to-transparent px-5 pt-6"
          style={navShellStyle}
        >
          <nav className="flex justify-around items-center bg-white/70 backdrop-blur-2xl py-2.5 px-4 rounded-2xl shadow-[0_4px_24px_rgba(180,140,100,0.08)] border border-white/50 pointer-events-auto">
            <NavItem to="/" icon={<Compass size={22} />} label="缘旅" current={location.pathname} />
            <NavItem to="/community" icon={<Sparkles size={22} />} label="发现" current={location.pathname} />
            <NavItem to="/memory" icon={<BookHeart size={22} />} label="记忆" current={location.pathname} />
          </nav>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function NavItem({ to, icon, label, current }: { to: string; icon: React.ReactNode; label: string; current: string }) {
  const isActive = to === "/" ? current === "/" : current.startsWith(to);

  return (
    <NavLink
      to={to}
      className="relative flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-all duration-300"
    >
      <div className="relative">
        <motion.div
          animate={{
            color: isActive ? "#b45309" : "#a8a29e",
            scale: isActive ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        {isActive && (
          <motion.div
            layoutId="navDot"
            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </div>
      <span
        className={`text-[10px] tracking-widest transition-colors duration-300 ${
          isActive ? "text-amber-700" : "text-stone-400"
        }`}
        style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: isActive ? 400 : 300 }}
      >
        {label}
      </span>
    </NavLink>
  );
}
