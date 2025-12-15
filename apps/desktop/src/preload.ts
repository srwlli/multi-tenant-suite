import { contextBridge, ipcRenderer } from "electron";

/**
 * Electron API exposed to renderer process
 * Uses contextBridge for security
 */
const electronAPI = {
  /**
   * Platform information
   */
  platform: {
    isElectron: true,
    isMac: process.platform === "darwin",
    isWindows: process.platform === "win32",
    isLinux: process.platform === "linux",
  },

  /**
   * Window controls
   */
  window: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize"),
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
  },

  /**
   * Theme management
   */
  theme: {
    get: () => ipcRenderer.invoke("theme:get"),
    set: (theme: "light" | "dark" | "system") =>
      ipcRenderer.invoke("theme:set", theme),
    onChanged: (callback: (theme: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, theme: string) => {
        callback(theme);
      };
      ipcRenderer.on("theme:changed", handler);
      return () => ipcRenderer.removeListener("theme:changed", handler);
    },
  },

  /**
   * File system operations
   */
  fs: {
    showOpenDialog: (options: Electron.OpenDialogOptions) =>
      ipcRenderer.invoke("fs:showOpenDialog", options),
    showSaveDialog: (options: Electron.SaveDialogOptions) =>
      ipcRenderer.invoke("fs:showSaveDialog", options),
    readFile: (filePath: string) => ipcRenderer.invoke("fs:readFile", filePath),
    readBinary: (filePath: string) =>
      ipcRenderer.invoke("fs:readBinary", filePath),
    writeFile: (filePath: string, data: string) =>
      ipcRenderer.invoke("fs:writeFile", filePath, data),
    listDirectory: (dirPath: string) =>
      ipcRenderer.invoke("fs:listDirectory", dirPath),
    exists: (filePath: string) => ipcRenderer.invoke("fs:exists", filePath),
    watchFile: (filePath: string, watchId: string) =>
      ipcRenderer.invoke("fs:watchFile", filePath, watchId),
    unwatchFile: (watchId: string) =>
      ipcRenderer.invoke("fs:unwatchFile", watchId),
    onFileChange: (
      watchId: string,
      callback: (event: { type: string; path: string; content?: string }) => void
    ) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        data: { type: string; path: string; content?: string }
      ) => {
        callback(data);
      };
      ipcRenderer.on(`fs:watch:${watchId}`, handler);
      return () => ipcRenderer.removeListener(`fs:watch:${watchId}`, handler);
    },
  },

  /**
   * Notifications
   */
  notifications: {
    show: (title: string, body: string, options?: object) =>
      ipcRenderer.invoke("notifications:show", title, body, options),
  },

  /**
   * App info
   */
  app: {
    getVersion: () => ipcRenderer.invoke("app:getVersion"),
    getName: () => ipcRenderer.invoke("app:getName"),
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", electronAPI);

// Type declaration for renderer process
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
