/**
 * useRestApi Hook
 * REST API data fetching with built-in caching
 *
 * For advanced caching with dataStore, use the cacheProvider option
 * or integrate with @platform/core's useDataStore in your widget.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  RestApiConfig,
  UseRestApiOptions,
  UseRestApiResult,
  DataStatus,
} from "./types";

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;

  const now = Date.now();
  if (now > entry.timestamp + entry.ttl) {
    cache.delete(key);
    return undefined;
  }

  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

function invalidateCacheEntry(key: string): void {
  cache.delete(key);
}

function isCacheValid(key: string): boolean {
  const entry = cache.get(key);
  if (!entry) return false;
  return Date.now() <= entry.timestamp + entry.ttl;
}

/**
 * Hook for fetching data from REST APIs
 * Features: caching, auto-refresh, abort on unmount
 */
export function useRestApi<T = unknown>(
  config: RestApiConfig,
  options: UseRestApiOptions<T> = {}
): UseRestApiResult<T> {
  const {
    initialData,
    fetchOnMount = true,
    transform,
    body,
    onSuccess,
    onError,
  } = options;

  const {
    url,
    method = "GET",
    headers = {},
    refreshInterval = 0,
    cacheTtl = DEFAULT_CACHE_TTL,
    timeout = DEFAULT_TIMEOUT,
  } = config;

  // Generate stable cache key
  const cacheKey = `rest:${method}:${url}:${JSON.stringify(body ?? {})}`;

  // Local state
  const [data, setData] = useState<T | undefined>(() => {
    const cached = getCached<T>(cacheKey);
    return cached ?? initialData;
  });
  const [status, setStatus] = useState<DataStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Store ALL config and callbacks in refs to avoid dependency changes
  // This is the React-recommended pattern for stable callbacks
  const configRef = useRef({
    url,
    method,
    headers,
    body,
    timeout,
    cacheTtl,
    cacheKey,
    transform,
    onSuccess,
    onError,
  });

  // Sync refs with latest values (no deps = runs every render, but doesn't trigger re-renders)
  configRef.current = {
    url,
    method,
    headers,
    body,
    timeout,
    cacheTtl,
    cacheKey,
    transform,
    onSuccess,
    onError,
  };

  // Fetch function - stable reference with empty deps, uses refs for all values
  const fetchData = useCallback(async (skipCache = false) => {
    const {
      url: fetchUrl,
      method: fetchMethod,
      headers: fetchHeaders,
      body: fetchBody,
      timeout: fetchTimeout,
      cacheTtl: fetchCacheTtl,
      cacheKey: fetchCacheKey,
      transform: fetchTransform,
      onSuccess: fetchOnSuccess,
      onError: fetchOnError,
    } = configRef.current;

    // Check cache first (unless skipCache)
    if (!skipCache && isCacheValid(fetchCacheKey)) {
      const cached = getCached<T>(fetchCacheKey);
      if (cached !== undefined) {
        setData(cached);
        setStatus("success");
        return;
      }
    }

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Set loading state
    setStatus("loading");

    try {
      // Create timeout
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, fetchTimeout);

      // Make request
      const response = await fetch(fetchUrl, {
        method: fetchMethod,
        headers: {
          "Content-Type": "application/json",
          ...fetchHeaders,
        },
        body: fetchBody ? JSON.stringify(fetchBody) : undefined,
        signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse response
      const rawData = await response.json();
      const transformedData = fetchTransform
        ? fetchTransform(rawData)
        : (rawData as T);

      // Only update if still mounted
      if (mountedRef.current) {
        // Update cache
        setCache(fetchCacheKey, transformedData, fetchCacheTtl);

        // Update local state
        setData(transformedData);
        setStatus("success");
        setError(null);

        // Call success callback
        fetchOnSuccess?.(transformedData);
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      // Only update if still mounted
      if (mountedRef.current) {
        const fetchError =
          err instanceof Error ? err : new Error(String(err));
        setError(fetchError);
        setStatus("error");

        // Call error callback
        fetchOnError?.(fetchError);
      }
    }
  }, []); // Empty deps - uses refs for all values

  // Refetch function (uses cache)
  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  // Invalidate and refetch function
  const invalidate = useCallback(async () => {
    invalidateCacheEntry(configRef.current.cacheKey);
    await fetchData(true);
  }, [fetchData]);

  // Fetch on mount
  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchOnMount, fetchData]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchData(true); // Skip cache for refresh
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshInterval, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    data,
    status,
    error,
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
    refetch,
    invalidate,
  };
}
