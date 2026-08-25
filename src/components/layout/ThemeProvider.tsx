"use client";

import { Moon, Sun } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";

const THEME_STORAGE_KEY = "riskq_admin_theme";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme: Theme = savedTheme === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  function toggleTheme() {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      return nextTheme;
    });
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to night mode"}
      title={isDark ? "Switch to light mode" : "Switch to night mode"}
      className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-all duration-150 hover:bg-primary-light/40 hover:text-primary active:scale-90 dark:hover:bg-primary-light/10"
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
