#!/usr/bin/env bun

import React from "react";
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "../src/App";

const command = process.argv[2];

if (command === "usage") {
  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
  });

  const root = createRoot(renderer);
  
  const cleanup = async () => {
    root.unmount();
    await renderer.destroy();
    process.stdout.write("\x1b[?25h"); // Ensure cursor is visible
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  
  root.render(<App onExit={cleanup} />);
} else if (command === "version" || command === "--version" || command === "-v") {
  const pkg = await import("../package.json");
  console.log(pkg.version);
} else if (command === "update") {
  const pkg = await import("../package.json");
  const currentVersion = pkg.version;
  
  console.log(`Current version: ${currentVersion}`);
  console.log("Checking for updates...");
  
  try {
    const response = await fetch("https://registry.npmjs.org/agent-limit/latest");
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    const data = await response.json() as { version: string };
    const latestVersion = data.version;
    
    if (latestVersion === currentVersion) {
      console.log(`✓ You're on the latest version (${currentVersion})`);
    } else {
      console.log(`New version available: ${latestVersion}`);
      console.log("\nUpdating...");
      
      const proc = Bun.spawn(["npm", "install", "-g", "agent-limit@latest"], {
        stdout: "inherit",
        stderr: "inherit",
      });
      
      const exitCode = await proc.exited;
      
      if (exitCode === 0) {
        console.log(`\n✓ Updated to ${latestVersion}`);
      } else {
        console.error("\n✗ Update failed. Try running manually:");
        console.error("  npm install -g agent-limit@latest");
        process.exit(1);
      }
    }
  } catch (error) {
    console.error("Failed to check for updates:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
} else if (command === "help" || command === "--help" || command === "-h" || !command) {
  console.log(`
agent-limit

Monitor AI agent CLI usage limits in real-time.

Install:
  npm install -g agent-limit

Quick Start:
  agent-limit usage

CLI:
  agent-limit usage    Show usage dashboard
  agent-limit update   Update to latest version
  agent-limit version  Show version
  agent-limit help     Show this help message

Dashboard Controls:
  q    Quit
  r    Refresh
`);
} else {
  console.error(`Unknown command: ${command}`);
  console.error(`Run 'agent-limit help' for usage.`);
  process.exit(1);
}
