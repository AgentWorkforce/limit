export * from "./types";
export { fetchClaudeUsage } from "./claude";
export { fetchCodexUsage } from "./codex";
export { fetchGeminiUsage } from "./gemini";

import { fetchClaudeUsage } from "./claude";
import { fetchCodexUsage } from "./codex";
import { fetchGeminiUsage } from "./gemini";
import type { ProviderStatus } from "./types";

export async function fetchAllProviders(): Promise<ProviderStatus[]> {
  const [claude, codex, gemini] = await Promise.all([
    fetchClaudeUsage(),
    fetchCodexUsage(),
    fetchGeminiUsage(),
  ]);

  return [claude, codex, gemini];
}
