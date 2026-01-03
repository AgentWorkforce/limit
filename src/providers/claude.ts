import {
  getClaudeCredentials,
  refreshClaudeToken,
  saveClaudeCredentials,
  type ClaudeCredentials,
} from "../utils/keychain";
import { timeUntil } from "../utils/time";
import type { ProviderStatus } from "./types";

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

interface ClaudeUsageResponse {
  five_hour: { utilization: number; resets_at: string | null } | null;
  seven_day: { utilization: number; resets_at: string | null } | null;
  seven_day_opus: { utilization: number; resets_at: string | null } | null;
}

async function tryRefreshCredentials(
  credentials: ClaudeCredentials
): Promise<ClaudeCredentials | null> {
  const refreshed = await refreshClaudeToken(credentials.refreshToken);
  if (refreshed) {
    await saveClaudeCredentials(refreshed);
  }
  return refreshed;
}

async function fetchUsageWithCredentials(
  credentials: ClaudeCredentials
): Promise<Response> {
  return fetch("https://api.anthropic.com/api/oauth/usage", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "monitor/1.0.0",
      Authorization: `Bearer ${credentials.accessToken}`,
      "anthropic-beta": "oauth-2025-04-20",
    },
  });
}

export async function fetchClaudeUsage(): Promise<ProviderStatus> {
  let credentials = await getClaudeCredentials();

  if (!credentials) {
    return {
      provider: "claude",
      status: "unavailable",
      metrics: [],
      message: "Not logged in. Run 'claude' to authenticate.",
    };
  }

  const tokenExpiresSoon = credentials.expiresAt < Date.now() + TOKEN_REFRESH_BUFFER_MS;
  if (tokenExpiresSoon) {
    const refreshed = await tryRefreshCredentials(credentials);
    if (refreshed) {
      credentials = refreshed;
    }
  }

  try {
    let response = await fetchUsageWithCredentials(credentials);

    if (response.status === 401) {
      const refreshed = await tryRefreshCredentials(credentials);
      if (refreshed) {
        credentials = refreshed;
        response = await fetchUsageWithCredentials(credentials);
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        return {
          provider: "claude",
          status: "error",
          metrics: [],
          error: "Token expired. Run 'claude' to re-authenticate.",
        };
      }
      return {
        provider: "claude",
        status: "error",
        metrics: [],
        error: `API error: ${response.status}`,
      };
    }

    const data: ClaudeUsageResponse = await response.json();
    const metrics = [];

    if (data.five_hour) {
      metrics.push({
        name: "5-Hour",
        percentage: data.five_hour.utilization,
        resetsAt: data.five_hour.resets_at,
        resetsIn: timeUntil(data.five_hour.resets_at),
        periodSeconds: 5 * 3600,
      });
    }

    if (data.seven_day) {
      metrics.push({
        name: "Weekly",
        percentage: data.seven_day.utilization,
        resetsAt: data.seven_day.resets_at,
        resetsIn: timeUntil(data.seven_day.resets_at),
        periodSeconds: 7 * 24 * 3600,
      });
    }

    if (data.seven_day_opus && data.seven_day_opus.utilization > 0) {
      metrics.push({
        name: "Opus",
        percentage: data.seven_day_opus.utilization,
        resetsAt: data.seven_day_opus.resets_at,
        resetsIn: timeUntil(data.seven_day_opus.resets_at),
        periodSeconds: 7 * 24 * 3600,
      });
    }

    const maxUsage = Math.max(...metrics.map((m) => m.percentage), 0);
    const status = maxUsage >= 80 ? "warning" : "ok";

    return {
      provider: "claude",
      status,
      plan: credentials.subscriptionType || "Pro",
      metrics,
    };
  } catch (err) {
    return {
      provider: "claude",
      status: "error",
      metrics: [],
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
