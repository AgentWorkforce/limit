import { getUsageColor } from "../utils/colors";

interface ProgressBarProps {
  percentage: number;
  width?: number;
  showLabel?: boolean;
  periodSeconds?: number;
  resetsAt?: string | null;
}

function calculateTrajectory(periodSeconds: number, resetsAt: string): number {
  const resetTime = new Date(resetsAt).getTime();
  const now = Date.now();
  const secondsRemaining = Math.max(0, (resetTime - now) / 1000);
  const elapsedSeconds = periodSeconds - secondsRemaining;
  return Math.min(100, Math.max(0, (elapsedSeconds / periodSeconds) * 100));
}

export function ProgressBar({ 
  percentage, 
  width = 10, 
  showLabel = true,
  periodSeconds,
  resetsAt,
}: ProgressBarProps) {
  if (percentage < 0) {
    return <text fg="#6b7280">N/A</text>;
  }

  const color = getUsageColor(percentage);
  const filledCount = Math.round((percentage / 100) * width);
  
  const canShowTrajectory = periodSeconds && resetsAt;
  const trajectoryPercent = canShowTrajectory 
    ? calculateTrajectory(periodSeconds, resetsAt) 
    : null;
  const trajectoryPos = trajectoryPercent !== null 
    ? Math.round((trajectoryPercent / 100) * width) 
    : null;

  const delta = trajectoryPercent !== null ? percentage - trajectoryPercent : null;
  
  let deltaText = "";
  let deltaColor = "#6b7280";
  if (delta !== null) {
    const absDelta = Math.abs(Math.round(delta));
    if (delta < -1) {
      deltaText = ` ↓${absDelta}%`;
      deltaColor = "#22c55e";
    } else if (delta > 1) {
      deltaText = ` ↑${absDelta}%`;
      deltaColor = "#ef4444";
    } else {
      deltaText = ` ±0%`;
      deltaColor = "#6b7280";
    }
  }

  const barChars: Array<{ char: string; color: string }> = [];
  for (let i = 0; i < width; i++) {
    if (trajectoryPos !== null && i === trajectoryPos) {
      barChars.push({ char: "|", color: "#6b7280" });
    } else if (i < filledCount) {
      barChars.push({ char: "█", color });
    } else {
      barChars.push({ char: "░", color: "#4b5563" });
    }
  }

  const label = showLabel ? ` ${Math.round(percentage)}%` : "";

  return (
    <text>
      {barChars.map((c, i) => (
        <span key={i} fg={c.color}>{c.char}</span>
      ))}
      <span fg={color}>{label}</span>
      <span fg={deltaColor}>{deltaText}</span>
    </text>
  );
}
