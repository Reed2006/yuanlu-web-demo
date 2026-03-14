import { ButtonHTMLAttributes, ReactNode } from "react";

interface PulseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "icon";
  size?: "sm" | "md" | "lg";
  glowColor?: string;
}

export function PulseButton({ 
  children, 
  variant = "primary", 
  size = "md",
  glowColor = "251, 146, 60", // orange-400/500
  className = "",
  ...props 
}: PulseButtonProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "px-6 py-2.5",
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-orange-400 to-orange-500 text-white",
    secondary: "bg-white/95 backdrop-blur-sm text-[#5a4a3a]",
    icon: "bg-white/95 backdrop-blur-sm",
  };

  return (
    <button
      className={`pulse-glow-button ${sizeClasses[size]} ${variantClasses[variant]} rounded-full shadow-lg flex items-center justify-center gap-2 text-sm ${className}`}
      style={{
        animation: 'pulse-glow-btn 2s ease-in-out infinite',
        boxShadow: `0 0 10px rgba(${glowColor}, 0.3), 0 0 20px rgba(${glowColor}, 0.2), 0 0 30px rgba(${glowColor}, 0.1), 0 2px 8px rgba(0, 0, 0, 0.1)`
      }}
      {...props}
    >
      {children}
      
      <style>{`
        @keyframes pulse-glow-btn {
          0%, 100% {
            box-shadow: 
              0 0 10px rgba(${glowColor}, 0.3),
              0 0 20px rgba(${glowColor}, 0.2),
              0 0 30px rgba(${glowColor}, 0.1),
              0 2px 8px rgba(0, 0, 0, 0.1);
          }
          50% {
            box-shadow: 
              0 0 15px rgba(${glowColor}, 0.5),
              0 0 30px rgba(${glowColor}, 0.4),
              0 0 45px rgba(${glowColor}, 0.2),
              0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }
        
        .pulse-glow-button:hover {
          animation: none;
          box-shadow: 
            0 0 20px rgba(${glowColor}, 0.6),
            0 0 40px rgba(${glowColor}, 0.5),
            0 0 60px rgba(${glowColor}, 0.3),
            0 0 80px rgba(251, 191, 60, 0.2),
            0 4px 12px rgba(0, 0, 0, 0.15);
          transform: scale(1.05);
          transition: all 0.3s ease;
        }
      `}</style>
    </button>
  );
}