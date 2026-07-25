'use me';
'use client';

import React, { useState } from 'react';
import { BackgroundCanvas } from '@/components/BackgroundCanvas';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { AboutSection } from '@/components/AboutSection';
import { SkillsSection } from '@/components/SkillsSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { ExperienceSection } from '@/components/ExperienceSection';
import { AchievementsSection } from '@/components/AchievementsSection';
import { TechNotebook } from '@/components/TechNotebook';
import { ContactSection } from '@/components/ContactSection';
import { ProjectModal } from '@/components/ProjectModal';
import { CommandPalette } from '@/components/CommandPalette';
import { Project } from '@/data/portfolioData';

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-white overflow-x-hidden">
      {/* Dynamic 2D Canvas Neural Constellation Background */}
      <BackgroundCanvas />

      {/* Futuristic Telemetry HUD Navbar */}
      <Navbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

      {/* Sections */}
      <div className="relative z-10 space-y-12">
        <Hero onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection onSelectProject={(p) => setSelectedProject(p)} />
        <ExperienceSection />
        <AchievementsSection />
        <TechNotebook />
        <ContactSection />
      </div>

      {/* Interactive Modals */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </main>
  );
}
