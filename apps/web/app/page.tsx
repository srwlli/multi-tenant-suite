"use client";

import { Dashboard, usePlatform } from "@platform/core";
import { layouts, tenants } from "@platform/config";
import { WidgetProvider } from "@platform/sdk";
import { ThemeToggle, themeToggleManifest } from "@platform/widgets";
import { TenantSwitcher, type TenantInfo } from "@platform/ui";

// Convert tenant configs to TenantInfo format
const availableTenants: TenantInfo[] = Object.values(tenants).map((t) => ({
  id: t.id,
  name: t.name,
}));

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

function TenantSwitcherButton() {
  const { tenantId } = usePlatform();
  return (
    <TenantSwitcher
      tenantId={tenantId}
      availableTenants={availableTenants}
    />
  );
}

function DashboardActions() {
  return (
    <div className="flex items-center gap-2">
      <TenantSwitcherButton />
      <ThemeToggleButton />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Dashboard
        layout={layouts.dashboard}
        title="Business Dashboard"
        actions={<DashboardActions />}
      />
    </div>
  );
}
