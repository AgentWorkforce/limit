import { getCodexCredentials } from "../utils/keychain";
import { formatDuration } from "../utils/time";
import type { ProviderStatus } from "./types";

interface RateLimitWindow {
  used_percent: number;
  limit_window_seconds: number;
  reset_after_seconds: number;
  reset_at: number;
}

interface CodexUsageResponse {
  plan_type: string;
  rate_limit?: {
    allowed: boolean;
    limit_reached: boolean;
    primary_window?: RateLimitWindow;
    secondary_window?: RateLimitWindow;
  };
}

export async function fetchCodexUsage(): Promise<ProviderStatus> {
  const credentials = await getCodexCredentials();

  if (!credentials) {
    return {
      provider: "codex",
      status: "unavailable",
      metrics: [],
      message: "Not logged in. Run 'codex' to authenticate.",
    };
  }

  try {
    const response = await fetch(
      "https://chatgpt.com/backend-api/wham/usage",
      {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "ChatGPT-Account-Id": credentials.accountId,
          "originator": "codex_cli_rs",
          "User-Agent": "codex_cli_rs/0.77.0",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return {
          provider: "codex",
          status: "error",
          metrics: [],
          message: "Token expired. Run 'codex' to re-authenticate.",
        };
      }
      return {
        provider: "codex",
        status: "error",
        metrics: [],
        message: `API error: ${response.status}`,
      };
    }

    const data: CodexUsageResponse = await response.json();
    const metrics = [];

    if (data.rate_limit?.primary_window) {
      const primary = data.rate_limit.primary_window;
      const windowHours = Math.round(primary.limit_window_seconds / 3600);
      const resetMs = primary.reset_after_seconds * 1000;
      metrics.push({
        name: `${windowHours}h Usage`,
        percentage: primary.used_percent,
        resetsAt: new Date(primary.reset_at * 1000).toISOString(),
        resetsIn: formatDuration(resetMs),
        periodSeconds: primary.limit_window_seconds,
      });
    }

    if (data.rate_limit?.secondary_window) {
      const secondary = data.rate_limit.secondary_window;
      const windowDays = Math.round(secondary.limit_window_seconds / 86400);
      const resetMs = secondary.reset_after_seconds * 1000;
      metrics.push({
        name: windowDays >= 7 ? "Weekly" : `${windowDays}d Usage`,
        percentage: secondary.used_percent,
        resetsAt: new Date(secondary.reset_at * 1000).toISOString(),
        resetsIn: formatDuration(resetMs),
        periodSeconds: secondary.limit_window_seconds,
      });
    }

    const planLabel = data.plan_type
      ? data.plan_type.charAt(0).toUpperCase() + data.plan_type.slice(1)
      : "Unknown";

    const maxUsage = Math.max(...metrics.map((m) => m.percentage), 0);

    return {
      provider: "codex",
      status: data.rate_limit?.limit_reached || maxUsage >= 80 ? "warning" : "ok",
      metrics,
      plan: planLabel,
    };
  } catch (error) {
    return {
      provider: "codex",
      status: "error",
      metrics: [],
      message: error instanceof Error ? error.message : "Failed to fetch usage",
    };
  }
}
