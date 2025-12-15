import type { ComponentType } from "react";
import type { WidgetPermissions } from "./permissions";
import type { WidgetDataSources } from "./data/types";

/**
 * Widget manifest - metadata that describes a widget
 */
export interface WidgetManifest {
  /** Unique identifier for the widget (e.g., "coming-soon-card") */
  id: string;
  /** Display name for the widget */
  name: string;
  /** Brief description of what the widget does */
  description: string;
  /** Semantic version of the widget */
  version: string;
  /** Author or organization */
  author?: string;
  /** Widget icon (URL or component name) */
  icon?: string;
  /** Category for marketplace organization */
  category?: string;
  /** Tags for search and filtering */
  tags?: string[];
  /** Permissions required by this widget */
  permissions?: WidgetPermissions;
  /** Data sources configuration (REST, WebSocket, FileSystem) */
  dataSources?: WidgetDataSources;
  /** Default configuration values */
  defaultConfig?: Record<string, unknown>;
  /** Minimum/maximum size constraints */
  size?: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
}

/**
 * Platform capabilities available to widgets
 */
export interface PlatformCapabilities {
  /** Running in Electron desktop app */
  isElectron: boolean;
  /** Running as web application */
  isWeb: boolean;
  /** Running as installed PWA */
  isPWA: boolean;
  /** Platform-specific features available */
  features: {
    /** File system access available */
    fileSystem: boolean;
    /** Native notifications available */
    notifications: boolean;
    /** System tray available */
    systemTray: boolean;
    /** Offline mode supported */
    offline: boolean;
  };
}

/**
 * Theme information passed to widgets
 */
export interface WidgetTheme {
  /** Current theme mode */
  mode: "light" | "dark" | "system";
  /** Resolved theme (after system preference) */
  resolved: "light" | "dark";
}

/**
 * Context provided to widgets via useWidget hook
 */
export interface WidgetContext {
  /** Widget's own manifest */
  manifest: WidgetManifest;
  /** Widget-specific configuration from layout */
  config: Record<string, unknown>;
  /** Current theme information */
  theme: WidgetTheme;
  /** Platform capabilities */
  capabilities: PlatformCapabilities;
  /** Current tenant ID (for multi-tenant apps) */
  tenantId?: string;
}

/**
 * Props passed to widget components
 */
export interface WidgetProps {
  /** Widget configuration from layout config */
  config?: Record<string, unknown>;
  /** Additional class names */
  className?: string;
}

/**
 * Widget component type with manifest
 */
export interface WidgetDefinition {
  /** The React component */
  Widget: ComponentType<WidgetProps>;
  /** Widget manifest */
  manifest: WidgetManifest;
}

/**
 * Layout position for a widget instance
 */
export interface WidgetLayoutItem {
  /** Reference to widget ID from manifest */
  widgetId: string;
  /** Unique instance ID (for multiple instances of same widget) */
  instanceId: string;
  /** Grid column position */
  column?: number;
  /** Grid row position */
  row?: number;
  /** Column span */
  colSpan?: number;
  /** Row span */
  rowSpan?: number;
  /** Instance-specific configuration overrides */
  config?: Record<string, unknown>;
}

/**
 * Dashboard layout configuration
 */
export interface DashboardLayout {
  /** Layout identifier */
  id: string;
  /** Layout name */
  name: string;
  /** Grid column count */
  columns?: number;
  /** Gap between widgets */
  gap?: number;
  /** Widget instances in this layout */
  widgets: WidgetLayoutItem[];
}
