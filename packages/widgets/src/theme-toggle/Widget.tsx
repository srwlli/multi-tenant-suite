"use client";

import { useWidget, type WidgetProps } from "@platform/sdk";

/**
 * Theme mode type
 */
type ThemeMode = "light" | "dark" | "system";

/**
 * Icons for theme modes
 */
const ThemeIcons: Record<string, React.ReactNode> = {
  light: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  dark: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  system: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

/**
 * Theme Toggle Widget
 * Allows users to switch between light, dark, and system themes
 *
 * Note: This widget emits a custom event that the platform provider listens to.
 * The actual theme change is handled by PlatformProvider.
 */
export function Widget({ className = "" }: WidgetProps) {
  const { config, theme } = useWidget();

  const showLabels = config.showLabels !== false;
  const compact = config.compact === true;

  const modes: ThemeMode[] = ["light", "dark", "system"];

  const handleThemeChange = (mode: ThemeMode) => {
    // Dispatch custom event for theme change
    // PlatformProvider will listen to this and update the theme
    const event = new CustomEvent("platform:theme-change", {
      detail: { mode },
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  if (compact) {
    // Compact mode: single button that cycles through modes
    const currentMode = theme.mode || "system";
    const currentIndex = modes.indexOf(currentMode as ThemeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    const icon = ThemeIcons[currentMode] || ThemeIcons.system;

    return (
      <button
        onClick={() => handleThemeChange(nextMode)}
        className={`flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors ${className}`}
        title={`Current: ${currentMode}. Click to switch to ${nextMode}`}
      >
        {icon}
        {showLabels && (
          <span className="text-sm capitalize">{currentMode}</span>
        )}
      </button>
    );
  }

  // Full mode: button group
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabels && (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme</span>
      )}
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 gap-1">
        {modes.map((mode) => (
          <button
            key={mode}
            onClick={() => handleThemeChange(mode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              theme.mode === mode
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
            title={`Switch to ${mode} mode`}
          >
            {ThemeIcons[mode]}
            {showLabels && <span className="capitalize">{mode}</span>}
          </button>
        ))}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Current: {theme.resolved} mode
      </span>
    </div>
  );
}
