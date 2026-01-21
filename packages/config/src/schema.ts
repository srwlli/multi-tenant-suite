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
 * Action configuration for conversion CTAs (v1 & v2)
 */
export interface ActionItem {
  /** Display label (e.g. "Call Now") */
  label: string;
  /** Action type */
  type: 'call' | 'text' | 'book' | 'inquiry' | 'link';
  /** Action value (phone number, link, etc.) */
  value: string;
  /** Whether this is a primary (high-contrast) action */
  primary?: boolean;
}

/**
 * Standard Widget-based Layout (V1)
 * Used for internal operations and utility dashboards.
 */
export interface LayoutConfig {
  id: string;
  name: string;
  description?: string;
  columns?: number;
  gap?: number;
  widgets: WidgetPosition[];
}

/**
 * Premium Landing Page Layout (V2 / Ethereal)
 * Used for high-end conversion pages (e.g. Euphoric Salon).
 */
export interface LandingPageLayoutConfig {
  id: string;
  name: string;
  hero: {
    headline: string;
    subheadline: string;
    tagline?: string;
  };
  sections: Array<{
    id: string;
    type: 'services' | 'about' | 'booking' | 'location' | 'grid';
    title: string;
    content?: Record<string, unknown>;
  }>;
  actions: {
    mode: 'header' | 'floating';
    items: ActionItem[];
  };
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
  /** Prototype/Mock-up URL */
  url?: string;
  /** Industry category */
  category?: string;
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
