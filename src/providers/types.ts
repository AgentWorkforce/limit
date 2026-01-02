export type ProviderName = "claude" | "codex";

export type ProviderStatusType = "ok" | "warning" | "error" | "unavailable" | "loading" | "limited";

export interface UsageMetric {
  name: string;
  percentage: number;
  resetsAt: string | null;
  resetsIn: string;
  periodSeconds?: number; // Total window duration for trajectory calculation
}

export interface ProviderStatus {
  provider: ProviderName;
  status: ProviderStatusType;
  plan?: string;
  metrics: UsageMetric[];
  message?: string;
  error?: string;
}

export interface ProviderFetcher {
  fetch(): Promise<ProviderStatus>;
}
