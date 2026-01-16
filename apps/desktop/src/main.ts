/**
 * Electron Main Process
 * 
 * This is the main entry point for the Electron desktop application.
 * 
 * DEVELOPMENT MODE:
 * - Requires the web dev server to be running first
 * - Loads the app from http://localhost:3000
 * - To start: Run 'npm run dev:web' in root, then 'npm run dev:desktop'
 * - Or run 'npm run dev' in root to start both (if configured)
 * 
 * PRODUCTION MODE:
 * - Requires the web app to be built first (npm run build:web)
 * - Loads the app from the static export in apps/web/out
 * - The static files are bundled with the Electron app via electron-builder
 * 
 * IMPORTANT: The web app must be running/available before Electron can load it!
 */

import { app, BrowserWindow, ipcMain, session } from "electron";
import * as path from "path";
import * as http from "http";
import { registerIpcHandlers } from "./ipc";

// Determine if running in development mode
// Use only app.isPackaged to avoid conflicts with user's NODE_ENV
const isDev = !app.isPackaged;

// Set environment variable so Next.js knows it's running in Electron
// This disables PWA features that can cause crashes
process.env.ELECTRON = "true";

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

/**
 * Check if a URL is reachable
 */
function checkUrlReachable(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
      path: urlObj.pathname,
      method: "HEAD",
      timeout: 2000,
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode !== undefined && res.statusCode < 500);
    });

    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Find the port where the web dev server is running
 * Tries ports 3000-3010
 */
async function findDevServerPort(): Promise<number | null> {
  const startPort = parseInt(process.env.DEV_PORT || "3000", 10);
  const maxPort = startPort + 10;

  for (let port = startPort; port <= maxPort; port++) {
    const url = `http://localhost:${port}`;
    const isReachable = await checkUrlReachable(url);
    if (isReachable) {
      console.log(`[Electron] Found web server on port ${port}`);
      return port;
    }
  }

  return null;
}

/**
 * Wait for the web dev server to be ready
 */
async function waitForDevServer(maxAttempts = 30, delayMs = 1000): Promise<number | null> {
  console.log("[Electron] Waiting for web dev server to be ready...");
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const port = await findDevServerPort();
    if (port !== null) {
      return port;
    }
    
    if (attempt < maxAttempts) {
      console.log(`[Electron] Attempt ${attempt}/${maxAttempts}: Web server not ready, retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.error("[Electron] Web dev server not found after all attempts");
  return null;
}

/**
 * Create the main application window
 */
async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "Business Dashboard",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Disable service workers to prevent storage errors
      partition: isDev ? "persist:dev" : "default",
    },
    // Modern window styling
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 15, y: 15 },
    backgroundColor: "#0a0a0a",
    show: false, // Don't show until ready
  });

  // Register IPC handlers
  registerIpcHandlers(ipcMain, mainWindow);

  // Load the appropriate URL based on environment
  if (isDev) {
    // Development: load from Next.js dev server
    // Automatically detect the port (tries 3000-3010) and wait for server to be ready
    const detectedPort = await waitForDevServer();
    
    if (detectedPort === null) {
      // Show error page if server not found
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Connection Error - Business Dashboard</title>
          <style>
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              flex-direction: column;
              font-family: system-ui, -apple-system, sans-serif;
              padding: 2rem;
              background: #0a0a0a;
              color: #ffffff;
            }
            h1 { color: #ef4444; margin-bottom: 1rem; }
            p { color: #9ca3af; margin-bottom: 1rem; text-align: center; max-width: 500px; }
            code {
              background: #1f2937;
              padding: 0.5rem 1rem;
              border-radius: 0.25rem;
              display: inline-block;
              margin-top: 0.5rem;
              color: #60a5fa;
            }
          </style>
        </head>
        <body>
          <h1>⚠️ Connection Error</h1>
          <p>Could not connect to the web development server.</p>
          <p>Make sure the web server is running:</p>
          <code>npm run dev:web</code>
          <p style="margin-top: 2rem; font-size: 0.875rem; color: #6b7280;">
            Tried ports 3000-3010. Check the terminal for the actual port.
          </p>
        </body>
        </html>
      `;
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
    } else {
      const devUrl = `http://localhost:${detectedPort}`;
      console.log(`[Electron] Loading from dev server: ${devUrl}`);
      
      mainWindow.loadURL(devUrl).catch((error) => {
        console.error("[Electron] Failed to load dev URL:", error);
      });
    }

    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from static export in extraResources
    const prodPath = path.join(process.resourcesPath, "web", "out", "index.html");
    console.log(`[Electron] Loading from production path: ${prodPath}`);
    mainWindow.loadFile(prodPath).catch((error) => {
      console.error("[Electron] Failed to load production file:", error);
    });
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    console.log("[Electron] Window ready to show");
    mainWindow?.show();
  });

  // Handle page load errors
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron] Page load failed: ${errorCode} - ${errorDescription} (${validatedURL})`);
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in default browser
    if (url.startsWith("http://") || url.startsWith("https://")) {
      require("electron").shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
}

// Create window when Electron is ready
app.whenReady().then(async () => {
  console.log("[Electron] App ready, creating window...");
  
  // Clear service worker cache to prevent storage errors
  if (isDev) {
    try {
      const ses = session.defaultSession;
      // Clear all storage that might cause issues
      await ses.clearStorageData({
        storages: [
          "serviceworkers",
          "cachestorage",
          "filesystem",
          "indexdb",
          "localstorage",
          "shadercache",
          "websql",
        ],
      });
      console.log("[Electron] Cleared storage cache");
    } catch (error) {
      console.warn("[Electron] Failed to clear storage cache:", error);
    }
  }
  
  // Set up service worker blocking before creating window
  if (isDev) {
    try {
      session.defaultSession.webRequest.onBeforeRequest(
        {
          urls: ["http://localhost:*/*"],
        },
        (details, callback) => {
          // Block service worker registration
          if (
            details.url.includes("/sw.js") ||
            details.url.includes("service-worker") ||
            details.url.includes("workbox")
          ) {
            console.log(`[Electron] Blocked service worker: ${details.url}`);
            callback({ cancel: true });
          } else {
            callback({});
          }
        }
      );
      console.log("[Electron] Service worker blocking enabled");
    } catch (error) {
      console.warn("[Electron] Failed to set up service worker blocking:", error);
    }
  }
  
  await createWindow();

  // On macOS, re-create window when dock icon is clicked
  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
}).catch((error) => {
  console.error("[Electron] Failed to initialize app:", error);
});

// Quit when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (_, contents) => {
  contents.on("will-navigate", (event, url) => {
    try {
      // Only allow navigation within the app
      if (isDev) {
        // In dev mode, allow any localhost port (3000-3010)
        try {
          const urlObj = new URL(url);
          if (urlObj.hostname !== "localhost" && urlObj.hostname !== "127.0.0.1") {
            event.preventDefault();
          }
        } catch {
          // Invalid URL, prevent navigation
          event.preventDefault();
        }
      } else {
        // In production, only allow file:// protocol
        if (!url.startsWith("file://")) {
          event.preventDefault();
        }
      }
    } catch (error) {
      console.error("[Electron] Error in navigation handler:", error);
      event.preventDefault();
    }
  });
});

// Handle uncaught exceptions to prevent crashes
process.on("uncaughtException", (error) => {
  console.error("[Electron] Uncaught Exception:", error);
  // Don't exit, just log the error
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("[Electron] Unhandled Rejection at:", promise, "reason:", reason);
});

