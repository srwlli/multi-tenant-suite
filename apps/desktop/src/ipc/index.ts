import {
  IpcMain,
  BrowserWindow,
  app,
  dialog,
  Notification,
  nativeTheme,
} from "electron";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";

/**
 * Register all IPC handlers
 */
export function registerIpcHandlers(
  ipcMain: IpcMain,
  mainWindow: BrowserWindow
): void {
  // Window controls
  ipcMain.handle("window:minimize", () => {
    mainWindow.minimize();
  });

  ipcMain.handle("window:maximize", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle("window:close", () => {
    mainWindow.close();
  });

  ipcMain.handle("window:isMaximized", () => {
    return mainWindow.isMaximized();
  });

  // Theme management
  ipcMain.handle("theme:get", () => {
    return nativeTheme.shouldUseDarkColors ? "dark" : "light";
  });

  ipcMain.handle("theme:set", (_event, theme: "light" | "dark" | "system") => {
    nativeTheme.themeSource = theme;
    return true;
  });

  // Listen for system theme changes
  nativeTheme.on("updated", () => {
    mainWindow.webContents.send(
      "theme:changed",
      nativeTheme.shouldUseDarkColors ? "dark" : "light"
    );
  });

  // File system operations
  ipcMain.handle(
    "fs:showOpenDialog",
    async (_event, options: Electron.OpenDialogOptions) => {
      const result = await dialog.showOpenDialog(mainWindow, options);
      return result;
    }
  );

  ipcMain.handle(
    "fs:showSaveDialog",
    async (_event, options: Electron.SaveDialogOptions) => {
      const result = await dialog.showSaveDialog(mainWindow, options);
      return result;
    }
  );

  ipcMain.handle("fs:readFile", async (_event, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return { success: true, content };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle(
    "fs:writeFile",
    async (_event, filePath: string, data: string) => {
      try {
        await fs.writeFile(filePath, data, "utf-8");
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }
  );

  ipcMain.handle("fs:readBinary", async (_event, filePath: string) => {
    try {
      const buffer = await fs.readFile(filePath);
      return { success: true, data: buffer };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle("fs:listDirectory", async (_event, dirPath: string) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const files = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dirPath, entry.name);
          const stats = await fs.stat(fullPath);
          return {
            name: entry.name,
            path: fullPath,
            size: stats.size,
            isDirectory: entry.isDirectory(),
            modifiedAt: stats.mtime.getTime(),
            createdAt: stats.birthtime.getTime(),
          };
        })
      );
      return { success: true, files };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle("fs:exists", async (_event, filePath: string) => {
    try {
      await fs.access(filePath);
      return { success: true, exists: true };
    } catch {
      return { success: true, exists: false };
    }
  });

  // File watchers (store for cleanup)
  const fileWatchers = new Map<string, fsSync.FSWatcher>();

  ipcMain.handle("fs:watchFile", (_event, filePath: string, watchId: string) => {
    try {
      // Clean up existing watcher if any
      if (fileWatchers.has(watchId)) {
        fileWatchers.get(watchId)?.close();
      }

      const watcher = fsSync.watch(filePath, async (eventType) => {
        if (eventType === "change") {
          try {
            const content = await fs.readFile(filePath, "utf-8");
            mainWindow.webContents.send(`fs:watch:${watchId}`, {
              type: "change",
              path: filePath,
              content,
            });
          } catch {
            mainWindow.webContents.send(`fs:watch:${watchId}`, {
              type: "change",
              path: filePath,
            });
          }
        } else if (eventType === "rename") {
          mainWindow.webContents.send(`fs:watch:${watchId}`, {
            type: "rename",
            path: filePath,
          });
        }
      });

      fileWatchers.set(watchId, watcher);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle("fs:unwatchFile", (_event, watchId: string) => {
    const watcher = fileWatchers.get(watchId);
    if (watcher) {
      watcher.close();
      fileWatchers.delete(watchId);
    }
    return { success: true };
  });

  // Notifications
  ipcMain.handle(
    "notifications:show",
    (_event, title: string, body: string, _options?: object) => {
      if (Notification.isSupported()) {
        const notification = new Notification({ title, body });
        notification.show();
        return true;
      }
      return false;
    }
  );

  // App info
  ipcMain.handle("app:getVersion", () => {
    return app.getVersion();
  });

  ipcMain.handle("app:getName", () => {
    return app.getName();
  });
}
