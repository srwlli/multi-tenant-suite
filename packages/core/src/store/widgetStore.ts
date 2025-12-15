/**
 * Widget Store
 * Widget instance management: active widgets, loading states, error states
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { WidgetStore, WidgetState } from "./types";

const initialState: WidgetState = {
  instances: {},
  focusedWidget: null,
};

export const useWidgetStore = create<WidgetStore>()(
  devtools(
    (set) => ({
      ...initialState,

      addWidget: (instance) =>
        set(
          (state) => ({
            instances: {
              ...state.instances,
              [instance.id]: {
                ...instance,
                loadingState: "idle",
                error: null,
                lastUpdated: Date.now(),
              },
            },
          }),
          false,
          "addWidget"
        ),

      removeWidget: (instanceId) =>
        set(
          (state) => {
            const { [instanceId]: removed, ...rest } = state.instances;
            return {
              instances: rest,
              focusedWidget:
                state.focusedWidget === instanceId ? null : state.focusedWidget,
            };
          },
          false,
          "removeWidget"
        ),

      updateWidgetConfig: (instanceId, config) =>
        set(
          (state) => {
            const instance = state.instances[instanceId];
            if (!instance) return state;
            return {
              instances: {
                ...state.instances,
                [instanceId]: {
                  ...instance,
                  config: { ...instance.config, ...config },
                  lastUpdated: Date.now(),
                },
              },
            };
          },
          false,
          "updateWidgetConfig"
        ),

      setWidgetLoading: (instanceId, loadingState, error) =>
        set(
          (state) => {
            const instance = state.instances[instanceId];
            if (!instance) return state;
            return {
              instances: {
                ...state.instances,
                [instanceId]: {
                  ...instance,
                  loadingState,
                  error: error ?? null,
                  lastUpdated: Date.now(),
                },
              },
            };
          },
          false,
          "setWidgetLoading"
        ),

      setFocusedWidget: (instanceId) =>
        set({ focusedWidget: instanceId }, false, "setFocusedWidget"),

      clearWidgets: () => set(initialState, false, "clearWidgets"),
    }),
    { name: "WidgetStore" }
  )
);

// Selector helpers for performance
export const selectWidgetInstance = (instanceId: string) => (state: WidgetStore) =>
  state.instances[instanceId];

export const selectWidgetLoading = (instanceId: string) => (state: WidgetStore) =>
  state.instances[instanceId]?.loadingState ?? "idle";

export const selectAllWidgetIds = (state: WidgetStore) =>
  Object.keys(state.instances);

// Tenant-scoped selectors for multi-tenant isolation
export const selectWidgetsByTenant = (tenantId: string) => (state: WidgetStore) =>
  Object.values(state.instances).filter((instance) => instance.tenantId === tenantId);

export const selectWidgetIdsByTenant = (tenantId: string) => (state: WidgetStore) =>
  Object.values(state.instances)
    .filter((instance) => instance.tenantId === tenantId)
    .map((instance) => instance.id);

export const selectWidgetInstanceForTenant =
  (tenantId: string, instanceId: string) => (state: WidgetStore) => {
    const instance = state.instances[instanceId];
    return instance?.tenantId === tenantId ? instance : undefined;
  };
