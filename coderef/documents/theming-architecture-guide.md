# Multi-Tenant Theming & Styling Guide

This guide explains how our dynamic styling system allows tenants to customize their look and feel without changing codebase lines.

## Overview

The Business Dashboard utilizes a **CSS Variables Injection** strategy. Instead of hardcoded colors, the UI components reference semantic variables (e.g., `--primary`). These variables are redefined at runtime based on the active `TenantConfig`.

---

## 1. The Design Token System

All UI components in `packages/ui` must use the following semantic classes provided by Tailwind CSS, which map to our CSS variables:

| Type | Tailwind Class / Variable | Description |
|------|---------------------------|-------------|
| **Primary** | `bg-primary` / `--primary` | Main brand color for buttons, active states. |
| **Accent** | `bg-accent` / `--accent` | Highlight color for secondary actions. |
| **Surface** | `bg-card` / `--card` | Background color for dashboard widgets. |
| **Background** | `bg-background` / `--background` | Main page background. |
| **Border** | `border-input` / `--border` | Standard border color for inputs and dividers. |

---

## 2. Dynamic Injection Workflow

### Step 1: Defined in Tenant Config
The tenant's JSON file contains a `theme` object.

**File:** `packages/config/src/tenants/acme-corp.json`
```json
{
  "theme": {
    "primaryColor": "#ff5733",
    "accentColor": "#33ff57"
  }
}
```

### Step 2: Injected by PlatformProvider
When a tenant is selected, the `PlatformProvider` (in `@platform/core`) injects these values into the document root.

### Step 3: Consumed by Components
Your components remain logic-less. They simply use:
```tsx
<button className="bg-primary text-primary-foreground">
  Click Me
</button>
```

---

## 3. Extending the Theme Schema

If we need to add new customizable properties (e.g., Corner Radius, Font Family), follow this process:

### 1. Update the Schema
Add the field to `packages/config/src/schema.ts`.

```typescript
export interface TenantConfig {
  theme?: {
    primaryColor?: string;
    accentColor?: string;
    borderRadius?: string; // New Property
  };
}
```

### 2. Update the CSS Mapping
Add the mapping in the main `globals.css` using the `:root` selector.

```css
:root {
  --radius: 0.5rem; /* Default */
}

/* PlatformProvider will set style="--radius: 1rem" on <html> for tenants */
```

---

## Theme Configuration Schema

Use this schema in your tenant configuration files:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "primaryColor": { 
      "type": "string", 
      "description": "Primary brand color (Hex, RGB, or HSL)" 
    },
    "accentColor": { 
      "type": "string",
      "description": "Secondary accent color"
    },
    "borderRadius": {
      "type": "string",
      "description": "CSS border-radius value (e.g., 0.75rem)"
    }
  }
}
```

---

## Best Practices for Developers

1. **Never use Arbitrary Values**: Avoid `bg-[#ff5500]`. Always use `bg-primary`.
2. **Contrast Checks**: If a tenant provides a primary color, ensure your `primary-foreground` (text on that color) is accessible (white vs. black).
3. **Desktop Sync**: In the Electron app, natively synchronize the `theme.mode` (Light/Dark) with the OS settings via the `PlatformProvider`.
4. **Theme Mocking**: Use the `TenantSwitcher` in the local web app to instantly verify how your components look under different brand colors.
