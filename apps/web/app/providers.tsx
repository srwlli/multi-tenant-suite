"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { PlatformProvider } from "@platform/core";
import { createRegistry } from "../lib/registry";

// Create the registry once at module level
const registry = createRegistry();

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tenantId, setTenantId] = useState("default");

  // Handle mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for theme change events from widgets
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent<{ mode: string }>) => {
      const newMode = event.detail.mode;
      if (newMode === "light" || newMode === "dark" || newMode === "system") {
        setTheme(newMode);
      }
    };

    document.addEventListener(
      "platform:theme-change",
      handleThemeChange as EventListener
    );

    return () => {
      document.removeEventListener(
        "platform:theme-change",
        handleThemeChange as EventListener
      );
    };
  }, [setTheme]);

  // Listen for tenant change events from TenantSwitcher
  useEffect(() => {
    const handleTenantChange = (event: CustomEvent<{ tenantId: string }>) => {
      const newTenantId = event.detail.tenantId;
      if (newTenantId) {
        setTenantId(newTenantId);
      }
    };

    document.addEventListener(
      "platform:tenant-change",
      handleTenantChange as EventListener
    );

    return () => {
      document.removeEventListener(
        "platform:tenant-change",
        handleTenantChange as EventListener
      );
    };
  }, []);

  // Avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <PlatformProvider
      registry={registry}
      defaultTheme={(theme as "light" | "dark" | "system") ?? "system"}
      tenantId={tenantId}
      onTenantChange={setTenantId}
    >
      {children}
    </PlatformProvider>
  );
}
