import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./App";

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

async function main() {
  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
  });

  const root = createRoot(renderer);
  
  const cleanup = () => {
    root.unmount();
    renderer.stop();
    resetTerminal();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("exit", resetTerminal);

  root.render(<App onExit={cleanup} />);
  renderer.start();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
