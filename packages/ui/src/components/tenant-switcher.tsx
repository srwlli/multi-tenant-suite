"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown";
import { cn } from "../lib/utils";

export interface TenantInfo {
  id: string;
  name: string;
}

export interface TenantSwitcherProps {
  /** Current tenant ID */
  tenantId: string;
  /** Available tenants to choose from */
  availableTenants: TenantInfo[];
  /** Callback when tenant changes */
  onTenantChange?: (tenantId: string) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Tenant Switcher Component
 * Dropdown for switching between tenants during development
 */
const TenantSwitcher = React.forwardRef<HTMLButtonElement, TenantSwitcherProps>(
  ({ tenantId, availableTenants, onTenantChange, className }, ref) => {
    const currentTenant = availableTenants.find((t) => t.id === tenantId);

    const handleTenantChange = (newTenantId: string) => {
      // Dispatch custom event for tenant change
      const event = new CustomEvent("platform:tenant-change", {
        detail: { tenantId: newTenantId },
        bubbles: true,
      });
      document.dispatchEvent(event);

      // Also call the callback if provided
      onTenantChange?.(newTenantId);
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            ref={ref}
            className={cn(
              "flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              className
            )}
            title={`Current tenant: ${currentTenant?.name || tenantId}`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 21h18M3 7v1a3 3 0 003 3h12a3 3 0 003-3V7M21 7H3M12 3v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{currentTenant?.name || tenantId}</span>
            <svg
              className="h-3 w-3 opacity-50"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Switch Tenant</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableTenants.map((tenant) => (
            <DropdownMenuItem
              key={tenant.id}
              onClick={() => handleTenantChange(tenant.id)}
              className={cn(
                tenant.id === tenantId && "bg-accent text-accent-foreground"
              )}
            >
              <span className="flex-1">{tenant.name}</span>
              {tenant.id === tenantId && (
                <svg
                  className="ml-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
TenantSwitcher.displayName = "TenantSwitcher";

export { TenantSwitcher };
