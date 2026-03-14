import { createContext, useContext, useState, ReactNode } from "react";

export type ThemeType = "ocean" | "forest" | "urban" | "rainy" | "dusk" | "night" | "inkwash" | "default";

interface ThemeConfig {
  primary: string;
  background: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  atmosphere: string;
}

const themes: Record<ThemeType, ThemeConfig> = {
  default: {
    primary: "#fb923c",
    background: "#f8f6f3",
    cardBg: "#ffffff",
    textPrimary: "#3a2a1a",
    textSecondary: "#8a7a6a",
    accent: "#fb923c",
    atmosphere: "warm",
  },
  ocean: {
    primary: "#0077B6",
    background: "#f0f8ff",
    cardBg: "#ffffff",
    textPrimary: "#1a3a4a",
    textSecondary: "#5a7a8a",
    accent: "#00b4d8",
    atmosphere: "clear",
  },
  forest: {
    primary: "#2D6A4F",
    background: "#f5f9f6",
    cardBg: "#ffffff",
    textPrimary: "#1a3a2a",
    textSecondary: "#5a7a6a",
    accent: "#52b788",
    atmosphere: "fresh",
  },
  urban: {
    primary: "#2E4057",
    background: "#f3f4f6",
    cardBg: "#ffffff",
    textPrimary: "#1a2a3a",
    textSecondary: "#5a6a7a",
    accent: "#4a90e2",
    atmosphere: "rational",
  },
  rainy: {
    primary: "#4A6B8A",
    background: "#f5f7f9",
    cardBg: "#ffffff",
    textPrimary: "#2a3a4a",
    textSecondary: "#6a7a8a",
    accent: "#7aa2c4",
    atmosphere: "poetic",
  },
  dusk: {
    primary: "#8B5E3C",
    background: "#faf7f3",
    cardBg: "#ffffff",
    textPrimary: "#3a2a1a",
    textSecondary: "#8a7a6a",
    accent: "#d4a574",
    atmosphere: "nostalgic",
  },
  night: {
    primary: "#1A1A2E",
    background: "#0f0f1a",
    cardBg: "#1a1a2e",
    textPrimary: "#e5e5ea",
    textSecondary: "#8a8a9a",
    accent: "#4a4a6a",
    atmosphere: "serene",
  },
  inkwash: {
    primary: "#2C2C2C",
    background: "#F5F0E8",
    cardBg: "#ffffff",
    textPrimary: "#2C2C2C",
    textSecondary: "#6a6a6a",
    accent: "#8a8a8a",
    atmosphere: "eastern",
  },
};

interface ThemeContextType {
  theme: ThemeType;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>("default");

  const value = {
    theme,
    themeConfig: themes[theme],
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
