# User Guide - Business Dashboard

Comprehensive guide for using and developing with the Business Dashboard platform.

## Purpose

This guide provides step-by-step instructions for getting started, developing widgets, and working with the Business Dashboard platform.

## Overview

The Business Dashboard is a platform-agnostic dashboard application that allows you to build customizable dashboards using a widget-based architecture. It supports deployment as a web application, PWA, or Electron desktop app.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 20.0.0 installed
- **npm** >= 10.9.0 (or compatible package manager)
- Basic knowledge of React and TypeScript
- Familiarity with modern JavaScript/TypeScript development

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd latest-app
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all dependencies for the monorepo, including all packages and applications.

### Step 3: Verify Installation

```bash
npm run typecheck
```

If this completes without errors, your installation is successful.

## How It Works

### Architecture Overview

The Business Dashboard uses a widget-based architecture:

1. **Widgets** are self-contained React components with metadata (manifests)
2. **Layout Configuration** defines which widgets appear and where
3. **Widget Registry** manages available widgets
4. **Layout Engine** renders widgets in a CSS Grid layout
5. **Platform Provider** supplies context (theme, capabilities, tenant)

### Data Flow

```
Configuration (JSON)
    ↓
Layout Engine reads layout
    ↓
Looks up widgets in Registry
    ↓
Renders widgets with WidgetProvider
    ↓
Widgets access data via SDK hooks
    ↓
State updates flow through Zustand stores
```

## Getting Started

### Starting the Development Server

#### Web Application

```bash
npm run dev:web
```

The web app will start at `http://localhost:3000` (or next available port).

#### Desktop Application

```bash
npm run dev:desktop
```

This starts the Electron desktop application.

### Your First Widget

Let's create a simple "Hello World" widget:

#### Step 1: Create Widget Directory

```bash
mkdir packages/widgets/src/hello-world
```

#### Step 2: Create Manifest

Create `packages/widgets/src/hello-world/manifest.ts`:

```typescript
import type { WidgetManifest } from "@platform/sdk";

export const manifest: WidgetManifest = {
  id: "hello-world",
  name: "Hello World",
  description: "A simple greeting widget",
  version: "1.0.0",
};
```

#### Step 3: Create Widget Component

Create `packages/widgets/src/hello-world/Widget.tsx`:

```typescript
"use client";

import { useWidget, type WidgetProps } from "@platform/sdk";
import { Card, CardHeader, CardTitle, CardContent } from "@platform/ui";

export function Widget({ className = "" }: WidgetProps) {
  const { config } = useWidget();
  const name = (config.name as string) || "World";

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Hello, {name}!</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Welcome to the Business Dashboard!</p>
      </CardContent>
    </Card>
  );
}
```

#### Step 4: Export Widget

Add to `packages/widgets/src/index.ts`:

```typescript
export { Widget as HelloWorld, manifest as helloWorldManifest } from "./hello-world";
```

#### Step 5: Register Widget

In your app (e.g., `apps/web/lib/registry.ts`):

```typescript
import { HelloWorld, helloWorldManifest } from "@platform/widgets";

registry.register({
  Widget: HelloWorld,
  manifest: helloWorldManifest,
});
```

#### Step 6: Add to Layout

Edit `packages/config/src/layouts/dashboard.json`:

```json
{
  "widgets": [
    {
      "widgetId": "hello-world",
      "instanceId": "hello-world-1",
      "column": 1,
      "colSpan": 6,
      "config": {
        "name": "Developer"
      }
    }
  ]
}
```

#### Step 7: View Your Widget

Restart the dev server and navigate to the dashboard. Your widget should appear!

## Use Cases

### Use Case 1: Displaying Data from an API

Create a widget that fetches and displays data from a REST API:

```typescript
"use client";

import { useWidget, useRestApi, type WidgetProps } from "@platform/sdk";
import { Card, CardHeader, CardTitle, CardContent, Spinner, Alert } from "@platform/ui";

interface ApiData {
  title: string;
  value: number;
}

export function Widget({ className = "" }: WidgetProps) {
  const { config } = useWidget();
  const apiUrl = (config.apiUrl as string) || "/api/data";

  const { data, isLoading, error } = useRestApi<ApiData>(
    {
      type: "rest",
      id: "data-fetch",
      url: apiUrl,
      method: "GET",
      refreshInterval: 30000, // Refresh every 30 seconds
    },
    {
      fetchOnMount: true,
    }
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <Alert variant="error">{error.message}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{data?.title || "Data"}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{data?.value ?? 0}</p>
      </CardContent>
    </Card>
    );
}
```

### Use Case 2: Real-Time Updates with WebSocket

Create a widget that receives real-time updates:

```typescript
"use client";

import { useWidget, useWebSocket, type WidgetProps } from "@platform/sdk";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@platform/ui";

export function Widget({ className = "" }: WidgetProps) {
  const { config } = useWidget();
  const wsUrl = (config.wsUrl as string) || "wss://api.example.com/ws";

  const { lastMessage, isConnected } = useWebSocket(
    {
      type: "websocket",
      id: "realtime-updates",
      url: wsUrl,
      reconnect: true,
      maxReconnectAttempts: 5,
    },
    {
      connectOnMount: true,
    }
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Real-Time Data
          <Badge variant={isConnected ? "success" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre>{JSON.stringify(lastMessage, null, 2)}</pre>
      </CardContent>
    </Card>
  );
}
```

### Use Case 3: Persistent Widget Settings

Use widget storage to persist user preferences:

```typescript
"use client";

import { useWidget, useWidgetStorage, type WidgetProps } from "@platform/sdk";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@platform/ui";
import { useState, useEffect } from "react";

export function Widget({ className = "" }: WidgetProps) {
  const storage = useWidgetStorage();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Load saved notes
    storage.get<string>("notes").then((saved) => {
      if (saved) setNotes(saved);
    });
  }, [storage]);

  const saveNotes = async () => {
    await storage.set("notes", notes, { ttl: 0 }); // No expiration
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter your notes..."
        />
        <Button onClick={saveNotes} className="mt-2">Save</Button>
      </CardContent>
    </Card>
  );
}
```

## Best Practices

### Do

✅ **Use TypeScript strictly** - Leverage type safety for better code quality  
✅ **Follow component patterns** - Use `React.forwardRef` and set `displayName`  
✅ **Handle loading states** - Always show loading indicators for async operations  
✅ **Handle errors gracefully** - Display user-friendly error messages  
✅ **Use widget storage** - Persist widget-specific data with TTL  
✅ **Declare permissions** - Specify required permissions in widget manifest  
✅ **Test your widgets** - Write tests for widget functionality  
✅ **Follow naming conventions** - Use kebab-case for widget IDs and directories  

### Don't

❌ **Don't access global state directly** - Use hooks and context  
❌ **Don't hardcode tenant-specific logic** - Use tenant context  
❌ **Don't bypass platform abstraction** - Use SDK hooks instead of direct APIs  
❌ **Don't create side effects in render** - Use useEffect for side effects  
❌ **Don't ignore accessibility** - Use semantic HTML and ARIA attributes  
❌ **Don't skip error handling** - Always handle potential errors  

### Tips

💡 **Use the Architecture Decision Guide** - Check `coderef/ARCHITECTURE-GUIDE.md` to decide where code should go  
💡 **Leverage existing UI components** - Use components from `@platform/ui` instead of creating new ones  
💡 **Use data hooks for caching** - REST API hook automatically caches responses  
💡 **Test in multiple platforms** - Verify widgets work in Web, PWA, and Electron  
💡 **Use TypeScript types** - Import types from `@platform/sdk` for consistency  
💡 **Follow the widget lifecycle** - Use widget events for cleanup and initialization  

## Troubleshooting

### Widget Not Appearing

**Problem**: Widget doesn't show up in the dashboard.

**Solutions**:
1. Verify widget is registered in the registry
2. Check widget ID matches in layout config
3. Ensure manifest is properly exported
4. Check browser console for errors
5. Verify widget component is exported correctly

### Data Not Loading

**Problem**: Widget shows loading state indefinitely.

**Solutions**:
1. Check API endpoint URL is correct
2. Verify network permissions in widget manifest
3. Check browser network tab for failed requests
4. Verify data hook configuration
5. Check Data Store for cached errors

### Theme Not Updating

**Problem**: Widget doesn't respond to theme changes.

**Solutions**:
1. Use `useWidget()` hook to access theme
2. Use CSS variables for colors (not hardcoded)
3. Check if widget is wrapped in WidgetProvider
4. Verify theme context is available

### Storage Not Working

**Problem**: Widget storage operations fail.

**Solutions**:
1. Check storage permissions in widget manifest
2. Verify storage key format (auto-namespaced)
3. Check for TTL expiration
4. Verify storage API is available in platform

### Build Errors

**Problem**: TypeScript or build errors.

**Solutions**:
1. Run `npm run typecheck` to see all type errors
2. Ensure all imports are correct
3. Check package dependencies are installed
4. Verify TypeScript configuration
5. Clear build cache: `npm run clean && npm install`

## Quick Reference

### Widget Manifest Properties

| Property | Type | Required | Description |
|---------|------|----------|-------------|
| `id` | string | Yes | Unique widget identifier |
| `name` | string | Yes | Display name |
| `description` | string | Yes | Brief description |
| `version` | string | Yes | Semantic version |
| `permissions` | WidgetPermissions | No | Required permissions |
| `dataSources` | WidgetDataSources | No | Data source configs |
| `defaultConfig` | Record<string, unknown> | No | Default configuration |

### Common SDK Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useWidget()` | Widget context | `{ config, theme, capabilities, manifest, tenantId }` |
| `useWidgetStorage()` | Widget storage | `WidgetStorage` interface |
| `useWidgetEvents()` | Widget events | Event subscription methods |
| `useRestApi()` | REST API data | `{ data, isLoading, error, refetch }` |
| `useWebSocket()` | WebSocket connection | `{ lastMessage, isConnected, send }` |
| `useFileSystem()` | File system (Electron) | `{ readFile, writeFile, isAvailable }` |

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
      "instanceId": "instance-id",
      "column": 1,
      "colSpan": 6,
      "row": 1,
      "rowSpan": 2,
      "config": {}
    }
  ]
}
```

## References

- [API Documentation](../foundation-docs/API.md) - Complete API reference
- [Schema Documentation](../foundation-docs/SCHEMA.md) - Data models and types
- [Components Documentation](../foundation-docs/COMPONENTS.md) - UI component reference
- [Architecture Documentation](../foundation-docs/ARCHITECTURE.md) - System architecture
- [Architecture Decision Guide](../ARCHITECTURE-GUIDE.md) - Where code should go
