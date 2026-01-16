"use client";

import { Dashboard, DashboardSkeleton, usePlatform } from "@platform/core";
import { tenants, getLayout } from "@platform/config";
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
  const { tenantId, loading } = usePlatform();

  // Resolve tenant and layout
  const tenant = tenants[tenantId as keyof typeof tenants] || tenants.default;
  const layoutId = tenant.defaultLayout;
  const layout = getLayout(layoutId);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {layout ? (
        <Dashboard
          layout={layout as any}
          title={tenant.name || "Business Dashboard"}
          actions={<DashboardActions />}
        />
      ) : (
        <div className="p-8 text-center border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold text-destructive">Layout Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The layout "{layoutId}" could not be resolved. Please check your tenant configuration.
          </p>
        </div>
      )}
    </div>
  );
}
