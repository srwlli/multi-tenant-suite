/**
 * Data Source Types for Widget Integrations
 * Types and interfaces for REST, WebSocket, and File System data sources
 */

// ============================================================================
// Common Types
// ============================================================================

/** Data source type */
export type DataSourceType = "rest" | "websocket" | "filesystem";

/** Request/connection state */
export type DataStatus = "idle" | "loading" | "success" | "error" | "connecting" | "connected" | "disconnected";

/** Base data source configuration */
export interface DataSourceConfig {
  /** Data source type */
  type: DataSourceType;
  /** Unique identifier for this data source */
  id: string;
  /** Whether this data source is enabled */
  enabled?: boolean;
}

// ============================================================================
// REST API Types
// ============================================================================

/** HTTP methods supported */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** REST API configuration */
export interface RestApiConfig extends DataSourceConfig {
  type: "rest";
  /** API endpoint URL */
  url: string;
  /** HTTP method */
  method?: HttpMethod;
  /** Request headers */
  headers?: Record<string, string>;
  /** Auto-refresh interval in ms (0 = no refresh) */
  refreshInterval?: number;
  /** Cache TTL in ms (uses dataStore) */
  cacheTtl?: number;
  /** Request timeout in ms */
  timeout?: number;
}

/** REST API hook options */
export interface UseRestApiOptions<T = unknown> {
  /** Initial data before first fetch */
  initialData?: T;
  /** Whether to fetch on mount */
  fetchOnMount?: boolean;
  /** Transform response data */
  transform?: (data: unknown) => T;
  /** Request body for POST/PUT/PATCH */
  body?: unknown;
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/** REST API hook return type */
export interface UseRestApiResult<T = unknown> {
  /** Fetched data */
  data: T | undefined;
  /** Current status */
  status: DataStatus;
  /** Error if any */
  error: Error | null;
  /** Whether currently loading */
  isLoading: boolean;
  /** Whether fetch was successful */
  isSuccess: boolean;
  /** Whether there was an error */
  isError: boolean;
  /** Manually trigger fetch */
  refetch: () => Promise<void>;
  /** Invalidate cache and refetch */
  invalidate: () => Promise<void>;
}

// ============================================================================
// WebSocket Types
// ============================================================================

/** WebSocket configuration */
export interface WebSocketConfig extends DataSourceConfig {
  type: "websocket";
  /** WebSocket URL */
  url: string;
  /** Protocols */
  protocols?: string | string[];
  /** Auto-reconnect on disconnect */
  reconnect?: boolean;
  /** Max reconnection attempts (0 = infinite) */
  maxReconnectAttempts?: number;
  /** Initial reconnect delay in ms */
  reconnectDelay?: number;
  /** Max reconnect delay in ms */
  maxReconnectDelay?: number;
  /** Heartbeat interval in ms (0 = disabled) */
  heartbeatInterval?: number;
}

/** WebSocket hook options */
export interface UseWebSocketOptions<T = unknown> {
  /** Auto-connect on mount */
  connectOnMount?: boolean;
  /** Transform incoming messages */
  transform?: (data: unknown) => T;
  /** Callback on message received */
  onMessage?: (data: T) => void;
  /** Callback on open */
  onOpen?: (event: Event) => void;
  /** Callback on close */
  onClose?: (event: CloseEvent) => void;
  /** Callback on error */
  onError?: (event: Event) => void;
}

/** WebSocket hook return type */
export interface UseWebSocketResult<T = unknown> {
  /** Last received message */
  lastMessage: T | undefined;
  /** All received messages (limited buffer) */
  messages: T[];
  /** Current connection status */
  status: DataStatus;
  /** Whether connected */
  isConnected: boolean;
  /** Send message */
  send: (data: unknown) => void;
  /** Send JSON message */
  sendJson: (data: unknown) => void;
  /** Connect to WebSocket */
  connect: () => void;
  /** Disconnect from WebSocket */
  disconnect: () => void;
}

// ============================================================================
// File System Types (Electron Only)
// ============================================================================

/** File system operation type */
export type FileOperation = "read" | "write" | "watch" | "list";

/** File system configuration */
export interface FileSystemConfig extends DataSourceConfig {
  type: "filesystem";
  /** Base directory path */
  basePath?: string;
  /** Allowed file extensions */
  allowedExtensions?: string[];
}

/** File info */
export interface FileInfo {
  /** File name */
  name: string;
  /** Full path */
  path: string;
  /** File size in bytes */
  size: number;
  /** Is directory */
  isDirectory: boolean;
  /** Last modified timestamp */
  modifiedAt: number;
  /** Created timestamp */
  createdAt: number;
}

/** File system hook options */
export interface UseFileSystemOptions {
  /** Base path for all operations */
  basePath?: string;
  /** Encoding for text files */
  encoding?: BufferEncoding;
}

/** File system hook return type */
export interface UseFileSystemResult {
  /** Whether file system is available (Electron only) */
  isAvailable: boolean;
  /** Current status */
  status: DataStatus;
  /** Error if any */
  error: Error | null;
  /** Read file contents */
  readFile: (path: string) => Promise<string>;
  /** Read file as binary */
  readBinary: (path: string) => Promise<ArrayBuffer>;
  /** Write file */
  writeFile: (path: string, content: string) => Promise<void>;
  /** List directory contents */
  listDirectory: (path: string) => Promise<FileInfo[]>;
  /** Watch file for changes */
  watchFile: (path: string, callback: (event: FileWatchEvent) => void) => () => void;
  /** Check if file exists */
  exists: (path: string) => Promise<boolean>;
}

/** File watch event */
export interface FileWatchEvent {
  /** Event type */
  type: "change" | "rename" | "delete";
  /** File path */
  path: string;
  /** New content (for change events) */
  content?: string;
}

// ============================================================================
// Combined Data Source Config
// ============================================================================

/** Union of all data source configs */
export type AnyDataSourceConfig = RestApiConfig | WebSocketConfig | FileSystemConfig;

/** Widget data sources configuration */
export interface WidgetDataSources {
  /** REST API data sources */
  rest?: RestApiConfig[];
  /** WebSocket data sources */
  websocket?: WebSocketConfig[];
  /** File system data sources */
  filesystem?: FileSystemConfig[];
}
