"use client";

import { useWidget, type WidgetProps } from "@platform/sdk";
import { ThemeToggle } from "@platform/ui";

/**
 * Theme Toggle Widget
 * Wraps the ThemeToggle component from @platform/ui for use in widget grids.
 */
export function Widget({ className = "" }: WidgetProps) {
  const { config, theme } = useWidget();

  return (
    <ThemeToggle
      mode={theme.mode as "light" | "dark" | "system"}
      showLabels={config.showLabels !== false}
      compact={config.compact === true}
      className={className}
    />
  );
}
