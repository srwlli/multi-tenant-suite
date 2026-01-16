import { describe, it, expect } from "vitest";
import {
  validateTenantWithAjv,
  validateTenantWithErrors,
  formatValidationErrors,
  assertValidTenant,
} from "../validate";

describe("AJV Tenant Validation", () => {
  const validTenant = {
    id: "acme-corp",
    name: "ACME Corporation",
    defaultLayout: "main-dashboard",
    layouts: ["main-dashboard"],
    features: {
      customizeDashboard: false,
      marketplace: false,
      darkMode: true,
    },
  };

  it("should validate a correct tenant", () => {
    expect(validateTenantWithAjv(validTenant)).toBe(true);
  });

  it("should reject tenant with missing required field", () => {
    const invalid = { id: "test", name: "Test" }; // missing defaultLayout
    expect(validateTenantWithAjv(invalid)).toBe(false);
  });

  it("should reject tenant with invalid ID pattern", () => {
    const invalid = {
      ...validTenant,
      id: "Invalid ID with spaces", // should be lowercase, no spaces
    };
    expect(validateTenantWithAjv(invalid)).toBe(false);
  });

  it("should provide detailed error messages", () => {
    const invalid = { id: "test" }; // missing required fields
    const { isValid, errors } = validateTenantWithErrors(invalid);
    expect(isValid).toBe(false);
    expect(errors).not.toBeNull();
    expect(errors?.length).toBeGreaterThan(0);
  });

  it("should format errors into readable messages", () => {
    const invalid = { id: "test" };
    const { errors } = validateTenantWithErrors(invalid);
    const formatted = formatValidationErrors(errors);
    expect(formatted.length).toBeGreaterThan(0);
    expect(formatted[0]).toContain("required");
  });

  it("should throw on invalid tenant with assertValidTenant", () => {
    const invalid = { id: "test" };
    expect(() => assertValidTenant(invalid)).toThrow();
  });

  it("should not throw on valid tenant with assertValidTenant", () => {
    expect(() => assertValidTenant(validTenant)).not.toThrow();
  });
});
