#!/usr/bin/env node

import { execFileSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const bunPath = join(__dirname, "..", "node_modules", ".bin", "bun");
const cliPath = join(__dirname, "cli.tsx");

if (!existsSync(bunPath)) {
  console.error("Error: bun not found at", bunPath);
  console.error("Try running: npm install");
  process.exit(1);
}

try {
  execFileSync(bunPath, [cliPath, ...process.argv.slice(2)], {
    stdio: "inherit",
    env: { ...process.env, FORCE_COLOR: "1" },
  });
} catch (err) {
  process.exit(err.status ?? 1);
}
