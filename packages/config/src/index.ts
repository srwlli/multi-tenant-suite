// Schema types and utilities
export type {
  LayoutConfig,
  WidgetPosition,
  TenantConfig,
  AppConfig,
} from "./schema";

export {
  generateInstanceId,
  normalizeLayout,
  validateLayout,
  validateTenant,
} from "./schema";

// AJV-based validation (recommended)
export {
  validateTenantWithAjv,
  validateTenantWithErrors,
  formatValidationErrors,
  assertValidTenant,
} from "./validate";

// Default configurations
import dashboardLayout from "./layouts/dashboard.json";
import tier1Layout from "./layouts/tier1-basic.json";
import tier2Layout from "./layouts/tier2-pro.json";
import tier3Layout from "./layouts/tier3-enterprise.json";

import defaultTenant from "./tenants/default.json";
import demoTenant from "./tenants/demo-enterprise.json";

export const layouts = {
  dashboard: dashboardLayout,
  "tier1-basic": tier1Layout,
  "tier2-pro": tier2Layout,
  "tier3-enterprise": tier3Layout,
} as const;

export const tenants = {
  default: defaultTenant,
  "demo-enterprise": demoTenant,
} as const;

/**
 * Get a layout by ID
 */
export function getLayout(id: string): LayoutConfig | undefined {
  return (layouts as Record<string, LayoutConfig>)[id] ||
    Object.values(layouts).find(l => l.id === id);
}

/**
 * Get a tenant by ID
 */
export function getTenant(id: string): TenantConfig | undefined {
  return (tenants as Record<string, TenantConfig>)[id];
}

/**
 * Get default layout
 */
export function getDefaultLayout(): typeof dashboardLayout {
  return dashboardLayout;
}

/**
 * Get default tenant
 */
export function getDefaultTenant(): typeof defaultTenant {
  return defaultTenant;
}
