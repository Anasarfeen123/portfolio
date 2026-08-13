import type { Metadata } from "next";
import { Suspense } from "react";
import { buildInfo } from "@/data/build-info";
import { ProjectsView } from "@/components/ProjectsView";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Every real, curated project — reinforcement-learning robotics, LLM agents, full-stack platforms with real users, computer vision, and systems tooling.",
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsView buildInfo={buildInfo} />
    </Suspense>
  );
}
