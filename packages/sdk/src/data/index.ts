/**
 * Data module exports
 * Hooks for REST API, WebSocket, and File System data sources
 */

// Types
export type {
  // Common
  DataSourceType,
  DataStatus,
  DataSourceConfig,
  // REST API
  HttpMethod,
  RestApiConfig,
  UseRestApiOptions,
  UseRestApiResult,
  // WebSocket
  WebSocketConfig,
  UseWebSocketOptions,
  UseWebSocketResult,
  // File System
  FileOperation,
  FileSystemConfig,
  FileInfo,
  UseFileSystemOptions,
  UseFileSystemResult,
  FileWatchEvent,
  // Combined
  AnyDataSourceConfig,
  WidgetDataSources,
} from "./types";

// Hooks
export { useRestApi } from "./useRestApi";
export { useWebSocket } from "./useWebSocket";
export { useFileSystem } from "./useFileSystem";
