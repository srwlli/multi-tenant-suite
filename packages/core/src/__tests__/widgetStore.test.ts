/**
 * Widget Store Tests
 * Tests for widget instance management
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  useWidgetStore,
  selectWidgetInstance,
  selectWidgetLoading,
  selectAllWidgetIds,
  selectWidgetsByTenant,
  selectWidgetIdsByTenant,
  selectWidgetInstanceForTenant,
} from "../store/widgetStore";

describe("widgetStore", () => {
  beforeEach(() => {
    useWidgetStore.getState().clearWidgets();
  });

  describe("initial state", () => {
    it("should have empty instances", () => {
      const state = useWidgetStore.getState();

      expect(state.instances).toEqual({});
      expect(state.focusedWidget).toBeNull();
    });
  });

  describe("addWidget", () => {
    it("should add a widget instance with tenantId", () => {
      useWidgetStore.getState().addWidget({
        id: "instance-1",
        tenantId: "tenant-a",
        widgetId: "my-widget",
        config: { title: "Test" },
      });

      const instance = useWidgetStore.getState().instances["instance-1"];
      expect(instance).toBeDefined();
      expect(instance.id).toBe("instance-1");
      expect(instance.tenantId).toBe("tenant-a");
      expect(instance.widgetId).toBe("my-widget");
      expect(instance.config).toEqual({ title: "Test" });
      expect(instance.loadingState).toBe("idle");
      expect(instance.error).toBeNull();
      expect(instance.lastUpdated).toBeGreaterThan(0);
    });

    it("should add multiple widgets", () => {
      useWidgetStore.getState().addWidget({
        id: "instance-1",
        tenantId: "tenant-a",
        widgetId: "widget-a",
        config: {},
      });
      useWidgetStore.getState().addWidget({
        id: "instance-2",
        tenantId: "tenant-a",
        widgetId: "widget-b",
        config: {},
      });

      const ids = Object.keys(useWidgetStore.getState().instances);
      expect(ids).toContain("instance-1");
      expect(ids).toContain("instance-2");
    });
  });

  describe("removeWidget", () => {
    it("should remove a widget instance", () => {
      useWidgetStore.getState().addWidget({
        id: "instance-1",
        tenantId: "tenant-a",
        widgetId: "my-widget",
        config: {},
      });

      useWidgetStore.getState().removeWidget("instance-1");

      expect(useWidgetStore.getState().instances["instance-1"]).toBeUndefined();
    });

    it("should clear focused widget if removed widget was focused", () => {
      useWidgetStore.getState().addWidget({
        id: "instance-1",
        tenantId: "tenant-a",
        widgetId: "my-widget",
        config: {},
      });
      useWidgetStore.getState().setFocusedWidget("instance-1");

      useWidgetStore.getState().removeWidget("instance-1");

      expect(useWidgetStore.getState().focusedWidget).toBeNull();
    });

    it("should not affect focused widget if different widget removed", () => {
      useWidgetStore.getState().addWidget({
        id: "instance-1",
        tenantId: "tenant-a",
        widgetId: "my-widget",
        config: {},
      });
      useWidgetStore.getState().addWidget({
        id: "instance-2",
        tenantId: "tenant-a",
        widgetId: "my-widget",
        config: {},
      });
      useWidgetStore.getState().setFocusedWidget("instance-2");

      useWidgetStore.getState().removeWidget("instance-1");

      expect(useWidgetStore.getState().focusedWidget).toBe("instance-2");
    });
  });

  describe("updateWidgetConfig", () => {
    it("should update widget config", () => {
      useWidgetStore.getState().addWidget({
        id: "instance-1",
        tenantId: "tenant-a",
        widgetId: "my-widget",
        config: { title: "Original" },
      });

      useWidgetStore.getState().updateWidgetConfig("instance-1", { title: "Updated" });

      expect(useWidgetStore.getState().instances["instance-1"].config.title).toBe("Updated");
    });

    it("should merge config with existing values", () => {
      useWidgetStore.getState().addWidget({
        id: "instance-1",
        tenantId: "tenant-a",
        widgetId: "my-widget",
        config: { title: "Test", color: "blue" },
      });

      useWidgetStore.getState().updateWidgetConfig("instance-1", { title: "Updated" });

      const config = useWidgetStore.getState().instances["instance-1"].config;
      expect(config.title).toBe("Updated");
      expect(config.color).toBe("blue"); // unchanged
    });

    it("should update lastUpdated timestamp", () => {
      useWidgetStore.getState().addWidget({
        id: "instance-1",
        tenantId: "tenant-a",
        widgetId: "my-widget",
        config: {},
      });
      const originalTimestamp = useWidgetStore.getState().instances["instance-1"].lastUpdated;

      // Wait a bit to ensure different timestamp
      const later = Date.now() + 1;
      while (Date.now() < later) {
        // busy wait
      }

      useWidgetStore.getState().updateWidgetConfig("instance-1", { updated: true });

      expect(useWidgetStore.getState().instances["instance-1"].lastUpdated).toBeGreaterThanOrEqual(
        originalTimestamp
      );
    });

    it("should not update non-existent widget", () => {
      useWidgetStore.getState().updateWidgetConfig("non-existent", { title: "Test" });

      expect(useWidgetStore.getState().instances["non-existent"]).toBeUndefined();
    });
  });

  describe("setWidgetLoading", () => {
    it("should set loading state", () => {
      useWidgetStore.getState().addWidget({
        id: "instance-1",
        tenantId: "tenant-a",
        widgetId: "my-widget",
        config: {},
      });

      useWidgetStore.getState().setWidgetLoading("instance-1", "loading");

      expect(useWidgetStore.getState().instances["instance-1"].loadingState).toBe("loading");
    });

    it("should set error state with message", () => {
      useWidgetStore.getState().addWidget({
        id: "instance-1",
        tenantId: "tenant-a",
        widgetId: "my-widget",
        config: {},
      });

      useWidgetStore.getState().setWidgetLoading("instance-1", "error", "Something went wrong");

      const instance = useWidgetStore.getState().instances["instance-1"];
      expect(instance.loadingState).toBe("error");
      expect(instance.error).toBe("Something went wrong");
    });

    it("should clear error when setting success", () => {
      useWidgetStore.getState().addWidget({
        id: "instance-1",
        tenantId: "tenant-a",
        widgetId: "my-widget",
        config: {},
      });
      useWidgetStore.getState().setWidgetLoading("instance-1", "error", "Error");
      useWidgetStore.getState().setWidgetLoading("instance-1", "success");

      const instance = useWidgetStore.getState().instances["instance-1"];
      expect(instance.loadingState).toBe("success");
      expect(instance.error).toBeNull();
    });
  });

  describe("setFocusedWidget", () => {
    it("should set focused widget", () => {
      useWidgetStore.getState().setFocusedWidget("instance-1");

      expect(useWidgetStore.getState().focusedWidget).toBe("instance-1");
    });

    it("should allow clearing focused widget", () => {
      useWidgetStore.getState().setFocusedWidget("instance-1");
      useWidgetStore.getState().setFocusedWidget(null);

      expect(useWidgetStore.getState().focusedWidget).toBeNull();
    });
  });

  describe("clearWidgets", () => {
    it("should remove all widgets", () => {
      useWidgetStore.getState().addWidget({ id: "instance-1", tenantId: "tenant-a", widgetId: "w1", config: {} });
      useWidgetStore.getState().addWidget({ id: "instance-2", tenantId: "tenant-a", widgetId: "w2", config: {} });
      useWidgetStore.getState().setFocusedWidget("instance-1");

      useWidgetStore.getState().clearWidgets();

      expect(useWidgetStore.getState().instances).toEqual({});
      expect(useWidgetStore.getState().focusedWidget).toBeNull();
    });
  });

  describe("selectors", () => {
    beforeEach(() => {
      useWidgetStore.getState().addWidget({
        id: "instance-1",
        tenantId: "tenant-a",
        widgetId: "my-widget",
        config: { title: "Test" },
      });
      useWidgetStore.getState().setWidgetLoading("instance-1", "success");
    });

    it("selectWidgetInstance should return instance by id", () => {
      const instance = selectWidgetInstance("instance-1")(useWidgetStore.getState());

      expect(instance).toBeDefined();
      expect(instance?.id).toBe("instance-1");
    });

    it("selectWidgetInstance should return undefined for non-existent", () => {
      const instance = selectWidgetInstance("non-existent")(useWidgetStore.getState());

      expect(instance).toBeUndefined();
    });

    it("selectWidgetLoading should return loading state", () => {
      const loading = selectWidgetLoading("instance-1")(useWidgetStore.getState());

      expect(loading).toBe("success");
    });

    it("selectWidgetLoading should return idle for non-existent", () => {
      const loading = selectWidgetLoading("non-existent")(useWidgetStore.getState());

      expect(loading).toBe("idle");
    });

    it("selectAllWidgetIds should return all instance IDs", () => {
      useWidgetStore.getState().addWidget({ id: "instance-2", tenantId: "tenant-a", widgetId: "w2", config: {} });

      const ids = selectAllWidgetIds(useWidgetStore.getState());

      expect(ids).toContain("instance-1");
      expect(ids).toContain("instance-2");
    });
  });

  describe("tenant isolation selectors", () => {
    beforeEach(() => {
      // Tenant A widgets
      useWidgetStore.getState().addWidget({
        id: "tenant-a-widget-1",
        tenantId: "tenant-a",
        widgetId: "chart",
        config: { title: "A Chart 1" },
      });
      useWidgetStore.getState().addWidget({
        id: "tenant-a-widget-2",
        tenantId: "tenant-a",
        widgetId: "table",
        config: { title: "A Table" },
      });
      // Tenant B widgets
      useWidgetStore.getState().addWidget({
        id: "tenant-b-widget-1",
        tenantId: "tenant-b",
        widgetId: "chart",
        config: { title: "B Chart 1" },
      });
    });

    it("selectWidgetsByTenant should return only widgets for that tenant", () => {
      const tenantAWidgets = selectWidgetsByTenant("tenant-a")(useWidgetStore.getState());
      const tenantBWidgets = selectWidgetsByTenant("tenant-b")(useWidgetStore.getState());

      expect(tenantAWidgets).toHaveLength(2);
      expect(tenantAWidgets.every((w) => w.tenantId === "tenant-a")).toBe(true);
      expect(tenantBWidgets).toHaveLength(1);
      expect(tenantBWidgets[0].tenantId).toBe("tenant-b");
    });

    it("selectWidgetsByTenant should return empty array for non-existent tenant", () => {
      const widgets = selectWidgetsByTenant("tenant-c")(useWidgetStore.getState());

      expect(widgets).toEqual([]);
    });

    it("selectWidgetIdsByTenant should return only IDs for that tenant", () => {
      const tenantAIds = selectWidgetIdsByTenant("tenant-a")(useWidgetStore.getState());
      const tenantBIds = selectWidgetIdsByTenant("tenant-b")(useWidgetStore.getState());

      expect(tenantAIds).toContain("tenant-a-widget-1");
      expect(tenantAIds).toContain("tenant-a-widget-2");
      expect(tenantAIds).not.toContain("tenant-b-widget-1");
      expect(tenantBIds).toEqual(["tenant-b-widget-1"]);
    });

    it("selectWidgetInstanceForTenant should return instance only if tenant matches", () => {
      // Should return instance when tenant matches
      const correctTenant = selectWidgetInstanceForTenant("tenant-a", "tenant-a-widget-1")(
        useWidgetStore.getState()
      );
      expect(correctTenant).toBeDefined();
      expect(correctTenant?.id).toBe("tenant-a-widget-1");

      // Should return undefined when tenant doesn't match
      const wrongTenant = selectWidgetInstanceForTenant("tenant-b", "tenant-a-widget-1")(
        useWidgetStore.getState()
      );
      expect(wrongTenant).toBeUndefined();
    });

    it("tenant A cannot see tenant B widget instances", () => {
      const tenantAWidgets = selectWidgetsByTenant("tenant-a")(useWidgetStore.getState());
      const tenantBIds = tenantAWidgets.map((w) => w.id);

      // Tenant A should not have any tenant B widgets
      expect(tenantBIds).not.toContain("tenant-b-widget-1");

      // Explicitly check cross-tenant access is blocked
      const crossTenantAccess = selectWidgetInstanceForTenant("tenant-a", "tenant-b-widget-1")(
        useWidgetStore.getState()
      );
      expect(crossTenantAccess).toBeUndefined();
    });
  });
});
