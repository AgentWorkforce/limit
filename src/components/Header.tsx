import React from "react";

interface HeaderProps {
  lastRefresh: Date | null;
  isLoading: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function Header({ lastRefresh, isLoading }: HeaderProps) {
  const refreshText = isLoading
    ? "Refreshing..."
    : lastRefresh
      ? `Last refresh: ${formatTime(lastRefresh)}`
      : "Loading...";

  return (
    <box
      style={{
        width: "100%",
        height: 3,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingLeft: 2,
        paddingRight: 2,
        borderStyle: "single",
        borderColor: "#0f3460",
      }}
    >
      <text fg="#e5e5e5">
        <span fg="#3b82f6">AI Limits Monitor</span>
      </text>
      <text fg="#6b7280">{refreshText}</text>
    </box>
  );
}
