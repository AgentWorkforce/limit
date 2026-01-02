#!/usr/bin/env bun
/** @jsxImportSource @opentui/react */

import { createRoot } from "@opentui/react";
import { App } from "../src/App";

function resetTerminal() {
  process.stdout.write("\x1b[?1049l");
  process.stdout.write("\x1b[?25h");
  process.stdout.write("\x1b[0m");
  process.stdout.write("\x1b[?1000l");
  process.stdout.write("\x1b[?1002l");
  process.stdout.write("\x1b[?1003l");
  process.stdout.write("\x1b[?1006l");
  process.stdout.write("\x1b[?2004l");
}

const command = process.argv[2];

if (command === "usage") {
  let root: ReturnType<typeof createRoot> | null = null;
  
  const cleanup = () => {
    if (root) {
      root.unmount();
    }
    resetTerminal();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("exit", resetTerminal);
  
  root = createRoot(process.stdout, { hideCursor: true });
  root.render(<App onExit={cleanup} />);
} else if (command === "help" || command === "--help" || command === "-h" || !command) {
  console.log(`
agent-monitor

Monitor AI agent CLI usage limits in real-time.

Install:
  npm install -g agent-monitor

Quick Start:
  agent-monitor usage

CLI:
  agent-monitor usage    Show usage dashboard
  agent-monitor help     Show this help message

Dashboard Controls:
  q    Quit
  r    Refresh
`);
} else {
  console.error(`Unknown command: ${command}`);
  console.error(`Run 'agent-monitor help' for usage.`);
  process.exit(1);
}
