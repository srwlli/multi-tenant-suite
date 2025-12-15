# Dev-Mode Tenant Switcher - Deliverables

> **Status:** 🚧 Not Started
> **Plan:** `plan.json`

---

## Phase 1: Component Creation

### Tasks

- [ ] **TS-001**: Create TenantSwitcher component using DropdownMenu
  - File: `packages/ui/src/components/tenant-switcher.tsx`

- [ ] **TS-002**: Export TenantSwitcher from UI package
  - File: `packages/ui/src/components/index.ts`

### Deliverables
- [ ] TenantSwitcher dropdown component

---

## Phase 2: Context Extension

### Tasks

- [ ] **TS-003**: Add setTenantId to PlatformProvider context
  - File: `packages/core/src/platform/PlatformProvider.tsx`

- [ ] **TS-004**: Add tenantId state and event listener to Providers
  - File: `apps/web/app/providers.tsx`

### Deliverables
- [ ] Dynamic tenantId in context

---

## Phase 3: Integration

### Tasks

- [ ] **TS-005**: Add TenantSwitcher to Dashboard header actions
  - File: `apps/web/app/page.tsx`

### Deliverables
- [ ] Working tenant switcher in header

---

## Success Criteria

- [ ] TenantSwitcher dropdown visible in header
- [ ] Dropdown lists available tenants from config
- [ ] Selecting tenant updates context for all widgets
- [ ] Build succeeds
- [ ] No console errors
