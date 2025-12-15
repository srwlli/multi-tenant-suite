"use client";

import { Dashboard, usePlatform } from "@platform/core";
import { layouts } from "@platform/config";
import { WidgetProvider } from "@platform/sdk";
import { ThemeToggle, themeToggleManifest } from "@platform/widgets";

function ThemeToggleButton() {
  const { theme, capabilities } = usePlatform();
  return (
    <WidgetProvider
      manifest={themeToggleManifest}
      config={{ showLabels: false, compact: true }}
      theme={theme}
      capabilities={capabilities}
    >
      <ThemeToggle />
    </WidgetProvider>
  );
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Dashboard
        layout={layouts.dashboard}
        title="Business Dashboard"
        actions={<ThemeToggleButton />}
      />
    </div>
  );
}
