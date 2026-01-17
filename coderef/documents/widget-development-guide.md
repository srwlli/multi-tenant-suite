# Widget & Component Development Guide

This guide explains how to develop new UI components and functional widgets for the Business Dashboard suite.

## Architecture Overview

We distinguish between two types of visual building blocks:

- **Components (`packages/ui`)**: Atomic, reusable UI elements without business logic. Built on Radix UI and Tailwind CSS. (Example: `Button`, `Input`, `Card`).
- **Widgets (`packages/widgets`)**: Configurable, self-contained dashboard modules that consume data and platform services. (Example: `SalesChart`, `ThemeToggle`).

---

## 1. Creating a UI Component

UI components are the foundation of our design system.

### Step 1: Create Component File
Create a new file in `packages/ui/src/components/` using the atomic pattern.

**Example:** `packages/ui/src/components/badge.tsx`

### Step 2: Implementation Style
Always use `forwardRef`, `cn()` for class merging, and `cva` for variant management.

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "text-foreground border border-input",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
);
```

---

## 2. Creating a Widget

Widgets are mini-applications that live in the dashboard grid.

### Step 1: Create Widget Directory
Create a directory in `packages/widgets/src/` with the following structure:
- `manifest.ts`: Metadata and default config.
- `Widget.tsx`: The React implementation.
- `index.ts`: Entry point.

### Step 2: Define the Manifest
The manifest tells the platform what the widget needs and how it behaves.

```typescript
import type { WidgetManifest } from "@platform/sdk";

export const manifest: WidgetManifest = {
  id: "weather-widget",
  name: "Weather",
  description: "Displays current weather for a location",
  version: "1.0.0",
  defaultConfig: {
    location: "New York",
    unit: "celsius"
  },
  size: {
    minWidth: 3,
    minHeight: 2
  }
};
```

### Step 3: Implement the Widget
Use the `useWidget` hook to access configuration, theme, and platform capabilities.

```tsx
"use client";

import { useWidget, type WidgetProps } from "@platform/sdk";
import { Card, CardHeader, CardTitle, CardContent } from "@platform/ui";

export function Widget({ className }: WidgetProps) {
  const { config, theme } = useWidget();
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Weather in {config.location as string}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">22°C</p>
      </CardContent>
    </Card>
  );
}
```

---

## Widget Manifest Schema

Use this schema to validate your `manifest.ts` properties:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "version"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "name": { "type": "string" },
    "description": { "type": "string" },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "defaultConfig": { "type": "object" },
    "size": {
      "type": "object",
      "properties": {
        "minWidth": { "type": "number", "minimum": 1 },
        "minHeight": { "type": "number", "minimum": 1 }
      }
    }
  }
}
```

---

## Best Practices

1. **Isolation**: Never import from `apps/`. Only import from other `packages/`.
2. **Platform Agnostic**: Check `capabilities.isElectron` before using file system APIs.
3. **Theming**: Use semantic colors (`text-muted-foreground`, `bg-primary`) instead of rigid hex codes.
4. **Registration**: Don't forget to export your widget from `packages/widgets/src/index.ts`.
