"use client";

import { create } from "zustand";

/** UI-only world state. Per-frame movement deliberately stays in R3F/Rapier refs. */
type WorldUiState = {
  paused: boolean;
  highContrast: boolean;
  setPaused: (paused: boolean) => void;
  toggleHighContrast: () => void;
};

export const useWorldUiStore = create<WorldUiState>((set) => ({
  paused: false,
  highContrast: false,
  setPaused: (paused) => set({ paused }),
  toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
}));
