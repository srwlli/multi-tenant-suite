import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Enable static export for Electron production builds (disabled in dev for HMR)
  output: isDev ? undefined : "export",

  // Use relative paths for Electron file:// protocol compatibility
  // (disabled in dev to prevent breaking HMR WebSockets)
  basePath: "",
  assetPrefix: isDev ? "" : "./",

  // Generate proper folder structure for file:// navigation
  trailingSlash: true,

  // Transpile monorepo packages
  transpilePackages: [
    "@platform/sdk",
    "@platform/core",
    "@platform/ui",
    "@platform/config",
    "@platform/widgets",
  ],

  // Experimental features
  experimental: {
    // Enable React 19 features
  },

  // Turbopack configuration (used with --turbopack flag)
  // No additional config needed for basic usage
};

export default withPWA(nextConfig);
