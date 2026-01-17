# Monorepo Integration Strategy Report
**Project Name:** Multi-Tenant Suite Unification
**Target Monorepo:** `C:\Users\willh\Desktop\latest-app`
**Source Projects:**
1.  `C:\Users\willh\Desktop\games` (Frontend App)
2.  `C:\Users\willh\Desktop\for-her` (Frontend App)
3.  `C:\Users\willh\Desktop\gridiron-franchise` (Frontend App)
4.  `C:\Users\willh\Desktop\scrapper` (Dashboard App)
5.  `C:\Users\willh\Desktop\projects\next-scraper` (Data Service)

## 1. Executive Summary
This report outlines the technical path for integrating the suite of frontend applications and background data services into the existing `latest-app` Turborepo structure. All projects utilize a modern technology stack (Next.js 15/16, React 19, Tailwind CSS 4). The integration will unify user-facing tenants with the underlying NFL data services, enabling a seamless "Data to Dashboard" pipeline within a single manageable codebase.

## 2. Current State Analysis

| Feature | `latest-app` | `games`/`memo` | `gridiron` | `scrapper` | `next-scraper` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Type** | Core Hub | Frontend App | Frontend App | Admin Dash | Data Service |
| **Framework** | Next.js 15 | Next.js 15/16 | Next.js 16 | Next.js 16 | Node.js (ESM) |
| **Styling** | TW 4 | TW 4 | TW 4 | TW 4 | N/A |
| **Logic/DB** | Local/LS | Local/LS | Supabase | Supabase | Supabase/Axios |
| **State** | Custom | Custom | Zustand | Radix/Radix | N/A |

### Key Risks & Considerations
*   **Infrastructure Hybridization:** The ecosystem is evolving from pure client-side storage to a Supabase-backed backend. The monorepo must handle shared Supabase schemas across `gridiron`, `scrapper`, and `next-scraper`.
*   **Service vs. App Separation:** `next-scraper` is a collection of Node.js scripts rather than a Next.js app. It should be treated as a background service or a package of "Tools."
*   **Environment Secret Proliferation:** With three projects now using Supabase, a root-level `.env` management strategy is critical to prevent credential leaks or mismatches during local development.

## 3. Proposed Monorepo Architecture

The unified structure will expand the `apps/` and `packages/` directories to distinguish between UI and Services:

```text
latest-app/
├── apps/
│   ├── web/           (Main dashboard)
│   ├── games/         (Mini-games platform)
│   ├── memo/          (Memory/Personal hub)
│   ├── gridiron/      (Franchise management app)
│   ├── scrapper-ui/   (Admin dashboard for scrapers)
│   └── data-service/  (Background scripts ported from next-scraper)
├── packages/
│   ├── ui/            (Shared Shadcn/Tailwind 4 components)
│   ├── core/          (Shared business logic & Zustand stores)
│   ├── sdk/           (Supabase clients, API definitions, Scraper logic)
│   └── config/        (Shared build configurations)
└── package.json       (Root workspace configuration)
```

## 4. Step-by-Step Integration Path

### Phase 1: Migration & Namespace Setup
1.  **Project Relocation:**
    *   Move frontend apps to `apps/games`, `apps/memo`, `apps/gridiron`, and `apps/scrapper-ui`.
    *   Move the data loading scripts to `apps/data-service`.
2.  **Naming Convention:** Update all `package.json` names to `@platform/` scope (e.g., `@platform/scrapper`, `@platform/data-service`).
3.  **Root Unification:** Run `npm install` at the root to deduplicate common dependencies like `lucide-react`, `radix-ui`, and `supabase-js`.

### Phase 2: Logic & SDK Extraction
1.  **Shared Scraper SDK:** Extract core scraper logic (Axios/Cheerio/Supabase) from `next-scraper` into `packages/sdk/scrapers`. This allows the `scrapper-ui` app to trigger scripts directly via shared functions.
2.  **Global Supabase Client:** Centralize Supabase configuration in `packages/sdk/database`.
3.  **Tailwind Standardization:** Lift common styles from the four frontend apps into the shared `@platform/ui` package.

### Phase 3: Dashboard Integration (Zones)
1.  **Widget Conversion:** Convert key views (Scraper Status, Live Scoreboard, Draft Board) into components in `packages/widgets`.
2.  **Dynamic Loading:** Allow the main `web` dashboard to dynamically load these widgets based on "Zone" configuration, essentially making the main dashboard a portal into the other apps.

## 5. Benefits of Integration

*   **Integrated Monitoring:** Monitor the health of the `next-scraper` services directly from a widget on the main `web` dashboard.
*   **Code Resilience:** Type-safe shared schemas between the scraper scripts and the frontend displays ensure that database changes don't break the UI.
*   **Developer Velocity:** Update a single "NFL Season" config in `@platform/core` and have it reflect across the scrapers, the franchise game, and the scoreboard.

---
**Recommendation:** Proceed with Phase 1 by migrating the folders and renaming the packages. Start with `gridiron-franchise` as it has the most complex external dependencies (Supabase).
