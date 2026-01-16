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
import defaultTenant from "./tenants/default.json";

export const layouts = {
  dashboard: dashboardLayout,
} as const;

export const tenants = {
  default: defaultTenant,
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
