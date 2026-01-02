import type { ProviderStatus } from "../providers/types";
import { PROVIDER_COLORS, getStatusColor } from "../utils/colors";
import { ProgressBar } from "./ProgressBar";

interface ProviderCardProps {
  data: ProviderStatus;
}

function getProviderDisplayName(provider: string): string {
  switch (provider) {
    case "claude": return "CLAUDE CODE";
    case "codex": return "CODEX";
    case "gemini": return "GEMINI CLI";
    default: return provider.toUpperCase();
  }
}

export function ProviderCard({ data }: ProviderCardProps) {
  const providerColor = PROVIDER_COLORS[data.provider] || "#9ca3af";
  const statusColor = getStatusColor(data.status);

  return (
    <box
      style={{
        flexGrow: 1,
        flexBasis: 0,
        minWidth: 20,
        border: true,
        borderStyle: "single",
        borderColor: "#0f3460",
        padding: 1,
        flexDirection: "column",
        gap: 1,
      }}
    >
      <box style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <text fg={providerColor}>
          <strong>{getProviderDisplayName(data.provider)}</strong>
        </text>
        {data.plan && <text fg="#6b7280">{data.plan}</text>}
      </box>

      {data.status === "unavailable" || data.status === "error" ? (
        <box style={{ flexDirection: "column", gap: 1, marginTop: 1 }}>
          {data.error && <text fg="#ef4444">{data.error}</text>}
          {data.message && <text fg="#6b7280">{data.message}</text>}
        </box>
      ) : data.status === "limited" ? (
        <box style={{ flexDirection: "column", gap: 1, marginTop: 1 }}>
          {data.metrics.map((metric, i) => (
            <box key={i} style={{ flexDirection: "column" }}>
              <text fg="#9ca3af">{metric.name}</text>
              <text fg="#e5e5e5">{metric.resetsIn}</text>
            </box>
          ))}
          {data.message && (
            <text fg="#6b7280" style={{ marginTop: 1 }}>
              {data.message}
            </text>
          )}
        </box>
      ) : (
        <box style={{ flexDirection: "column", gap: 1, marginTop: 1 }}>
          {data.metrics.map((metric, i) => (
            <box key={i} style={{ flexDirection: "column" }}>
              <text fg="#9ca3af">{metric.name}</text>
              <box style={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
                <ProgressBar 
                  percentage={metric.percentage} 
                  width={12} 
                  periodSeconds={metric.periodSeconds}
                  resetsAt={metric.resetsAt}
                />
              </box>
              <text fg="#6b7280">Resets: {metric.resetsIn}</text>
            </box>
          ))}
        </box>
      )}
    </box>
  );
}
