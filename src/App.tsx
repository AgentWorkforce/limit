import { useEffect, useState, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import { Header, Footer, Dashboard } from "./components";
import { fetchAllProviders, type ProviderStatus } from "./providers";

const REFRESH_INTERVAL = 60000;

interface AppProps {
  onExit?: () => void;
}

export function App({ onExit }: AppProps) {
  const [providers, setProviders] = useState<ProviderStatus[]>([
    { provider: "claude", status: "loading", metrics: [] },
    { provider: "codex", status: "loading", metrics: [] },
    { provider: "gemini", status: "loading", metrics: [] },
  ]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await fetchAllProviders();
      setProviders(results);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch providers:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  useKeyboard((key) => {
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      onExit?.();
    }

    if (key.name === "r") {
      refresh();
    }
  });

  return (
    <box
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        backgroundColor: "#0a0a0f",
      }}
    >
      <Header lastRefresh={lastRefresh} isLoading={isLoading} />
      <Dashboard providers={providers} />
      <Footer />
    </box>
  );
}
