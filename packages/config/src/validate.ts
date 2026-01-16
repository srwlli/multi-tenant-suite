import Ajv, { type ValidateFunction, type ErrorObject } from "ajv";
import tenantSchema from "./schemas/tenant.schema.json";
import type { TenantConfig } from "./schema";

// Create AJV instance with strict mode
const ajv = new Ajv({
  allErrors: true, // Collect all errors, not just the first one
  strict: true, // Strict mode for better validation
  validateSchema: false, // Don't validate the schema itself (it's static)
});

// Compile the tenant schema once
const validateTenantSchema: ValidateFunction<TenantConfig> = ajv.compile(
  tenantSchema
);

/**
 * Validate a tenant configuration using AJV and JSON Schema
 * @param tenant - The tenant data to validate
 * @returns True if valid, false otherwise
 */
export function validateTenantWithAjv(
  tenant: unknown
): tenant is TenantConfig {
  const valid = validateTenantSchema(tenant);
  return valid;
}

/**
 * Validate a tenant configuration and get detailed error messages
 * @param tenant - The tenant data to validate
 * @returns Object with isValid flag and errors array
 */
export function validateTenantWithErrors(tenant: unknown): {
  isValid: boolean;
  errors: ErrorObject[] | null;
} {
  const valid = validateTenantSchema(tenant);
  if (valid) {
    return {
      isValid: true,
      errors: null,
    };
  }
  // When validation fails, errors should be available
  const schemaErrors = validateTenantSchema.errors;
  // Type guard to ensure schemaErrors is an array
  if (schemaErrors && Array.isArray(schemaErrors)) {
    return {
      isValid: false,
      errors: schemaErrors as ErrorObject[],
    };
  }
  return {
    isValid: false,
    errors: null,
  };
}

/**
 * Format AJV validation errors into human-readable messages
 * @param errors - Array of AJV error objects
 * @returns Array of formatted error messages
 */
export function formatValidationErrors(
  errors: ErrorObject[] | null | undefined
): string[] {
  if (!errors || errors.length === 0) {
    return [];
  }

  return errors.map((error) => {
    const path = error.instancePath || error.schemaPath || "root";
    const message = error.message || "Validation error";
    const params = error.params
      ? ` (${JSON.stringify(error.params)})`
      : "";
    return `${path}: ${message}${params}`;
  });
}

/**
 * Validate tenant and throw if invalid
 * @param tenant - The tenant data to validate
 * @throws Error with formatted validation messages if invalid
 */
export function assertValidTenant(tenant: unknown): asserts tenant is TenantConfig {
  const { isValid, errors } = validateTenantWithErrors(tenant);
  if (!isValid) {
    const formattedErrors = formatValidationErrors(errors);
    throw new Error(
      `Invalid tenant configuration:\n${formattedErrors.join("\n")}`
    );
  }
}
