// Types
export type {
  WidgetManifest,
  WidgetContext,
  WidgetTheme,
  WidgetProps,
  WidgetDefinition,
  WidgetLayoutItem,
  DashboardLayout,
  PlatformCapabilities,
} from "./types";

// Permissions
export type {
  WidgetPermissions,
  StoragePermission,
  NetworkPermission,
  NotificationPermission,
} from "./permissions";
export { DEFAULT_PERMISSIONS, hasPermission } from "./permissions";

// Events
export type {
  WidgetEventType,
  WidgetEventPayload,
  WidgetEvent,
  WidgetMountEvent,
  WidgetUnmountEvent,
  WidgetConfigChangeEvent,
  WidgetThemeChangeEvent,
  WidgetVisibilityChangeEvent,
  WidgetResizeEvent,
  WidgetEventHandler,
  WidgetEventCallbacks,
} from "./events";
export { createEventPayload } from "./events";

// Storage
export type {
  WidgetStorage,
  ObservableWidgetStorage,
  StorageItem,
  StorageSetOptions,
  StorageChangeEvent,
  StorageChangeListener,
  StorageEventType,
} from "./storage";
export { createStorageKey, parseStorageKey } from "./storage";

// Hooks (to be implemented in SDK-002)
export { useWidget, WidgetProvider } from "./useWidget";
export { useWidgetStorage } from "./useWidgetStorage";
export { useWidgetEvents } from "./useWidgetEvents";

// Data Hooks
export {
  // Types
  type DataSourceType,
  type DataStatus,
  type DataSourceConfig,
  type HttpMethod,
  type RestApiConfig,
  type UseRestApiOptions,
  type UseRestApiResult,
  type WebSocketConfig,
  type UseWebSocketOptions,
  type UseWebSocketResult,
  type FileOperation,
  type FileSystemConfig,
  type FileInfo,
  type UseFileSystemOptions,
  type UseFileSystemResult,
  type FileWatchEvent,
  type AnyDataSourceConfig,
  type WidgetDataSources,
  // Hooks
  useRestApi,
  useWebSocket,
  useFileSystem,
} from "./data";
