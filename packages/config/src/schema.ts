/**
 * Widget position in layout grid
 */
export interface WidgetPosition {
  /** Widget ID from manifest */
  widgetId: string;
  /** Unique instance ID (auto-generated if not provided) */
  instanceId?: string;
  /** Grid column (1-based) */
  column?: number;
  /** Grid row (1-based) */
  row?: number;
  /** Column span */
  colSpan?: number;
  /** Row span */
  rowSpan?: number;
  /** Instance-specific config overrides */
  config?: Record<string, unknown>;
}

/**
 * Layout configuration schema
 */
export interface LayoutConfig {
  /** Layout identifier */
  id: string;
  /** Layout display name */
  name: string;
  /** Layout description */
  description?: string;
  /** Grid columns (default: 12) */
  columns?: number;
  /** Gap between widgets in pixels (default: 16) */
  gap?: number;
  /** Widgets in this layout */
  widgets: WidgetPosition[];
}

/**
 * Tenant configuration schema
 */
export interface TenantConfig {
  /** Tenant identifier */
  id: string;
  /** Tenant display name */
  name: string;
  /** Tenant logo URL */
  logo?: string;
  /** Primary layout to use */
  defaultLayout: string;
  /** Available layouts for this tenant */
  layouts?: string[];
  /** Feature flags */
  features?: {
    /** Can users customize dashboard */
    customizeDashboard?: boolean;
    /** Show marketplace */
    marketplace?: boolean;
    /** Enable dark mode */
    darkMode?: boolean;
  };
  /** Theme overrides */
  theme?: {
    /** Primary color (CSS color value) */
    primaryColor?: string;
    /** Accent color (CSS color value) */
    accentColor?: string;
  };
}

/**
 * Application configuration schema
 */
export interface AppConfig {
  /** Application name */
  appName: string;
  /** Application version */
  version: string;
  /** Default tenant */
  defaultTenant: string;
  /** Available tenants */
  tenants: Record<string, TenantConfig>;
  /** Available layouts */
  layouts: Record<string, LayoutConfig>;
}

/**
 * Generate a unique instance ID
 */
export function generateInstanceId(widgetId: string): string {
  return `${widgetId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Normalize widget positions (add missing instanceIds)
 */
export function normalizeLayout(layout: LayoutConfig): LayoutConfig {
  return {
    ...layout,
    widgets: layout.widgets.map((widget) => ({
      ...widget,
      instanceId: widget.instanceId ?? generateInstanceId(widget.widgetId),
    })),
  };
}

/**
 * Validate a layout configuration
 */
export function validateLayout(layout: unknown): layout is LayoutConfig {
  if (!layout || typeof layout !== "object") return false;

  const l = layout as Record<string, unknown>;

  if (typeof l.id !== "string" || !l.id) return false;
  if (typeof l.name !== "string" || !l.name) return false;
  if (!Array.isArray(l.widgets)) return false;

  for (const widget of l.widgets) {
    if (!widget || typeof widget !== "object") return false;
    if (typeof (widget as Record<string, unknown>).widgetId !== "string") return false;
  }

  return true;
}

/**
 * Validate a tenant configuration (basic validation)
 * @deprecated Use validateTenantWithAjv from ./validate for full JSON Schema validation
 */
export function validateTenant(tenant: unknown): tenant is TenantConfig {
  if (!tenant || typeof tenant !== "object") return false;

  const t = tenant as Record<string, unknown>;

  if (typeof t.id !== "string" || !t.id) return false;
  if (typeof t.name !== "string" || !t.name) return false;
  if (typeof t.defaultLayout !== "string" || !t.defaultLayout) return false;

  return true;
}
