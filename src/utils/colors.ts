export function getUsageColor(percentage: number): string {
  if (percentage < 50) return "#22c55e";
  if (percentage < 80) return "#eab308";
  return "#ef4444";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "ok": return "#22c55e";
    case "warning": return "#eab308";
    case "error": return "#ef4444";
    case "unavailable": return "#6b7280";
    case "limited": return "#3b82f6";
    default: return "#9ca3af";
  }
}

export const PROVIDER_COLORS = {
  claude: "#d97706",
  codex: "#10b981",
} as const;

export const UI_COLORS = {
  background: "#1a1a2e",
  surface: "#16213e",
  border: "#0f3460",
  text: "#e5e5e5",
  textMuted: "#9ca3af",
  textDim: "#6b7280",
} as const;
