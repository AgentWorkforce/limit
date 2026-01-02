import { $ } from "bun";

export async function getKeychainCredentials(service: string): Promise<string | null> {
  try {
    const result = await $`security find-generic-password -s ${service} -w`
      .quiet()
      .text();
    return result.trim();
  } catch {
    return null;
  }
}

export interface ClaudeCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: string[];
  subscriptionType: string;
}

export async function getClaudeCredentials(): Promise<ClaudeCredentials | null> {
  try {
    const raw = await getKeychainCredentials("Claude Code-credentials");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed.claudeAiOauth || null;
  } catch {
    return null;
  }
}

export interface CodexCredentials {
  accessToken: string;
  accountId: string;
  planType?: string;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], "base64").toString("utf-8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function getCodexCredentials(): Promise<CodexCredentials | null> {
  try {
    const homedir = process.env.HOME || "~";
    const file = Bun.file(`${homedir}/.codex/auth.json`);
    
    if (!(await file.exists())) {
      return null;
    }

    const content = await file.json();
    const tokens = content.tokens;
    
    if (!tokens?.access_token || !tokens?.account_id) {
      return null;
    }

    let planType: string | undefined;
    const payload = decodeJwtPayload(tokens.access_token);
    if (payload) {
      const auth = payload["https://api.openai.com/auth"] as Record<string, unknown> | undefined;
      if (auth?.chatgpt_plan_type) {
        planType = String(auth.chatgpt_plan_type);
      }
    }

    return {
      accessToken: tokens.access_token,
      accountId: tokens.account_id,
      planType,
    };
  } catch {
    return null;
  }
}

export interface GeminiSettings {
  authType?: "google" | "api_key" | "vertex";
  apiKey?: string;
  project?: string;
}

export async function getGeminiSettings(): Promise<GeminiSettings | null> {
  try {
    const homedir = process.env.HOME || "~";
    const file = Bun.file(`${homedir}/.gemini/settings.json`);
    
    if (!(await file.exists())) {
      return null;
    }

    const content = await file.json();
    return content;
  } catch {
    return null;
  }
}
