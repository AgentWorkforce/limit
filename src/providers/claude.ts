import { getClaudeCredentials } from "../utils/keychain";
import { timeUntil } from "../utils/time";
import type { ProviderStatus } from "./types";

interface ClaudeUsageResponse {
  five_hour: { utilization: number; resets_at: string | null } | null;
  seven_day: { utilization: number; resets_at: string | null } | null;
  seven_day_opus: { utilization: number; resets_at: string | null } | null;
}

export async function fetchClaudeUsage(): Promise<ProviderStatus> {
  const credentials = await getClaudeCredentials();

  if (!credentials) {
    return {
      provider: "claude",
      status: "unavailable",
      metrics: [],
      message: "Not logged in. Run 'claude' to authenticate.",
    };
  }

  try {
    const response = await fetch("https://api.anthropic.com/api/oauth/usage", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "monitor/1.0.0",
        Authorization: `Bearer ${credentials.accessToken}`,
        "anthropic-beta": "oauth-2025-04-20",
      },
    });

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
