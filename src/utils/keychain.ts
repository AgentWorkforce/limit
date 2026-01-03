import { $ } from "bun";

const CLAUDE_CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
const CLAUDE_TOKEN_ENDPOINT = "https://console.anthropic.com/v1/oauth/token";
const KEYCHAIN_SERVICE = "Claude Code-credentials";

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

async function setKeychainCredentials(service: string, data: string): Promise<boolean> {
  try {
    await $`security delete-generic-password -s ${service}`.quiet().nothrow();
    await $`security add-generic-password -s ${service} -w ${data}`.quiet();
    return true;
  } catch {
    return false;
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
    const raw = await getKeychainCredentials(KEYCHAIN_SERVICE);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed.claudeAiOauth || null;
  } catch {
    return null;
  }
}

interface TokenRefreshResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export async function refreshClaudeToken(
  refreshToken: string
): Promise<ClaudeCredentials | null> {
  try {
    const response = await fetch(CLAUDE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLAUDE_CLIENT_ID,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data: TokenRefreshResponse = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      scopes: data.scope.split(" "),
      subscriptionType: "Pro",
    };
  } catch {
    return null;
  }
}

export async function saveClaudeCredentials(
  credentials: ClaudeCredentials
): Promise<boolean> {
  try {
    const raw = await getKeychainCredentials(KEYCHAIN_SERVICE);
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    parsed.claudeAiOauth = credentials;

    return await setKeychainCredentials(KEYCHAIN_SERVICE, JSON.stringify(parsed));
  } catch {
    return false;
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
