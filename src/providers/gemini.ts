import { getGeminiSettings } from "../utils/keychain";
import type { ProviderStatus, UsageMetric } from "./types";

interface GeminiLimits {
  requestsPerDay: number;
  requestsPerMinute: number;
  plan: string;
}

function getLimitsForAuthType(authType?: string): GeminiLimits {
  switch (authType) {
    case "google":
      return { requestsPerDay: 1000, requestsPerMinute: 60, plan: "Google (Free)" };
    case "api_key":
      return { requestsPerDay: 250, requestsPerMinute: 10, plan: "API Key (Free)" };
    case "vertex":
      return { requestsPerDay: -1, requestsPerMinute: -1, plan: "Vertex AI" };
    default:
      return { requestsPerDay: 1000, requestsPerMinute: 60, plan: "Unknown" };
  }
}

export async function fetchGeminiUsage(): Promise<ProviderStatus> {
  const settings = await getGeminiSettings();

  if (!settings) {
    return {
      provider: "gemini",
      status: "unavailable",
      metrics: [],
      message: "Not configured. Run 'gemini' to set up.",
    };
  }

  const limits = getLimitsForAuthType(settings.authType);
  const metrics: UsageMetric[] = [];

  if (limits.requestsPerDay > 0) {
    metrics.push({
      name: "Daily Limit",
      percentage: -1,
      resetsAt: null,
      resetsIn: `${limits.requestsPerDay} req/day`,
    });
  }

  if (limits.requestsPerMinute > 0) {
    metrics.push({
      name: "Per-Minute",
      percentage: -1,
      resetsAt: null,
      resetsIn: `${limits.requestsPerMinute} req/min`,
    });
  }

  return {
    provider: "gemini",
    status: "limited",
    plan: limits.plan,
    metrics,
    message: "Live usage not available. Run /stats in Gemini CLI.",
  };
}
