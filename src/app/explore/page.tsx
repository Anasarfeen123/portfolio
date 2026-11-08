import type { Metadata } from "next";
import { ExploreShell } from "@/components/world/ExploreShell";

export const metadata: Metadata = {
  title: "Explore | Anas Arfeen",
  description: "Explore a small playable shore from Anas Arfeen's portfolio world.",
  robots: { index: true, follow: true },
};

export default function ExplorePage() {
  return <ExploreShell />;
}
