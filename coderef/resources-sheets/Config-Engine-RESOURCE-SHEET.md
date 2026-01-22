---
element: ConfigEngine
type: Infrastructure Layer
modules: [architecture, integration, validation, performance]
auto_fill_rate: 100%
generated: 2026-01-22
mode: manual-refinement
version: 1.0.0
---

# ConfigEngine - Authoritative Documentation

The `ConfigEngine` is the core architectural layer responsible for multi-tenant identity, layout resolution, and structural validation across all platform variants (Web, PWA, Electron).

## 1. Architecture

**Type:** Infrastructure / Configuration Layer (`@platform/config`)

### Unified Data Hierarchy
The engine manages a three-tier configuration model:
1.  **AppConfig**: Global application settings and tenant registries.
2.  **TenantConfig**: Business-specific identity (name, logo, category) and its mapping to a `defaultLayout`.
3.  **Layout Systems**:
    - **LayoutConfig (V1)**: Grid-based operational dashboard for internal utilities.
    - **LandingPageLayoutConfig (V2)**: Premium, component-first blueprint for industry-specific conversion pages.

### Design Strategy: "Schema-First"
- **Authoritative Blueprints**: JSON schemas in `src/schemas/` act as the source of truth for all structures.
- **AJV Integration**: High-performance JSON schema validation ensures structural integrity.

## 2. Integration Points

**Used By:**
- `apps/web`: Resolves tenant and layout IDs to render dynamic pages.
- `apps/desktop`: Localized execution using identical logic.

**Uses:** (Dependencies)
- `ajv`: Used for strict JSON Schema compilation and validation.
- Local JSON Resources: (layouts, tenants) served via TypeScript exports.

## 3. Testing & Validation Strategy

The engine utilizes AJV for rigorous quality gates:
- **Strict Mode**: Validation requires exact matches to schema definitions.
- **Fail-Fast Assertion**: The `assertValidTenant` utility throws immediate errors during integration.

## 4. Performance & Scalability

- **Single Compilation**: JSON Schemas are compiled once at module load time for zero-overhead validation.
- **Platform Agnostic**: Designed to run identically in Next.js and Browser environments.