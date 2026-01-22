# Business Dashboard

A platform-agnostic dashboard application built with React, TypeScript, and modern web technologies. Supports deployment as a web application, PWA, or Electron desktop app.

## Features

- **Platform Agnostic** - Single codebase works on Web, PWA, and Electron Desktop
- **Widget-Based Architecture** - Compose dashboards from configurable, self-contained widgets
- **Multi-Tenant Support** - Isolated configurations for different tenants
- **Type-Safe** - Full TypeScript coverage with strict type checking
- **Modern UI** - Built with Tailwind CSS and Radix UI primitives
- **Theme Support** - Light, dark, and system theme modes
- **Data Integration** - REST API, WebSocket, and File System data sources
- **Developer Experience** - Clear architecture, comprehensive documentation, and testing utilities

## Current Project State

### 🏗️ Active Development
The project is currently in the **Next.js Transition Phase**.
- **Next.js Stack (`apps/web`)**: The core application infrastructure is built. It features a generic Dashboard driven by JSON configurations. High-fidelity industry-specific pages (Salon, Detailing, etc.) are **not yet built in React**.
- **JSON Schemas (`packages/config`)**: The "Engine" is fully functional. Active JSON schemas define the rules for multi-tenant data and premium V2 layouts.

### 📂 Off-Repo Reference Materials
To maintain a clean production environment, all plain HTML/CSS mock-ups and human-readable design documentation have been decoupled from this repository.
- **Location**: `C:\Users\willh\Desktop\industry-prototypes\`
- **Contents**:
  - `html-mock-ups/`: High-fidelity industry prototypes used as design benchmarks.
  - `SCHEMA.md`: Technical manual for data models.
  - `STYLING-GUIDE.md`: Design tokens and Ethereal V2 styling rules.
  - `V2-COMPONENT-MAPPING.md`: Blueprint for mapping HTML sections to React components.


## Architecture Summary

The Business Dashboard is built as a monorepo with the following structure:

```
latest-app/
├── apps/
│   ├── web/          # Next.js web application
│   └── desktop/      # Electron desktop application
├── packages/
│   ├── core/         # Core platform (Dashboard, Registry, PlatformProvider)
│   ├── sdk/          # Widget SDK (hooks, storage, events, data)
│   ├── ui/           # Reusable UI components
│   ├── widgets/      # Widget implementations
│   ├── config/       # Configuration schemas and data
│   └── testing/      # Testing utilities and mocks
└── coderef/          # Documentation and planning

```

### Key Components

- **Dashboard** - Main dashboard container with grid-based layout
- **Widget System** - Registry-based widget management with lifecycle events
- **Platform Abstraction** - Unified API across Web, PWA, and Electron
- **State Management** - Zustand stores for app, widget, data, and notification state
- **Configuration-Driven** - JSON-based layout and tenant configuration

For detailed architecture information, see [ARCHITECTURE.md](./coderef/foundation-docs/ARCHITECTURE.md).

## Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.9.0 (or compatible package manager)
- **Git** (for version control)

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd latest-app
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server for the web app:

```bash
npm run dev
# or specifically for web
npm run dev:web
```

Start the development server for the desktop app:

```bash
npm run dev:desktop
```

The web app will be available at `http://localhost:3000` (or the next available port).

### Building

Build all packages and applications:

```bash
npm run build
```

Build specific applications:

```bash
# Build web app
npm run build:web

# Build desktop app (requires web app to be built first)
npm run build:desktop
```

### Type Checking

Type check all packages:

```bash
npm run typecheck
```

### Linting

Lint all packages:

```bash
npm run lint
```

### Testing

Run tests in watch mode:

```bash
npm test
```

Run tests once:

```bash
npm run test:run
```

Generate coverage report:

```bash
npm run test:coverage
```

## Project Structure

### Applications

- **`apps/web`** - Next.js web application with PWA support
  - Uses Next.js 15 with App Router
  - Supports static export for deployment
  - PWA capabilities via `@ducanh2912/next-pwa`

- **`apps/desktop`** - Electron desktop application
  - Wraps the web app in Electron
  - Provides native features (file system, notifications, window controls)
  - Uses electron-builder for packaging

### Packages

- **`packages/core`** - Core platform infrastructure
  - `Dashboard` - Main dashboard component
  - `LayoutEngine` - Widget layout renderer
  - `WidgetRegistry` - Widget registration and lookup
  - `PlatformProvider` - Platform context provider
  - Store implementations (App, Widget, Data, Notification)

- **`packages/sdk`** - Widget SDK
  - `useWidget` - Widget context hook
  - `useWidgetStorage` - Widget storage hook
  - `useWidgetEvents` - Widget events hook
  - Data hooks (`useRestApi`, `useWebSocket`, `useFileSystem`)
  - Storage API with TTL support
  - Events API for widget lifecycle

- **`packages/ui`** - Reusable UI components
  - Form components (Button, Input, Select, etc.)
  - Display components (Card, Badge, etc.)
  - Feedback components (Alert, Toast, Spinner, etc.)
  - Navigation components (Nav, ThemeToggle, TenantSwitcher)
  - Built with Radix UI primitives and Tailwind CSS

- **`packages/widgets`** - Widget implementations
  - `coming-soon-card` - Placeholder widget
  - `theme-toggle` - Theme toggle widget
  - Each widget includes a `Widget.tsx` and `manifest.ts`

- **`packages/config`** - Configuration
  - Layout schemas and validation
  - Tenant configuration schemas
  - Default tenant and layout configurations

- **`packages/testing`** - Testing utilities
  - Test setup and configuration
  - Mocks for platform, React, and Zustand
  - Test utilities and helpers

## Development Workflow

### Adding a New Widget

1. Create widget directory in `packages/widgets/src/`:
```bash
mkdir packages/widgets/src/my-widget
```

2. Create `manifest.ts`:
```typescript
import type { WidgetManifest } from "@platform/sdk";

export const manifest: WidgetManifest = {
  id: "my-widget",
  name: "My Widget",
  description: "Description of my widget",
  version: "1.0.0",
  // ... other manifest properties
};
```

3. Create `Widget.tsx`:
```typescript
"use client";

import { useWidget, type WidgetProps } from "@platform/sdk";

export function Widget({ className = "" }: WidgetProps) {
  const { config, theme, capabilities } = useWidget();
  // Widget implementation
}
```

4. Export from `packages/widgets/src/index.ts`:
```typescript
export { Widget as MyWidget, manifest as myWidgetManifest } from "./my-widget";
```

5. Register in your app:
```typescript
import { MyWidget, myWidgetManifest } from "@platform/widgets";

registry.register({
  Widget: MyWidget,
  manifest: myWidgetManifest,
});
```

### Adding a New UI Component

1. Create component in `packages/ui/src/components/`:
```typescript
"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // Component props
}

export const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("base-classes", className)} {...props} />
  )
);

MyComponent.displayName = "MyComponent";
```

2. Export from `packages/ui/src/components/index.ts`

### Modifying Configuration

- **Tenant Config**: Edit `packages/config/src/tenants/default.json`
- **Layout Config**: Edit `packages/config/src/layouts/dashboard.json`
- **Schema Changes**: Update `packages/config/src/schema.ts`

## Documentation

Comprehensive documentation is available in `coderef/foundation-docs/`:

- **[API.md](./coderef/foundation-docs/API.md)** - API reference for IPC handlers, data hooks, and store actions
- **[SCHEMA.md](./coderef/schemas/SCHEMA.md)** - Data models, TypeScript interfaces, and entity relationships
- **[COMPONENTS.md](./coderef/foundation-docs/COMPONENTS.md)** - UI component reference with props and usage patterns


- **[ARCHITECTURE.md](./coderef/foundation-docs/ARCHITECTURE.md)** - System architecture, design patterns, and decisions
- **[ARCHITECTURE-GUIDE.md](./coderef/ARCHITECTURE-GUIDE.md)** - Decision guide for where code should go

## Technology Stack

### Core Technologies

- **React 19** - UI library
- **TypeScript 5.7** - Type safety
- **Next.js 15** - Web framework
- **Electron 33** - Desktop framework
- **Tailwind CSS 4** - Styling
- **Zustand** - State management

### Build Tools

- **Turborepo** - Monorepo build system
- **tsup** - Package bundler
- **electron-builder** - Electron packaging
- **Vitest** - Testing framework

### UI Libraries

- **Radix UI** - Accessible component primitives
- **class-variance-authority** - Variant management
- **clsx** + **tailwind-merge** - Class name utilities

## Scripts Reference

### Root Scripts

- `npm run dev` - Start all development servers
- `npm run dev:web` - Start web development server
- `npm run dev:desktop` - Start desktop development server
- `npm run build` - Build all packages and apps
- `npm run build:web` - Build web app
- `npm run build:desktop` - Build desktop app
- `npm run typecheck` - Type check all packages
- `npm run lint` - Lint all packages
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Generate coverage report
- `npm run clean` - Clean build artifacts and node_modules

## Contributing

### Code Organization

Follow the [Architecture Decision Guide](./coderef/ARCHITECTURE-GUIDE.md) to determine where code should go:

1. **Styling/Colors** → `packages/ui/styles/globals.css`
2. **Reusable Building Block** → `packages/ui`
3. **Dashboard Feature** → `packages/widgets`
4. **App Infrastructure** → `packages/core`
5. **JSON Configuration** → `packages/config`

### Code Style

- Use TypeScript with strict mode
- Follow React best practices (hooks, composition)
- Use functional components
- Prefer composition over inheritance
- Write self-documenting code with clear naming

### Testing

- Write tests for new features
- Maintain or improve test coverage
- Use testing utilities from `packages/testing`

## License

[Add your license here]

## Support

For questions, issues, or contributions, please [open an issue](link-to-issues) or [start a discussion](link-to-discussions).
