import { useState, useRef, MouseEvent } from "react";
import { useNavigate } from "react-router";
import { Home } from "lucide-react";

export function BackToHomeButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-visible group pulse-glow"
    >
      <Home className="w-5 h-5 text-orange-500 relative z-10" />
      
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 
              0 0 10px rgba(251, 146, 60, 0.3),
              0 0 20px rgba(251, 146, 60, 0.2),
              0 0 30px rgba(251, 146, 60, 0.1);
          }
          50% {
            box-shadow: 
              0 0 15px rgba(251, 146, 60, 0.5),
              0 0 30px rgba(251, 146, 60, 0.4),
              0 0 45px rgba(251, 146, 60, 0.2);
          }
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
          box-shadow: 
            0 0 10px rgba(251, 146, 60, 0.3),
            0 0 20px rgba(251, 146, 60, 0.2),
            0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .pulse-glow:hover {
          animation: none;
          box-shadow: 
            0 0 20px rgba(251, 146, 60, 0.6),
            0 0 40px rgba(251, 146, 60, 0.5),
            0 0 60px rgba(251, 146, 60, 0.3),
            0 0 80px rgba(251, 191, 60, 0.2);
          transform: scale(1.05);
          transition: all 0.3s ease;
        }
      `}</style>
    </button>
  );
}