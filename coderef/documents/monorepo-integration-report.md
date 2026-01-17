# Monorepo Integration Strategy Report
**Project Name:** Multi-Tenant Suite Unification
**Target Monorepo:** `C:\Users\willh\Desktop\latest-app`
**Source Projects:** `C:\Users\willh\Desktop\games`, `C:\Users\willh\Desktop\for-her`, `C:\Users\willh\Desktop\gridiron-franchise`

## 1. Executive Summary
This report outlines the technical path for integrating the `games`, `for-her`, and `gridiron-franchise` projects into the existing `latest-app` Turborepo structure. All projects share a modern technology stack (Next.js 15+, React 19, Tailwind CSS 4), with `gridiron-franchise` adding Supabase and Zustand to the ecosystem. Unifying these into a single monorepo will enable shared UI components, centralized state management patterns, and a unified deployment pipeline.

## 2. Current State Analysis

| Feature | `latest-app` (Target) | `games` (Source) | `for-her` (Source) | `gridiron` (Source) |
| :--- | :--- | :--- | :--- | :--- |
| **Framework** | Next.js 15 (App) | Next.js 16.0.10 (App) | Next.js 15.2.6 (App) | Next.js 16.0.7 (App) |
| **React Version** | 19.0.0 | 19.2.0 | 19.2.0 | 19.2.0 |
| **Styling** | Tailwind CSS 4 | Tailwind CSS 4 | Tailwind CSS 4 | Tailwind CSS 4 |
| **State Mgmt** | LocalStorage/Ref | LocalStorage/Ref | LocalStorage/Ref | Zustand / Supabase |
| **Package Manager**| `npm` | `pnpm` | `npm` | `npm` |

### Key Risks & Considerations
*   **External Integration (Supabase):** `gridiron-franchise` relies on Supabase. Integration will require moving environment variables (`.env.local`) to the monorepo root or using a centralized secret management strategy.
*   **State Pattern Diversification:** While `latest-app` uses a custom `useEffect` + `localStorage` pattern, `gridiron-franchise` uses Zustand. Decisions must be made on whether to unify these patterns or allow co-existence in the `@platform/core` package.
*   **Renaming & Path Conflicts:** `gridiron-franchise` must be renamed (e.g., `@platform/gridiron`) to fit the workspace naming convention.
*   **Duplicate Shacdn Components:** All three source projects have their own `components/ui` folders. These should eventually be merged into the `@platform/ui` package to ensure visual consistency.

## 3. Proposed Monorepo Architecture

The unified structure will follow the existing Turborepo pattern in `latest-app`:

```text
latest-app/
├── apps/
│   ├── web/           (Existing - Main dashboard)
│   ├── desktop/       (Existing - Electron/Desktop app)
│   ├── games/         (New - Ported from \games)
│   ├── memo/          (New - Ported from \for-her)
│   └── gridiron/      (New - Ported from \gridiron-franchise)
├── packages/
│   ├── ui/            (Shared Shadcn/UI components)
│   ├── config/        (Shared Tailwind/ESLint configs)
│   ├── core/          (Shared business logic, Zustand stores, and types)
│   ├── sdk/           (Shared API clients, Supabase client)
│   └── widgets/       (Shared interactive dashboard widgets)
└── package.json       (Root workspace configuration)
```

## 4. Step-by-Step Integration Path

### Phase 1: Migration & Renaming
1.  **Folder Porting:** Move the source directories into `apps/games`, `apps/memo`, and `apps/gridiron`.
2.  **Package Renaming:** Update `package.json` in each new app:
    *   `apps/games/package.json` -> `"name": "@platform/games"`
    *   `apps/memo/package.json` -> `"name": "@platform/for-her"` (or your preferred identifier).
    *   `apps/gridiron/package.json` -> `"name": "@platform/gridiron"`.
3.  **Lockfile Unification:** Delete individual `node_modules` and lockfiles, then run `npm install` from the monorepo root.

### Phase 2: Configuration Standardization
1.  **Shared Tailwind Config:** Move the Tailwind 4 configuration from the source projects into a shared preset in `packages/config/tailwind`.
2.  **Supabase Client Migration:** Move the Supabase client initialization from `gridiron/lib` to `packages/sdk/supabase` to allow it to be shared if other apps need data access.
3.  **Turbo Tasking:** Update the root `turbo.json` to include build/lint pipelines for the new apps, ensuring proper dependency ordering (e.g., `@platform/ui` builds before `apps/gridiron`).

### Phase 3: UI & Logic Unification
1.  **Shared UI Library:** Consolidate identical components (e.g., `Button`, `Dialog`, `Card`) into `packages/ui`.
2.  **Store Migration:** Move the Zustand stores from `apps/gridiron/src/stores` to `packages/core/stores`. This allows the `web` app to potentially show "Franchise Stats" or "Draft Status" widgets.
3.  **Widget Conversion:** Components in `gridiron` (like the "Scouting Hub" or "Draft Board") should be refactored as widgets in `packages/widgets` for easy dashboard integration.

## 5. Benefits of Integration

*   **Unified Authentication:** Use the Supabase integration from `gridiron` to provide a single login experience across the entire suite.
*   **Deep Component Sharing:** Use the advanced `dnd-kit` implementation from `gridiron` and `memo` to enhance the drag-and-drop capabilities of the main dashboard.
*   **Simplified Tooling:** One command (`npm run dev`) starts the entire suite, with Turbo managing the dependency graph for sub-second rebuilds.
*   **Ecosystem Growth:** Easily add new "Apps" (Tenants) by simply cloning an existing app structure and linking it to the shared packages.

---
**Recommendation:** Proceed with Phase 1 by migrating the folders and renaming the packages. Start with `gridiron-franchise` as it has the most complex external dependencies (Supabase).
