export * from "./types";
export { fetchClaudeUsage } from "./claude";
export { fetchCodexUsage } from "./codex";

import { fetchClaudeUsage } from "./claude";
import { fetchCodexUsage } from "./codex";
import type { ProviderStatus } from "./types";

export async function fetchAllProviders(): Promise<ProviderStatus[]> {
  const [claude, codex] = await Promise.all([
    fetchClaudeUsage(),
    fetchCodexUsage(),
  ]);

  return [claude, codex];
}
