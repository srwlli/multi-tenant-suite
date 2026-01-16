# Tenant Creation Guide

This guide explains how to create a new tenant in the Business Dashboard application.

## Overview

Tenants allow you to have isolated configurations for different organizations or clients. Each tenant can have:
- Custom layouts
- Different feature flags
- Custom branding (logo, colors)
- Isolated widget configurations

## Step-by-Step Process

### Step 1: Create Tenant JSON File

Create a new JSON file in `packages/config/src/tenants/` with your tenant ID as the filename.

**Example:** `packages/config/src/tenants/acme-corp.json`

### Step 2: Fill Out Tenant Configuration

Use the following form to gather information, then create the JSON file:

#### Required Information

1. **Tenant ID** (string, required)
   - Unique identifier (lowercase, no spaces, e.g., "acme-corp", "company-xyz")
   - Used as the filename and in the tenants object

2. **Tenant Name** (string, required)
   - Display name (e.g., "ACME Corporation", "Company XYZ")

3. **Default Layout** (string, required)
   - Layout ID to use by default (e.g., "main-dashboard")
   - This ID must match an export key in `packages/config/src/index.ts` to be resolved by the application.

#### Optional Information

4. **Logo URL** (string, optional)
   - Path or URL to tenant logo image
   - Example: "/logos/acme-corp.svg"

5. **Available Layouts** (array of strings, optional)
   - List of layout IDs available to this tenant
   - Example: `["main-dashboard", "analytics-dashboard"]`

6. **Features** (object, optional)
   - `customizeDashboard` (boolean) - Allow users to customize dashboard
   - `marketplace` (boolean) - Show widget marketplace
   - `darkMode` (boolean) - Enable dark mode support

7. **Theme** (object, optional)
   - `primaryColor` (string) - Primary brand color (CSS color value)
   - `accentColor` (string) - Accent color (CSS color value)

### Step 3: Tenant JSON Structure

```json
{
  "id": "tenant-id",
  "name": "Tenant Display Name",
  "logo": "/path/to/logo.svg",
  "defaultLayout": "main-dashboard",
  "layouts": ["main-dashboard"],
  "features": {
    "customizeDashboard": false,
    "marketplace": false,
    "darkMode": true
  },
  "theme": {
    "primaryColor": "#0066cc",
    "accentColor": "#00cc66"
  }
}
```

### Step 4: Export the Tenant

Update `packages/config/src/index.ts` to register your new tenant:

1. **Import the tenant file:**
   ```typescript
   import myTenant from "./tenants/my-tenant.json";
   ```

2. **Add to tenants export:**
   ```typescript
   export const tenants = {
     default: defaultTenant,
     "my-tenant": myTenant, // The key MUST match the tenant.id
   } as const;
   ```

*Note: The helper functions `getTenant()` and `getLayout()` resolve automatically from these exports. No additional code updates are required.*

### Step 5: Create Custom Layouts (Optional)

If your tenant needs custom layouts:

1. Create layout JSON file in `packages/config/src/layouts/`
2. Reference the layout ID in the tenant's `layouts` array
3. Export the layout in `packages/config/src/index.ts`

## Example: Complete Tenant Creation

### Example 1: Minimal Tenant

**File:** `packages/config/src/tenants/acme-corp.json`
```json
{
  "id": "acme-corp",
  "name": "ACME Corporation",
  "defaultLayout": "main-dashboard",
  "layouts": ["main-dashboard"],
  "features": {
    "customizeDashboard": false,
    "marketplace": false,
    "darkMode": true
  }
}
```

### Example 2: Full-Featured Tenant

**File:** `packages/config/src/tenants/enterprise-client.json`
```json
{
  "id": "enterprise-client",
  "name": "Enterprise Client Inc.",
  "logo": "/logos/enterprise-client.svg",
  "defaultLayout": "enterprise-dashboard",
  "layouts": ["enterprise-dashboard", "analytics-dashboard", "reports-dashboard"],
  "features": {
    "customizeDashboard": true,
    "marketplace": true,
    "darkMode": true
  },
  "theme": {
    "primaryColor": "#1a1a1a",
    "accentColor": "#00d4ff"
  }
}
```

## Validation

The tenant configuration is validated using the `TenantConfig` schema. Required fields:
- `id` must be a non-empty string
- `name` must be a non-empty string
- `defaultLayout` must be a non-empty string

## Using Tenants in the Application

Once created, tenants can be:

1. **Accessed programmatically:**
   ```typescript
   import { tenants } from "@platform/config";
   const myTenant = tenants["my-tenant"];
   ```

2. **Switched using TenantSwitcher:**
   The `TenantSwitcher` expects an array of `TenantInfo` objects. Map the configuration objects before passing them:

   ```typescript
   import { TenantSwitcher } from "@platform/ui";
   import { tenants } from "@platform/config";

   // Convert tenant configs to TenantInfo format
   const availableTenants = Object.values(tenants).map((t) => ({
     id: t.id,
     name: t.name,
   }));

   return (
     <TenantSwitcher 
       tenantId="my-tenant" 
       availableTenants={availableTenants} 
     />
   );
   ```

3. **Used in PlatformProvider:**
   ```typescript
   <PlatformProvider tenantId="my-tenant" registry={registry}>
     {/* App content */}
   </PlatformProvider>
   ```

## Quick Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique tenant identifier |
| `name` | string | Yes | Display name |
| `defaultLayout` | string | Yes | Default layout ID |
| `logo` | string | No | Logo URL/path |
| `layouts` | string[] | No | Available layout IDs |
| `features.customizeDashboard` | boolean | No | Enable customization |
| `features.marketplace` | boolean | No | Show marketplace |
| `features.darkMode` | boolean | No | Enable dark mode |
| `theme.primaryColor` | string | No | Primary brand color |
| `theme.accentColor` | string | No | Accent color |

## Notes

- Tenant IDs should be URL-safe (lowercase, hyphens, no spaces)
- Layout IDs referenced in tenant config must exist in the layouts directory
- Theme colors should be valid CSS color values (hex, rgb, hsl, etc.)
- Each tenant has isolated widget configurations and storage
