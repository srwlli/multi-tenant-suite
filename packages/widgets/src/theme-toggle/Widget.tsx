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
    <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  dark: (
    <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  ),
  system: (
    <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
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
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors ${className}`}
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
        <span className="text-sm font-medium text-foreground">Theme</span>
      )}
      <div className="flex rounded-lg bg-secondary p-1 gap-1">
        {modes.map((mode) => (
          <button
            key={mode}
            onClick={() => handleThemeChange(mode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              theme.mode === mode
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={`Switch to ${mode} mode`}
          >
            {ThemeIcons[mode]}
            {showLabels && <span className="capitalize">{mode}</span>}
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        Current: {theme.resolved} mode
      </span>
    </div>
  );
}
