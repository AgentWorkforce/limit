#!/usr/bin/env bun
/** @jsxImportSource @opentui/react */

import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "../src/App";

const command = process.argv[2];

if (command === "usage") {
  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
  });

  const root = createRoot(renderer);
  
  const cleanup = () => {
    root.unmount();
    renderer.destroy();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  
  root.render(<App onExit={cleanup} />);
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
