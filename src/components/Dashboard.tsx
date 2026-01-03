import React from "react";
import type { ProviderStatus } from "../providers/types";
import { ProviderCard } from "./ProviderCard";

interface DashboardProps {
  providers: ProviderStatus[];
}

export function Dashboard({ providers }: DashboardProps) {
  return (
    <box
      style={{
        flexGrow: 1,
        flexDirection: "row",
        gap: 1,
        padding: 1,
      }}
    >
      {providers.map((provider) => (
        <ProviderCard key={provider.provider} data={provider} />
      ))}
    </box>
  );
}
