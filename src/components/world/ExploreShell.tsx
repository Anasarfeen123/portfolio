"use client";

import Link from "next/link";
import { Component, type ComponentType, type ErrorInfo, type ReactNode, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useCanRenderWebGL } from "@/hooks/useCanRenderWebGL";

class WorldErrorBoundary extends Component<{ children: ReactNode; onRetry: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("World renderer failed", error, info); }
  render() {
    if (this.state.failed) return <WorldFallback onRetry={() => { this.setState({ failed: false }); this.props.onRetry(); }} />;
    return this.props.children;
  }
}

function WorldFallback({ onRetry }: { onRetry: () => void }) {
  return <main className="world-fallback"><p>THE SHORES</p><h1>The world could not start here.</h1><p>Your classic portfolio is ready without WebGL.</p><div><button onClick={onRetry}><RefreshCw size={16} /> Retry</button><Link href="/classic">Open Classic Portfolio</Link></div></main>;
}

export function ExploreShell() {
  const supported = useCanRenderWebGL();
  const [key, setKey] = useState(0);
  const [World, setWorld] = useState<ComponentType | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => !cancelled && setLoadFailed(true), 8000);
    import("@/components/world/ShoresWorld")
      .then((module) => { if (!cancelled) setWorld(() => module.ShoresWorld); })
      .catch((error) => { console.error("World module failed to load", error); if (!cancelled) setLoadFailed(true); })
      .finally(() => window.clearTimeout(timeout));
    return () => { cancelled = true; window.clearTimeout(timeout); };
  }, [key]);

  const retry = () => { setWorld(null); setLoadFailed(false); setKey((value) => value + 1); };
  if (supported === false) return <WorldFallback onRetry={retry} />;
  if (loadFailed) return <WorldFallback onRetry={retry} />;
  if (!World) return <div className="world-loading"><span>Loading the shores</span><i /></div>;
  return <WorldErrorBoundary key={key} onRetry={retry}><World /></WorldErrorBoundary>;
}
