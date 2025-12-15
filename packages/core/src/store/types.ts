/**
 * Store Types for @platform/core
 * Zustand-based state management
 */

// ============================================================================
// App Store Types
// ============================================================================

export interface UserPreferences {
  /** Date format preference */
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  /** Currency display */
  currency: string;
  /** Locale for formatting */
  locale: string;
}

export interface AppState {
  /** Whether sidebar is collapsed */
  sidebarCollapsed: boolean;
  /** Current tenant ID */
  currentTenant: string | null;
  /** User preferences */
  preferences: UserPreferences;
  /** Recently accessed widget IDs */
  recentWidgets: string[];
}

export interface AppActions {
  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void;
  /** Set sidebar collapsed state */
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** Set current tenant */
  setCurrentTenant: (tenantId: string | null) => void;
  /** Update user preferences */
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  /** Add widget to recent list */
  addRecentWidget: (widgetId: string) => void;
  /** Reset app state */
  reset: () => void;
}

export type AppStore = AppState & AppActions;

// ============================================================================
// Widget Store Types
// ============================================================================

export type WidgetLoadingState = "idle" | "loading" | "success" | "error";

export interface WidgetInstance {
  /** Unique instance ID */
  id: string;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Widget type from registry */
  widgetId: string;
  /** Instance configuration */
  config: Record<string, unknown>;
  /** Loading state */
  loadingState: WidgetLoadingState;
  /** Error message if failed */
  error: string | null;
  /** Last updated timestamp */
  lastUpdated: number;
}

export interface WidgetState {
  /** Active widget instances by ID */
  instances: Record<string, WidgetInstance>;
  /** Currently focused widget */
  focusedWidget: string | null;
}

export interface WidgetActions {
  /** Add a widget instance */
  addWidget: (instance: Omit<WidgetInstance, "loadingState" | "error" | "lastUpdated">) => void;
  /** Remove a widget instance */
  removeWidget: (instanceId: string) => void;
  /** Update widget config */
  updateWidgetConfig: (instanceId: string, config: Record<string, unknown>) => void;
  /** Set widget loading state */
  setWidgetLoading: (instanceId: string, state: WidgetLoadingState, error?: string) => void;
  /** Set focused widget */
  setFocusedWidget: (instanceId: string | null) => void;
  /** Clear all widgets */
  clearWidgets: () => void;
}

export type WidgetStore = WidgetState & WidgetActions;

// ============================================================================
// Notification Store Types
// ============================================================================

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface Toast {
  /** Unique toast ID */
  id: string;
  /** Toast title */
  title: string;
  /** Toast description */
  description?: string;
  /** Toast variant */
  variant: ToastVariant;
  /** Duration in ms (0 = no auto-dismiss) */
  duration: number;
  /** Created timestamp */
  createdAt: number;
}

export interface NotificationState {
  /** Active toast queue */
  toasts: Toast[];
  /** Maximum toasts to show */
  maxToasts: number;
}

export interface NotificationActions {
  /** Add a toast notification */
  addToast: (toast: Omit<Toast, "id" | "createdAt">) => string;
  /** Dismiss a specific toast */
  dismissToast: (id: string) => void;
  /** Dismiss all toasts */
  dismissAll: () => void;
  /** Set max toasts */
  setMaxToasts: (max: number) => void;
}

export type NotificationStore = NotificationState & NotificationActions;

// ============================================================================
// Data Store Types
// ============================================================================

export interface CacheEntry<T = unknown> {
  /** Cached data */
  data: T;
  /** Cache timestamp */
  cachedAt: number;
  /** Time to live in ms */
  ttl: number;
  /** Cache key */
  key: string;
}

export type RequestState = "idle" | "pending" | "success" | "error";

export interface DataState {
  /** Cache entries by key */
  cache: Record<string, CacheEntry>;
  /** Request states by key */
  requestStates: Record<string, RequestState>;
  /** Request errors by key */
  errors: Record<string, string | null>;
}

export interface DataActions {
  /** Set cache entry */
  setCache: <T>(key: string, data: T, ttl?: number) => void;
  /** Get cache entry (returns undefined if expired) */
  getCache: <T>(key: string) => T | undefined;
  /** Invalidate cache entry */
  invalidateCache: (key: string) => void;
  /** Clear all cache */
  clearCache: () => void;
  /** Set request state */
  setRequestState: (key: string, state: RequestState, error?: string) => void;
  /** Check if cache is valid */
  isCacheValid: (key: string) => boolean;
}

export type DataStore = DataState & DataActions;
