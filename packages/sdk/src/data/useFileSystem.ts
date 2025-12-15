/**
 * useFileSystem Hook
 * File system access for Electron desktop apps
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  UseFileSystemOptions,
  UseFileSystemResult,
  FileInfo,
  FileWatchEvent,
  DataStatus,
} from "./types";

/**
 * Check if running in Electron
 */
const isElectron = (): boolean => {
  return typeof window !== "undefined" && "electronAPI" in window;
};

/**
 * Get Electron API (type-safe)
 */
const getElectronAPI = () => {
  if (!isElectron()) return null;
  return (window as Window & { electronAPI?: ElectronAPI }).electronAPI ?? null;
};

/** Electron API type */
interface ElectronAPI {
  fs: {
    readFile: (
      path: string
    ) => Promise<{ success: boolean; content?: string; error?: string }>;
    readBinary: (
      path: string
    ) => Promise<{ success: boolean; data?: ArrayBuffer; error?: string }>;
    writeFile: (
      path: string,
      data: string
    ) => Promise<{ success: boolean; error?: string }>;
    listDirectory: (
      path: string
    ) => Promise<{ success: boolean; files?: FileInfo[]; error?: string }>;
    exists: (
      path: string
    ) => Promise<{ success: boolean; exists?: boolean }>;
    watchFile: (
      path: string,
      watchId: string
    ) => Promise<{ success: boolean; error?: string }>;
    unwatchFile: (watchId: string) => Promise<{ success: boolean }>;
    onFileChange: (
      watchId: string,
      callback: (event: FileWatchEvent) => void
    ) => () => void;
  };
}

let watchIdCounter = 0;

/**
 * Hook for file system access (Electron only)
 */
export function useFileSystem(
  options: UseFileSystemOptions = {}
): UseFileSystemResult {
  const { basePath = "" } = options;

  const [status, setStatus] = useState<DataStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  // Track active watchers for cleanup
  const watchersRef = useRef<Map<string, () => void>>(new Map());
  const mountedRef = useRef(true);

  // Check if file system is available
  const isAvailable = isElectron();

  // Resolve path with base path
  const resolvePath = useCallback(
    (filePath: string) => {
      if (basePath && !filePath.startsWith("/") && !filePath.match(/^[A-Za-z]:/)) {
        return `${basePath}/${filePath}`;
      }
      return filePath;
    },
    [basePath]
  );

  // Read file as text
  const readFile = useCallback(
    async (path: string): Promise<string> => {
      const api = getElectronAPI();
      if (!api) {
        throw new Error("File system not available (not in Electron)");
      }

      setStatus("loading");
      setError(null);

      try {
        const result = await api.fs.readFile(resolvePath(path));
        if (!result.success) {
          throw new Error(result.error || "Failed to read file");
        }
        if (mountedRef.current) {
          setStatus("success");
        }
        return result.content || "";
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(error);
          setStatus("error");
        }
        throw error;
      }
    },
    [resolvePath]
  );

  // Read file as binary
  const readBinary = useCallback(
    async (path: string): Promise<ArrayBuffer> => {
      const api = getElectronAPI();
      if (!api) {
        throw new Error("File system not available (not in Electron)");
      }

      setStatus("loading");
      setError(null);

      try {
        const result = await api.fs.readBinary(resolvePath(path));
        if (!result.success) {
          throw new Error(result.error || "Failed to read file");
        }
        if (mountedRef.current) {
          setStatus("success");
        }
        return result.data || new ArrayBuffer(0);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(error);
          setStatus("error");
        }
        throw error;
      }
    },
    [resolvePath]
  );

  // Write file
  const writeFile = useCallback(
    async (path: string, content: string): Promise<void> => {
      const api = getElectronAPI();
      if (!api) {
        throw new Error("File system not available (not in Electron)");
      }

      setStatus("loading");
      setError(null);

      try {
        const result = await api.fs.writeFile(resolvePath(path), content);
        if (!result.success) {
          throw new Error(result.error || "Failed to write file");
        }
        if (mountedRef.current) {
          setStatus("success");
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(error);
          setStatus("error");
        }
        throw error;
      }
    },
    [resolvePath]
  );

  // List directory contents
  const listDirectory = useCallback(
    async (path: string): Promise<FileInfo[]> => {
      const api = getElectronAPI();
      if (!api) {
        throw new Error("File system not available (not in Electron)");
      }

      setStatus("loading");
      setError(null);

      try {
        const result = await api.fs.listDirectory(resolvePath(path));
        if (!result.success) {
          throw new Error(result.error || "Failed to list directory");
        }
        if (mountedRef.current) {
          setStatus("success");
        }
        return result.files || [];
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(error);
          setStatus("error");
        }
        throw error;
      }
    },
    [resolvePath]
  );

  // Watch file for changes
  const watchFile = useCallback(
    (path: string, callback: (event: FileWatchEvent) => void): (() => void) => {
      const api = getElectronAPI();
      if (!api) {
        console.warn("File system not available (not in Electron)");
        return () => {};
      }

      const watchId = `watch-${++watchIdCounter}`;
      const resolvedPath = resolvePath(path);

      // Set up the watcher
      api.fs.watchFile(resolvedPath, watchId).then((result) => {
        if (!result.success) {
          console.error("Failed to watch file:", result.error);
        }
      });

      // Listen for changes
      const unsubscribe = api.fs.onFileChange(watchId, callback);

      // Store cleanup function
      const cleanup = () => {
        unsubscribe();
        api.fs.unwatchFile(watchId);
        watchersRef.current.delete(watchId);
      };

      watchersRef.current.set(watchId, cleanup);

      return cleanup;
    },
    [resolvePath]
  );

  // Check if file exists
  const exists = useCallback(
    async (path: string): Promise<boolean> => {
      const api = getElectronAPI();
      if (!api) {
        throw new Error("File system not available (not in Electron)");
      }

      try {
        const result = await api.fs.exists(resolvePath(path));
        return result.exists ?? false;
      } catch {
        return false;
      }
    },
    [resolvePath]
  );

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      // Clean up all watchers
      watchersRef.current.forEach((cleanup) => cleanup());
      watchersRef.current.clear();
    };
  }, []);

  return {
    isAvailable,
    status,
    error,
    readFile,
    readBinary,
    writeFile,
    listDirectory,
    watchFile,
    exists,
  };
}
