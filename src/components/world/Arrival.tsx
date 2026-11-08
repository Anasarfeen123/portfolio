"use client";

import Link from "next/link";
import { Compass, MoveRight, ShieldCheck } from "lucide-react";
import { useCanRenderWebGL } from "@/hooks/useCanRenderWebGL";

export function Arrival() {
  const canRender = useCanRenderWebGL();
  const recommendation = canRender === false ? "Classic Portfolio recommended for this device" : canRender === null ? "Checking your device…" : "Interactive shores available";

  return (
    <main className="arrival">
      <div className="arrival-sun" aria-hidden="true" />
      <div className="arrival-mountain arrival-mountain-far" aria-hidden="true" />
      <div className="arrival-mountain arrival-mountain-near" aria-hidden="true" />
      <div className="arrival-water" aria-hidden="true" />
      <div className="arrival-grain" aria-hidden="true" />
      <nav className="arrival-nav" aria-label="Portfolio choices"><span>ANAS ARFEEN</span><Link href="/projects">Projects</Link><Link href="/blog">Writing</Link></nav>
      <section className="arrival-copy">
        <p className="arrival-eyebrow"><Compass size={15} /> THE SHORES ARE OPEN</p>
        <h1>ANAS<br />ARFEEN</h1>
        <p className="arrival-tagline">An explorer, builder &amp; engineer.</p>
        <p className="arrival-description">A small playable shoreline, built around the things I make. Walk the paths, find the workshop, and take the long way in.</p>
        <div className="arrival-actions">
          <Link href="/explore" className="arrival-explore">Explore the world <MoveRight size={18} /></Link>
          <Link href="/classic" className="arrival-classic">Classic Portfolio</Link>
        </div>
        <p className="arrival-recommendation"><ShieldCheck size={14} /> {recommendation}</p>
      </section>
      <p className="arrival-note">Phase 1 · Shores prototype · Desktop controls recommended</p>
    </main>
  );
}
