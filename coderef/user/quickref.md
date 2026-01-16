# Business Dashboard - Quick Reference

Scannable quick reference for the Business Dashboard platform.

## At a Glance

- **Widget-based dashboard** - Compose dashboards from configurable, self-contained widgets
- **Platform-agnostic** - Single codebase works on Web, PWA, and Electron Desktop
- **Multi-tenant support** - Isolated configurations for different tenants
- **Data integration** - REST API, WebSocket, and File System data sources
- **Type-safe development** - Full TypeScript coverage with strict type checking

## Actions/Commands

| Action | Purpose | Time/Speed |
|--------|---------|------------|
| `npm run dev` | Start all development servers | ~5s |
| `npm run dev:web` | Start web app (Next.js) | ~3s |
| `npm run dev:desktop` | Start Electron desktop app | ~5s |
| `npm run build` | Build all packages and apps | ~30-60s |
| `npm run typecheck` | Type check all packages | ~10-20s |
| `npm test` | Run tests in watch mode | ~2s initial |
| `npm run lint` | Lint all packages | ~5-10s |

## Features/Tools

### Widget Development

| Feature | Description | Location |
|---------|-------------|----------|
| Widget Registry | Centralized widget management | `packages/core/src/dashboard/WidgetRegistry.ts` |
| Layout Engine | CSS Grid-based widget renderer | `packages/core/src/dashboard/LayoutEngine.tsx` |
| Widget SDK | Hooks and APIs for widgets | `packages/sdk/src/` |
| Widget Storage | Isolated storage with TTL | `packages/sdk/src/storage.ts` |
| Widget Events | Lifecycle event system | `packages/sdk/src/events.ts` |

### Data Access

| Feature | Description | Hook |
|---------|-------------|------|
| REST API | HTTP requests with caching | `useRestApi()` |
| WebSocket | Real-time data connection | `useWebSocket()` |
| File System | File access (Electron) | `useFileSystem()` |
| Data Store | Centralized caching | `useDataStore()` |

### UI Components

| Category | Components | Location |
|----------|------------|----------|
| Form | Button, Input, Select, Checkbox, Switch | `packages/ui/src/components/` |
| Display | Card, Badge, Skeleton, Spinner | `packages/ui/src/components/` |
| Feedback | Alert, Toast, Dialog | `packages/ui/src/components/` |
| Navigation | Nav, ThemeToggle, TenantSwitcher | `packages/ui/src/components/` |

### State Management

| Store | Purpose | Location |
|-------|---------|----------|
| App Store | Global app state | `packages/core/src/store/appStore.ts` |
| Widget Store | Widget instances | `packages/core/src/store/widgetStore.ts` |
| Data Store | API caching | `packages/core/src/store/dataStore.ts` |
| Notification Store | Toast notifications | `packages/core/src/store/notificationStore.ts` |

## Common Workflows

### 1. Create a New Widget

1. Create directory: `packages/widgets/src/my-widget/`
2. Create `manifest.ts` with widget metadata
3. Create `Widget.tsx` React component
4. Export from `packages/widgets/src/index.ts`
5. Register in app: `registry.register({ Widget, manifest })`
6. Add to layout: Edit `packages/config/src/layouts/dashboard.json`

### 2. Fetch Data from API

1. Import hook: `import { useRestApi } from "@platform/sdk"`
2. Configure data source in widget manifest `dataSources.rest[]`
3. Use hook in component: `const { data, isLoading, error } = useRestApi(config)`
4. Handle states: Show spinner when loading, error message on error
5. Display data: Render `data` in component JSX

### 3. Add Real-Time Updates

1. Import hook: `import { useWebSocket } from "@platform/sdk"`
2. Configure WebSocket in manifest `dataSources.websocket[]`
3. Use hook: `const { lastMessage, isConnected } = useWebSocket(config)`
4. Handle connection state: Show badge for connection status
5. Display updates: Render `lastMessage` in component

### 4. Persist Widget Settings

1. Get storage: `const storage = useWidgetStorage()`
2. Load on mount: `useEffect(() => { storage.get("key").then(setValue) }, [])`
3. Save on change: `await storage.set("key", value, { ttl: 0 })`
4. Clear when needed: `await storage.remove("key")`

### 5. Build and Deploy

1. Build packages: `npm run build`
2. Build web app: `npm run build:web` (creates `apps/web/out/`)
3. Build desktop: `npm run build:desktop` (requires web build first)
4. Deploy web: Upload `apps/web/out/` to static host
5. Package desktop: `npm run build:package` in `apps/desktop/`

## Reference Format

### Widget Manifest

```typescript
export const manifest: WidgetManifest = {
  id: "widget-id",
  name: "Widget Name",
  description: "Description",
  version: "1.0.0",
  permissions: { storage: "local", network: "same-origin" },
  dataSources: { rest: [{ type: "rest", id: "api", url: "/api/data" }] },
  defaultConfig: { key: "value" }
};
```

### Widget Component

```typescript
"use client";
import { useWidget, type WidgetProps } from "@platform/sdk";
export function Widget({ className = "" }: WidgetProps) {
  const { config, theme, capabilities } = useWidget();
  return <div className={className}>Widget content</div>;
}
```

### Layout Configuration

```json
{
  "id": "layout-id",
  "name": "Layout Name",
  "columns": 12,
  "gap": 16,
  "widgets": [
    {
      "widgetId": "widget-id",
      "instanceId": "instance-1",
      "column": 1,
      "colSpan": 6,
      "config": {}
    }
  ]
}
```

### REST API Hook

```typescript
const { data, isLoading, error, refetch } = useRestApi(
  { type: "rest", id: "api", url: "/api/data", refreshInterval: 30000 },
  { fetchOnMount: true }
);
```

## Output Locations

| Type | Location | Files |
|------|----------|-------|
| Web Build | `apps/web/out/` | Static HTML, JS, CSS |
| Desktop Build | `apps/desktop/dist/` | Electron app, installer |
| Package Builds | `packages/*/dist/` | Compiled JS, type definitions |
| Documentation | `coderef/` | Markdown files |
| Standards | `coderef/standards/` | UI, behavior, UX standards |
| User Docs | `coderef/user/` | Guides, features, quickref |

## Key Concepts

### 1. Widget System

- **Widget = Component + Manifest** - React component with metadata
- **Registry** - Central lookup for all widgets
- **Layout Engine** - Reads JSON config, renders widgets in grid
- **WidgetProvider** - Supplies context (config, theme, capabilities)

### 2. Platform Abstraction

- **Capability Detection** - Auto-detects Electron/Web/PWA
- **Unified API** - Same code works across platforms
- **Feature Flags** - Check `capabilities.features.*` before using
- **Graceful Degradation** - Features unavailable on web are handled gracefully

### 3. State Management

- **Zustand Stores** - Lightweight, type-safe state management
- **Store Separation** - App, Widget, Data, Notification stores
- **Selector Helpers** - Fine-grained subscriptions for performance
- **Persistence** - App store persists to localStorage

### 4. Configuration-Driven

- **JSON Layouts** - Define widget positions and configs
- **Tenant Configs** - Per-tenant layouts and features
- **Schema Validation** - TypeScript validation for configs
- **Runtime Updates** - Change layouts without code changes

## Summary

- **Total Components**: 20+ UI components, 2+ widgets
- **Stores**: 4 Zustand stores (App, Widget, Data, Notification)
- **Data Hooks**: 3 (REST, WebSocket, FileSystem)
- **Platforms**: 3 (Web, PWA, Electron)
- **Packages**: 6 core packages + 2 apps

**Documentation**: See `coderef/foundation-docs/` for API, Schema, Components, Architecture  
**User Guides**: See `coderef/user/` for USER-GUIDE, FEATURES, my-guide
