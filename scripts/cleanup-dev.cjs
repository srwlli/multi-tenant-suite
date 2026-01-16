#!/usr/bin/env node
/**
 * Cleanup script for development
 * Removes Next.js lock files and optionally kills Node processes
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const lockPaths = [
  path.join(__dirname, "..", "apps", "web", ".next", "dev", "lock"),
  path.join(__dirname, "..", "apps", "web", ".next", "lock"),
];

console.log("🧹 Cleaning up development files...\n");

// Remove lock files
let removedCount = 0;
for (const lockPath of lockPaths) {
  try {
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
      console.log(`✓ Removed: ${path.relative(process.cwd(), lockPath)}`);
      removedCount++;
    }
  } catch (error) {
    console.error(`✗ Failed to remove ${lockPath}:`, error.message);
  }
}

if (removedCount === 0) {
  console.log("✓ No lock files found");
}

// Optionally kill Node processes on port 3000-3010
const killPorts = process.argv.includes("--kill-ports");
if (killPorts) {
  console.log("\n🔍 Checking for processes on ports 3000-3010...");
  
  try {
    // On Windows, use netstat to find processes
    const isWindows = process.platform === "win32";
    
    if (isWindows) {
      // Find processes using ports 3000-3010
      for (let port = 3000; port <= 3010; port++) {
        try {
          const result = execSync(
            `netstat -ano | findstr :${port}`,
            { encoding: "utf-8", stdio: "pipe" }
          );
          
          if (result.trim()) {
            const lines = result.trim().split("\n");
            const pids = new Set();
            
            for (const line of lines) {
              const match = line.match(/\s+(\d+)\s*$/);
              if (match) {
                pids.add(match[1]);
              }
            }
            
            for (const pid of pids) {
              try {
                console.log(`  Killing process ${pid} on port ${port}...`);
                execSync(`taskkill /F /PID ${pid}`, { stdio: "pipe" });
                console.log(`  ✓ Killed process ${pid}`);
              } catch (error) {
                // Process might already be dead
                if (!error.message.includes("not found")) {
                  console.log(`  ⚠ Could not kill process ${pid}: ${error.message}`);
                }
              }
            }
          }
        } catch (error) {
          // Port not in use, continue
        }
      }
    } else {
      // Unix/Linux/Mac
      for (let port = 3000; port <= 3010; port++) {
        try {
          const result = execSync(
            `lsof -ti:${port}`,
            { encoding: "utf-8", stdio: "pipe" }
          );
          
          const pids = result.trim().split("\n").filter(Boolean);
          for (const pid of pids) {
            try {
              console.log(`  Killing process ${pid} on port ${port}...`);
              execSync(`kill -9 ${pid}`, { stdio: "pipe" });
              console.log(`  ✓ Killed process ${pid}`);
            } catch (error) {
              console.log(`  ⚠ Could not kill process ${pid}: ${error.message}`);
            }
          }
        } catch (error) {
          // Port not in use, continue
        }
      }
    }
    
    console.log("\n✓ Port cleanup complete");
  } catch (error) {
    console.error("✗ Error during port cleanup:", error.message);
  }
}

console.log("\n✅ Cleanup complete!");
console.log("\nYou can now run: npm run dev:all");
