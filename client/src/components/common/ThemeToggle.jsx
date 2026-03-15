import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const [animKey, setAnimKey] = useState(0);

  const handleClick = () => {
    setAnimKey((k) => k + 1);
    toggle();
  };

  return (
    <button
      onClick={handleClick}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        group relative overflow-hidden
        w-9 h-9 rounded-full flex items-center justify-center shrink-0
        transition-all duration-300 ease-out
        active:scale-90
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${isDark
          ? 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_14px_rgba(139,92,246,0.55)] hover:shadow-[0_0_22px_rgba(139,92,246,0.8)] hover:scale-110 focus-visible:ring-violet-400 dark:focus-visible:ring-offset-gray-900'
          : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_14px_rgba(251,146,60,0.5)] hover:shadow-[0_0_22px_rgba(251,146,60,0.75)] hover:scale-110 focus-visible:ring-amber-400'
        }
      `}
    >
      {/* Shimmer sweep on hover */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-in-out" />

      {/* Icon — re-keyed on every click to re-trigger the spring-in animation */}
      <span key={animKey} className="dv-theme-icon">
        {isDark
          ? <Moon className="w-4 h-4 text-white" fill="white" />
          : <Sun className="w-[18px] h-[18px] text-white" />
        }
      </span>
    </button>
  );
};

export default ThemeToggle;
