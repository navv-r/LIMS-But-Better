"use client";

import { useState } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [spinning, setSpinning] = useState(false);

  function handleToggle() {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    toggleTheme();
  }

  return (
    <button
      onClick={handleToggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${spinning ? "orbit-fast" : ""}`}
      style={{
        background: "rgba(74,124,247,0.08)",
        border: "1px solid var(--border)",
        color: "var(--fg-secondary)",
        overflow: "visible",
      }}
    >
      <span className="orbit-particle" />
      <span className="orbit-particle" />
      <span className="orbit-particle" />

      <span
        className="relative z-10 flex"
        style={{ transform: "none" }}
      >
        {spinning ? (
          <span className="theme-icon-spinning flex">
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </span>
        ) : theme === "dark" ? (
          <SunIcon />
        ) : (
          <MoonIcon />
        )}
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
