"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { PlatformCapabilities, WidgetTheme } from "@platform/sdk";
import { detectCapabilities } from "./capabilities";
import type { WidgetRegistry } from "../dashboard/WidgetRegistry";

/**
 * Platform context value
 */
export interface PlatformContextValue {
  /** Current platform capabilities */
  capabilities: PlatformCapabilities;
  /** Current theme settings */
  theme: WidgetTheme;
  /** Set theme mode */
  setTheme: (mode: "light" | "dark" | "system") => void;
  /** Current tenant ID */
  tenantId: string;
  /** Widget registry */
  registry: WidgetRegistry | null;
  /** Loading state */
  loading: boolean;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

/**
 * Props for PlatformProvider
 */
export interface PlatformProviderProps {
  /** Child components */
  children: ReactNode;
  /** Initial theme mode */
  defaultTheme?: "light" | "dark" | "system";
  /** Tenant identifier */
  tenantId?: string;
  /** Widget registry instance */
  registry?: WidgetRegistry | null;
  /** Force specific capabilities (for testing) */
  capabilities?: PlatformCapabilities;
}

/**
 * Get system preferred color scheme
 */
function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Platform provider component
 * Provides platform capabilities, theme, and registry to all children
 */
export function PlatformProvider({
  children,
  defaultTheme = "system",
  tenantId = "default",
  registry = null,
  capabilities: forcedCapabilities,
}: PlatformProviderProps): ReactNode {
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(
    defaultTheme
  );
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [capabilities, setCapabilities] = useState<PlatformCapabilities>(
    forcedCapabilities ?? {
      isElectron: false,
      isWeb: true,
      isPWA: false,
      features: {
        fileSystem: false,
        notifications: false,
        systemTray: false,
        offline: false,
      },
    }
  );

  // Detect capabilities on mount
  useEffect(() => {
    if (!forcedCapabilities) {
      setCapabilities(detectCapabilities());
    }
    setLoading(false);
  }, [forcedCapabilities]);

  // Handle theme mode changes
  useEffect(() => {
    const resolved = themeMode === "system" ? getSystemTheme() : themeMode;
    setResolvedTheme(resolved);

    // Apply to document
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolved);
    }
  }, [themeMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  // Listen for theme change events from widgets
  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode: "light" | "dark" | "system" }>;
      setThemeMode(customEvent.detail.mode);
    };

    document.addEventListener("platform:theme-change", handleThemeChange);
    return () => {
      document.removeEventListener("platform:theme-change", handleThemeChange);
    };
  }, []);

  const theme: WidgetTheme = useMemo(
    () => ({
      mode: themeMode,
      resolved: resolvedTheme,
    }),
    [themeMode, resolvedTheme]
  );

  const contextValue = useMemo<PlatformContextValue>(
    () => ({
      capabilities,
      theme,
      setTheme: setThemeMode,
      tenantId,
      registry,
      loading,
    }),
    [capabilities, theme, tenantId, registry, loading]
  );

  return (
    <PlatformContext.Provider value={contextValue}>
      {children}
    </PlatformContext.Provider>
  );
}

/**
 * Hook to access platform context
 */
export function usePlatform(): PlatformContextValue {
  const context = useContext(PlatformContext);

  if (!context) {
    throw new Error(
      "usePlatform must be used within a PlatformProvider. " +
        "Wrap your app with <PlatformProvider>."
    );
  }

  return context;
}

/**
 * Hook to access just the theme
 */
export function useTheme(): Pick<PlatformContextValue, "theme" | "setTheme"> {
  const { theme, setTheme } = usePlatform();
  return { theme, setTheme };
}

/**
 * Hook to access just the capabilities
 */
export function usePlatformCapabilities(): PlatformCapabilities {
  const { capabilities } = usePlatform();
  return capabilities;
}
