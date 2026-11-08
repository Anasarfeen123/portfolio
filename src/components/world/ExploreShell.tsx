"use client";

import Link from "next/link";
import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useCanRenderWebGL } from "@/hooks/useCanRenderWebGL";
import { ShoresWorld } from "@/components/world/ShoresWorld";

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
  const retry = () => setKey((value) => value + 1);
  if (supported === false) return <WorldFallback onRetry={retry} />;
  return <WorldErrorBoundary key={key} onRetry={retry}><ShoresWorld /></WorldErrorBoundary>;
}
